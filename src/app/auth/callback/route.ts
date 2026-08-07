import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the redirect from Supabase invite / magic-link / password-reset
 * emails, which arrive as ?code=... (PKCE flow). Exchanges the code for a
 * session, then sends the user on to set a password.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/auth/set-password`);
    }
  }

  return NextResponse.redirect(`${origin}/login?next=/dashboard`);
}
