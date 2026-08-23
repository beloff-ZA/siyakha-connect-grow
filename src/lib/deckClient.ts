import { supabase } from "@/integrations/supabase/client";
import type { ClientBoqLine, ClientNoteThread, DeckViewer, NoteCategory, BoqAcceptance } from "./deckViewer";
import { viewerSessionKey } from "./deckViewer";
import type { DeliverySettings, MarkerLike, RackItemLike } from "./deliverySummary";

/**
 * Thin transport for the client deck. Every call goes through the token-scoped
 * `deck-client` edge function — the browser never queries project tables.
 */

export type DeckState =
  | "ok"
  | "registration_required"
  | "expired"
  | "revoked"
  | "unavailable"
  | "rate_limited"
  | "denied"
  | "invalid"
  | "revision_changed";

export type DeckPayload = {
  state: DeckState;
  error?: string;
  viewer?: DeckViewer;
  session?: string;
  link?: { title: string; expires_at: string; comments_allowed: boolean };
  boq?: {
    id: string;
    title: string;
    revision_label: string | null;
    version_no: number | null;
    status: string;
    vat_enabled: boolean;
    vat_rate: number;
    valid_until: string | null;
    updated_at: string;
  } | null;
  boq_lines?: ClientBoqLine[];
  boq_totals?: { subtotal: number; vat: number; total: number };
  revision_hash?: string;
  acceptances?: BoqAcceptance[];
  delivery?: DeliverySettings | null;
  equipment?: { markers: MarkerLike[]; rack: RackItemLike[] };
  terms?: { text: string; version: string };
  threads?: ClientNoteThread[];
  repeat?: boolean;
  acceptance_id?: string;
  accepted_at?: string;
  totals?: { subtotal: number; vat: number; total: number };
};

/**
 * Viewer access lives ONLY in this module's memory, for the lifetime of the
 * loaded page. A reload, a new tab or a later visit starts with an empty map,
 * so the registration gate always appears again. Nothing is written to
 * localStorage, sessionStorage, cookies or the URL.
 */
const memorySessions = new Map<string, string>();

export const readSession = (token: string) => memorySessions.get(token) ?? "";

export const writeSession = (token: string, session: string) => {
  memorySessions.set(token, session);
};

export const clearSession = (token: string) => {
  memorySessions.delete(token);
};

/** Removes any viewer session written to browser storage by earlier builds. */
export const purgePersistedSessions = () => {
  for (const store of [globalThis.localStorage, globalThis.sessionStorage]) {
    try {
      if (!store) continue;
      for (const key of Object.keys(store)) {
        if (key.startsWith(viewerSessionKey(""))) store.removeItem(key);
      }
    } catch {
      /* storage unavailable — nothing to purge */
    }
  }
};

async function call(token: string, action: string, payload: Record<string, unknown> = {}): Promise<DeckPayload> {
  const { data, error } = await supabase.functions.invoke("deck-client", {
    body: { token, action, session: readSession(token), payload },
  });
  if (error) {
    // A non-2xx response still carries a structured body.
    const ctx = (error as any)?.context;
    if (ctx?.json) {
      try {
        return (await ctx.json()) as DeckPayload;
      } catch {
        /* fall through */
      }
    }
    throw error;
  }
  return data as DeckPayload;
}

export const deckSession = (token: string) => call(token, "session");

export async function deckRegister(
  token: string,
  input: { first_name: string; surname: string; email: string; consent: boolean },
) {
  const res = await call(token, "register", input);
  if (res.state === "ok" && res.session) writeSession(token, res.session);
  return res;
}

export const deckBoq = (token: string) => call(token, "boq");

export const deckNotes = (token: string) => call(token, "notes");

export const deckCreateNote = (token: string, input: { category: NoteCategory; body: string }) =>
  call(token, "note_create", input);

export const deckReplyNote = (token: string, input: { thread_id: string; body: string }) =>
  call(token, "note_reply", input);

/** Only ever called from the viewer's explicit "Accept BOQ" confirmation. */
export const deckAcceptBoq = (
  token: string,
  input: { revision_hash: string; po_reference?: string | null; confirmed: true },
) => call(token, "accept", input);
