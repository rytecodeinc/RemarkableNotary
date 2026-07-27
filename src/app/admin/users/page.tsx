import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*, entitlements(status, access_ends_at, created_at, product_code)")
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-4xl">Users</h1>
        <p className="mt-2 text-sm text-stone">Students, admins, and membership status.</p>
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
            {(profiles ?? []).map((profile) => {
              const entitlements = (profile.entitlements as Array<{
                status: string;
                access_ends_at: string;
                created_at: string;
              }> | null) ?? [];
              const active = entitlements.find((e) => e.status === "active");
              return (
                <tr key={profile.id as string} className="border-t border-[var(--line-dark)]">
                  <td className="py-3">
                    <div>{(profile.full_name as string) || "—"}</div>
                    <div className="text-stone">{profile.email as string}</div>
                  </td>
                  <td className="py-3 capitalize">{profile.role as string}</td>
                  <td className="py-3">
                    {active
                      ? `Active until ${formatDate(active.access_ends_at)}`
                      : entitlements.length
                        ? entitlements[0].status
                        : "None"}
                  </td>
                  <td className="py-3">{formatDate(profile.created_at as string)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
