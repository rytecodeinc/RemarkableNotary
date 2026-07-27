import { redirect } from "next/navigation";
import { getCurrentProfile, resolvePostLoginPath } from "@/lib/access";

/** Role-aware entrypoint used by Log in CTAs. */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const profile = await getCurrentProfile();

  if (!profile) {
    const qs = next ? `?next=${encodeURIComponent(next)}` : "";
    redirect(`/login${qs}`);
  }

  redirect(resolvePostLoginPath(profile.role, next));
}
