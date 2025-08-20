import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = "https://nhbnhcrpotqwqqqydign.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oYm5oY3Jwb3Rxd3FxcXlkaWduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NDE1NTgsImV4cCI6MjA3MDIxNzU1OH0._3-R3g6a1dD2lOMNyddj7Lqto3K93-MfpSWBc3ojSDw";

export async function inviteAdminUser(email: string, name?: string) {
  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr || !sessionData.session) throw new Error("Not authenticated");

  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/invite-admin-user`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionData.session.access_token}`,
        apikey: SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ email, name, make_superadmin: true }),
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed with ${res.status}`);
  }
  return res.json();
}
