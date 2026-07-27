"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState, useTransition } from "react";
import { sendMagicLink } from "@/app/actions";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/learn";
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onMagicLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("next", next);
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await sendMagicLink(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setMessage("Check your email for a magic link to continue.");
    });
  }

  async function onGoogle() {
    setError(null);
    const supabase = createClient();
    const siteUrl = window.location.origin;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (oauthError) setError(oauthError.message);
  }

  return (
    <div className="card-panel mx-auto w-full max-w-md">
      <h1 className="font-display text-4xl">Welcome back</h1>
      <p className="mt-2 text-sm text-stone">Sign in with a magic link or Google to access your courses.</p>

      <form onSubmit={onMagicLink} className="mt-8 grid gap-4">
        <label className="field">
          <span>Email</span>
          <input type="email" name="email" required placeholder="you@example.com" autoComplete="email" />
        </label>
        <button type="submit" className="btn btn-dark" disabled={pending}>
          {pending ? "Sending…" : "Email magic link"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-stone">
        <span className="h-px flex-1 bg-[var(--line-dark)]" />
        or
        <span className="h-px flex-1 bg-[var(--line-dark)]" />
      </div>

      <button type="button" className="btn btn-outline w-full" onClick={onGoogle}>
        Continue with Google
      </button>

      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      <p className="mt-6 text-sm text-stone">
        New here? <Link href="/pricing" className="underline">View enrollment</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <SiteHeader variant="light" />
      <main className="container-rn flex flex-1 items-center py-16">
        <Suspense fallback={<div className="card-panel mx-auto w-full max-w-md">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
