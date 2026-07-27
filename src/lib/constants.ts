export const PRODUCT = {
  code: "CA_NOTARY_COURSE",
  name: "CA Notary Course",
  priceCents: 7900,
  currency: "usd",
  accessYears: 2,
} as const;

/** Sole Phase 1 admin account. Everyone else is a student by default. */
export const ADMIN_EMAIL = "rinarasia@gmail.com";

export const SITE = {
  name: "Remarkable Notary",
  domain: "remarkablenotary.com",
  tagline: "Become a Remarkable Notary in Minutes.",
} as const;

export function isAdminEmail(email: string | null | undefined) {
  return (email || "").trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export function homePathForRole(role: "admin" | "student") {
  return role === "admin" ? "/admin" : "/learn";
}
