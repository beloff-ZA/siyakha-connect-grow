import { supabase } from "@/integrations/supabase/client";

export const CALL_STATUSES = [
  "new",
  "acknowledged",
  "scheduled",
  "on_site",
  "work_complete",
  "awaiting_signoff",
  "signed_off",
  "cancelled",
] as const;
export type CallStatus = (typeof CALL_STATUSES)[number];

export const CALL_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export type LoggedCall = {
  id: string;
  call_ref: string;
  sit_number: string | null;
  logging_customer: string | null;
  client_email: string | null;
  /** Person who logged the call — receives progress update emails. */
  logging_contact_name: string | null;
  logging_contact_email: string | null;
  /** Master on/off for update emails to the logging contact. */
  update_emails_enabled: boolean;
  customer_order_ref: string | null;
  end_customer_company: string;
  end_customer_first_name: string | null;
  end_customer_last_name: string | null;
  contact_number: string | null;
  contact_email: string | null;
  site_address: string | null;
  city: string | null;
  fault_description: string | null;
  special_instructions: string | null;
  engineer_name: string | null;
  status: CallStatus | string;
  priority: string;
  logged_at: string;
  scheduled_at: string | null;
  arrival_at: string | null;
  departure_at: string | null;
  opening_km: number | null;
  closing_km: number | null;
  fault_solution: string | null;
  change_control: string | null;
  internal_notes: string | null;
  /** On-site survey sheet (cabinet + LAN), see src/lib/siteSurvey.ts. */
  site_survey: unknown | null;
  signoff_token: string;
  signoff_status: string;
  signed_by_name: string | null;
  signed_by_email: string | null;
  signature_data: string | null;
  satisfaction_rating: number | null;
  signoff_comment: string | null;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LoggedCallItem = {
  id: string;
  call_id: string;
  description: string;
  quantity: number;
  serial_number: string | null;
  sort_order: number;
};

export function statusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Kilometres travelled, or null when odometer readings are incomplete/invalid. */
export function totalKm(opening: number | null | undefined, closing: number | null | undefined) {
  if (opening === null || opening === undefined || closing === null || closing === undefined) return null;
  const diff = Number(closing) - Number(opening);
  if (!Number.isFinite(diff) || diff < 0) return null;
  return diff;
}

/** Time on site in minutes, or null when arrival/departure are incomplete/invalid. */
export function timeOnSiteMinutes(arrival?: string | null, departure?: string | null) {
  if (!arrival || !departure) return null;
  const a = new Date(arrival).getTime();
  const d = new Date(departure).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(d) || d < a) return null;
  return Math.round((d - a) / 60000);
}

