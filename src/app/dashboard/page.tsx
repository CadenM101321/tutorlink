import type { Metadata } from "next";
import { EmptyCard, firstName } from "@/components/empty-card";
import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Dashboard" };

// Student dashboard. Tutors and admins are sent to their own dashboards.
export default async function StudentDashboardPage() {
  const user = await requireUser(["student"]);

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 content-start gap-8 px-4 py-10 sm:px-6">
      <div className="grid gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome, {firstName(user.fullName)}</h1>
        <p className="text-muted-foreground">Times are shown in {user.timezone}.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <EmptyCard title="Learning style assessment">
          Coming soon: a short assessment about how you like to learn, so we can match you with
          tutors who fit.
        </EmptyCard>
        <EmptyCard title="Your sessions">
          You don&apos;t have any sessions yet. Booked sessions will show up here.
        </EmptyCard>
      </div>
    </main>
  );
}
