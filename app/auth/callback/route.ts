import { NextResponse } from "next/server";

import {
  handleAuthCallback,
  type SupabaseAuthCallbackClient,
} from "@/lib/auth/auth-callback";
import { createClient } from "@/lib/supabase/server";

function getSafeNextPath(value: string | null) {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_auth_code", requestUrl.origin),
    );
  }

  const supabase = await createClient();
  const result = await handleAuthCallback(
    supabase as SupabaseAuthCallbackClient,
    code,
  );

  if (!result.ok) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "auth_callback_failed");
    loginUrl.searchParams.set("reason", result.reason);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
