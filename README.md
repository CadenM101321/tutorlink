# TutorLink

A tutoring marketplace: students find and book tutors, meet on video, pay only for the time used, and get study notes after each session.

Currently in demo mode. No real charges are made.

## Tech

Next.js (App Router, TypeScript), Tailwind CSS, shadcn/ui, Supabase, LiveKit, Stripe Connect, Gemini, hosted on Vercel. See [docs/plan.md](docs/plan.md) for the full build plan.

## Running locally

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the values.
3. `npm run dev`, then open http://localhost:3000.

Never commit `.env.local` or any other file containing keys, passwords, or tokens. This repository is public.
