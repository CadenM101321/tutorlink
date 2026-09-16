# How TutorLink works

A plain-language guide to every piece of TutorLink, updated as each slice is built. Terms are defined the first time they appear.

## Slice 0: Foundation

### The big picture

TutorLink is a **web app**: a website that does things, not just shows pages. It has three main parts:

| Part | What it is | Where it runs |
|---|---|---|
| **Next.js app** | The code in this repo: the pages people see and the server code behind them | Vercel's servers |
| **Supabase** | The database (where data like users and bookings is stored), plus login and file storage | Supabase's servers |
| **GitHub** | Where the code is stored and its history is kept | GitHub's servers |

When someone visits the site, their **browser** (Chrome, Safari, and so on) asks Vercel for a page. Vercel runs the Next.js code, which can ask Supabase for data, and sends the finished page back to the browser.

```
Browser  →  Vercel (runs Next.js)  →  Supabase (database, login)
Browser  ←  Vercel                 ←  Supabase
```

### Next.js, React, and TypeScript

- **React** is a library for building web pages out of reusable pieces called **components**. The demo banner at the top of every page is one component, in `src/components/demo-banner.tsx`.
- **Next.js** is a framework built on React. It adds routing (which file shows for which URL), server code, and a build step that makes the site fast.
- **TypeScript** is JavaScript with **types**: labels that say what kind of value something is, like a number or a piece of text. The editor catches mistakes, such as passing text where a number is expected, before the code ever runs.

**Routing by folders.** In Next.js's App Router, the folder structure under `src/app/` *is* the list of URLs. `src/app/page.tsx` is the home page at `/`. A future `src/app/tutors/page.tsx` would be the page at `/tutors`. `src/app/layout.tsx` wraps every page, which is why the demo banner appears everywhere.

### Styling: Tailwind CSS and shadcn/ui

- **CSS** is the language that controls how a page looks.
- **Tailwind CSS** lets you style elements with short class names right in the component, like `text-center` or `mt-6` (margin on top). You rarely write separate CSS files.
- **shadcn/ui** is a set of ready-made components, like buttons, forms, and dialogs. Unlike most libraries, it copies the component code into this repo (`src/components/ui/`), so it can be changed freely.
- **Theme colors** live in `src/app/globals.css` as **CSS variables**: named colors like `--primary`, used everywhere. Changing `--primary` in one place recolors every button and link. It's currently a green placeholder until the design mockups pick the exact shade.

### Supabase connection and the proxy

Supabase will hold all the data and handle login. The connection code is in `src/lib/supabase/`:

| File | Used by | Why it exists |
|---|---|---|
| `client.ts` | Code running in the browser | Talks to Supabase from the user's browser |
| `server.ts` | Code running on Vercel's servers | Talks to Supabase while building a page |
| `proxy.ts` and `src/proxy.ts` | Every request, before the page is built | Keeps the user's login fresh |
| `env.ts` | All of the above | Reads the Supabase address and key, with a clear error if they're missing |

**How staying logged in works.** When you log in, Supabase gives your browser a **session token**: a signed pass that proves who you are, stored in a **cookie** (a small piece of data the browser sends with every request). Tokens expire after a short time for safety. The **proxy** runs before every page, checks the token, and swaps an expiring one for a fresh one. Without it, users would get logged out at random.

**Why the proxy isn't the only security check.** A proxy can be skipped by mistake, for example if a URL pattern changes. So every piece of server code that reads or changes private data will check who the user is by itself. The database will check again with row-level security, covered in Slice 1.

### Keeping secrets out of a public repo

The repository is public, so anyone on the internet can read every file in it. A **secret** is any value that grants access, like an API key (a password that lets code use a service) or a database password. A leaked Stripe key, for example, could let a stranger issue refunds.

Four layers of protection:

