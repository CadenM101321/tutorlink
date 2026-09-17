"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import { z } from "zod";
import { homePathFor, safeNextPath } from "@/lib/auth/paths";
import { logInSchema, signUpSchema } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";

// Server actions run on the server when a form is submitted. Treat each one
// like a public API endpoint: validate everything, trust nothing from the form.

export type AuthFormState =
  | {
      fieldErrors?: Partial<Record<string, string[]>>;
      formError?: string;
      // Sent back so the form keeps what was typed. Never includes the password.
      values?: Record<string, string>;
    }
  | undefined;

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocol = h.get("x-forwarded-proto") ?? "https";
  return `${protocol}://${host}`;
}

function signUpErrorMessage(error: AuthError): string {
  switch (error.code) {
    case "weak_password":
      return "Choose a stronger password with at least 10 characters.";
    case "over_email_send_rate_limit":
      return "Too many confirmation emails were sent recently. Try again in about an hour.";
    case "email_address_not_authorized":
      return "During the demo, confirmation emails can only be sent to TutorLink team addresses.";
    case "email_address_invalid":
      return "That email address can't receive email. Check it for typos.";
    case "over_request_rate_limit":
      return "Too many attempts. Wait a minute and try again.";
    default:
      return "We couldn't create your account. Check the form and try again.";
  }
}

export async function signUp(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const values = {
    fullName: text(formData.get("fullName")),
    email: text(formData.get("email")),
    role: text(formData.get("role")),
    confirmedAdult: text(formData.get("confirmedAdult")),
    acceptedTerms: text(formData.get("acceptedTerms")),
  };

  const parsed = signUpSchema.safeParse({
    ...values,
    password: formData.get("password"),
    timezone: formData.get("timezone"),
    confirmedAdult: formData.get("confirmedAdult"),
    acceptedTerms: formData.get("acceptedTerms"),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { fullName, email, password, role, timezone } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await siteOrigin()}/auth/confirm`,
      // Checked again by the database trigger that creates the profile.
      data: {
        full_name: fullName,
        role,
        timezone,
        confirmed_adult: true,
        accepted_terms: true,
      },
    },
  });

  if (error) {
    return { formError: signUpErrorMessage(error), values };
  }

  // Supabase answers the same way whether or not the email already has an
  // account, so this page can't be used to find out who has signed up.
  redirect("/signup/check-email");
}

export async function logIn(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const values = { email: text(formData.get("email")) };

  const parsed = logInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    const formError =
      error.code === "email_not_confirmed"
        ? "Confirm your email first. Check your inbox for the link we sent."
        : error.code === "over_request_rate_limit"
          ? "Too many attempts. Wait a minute and try again."
          : "That email and password don't match an account.";
    return { formError, values };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  if (!profile) {
    await supabase.auth.signOut();
    return { formError: "Your account isn't set up correctly. Contact support.", values };
  }

  redirect(safeNextPath(formData.get("next")) ?? homePathFor(profile.role));
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
