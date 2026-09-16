// Admin user administration for the helpdesk.
//
// Security model:
//  - The caller's JWT is verified first, and only a signed-in siyakha_admin or
//    super_admin may list or create users.
//  - The temporary password is used once against the auth provider and is never
//    written to a table, a log line or the response.
//  - Roles are stored only in public.user_roles, never on a profile row.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const ROLE_MAP: Record<string, string> = {
  admin: "siyakha_admin",
  technician: "engineer",
  client: "client_viewer",
};

const LABEL_BY_ROLE: Record<string, string> = {
  siyakha_admin: "Admin",
  super_admin: "Admin",
  engineer: "Technician",
  partner_engineer: "Technician",
  client_admin: "Client",
  client_editor: "Client",
  client_viewer: "Client",
};

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const caller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false },
  });

  const { data: me } = await caller.auth.getUser();
  if (!me?.user) return json({ error: "Unauthorized" }, 401);

  const { data: myRoles } = await admin.from("user_roles").select("role").eq("user_id", me.user.id);
  const isAdmin = (myRoles ?? []).some((r: any) => r.role === "siyakha_admin" || r.role === "super_admin");
  if (!isAdmin) return json({ error: "Forbidden" }, 403);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid body" }, 400);
  }
  const action = str(body.action, 20) || "list";

  if (action === "list") {
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) return json({ error: "Users could not be listed" }, 500);
    const { data: roles } = await admin.from("user_roles").select("user_id, role");
    const users = (data.users ?? []).map((u) => {
      const mine = (roles ?? []).filter((r: any) => r.user_id === u.id).map((r: any) => r.role);
      return {
        id: u.id,
        email: u.email ?? "",
        name: (u.user_metadata as any)?.full_name ?? "",
        roles: mine,
        role_labels: Array.from(new Set(mine.map((r: string) => LABEL_BY_ROLE[r] ?? r))),
        last_sign_in_at: u.last_sign_in_at ?? null,
        created_at: u.created_at,
      };
    });
    return json({ users });
  }

  if (action === "create") {
    const email = str(body.email, 200).toLowerCase();
    const name = str(body.name, 160);
    const userType = str(body.user_type, 20);
    const password = typeof body.password === "string" ? body.password : "";
    const role = ROLE_MAP[userType];
    if (!email || !role) return json({ error: "Email and user type are required" }, 400);
    if (password.length < 10) return json({ error: "Use a temporary password of at least 10 characters" }, 400);

    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, must_change_password: true },
    });
    if (error || !created.user) return json({ error: error?.message ?? "User could not be created" }, 400);

    const { error: roleError } = await admin.from("user_roles").insert({ user_id: created.user.id, role });
    if (roleError) return json({ error: "User created but the role could not be set" }, 500);

    return json({ id: created.user.id, email, role, user_type: userType });
  }

  if (action === "set_type") {
    const userId = str(body.user_id, 60);
    const userType = str(body.user_type, 20);
    const role = ROLE_MAP[userType];
    if (!userId || !role) return json({ error: "Missing user or type" }, 400);
    // Replace only the roles this screen manages, so bespoke roles stay untouched.
    await admin.from("user_roles").delete().eq("user_id", userId).in("role", Object.values(ROLE_MAP));
    const { error } = await admin.from("user_roles").insert({ user_id: userId, role });
    if (error) return json({ error: "Role could not be changed" }, 500);
    return json({ ok: true });
  }

  return json({ error: "Unsupported action" }, 400);
});
