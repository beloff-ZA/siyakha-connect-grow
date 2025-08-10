import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type IntentPayload = {
  ticket_id: string;
  phoneE164: string;
  message: string;
  tracking_ref?: string | null;
};

function buildWhatsAppUrl(phoneE164: string, message: string) {
  const phone = phoneE164.replace(/^\+/, "");
  const text = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${text}`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new Response(JSON.stringify({ error: "Server not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const authHeader = req.headers.get("Authorization");
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader ?? "" } },
  });

  let payload: IntentPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const { ticket_id, phoneE164, message, tracking_ref } = payload || ({} as IntentPayload);
  if (!ticket_id || !phoneE164 || !message) {
    return new Response(JSON.stringify({ error: "ticket_id, phoneE164 and message are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const waUrl = buildWhatsAppUrl(phoneE164, message);

  // Insert outbound intent (RLS ensures user can write to this ticket)
  const { data, error } = await supabase
    .from("ticket_messages")
    .insert({
      ticket_id,
      direction: "outbound",
      channel: "whatsapp",
      to_from: phoneE164,
      subject: null,
      body: message,
      status: "pending_send",
      metadata: { mode: "popout", url: waUrl, tracking_ref: tracking_ref ?? null },
    })
    .select("id")
    .maybeSingle();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  return new Response(JSON.stringify({ id: data?.id, status: "logged", url: waUrl }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});
