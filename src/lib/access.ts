import { addYears, isAfter, isBefore } from "date-fns";
import { ADMIN_EMAIL, PRODUCT, homePathForRole, isAdminEmail } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/preview";
import type { Entitlement, Profile, UserRole } from "@/lib/types";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export function computeAccessEndsAt(from = new Date()) {
  return addYears(from, PRODUCT.accessYears);
}

export function isEntitlementActive(
  entitlement: Pick<Entitlement, "status" | "access_starts_at" | "access_ends_at">,
) {
  if (entitlement.status !== "active") return false;
  const now = new Date();
  return (
    !isBefore(now, new Date(entitlement.access_starts_at)) &&
    isAfter(new Date(entitlement.access_ends_at), now)
  );
}

function roleForEmail(email: string | null | undefined): UserRole {
  return isAdminEmail(email) ? "admin" : "student";
}

/**
 * Ensures a profiles row exists. New accounts default to student;
 * only ADMIN_EMAIL becomes admin.
 */
export async function ensureProfile(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): Promise<Profile> {
  const email = (user.email || "").trim().toLowerCase();
  const role = roleForEmail(email);
  const fullName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
    "";

  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email,
          full_name: fullName,
          role,
        },
        { onConflict: "id" },
      )
      .select("*")
      .single();

    if (!error && data) {
      if (role === "admin" && data.role !== "admin") {
        const { data: promoted } = await service
          .from("profiles")
          .update({ role: "admin", email })
          .eq("id", user.id)
          .select("*")
          .single();
        return (promoted as Profile) ?? (data as Profile);
      }
      if (role === "student" && data.role === "admin" && !isAdminEmail(email)) {
        const { data: demoted } = await service
          .from("profiles")
          .update({ role: "student", email })
          .eq("id", user.id)
          .select("*")
          .single();
        return (demoted as Profile) ?? (data as Profile);
      }
      return data as Profile;
    }
  } catch {
    // Fall through when service key is unavailable.
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing as Profile;

  const { data: inserted, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email,
      full_name: fullName,
      role,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return inserted as Profile;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    try {
      return await ensureProfile({
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
      });
    } catch {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return (data as Profile | null) ?? null;
    }
  } catch {
    return null;
  }
}

export async function getActiveEntitlement(userId: string): Promise<Entitlement | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("entitlements")
      .select("*")
      .eq("user_id", userId)
      .eq("product_code", PRODUCT.code)
      .eq("status", "active")
      .order("access_ends_at", { ascending: false });

    const entitlements = (data as Entitlement[] | null) ?? [];
    return entitlements.find((e) => isEntitlementActive(e)) ?? null;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error("Unauthorized");
  }
  return profile;
}

export async function requireAdmin() {
  const profile = await requireUser();
  if (profile.role !== "admin") {
    throw new Error("Forbidden");
  }
  return profile;
}

export async function requireEntitlement() {
  const profile = await requireUser();
  if (profile.role === "admin") {
    return { profile, entitlement: null as Entitlement | null };
  }
  const entitlement = await getActiveEntitlement(profile.id);
  if (!entitlement) {
    throw new Error("No active entitlement");
  }
  return { profile, entitlement };
}

export function resolvePostLoginPath(role: UserRole, next?: string | null) {
  const fallback = homePathForRole(role);
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  if (next.startsWith("/admin") && role !== "admin") {
    return fallback;
  }
  return next;
}

export { ADMIN_EMAIL, homePathForRole };
