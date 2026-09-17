import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Placeholder landing page. The full design from the mockups comes at launch polish.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="grid max-w-2xl justify-items-center gap-6 text-center">
        <p className="text-sm font-medium text-primary">Tutoring matched to how you learn</p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Find a tutor who fits the way you learn.
        </h1>
        <p className="text-lg text-muted-foreground">
          Take a short learning style assessment, get matched with tutors whose teaching fits
          you, and meet over video. Pay only for the time you use.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-[15px]")}>
            Get started
          </Link>
          <Link
            href="/signup?role=tutor"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5 text-[15px]")}
          >
            Become a tutor
          </Link>
        </div>
      </div>
    </main>
  );
}
