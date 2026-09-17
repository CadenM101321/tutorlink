"use client";

import Link from "next/link";
import { useActionState, useSyncExternalStore } from "react";
import { FieldError, FormAlert } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";
import { signUp } from "../actions";

const ROLES = [
  { value: "student", title: "Learn", description: "Find a tutor who fits how you learn" },
  { value: "tutor", title: "Tutor", description: "Teach students who fit your style" },
] as const;

export function SignUpForm({ defaultRole }: { defaultRole: "student" | "tutor" }) {
  const [state, formAction, pending] = useActionState(signUp, undefined);
  const errors = state?.fieldErrors;
  const values = state?.values;
  const timezone = useBrowserTimezone();

  return (
    <form action={formAction} className="grid gap-6" noValidate>
      <FormAlert message={state?.formError} />
      <input type="hidden" name="timezone" value={timezone} />

      <fieldset className="grid gap-3">
        <legend className="mb-3 text-sm font-medium">I&apos;m joining to</legend>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map((role) => (
            <label
              key={role.value}
              className="grid cursor-pointer gap-1 rounded-xl border border-border p-4 transition-colors has-checked:border-primary has-checked:bg-primary/5 has-checked:ring-1 has-checked:ring-primary has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
            >
              <input
                type="radio"
                name="role"
                value={role.value}
                defaultChecked={(values?.role || defaultRole) === role.value}
                className="sr-only"
              />
              <span className="font-medium">{role.title}</span>
              <span className="text-sm text-muted-foreground">{role.description}</span>
            </label>
          ))}
        </div>
        <FieldError id="role-error" messages={errors?.role} />
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          defaultValue={values?.fullName}
          aria-invalid={!!errors?.fullName}
          aria-describedby="fullName-error"
          className="h-10"
          required
        />
        <FieldError id="fullName-error" messages={errors?.fullName} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={values?.email}
          aria-invalid={!!errors?.email}
          aria-describedby="email-error"
          className="h-10"
          required
        />
        <FieldError id="email-error" messages={errors?.email} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          maxLength={MAX_PASSWORD_LENGTH}
          aria-invalid={!!errors?.password}
          aria-describedby="password-hint password-error"
          className="h-10"
          required
        />
        <p id="password-hint" className="text-sm text-muted-foreground">
          At least {MIN_PASSWORD_LENGTH} characters.
        </p>
        <FieldError id="password-error" messages={errors?.password} />
      </div>

      <div className="grid gap-3">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="confirmedAdult"
            defaultChecked={values?.confirmedAdult === "on"}
            aria-describedby="confirmedAdult-error"
            className="mt-0.5 size-4 shrink-0 accent-primary"
          />
          <span>I&apos;m 18 or older.</span>
        </label>
        <FieldError id="confirmedAdult-error" messages={errors?.confirmedAdult} />

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="acceptedTerms"
            defaultChecked={values?.acceptedTerms === "on"}
            aria-describedby="acceptedTerms-error"
            className="mt-0.5 size-4 shrink-0 accent-primary"
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="font-medium underline underline-offset-4">
              terms of service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium underline underline-offset-4">
              privacy policy
            </Link>
            .
          </span>
        </label>
        <FieldError id="acceptedTerms-error" messages={errors?.acceptedTerms} />
      </div>

      <Button type="submit" size="lg" className="h-11 text-[15px]" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}

// The server can't know the visitor's timezone, so the browser supplies it.
// The server render uses "UTC", then the browser swaps in the real value.
// Being a controlled value, it survives React resetting the form after a submit.
const noSubscription = () => () => {};
function useBrowserTimezone(): string {
  return useSyncExternalStore(
    noSubscription,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => "UTC",
  );
}
