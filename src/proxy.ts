import type { NextRequest } from "next/server";
import { isProtectedPath } from "@/lib/auth/paths";
import { redirectWithSession, updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request);

  // A quick first check only: each protected page verifies the user and their
  // role again on the server, so this is never the only line of defense.
  if (!userId && isProtectedPath(request.nextUrl.pathname)) {
    const login = new URL("/login", request.url);
    login.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return redirectWithSession(login, response);
  }

  return response;
}

export const config = {
  matcher: [
    // Every path except static files, image optimization, and image assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
