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

/**
 * TESTING-ONLY admin operation.
 * Creates or resets a client portal login WITHOUT sending any email.
 * The plaintext password is never logged, stored, echoed back or forwarded.
 */
const passwordProblem = (password: unknown): string | null => {
  if (typeof password !== "string") return "Password is required.";
  if (password.length < 10) return "Password must be at least 10 characters.";
  if (!/[a-z]/.test(password)) return "Password must include a lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must include a number.";
  return null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceRoleKey);

  // Audit helper — records the actor, target and outcome only. Never secrets.
  const audit = async (
    actor: string | null,
    targetId: string | null,
    email: string | null,
    action: string,
    outcome: string,
    notes?: string,
  ) => {
    try {
      await admin.from("portal_admin_audit").insert({
        actor_user_id: actor,
        target_client_user_id: targetId,
        target_email: email,
        action,
        outcome,
        notes: notes ?? null,
      });
    } catch {
      /* auditing must never block the operation result */
    }
  };

  try {
    // NOTE: the request body contains a plaintext password — never log it.
    const body = (await req.json()) as {
      client_user_id?: string;
      password?: string;
      confirm_password?: string;
      require_password_change?: boolean;
      action?: "activate" | "reset";
    };

    const clientUserId = body.client_user_id;
    const action = body.action === "reset" ? "reset" : "activate";
    const requireChange = body.require_password_change === true;

    if (!clientUserId) return json({ error: "Missing client_user_id" }, 400);
    if (body.confirm_password !== undefined && body.confirm_password !== body.password) {
      return json({ error: "Passwords do not match." }, 400);
    }
    const problem = passwordProblem(body.password);
    if (problem) return json({ error: problem }, 400);
    const password = body.password as string;

    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });
    const { data: userData, error: userErr } = await caller.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);
    const actorId = userData.user.id;

    const { data: adminRow } = await admin
      .from("user_roles")
      .select("id")
      .eq("user_id", actorId)
      .in("role", ["siyakha_admin", "admin"])
      .maybeSingle();
    if (!adminRow) {
      await audit(actorId, clientUserId, null, `test_${action}`, "forbidden");
      return json({ error: "Forbidden" }, 403);
    }

    const { data: clientUser } = await admin
      .from("portal_client_users")
      .select("id, email, full_name, user_id")
      .eq("id", clientUserId)
      .maybeSingle();
    if (!clientUser) return json({ error: "Client user not found" }, 404);

    const email = String(clientUser.email).toLowerCase();

    // Reuse an existing auth user whenever one exists — never create a duplicate.
    let authUserId: string | null = clientUser.user_id ?? null;
    if (!authUserId) {
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      authUserId = list?.users.find((u) => (u.email ?? "").toLowerCase() === email)?.id ?? null;
    }

    const metadata = {
      full_name: clientUser.full_name ?? undefined,
      must_change_password: requireChange,
    };

    if (authUserId) {
      // updateUserById with a password does NOT trigger any email.
      const { error } = await admin.auth.admin.updateUserById(authUserId, {
        password,
        email_confirm: true,
        user_metadata: metadata,
      });
      if (error) {
        await audit(actorId, clientUser.id, email, `test_${action}`, "failed", error.message);
        return json({ error: error.message }, 500);
      }
    } else {
      if (action === "reset") return json({ error: "No login exists for this client user yet." }, 404);
      // createUser with email_confirm does NOT send a confirmation or invite email.
      const { data: created, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata,
      });
      if (error) {
        await audit(actorId, clientUser.id, email, `test_${action}`, "failed", error.message);
        return json({ error: error.message }, 500);
      }
      authUserId = created.user?.id ?? null;
    }

    // Link the portal record. Project assignments are intentionally left untouched.
    await admin
      .from("portal_client_users")
      .update({ user_id: authUserId, status: "active", activated_at: new Date().toISOString() })
      .eq("id", clientUser.id);

    await audit(
      actorId,
      clientUser.id,
      email,
      `test_${action}`,
      "success",
      requireChange ? "password change required at next login" : null,
    );

    // Deliberately no password in the response.
    return json({
      success: true,
      email,
      user_id: authUserId,
      require_password_change: requireChange,
      emails_sent: false,
    });
  } catch (e) {
    // Only the error type/message is logged — never the request body.
    console.error("provision-client-test-account error:", e instanceof Error ? e.message : "unknown");
    return json({ error: "Server error" }, 500);
  }
});