export function formatDuration(minutes: number | null) {
  if (minutes === null) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} hrs ${m} min`;
}

export function customerName(call: Pick<LoggedCall, "end_customer_first_name" | "end_customer_last_name">) {
  return [call.end_customer_first_name, call.end_customer_last_name].filter(Boolean).join(" ").trim();
}

/** Fields the engineer must complete before a sign-off link is worth sending. */
export function signoffReadiness(call: LoggedCall) {
  const missing: string[] = [];
  if (!call.fault_solution?.trim()) missing.push("Work done / fault solution");
  if (!call.arrival_at) missing.push("Arrival date & time");
  if (!call.departure_at) missing.push("Departure date & time");
  return { ready: missing.length === 0, missing };
}

export function signoffUrl(token: string) {
  return `${window.location.origin}/sign-off/${token}`;
}

function nextRefSuffix() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

export async function listCalls() {
  const { data, error } = await supabase
    .from("logged_calls")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as LoggedCall[];
}

export async function getCall(id: string) {
  const { data, error } = await supabase.from("logged_calls").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as unknown as LoggedCall) || null;
}

export async function createCall(payload: Partial<LoggedCall>, userId?: string | null) {
  const { data, error } = await supabase
    .from("logged_calls")
    .insert({
      call_ref: `CALL-${new Date().getFullYear()}-${nextRefSuffix()}`,
      end_customer_company: payload.end_customer_company || "Unnamed customer",
      ...payload,
      created_by: userId ?? null,
    } as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as LoggedCall;
}

export async function updateCall(id: string, patch: Partial<LoggedCall>) {
  const { error } = await supabase.from("logged_calls").update(patch as never).eq("id", id);
  if (error) throw error;
}

export type CallUpdateEvent = "created" | "status";

/** Well-known service desks that email us job cards — prefills the logging contact. */
export const KNOWN_LOGGING_CONTACTS: { match: RegExp; name: string; email: string }[] = [
  { match: /satio/i, name: "Danelle van den Berg", email: "support@satio.co.za" },
];

export function knownLoggingContact(loggingCustomer?: string | null) {
  if (!loggingCustomer) return null;
  return KNOWN_LOGGING_CONTACTS.find((k) => k.match.test(loggingCustomer)) ?? null;
}

/**
 * Emails the person who logged the call about progress (created, status change).
 * Uses the branded app-email queue; never throws — email must not block saving.
 */
export async function notifyCallUpdate(call: LoggedCall, event: CallUpdateEvent, detail?: string) {
  try {
    if (call.update_emails_enabled === false) return;
    const recipient = call.logging_contact_email?.trim();
    if (!recipient) return;
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "logged-call-update",
        recipientEmail: recipient,
        idempotencyKey: `call-update-${call.id}-${event}-${detail ?? call.status}`,
        templateData: {
          contactName: call.logging_contact_name ?? "",
          callRef: call.call_ref,
          sitNumber: call.sit_number ?? "",
          loggingCustomer: call.logging_customer ?? "",
          endCustomer: call.end_customer_company,
          site: [call.site_address, call.city].filter(Boolean).join(", "),
          status: statusLabel(call.status),
          engineer: call.engineer_name ?? "",
          event,
          detail: detail ?? "",
          scheduledAt: call.scheduled_at ?? "",
        },
      },
    });
  } catch (e) {
    console.warn("call update email not sent", e);
  }
}

export async function deleteCall(id: string) {
  const { error } = await supabase.from("logged_calls").delete().eq("id", id);
  if (error) throw error;
}

export async function listItems(callId: string) {
  const { data, error } = await supabase
    .from("logged_call_items")
    .select("*")
    .eq("call_id", callId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []) as unknown as LoggedCallItem[];
}

export async function addItem(callId: string, item: { description: string; quantity: number; serial_number?: string | null; sort_order?: number }) {
  const { error } = await supabase.from("logged_call_items").insert({ call_id: callId, ...item } as never);
  if (error) throw error;
}

export async function removeItem(id: string) {
  const { error } = await supabase.from("logged_call_items").delete().eq("id", id);
  if (error) throw error;
}

/** Public sign-off page: fetch the customer-safe job card by token. */
export async function fetchSignoffCard(token: string) {
  const { data, error } = await supabase.functions.invoke("job-card-signoff", {
    body: { action: "fetch", token },
  });
  if (error) throw error;
  return data as {
    ok: boolean;
    error?: string;
    card?: Record<string, unknown>;
    items?: { description: string; quantity: number; serial_number: string | null }[];
    already_signed?: boolean;
  };
}

export async function submitSignoff(input: {
  token: string;
  signed_by_name: string;
  signed_by_email?: string;
  signature_data: string;
  satisfaction_rating: number;
  signoff_comment?: string;
  /** Optional signing moment as captured on the sheet (ISO). Defaults to now. */
  signed_at?: string;
}) {
  const { data, error } = await supabase.functions.invoke("job-card-signoff", {
    body: { action: "sign", ...input },
  });
  if (error) throw error;
  return data as { ok: boolean; error?: string; already_signed?: boolean; signed_at?: string };
}

/** Re-send the signed Satio sheet by email. Staff only; changes no data. */
export async function resendSignoffSheet(token: string) {
  const { data, error } = await supabase.functions.invoke("job-card-signoff", {
    body: { action: "resend", token },
  });
  if (error) throw error;
  return data as { ok: boolean; error?: string; sent_to?: string[] };
}

/* ---------- Attachments (uploaded forms, photos, signed PDFs) ---------- */

export const CALL_FILES_BUCKET = "job-card-files";

export type LoggedCallAttachment = {
  id: string;
  call_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  label: string | null;
  created_at: string;
};

export const listAttachments = async (callId: string): Promise<LoggedCallAttachment[]> => {
  const { data, error } = await supabase
    .from("logged_call_attachments")
    .select("*")
    .eq("call_id", callId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LoggedCallAttachment[];
};

const safeName = (name: string) => name.replace(/[^\w.\-]+/g, "_").slice(-120);

export const uploadAttachment = async (
  callId: string,
  file: File,
  label?: string | null,
): Promise<LoggedCallAttachment> => {
  const path = `${callId}/${Date.now()}-${safeName(file.name)}`;
  const { error: upErr } = await supabase.storage
    .from(CALL_FILES_BUCKET)
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (upErr) throw upErr;

  const { data, error } = await supabase
    .from("logged_call_attachments")
    .insert({
      call_id: callId,
      file_name: file.name,
      storage_path: path,
      mime_type: file.type || null,
      size_bytes: file.size,
      label: label?.trim() || null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as LoggedCallAttachment;
};

export const attachmentLink = async (storagePath: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(CALL_FILES_BUCKET)
    .createSignedUrl(storagePath, 60 * 30);
  if (error) throw error;
  return data.signedUrl;
};

export const removeAttachment = async (att: LoggedCallAttachment): Promise<void> => {
  await supabase.storage.from(CALL_FILES_BUCKET).remove([att.storage_path]);
  const { error } = await supabase.from("logged_call_attachments").delete().eq("id", att.id);
  if (error) throw error;
};

export const formatFileSize = (bytes?: number | null): string => {
  if (!bytes || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
