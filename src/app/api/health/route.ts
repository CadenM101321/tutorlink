import { createClient } from "@/lib/supabase/server";

// GET /api/health: confirms the app can reach the Supabase database.
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("health_check");

  const database = !error && data === "ok" ? "ok" : "unreachable";
  return Response.json(
    { app: "ok", database },
    {
      status: database === "ok" ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
