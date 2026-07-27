import { getCurrentProfile } from "@/lib/access";
import { ADMIN_EMAIL } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/preview";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  entitlements: Array<{
    status: string;
    access_ends_at: string;
    created_at: string;
  }>;
};

export default async function AdminUsersPage() {
  const profile = await getCurrentProfile();
  const preview = !profile || !isSupabaseConfigured();

  let profiles: UserRow[] = [
    {
      id: "a1",
      email: ADMIN_EMAIL,
      full_name: "Rina (Admin)",
      role: "admin",
      created_at: new Date().toISOString(),
      entitlements: [],
    },
    {
      id: "s1",
      email: "jordan@example.com",
      full_name: "Jordan Lee",
      role: "student",
      created_at: new Date().toISOString(),
      entitlements: [
        {
          status: "active",
          access_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 700).toISOString(),
          created_at: new Date().toISOString(),
        },
      ],
    },
    {
      id: "s2",
      email: "sam@example.com",
      full_name: "Sam Rivera",
      role: "student",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      entitlements: [
        {
          status: "active",
          access_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 720).toISOString(),
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        },
      ],
    },
  ];

  if (!preview) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*, entitlements(status, access_ends_at, created_at, product_code)")
      .order("created_at", { ascending: false });

    profiles = ((data as UserRow[] | null) ?? []).map((row) => ({
      ...row,
      entitlements: row.entitlements ?? [],
    }));
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-4xl">Users</h1>
        <p className="mt-2 text-sm text-stone">
          {preview
            ? "Preview of the users table with sample students and the sole admin."
            : "Students, admins, and membership status."}
        </p>
      </div>

      <div className="card-panel overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-stone">
            <tr>
              <th className="py-2 font-medium">User</th>
              <th className="py-2 font-medium">Role</th>
              <th className="py-2 font-medium">Access</th>
              <th className="py-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((user) => {
              const active = user.entitlements.find((e) => e.status === "active");
              return (
                <tr key={user.id} className="border-t border-[var(--line-dark)]">
                  <td className="py-3">
                    <div>{user.full_name || "—"}</div>
                    <div className="text-stone">{user.email}</div>
                  </td>
                  <td className="py-3 capitalize">{user.role}</td>
                  <td className="py-3">
                    {active
                      ? `Active until ${formatDate(active.access_ends_at)}`
                      : user.entitlements.length
                        ? user.entitlements[0].status
                        : "None"}
                  </td>
                  <td className="py-3">{formatDate(user.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
