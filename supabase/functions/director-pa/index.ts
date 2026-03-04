import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Auth: get user from JWT
    const authHeader = req.headers.get("authorization") || "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();

    // Fetch all director context in parallel
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const twoWeeksAhead = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const [diaryRes, eventsRes, projectsRes, costsRes] = await Promise.all([
      supabase
        .from("diary_entries")
        .select("title, content, mood, tags, entry_date")
        .order("entry_date", { ascending: false })
        .limit(20),
      supabase
        .from("calendar_events")
        .select("title, description, start_time, end_time, all_day, location, category")
        .gte("start_time", twoWeeksAgo)
        .lte("start_time", twoWeeksAhead)
        .order("start_time"),
      supabase
        .from("director_projects")
        .select("title, client, status, priority, estimated_value, start_date, due_date, description")
        .in("status", ["pipeline", "proposal", "active", "on_hold"])
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("director_costs")
        .select("title, amount, category, vendor, date, status")
        .order("date", { ascending: false })
        .limit(30),
    ]);

    const diaryEntries = diaryRes.data || [];
    const calendarEvents = eventsRes.data || [];
    const projects = projectsRes.data || [];
    const costs = costsRes.data || [];

    const contextBlock = `
## CURRENT DATE & TIME
${now.toISOString()} (${now.toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })})

## RECENT DIARY ENTRIES (last 2 weeks)
${diaryEntries.length === 0 ? "No diary entries found." : diaryEntries.map(d =>
  `- **${d.entry_date} — ${d.title}**${d.mood ? ` (Mood: ${d.mood})` : ""}${d.tags?.length ? ` [${d.tags.join(", ")}]` : ""}\n  ${d.content || "(no content)"}`
).join("\n\n")}

## CALENDAR EVENTS (past week + next 2 weeks)
${calendarEvents.length === 0 ? "No calendar events found." : calendarEvents.map(e => {
  const start = new Date(e.start_time);
  const timeStr = e.all_day ? "All day" : start.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
  const dateStr = start.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" });
  return `- **${dateStr}, ${timeStr} — ${e.title}** [${e.category}]${e.location ? ` @ ${e.location}` : ""}${e.description ? `\n  ${e.description}` : ""}`;
}).join("\n")}

## ACTIVE PROJECTS PIPELINE
${projects.length === 0 ? "No active projects." : projects.map(p =>
  `- **${p.title}** (${p.status}, ${p.priority} priority)${p.client ? ` — Client: ${p.client}` : ""}${p.estimated_value ? ` — R${Number(p.estimated_value).toLocaleString()}` : ""}${p.due_date ? ` — Due: ${p.due_date}` : ""}${p.description ? `\n  ${p.description}` : ""}`
).join("\n")}

## RECENT COSTS & EXPENSES (last 30)
${costs.length === 0 ? "No costs recorded." : (() => {
  const total = costs.reduce((s, c) => s + Number(c.amount), 0);
  const pending = costs.filter(c => c.status === "pending").reduce((s, c) => s + Number(c.amount), 0);
  return `Total: R${total.toLocaleString()} | Pending: R${pending.toLocaleString()}\n` +
    costs.map(c => `- ${c.date} — **${c.title}** R${Number(c.amount).toLocaleString()} [${c.category}] (${c.status})${c.vendor ? ` — ${c.vendor}` : ""}`).join("\n");
})()}
`.trim();

    const systemPrompt = `You are the personal AI assistant for Nikita, the Director of Siyakha Technology Solutions — an ICT company based in Johannesburg, South Africa.

Your role is to:
- Help plan the director's day based on calendar events, projects, costs, and diary context
- Draft professional communications (emails, WhatsApp messages, proposals)
- Suggest follow-ups based on diary entries and upcoming meetings
- Provide strategic business advice relevant to the ICT industry
- Track project pipeline health and flag overdue or high-priority items
- Summarise spending patterns and flag cost concerns
- Help with time management and prioritisation

Always be professional but approachable. Use South African business context where relevant (ZAR currency, local terminology). Be concise and actionable. When discussing financials, use "R" for Rand.

Here is the director's current context:

${contextBlock}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up in workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("director-pa error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
