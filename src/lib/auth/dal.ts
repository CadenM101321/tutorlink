import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { homePathFor, type Role } from "./paths";

// The data access layer: the one place that decides who the current user is.
// Pages and server actions call these instead of reading cookies themselves.

export type CurrentUser = {
  id: string;
  email: string | null;
  fullName: string;
  role: Role;
  timezone: string;
};

// cache() runs this at most once per request, even if several components ask.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();

  // getClaims() verifies the login token's signature, so a forged or expired
  // cookie is rejected rather than trusted.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  // Row-level security limits this query to the user's own row.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, timezone")
    .eq("id", claims.sub)
    .maybeSingle();
  if (!profile) return null;

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    fullName: profile.full_name,
    role: profile.role,
    timezone: profile.timezone,
  };
});

// For pages only some roles may see. Logged-out visitors go to /login; people
// with a different role go to their own dashboard.
export async function requireUser(allowedRoles: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!allowedRoles.includes(user.role)) redirect(homePathFor(user.role));
  return user;
}
