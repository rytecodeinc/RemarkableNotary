import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { createServiceClient } from "@/lib/supabase/server";
import { computeAccessEndsAt } from "@/lib/access";
import { PRODUCT } from "@/lib/constants";
import { getStripe } from "@/lib/stripe";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  // Best-effort grant if webhook is delayed (idempotent via checkout session id).
  if (sessionId && process.env.STRIPE_SECRET_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const userId = session.metadata?.user_id || session.client_reference_id;
      if (userId && (session.payment_status === "paid" || session.status === "complete")) {
        const supabase = createServiceClient();
        const starts = new Date();
        await supabase.from("entitlements").upsert(
          {
            user_id: userId,
            product_code: PRODUCT.code,
            status: "active",
            stripe_customer_id:
              typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id ?? null,
            access_starts_at: starts.toISOString(),
            access_ends_at: computeAccessEndsAt(starts).toISOString(),
          },
          { onConflict: "stripe_checkout_session_id" },
        );
      }
    } catch (error) {
      console.error("success page entitlement sync failed", error);
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader variant="light" />
      <main className="container-rn py-20">
        <div className="card-panel mx-auto max-w-xl text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-brass-2">Payment confirmed</p>
          <h1 className="mt-3 font-display text-5xl">You&apos;re in.</h1>
          <p className="mt-4 text-[#4a5564]">
            Your {PRODUCT.name} access is active for two years. Head to your dashboard to begin.
          </p>
          <Link href="/learn" className="btn btn-dark mt-8 inline-flex">
            Go to my courses
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
