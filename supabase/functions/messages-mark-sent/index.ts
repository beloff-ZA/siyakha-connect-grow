import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type MarkPayload = {
  message_id?: string;
  ticket_id?: string;
};

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

  let payload: MarkPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const { message_id, ticket_id } = payload || {};
  if (!message_id && !ticket_id) {
    return new Response(JSON.stringify({ error: "Provide message_id or ticket_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  let targetMessageId = message_id;

  if (!targetMessageId && ticket_id) {
    // Find latest pending_send outbound WA message for the ticket
    const { data: msg, error: selErr } = await supabase
      .from("ticket_messages")
      .select("id")
      .eq("ticket_id", ticket_id)
      .eq("direction", "outbound")
      .eq("channel", "whatsapp")
      .eq("status", "pending_send")
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (selErr) {
      return new Response(JSON.stringify({ error: selErr.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (!msg?.id) {
      return new Response(JSON.stringify({ error: "No pending message found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    targetMessageId = msg.id;
  }

  // Mark as sent_manual and stamp timestamp in metadata
  const sentAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("ticket_messages")
    .update({ status: "sent_manual", metadata: { sent_at: sentAt } })
    .eq("id", targetMessageId as string)
    .select("id, status")
    .maybeSingle();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  return new Response(JSON.stringify({ id: data?.id, status: data?.status || "sent_manual" }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});
