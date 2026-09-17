import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/lib/supabase/database.types";

// Runs against the Supabase dev project to prove the database's security rules
// hold, independent of the app's code. Creates throwaway users (no emails are
// sent) and deletes them afterward.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const configured = Boolean(url && publishableKey && secretKey);

const noSession = { auth: { persistSession: false, autoRefreshToken: false } };

describe.skipIf(!configured)("profiles security", () => {
  // The secret key bypasses row-level security. It's used only to set up and
  // check test data, never to make the assertions being tested.
  const admin = createClient<Database>(url!, secretKey!, noSession);
  const run = crypto.randomUUID().slice(0, 8);
  const password = `test-${crypto.randomUUID()}`;
  const createdUserIds: string[] = [];

  const signUpMetadata = (role: string) => ({
    full_name: `Test ${role} ${run}`,
    role,
    timezone: "America/Chicago",
    confirmed_adult: true,
    accepted_terms: true,
  });

  async function createTestUser(label: string, metadata: Record<string, unknown>) {
    const { data, error } = await admin.auth.admin.createUser({
      email: `profiles-test-${run}-${label}@example.com`,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });
    if (data.user) createdUserIds.push(data.user.id);
    return { user: data.user, error };
  }

  async function logInAs(email: string) {
    const client = createClient<Database>(url!, publishableKey!, noSession);
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return client;
  }

  let studentId: string;
  let tutorId: string;
  let student: Awaited<ReturnType<typeof logInAs>>;

  beforeAll(async () => {
    const s = await createTestUser("student", signUpMetadata("student"));
    const t = await createTestUser("tutor", signUpMetadata("tutor"));
    if (!s.user || !t.user) throw s.error ?? t.error;
    studentId = s.user.id;
    tutorId = t.user.id;
    student = await logInAs(s.user.email!);
  });

  afterAll(async () => {
    for (const id of createdUserIds) {
      await admin.auth.admin.deleteUser(id);
    }
  });

  it("creates a profile with the chosen role and timezone at sign-up", async () => {
    const { data, error } = await student
      .from("profiles")
      .select("full_name, role, timezone, confirmed_adult_at, accepted_terms_at")
      .eq("id", studentId)
      .single();
    expect(error).toBeNull();
    expect(data).toMatchObject({
      full_name: `Test student ${run}`,
      role: "student",
      timezone: "America/Chicago",
    });
    expect(data?.confirmed_adult_at).toBeTruthy();
    expect(data?.accepted_terms_at).toBeTruthy();
  });

  it("lets a logged-in person read only their own profile", async () => {
    const all = await student.from("profiles").select("id");
    expect(all.data?.map((row) => row.id)).toEqual([studentId]);

    const other = await student.from("profiles").select("id").eq("id", tutorId);
    expect(other.data).toEqual([]);
  });

  it("hides every profile from logged-out visitors", async () => {
    const visitor = createClient<Database>(url!, publishableKey!, noSession);
    const { data, error } = await visitor.from("profiles").select("id");
    expect(data).toBeNull();
    expect(error?.code).toBe("42501"); // permission denied
  });

  it("lets a person rename themselves but not anyone else", async () => {
    const own = await student
      .from("profiles")
      .update({ full_name: `Renamed ${run}` })
      .eq("id", studentId)
      .select("full_name");
    expect(own.data).toEqual([{ full_name: `Renamed ${run}` }]);

    const others = await student
      .from("profiles")
      .update({ full_name: "Changed by someone else" })
      .eq("id", tutorId)
      .select("id");
    expect(others.data).toEqual([]);

    const tutorRow = await admin.from("profiles").select("full_name").eq("id", tutorId).single();
    expect(tutorRow.data?.full_name).toBe(`Test tutor ${run}`);
  });

  it("blocks people from changing their own role", async () => {
    const { error } = await student
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", studentId);
    expect(error?.code).toBe("42501");

    const row = await admin.from("profiles").select("role").eq("id", studentId).single();
    expect(row.data?.role).toBe("student");
  });

  it("blocks people from creating or deleting profiles directly", async () => {
    const insert = await student.from("profiles").insert({
      id: crypto.randomUUID(),
      full_name: "Fake",
      role: "admin",
      confirmed_adult_at: new Date().toISOString(),
      accepted_terms_at: new Date().toISOString(),
    });
    expect(insert.error?.code).toBe("42501");

    await student.from("profiles").delete().eq("id", studentId);
    const row = await admin.from("profiles").select("id").eq("id", studentId).maybeSingle();
    expect(row.data?.id).toBe(studentId);
  });

  it("rejects sign-ups that skip the 18+ confirmation or the terms", async () => {
    const underage = await createTestUser("no-adult", {
      ...signUpMetadata("student"),
      confirmed_adult: false,
    });
    expect(underage.user).toBeNull();
    expect(underage.error).not.toBeNull();

    const noTerms = await createTestUser("no-terms", {
      ...signUpMetadata("student"),
      accepted_terms: undefined,
    });
    expect(noTerms.user).toBeNull();
    expect(noTerms.error).not.toBeNull();
  });

  it("never lets someone sign up as an admin", async () => {
    const result = await createTestUser("admin", signUpMetadata("admin"));
    expect(result.user).toBeNull();
    expect(result.error).not.toBeNull();
  });
});
