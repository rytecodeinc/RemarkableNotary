import { NextResponse } from "next/server";
import { PRODUCT } from "@/lib/constants";
import { getCurrentProfile } from "@/lib/access";
import { buildCheckoutLineItems, getSiteUrl, getStripe } from "@/lib/stripe";

export async function POST() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stripe = getStripe();
    const siteUrl = getSiteUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: profile.email,
      client_reference_id: profile.id,
      line_items: buildCheckoutLineItems(),
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      metadata: {
        user_id: profile.id,
        product_code: PRODUCT.code,
        access_years: String(PRODUCT.accessYears),
      },
      payment_intent_data: {
        metadata: {
          user_id: profile.id,
          product_code: PRODUCT.code,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("checkout error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
