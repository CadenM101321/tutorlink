import type { Metadata } from "next";
import { EmptyCard, firstName } from "@/components/empty-card";
import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Tutor dashboard" };

// Tutor dashboard. Students and admins are sent to their own dashboards.
export default async function TutorDashboardPage() {
  const user = await requireUser(["tutor"]);

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 content-start gap-8 px-4 py-10 sm:px-6">
      <div className="grid gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Hi, {firstName(user.fullName)}</h1>
        <p className="text-muted-foreground">Times are shown in {user.timezone}.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <EmptyCard title="Your tutor profile">
          Coming soon: set up your subjects, rate, availability, and teaching style. Students
          see your profile once it&apos;s approved.
        </EmptyCard>
        <EmptyCard title="Your sessions">
          You don&apos;t have any sessions yet. Booked sessions will show up here.
        </EmptyCard>
      </div>
    </main>
  );
}
