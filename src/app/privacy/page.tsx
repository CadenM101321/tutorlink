import type { Metadata } from "next";
import { DraftLegalPage } from "@/components/draft-legal-page";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <DraftLegalPage title="Privacy policy">
      <p>
        When you sign up, TutorLink stores your name, email address, role, and timezone so you
        can log in and see times in your own timezone. Your profile is private to you.
      </p>
      <p>
        Please don&apos;t enter sensitive personal information during the demo. Accounts may be
        deleted at any time.
      </p>
    </DraftLegalPage>
  );
}
