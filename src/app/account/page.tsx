import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { getActiveEntitlement, getCurrentProfile } from "@/lib/access";
import { PRODUCT } from "@/lib/constants";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { signOut } from "@/app/actions";

export default async function AccountPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/account");

  const entitlement = await getActiveEntitlement(profile.id);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader variant="light" />
      <main className="container-rn py-12 md:py-16">
        <h1 className="font-display text-5xl">Account</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <section className="card-panel">
            <p className="text-xs uppercase tracking-[0.16em] text-stone">Profile</p>
            <p className="mt-3 text-lg">{profile.full_name || "Student"}</p>
            <p className="text-sm text-stone">{profile.email}</p>
            <p className="mt-2 text-sm capitalize text-stone">Role: {profile.role}</p>
            <form action={signOut} className="mt-6">
              <button type="submit" className="btn btn-outline">
                Sign out
              </button>
            </form>
          </section>

          <section className="card-panel">
            <p className="text-xs uppercase tracking-[0.16em] text-stone">Membership</p>
            {entitlement ? (
              <>
                <p className="mt-3 font-display text-3xl">{PRODUCT.name}</p>
                <p className="mt-2 text-sm text-stone">
                  Active until {formatDate(entitlement.access_ends_at)}
                </p>
                <Link href="/learn" className="btn btn-dark mt-6 inline-flex">
                  Go to courses
                </Link>
              </>
            ) : profile.role === "admin" ? (
              <>
                <p className="mt-3 font-display text-3xl">Admin access</p>
                <p className="mt-2 text-sm text-stone">Admins can preview all published curriculum.</p>
                <Link href="/admin" className="btn btn-dark mt-6 inline-flex">
                  Open admin
                </Link>
              </>
            ) : (
              <>
                <p className="mt-3 font-display text-3xl">No active access</p>
                <p className="mt-2 text-sm text-stone">Purchase the course to unlock lessons.</p>
                <Link href="/pricing" className="btn btn-dark mt-6 inline-flex">
                  View pricing
                </Link>
              </>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
