import { supabase } from "@/integrations/supabase/client";

export type NewTicket = {
  summary: string;
  details?: string | null;
  service_category_id?: string | null;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  location?: string | null;
};

export async function createTicket(userId: string, payload: NewTicket) {
  const { data, error } = await supabase
    .from("tickets")
    .insert({
      company_id: null,
      created_by_user_id: userId,
      channel: "portal",
      summary: payload.summary,
      details: payload.details ?? null,
      service_category_id: payload.service_category_id ?? null,
      priority: payload.priority ?? "normal",
      location: payload.location ?? null,
      tracking_ref: `TCK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    })
    .select("id, tracking_ref")
    .maybeSingle();
  if (error) throw error;
  return data as { id: string; tracking_ref: string } | null;
}

export async function getTicketMessages(ticketId: string) {
  const { data, error } = await supabase
    .from("ticket_messages")
    .select("id, direction, channel, to_from, subject, body, status, created_at, metadata")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getMyTickets() {
  const { data, error } = await supabase
    .from("tickets")
    .select("id, summary, status, created_at, tracking_ref, priority")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getTicketById(id: string) {
  const { data, error } = await supabase
    .from("tickets")
    .select("id, summary, status, created_at, tracking_ref, details, location")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
