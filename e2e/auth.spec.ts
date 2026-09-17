import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

// Walks through login, role-based redirects, and logout in a real browser.
// Test accounts are created already confirmed, so no emails are sent, and they
// are deleted afterward. Real sign-up with an email link is checked by hand,
// because the demo's email service only allows a few emails per hour.

try {
  process.loadEnvFile(".env.local");
} catch {
  // Missing .env.local: the tests below skip.
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const run = crypto.randomUUID().slice(0, 8);
const password = `e2e-${crypto.randomUUID()}`;
const accounts = {
  student: { email: `e2e-${run}-student@example.com`, name: "Riley Student" },
  tutor: { email: `e2e-${run}-tutor@example.com`, name: "Morgan Tutor" },
};
const createdIds: string[] = [];

test.skip(!url || !secretKey, "Needs Supabase settings in .env.local");

function adminClient() {
  return createClient(url!, secretKey!, { auth: { persistSession: false, autoRefreshToken: false } });
}

test.beforeAll(async () => {
  const admin = adminClient();
  for (const [role, account] of Object.entries(accounts)) {
    const { data, error } = await admin.auth.admin.createUser({
      email: account.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: account.name,
        role,
        timezone: "America/Chicago",
        confirmed_adult: true,
        accepted_terms: true,
      },
    });
    if (error) throw error;
    createdIds.push(data.user.id);
  }
});

test.afterAll(async () => {
  const admin = adminClient();
  for (const id of createdIds) await admin.auth.admin.deleteUser(id);
});

async function logIn(page: import("@playwright/test").Page, email: string, pass = password) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(pass);
  await page.getByRole("button", { name: "Log in" }).click();
}

test("logged-out visitors are sent to log in, then back where they were going", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);

  await logIn(page, accounts.student.email);
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Welcome, Riley" })).toBeVisible();
  await expect(page.getByText("Times are shown in America/Chicago.")).toBeVisible();
});

test("students can't open the tutor dashboard", async ({ page }) => {
  await page.goto("/login");
  await logIn(page, accounts.student.email);
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/tutor");
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("tutors land on the tutor dashboard, and logging out ends the session", async ({ page }) => {
  await page.goto("/login");
  await logIn(page, accounts.tutor.email);
  await expect(page).toHaveURL(/\/tutor$/);
  await expect(page.getByRole("heading", { name: "Hi, Morgan" })).toBeVisible();

  // Logged-in people visiting the login page go straight to their dashboard.
  await page.goto("/login");
  await expect(page).toHaveURL(/\/tutor$/);

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();

  await page.goto("/tutor");
  await expect(page).toHaveURL(/\/login\?next=%2Ftutor$/);
});

test("a wrong password shows an error and keeps the email", async ({ page }) => {
  await page.goto("/login");
  await logIn(page, accounts.student.email, "definitely-not-the-password");
  // Scoped to the form: Next.js also adds a hidden role="alert" route announcer.
  await expect(page.locator("form").getByRole("alert")).toHaveText(
    "That email and password don't match an account.",
  );
  await expect(page.getByLabel("Email")).toHaveValue(accounts.student.email);
});

test("the sign-up form explains what's missing and keeps what was typed", async ({ page }) => {
  await page.goto("/signup?role=tutor");
  await expect(page.getByRole("radio", { name: /Tutor/ })).toBeChecked();

  await page.getByLabel("Full name").fill("Casey Example");
  await page.getByLabel("Email").fill("casey@example.com");
  await page.getByLabel("Password").fill("short");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByText("Use at least 10 characters.")).toBeVisible();
  await expect(page.getByText("You must be 18 or older to use TutorLink.")).toBeVisible();
  await expect(page.getByText("Accept the terms to create an account.")).toBeVisible();
  await expect(page.getByLabel("Full name")).toHaveValue("Casey Example");
  await expect(page.getByLabel("Email")).toHaveValue("casey@example.com");
  await expect(page.getByRole("radio", { name: /Tutor/ })).toBeChecked();
});
