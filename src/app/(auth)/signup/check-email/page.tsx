import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Check your email" };

export default function CheckEmailPage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Check your email</h1>
      <p className="text-muted-foreground">
        We sent you a link to confirm your email address. Open it in this browser and
        you&apos;ll be logged in automatically.
      </p>
      <p className="text-muted-foreground">
        Opened it on another device? That still confirms your email. Just{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          log in
        </Link>{" "}
        here afterward.
      </p>
      <p className="text-sm text-muted-foreground">
        No email after a few minutes? Check your spam folder.
      </p>
    </div>
  );
}
