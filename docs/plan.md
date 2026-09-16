# TutorLink: Vertical Slice Plan

Progress is tracked in the checklist at the bottom of this file.

## Context

Caden is rebuilding the HackWst26 tutoring app solo, from scratch, as a real product that can make money. The hackathon version failed because parts were built separately and never connected, the frontend design was poor (teal-heavy), and the stack was forced (Python backend, Vultr, TigerData). This plan builds the app one vertical slice at a time. Each slice is a complete feature that works end to end on the live demo site before the next one starts. Caden's second goal is learning, so every slice ends with a plain-language explanation of how it works.

Brand-new folder, no old code reused.

The core idea, from the original app: students take a **learning style assessment**, and TutorLink matches them with tutors whose teaching strengths fit how they learn. This was left out of the first draft of this plan and added back on 2026-09-16 (Slices 2 and 3).

## Decisions locked in

| Area | Choice |
|---|---|
| Language and framework | TypeScript, Next.js App Router, React |
| Styling | Tailwind CSS and shadcn/ui; mostly white, one green accent, no teal |
| Database, login, file storage | Supabase: Postgres, Supabase Auth, Storage, row-level security on every table |
| Video calls | LiveKit Cloud with its React components and webhooks |
| Payments | Stripe Connect, test mode only until launch |
| Transcription and notes | Gemini |
| Hosting | Vercel Hobby during demo phase, deployed from a **public** GitHub repo (changed from private on 2026-09-16), so secrets must never be committed |
| Sessions | Scheduled bookings |
| Students at launch | Adults and college students, 18+ |
| Pricing | Flat platform fee per session, plus tutor hourly rate billed per second |
| Supporting tools | Zod for input validation, Vitest for unit tests, Playwright for end-to-end tests |

## Project setup facts

- **Name and folder:** TutorLink, in `C:\Users\caden\Projects\tutorlink`. It replaces the earlier working folder `tutor-app`, which only held a blank Next.js scaffold. `C:\Coding stuff` and everything under it is admin-only, so it can't hold the project.
- **Already installed:** Node 24, npm, Git.
- **Secrets:** real values go only in `.env.local` (gitignored) and in Vercel's environment settings. A Gitleaks pre-commit hook scans every commit.
- **To install in Slice 0:** GitHub CLI, Vercel CLI, Supabase CLI, Stripe CLI, LiveKit CLI. Docker is not installed, so we use a hosted Supabase dev project instead of a local database.
- **Caden only signs in.** Caden creates or signs in to GitHub, Vercel, Supabase, Stripe, LiveKit, and Google AI Studio, and pastes an API key only when no command-line tool can fetch it. Everything else is done by Claude, per the user CLAUDE.md rule.

## How every slice is built

1. Sketch the page, using a design canvas mockup for new screens.
2. Write a Supabase migration: tables, constraints, and security rules.
3. Write server code, with inputs validated by Zod.
4. Build the pages and connect them to the server code.
5. Test the full flow as a real user, plus unit tests for any logic.
6. Commit, push, and confirm it works on the live Vercel URL.
7. Explain the slice to Caden and update `docs/how-it-works.md`.

A slice is done only when step 6 passes on the live site.

---

## Slice 0: Foundation and design

**Goal:** a blank but real app, live on Vercel, connected to Supabase, with the design system and mockups ready.

- Create the folder, init Git, scaffold Next.js with TypeScript, Tailwind, ESLint, and a `src` directory.
- Add shadcn/ui. Set theme colors in `src/app/globals.css`: white background, near-black text, one green accent. Pick the exact green in the mockups.
- Install the CLIs. Create the public GitHub repo, the Supabase dev project, and the Vercel project linked to the repo. Set environment variables in `.env.local` and in Vercel.
- Add Supabase client helpers in `src/lib/supabase/`: `server.ts`, `client.ts`, and session refresh used by `src/proxy.ts`. That file is `middleware.ts` in Next.js versions before 16.
- Add a site-wide "Demo mode, no real charges" banner.
- Create design canvas mockups for landing, search results, tutor profile, booking, session room, and dashboards. Caden tweaks them visually before those slices start.
- Add a project `CLAUDE.md` and `docs/how-it-works.md`. Update Claude memory with the locked decisions and the new-folder, no-old-code rule.

