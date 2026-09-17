import Link from "next/link";
import { Suspense } from "react";
import { logOut } from "@/app/(auth)/actions";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/dal";
import { homePathFor } from "@/lib/auth/paths";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <div className="ml-auto flex items-center gap-2">
          {/* The rest of the page doesn't wait for the login check. */}
          <Suspense fallback={null}>
            <AccountNav />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

async function AccountNav() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <Link href="/login" className={buttonVariants({ variant: "ghost", size: "lg" })}>
          Log in
        </Link>
        <Link href="/signup" className={buttonVariants({ size: "lg" })}>
          Sign up
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href={homePathFor(user.role)}
        className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "hidden sm:inline-flex")}
      >
        Dashboard
      </Link>
      <span
        className="grid size-8 place-items-center rounded-full bg-muted text-xs font-semibold"
        title={user.fullName}
        aria-hidden="true"
      >
        {initials(user.fullName)}
      </span>
      <form action={logOut}>
        <button type="submit" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Log out
        </button>
      </form>
    </>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
