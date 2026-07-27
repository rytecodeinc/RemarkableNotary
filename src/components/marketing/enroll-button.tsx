"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { PRODUCT } from "@/lib/constants";

export function EnrollButton({
  className = "btn btn-primary",
  label = `Enroll — $${(PRODUCT.priceCents / 100).toFixed(0)}`,
  next = "/learn",
}: {
  className?: string;
  label?: string;
  next?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClick() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (res.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent("/pricing")}`;
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Unable to start checkout");
        return;
      }
      window.location.href = data.url;
    });
  }

  return (
    <div className="grid gap-2">
      <button type="button" className={className} onClick={onClick} disabled={pending}>
        {pending ? "Redirecting…" : label}
      </button>
      {error ? (
        <p className="text-sm text-red-700">
          {error}. <Link href="/login" className="underline">Log in</Link> first if needed.
        </p>
      ) : null}
      <p className="sr-only">Continue to {next}</p>
    </div>
  );
}