**Done when:** the landing page loads on the Vercel URL, and a test query to Supabase succeeds from the deployed site.

## Slice 1: Accounts and login

**Goal:** people can sign up as a student or tutor, log in, and land on the right dashboard.

- Supabase Auth with email and password, including email confirmation.
- Sign-up form with role choice, an 18+ confirmation, and acceptance of terms.
- Tables: `profiles` holds id, name, role of student, tutor, or admin, timezone, and avatar. A database trigger creates it when an auth user is created.
- Security rules: users read and edit only their own profile.
- Route protection in `src/proxy.ts`. Empty student and tutor dashboards.

**Done when:** sign-up, confirmation email, login, logout, and role-based redirects all work live, and one user can't read another user's private profile.

## Slice 2: Tutor profiles, teaching style, and approval

**Goal:** tutors build a profile, and Caden approves them before they appear to students.

- Tutor onboarding form: headline, bio, subjects and levels, hourly rate, timezone, weekly availability, and photo upload to Supabase Storage.
- Tutor teaching style questionnaire, covering the same areas as the student assessment in Slice 3, so the two can be compared. The questions are designed at the start of Slice 2.
- Public tutor profile page.
- Admin page for Caden to approve or reject tutors.
- Tables: `tutor_profiles` with `hourly_rate_cents` and approval status, `subjects`, `tutor_subjects`, `availability_rules` for weekly hours, and `availability_exceptions` for days off.
- All money stored as integer cents. All times stored in UTC and shown in each viewer's timezone.
- Seed file with fake subjects and tutors for testing.

**Done when:** a new tutor completes a profile, an admin approves it, and the public profile page shows it. Unapproved tutors are invisible to students.

## Slice 3: Learning style assessment, search, and matching

**Goal:** students take a learning style assessment and are matched with the tutors who fit how they learn.

**Decide at the start of Slice 2, before tutors fill in their side:** the assessment's areas and questions, and how much learning-style fit counts against price, availability, and rating. Recommended approach: research does not support fixed "visual, auditory, or kinesthetic" learner types, so measure practical preferences a tutor can act on instead. Examples: pace, how structured the sessions are, explanations versus worked examples versus practice problems, how much encouragement is wanted, and the student's confidence in each topic, which shows their strengths and weak spots. Avoid claiming the assessment improves grades until there's data to back it up.

- Student onboarding: the learning style assessment, then subjects needed, budget, and preferred times. Students can retake the assessment later.
- Results page showing the student their learning profile in plain language.
- Tables: `assessment_questions`, `student_assessments` for answers and computed profile scores, and `tutor_teaching_styles` from the Slice 2 questionnaire.
- Search page with subject, price, and availability filters.
- Matching as a Postgres function, called from the server, that ranks approved tutors. It requires a subject match, then scores learning-style fit between the student's profile and the tutor's teaching style, availability overlap, price within budget, and rating. Ratings arrive in Slice 8, so new tutors get a neutral score until then.
- Each tutor card says why the tutor is a good match, for example "explains with worked examples, which fits how you learn."
- Tutor cards linking to profiles.

**Done when:** a student completes the assessment and sees their profile, and with seeded tutors the results are filtered and ranked correctly, with learning-style fit changing the order. The scoring is tested against seeded cases.

## Slice 4: Booking

**Goal:** students book open time slots, and both sides see upcoming sessions.

