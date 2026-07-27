import { addYears, isAfter, isBefore } from "date-fns";
import { PRODUCT } from "@/lib/constants";
import type { Entitlement, Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export function computeAccessEndsAt(from = new Date()) {
  return addYears(from, PRODUCT.accessYears);
}

export function isEntitlementActive(entitlement: Pick<Entitlement, "status" | "access_starts_at" | "access_ends_at">) {
  if (entitlement.status !== "active") return false;
  const now = new Date();
  return (
    !isBefore(now, new Date(entitlement.access_starts_at)) &&
    isAfter(new Date(entitlement.access_ends_at), now)
  );
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Profile | null) ?? null;
}

export async function getActiveEntitlement(userId: string): Promise<Entitlement | null> {
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
