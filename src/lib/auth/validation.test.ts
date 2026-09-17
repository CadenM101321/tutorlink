import { describe, expect, it } from "vitest";
import { z } from "zod";
import { logInSchema, signUpSchema } from "./validation";

const valid = {
  fullName: "  Jordan Lee ",
  email: " Jordan@Example.com ",
  password: "correct horse battery",
  role: "student",
  timezone: "America/Chicago",
  confirmedAdult: "on",
  acceptedTerms: "on",
};

function errorsFor(input: Record<string, unknown>) {
  const result = signUpSchema.safeParse(input);
  return result.success ? {} : z.flattenError(result.error).fieldErrors;
}

describe("signUpSchema", () => {
  it("accepts a complete form and tidies the name and email", () => {
    const result = signUpSchema.parse(valid);
    expect(result.fullName).toBe("Jordan Lee");
    expect(result.email).toBe("jordan@example.com");
  });

  it("requires confirming 18+ and accepting the terms", () => {
    const errors = errorsFor({ ...valid, confirmedAdult: null, acceptedTerms: null });
    expect(errors.confirmedAdult).toEqual(["You must be 18 or older to use TutorLink."]);
    expect(errors.acceptedTerms).toEqual(["Accept the terms to create an account."]);
  });

  it("only allows the student and tutor roles", () => {
    expect(errorsFor({ ...valid, role: "admin" }).role).toBeDefined();
    expect(errorsFor({ ...valid, role: null }).role).toBeDefined();
    expect(errorsFor({ ...valid, role: "tutor" }).role).toBeUndefined();
  });

  it("enforces the password length limits", () => {
    expect(errorsFor({ ...valid, password: "short" }).password).toEqual([
      "Use at least 10 characters.",
    ]);
    expect(errorsFor({ ...valid, password: "x".repeat(73) }).password).toBeDefined();
  });

  it("rejects a blank name and a malformed email", () => {
    const errors = errorsFor({ ...valid, fullName: "   ", email: "not-an-email" });
    expect(errors.fullName).toBeDefined();
    expect(errors.email).toEqual(["Enter a valid email address."]);
  });

  it("falls back to UTC for an unknown timezone instead of failing", () => {
    expect(signUpSchema.parse({ ...valid, timezone: "Mars/Olympus" }).timezone).toBe("UTC");
    expect(signUpSchema.parse({ ...valid, timezone: "UTC" }).timezone).toBe("UTC");
  });
});

describe("logInSchema", () => {
  it("requires an email and a password", () => {
    const result = logInSchema.safeParse({ email: "", password: "" });
    expect(result.success).toBe(false);
  });
});
