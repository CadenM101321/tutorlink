import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { homePathFor } from "@/lib/auth/paths";
import { SignUpForm } from "./signup-form";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignUpPage({ searchParams }: PageProps<"/signup">) {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user.role));

  const { role } = await searchParams;

  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">Create your account</h1>
        <p className="text-muted-foreground">
          Already have one?{" "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
      <SignUpForm defaultRole={role === "tutor" ? "tutor" : "student"} />
    </div>
  );
}
