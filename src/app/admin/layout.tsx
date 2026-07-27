import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions";
import { getCurrentProfile } from "@/lib/access";
import { SITE } from "@/lib/constants";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/admin");
  if (profile.role !== "admin") redirect("/learn");

  return (
    <div className="min-h-screen bg-[#f3f1ec] text-ink">
      <header className="border-b border-[var(--line-dark)] bg-white">
        <div className="container-wide flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-display text-2xl">
              {SITE.name} Admin
            </Link>
            <nav className="flex gap-4 text-sm text-stone">
              <Link href="/admin" className="hover:text-ink">Overview</Link>
              <Link href="/admin/courses" className="hover:text-ink">Courses</Link>
              <Link href="/admin/users" className="hover:text-ink">Users</Link>
              <Link href="/learn" className="hover:text-ink">Student view</Link>
            </nav>
          </div>
          <form action={signOut}>
            <button type="submit" className="btn btn-outline py-2">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="container-wide py-8 md:py-10">{children}</main>
    </div>
  );
}