1. **`.gitignore`** tells Git never to track certain files. Real secrets go in `.env.local`, which is ignored.
2. **`.env.example`** lists the *names* of the settings the app needs, with blank values, so anyone setting up the project knows what to fill in.
3. **A pre-commit hook** (`.githooks/pre-commit`) runs **Gitleaks** before every commit. Gitleaks scans the changes for anything shaped like a key and blocks the commit if it finds one. It was tested with a fake Stripe key and blocked it.
4. **GitHub push protection** rejects a push that contains a known kind of secret, even from a computer without the hook.

**`NEXT_PUBLIC_` values.** Next.js copies any setting whose name starts with `NEXT_PUBLIC_` into the code sent to browsers, where anyone can read it. The Supabase **publishable key** is designed to be public: it only allows what the database's security rules allow. Secret keys never get that prefix.

**If a secret ever leaks,** deleting it in a new commit isn't enough, because Git keeps the full history. The key has to be **revoked** (switched off) in that service and replaced with a new one.

### Git and GitHub

- **Git** tracks every change to the code. A **commit** is a saved snapshot with a message describing what changed.
- **GitHub** stores a copy of the repository online. **Pushing** uploads new commits to it.
- Once Vercel is connected, every push to the `main` branch automatically **deploys** (publishes) a new version of the live site.

### Deploying: from a push to a live site

The live site is **https://tutorlink-beta.vercel.app**. (`tutorlink.vercel.app` already belonged to someone else, so Vercel added `-beta`. A custom domain comes at launch.)

What happens on every `git push`:

1. GitHub receives the new commits.
2. The **Vercel GitHub app** (installed on the GitHub account) notices the push and tells Vercel.
3. Vercel downloads the code, runs `npm install` and `npm run build` on its own computers, and checks that the build succeeds.
4. If it does, the new version goes live at the address above. If the build fails, the old version stays live, so a broken build never takes the site down.

Vercel also keeps every past deployment, so rolling back to an earlier version is one click in its dashboard.

**Environments.** Vercel has three: **Production** (the real site, built from `main`), **Preview** (a private test copy built from any other branch), and **Development** (for running locally). Each has its own settings. The two Supabase settings are added to all three.

**Why settings live in two places.** `.env.local` is only on this computer, and Vercel's build machines can't see it. So each setting goes in `.env.local` for local work and in Vercel's settings for the live site.

### The database and migrations

The Supabase project is `tutorlink-dev`, in the US East region, the same region where Vercel runs the site, so requests between them are fast. Its data lives in **Postgres**, a widely used database where data is stored in tables of rows and columns, like a spreadsheet with strict rules.

**Migrations.** A **migration** is a SQL file that changes the database's structure, for example by creating a table. SQL is the language used to talk to databases. The files live in `supabase/migrations/`, named with a timestamp so they always run in order.

The database is never changed by clicking around in the Supabase dashboard. Every change is a migration file, committed to Git, then applied with `npx supabase db push`. This way:

- The repo is a complete record of how the database got its current shape.
- A fresh database, such as the production one at launch, can be built by running the same files.
- Every change is reviewed and versioned like code.

Supabase records which migrations it has already applied, so each one runs only once.

### The health check: proving everything is connected

The first migration creates a tiny database **function** called `health_check` that just returns `ok`. The page at `/api/health` calls it. This is Slice 0's final test, because a successful answer proves every link in the chain works:

```
Browser → Vercel runs src/app/api/health/route.ts
        → Supabase client (src/lib/supabase/server.ts) uses the URL and publishable key from Vercel's settings
        → Supabase runs health_check() in Postgres
        ← "ok"
Browser ← {"app":"ok","database":"ok"}
```

If the database can't be reached, the page answers `"database":"unreachable"` with status 503, the standard code for "service unavailable", so monitoring tools can tell something is wrong. The response is marked `no-store` so it's never cached, meaning every check is real.

**Security detail.** The migration removes permission to run the function from everyone, then grants it only to Supabase's two app roles: `anon` (logged-out visitors) and `authenticated` (logged-in users). Starting from "nobody can" and adding exactly what's needed is called **least privilege**, and every table from Slice 1 onward follows the same pattern.
