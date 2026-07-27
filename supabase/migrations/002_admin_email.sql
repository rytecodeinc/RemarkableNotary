-- Update sole admin email to rinarasia@gmail.com
-- Safe to run on existing Phase 1 databases.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_email constant text := 'rinarasia@gmail.com';
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
          else 'student'
        end,
        updated_at = now();

  return new;
end;
$$;

-- Promote the designated admin; demote any other admins to student.
update public.profiles
set role = case
  when lower(email) = 'rinarasia@gmail.com' then 'admin'
  else 'student'
end,
updated_at = now();

-- Allow a signed-in user to create their own student profile if the auth trigger missed.
drop policy if exists "Users can insert own student profile" on public.profiles;
create policy "Users can insert own student profile"
  on public.profiles for insert
  with check (
    auth.uid() = id
    and role = 'student'
  );
