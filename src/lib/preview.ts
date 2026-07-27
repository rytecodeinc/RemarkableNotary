import type { Course, Entitlement, Profile } from "@/lib/types";
import { ADMIN_EMAIL } from "@/lib/constants";

/** True when Supabase is not configured with a real project. */
export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return false;
  if (url.includes("example.supabase.co")) return false;
  if (key.includes("placeholder")) return false;
  return true;
}

export const PREVIEW_ADMIN: Profile = {
  id: "preview-admin",
  email: ADMIN_EMAIL,
  full_name: "Rina (Preview)",
  role: "admin",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const PREVIEW_STUDENT: Profile = {
  id: "preview-student",
  email: "student@example.com",
  full_name: "Alex Student",
  role: "student",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const PREVIEW_ENTITLEMENT: Entitlement = {
  id: "preview-entitlement",
  user_id: PREVIEW_STUDENT.id,
  product_code: "CA_NOTARY_COURSE",
  status: "active",
  stripe_customer_id: null,
  stripe_checkout_session_id: null,
  stripe_payment_intent_id: null,
  access_starts_at: new Date().toISOString(),
  access_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 2).toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const PREVIEW_COURSES: Course[] = [
  {
    id: "preview-course-1",
    title: "Notary Foundations",
    slug: "notary-foundations",
    description: "Core California notary concepts, appointment path, and professional standards.",
    thumbnail_key: null,
    is_published: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "preview-course-2",
    title: "Identity & Journal Practice",
    slug: "identity-journal-practice",
    description: "ID scrutiny, fraud vigilance, and journal entries with real-world walkthroughs.",
    thumbnail_key: null,
    is_published: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "preview-course-3",
    title: "Certificates & Exam Readiness",
    slug: "certificates-exam-readiness",
    description: "Certificate language, seals, common forms, and exam-style preparation.",
    thumbnail_key: null,
    is_published: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
