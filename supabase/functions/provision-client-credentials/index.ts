import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

/** Server-generated strong password. Never accepted from the client. */
const generatePassword = () => {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%&*?";
  const all = upper + lower + digits + symbols;
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const pick = (set: string, i: number) => set[bytes[i] % set.length];
  const core = [pick(upper, 0), pick(lower, 1), pick(digits, 2), pick(symbols, 3)];
  for (let i = 4; i < 20; i++) core.push(pick(all, i));
  return core.sort(() => (crypto.getRandomValues(new Uint8Array(1))[0] % 2 ? 1 : -1)).join("");
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { client_user_id } = (await req.json()) as { client_user_id?: string };
    if (!client_user_id) return json({ error: "Missing client_user_id" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: userData, error: userErr } = await caller.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);

    const { data: adminRow } = await admin
      .from("user_roles")
      .select("id")
      .eq("user_id", userData.user.id)
      .in("role", ["siyakha_admin", "admin"])
      .maybeSingle();
    if (!adminRow) return json({ error: "Forbidden" }, 403);

    const { data: clientUser } = await admin
      .from("portal_client_users")
      .select("id, email, full_name, user_id")
      .eq("id", client_user_id)
      .maybeSingle();
    if (!clientUser) return json({ error: "Client user not found" }, 404);

    const password = generatePassword();
    const email = String(clientUser.email).toLowerCase();

    let authUserId: string | null = clientUser.user_id ?? null;
    if (!authUserId) {
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      authUserId = list?.users.find((u) => (u.email ?? "").toLowerCase() === email)?.id ?? null;
    }

    if (authUserId) {
      const { error } = await admin.auth.admin.updateUserById(authUserId, {
        password,
        email_confirm: true,
      });
      if (error) return json({ error: error.message }, 500);
    } else {
      const { data: created, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: clientUser.full_name ?? undefined },
      });
      if (error) return json({ error: error.message }, 500);
      authUserId = created.user?.id ?? null;
    }

    await admin
      .from("portal_client_users")
      .update({ user_id: authUserId, status: "active" })
      .eq("id", clientUser.id);

    // Password is returned once to the requesting admin only; it is never logged.
    return json({ success: true, email, password, user_id: authUserId });
  } catch (e) {
    console.error("provision-client-credentials error", e instanceof Error ? e.message : e);
    return json({ error: "Server error" }, 500);
  }
});
