import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { applyGuestPrivacyMeta, canApprove, resolveShare } from "@/lib/shareLinks";
import { isLiveView, nextLiveState, updatedLabel, LIVE_REFRESH_MS } from "@/lib/liveShare";
import { SIYAKHA } from "@/lib/proposals";
import { formatDate } from "@/lib/portalFiles";
import { formatQty, formatZar } from "@/lib/boq";
import { deviceTypeLabel, stageLabel } from "@/lib/lifecycle";
import { POWER_SECTION_NARRATIVE, POWER_SECTION_TITLE, hasPowerSolution } from "@/lib/reporting";
import type { ProjectPack } from "@/lib/projectPack";
import ProjectPackDocument from "@/components/pm/ProjectPackDocument";
import PlanSheet from "@/components/pm/PlanSheet";
import ViewerGate from "@/components/deck/ViewerGate";
import DeckBoqTab from "@/components/deck/DeckBoqTab";
import DeckNotesTab from "@/components/deck/DeckNotesTab";
import {
  DeckBenefitCards,
  DeckNextStepsTimeline,
  DeckProjectSummary,
  DeckRetentionPanel,
} from "@/components/deck/DeckDeliverySummary";
import {
  clearSession,
  deckAcceptBoq,
  deckCreateNote,
  deckNotes,
  deckRegister,
  deckReplyNote,
  deckSession,
  purgePersistedSessions,
  type DeckPayload,
} from "@/lib/deckClient";
import type { ViewerRegistration } from "@/lib/deckViewer";
import FloorLevelRail from "@/components/portal/FloorLevelRail";
import DeckMobileNav from "@/components/deck/DeckMobileNav";
import { NO_OVERFLOW_CLASS, SCROLL_CONTAINER_CLASS, TOUCH_TARGET_CLASS, buildDeckNav } from "@/lib/deckMobileNav";
import { Check, Download, MessageSquare, RefreshCw, ShieldCheck } from "lucide-react";

type Resolved = Awaited<ReturnType<typeof resolveShare>>;

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <main className="min-h-screen bg-background px-4 py-16">
    <div className="mx-auto max-w-md border border-border p-8 text-center">
      <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{SIYAKHA.company}</p>
      {children}
    </div>
  </main>
);

const Section: React.FC<{ id: string; eyebrow: string; title: string; children: React.ReactNode }> = ({
  id,
  eyebrow,
  title,
  children,
}) => (
  <section id={id} className="scroll-mt-24 border-t border-border py-12 first:border-t-0 md:py-16">
    <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{eyebrow}</p>
    <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
    <div className="mt-6">{children}</div>
  </section>
);

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="border border-border p-4">
    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
    <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
  </div>
);

const Prose: React.FC<{ text?: string | null }> = ({ text }) =>
  text ? <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{text}</p> : null;

/**
 * Default client delivery surface: a branded, read-only Project Portfolio Deck.
 * It renders the frozen snapshot only — no live queries, no internal costs,
 * markup, margin or supplier data (those never enter the snapshot).
 */
