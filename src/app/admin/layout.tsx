import Link from "next/link";
import { signOut } from "@/app/actions";
import { PreviewBanner } from "@/components/ui/preview-banner";
import { getCurrentProfile } from "@/lib/access";
import { SITE } from "@/lib/constants";
import { PREVIEW_ADMIN } from "@/lib/preview";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const preview = !profile;
  const viewer = profile ?? PREVIEW_ADMIN;

  if (profile && profile.role !== "admin") {
    redirect("/learn");
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      {preview ? <PreviewBanner role="admin" /> : null}
      <header className="border-b border-[var(--line-dark)] bg-white">
        <div className="container-wide flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-display text-2xl">
              {SITE.name} Admin
            </Link>
            <nav className="flex flex-wrap gap-4 text-sm text-stone">
              <Link href="/admin" className="hover:text-ink">
                Overview
              </Link>
              <Link href="/admin/courses" className="hover:text-ink">
                Courses
              </Link>
              <Link href="/admin/users" className="hover:text-ink">
                Users
              </Link>
              <Link href="/learn" className="hover:text-ink">
                Student view
              </Link>
              <Link href="/" className="hover:text-ink">
                Home
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-stone sm:inline">{viewer.email}</span>
            {preview ? (
              <Link href="/login" className="btn btn-outline py-2">
                Log in
              </Link>
            ) : (
              <form action={signOut}>
                <button type="submit" className="btn btn-outline py-2">
                  Sign out
                </button>
              </form>
            )}
          </div>
        </div>
      </header>
      <main className="container-wide py-8 md:py-10">{children}</main>
    </div>
  );
}
