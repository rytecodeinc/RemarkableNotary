import Link from "next/link";
import { getCurrentProfile } from "@/lib/access";
import { ADMIN_EMAIL } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/preview";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const profile = await getCurrentProfile();
  const preview = !profile || !isSupabaseConfigured();

  let courseCount = 3;
  let publishedCount = 2;
  let userCount = 12;
  let studentCount = 11;
  let entitlementCount = 8;
  let recentEntitlements: Array<{
    id: string;
    status: string;
    created_at: string;
    access_ends_at: string;
    profiles: { email?: string; full_name?: string } | null;
  }> = [
    {
      id: "1",
      status: "active",
      created_at: new Date().toISOString(),
      access_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 700).toISOString(),
      profiles: { email: "jordan@example.com", full_name: "Jordan Lee" },
    },
    {
      id: "2",
      status: "active",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      access_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 720).toISOString(),
      profiles: { email: "sam@example.com", full_name: "Sam Rivera" },
    },
  ];

  if (!preview) {
    const supabase = await createClient();
    const [
      courses,
      published,
      users,
      students,
      entitlements,
      recent,
    ] = await Promise.all([
      supabase.from("courses").select("*", { count: "exact", head: true }),
      supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("entitlements").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase
        .from("entitlements")
        .select("id, access_ends_at, created_at, status, profiles(email, full_name)")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    courseCount = courses.count ?? 0;
    publishedCount = published.count ?? 0;
    userCount = users.count ?? 0;
    studentCount = students.count ?? 0;
    entitlementCount = entitlements.count ?? 0;
    recentEntitlements = (recent.data ?? []).map((row) => ({
      id: row.id as string,
      status: row.status as string,
      created_at: row.created_at as string,
      access_ends_at: row.access_ends_at as string,
      profiles: row.profiles as unknown as { email?: string; full_name?: string } | null,
    }));
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone">Admin dashboard</p>
          <h1 className="mt-2 font-display text-4xl">Course operations</h1>
          <p className="mt-2 text-sm text-stone">
            {preview
              ? "Preview layout with sample metrics. Connect Supabase to load live data."
              : `Signed in as the sole admin (${ADMIN_EMAIL}). Students cannot access this area.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/courses" className="btn btn-dark">
            Manage courses
          </Link>
          <Link href="/admin/users" className="btn btn-outline">
            View users
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Courses", value: courseCount, hint: `${publishedCount} published` },
          { label: "Students", value: studentCount, hint: `${userCount} total users` },
          { label: "Active access", value: entitlementCount, hint: "Paid memberships" },
          { label: "Quick link", value: "CMS", hint: "Create modules & lessons", href: "/admin/courses" },
        ].map((stat) =>
          "href" in stat && stat.href ? (
            <Link key={stat.label} href={stat.href} className="hover-lift card-panel block">
              <p className="text-xs uppercase tracking-[0.16em] text-stone">{stat.label}</p>
              <p className="mt-3 font-display text-4xl">{stat.value}</p>
              <p className="mt-1 text-xs text-stone">{stat.hint}</p>
            </Link>
          ) : (
            <div key={stat.label} className="card-panel">
              <p className="text-xs uppercase tracking-[0.16em] text-stone">{stat.label}</p>
              <p className="mt-3 font-display text-5xl">{stat.value}</p>
              <p className="mt-1 text-xs text-stone">{stat.hint}</p>
            </div>
          ),
        )}
      </div>

      <section className="card-panel">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-3xl">Recent student enrollments</h2>
          <Link href="/admin/users" className="text-sm text-stone underline hover:text-ink">
            All users
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-stone">
              <tr>
                <th className="py-2 font-medium">Student</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium">Purchased</th>
                <th className="py-2 font-medium">Access ends</th>
              </tr>
            </thead>
            <tbody>
              {recentEntitlements.map((row) => (
                <tr key={row.id} className="border-t border-[var(--line-dark)]">
                  <td className="py-3">
                    <div>{row.profiles?.full_name || "—"}</div>
                    <div className="text-stone">{row.profiles?.email}</div>
                  </td>
                  <td className="py-3 capitalize">{row.status}</td>
                  <td className="py-3">{formatDate(row.created_at)}</td>
                  <td className="py-3">{formatDate(row.access_ends_at)}</td>
                </tr>
              ))}
              {recentEntitlements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-stone">
                    No student purchases yet. When checkout completes, enrollments appear here.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
