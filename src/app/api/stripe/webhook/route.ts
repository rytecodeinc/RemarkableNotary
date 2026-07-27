import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { PRODUCT } from "@/lib/constants";
import { computeAccessEndsAt } from "@/lib/access";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function grantEntitlement(params: {
  userId: string;
  customerId?: string | null;
  checkoutSessionId: string;
  paymentIntentId?: string | null;
}) {
  const supabase = createServiceClient();
  const starts = new Date();
  const ends = computeAccessEndsAt(starts);

  const { error } = await supabase.from("entitlements").upsert(
    {
      user_id: params.userId,
      product_code: PRODUCT.code,
      status: "active",
      stripe_customer_id: params.customerId ?? null,
      stripe_checkout_session_id: params.checkoutSessionId,
      stripe_payment_intent_id: params.paymentIntentId ?? null,
      access_starts_at: starts.toISOString(),
      access_ends_at: ends.toISOString(),
    },
    { onConflict: "stripe_checkout_session_id" },
  );

  if (error) {
    throw error;
  }
}

async function revokeByPaymentIntent(paymentIntentId: string) {
  const supabase = createServiceClient();
  await supabase
    .from("entitlements")
    .update({ status: "revoked" })
    .eq("stripe_payment_intent_id", paymentIntentId);
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing webhook configuration" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("webhook signature failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status !== "paid" && session.status !== "complete") {
          break;
        }
        const userId = session.metadata?.user_id || session.client_reference_id;
        if (!userId) {
          throw new Error("Missing user_id on checkout session");
        }
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id;

        await grantEntitlement({
          userId,
          customerId:
            typeof session.customer === "string" ? session.customer : session.customer?.id,
          checkoutSessionId: session.id,
          paymentIntentId,
        });
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (paymentIntentId) {
          await revokeByPaymentIntent(paymentIntentId);
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("webhook handler error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook failed" },
      { status: 500 },
    );
  }
}
