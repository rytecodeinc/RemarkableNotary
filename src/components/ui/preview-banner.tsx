import Link from "next/link";

export function PreviewBanner({ role }: { role: "admin" | "student" }) {
  return (
    <div className="border-b border-brass/30 bg-[#fff8e8] px-4 py-2.5 text-center text-sm text-ink">
      Preview mode — layout only, no Supabase session.{" "}
      <span className="font-medium capitalize">{role}</span> dashboard.{" "}
      <Link href="/" className="underline">
        Back to home
      </Link>
    </div>
  );
}
