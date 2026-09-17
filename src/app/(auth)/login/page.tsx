import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { homePathFor, safeNextPath } from "@/lib/auth/paths";
import { LogInForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

const NOTICES: Record<string, string> = {
  confirm: "If your email is confirmed, log in to continue.",
};

export default async function LogInPage({ searchParams }: PageProps<"/login">) {
  const { next, notice } = await searchParams;
  const nextPath = safeNextPath(next);

  const user = await getCurrentUser();
  if (user) redirect(nextPath ?? homePathFor(user.role));

  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
        <p className="text-muted-foreground">
          New to TutorLink?{" "}
          <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
      <LogInForm
        next={nextPath ?? undefined}
        notice={typeof notice === "string" ? NOTICES[notice] : undefined}
      />
    </div>
  );
}
