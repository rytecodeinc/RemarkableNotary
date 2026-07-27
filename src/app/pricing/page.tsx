import Link from "next/link";
import { EnrollButton } from "@/components/marketing/enroll-button";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { PRODUCT } from "@/lib/constants";

export const metadata = {
  title: "Pricing",
};

export default function PricingPage() {
  return (
    <div className="bg-paper text-ink">
      <SiteHeader variant="light" />
      <main className="container-rn py-16 md:py-24">
        <p className="text-xs uppercase tracking-[0.22em] text-brass-2">Pricing</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl md:text-6xl">
          One membership. Full curriculum. Two years.
        </h1>
        <p className="mt-5 max-w-2xl text-[#4a5564]">
          No tiers, no drip-locked upsells. Purchase the {PRODUCT.name} once and unlock every published course for {PRODUCT.accessYears} years.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-[1fr_0.9fr]">
          <article className="hover-lift rounded-[1.75rem] border border-[var(--line-dark)] bg-white p-8 md:p-10">
            <p className="text-xs uppercase tracking-[0.18em] text-stone">Product</p>
            <h2 className="mt-3 font-display text-4xl">{PRODUCT.name}</h2>
            <p className="mt-6 font-display text-6xl">${(PRODUCT.priceCents / 100).toFixed(0)}</p>
            <p className="mt-2 text-sm text-stone">One-time payment · Access for 2 years</p>
            <ul className="mt-8 grid gap-3 text-sm text-[#2a3340]">
              <li>All published courses, modules, and lessons</li>
              <li>Video lessons + downloadable resources</li>
              <li>Progress tracking and resume where you left off</li>
              <li>Mobile-friendly student experience</li>
            </ul>
            <div className="mt-8">
              <EnrollButton className="btn btn-dark w-full" />
            </div>
          </article>

          <aside className="rounded-[1.75rem] bg-ink p-8 text-ivory md:p-10">
            <p className="text-xs uppercase tracking-[0.18em] text-brass">How access works</p>
            <ol className="mt-6 grid gap-5 text-sm leading-relaxed text-mist/85">
              <li>
                <strong className="text-ivory">1. Create your account</strong>
                <br />Log in with magic link or Google.
              </li>
              <li>
                <strong className="text-ivory">2. Complete Stripe checkout</strong>
                <br />Pay ${(PRODUCT.priceCents / 100).toFixed(0)} once. Stripe is the source of truth.
              </li>
              <li>
                <strong className="text-ivory">3. Learn immediately</strong>
                <br />Access unlocks right after successful payment and remains active for two years.
              </li>
            </ol>
            <Link href="/login" className="btn btn-ghost mt-10 inline-flex">
              Log in to enroll
            </Link>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
