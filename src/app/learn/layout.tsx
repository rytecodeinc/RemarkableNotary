import Link from "next/link";
import { signOut } from "@/app/actions";
import { SiteFooter } from "@/components/marketing/site-chrome";
import { PreviewBanner } from "@/components/ui/preview-banner";
import { getActiveEntitlement, getCurrentProfile } from "@/lib/access";
import { SITE } from "@/lib/constants";
import { PREVIEW_ENTITLEMENT, PREVIEW_STUDENT } from "@/lib/preview";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const preview = !profile;
  const viewer = profile ?? PREVIEW_STUDENT;

  const entitlement = preview
    ? PREVIEW_ENTITLEMENT
    : viewer.role === "admin"
      ? null
      : await getActiveEntitlement(viewer.id);

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      {preview ? <PreviewBanner role="student" /> : null}
      <header className="border-b border-[var(--line-dark)] bg-white/90 backdrop-blur">
        <div className="container-wide flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-6">
            <Link href="/learn" className="font-display text-2xl tracking-wide">
              {SITE.name}
            </Link>
            <nav className="hidden gap-4 text-sm text-stone md:flex">
              <Link href="/learn" className="hover:text-ink">
                My courses
              </Link>
              <Link href={preview ? "/learn" : "/account"} className="hover:text-ink">
                Account
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
        {!preview && viewer.role !== "admin" && !entitlement ? (
          <div className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
            Your membership is inactive.{" "}
            <Link href="/pricing" className="font-semibold underline">
              Purchase access
            </Link>{" "}
            to unlock the curriculum.
          </div>
        ) : null}
      </header>
      <main className="container-wide flex-1 py-8 md:py-10">{children}</main>
      <SiteFooter />
    </div>
  );
}
