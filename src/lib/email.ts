import { supabase } from "@/integrations/supabase/client";

export type SendEmailPayload = {
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
};

export async function sendEmail(payload: SendEmailPayload) {
  const { data, error } = await supabase.functions.invoke("send-email", {
    body: payload,
  });
  if (error) throw error;
  return data as { id: string; status: string };
}

// Convenience helper for simple text emails with branded HTML fallback
export async function sendTextEmail(to: string | string[], subject: string, text: string) {
  const recipients = Array.isArray(to) ? to : [to];
  return sendEmail({ to: recipients, subject, text });
}
