import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Printer, Search, MessageSquare, Check, RefreshCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePortal } from "@/hooks/usePortal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeader, Panel, EmptyState, Loading, ErrorNote, NoProject, StatusPill } from "@/components/portal/ui";
import { formatDate } from "@/lib/portalFiles";
import {
  computeTotals,
  formatQty,
  formatZar,
  statusTone,
  type Boq,
  type BoqItem,
  type BoqSection,
} from "@/lib/boq";

type Comment = {
  id: string;
  item_id: string | null;
  author_name: string | null;
  author_type: string;
  body: string;
  status: string;
  admin_response: string | null;
  created_at: string;
};

type Decision = {
  id: string;
  decision: string;
  decided_by_name: string | null;
  message: string | null;
  created_at: string;
};

type DesignSnapshot = { aps: number; cameras: number; racks: number; routes: number; floors: number };

const PortalBOQ: React.FC = () => {
  const { activeProject, clientUser, loading: portalLoading } = usePortal();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boqs, setBoqs] = useState<Boq[]>([]);
  const [boqId, setBoqId] = useState<string>("");
  const [sections, setSections] = useState<BoqSection[]>([]);
  const [items, setItems] = useState<BoqItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [snapshot, setSnapshot] = useState<DesignSnapshot | null>(null);
  const [query, setQuery] = useState("");
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [decisionMode, setDecisionMode] = useState<"accepted" | "changes_requested" | null>(null);
  const [decisionMessage, setDecisionMessage] = useState("");
  const [busy, setBusy] = useState(false);


  useEffect(() => {
    document.title = "Bill of Quantities | Siyakha Client Portal";
  }, []);

  const load = useCallback(async () => {
    if (!activeProject) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("portal_boqs")
      .select("*")
      .eq("project_id", activeProject.id)
      .order("version_no", { ascending: false });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    const list = (data ?? []) as unknown as Boq[];
    setBoqs(list);
    setBoqId((prev) => (prev && list.some((b) => b.id === prev) ? prev : (list[0]?.id ?? "")));
    setLoading(false);
  }, [activeProject]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!activeProject) return;
    let cancelled = false;
    (async () => {
      const [markers, routes, floors] = await Promise.all([
        supabase.from("portal_floor_markers").select("marker_type").eq("project_id", activeProject.id),
        supabase.from("portal_cable_routes").select("id", { count: "exact", head: true }).eq("project_id", activeProject.id),
        supabase.from("portal_floors").select("id", { count: "exact", head: true }).eq("project_id", activeProject.id),
      ]);
      if (cancelled) return;
      const rows = (markers.data ?? []) as { marker_type: string }[];
      setSnapshot({
        aps: rows.filter((m) => m.marker_type === "wifi_ap").length,
        cameras: rows.filter((m) => m.marker_type === "camera").length,
        racks: rows.filter((m) => m.marker_type === "rack").length,
        routes: routes.count ?? 0,
        floors: floors.count ?? 0,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [activeProject]);


  const loadDetail = useCallback(async () => {
    if (!boqId) {
      setSections([]);
      setItems([]);
      setComments([]);
      setDecisions([]);
      return;
    }
    const [s, i, c, d] = await Promise.all([
      supabase.from("portal_boq_sections").select("*").eq("boq_id", boqId).order("sort_order"),
      supabase.from("portal_boq_items").select("*").eq("boq_id", boqId).order("sort_order"),
      supabase.from("portal_boq_comments").select("*").eq("boq_id", boqId).order("created_at", { ascending: false }),
      supabase.from("portal_boq_decisions").select("*").eq("boq_id", boqId).order("created_at", { ascending: false }),
    ]);
    setSections((s.data ?? []) as unknown as BoqSection[]);
    setItems((i.data ?? []) as unknown as BoqItem[]);
    setComments((c.data ?? []) as unknown as Comment[]);
    setDecisions((d.data ?? []) as unknown as Decision[]);
  }, [boqId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const boq = boqs.find((b) => b.id === boqId) ?? null;
  const totals = useMemo(
    () => computeTotals(items, { vat_enabled: boq?.vat_enabled ?? true, vat_rate: Number(boq?.vat_rate ?? 15) }),
    [items, boq],
  );

  /** Rates are not yet released: every included line is still R 0.00 (TBC). */
  const pricingPending = useMemo(
    () => items.length > 0 && items.every((it) => Number(it.customer_unit_rate) === 0),
    [items],
  );
  const money = (value: number) => (pricingPending ? "TBC" : formatZar(value));

  const holds = useMemo(
    () =>
      items.filter(
        (it) =>
          !it.is_included ||
          /\bTBC\b|WARNING|provisional|pending|NOT confirmed|not final/i.test(
            `${it.notes ?? ""} ${it.specification ?? ""}`,
          ),
      ),
    [items],
  );


  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.item_code, it.description, it.specification, it.unit, it.reference]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [items, query]);

  const addComment = async (itemId: string | null) => {
    const key = itemId ?? "general";
    const body = (commentDraft[key] ?? "").trim();
    if (!body || !boq || !user) return;
    setBusy(true);
    const { error: err } = await supabase.from("portal_boq_comments").insert({
      boq_id: boq.id,
      item_id: itemId,
      author_user_id: user.id,
      author_name: clientUser?.full_name ?? clientUser?.email ?? user.email ?? null,
      author_type: "client",
      body,
    });
    setBusy(false);
    if (err) {
      toast({ title: "Could not send query", description: err.message, variant: "destructive" as never });
      return;
    }
    setCommentDraft((prev) => ({ ...prev, [key]: "" }));
    toast({ title: "Query sent", description: "Siyakha has been notified in the portal." });
    loadDetail();
  };

  const submitDecision = async () => {
    if (!boq || !user || !decisionMode) return;
    setBusy(true);
    const { error: err } = await supabase.from("portal_boq_decisions").insert({
      boq_id: boq.id,
      decision: decisionMode,
      decided_by_user_id: user.id,
      decided_by_name: clientUser?.full_name ?? clientUser?.email ?? user.email ?? null,
      message: decisionMessage.trim() || null,
    });
    setBusy(false);
    if (err) {
      toast({ title: "Could not record decision", description: err.message, variant: "destructive" as never });
      return;
    }
    setDecisionMode(null);
    setDecisionMessage("");
    toast({
      title: decisionMode === "accepted" ? "BOQ accepted" : "Changes requested",
      description: "Your decision has been recorded with a timestamp.",
    });
    loadDetail();
  };

  if (portalLoading || loading) return <Loading />;
  if (!activeProject) return <NoProject />;

  return (
    <div>
      <PageHeader
        eyebrow="Bill of Quantities"
        title="BOQ"
        description={`Customer-facing bill of quantities for ${activeProject.title}. All amounts in South African Rand.`}
      />

      {error && <ErrorNote message={error} />}

      {boqs.length === 0 ? (
        <EmptyState
          title="No BOQ shared with you yet"
          description="Siyakha is preparing the bill of quantities for this project. Once a revision is shared, it will appear here with sections, line items and totals — and you will be able to query lines, accept it or request changes."
        />
      ) : (
        <div className="space-y-6">
          <Panel>
            <div className="flex flex-col lg:flex-row lg:items-end gap-6 justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground mb-2">Revision</p>
                <h2 className="font-display text-2xl font-light tracking-tight">{boq?.title}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${statusTone(boq?.status ?? "draft")}`}
                  >
                    {boq?.revision_label}
                  </span>
                  <StatusPill status={boq?.status} />
                  {boq?.published_at && (
                    <span className="text-xs text-muted-foreground">Shared {formatDate(boq.published_at)}</span>
                  )}
                  {boq?.valid_until && (
                    <span className="text-xs text-muted-foreground">Valid until {formatDate(boq.valid_until)}</span>
                  )}
                </div>
                {boqs.length > 1 && (
                  <div className="mt-5 max-w-xs">
                    <Label htmlFor="boq-select" className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                      View revision
                    </Label>
                    <select
                      id="boq-select"
                      value={boqId}
                      onChange={(e) => setBoqId(e.target.value)}
                      className="mt-2 h-10 w-full border border-input bg-background px-3 text-sm"
                    >
                      {boqs.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.revision_label} — {b.status}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <dl className="grid grid-cols-3 gap-6 lg:text-right">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Subtotal</dt>
                  <dd className="mt-1 text-sm">{money(totals.subtotal)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                    VAT {boq?.vat_enabled ? `${Number(boq.vat_rate)}%` : "n/a"}
                  </dt>
                  <dd className="mt-1 text-sm">{money(totals.vat)}</dd>
                </div>

                <div>
                  <dt className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Total</dt>
                  <dd className="mt-1 font-display text-xl font-light tracking-tight">{money(totals.total)}</dd>
                </div>
              </dl>
            </div>

            {pricingPending && (
              <p className="mt-6 border border-dashed border-border p-4 text-xs leading-relaxed text-muted-foreground">
                This revision is a <strong className="font-normal text-foreground">quantity schedule</strong>. Rates are
                marked TBC while the RF, riser and CCTV validation and supplier confirmations are completed — quantities,
                specifications and scope are open for your review and queries now, and priced rates will follow in the
                next revision.
              </p>
            )}


            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center justify-between print:hidden">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <Input
                  aria-label="Search BOQ lines"
                  placeholder="Search item code or description"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" strokeWidth={1.5} /> Print / download
                </Button>
                <Button size="sm" onClick={() => setDecisionMode("accepted")} disabled={items.length === 0}>
                  <Check className="h-4 w-4 mr-2" strokeWidth={1.5} />{" "}
                  {pricingPending ? "Accept quantities & scope" : "Accept BOQ"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDecisionMode("changes_requested")}>
                  <RefreshCcw className="h-4 w-4 mr-2" strokeWidth={1.5} /> Request changes
                </Button>
              </div>
            </div>
          </Panel>

          {snapshot && (
            <Panel title="Live design snapshot">
              <p className="text-sm text-muted-foreground leading-relaxed">
                These figures are read directly from the project floor plans and cable-route model, so the schedule below
                always reflects the current design.
              </p>
              <dl className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-6">
                {[
                  { label: "Levels", value: snapshot.floors },
                  { label: "Wi-Fi access points", value: snapshot.aps },
                  { label: "CCTV cameras", value: snapshot.cameras },
                  { label: "Racks", value: snapshot.racks },
                  { label: "Cable routes", value: snapshot.routes },
                ].map((m) => (
                  <div key={m.label}>
                    <dt className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{m.label}</dt>
                    <dd className="mt-1 font-display text-2xl font-light tracking-tight">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          )}

          {boq?.notes && (
            <Panel title="Basis of this revision">
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{boq.notes}</p>
            </Panel>
          )}

          {holds.length > 0 && (
            <Panel title="Design holds & items to confirm">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {holds.length} line{holds.length === 1 ? "" : "s"} carry a provisional, excluded or to-be-confirmed status.
                These are the decisions we need from you or from site validation before rates are released.
              </p>
              <ul className="mt-5 divide-y divide-border">
                {holds.map((it) => (
                  <li key={it.id} className="py-3">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-xs text-muted-foreground">{it.item_code ?? "—"}</span>
                      <span className="text-sm">{it.description}</span>
                      <span className="border border-dashed border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {it.is_included ? "To confirm" : "Excluded / provisional"}
                      </span>
                    </div>
                    {it.notes && <p className="mt-1 text-xs text-muted-foreground">{it.notes}</p>}
                  </li>
                ))}
              </ul>
            </Panel>
          )}


          {decisionMode && (
            <Panel title="Confirm your decision">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {decisionMode === "accepted"
                  ? pricingPending
                    ? `You are accepting the quantities, specifications and scope of ${boq?.revision_label}. Rates remain TBC and will be issued for separate approval. Your name and the current time will be recorded.`
                    : `You are accepting ${boq?.revision_label} at ${formatZar(totals.total)} including VAT. Your name and the current time will be recorded.`

                  : "Tell Siyakha what needs to change. Your request will be recorded with your name and the current time."}
              </p>
              <div className="mt-4 space-y-2">
                <Label htmlFor="decision-message">Message {decisionMode === "accepted" ? "(optional)" : ""}</Label>
                <Textarea
                  id="decision-message"
                  rows={3}
                  value={decisionMessage}
                  onChange={(e) => setDecisionMessage(e.target.value)}
                />
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={submitDecision} disabled={busy}>
                  {busy ? "Recording…" : decisionMode === "accepted" ? "Confirm acceptance" : "Send change request"}
                </Button>
                <Button variant="ghost" onClick={() => setDecisionMode(null)}>
                  Cancel
                </Button>
              </div>
            </Panel>
          )}

          {items.length === 0 ? (
            <EmptyState
              title="This revision has no priced lines yet"
              description="The section structure is in place. Siyakha will populate quantities and rates, then share the priced revision with you."
            />
          ) : (
            sections.map((section) => {
              const secItems = filteredItems.filter((i) => i.section_id === section.id);
              if (secItems.length === 0) return null;
              const secTotal = secItems.reduce((sum, i) => sum + (i.is_included ? Number(i.line_total) : 0), 0);
              return (
                <Panel key={section.id}>
                  <div className="flex items-baseline justify-between gap-4 mb-5">
                    <div>
                      <h3 className="font-display text-lg font-light tracking-tight">{section.title}</h3>
                      {section.description && (
                        <p className="mt-1 text-xs text-muted-foreground">{section.description}</p>
                      )}
                    </div>
                    <p className="text-sm whitespace-nowrap">{money(secTotal)}</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
                          <th className="text-left py-2 pr-3 font-normal">Code</th>
                          <th className="text-left py-2 pr-3 font-normal">Description</th>
                          <th className="text-right py-2 pr-3 font-normal">Qty</th>
                          <th className="text-left py-2 pr-3 font-normal">Unit</th>
                          <th className="text-right py-2 pr-3 font-normal">Rate</th>
                          <th className="text-right py-2 font-normal">Line total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {secItems.map((it) => {
                          const itemComments = comments.filter((c) => c.item_id === it.id);
                          const expanded = openItem === it.id;
                          return (
                            <React.Fragment key={it.id}>
                              <tr className="border-b border-border/60 align-top">
                                <td className="py-3 pr-3 text-xs text-muted-foreground">{it.item_code ?? "—"}</td>
                                <td className="py-3 pr-3">
                                  <button
                                    type="button"
                                    onClick={() => setOpenItem(expanded ? null : it.id)}
                                    aria-expanded={expanded}
                                    className="text-left hover:underline"
                                  >
                                    {it.description}
                                  </button>
                                  {!it.is_included && (
                                    <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                      Excluded
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 pr-3 text-right">{formatQty(it.quantity)}</td>
                                <td className="py-3 pr-3">{it.unit}</td>
                                <td className="py-3 pr-3 text-right">{money(Number(it.customer_unit_rate))}</td>
                                <td className="py-3 text-right">
                                  {it.is_included ? money(Number(it.line_total)) : "—"}
                                </td>

                              </tr>
                              {expanded && (
                                <tr className="border-b border-border/60 bg-muted/40">
                                  <td colSpan={6} className="p-4">
                                    {it.specification && (
                                      <p className="text-sm leading-relaxed whitespace-pre-line">{it.specification}</p>
                                    )}
                                    {it.notes && (
                                      <p className="mt-2 text-xs text-muted-foreground whitespace-pre-line">{it.notes}</p>
                                    )}
                                    {it.reference && (
                                      <p className="mt-2 text-xs text-muted-foreground">Reference: {it.reference}</p>
                                    )}

                                    {itemComments.length > 0 && (
                                      <ul className="mt-4 space-y-3">
                                        {itemComments.map((c) => (
                                          <li key={c.id} className="border-l-2 border-border pl-3">
                                            <p className="text-xs text-muted-foreground">
                                              {c.author_name ?? "You"} · {formatDate(c.created_at)}
                                            </p>
                                            <p className="text-sm">{c.body}</p>
                                            {c.admin_response && (
                                              <p className="mt-1 text-sm text-muted-foreground">
                                                Siyakha: {c.admin_response}
                                              </p>
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    )}

                                    <div className="mt-4 print:hidden">
                                      <Label htmlFor={`c-${it.id}`} className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                                        Query this line
                                      </Label>
                                      <Textarea
                                        id={`c-${it.id}`}
                                        rows={2}
                                        className="mt-2"
                                        value={commentDraft[it.id] ?? ""}
                                        onChange={(e) =>
                                          setCommentDraft((prev) => ({ ...prev, [it.id]: e.target.value }))
                                        }
                                      />
                                      <Button
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => addComment(it.id)}
                                        disabled={busy || !(commentDraft[it.id] ?? "").trim()}
                                      >
                                        <MessageSquare className="h-4 w-4 mr-2" strokeWidth={1.5} /> Send query
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              );
            })
          )}

          {decisions.length > 0 && (
            <Panel title="Decision history">
              <ul className="divide-y divide-border">
                {decisions.map((d) => (
                  <li key={d.id} className="py-3">
                    <p className="text-sm">
                      {d.decision === "accepted" ? "Accepted" : "Changes requested"} by {d.decided_by_name ?? "client"}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(d.created_at)}</p>
                    {d.message && <p className="mt-1 text-sm text-muted-foreground">{d.message}</p>}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      )}
    </div>
  );
};

export default PortalBOQ;
