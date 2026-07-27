import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [
    { count: courseCount },
    { count: publishedCount },
    { count: userCount },
    { count: studentCount },
    { count: entitlementCount },
    { data: recentEntitlements },
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

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone">Admin dashboard</p>
          <h1 className="mt-2 font-display text-4xl">Course operations</h1>
          <p className="mt-2 text-sm text-stone">
            Signed in as the sole admin ({ADMIN_EMAIL}). Students cannot access this area.
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
          { label: "Courses", value: courseCount ?? 0, hint: `${publishedCount ?? 0} published` },
          { label: "Students", value: studentCount ?? 0, hint: `${userCount ?? 0} total users` },
          { label: "Active access", value: entitlementCount ?? 0, hint: "Paid memberships" },
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
              {(recentEntitlements ?? []).map((row) => {
                const profile = row.profiles as unknown as { email?: string; full_name?: string } | null;
                return (
                  <tr key={row.id as string} className="border-t border-[var(--line-dark)]">
                    <td className="py-3">
                      <div>{profile?.full_name || "—"}</div>
                      <div className="text-stone">{profile?.email}</div>
                    </td>
                    <td className="py-3 capitalize">{row.status as string}</td>
                    <td className="py-3">{formatDate(row.created_at as string)}</td>
                    <td className="py-3">{formatDate(row.access_ends_at as string)}</td>
                  </tr>
                );
              })}
              {(recentEntitlements ?? []).length === 0 ? (
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