const ProjectDeckPage: React.FC = () => {
  const { token = "" } = useParams();
  const { toast } = useToast();
  const [state, setState] = useState<Resolved["state"] | "loading">("loading");
  const [data, setData] = useState<Resolved | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"comment" | "approve" | null>(null);
  const [stale, setStale] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deckFloorId, setDeckFloorId] = useState("");
  const [deck, setDeck] = useState<DeckPayload | null>(null);
  const [gateError, setGateError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("overview");

  /**
   * `refresh` marks a background/manual live poll: it still participates in rate
   * limiting and access logging, but never inflates the link's view count. A
   * failed refresh keeps the last valid view on screen.
   */
  const load = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const res = await resolveShare(token, {
        access_token: sess.session?.access_token ?? "",
        ...(refresh ? { refresh: true } : {}),
      });
      if (refresh) {
        const next = nextLiveState(data, res as never);
        setData(next.data as never);
        setStale(next.stale);
        if (!next.stale) setState(res.state);
      } else {
        setData(res);
        setState(res.state);
        setStale(false);
      }
    } catch {
      if (refresh && data) setStale(true);
      else setState("unavailable");
    } finally {
      if (refresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    document.title = "Project portfolio — Siyakha Technology Solutions";
    applyGuestPrivacyMeta();
    // Every fresh navigation to a share URL starts unauthenticated: any legacy
    // stored session is purged and in-memory access for this token is dropped.
    purgePersistedSessions();
    clearSession(token);
    setDeck(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /**
   * Engagement payload (viewer session, client BOQ, notes, delivery summary).
   * It is only requested once the share token itself resolved, and it returns
   * nothing about the project until the viewer has registered.
   */
  const loadDeck = async () => {
    try {
      const res = await deckSession(token);
      if (res.state !== "ok") {
        setDeck(res);
        return;
      }
      const notes = await deckNotes(token);
      setDeck({ ...res, threads: notes.state === "ok" ? notes.threads : [] });
    } catch {
      setDeck({ state: "unavailable" });
    }
  };

  useEffect(() => {
    if (state === "ok") void loadDeck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, token]);

  const register = async (input: ViewerRegistration) => {
    setGateError(null);
    const res = await deckRegister(token, input);
    if (res.state === "ok") await loadDeck();
    else setGateError(res.error ?? "We could not open this link. Please contact Siyakha.");
  };

  const acceptBoq = async (input: { revision_hash: string; po_reference: string | null }) => {
    const res = await deckAcceptBoq(token, { ...input, confirmed: true });
    if (res.state === "revision_changed") {
      await loadDeck();
      throw new Error("This BOQ has been revised. Please review the updated revision and accept again.");
    }
    if (res.state !== "ok") throw new Error(res.error ?? "Could not record the acceptance.");
    await loadDeck();
    toast({ title: res.repeat ? "Already accepted" : "Acceptance recorded" });
  };

  const createNote = async (input: { category: never; body: string }) => {
    const res = await deckCreateNote(token, input as never);
    if (res.state !== "ok") throw new Error(res.error ?? "Could not send the note.");
    setDeck((d) => (d ? { ...d, threads: res.threads } : d));
  };

  const replyNote = async (input: { thread_id: string; body: string }) => {
    const res = await deckReplyNote(token, input);
    if (res.state !== "ok") throw new Error(res.error ?? "Could not send the reply.");
    setDeck((d) => (d ? { ...d, threads: res.threads } : d));
  };

  const live = isLiveView(data as never);

  // Live decks poll the saved design every 30s and on window focus.
  useEffect(() => {
    if (!live) return;
    const tick = () => {
      if (document.visibilityState === "visible") void load(true);
    };
    const id = window.setInterval(tick, LIVE_REFRESH_MS);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, token]);

  const submit = async (action: "comment" | "approve") => {
    setBusy(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const res = await resolveShare(token, {
        action,
        message,
        access_token: sess.session?.access_token ?? "",
      });
      if (res.state !== "ok") throw new Error("This action is not permitted on this link.");
      setDone(action);
      setMessage("");
      toast({ title: action === "approve" ? "Acceptance recorded" : "Message sent to Siyakha" });
    } catch (e) {
      toast({ title: "Could not submit", description: (e as any)?.message, variant: "destructive" as never });
    } finally {
      setBusy(false);
    }
  };

  const pack = (data?.snapshot ?? {}) as ProjectPack;
  const link = data?.link;
  const approvable = canApprove(link ?? null);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of pack.floors ?? [])
      for (const m of f.markers ?? []) map.set(m.marker_type, (map.get(m.marker_type) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [pack]);

  const placedFloors = (pack.floors ?? []).filter((f) => f.plan_image_path || (f as any).plan_image_url);
  const deckFloor = placedFloors.find((f) => f.id === deckFloorId) ?? placedFloors[0] ?? null;
  const deckCounts = Object.fromEntries(
    placedFloors.map((f) => [f.id, (f.markers ?? []).length] as const),
  );


  if (state === "loading")
    return (
      <Shell>
        <p className="mt-3 text-sm text-muted-foreground">Opening your secure project deck…</p>
      </Shell>
    );

  if (state === "expired" || state === "revoked" || state === "unavailable" || state === "rate_limited" || state === "denied")
    return (
      <Shell>
        <h1 className="mt-3 text-lg font-semibold">
          {state === "expired"
            ? "This link has expired"
            : state === "revoked"
              ? "This link has been revoked"
              : state === "rate_limited"
                ? "Too many attempts"
                : "Link unavailable"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {state === "rate_limited"
            ? "Please wait a few minutes and try again."
            : "Please contact Siyakha Technology Solutions for an updated secure link."}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">{SIYAKHA.email}</p>
      </Shell>
    );

  if (state === "login_required")
    return (
      <Shell>
        <h1 className="mt-3 text-lg font-semibold">Client login required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to your client portal on this device, then reopen this link.
        </p>
        <Button className="mt-4" onClick={() => (window.location.href = "/sign-in")}>
          Go to client login
        </Button>
      </Shell>
    );

  // Registration gate: no project, client or commercial detail is rendered until
  // the viewer has registered against this validated token.
  if (!deck || deck.state === "registration_required")
    return deck ? (
      <ViewerGate onRegister={register} error={gateError} />
    ) : (
      <Shell>
        <p className="mt-3 text-sm text-muted-foreground">Opening your secure project deck…</p>
      </Shell>
    );

  const viewer = deck.viewer ?? null;
  const delivery = deck.delivery ?? null;
  const equipmentMarkers = deck.equipment?.markers ?? [];
  const equipmentRack = deck.equipment?.rack ?? (pack.rackEquipment as never[]) ?? [];
  const deliveryProps = {
    settings: delivery,
    markers: equipmentMarkers,
    rack: equipmentRack,
    boqLines: (deck.boq_lines ?? pack.boqLines ?? []) as never[],
    floors: pack.floors ?? [],
  };

  const nav = buildDeckNav({ gallery: pack.gallery?.length ?? 0, documents: pack.documents?.length ?? 0 });
  const deckTitle = pack.project?.title ?? link?.title ?? null;

  return (
    <div className={`min-h-screen bg-background ${NO_OVERFLOW_CLASS}`}>
      {/* Print surface: the full A4 pack, only when download is permitted. */}
      {link?.download_allowed && (
        <div className="hidden print:block">
          <ProjectPackDocument pack={pack} />
        </div>
      )}

      <div className="print:hidden">
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            {/* Compact sticky mobile header with a labelled section selector. */}
            <DeckMobileNav
              company={SIYAKHA.company}
              title={deckTitle}
              nav={nav}
              active={activeSection}
              onSelect={setActiveSection}
            />
            <div className="hidden min-w-0 lg:block">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{SIYAKHA.company}</p>
              <p className="truncate text-sm font-semibold">{deckTitle}</p>
            </div>
            <nav className="hidden items-center gap-4 text-xs uppercase tracking-[0.14em] text-muted-foreground lg:flex">
              {nav.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="hover:text-foreground">
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
              {live && (
                <span className="flex items-center gap-2 border border-border px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground" aria-hidden />
                  Live project view · {updatedLabel(data?.live_updated_at ?? null)}
                </span>
              )}
              {live && (
                <Button size="sm" variant="outline" disabled={refreshing} onClick={() => load(true)}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} strokeWidth={1.5} />
                  Refresh
                </Button>
              )}
              {link?.download_allowed && (
                <Button size="sm" onClick={() => window.print()}>
                  <Download className="mr-2 h-4 w-4" strokeWidth={1.5} /> Download pack
                </Button>
              )}
            </div>
          </div>
          {live && stale && (
            <p className="mx-auto max-w-6xl px-4 pb-2 text-xs text-muted-foreground">
              Could not refresh the live plan data just now — showing the last loaded view.
            </p>
          )}
        </header>

        {/* Cover */}
        <section className="border-b border-border bg-foreground px-4 py-16 text-background md:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-[10px] uppercase tracking-[0.32em] opacity-70">
              Project portfolio · Revision {pack.revision_no ?? 1}
              {live ? " · Plans live, commercials frozen at issue" : ""}
            </p>
            <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
              {pack.project?.title ?? link?.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm opacity-80">
              Prepared for {pack.client?.display_name ?? "our client"}
              {pack.site?.name ? ` · ${pack.site.name}` : ""}
              {pack.site?.city ? `, ${pack.site.city}` : ""}
            </p>
            <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-xs uppercase tracking-[0.18em] opacity-80">
              <span>Issued {formatDate(pack.generated_at)}</span>
              {pack.project?.reference && <span>Ref {pack.project.reference}</span>}
              {pack.lifecycle_stage && <span>{stageLabel(pack.lifecycle_stage)}</span>}
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" strokeWidth={1.5} /> Secure read-only link
              </span>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4">
          <Section id="overview" eyebrow="01" title="Overview">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Levels covered" value={String((pack.floors ?? []).length)} />
              <Stat
                label="Devices designed"
                value={String((pack.floors ?? []).reduce((n, f) => n + (f.markers?.length ?? 0), 0))}
              />
              <Stat label="Schedule lines" value={String((pack.boqLines ?? []).length)} />
              <Stat label="Milestones" value={String((pack.milestones ?? []).length)} />
            </div>
            <div className="mt-8 space-y-4">
              <Prose text={pack.narrative?.executive_summary ?? pack.project?.description} />
              <Prose text={pack.narrative?.project_understanding ?? pack.project?.site_context} />
            </div>
            <div className="mt-8">
              <DeckProjectSummary {...deliveryProps} />
            </div>
            <div className="mt-8">
              <DeckBenefitCards {...deliveryProps} />
            </div>
          </Section>

          <Section id="scope" eyebrow="02" title="Scope of work">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <Prose text={pack.narrative?.scope_of_work ?? pack.project?.objectives} />
                <Prose text={pack.narrative?.methodology ?? pack.project?.project_approach} />
              </div>
              <div className="space-y-3">
                <DeckRetentionPanel {...deliveryProps} />
                {counts.map(([type, n]) => (
                  <div key={type} className="flex items-center justify-between border border-border px-4 py-3 text-sm">
                    <span>{deviceTypeLabel(type)}</span>
                    <span className="tabular-nums font-semibold">{n}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section id="design" eyebrow="03" title="Design & plans">
            {placedFloors.length === 0 ? (
              <p className="text-sm text-muted-foreground">Plan sheets will appear here once the design drawings are issued.</p>
            ) : (
              <div className="grid min-w-0 gap-6 lg:grid-cols-[200px,1fr]">
                {/* Compact level selector on mobile; the desktop rail is unchanged. */}
                <div className="lg:hidden">
                  <label
                    htmlFor="deck-floor-select"
                    className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
                  >
                    Level
                  </label>
                  <select
                    id="deck-floor-select"
                    value={deckFloor?.id ?? ""}
                    onChange={(e) => setDeckFloorId(e.target.value)}
                    className={`${TOUCH_TARGET_CLASS} mt-1 w-full max-w-full border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                  >
                    {placedFloors.map((f: any) => (
                      <option key={f.id} value={f.id}>
                        {f.display_name}
                        {f.markers?.length ? ` · ${f.markers.length} devices` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Read-only level rail — no editing controls on the client deck. */}
                <div className="hidden lg:block">
                  <FloorLevelRail
                    floors={placedFloors}
                    selectedId={deckFloor?.id ?? ""}
                    onSelect={setDeckFloorId}
                    deviceCounts={deckCounts}
                    presignedFor={(f) => (f as any).plan_image_url ?? null}
                  />
                </div>
                {deckFloor && (
                  <figure className="min-w-0 max-w-full">
                    <figcaption className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold">{deckFloor.display_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(deckFloor.markers ?? []).length} device
                        {(deckFloor.markers ?? []).length === 1 ? "" : "s"}
                        {deckFloor.floor_use ? ` · ${deckFloor.floor_use}` : ""}
                      </span>
                    </figcaption>
                    <div className={`${SCROLL_CONTAINER_CLASS} touch-pan-x touch-pan-y border border-border p-2`}>
                      <PlanSheet
                        floor={deckFloor}
                        interactive
                        rackEquipment={pack.rackEquipment}
                        cables={pack.cables}
                      />
                    </div>
                  </figure>
                )}
              </div>
            )}
          </Section>


          <Section id="schedule" eyebrow="04" title="Schedule of works">
            {hasPowerSolution(pack.boqLines ?? []) && (
              <div className="mb-6 border border-border p-5">
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{POWER_SECTION_TITLE}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{POWER_SECTION_NARRATIVE}</p>
              </div>
            )}
            {(pack.boqLines ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">The priced schedule is not included on this link.</p>
            ) : (
              <>
                <div className={`${SCROLL_CONTAINER_CLASS} border border-border`} role="region" aria-label="Schedule of works — scroll to see all columns" tabIndex={0}>
                  <table className="w-full min-w-[640px] text-sm">
                    <thead className="bg-muted text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Description</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2">Unit</th>
                        <th className="px-3 py-2 text-right">Rate</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(pack.boqLines ?? []).map((l: any, i: number) => (
                        <tr key={i} className="border-t border-border">
                          <td className="px-3 py-2">{l.description}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{formatQty(l.quantity)}</td>
                          <td className="px-3 py-2">{l.unit}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{formatZar(l.customer_unit_rate)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{formatZar(l.line_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Stat label="Subtotal" value={formatZar(pack.totals?.subtotal ?? 0)} />
                  <Stat label={`VAT @ ${pack.boq?.vat_rate ?? 15}%`} value={formatZar(pack.totals?.vat ?? 0)} />
                  <Stat label="Total incl. VAT" value={formatZar(pack.totals?.total ?? 0)} />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Customer rates only. Valid for {pack.narrative?.validity_days ?? 30} days from {formatDate(pack.generated_at)}.
                </p>
              </>
            )}
          </Section>

          <Section id="boq" eyebrow="05" title="BOQ & acceptance">
            {viewer && (
              <DeckBoqTab
                viewer={viewer}
                boq={deck.boq ?? null}
                lines={deck.boq_lines ?? []}
                totals={deck.boq_totals ?? { subtotal: 0, vat: 0, total: 0 }}
                revisionHash={deck.revision_hash ?? ""}
                acceptances={deck.acceptances ?? []}
                onAccept={acceptBoq}
              />
            )}
          </Section>

          <Section id="notes" eyebrow="06" title="Project notes">
            {viewer && (
              <DeckNotesTab
                viewer={viewer}
                threads={deck.threads ?? []}
                onCreate={createNote as never}
                onReply={replyNote}
              />
            )}
          </Section>

          <Section id="programme" eyebrow="07" title="Programme">
            {(pack.milestones ?? []).length === 0 && (pack.tasks ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">The delivery programme will be issued after design sign-off.</p>
            ) : (
              <ol className="space-y-3">
                {(pack.milestones ?? []).map((m: any) => (
                  <li key={m.id} className="flex flex-wrap items-baseline justify-between gap-2 border border-border px-4 py-3">
                    <span className="text-sm font-medium">{m.title}</span>
                    <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {m.status ?? "planned"}
                      {m.due_date ? ` · ${formatDate(m.due_date)}` : ""}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Section>

          {!!pack.gallery?.length && (
            <Section id="gallery" eyebrow="06" title="Site gallery">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pack.gallery.map((g) => (
                  <figure key={g.id} className="border border-border">
                    {g.photo_url ? (
                      <img
                        src={g.photo_url}
                        alt={g.caption ?? "Site photograph"}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover grayscale"
                      />
                    ) : (
                      <div className="aspect-[4/3] w-full bg-muted" />
                    )}
                    <figcaption className="px-3 py-2 text-xs text-muted-foreground">
                      {g.caption ?? "Site photograph"}
                      {g.taken_at ? ` · ${formatDate(g.taken_at)}` : ""}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Section>
          )}

          {!!pack.documents?.length && (
            <Section id="documents" eyebrow="07" title="Document register">
              <ul className="divide-y divide-border border border-border">
                {pack.documents.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm">
                    <span>{d.title}</span>
                    <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {d.category}
                      {d.version ? ` · ${d.version}` : ""}
                      {d.document_date ? ` · ${formatDate(d.document_date)}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section id="next" eyebrow="08" title="Next steps">
            <div className="mb-8">
              <DeckNextStepsTimeline settings={delivery} />
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <Prose text={pack.narrative?.deliverables} />
                <Prose text={pack.narrative?.assumptions} />
                <p className="text-sm text-muted-foreground">
                  Questions or approvals go straight to {SIYAKHA.email}. This link is read-only and expires on{" "}
                  {formatDate(link?.expires_at ?? null)}.
                </p>
              </div>

              {(link?.comments_allowed || approvable) && (
                <div className="border border-border p-5">
                  {done ? (
                    <p className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4" strokeWidth={1.5} />
                      {done === "approve" ? "Your acceptance has been recorded." : "Your message has been sent to Siyakha."}
                    </p>
                  ) : (
                    <>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        {approvable ? "Accept this project pack" : "Send a query"}
                      </p>
                      <Textarea
                        rows={4}
                        className="mt-3"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                          approvable ? "Optional note with your acceptance" : "Your question or comment"
                        }
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        {approvable && (
                          <Button disabled={busy} onClick={() => submit("approve")}>
                            <Check className="mr-2 h-4 w-4" strokeWidth={1.5} /> Accept
                          </Button>
                        )}
                        {link?.comments_allowed && (
                          <Button variant="outline" disabled={busy || !message.trim()} onClick={() => submit("comment")}>
                            <MessageSquare className="mr-2 h-4 w-4" strokeWidth={1.5} /> Send query
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </Section>
        </div>

        <footer className="border-t border-border px-4 py-10 text-center text-xs text-muted-foreground">
          {SIYAKHA.company} · {SIYAKHA.email} · {SIYAKHA.website}
        </footer>
      </div>
    </div>
  );
};

export default ProjectDeckPage;
