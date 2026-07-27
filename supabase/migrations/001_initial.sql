-- Remarkable Notary LMS — Phase 1 schema
-- Run in Supabase SQL editor (or via CLI) after creating the project.

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'student' check (role in ('admin', 'student')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_role_idx on public.profiles (role);

-- Courses
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  thumbnail_key text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Modules
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists modules_course_id_idx on public.modules (course_id);

-- Lessons
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  title text not null,
  description text not null default '',
  body text not null default '',
  video_key text,
  video_content_type text,
  duration_seconds integer,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lessons_module_id_idx on public.lessons (module_id);

-- Downloadable resources per lesson
create table if not exists public.lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  title text not null,
  file_key text not null,
  file_name text not null,
  content_type text not null default 'application/octet-stream',
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists lesson_resources_lesson_id_idx on public.lesson_resources (lesson_id);

-- Stripe-backed entitlements (source of truth mirrored locally)
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_code text not null default 'CA_NOTARY_COURSE',
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  stripe_customer_id text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  access_starts_at timestamptz not null default now(),
  access_ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists entitlements_user_id_idx on public.entitlements (user_id);
create index if not exists entitlements_status_idx on public.entitlements (status);
create index if not exists entitlements_access_ends_at_idx on public.entitlements (access_ends_at);

-- Lesson progress / resume
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed boolean not null default false,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  last_position_seconds integer not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists lesson_progress_user_id_idx on public.lesson_progress (user_id);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists modules_set_updated_at on public.modules;
create trigger modules_set_updated_at before update on public.modules
for each row execute function public.set_updated_at();

drop trigger if exists lessons_set_updated_at on public.lessons;
create trigger lessons_set_updated_at before update on public.lessons
for each row execute function public.set_updated_at();

drop trigger if exists entitlements_set_updated_at on public.entitlements;
create trigger entitlements_set_updated_at before update on public.entitlements
for each row execute function public.set_updated_at();

-- Auto-create profile on signup; promote first admin email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_email constant text := 'rina@rytecode.com';
  assigned_role text := 'student';
begin
  if lower(new.email) = admin_email then
    assigned_role := 'admin';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    assigned_role
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
        role = case
          when lower(excluded.email) = admin_email then 'admin'
          else public.profiles.role
        end,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_resources enable row level security;
alter table public.entitlements enable row level security;
alter table public.lesson_progress enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.has_active_entitlement()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.entitlements e
    where e.user_id = auth.uid()
      and e.status = 'active'
      and e.access_starts_at <= now()
      and e.access_ends_at > now()
  );
$$;

-- Profiles policies
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin());

-- Courses: public can see published; admins all; enrolled students all published
drop policy if exists "Anyone can read published courses" on public.courses;
create policy "Anyone can read published courses"
  on public.courses for select
  using (is_published = true or public.is_admin());

drop policy if exists "Admins manage courses" on public.courses;
create policy "Admins manage courses"
  on public.courses for all
  using (public.is_admin())
  with check (public.is_admin());

-- Modules
drop policy if exists "Read modules of visible courses" on public.modules;
create policy "Read modules of visible courses"
  on public.modules for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.courses c
      where c.id = modules.course_id and c.is_published = true
    )
  );

drop policy if exists "Admins manage modules" on public.modules;
create policy "Admins manage modules"
  on public.modules for all
  using (public.is_admin())
  with check (public.is_admin());

-- Lessons
drop policy if exists "Read published lessons with access" on public.lessons;
create policy "Read published lessons with access"
  on public.lessons for select
  using (
    public.is_admin()
    or (
      is_published = true
      and public.has_active_entitlement()
      and exists (
        select 1
        from public.modules m
        join public.courses c on c.id = m.course_id
        where m.id = lessons.module_id and c.is_published = true
      )
    )
  );

drop policy if exists "Admins manage lessons" on public.lessons;
create policy "Admins manage lessons"
  on public.lessons for all
  using (public.is_admin())
  with check (public.is_admin());

-- Resources
drop policy if exists "Read resources with lesson access" on public.lesson_resources;
create policy "Read resources with lesson access"
  on public.lesson_resources for select
  using (
    public.is_admin()
    or (
      public.has_active_entitlement()
      and exists (
        select 1
        from public.lessons l
        join public.modules m on m.id = l.module_id
        join public.courses c on c.id = m.course_id
        where l.id = lesson_resources.lesson_id
          and l.is_published = true
          and c.is_published = true
      )
    )
  );

drop policy if exists "Admins manage resources" on public.lesson_resources;
create policy "Admins manage resources"
  on public.lesson_resources for all
  using (public.is_admin())
  with check (public.is_admin());

-- Entitlements
drop policy if exists "Users read own entitlements" on public.entitlements;
create policy "Users read own entitlements"
  on public.entitlements for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins manage entitlements" on public.entitlements;
create policy "Admins manage entitlements"
  on public.entitlements for all
  using (public.is_admin())
  with check (public.is_admin());

-- Progress
drop policy if exists "Users manage own progress" on public.lesson_progress;
create policy "Users manage own progress"
  on public.lesson_progress for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- Service role inserts entitlements via webhook (bypasses RLS).
-- Grant authenticated users ability to insert progress only for themselves (covered above).
