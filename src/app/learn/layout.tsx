import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { PreviewBanner } from "@/components/ui/preview-banner";
import { getActiveEntitlement, getCurrentProfile } from "@/lib/access";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const preview = !profile;

  const entitlement =
    !preview && profile && profile.role !== "admin"
      ? await getActiveEntitlement(profile.id)
      : null;

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      {preview ? <PreviewBanner role="student" /> : null}
      <SiteHeader variant="light" />
      {!preview && profile?.role !== "admin" && !entitlement ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
          Your membership is inactive.{" "}
          <Link href="/pricing" className="font-semibold underline">
            Purchase access
          </Link>{" "}
          to unlock the curriculum.
        </div>
      ) : null}
      <main className="container-wide flex-1 py-8 md:py-10">{children}</main>
      <SiteFooter />
    </div>
  );
}
