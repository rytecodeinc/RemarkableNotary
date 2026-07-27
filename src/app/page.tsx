import Link from "next/link";
import { EnrollButton } from "@/components/marketing/enroll-button";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { PRODUCT, SITE } from "@/lib/constants";

const pillars = [
  {
    title: "California-focused",
    copy: "Laws, journal practice, ID scrutiny, and certificate language explained in plain English.",
  },
  {
    title: "Structured curriculum",
    copy: "Courses organized into modules and lessons you can resume anytime over two full years.",
  },
  {
    title: "Professional polish",
    copy: "A clean learning experience designed for working adults — not a cluttered course portal.",
  },
];

const curriculum = [
  "Notary foundations & appointment path",
  "Identity verification & fraud vigilance",
  "Journal entries & recordkeeping",
  "Certificates, seals & common forms",
  "Real-world scenarios & exam readiness",
];

export default function HomePage() {
  return (
    <div className="bg-paper text-ink">
      <div className="relative min-h-[100svh] overflow-hidden bg-ink text-ivory">
        <div
          className="absolute inset-0 hero-grid-overlay"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(11,15,20,0.25), rgba(11,15,20,0.78)), radial-gradient(1000px 520px at 80% 20%, rgba(196,163,90,0.16), transparent 50%), linear-gradient(135deg, #141a22, #0b0f14 55%, #1c2430)",
          }}
        />
        <div className="relative">
          <SiteHeader variant="dark" />
          <section className="container-wide grid items-start gap-10 pb-14 pt-8 md:grid-cols-[1.2fr_0.8fr] md:gap-12 md:pb-20 md:pt-10 lg:min-h-[calc(100svh-5rem)] lg:content-center">
            <div className="reveal max-w-3xl">
              <p className="text-xs uppercase tracking-[0.28em] text-brass">Remarkable Notary</p>
              <h1 className="mt-5 font-display text-5xl leading-[0.95] tracking-tight md:text-7xl">
                Become a California notary with training that feels assured.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-mist/85 md:text-lg">
                {SITE.tagline} One membership unlocks the full curriculum for two years — purchase once, learn at your pace.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/pricing" className="btn btn-primary">
                  View enrollment
                </Link>
                <Link href="#curriculum" className="btn btn-ghost">
                  Explore curriculum
                </Link>
              </div>
            </div>

            <aside className="reveal hover-lift w-full rounded-[1.5rem] border border-[var(--line)] bg-[rgba(20,26,34,0.72)] p-6 backdrop-blur md:justify-self-end md:self-start md:max-w-md">
              <p className="text-xs uppercase tracking-[0.2em] text-brass">Enrollment</p>
              <p className="mt-3 font-display text-4xl">{PRODUCT.name}</p>
              <p className="mt-2 text-sm text-mist/75">One-time purchase · 2-year access · All courses</p>
              <p className="mt-6 font-display text-5xl text-ivory">${(PRODUCT.priceCents / 100).toFixed(0)}</p>
              <div className="mt-6">
                <EnrollButton className="btn btn-primary w-full" />
              </div>
            </aside>
          </section>
        </div>
      </div>

      <section className="container-wide py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-brass-2">The experience</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Modern learning with editorial clarity.</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {pillars.map((item) => (
            <article
              key={item.title}
              className="hover-lift group rounded-[1.35rem] border border-[var(--line-dark)] bg-white p-7"
            >
              <div className="h-px w-10 bg-brass transition-all duration-500 group-hover:w-16" />
              <h3 className="mt-6 font-display text-3xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#4a5564]">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="curriculum" className="bg-ink text-ivory">
        <div className="container-wide grid gap-10 py-20 md:grid-cols-[0.9fr_1.1fr] md:py-28">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-brass">Curriculum</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">A path from enrollment to exam readiness.</h2>
            <p className="mt-5 max-w-md text-mist/80">
              Ten courses at launch, organized into modules and lessons with video instruction and downloadable resources.
            </p>
          </div>
          <ul className="grid gap-3">
            {curriculum.map((item, index) => (
              <li
                key={item}
                className="hover-lift flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.03)] px-5 py-4 transition hover:border-brass/50"
              >
                <span className="font-display text-2xl md:text-3xl">{item}</span>
                <span className="text-xs tracking-[0.18em] text-mist/50">{String(index + 1).padStart(2, "0")}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-wide py-20 md:py-28">
        <div className="hover-zoom relative overflow-hidden rounded-[2rem] bg-ink text-ivory">
          <div className="zoom-target absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(196,163,90,0.22),transparent_45%),linear-gradient(135deg,#1c2430,#0b0f14)]" />
          <div className="relative grid gap-8 p-8 md:grid-cols-[1.2fr_0.8fr] md:p-14">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-brass">Begin</p>
              <h2 className="mt-3 font-display text-4xl md:text-6xl">Enroll once. Access everything for two years.</h2>
              <p className="mt-5 max-w-xl text-mist/80">
                Secure checkout with Stripe. Access unlocks immediately after payment — then learn on desktop or mobile whenever you are ready.
              </p>
            </div>
            <div className="flex flex-col justify-end gap-4">
              <Link href="/pricing" className="btn btn-primary text-center">
                View enrollment
              </Link>
              <Link href="/login" className="btn btn-ghost text-center">
                Already enrolled? Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
