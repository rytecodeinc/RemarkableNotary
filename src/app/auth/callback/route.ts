import { NextResponse } from "next/server";
import { ensureProfile, resolvePostLoginPath } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const profile = await ensureProfile({
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
        });
        const destination = resolvePostLoginPath(profile.role, next);
        return NextResponse.redirect(`${origin}${destination}`);
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
