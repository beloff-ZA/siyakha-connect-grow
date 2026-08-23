import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/portalFiles";
import {
  NOTE_CATEGORIES,
  NOTE_MAX,
  noteRateExceeded,
  sanitizeNoteBody,
  validateNote,
  type ClientNoteThread,
  type DeckViewer,
  type NoteCategory,
} from "@/lib/deckViewer";
import { MessageSquare } from "lucide-react";

const statusLabel: Record<string, string> = { open: "Open", replied: "Replied", resolved: "Resolved" };

/**
 * Two-way project notes for the client deck. Plain text only, rate limited on
 * both sides, and completely separate from internal/private project notes —
 * this surface only ever renders threads returned for this viewer and link.
 */
const DeckNotesTab: React.FC<{
  viewer: DeckViewer;
  threads: ClientNoteThread[];
  onCreate: (input: { category: NoteCategory; body: string }) => Promise<void>;
  onReply: (input: { thread_id: string; body: string }) => Promise<void>;
}> = ({ viewer, threads, onCreate, onReply }) => {
  const [category, setCategory] = useState<NoteCategory>("general");
  const [body, setBody] = useState("");
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<number[]>([]);

  const guard = (text: string) => {
    const invalid = validateNote(text);
    if (invalid) return invalid;
    if (noteRateExceeded(sent)) return "Please wait a moment before sending another note.";
    return null;
  };

  const submit = async () => {
    const invalid = guard(body);
    setError(invalid);
    if (invalid) return;
    setBusy(true);
    try {
      await onCreate({ category, body: sanitizeNoteBody(body) });
      setSent((s) => [...s, Date.now()]);
      setBody("");
    } catch (e) {
      setError((e as Error)?.message ?? "Could not send the note.");
    } finally {
      setBusy(false);
    }
  };

  const submitReply = async (threadId: string) => {
    const invalid = guard(reply);
    setError(invalid);
    if (invalid) return;
    setBusy(true);
    try {
      await onReply({ thread_id: threadId, body: sanitizeNoteBody(reply) });
      setSent((s) => [...s, Date.now()]);
      setReply("");
      setReplyFor(null);
    } catch (e) {
      setError((e as Error)?.message ?? "Could not send the reply.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),360px]">
      <div className="space-y-4">
        {threads.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No notes yet. Ask a question about the design, schedule or programme and the Siyakha project team will reply
            here.
          </p>
        ) : (
          threads.map((t) => (
            <article key={t.id} className="border border-border">
              <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-4 py-3">
                <span className="text-sm font-semibold">
                  {NOTE_CATEGORIES.find((c) => c.value === t.category)?.label ?? "General"}
                  {t.subject ? ` · ${t.subject}` : ""}
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {statusLabel[t.status] ?? t.status} · {formatDate(t.last_message_at)}
                </span>
              </header>
              <ul className="divide-y divide-border">
                {t.messages.map((m) => (
                  <li key={m.id} className="px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {m.author_kind === "client" ? m.author_name : `Siyakha · ${m.author_name}`} ·{" "}
                      {formatDate(m.created_at)}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-sm">{m.body}</p>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border px-4 py-3">
                {replyFor === t.id ? (
                  <>
                    <Textarea
                      rows={3}
                      maxLength={NOTE_MAX}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Add a follow-up"
                    />
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" disabled={busy} onClick={() => submitReply(t.id)}>
                        Send follow-up
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setReplyFor(null)}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setReplyFor(t.id)}>
                    Add follow-up
                  </Button>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      <aside className="border border-border p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em]">Add a note</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          Sent as {viewer.first_name} {viewer.surname} ({viewer.email}). Nothing is emailed automatically — the project
          team replies in this thread.
        </p>
        <label htmlFor="note-category" className="mt-4 block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Category
        </label>
        <select
          id="note-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as NoteCategory)}
          className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm"
        >
          {NOTE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <label htmlFor="note-body" className="mt-4 block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Your note
        </label>
        <Textarea
          id="note-body"
          rows={5}
          className="mt-1"
          maxLength={NOTE_MAX}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <p className="mt-1 text-right text-[10px] text-muted-foreground">
          {body.length}/{NOTE_MAX}
        </p>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button className="mt-3 w-full" disabled={busy || !body.trim()} onClick={submit}>
          <MessageSquare className="mr-2 h-4 w-4" strokeWidth={1.5} /> Send note
        </Button>
      </aside>
    </div>
  );
};

export default DeckNotesTab;
