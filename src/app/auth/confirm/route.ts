import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /auth/confirm: where the link in the sign-up confirmation email lands.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const supabase = await createClient();

  let confirmed = false;
  if (code) {
    // Supabase's standard email: Supabase has already confirmed the address and
    // sends a one-time code, exchanged here for a login session.
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    confirmed = !error;
  } else if (tokenHash && type) {
    // A custom email template that links here with a token (used once custom
    // email sending is set up).
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    confirmed = !error;
  }

  if (confirmed) {
    // /dashboard sends tutors and admins on to their own dashboards.
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // The code only works in the browser that signed up. Opened somewhere else
  // (like a phone), the email is still confirmed; the person just logs in.
  return NextResponse.redirect(new URL("/login?notice=confirm", request.url));
}
