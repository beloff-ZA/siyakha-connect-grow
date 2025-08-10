export function buildWhatsAppUrl(phoneE164: string, message: string) {
  const phone = phoneE164.replace(/^\+/, "");
  const text = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${text}`;
}

import { supabase } from "@/integrations/supabase/client";

export async function sendViaWhatsApp(params: {
  phoneE164: string;
  message: string;
  ticketId: string;
  trackingRef?: string;
}) {
  const { phoneE164, message, ticketId, trackingRef } = params;
  const { data, error } = await supabase.functions.invoke("messages-intent", {
    body: { ticket_id: ticketId, phoneE164, message, tracking_ref: trackingRef ?? null },
  });
  if (error) throw error;
  const url = buildWhatsAppUrl(phoneE164, message);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  return { messageId: (data as any)?.id as string | undefined, url, opened: !!win };
}

export async function markWhatsAppSent(params: { messageId?: string; ticketId?: string }) {
  const { data, error } = await supabase.functions.invoke("messages-mark-sent", {
    body: params,
  });
  if (error) throw error;
  return data as { id: string; status: string };
}
