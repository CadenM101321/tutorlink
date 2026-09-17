import type { Metadata } from "next";
import { DraftLegalPage } from "@/components/draft-legal-page";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <DraftLegalPage title="Terms of service">
      <p>
        TutorLink is currently a demonstration. Accounts, bookings, and sessions are for testing,
        and no real payments are taken.
      </p>
      <p>
        You must be 18 or older to create an account. Sessions may be recorded, with consent, to
        create transcripts and study notes.
      </p>
    </DraftLegalPage>
  );
}
