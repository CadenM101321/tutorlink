import type { Metadata } from "next";
import { EmptyCard } from "@/components/empty-card";
import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Admin" };

// Admin role can't be chosen at sign-up; it's only set directly in the database.
export default async function AdminPage() {
  await requireUser(["admin"]);

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 content-start gap-8 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
      <EmptyCard title="Tutor approvals">
        Coming soon: review new tutor profiles and approve or reject them.
      </EmptyCard>
    </main>
  );
}
