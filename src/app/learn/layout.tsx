import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions";
import { getActiveEntitlement, getCurrentProfile } from "@/lib/access";
import { SITE } from "@/lib/constants";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/learn");

  const entitlement = profile.role === "admin" ? null : await getActiveEntitlement(profile.id);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-[var(--line-dark)] bg-white/90 backdrop-blur">
        <div className="container-wide flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-6">
            <Link href="/learn" className="font-display text-2xl tracking-wide">
              {SITE.name}
            </Link>
            <nav className="hidden gap-4 text-sm text-stone md:flex">
              <Link href="/learn" className="hover:text-ink">My courses</Link>
              <Link href="/account" className="hover:text-ink">Account</Link>
              {profile.role === "admin" ? (
                <Link href="/admin" className="hover:text-ink">Admin</Link>
              ) : null}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-stone sm:inline">{profile.email}</span>
            <form action={signOut}>
              <button type="submit" className="btn btn-outline py-2">
                Sign out
              </button>
            </form>
          </div>
        </div>
        {profile.role !== "admin" && !entitlement ? (
          <div className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
            Your membership is inactive.{" "}
            <Link href="/pricing" className="font-semibold underline">
              Purchase access
            </Link>{" "}
            to unlock the curriculum.
          </div>
        ) : null}
      </header>
      <main className="container-wide py-8 md:py-10">{children}</main>
    </div>
  );
}
