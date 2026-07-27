import Link from "next/link";
import { SITE } from "@/lib/constants";

export function SiteBrand({
  variant = "dark",
}: {
  variant?: "dark" | "light";
}) {
  const dark = variant === "dark";

  return (
    <Link href="/" className="group flex items-center gap-3">
      <span
        className={`grid h-10 w-10 place-items-center rounded-full border text-xs tracking-[0.18em] transition-colors ${
          dark
            ? "border-[var(--line)] group-hover:border-brass"
            : "border-[var(--line-dark)] group-hover:border-brass"
        }`}
      >
        RN
      </span>
      <span>
        <span className="block font-display text-xl leading-none tracking-wide">{SITE.name}</span>
        <span className={`block text-[11px] uppercase tracking-[0.18em] ${dark ? "text-mist/70" : "text-stone"}`}>
          California Notary Course
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader({
  variant = "dark",
}: {
  variant?: "dark" | "light";
}) {
  const dark = variant === "dark";

  return (
    <header
      className={
        dark
          ? "nav-blur sticky top-0 z-40 text-ivory"
          : "sticky top-0 z-40 border-b border-[var(--line-dark)] bg-[rgba(250,248,244,0.86)] backdrop-blur-md text-ink"
      }
    >
      <div className="container-wide flex items-center justify-between gap-4 py-4">
        <SiteBrand variant={variant} />

        <div className="flex items-center gap-4 sm:gap-7">
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link href="/#curriculum" className="opacity-80 transition hover:opacity-100">
              Curriculum
            </Link>
            <Link href="/pricing" className="opacity-80 transition hover:opacity-100">
              Pricing
            </Link>
            <Link href="/admin" className="opacity-80 transition hover:opacity-100">
              Admin
            </Link>
            <Link href="/learn" className="opacity-80 transition hover:opacity-100">
              Student
            </Link>
            <Link href="/login" className="opacity-80 transition hover:opacity-100">
              Log in
            </Link>
          </nav>

          <Link href="/pricing" className={dark ? "btn btn-primary" : "btn btn-dark"}>
            Enroll
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-ink text-ivory">
      <div className="container-wide grid gap-8 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl">{SITE.name}</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-mist/80">
            Structured online training for aspiring and working California notaries — clear, professional, and built for exam readiness.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-brass">Explore</p>
          <div className="mt-4 grid gap-2 text-sm text-mist/85">
            <Link href="/pricing" className="hover:text-ivory">Pricing</Link>
            <Link href="/admin" className="hover:text-ivory">Admin dashboard</Link>
            <Link href="/learn" className="hover:text-ivory">Student dashboard</Link>
            <Link href="/login" className="hover:text-ivory">Log in</Link>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-brass">Contact</p>
          <p className="mt-4 text-sm text-mist/85">{SITE.domain}</p>
        </div>
      </div>
      <div className="border-t border-[var(--line)]">
        <div className="container-wide flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-mist/60">
          <p>© {new Date().getFullYear()} {SITE.name}</p>
          <p>Educational training — not legal advice.</p>
        </div>
      </div>
    </footer>
  );
}
