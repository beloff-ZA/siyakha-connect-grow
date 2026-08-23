import { supabase } from "@/integrations/supabase/client";
import type { DeliverySettings, DeliveryStage } from "./deliverySummary";
import { DEFAULT_DELIVERY_STAGES } from "./deliverySummary";
import type { BoqAcceptance, ClientNoteThread, DeckViewer, NoteStatus } from "./deckViewer";

/**
 * Admin-side data access for the "Client engagement" workspace section.
 *
 * Viewer contact details and acceptance snapshots are readable by project
 * administrators only (enforced by row-level security). Acceptance rows are
 * append-only at database level, so an ordinary edit can never overwrite an
 * accepted snapshot.
 */

const db = supabase as unknown as { from: (t: string) => any };

export async function loadEngagement(projectId: string): Promise<{
  viewers: DeckViewer[];
  acceptances: BoqAcceptance[];
  threads: ClientNoteThread[];
}> {
  const [v, a, t] = await Promise.all([
    db
      .from("portal_deck_viewers")
      .select("id, share_link_id, project_id, first_name, surname, email, consent_at, first_viewed_at, last_viewed_at")
      .eq("project_id", projectId)
      .order("last_viewed_at", { ascending: false }),
    db
      .from("portal_boq_acceptances")
      .select("*")
      .eq("project_id", projectId)
      .order("accepted_at", { ascending: false }),
    db
      .from("portal_client_note_threads")
      .select("id, project_id, share_link_id, viewer_id, category, subject, status, created_at, last_message_at")
      .eq("project_id", projectId)
      .order("last_message_at", { ascending: false }),
  ]);
  const first = [v, a, t].find((r: any) => r.error)?.error;
  if (first) throw new Error(first.message);

  const threadIds = (t.data ?? []).map((x: any) => x.id);
  let messages: any[] = [];
  if (threadIds.length) {
    const { data, error } = await db
      .from("portal_client_note_messages")
      .select("id, thread_id, project_id, author_kind, author_name, body, created_at")
      .in("thread_id", threadIds)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    messages = data ?? [];
  }

  return {
    viewers: (v.data ?? []) as DeckViewer[],
    acceptances: (a.data ?? []) as BoqAcceptance[],
    threads: ((t.data ?? []) as any[]).map((th) => ({
      ...th,
      messages: messages.filter((m) => m.thread_id === th.id),
    })) as ClientNoteThread[],
  };
}

/** Siyakha reply. Client-facing only — private project notes live elsewhere. */
export async function replyToThread(input: {
  thread_id: string;
  project_id: string;
  body: string;
  author_name: string;
}) {
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await db.from("portal_client_note_messages").insert({
    thread_id: input.thread_id,
    project_id: input.project_id,
    author_kind: "siyakha",
    author_name: input.author_name,
    author_user_id: auth.user?.id ?? null,
    body: input.body,
  });
  if (error) throw new Error(error.message);
  const { error: upErr } = await db
    .from("portal_client_note_threads")
    .update({ status: "replied", last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", input.thread_id);
  if (upErr) throw new Error(upErr.message);
}

export async function setThreadStatus(threadId: string, status: NoteStatus) {
  const { error } = await db
    .from("portal_client_note_threads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", threadId);
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------------- delivery settings */

export async function loadDeliverySettings(projectId: string): Promise<DeliverySettings | null> {
  const { data, error } = await db
    .from("portal_project_delivery_settings")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { ...data, stages: (data.stages?.length ? data.stages : DEFAULT_DELIVERY_STAGES) as DeliveryStage[] };
}

/** Only ever called from an explicit admin Save click — never on render. */
export async function saveDeliverySettings(settings: DeliverySettings): Promise<DeliverySettings> {
  const { data: auth } = await supabase.auth.getUser();
  const payload = { ...settings, updated_by: auth.user?.id ?? null };
  delete (payload as Record<string, unknown>).id;
  delete (payload as Record<string, unknown>).updated_at;
  const { data, error } = await db
    .from("portal_project_delivery_settings")
    .upsert(payload, { onConflict: "project_id" })
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as DeliverySettings;
}

/** CSV export of the acceptance audit record. */
export function acceptanceCsv(rows: readonly BoqAcceptance[]): string {
  const head = [
    "accepted_at",
    "full_name",
    "email",
    "revision_label",
    "revision_hash",
    "po_reference",
    "subtotal_excl_vat",
    "vat",
    "total_incl_vat",
    "status",
  ];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    head.join(","),
    ...rows.map((r) =>
      [
        r.accepted_at,
        r.full_name,
        r.email,
        r.revision_label ?? "",
        r.revision_hash,
        r.po_reference ?? "",
        r.subtotal,
        r.vat,
        r.total,
        r.status,
      ]
        .map(esc)
        .join(","),
    ),
  ].join("\n");
}