- Slot picker built from the tutor's weekly rules, minus exceptions and existing bookings, shown in the student's timezone.
- Instant confirmation, with a recording consent checkbox on every booking.
- Cancellation by either side. Money rules for cancellation come in Slice 6.
- Table: `bookings` with student, tutor, subject, start and end times, status, and snapshots of `hourly_rate_cents` and `platform_fee_cents`. A tutor changing their rate later doesn't change existing bookings.
- A Postgres exclusion constraint makes double-booking a tutor impossible at the database level.
- Upcoming and past sessions on both dashboards.

**Done when:** a student books a slot, it disappears for everyone else, both dashboards show it, and two simultaneous bookings of the same slot can't both succeed.

## Slice 5: Video sessions and the billing timer

**Goal:** booked people meet on video, and the server measures exact billable time.

- LiveKit Cloud project. A server route issues a call token only to that booking's student or tutor, only near the booked time.
- Session room page using LiveKit React components, with in-call text chat and a visible recording indicator.
- Webhook route at `src/app/api/webhooks/livekit/route.ts` that verifies LiveKit's signature and records join and leave events.
- `src/lib/billing.ts`, a pure TypeScript module. Billable seconds count from when both people are present, allow a short reconnect grace period, and stop at the booked end time. The amount equals rate times seconds divided by an hour, rounded once to a whole cent, plus the platform fee. Unit tests in `billing.test.ts` cover rounding, disconnects, overtime, and zero-length sessions.
- Tables: `sessions` and `session_events`, plus `webhook_events` so a webhook delivered twice is only processed once.
- Session summary page showing duration and what would be charged. No real Stripe calls yet.

**Done when:** two browsers join a booked session, a disconnect and rejoin is handled, and the summary shows the correct seconds and amount. Billing unit tests pass.

## Slice 6: Payments in Stripe test mode

**Decide at the start of this slice:** who pays Stripe's processing fee, which sets the Stripe charge type; the flat fee amount; and no-show and late-cancellation rules.

- Tutor payout onboarding with Stripe Connect's hosted onboarding. Tutors can't be booked until payouts are enabled.
- At booking, the student saves a card with a Stripe SetupIntent.
- On clicking Join, a hold is placed for the fee plus the booked length. This happens while the student is present, so any bank verification step works. A declined card blocks the session and prompts for a new card.
- At session end, the server charges the exact amount from `billing.ts`, and Stripe releases the rest of the hold.
- Webhook route at `src/app/api/webhooks/stripe/route.ts` with signature verification and idempotency through `webhook_events`.
- Table: `payments` with PaymentIntent id, held, charged, and fee amounts, and status.
- Receipts for students, earnings for tutors, and admin refunds.
- Local testing uses the Stripe CLI to forward webhooks, plus Stripe's test cards for success, decline, and bank verification.

**Done when:** a full session in test mode holds, charges the exact amount, splits the fee, and shows the tutor's payout in the Stripe test dashboard. Decline and verification test cards behave correctly.

## Slice 7: Transcription and notes

**Goal:** after each session, both people get a transcript and study notes.

- The tutor's browser records the mixed call audio and uploads it in chunks to Supabase Storage, so a crash loses at most one chunk. This avoids LiveKit's paid recording.
- After the session ends, server code sends the audio to Gemini and requests a transcript with speaker labels, plus structured notes: summary, topics covered, and practice suggestions.
- It runs in the background after the webhook response. Vercel Hobby functions stop at five minutes, so a failure is marked and can be retried. At launch this moves to a longer-running job.
- Tables: `recordings` and `session_notes` with status. Audio is deleted once notes are saved.
- Notes page for both student and tutor.
- Gemini's free tier may use submitted data, so the demo phase uses only test sessions, never real students.

**Done when:** a test session produces a transcript and notes on the notes page, and a forced failure can be retried.

## Slice 8: Reviews, dashboards, and notifications

- Reviews after completed sessions, which feed the matching score.
- Tutor earnings dashboard and student session history.
- Email notifications through Resend for booking confirmations, reminders, cancellations, and notes ready.
- Google login through Supabase Auth. This needs Caden to create Google OAuth credentials while signed in to Google.

