import { z } from "zod";

// Must match auth.minimum_password_length in supabase/config.toml.
export const MIN_PASSWORD_LENGTH = 10;
// Supabase rejects passwords longer than 72 characters.
export const MAX_PASSWORD_LENGTH = 72;

const TIME_ZONES = new Set([...Intl.supportedValuesOf("timeZone"), "UTC"]);

const email = z
  .string({ error: "Enter your email address." })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Enter a valid email address." }).max(254));

export const signUpSchema = z.object({
  fullName: z
    .string({ error: "Enter your name." })
    .trim()
    .min(1, { error: "Enter your name." })
    .max(100, { error: "Use 100 characters or fewer." }),
  email,
  password: z
    .string({ error: "Choose a password." })
    .min(MIN_PASSWORD_LENGTH, {
      error: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
    })
    .max(MAX_PASSWORD_LENGTH, {
      error: `Use ${MAX_PASSWORD_LENGTH} characters or fewer.`,
    }),
  role: z.enum(["student", "tutor"], {
    error: "Choose whether you're joining to learn or to tutor.",
  }),
  // Detected by the browser. An unknown value falls back to UTC instead of
  // blocking sign-up, since people can change it later.
  timezone: z
    .string()
    .refine((value) => TIME_ZONES.has(value))
    .catch("UTC"),
  confirmedAdult: z.literal("on", {
    error: "You must be 18 or older to use TutorLink.",
  }),
  acceptedTerms: z.literal("on", {
    error: "Accept the terms to create an account.",
  }),
});

export const logInSchema = z.object({
  email,
  password: z
    .string({ error: "Enter your password." })
    .min(1, { error: "Enter your password." }),
});
