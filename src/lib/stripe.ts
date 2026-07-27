import Stripe from "stripe";
import { PRODUCT } from "@/lib/constants";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export function buildCheckoutLineItems(): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (priceId) {
    return [{ price: priceId, quantity: 1 }];
  }

  return [
    {
      quantity: 1,
      price_data: {
        currency: PRODUCT.currency,
        unit_amount: PRODUCT.priceCents,
        product_data: {
          name: PRODUCT.name,
          description: `Full curriculum access for ${PRODUCT.accessYears} years`,
        },
      },
    },
  ];
}
