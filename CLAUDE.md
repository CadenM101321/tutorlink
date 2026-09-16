@AGENTS.md

# TutorLink

A tutoring marketplace: students book tutors, meet on video, pay per second, and get AI study notes afterward.

- **The plan is `docs/plan.md`.** Read it at the start of every session. It lists the locked-in tech decisions, the slice-by-slice build order, and a **Progress** checklist at the bottom. Continue from the first unchecked item, and tick items off as they finish.
- Build one vertical slice at a time, following "How every slice is built" in the plan. A slice is done only when it works on the live Vercel URL.
- Caden is also learning: after each slice, explain it in plain language and update `docs/how-it-works.md`.
- Caden only signs in to accounts. Do every other step yourself instead of listing steps for Caden.

## Secrets: this repository is PUBLIC on GitHub

- Never commit API keys, passwords, tokens, private keys, connection strings, or any other credential.
- Real secret values go only in `.env.local` (gitignored) and in Vercel's environment settings. Add each variable name, with an empty value, to `.env.example`.
- Only values that are safe for anyone to see may use the `NEXT_PUBLIC_` prefix, because Next.js bundles those into browser code. Secret keys (Supabase secret key, Stripe secret key, LiveKit API secret, Gemini API key) must never be `NEXT_PUBLIC_`.
- Read secrets from environment variables in code; never hardcode them, even temporarily, and never put them in docs, tests, or seed files.
- Before every commit, check `git diff --staged` for anything that looks like a secret. A Gitleaks pre-commit hook also scans staged changes. Never bypass it with `--no-verify`.
- If a secret is ever committed or pushed, stop and tell Caden immediately. The secret must be revoked and replaced, not just deleted in a new commit, because it stays in Git history.
