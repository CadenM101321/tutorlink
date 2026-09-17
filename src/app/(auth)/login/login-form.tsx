"use client";

import { useActionState } from "react";
import { FieldError, FormAlert } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logIn } from "../actions";

export function LogInForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, formAction, pending] = useActionState(logIn, undefined);
  const errors = state?.fieldErrors;

  return (
    <form action={formAction} className="grid gap-6" noValidate>
      {state?.formError ? (
        <FormAlert message={state.formError} />
      ) : (
        <FormAlert message={notice} tone="info" />
      )}
      {next && <input type="hidden" name="next" value={next} />}

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state?.values?.email}
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
          autoComplete="current-password"
          aria-invalid={!!errors?.password}
          aria-describedby="password-error"
          className="h-10"
          required
        />
        <FieldError id="password-error" messages={errors?.password} />
      </div>

      <Button type="submit" size="lg" className="h-11 text-[15px]" disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
