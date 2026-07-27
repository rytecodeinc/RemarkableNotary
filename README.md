# Remarkable Notary LMS

Subscription-style learning platform for California notary training.
Phase 1: one-time **CA Notary Course** purchase ($79, 2-year access), Stripe checkout, Supabase auth (magic link + Google), Cloudflare R2 media, student player + admin CMS.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind
- **Supabase** — Postgres, Auth (magic link + Google), RLS
- **Stripe Checkout** — one-time payment, webhook grants entitlement
- **Cloudflare R2** — private video/PDF storage via signed URLs
- Hosting target: Vercel (app) + Cloudflare (R2)

## Quick start

1. Copy env template:

```bash
cp .env.example .env.local
```

2. Create a Supabase project, then run:

`supabase/migrations/001_initial.sql`

in the SQL editor.

3. In Supabase Auth:
   - Enable **Email** magic link
   - Enable **Google** provider
   - Add redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `https://remarkablenotary.com/auth/callback`

4. Create Cloudflare R2 bucket + API token (Object Read & Write). Fill R2 vars in `.env.local`.

5. Stripe:
   - Add test secret key
   - Optional: create a one-time $79 Price and set `STRIPE_PRICE_ID`
   - Forward webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

6. Install & run:

```bash
npm install
npm run dev
```

7. Sign in once as `rina@rytecode.com` (magic link or Google). The DB trigger promotes that email to **admin**.

## Phase 1 product rules

| Item | Value |
|---|---|
| Product | CA Notary Course |
| Price | $79 one-time |
| Access | 2 years from purchase |
| Tiers | Single membership → all published courses |
| Media | Per-lesson video + resources on R2 |
| Quizzes | Not in Phase 1 |

Refunds revoke access via `charge.refunded` webhook (and success-page sync is idempotent).

## Key routes

| Route | Purpose |
|---|---|
| `/` | Marketing homepage |
| `/pricing` | Enrollment CTA |
| `/login` | Magic link + Google |
| `/learn` | Student dashboard |
| `/learn/courses/[id]/lessons/[id]` | Lesson player |
| `/admin` | Admin overview |
| `/admin/courses` | Course CMS |
| `/api/stripe/webhook` | Entitlement source of truth sync |

## Notes

- Content access is payment-driven: students need an active entitlement row.
- Admins can preview curriculum without purchasing.
- Domain: `remarkablenotary.com`
