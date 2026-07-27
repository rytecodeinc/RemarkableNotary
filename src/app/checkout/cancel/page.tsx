import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader variant="light" />
      <main className="container-rn py-20">
        <div className="card-panel mx-auto max-w-xl text-center">
          <h1 className="font-display text-5xl">Checkout canceled</h1>
          <p className="mt-4 text-[#4a5564]">No charge was made. You can restart enrollment anytime.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/pricing" className="btn btn-dark">
              Back to pricing
            </Link>
            <Link href="/" className="btn btn-outline">
              Home
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
