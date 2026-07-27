import Link from "next/link";
import { SITE } from "@/lib/constants";

export function SiteHeader({
  variant = "light",
}: {
  variant?: "dark" | "light";
}) {
  const dark = variant === "dark";

  return (
    <header
      className={
        dark
          ? "sticky top-0 z-40 border-b border-white/10 bg-[rgba(0,0,34,0.92)] text-ivory backdrop-blur-md"
          : "nav-blur sticky top-0 z-40 text-ink"
      }
    >
      <div className="container-wide flex items-center justify-between gap-4 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <span
            className={`grid h-10 w-10 place-items-center rounded-full border text-xs tracking-[0.18em] transition-colors ${
              dark
                ? "border-white/20 group-hover:border-brass"
                : "border-[var(--line-dark)] group-hover:border-brass"
            }`}
          >
            RN
          </span>
          <span>
            <span className="block font-display text-xl leading-none tracking-wide">{SITE.name}</span>
            <span className={`block text-[11px] uppercase tracking-[0.18em] ${dark ? "text-white/60" : "text-stone"}`}>
              California Notary Course
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-7">
          <nav className="hidden items-center gap-7 text-sm md:flex">
            <Link href="/#curriculum" className="opacity-80 transition hover:opacity-100">
              Curriculum
            </Link>
            <Link href="/pricing" className="opacity-80 transition hover:opacity-100">
              Pricing
            </Link>
            <Link href="/login" className="opacity-80 transition hover:opacity-100">
              Log in
            </Link>
          </nav>

          <Link href="/pricing" className="btn btn-dark">
            Enroll
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-ivory">
      <div className="container-wide grid gap-8 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl">{SITE.name}</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
            Structured online training for aspiring and working California notaries — clear, professional, and built for exam readiness.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-brass">Explore</p>
          <div className="mt-4 grid gap-2 text-sm text-white/75">
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/login" className="hover:text-white">Student login</Link>
            <Link href="/#curriculum" className="hover:text-white">Curriculum</Link>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-brass">Contact</p>
          <p className="mt-4 text-sm text-white/75">{SITE.domain}</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-wide flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-white/50">
          <p>© {new Date().getFullYear()} {SITE.name}</p>
          <p>Educational training — not legal advice.</p>
        </div>
      </div>
    </footer>
  );
}
