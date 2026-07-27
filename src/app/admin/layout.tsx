import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { PreviewBanner } from "@/components/ui/preview-banner";
import { getCurrentProfile } from "@/lib/access";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const preview = !profile;

  if (profile && profile.role !== "admin") {
    redirect("/learn");
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      {preview ? <PreviewBanner role="admin" /> : null}
      <SiteHeader variant="light" />
      <div className="border-b border-[var(--line-dark)] bg-white/70">
        <nav className="container-wide flex flex-wrap gap-4 py-3 text-sm text-stone">
          <Link href="/admin" className="hover:text-ink">
            Overview
          </Link>
          <Link href="/admin/courses" className="hover:text-ink">
            Courses
          </Link>
          <Link href="/admin/users" className="hover:text-ink">
            Users
          </Link>
        </nav>
      </div>
      <main className="container-wide flex-1 py-8 md:py-10">{children}</main>
      <SiteFooter />
    </div>
  );
}