**Done when:** a completed session can be reviewed, ratings change search ranking, and each email arrives.

## Slice 9: Hardening and launch readiness

- Playwright end-to-end test of the whole flow: sign up, approve tutor, book, join, pay in test mode, and view notes.
- Sentry error tracking on the free plan.
- Security review of every row-level security rule, testing as student, tutor, other user, and logged-out visitor.
- Terms of service, privacy policy, and recording consent pages. Caden should get these reviewed by a lawyer before real users.
- Landing page polish, SEO basics, and an accessibility pass.
- **Launch checklist,** done only when Caden decides to launch: Vercel Pro, a separate Supabase production project, Stripe account activation and live keys, Gemini paid tier, custom domain, and removing the demo banner.

---

## Out of scope for launch

On-demand sessions, students under 18 and parent accounts, messaging before booking, and a mobile app. Matching at launch is a scored algorithm that can be tested and explained; using AI on top of it, for example to read session notes and improve matches, is a later upgrade.

## Verification, across the whole project

- `npm run lint`, `npx tsc --noEmit`, and `npx vitest run` pass before every push.
- Vercel builds each push. Each slice's "done when" check is run on the live URL, not just locally.
- Database changes are only made through migration files in `supabase/migrations/`, so the live database always matches the repo.
- Webhooks are tested with the Stripe CLI and LiveKit's webhook test tools, including duplicate deliveries.
- From Slice 9, the Playwright test runs the full flow on every change.

---

## Progress

Update this checklist as work finishes, so any new session can pick up where the last one stopped.

### Slice 0: Foundation and design

- [x] Folder, Git, Next.js scaffold (TypeScript, Tailwind, ESLint, `src`)
- [x] Secret protection: `.gitignore`, `.env.example`, project `CLAUDE.md` rules
- [x] Supabase packages and Zod installed
- [x] Supabase client helpers in `src/lib/supabase/` and session refresh in `src/proxy.ts`
- [x] Gitleaks pre-commit hook in `.githooks/`, enabled with `git config core.hooksPath .githooks` (run that once after cloning)
- [x] shadcn/ui and theme colors (white, near-black, green-700 accent as a placeholder until the mockups)
- [x] "Demo mode, no real charges" banner and placeholder landing page
- [x] GitHub CLI installed and signed in (account CadenM101321); public `tutorlink` repo created and pushed
- [x] Vercel CLI (global) and Supabase CLI (project dev dependency, run with `npx supabase`) installed
- [x] Vercel CLI and Supabase CLI signed in; Vercel app installed on GitHub
- [x] Supabase dev project `tutorlink-dev` (ref `lzsouqetqavrocsahndh`, us-east-1) created and linked; env vars in `.env.local` and Vercel (Production, Preview, Development)
- [x] Vercel project linked to the repo; landing page live at https://tutorlink-beta.vercel.app (auto-deploys on push to `main`)
- [x] Test Supabase query succeeds from the deployed site: `/api/health` returns `{"app":"ok","database":"ok"}`
- [ ] Design canvas mockups: landing, search results, tutor profile, booking, session room, dashboards
- [x] `docs/how-it-works.md` explains Slice 0
- [ ] Stripe CLI and LiveKit CLI: deferred to Slices 5 and 6, when they're first needed

### Later slices

- [ ] Slice 1: Accounts and login
- [ ] Slice 2: Tutor profiles, teaching style questionnaire, and approval
- [ ] Slice 3: Learning style assessment, search, and matching
- [ ] Slice 4: Booking
- [ ] Slice 5: Video sessions and the billing timer
- [ ] Slice 6: Payments in Stripe test mode
- [ ] Slice 7: Transcription and notes
- [ ] Slice 8: Reviews, dashboards, and notifications
- [ ] Slice 9: Hardening and launch readiness
