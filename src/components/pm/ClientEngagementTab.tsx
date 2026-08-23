import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Panel, Chip } from "./ui";
import { formatDate } from "@/lib/portalFiles";
import { formatZar } from "@/lib/boq";
import {
  acceptanceCsv,
  loadDeliverySettings,
  loadEngagement,
  replyToThread,
  saveDeliverySettings,
  setThreadStatus,
} from "@/lib/clientEngagement";
import {
  NOTE_CATEGORIES,
  threadCounts,
  viewerFullName,
  type BoqAcceptance,
  type ClientNoteThread,
  type DeckViewer,
  type NoteStatus,
} from "@/lib/deckViewer";
import { DEFAULT_DELIVERY_STAGES, emptyDeliverySettings, type DeliverySettings } from "@/lib/deliverySummary";
import { assertExplicitAction } from "@/lib/reporting";
import { Download } from "lucide-react";

/**
 * Admin "Client engagement" area for one project: registered deck viewers,
 * client note threads with the Siyakha reply/status workflow, the exact BOQ
 * acceptance audit record, and the editable Client Delivery Summary.
 *
 * Opening this tab never creates a delivery-settings record — the row is only
 * written when the admin clicks Save.
 */
const ClientEngagementTab: React.FC<{ projectId: string; projectTitle?: string }> = ({ projectId, projectTitle }) => {
  const { toast } = useToast();
  const [viewers, setViewers] = useState<DeckViewer[]>([]);
  const [acceptances, setAcceptances] = useState<BoqAcceptance[]>([]);
  const [threads, setThreads] = useState<ClientNoteThread[]>([]);
  const [settings, setSettings] = useState<DeliverySettings | null>(null);
  const [draft, setDraft] = useState<DeliverySettings>(emptyDeliverySettings(projectId));
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<Record<string, string>>({});

  const refresh = async () => {
    setLoading(true);
    try {
      const [engagement, delivery] = await Promise.all([loadEngagement(projectId), loadDeliverySettings(projectId)]);
      setViewers(engagement.viewers);
      setAcceptances(engagement.acceptances);
      setThreads(engagement.threads);
      setSettings(delivery);
      setDraft(delivery ?? emptyDeliverySettings(projectId));
    } catch (e) {
      toast({ title: "Could not load client engagement", description: (e as Error)?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const counts = useMemo(() => threadCounts(threads), [threads]);

  const send = async (thread: ClientNoteThread) => {
    const body = (reply[thread.id] ?? "").trim();
    if (!body) return;
    setBusy(true);
    try {
      await replyToThread({ thread_id: thread.id, project_id: projectId, body, author_name: "Siyakha project team" });
      setReply((r) => ({ ...r, [thread.id]: "" }));
      await refresh();
      toast({ title: "Reply added", description: "Nothing was emailed — the client sees it on the deck." });
    } catch (e) {
      toast({ title: "Could not reply", description: (e as Error)?.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const status = async (thread: ClientNoteThread, next: NoteStatus) => {
    setBusy(true);
    try {
      await setThreadStatus(thread.id, next);
      await refresh();
    } catch (e) {
      toast({ title: "Could not update status", description: (e as Error)?.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  /** Explicit-click only. */
  const save = async (trigger: "user" | "effect" = "user") => {
    setBusy(true);
    try {
      assertExplicitAction(trigger, "Saving the delivery summary");
      const saved = await saveDeliverySettings({ ...draft, project_id: projectId });
      setSettings(saved);
      setDraft({ ...saved, stages: saved.stages?.length ? saved.stages : DEFAULT_DELIVERY_STAGES });
      toast({ title: "Delivery summary saved" });
    } catch (e) {
      toast({ title: "Could not save", description: (e as Error)?.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = () => {
    const blob = new Blob([acceptanceCsv(acceptances)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boq-acceptances-${projectId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const text = (key: keyof DeliverySettings, label: string, rows = 3) => (
    <div>
      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <Textarea
        rows={rows}
        className="mt-1"
        value={(draft[key] as string) ?? ""}
        onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
      />
    </div>
  );

  const number = (key: keyof DeliverySettings, label: string, step = "1") => (
    <div>
      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <Input
        type="number"
        step={step}
        className="mt-1"
        value={(draft[key] as number | null) ?? ""}
        onChange={(e) =>
          setDraft((d) => ({ ...d, [key]: e.target.value === "" ? null : Number(e.target.value) }))
        }
      />
    </div>
  );

  const line = (key: keyof DeliverySettings, label: string) => (
    <div>
      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <Input
        className="mt-1"
        value={(draft[key] as string) ?? ""}
        onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
      />
    </div>
  );

  if (loading) return <p className="text-sm text-muted-foreground">Loading client engagement…</p>;

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Registered viewers", String(viewers.length)],
          ["Open notes", String(counts.open)],
          ["Replied", String(counts.replied)],
          ["Resolved", String(counts.resolved)],
        ].map(([label, value]) => (
          <div key={label} className="border border-border p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <Panel title="Deck viewers">
        <p className="mb-3 text-xs text-muted-foreground">Who registered on the secure project link, and when they last viewed it.</p>
        {viewers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No client viewer has registered on a project link yet.</p>
        ) : (
          <ul className="divide-y divide-border border border-border">
            {viewers.map((v) => (
              <li key={v.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm">
                <span>
                  {viewerFullName(v)} · <span className="text-muted-foreground">{v.email}</span>
                </span>
                <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  First {formatDate(v.first_viewed_at)} · Last {formatDate(v.last_viewed_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title={"BOQ acceptance audit"}>
        <p className="mb-3 text-xs text-muted-foreground">{"Append-only record of the exact revision and totals a client accepted. It cannot be edited."}</p>
        {acceptances.length === 0 ? (
          <p className="text-sm text-muted-foreground">No client acceptance has been recorded for this project.</p>
        ) : (
          <>
            <ul className="divide-y divide-border border border-border">
              {acceptances.map((a) => (
                <li key={a.id} className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium">
                      {a.full_name} · {a.email}
                    </span>
                    <Chip>{a.status}</Chip>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {a.revision_label ?? "Revision"} · fingerprint {a.revision_hash} · accepted{" "}
                    {formatDate(a.accepted_at)}
                    {a.po_reference ? ` · PO ${a.po_reference}` : ""}
                  </p>
                  <p className="mt-1 text-xs tabular-nums">
                    Subtotal {formatZar(Number(a.subtotal))} · VAT {formatZar(Number(a.vat))} · Total{" "}
                    {formatZar(Number(a.total))}
                  </p>
                </li>
              ))}
            </ul>
            <Button size="sm" variant="outline" className="mt-3" onClick={exportCsv}>
              <Download className="mr-2 h-4 w-4" strokeWidth={1.5} /> Export audit CSV
            </Button>
          </>
        )}
      </Panel>

      <Panel title={"Client notes"}>
        <p className="mb-3 text-xs text-muted-foreground">{"Client-facing conversation only. Internal and private project notes are never shown on a share link."}</p>
        {threads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No client notes yet.</p>
        ) : (
          <div className="space-y-4">
            {threads.map((t) => (
              <article key={t.id} className="border border-border">
                <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-4 py-3">
                  <span className="text-sm font-semibold">
                    {NOTE_CATEGORIES.find((c) => c.value === t.category)?.label ?? t.category}
                    {t.subject ? ` · ${t.subject}` : ""}
                  </span>
                  <span className="flex items-center gap-2">
                    <Chip>{t.status}</Chip>
                    <span className="text-xs text-muted-foreground">{formatDate(t.last_message_at)}</span>
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
                <div className="space-y-2 border-t border-border px-4 py-3">
                  <Textarea
                    rows={3}
                    value={reply[t.id] ?? ""}
                    placeholder="Reply to the client"
                    onChange={(e) => setReply((r) => ({ ...r, [t.id]: e.target.value }))}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" disabled={busy || !(reply[t.id] ?? "").trim()} onClick={() => send(t)}>
                      Send reply
                    </Button>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => status(t, "resolved")}>
                      Resolve
                    </Button>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => status(t, "open")}>
                      Reopen
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>

      <Panel title={"Client delivery summary"}>
        <p className="mb-3 text-xs text-muted-foreground">{`Drives the client deck, proposal and report for ${projectTitle ?? "this project"}. Nothing is stored until you save.`}</p>
        <div className="space-y-4">
          {text("executive_summary", "Executive project summary", 4)}
          {text("delivery_objectives", "Delivery objectives", 3)}
          <div className="grid gap-4 sm:grid-cols-3">
            {number("team_size", "Team size (engineers)")}
            {number("duration_weeks", "Planned duration (weeks)")}
            {number("lead_engineer_count", "Lead configuration engineers")}
          </div>
          {line("lead_engineer_role", "Lead engineer role")}
          <div className="flex items-center gap-3 border border-border p-3">
            <input
              id="temp-cctv"
              type="checkbox"
              className="h-4 w-4"
              checked={draft.temp_cctv_enabled}
              onChange={(e) => setDraft((d) => ({ ...d, temp_cctv_enabled: e.target.checked }))}
            />
            <label htmlFor="temp-cctv" className="text-sm">
              Temporary construction CCTV included
            </label>
          </div>
          {text("temp_cctv_notes", "Temporary CCTV notes", 2)}
          <div className="grid gap-4 sm:grid-cols-2">
            {number("power_backup_hours", "Power backup target (hours)", "0.5")}
            {line("power_backup_qualification", "Power backup qualification")}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {line("cctv_recording_mode", "CCTV recording mode")}
            {line("cctv_codec", "Codec")}
            {number("cctv_average_bitrate_kbps", "Average bitrate (kbps)")}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {number("cctv_duty_cycle", "Recording duty cycle (0-1)", "0.05")}
            {number("hdd_raw_tb", "HDD raw capacity (TB)", "0.5")}
            {number("hdd_usable_factor", "Usable capacity factor (0-1)", "0.01")}
          </div>
          {text("methodology", "Methodology / stages narrative", 3)}
          {text("benefits_narrative", "Benefits / technology narrative", 3)}
          {text("assumptions", "Assumptions", 3)}
          {text("exclusions", "Exclusions", 3)}

          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Post-acceptance stages (one per line)
            </p>
            <Textarea
              rows={11}
              className="mt-1"
              value={(draft.stages ?? DEFAULT_DELIVERY_STAGES)
                .map((s) => (s.detail ? `${s.title} — ${s.detail}` : s.title))
                .join("\n")}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  stages: e.target.value
                    .split("\n")
                    .map((row) => row.trim())
                    .filter(Boolean)
                    .map((row) => {
                      const [title, ...rest] = row.split(" — ");
                      return { title, detail: rest.join(" — ") || null };
                    }),
                }))
              }
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={busy} onClick={() => save("user")}>
              Save delivery summary
            </Button>
            <span className="text-xs text-muted-foreground">
              {settings?.updated_at ? `Last saved ${formatDate(settings.updated_at)}` : "Not saved yet"}
            </span>
          </div>
        </div>
      </Panel>
    </div>
  );
};

export default ClientEngagementTab;
