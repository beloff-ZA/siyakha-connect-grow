// Lets the office copy an already-issued technician / client link again later,
// without ever storing a usable link in the database.
//
// Security model:
//  - The caller must be a signed-in Siyakha admin; nothing else is served.
//  - The link itself is stored only as AES-GCM ciphertext, encrypted with a
//    server-only key (SHARE_LINK_KEY). A database reader cannot use it.
//  - "store" only accepts a token whose SHA-256 matches the row's stored hash,
//    so no one can plant a different link on an existing row.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const unb64 = (value: string) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

const aesKey = async () => {
  const secret = Deno.env.get("SHARE_LINK_KEY");
  if (!secret) throw new Error("missing key");
  const raw = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
};

const encrypt = async (plain: string) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(), new TextEncoder().encode(plain)),
  );
  return `${b64(iv)}.${b64(cipher)}`;
};

const decrypt = async (stored: string) => {
  const [ivPart, cipherPart] = stored.split(".");
  if (!ivPart || !cipherPart) return null;
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: unb64(ivPart) },
      await aesKey(),
      unb64(cipherPart),
    );
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
};

const uuid = (v: unknown) =>
  typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v) ? v : null;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  const token = authHeader.replace(/^Bearer\s+/i, "");
  const { data: userRes } = await admin.auth.getUser(token);
  const userId = userRes?.user?.id;
  if (!userId) return json({ error: "Not signed in" }, 401);

  const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userId);
  const isAdmin = (roles ?? []).some((r: { role: string }) =>
    ["admin", "siyakha_admin", "super_admin"].includes(r.role),
  );
  if (!isAdmin) return json({ error: "Not allowed" }, 403);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid body" }, 400);
  }

  const action = typeof body.action === "string" ? body.action : "";
  const linkId = uuid(body.link_id);
  if (!linkId) return json({ error: "Invalid link" }, 400);

  const { data: link } = await admin
    .from("portal_share_links")
    .select("id, token_hash, token_cipher, revoked_at, expires_at")
    .eq("id", linkId)
    .maybeSingle();
  if (!link) return json({ error: "Link not found" }, 404);

  if (action === "store") {
    const plain = typeof body.token === "string" ? body.token : "";
    if (!/^[A-Za-z0-9_-]{20,120}$/.test(plain)) return json({ error: "Invalid token" }, 400);
    if ((await sha256(plain)) !== link.token_hash) return json({ error: "Token does not match" }, 400);
    const { error } = await admin
      .from("portal_share_links")
      .update({ token_cipher: await encrypt(plain) })
      .eq("id", linkId);
    if (error) return json({ error: "Could not store the link" }, 500);
    return json({ ok: true });
  }

  if (action === "reveal") {
    if (link.revoked_at) return json({ error: "This link was revoked" }, 400);
    if (!link.token_cipher) return json({ ok: false, reason: "not_stored" });
    const plain = await decrypt(link.token_cipher as string);
    if (!plain) return json({ ok: false, reason: "not_stored" });
    return json({ ok: true, token: plain });
  }

  return json({ error: "Unsupported action" }, 400);
});
