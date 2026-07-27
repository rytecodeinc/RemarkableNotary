import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { homePathForRole, isAdminEmail } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/preview";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    // Public preview: allow /admin and /learn without auth while Supabase is unset.
    return supabaseResponse;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    return supabaseResponse;
  }

  const pathname = request.nextUrl.pathname;
  const isDashboardPreview =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/learn" ||
    pathname.startsWith("/learn/");

  const isProtected =
    isDashboardPreview ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/checkout");

  // Allow unauthenticated preview of dashboards even when Supabase env exists but user is logged out.
  if (!user && isDashboardPreview) {
    return supabaseResponse;
  }

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, email")
      .eq("id", user.id)
      .maybeSingle();

    const role =
      profile?.role === "admin" || isAdminEmail(user.email || profile?.email)
        ? "admin"
        : "student";

    if (pathname === "/login" || pathname === "/dashboard") {
      const next = request.nextUrl.searchParams.get("next");
      const redirectUrl = request.nextUrl.clone();
      if (next?.startsWith("/") && !next.startsWith("//")) {
        if (next.startsWith("/admin") && role !== "admin") {
          redirectUrl.pathname = homePathForRole(role);
          redirectUrl.search = "";
        } else {
          redirectUrl.href = new URL(next, request.nextUrl.origin).toString();
        }
      } else {
        redirectUrl.pathname = homePathForRole(role);
        redirectUrl.search = "";
      }
      return NextResponse.redirect(redirectUrl);
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/learn";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}
