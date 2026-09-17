import type { Database } from "@/lib/supabase/database.types";

export type Role = Database["public"]["Enums"]["user_role"];

// Pages that require being logged in. The proxy redirects logged-out visitors
// to /login, and each page checks the role again on the server.
const PROTECTED_PREFIXES = ["/dashboard", "/tutor", "/admin"];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function homePathFor(role: Role): string {
  switch (role) {
    case "tutor":
      return "/tutor";
    case "admin":
      return "/admin";
    default:
      return "/dashboard";
  }
}

// Only allow redirects to paths on this site. Anything else, like
// "https://evil.example" or "//evil.example", could send someone to a fake
// login page after they sign in (an "open redirect").
export function safeNextPath(next: unknown): string | null {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) {
    return null;
  }
  try {
    const base = "http://tutorlink.invalid";
    const url = new URL(next, base);
    if (url.origin !== base) return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}
