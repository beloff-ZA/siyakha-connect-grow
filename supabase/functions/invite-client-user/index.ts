import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  client_user_id: string;
  redirect_to?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { client_user_id, redirect_to } = (await req.json()) as InviteRequest;
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

    const { data: clientUser, error: cuErr } = await admin
      .from("portal_client_users")
      .select("id, email, full_name, user_id")
      .eq("id", client_user_id)
      .maybeSingle();
    if (cuErr || !clientUser) return json({ error: "Client user not found" }, 404);

    const redirectTo = redirect_to && /^https?:\/\//.test(redirect_to) ? redirect_to : undefined;

    // Existing auth user with this email? Then send a password setup (recovery) link.
    let existingUserId: string | null = clientUser.user_id ?? null;
    if (!existingUserId) {
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      existingUserId =
        list?.users.find((u) => (u.email ?? "").toLowerCase() === clientUser.email.toLowerCase())?.id ??
        null;
    }

    if (existingUserId) {
      const { error: resetErr } = await admin.auth.resetPasswordForEmail(clientUser.email, {
        redirectTo,
      });
      if (resetErr) return json({ error: resetErr.message }, 500);
      await admin
        .from("portal_client_users")
        .update({ user_id: existingUserId, invited_at: new Date().toISOString(), status: "active" })
        .eq("id", clientUser.id);
      return json({ success: true, mode: "password_reset", user_id: existingUserId });
    }

    const { data: invite, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
      clientUser.email,
      { data: { full_name: clientUser.full_name ?? undefined }, redirectTo },
    );
    if (inviteErr) return json({ error: inviteErr.message }, 500);

    await admin
      .from("portal_client_users")
      .update({
        user_id: invite.user?.id ?? null,
        invited_at: new Date().toISOString(),
        status: "invited",
      })
      .eq("id", clientUser.id);

    return json({ success: true, mode: "invite", user_id: invite.user?.id ?? null });
  } catch (e) {
    console.error("invite-client-user error", e);
    return json({ error: "Server error" }, 500);
  }
});
