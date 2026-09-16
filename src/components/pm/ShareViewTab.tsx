import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Panel, Field, Chip, selectCls } from "./ui";
import { formatDate } from "@/lib/portalFiles";
import { loadShareLinks, revokeShareLink, shareState, type ShareLink } from "@/lib/shareLinks";
import {
  issueDeliveryLink,
  loadDeliveryLinks,
  regenerateDeliveryLink,
  revealDeliveryLink,
  revokeDeliveryLink,
  type DeliveryLink,
} from "@/lib/siteDelivery";
import { Copy, ExternalLink, Link2, RefreshCw, ShieldOff } from "lucide-react";
import type { PmWorkspace } from "@/hooks/usePmWorkspace";

/** Admin label for the internal role names. "field" is never shown to the user. */
const ROLE_LABEL = { field: "Technician", client: "Client" } as const;
type LinkRole = keyof typeof ROLE_LABEL;

const linkState = (l: DeliveryLink) =>
  l.revoked_at ? "revoked" : new Date(l.expires_at) <= new Date() ? "expired" : "active";

/**
 * Secure view link: the single admin place to issue project access links.
 * It reuses the existing site-delivery share links (technician /field/:token and
 * read-only client /site-progress/:token) — no second token system — and keeps
 * historical project-view links visible so nothing already sent is broken.
 */
const ShareViewTab: React.FC<{
  ws: PmWorkspace;
  projectId: string;
  setProjectId: (id: string) => void;
  /** Hides the project picker when the project comes from the URL. */
  locked?: boolean;
}> = ({ ws, projectId, setProjectId, locked }) => {
  const { toast } = useToast();
  const { projects, clients, sites } = ws;
  const [links, setLinks] = useState<DeliveryLink[]>([]);
  const [legacy, setLegacy] = useState<ShareLink[]>([]);
  const [role, setRole] = useState<LinkRole>("client");
  const [label, setLabel] = useState("");
  const [days, setDays] = useState("30");
  const [issued, setIssued] = useState("");
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const project = projects.find((p) => p.id === projectId) ?? null;

  const options = useMemo(
    () =>
      projects.map((p) => {
        const client = clients.find((c) => c.id === p.client_id)?.display_name ?? "Unassigned";
        const site = sites.find((s) => s.id === p.site_id)?.name;
        return { id: p.id, label: [client, site, p.title].filter(Boolean).join(" — ") };
      }),
    [projects, clients, sites],
  );

  const refresh = async (id: string) => {
    if (!id) {
      setLinks([]);
      setLegacy([]);
      return;
    }
    try {
      const [delivery, all] = await Promise.all([loadDeliveryLinks(id), loadShareLinks({ project_id: id })]);
      setLinks(delivery);
      setLegacy(all.filter((l) => l.resource_type !== "site_delivery"));
    } catch (e) {
      toast({ title: "Could not load links", description: (e as Error)?.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    setIssued("");
    setUrls({});
    refresh(projectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: "Nothing was emailed — share it manually." });
    } catch {
      toast({ title: "Copy the link manually", description: url });
    }
  };

  const run = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    try {
      await fn();
      toast({ title: ok });
      await refresh(projectId);
    } catch (e) {
      toast({ title: "That did not work", description: (e as Error)?.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  /** Explicit-click only: opening the tab never creates a link. */
  const create = (regenerate: boolean) =>
    run(async () => {
      if (!projectId || !project) throw new Error("Select a project first.");
      const input = {
        project_id: projectId,
        client_id: project.client_id ?? null,
        title: project.title,
        role,
        assignee_label: label.trim() || null,
        days: Math.max(1, Number(days) || 30),
      };
      const res = regenerate ? await regenerateDeliveryLink(input, links) : await issueDeliveryLink(input);
      setIssued(res.url);
      setUrls((prev) => ({ ...prev, [res.id]: res.url }));
      await copy(res.url);
    }, regenerate ? "New link created — the old one no longer works" : "Link created");

  const liveOfRole = links.filter((l) => l.link_role === role && linkState(l) === "active");

  return (
    <div>
      <Panel title="Secure view link">
        {!locked && (
          <Field label="Client → site → project">
            <select className={selectCls} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Select a project…</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Link type">
            <select className={selectCls} value={role} onChange={(e) => setRole(e.target.value as LinkRole)}>
              <option value="client">Client</option>
              <option value="field">Technician</option>
            </select>
          </Field>
          <Field label={role === "field" ? "Technician name" : "Recipient"}>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={role === "field" ? "e.g. Michael (Mike)" : "e.g. Digiconnect / Sun International"}
            />
          </Field>
          <Field label="Expires in (days)">
            <Input type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} />
          </Field>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          {role === "field"
            ? "A technician link opens the daily site form: site updates, problems and timestamped photos. No pricing, no client reports, no admin screens."
            : "A client link is a read-only progress view showing approved information only. Supplier costs, markup, margin and internal notes are never included."}{" "}
          Each link is a long random address, not a password. Nothing is emailed — you copy and send it yourself.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" disabled={!projectId || busy} onClick={() => create(false)}>
            <Link2 className="mr-1 h-3.5 w-3.5" /> Create {ROLE_LABEL[role].toLowerCase()} link
          </Button>
          {!!liveOfRole.length && (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => create(true)}>
              <RefreshCw className="mr-1 h-3.5 w-3.5" /> Regenerate (revokes old)
            </Button>
          )}
        </div>

        {issued && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border border-border p-3 text-xs">
            <span className="min-w-0 flex-1 break-all">{issued}</span>
            <Button size="sm" variant="outline" onClick={() => copy(issued)}>
              <Copy className="mr-1 h-3.5 w-3.5" /> Copy
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={issued} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1 h-3.5 w-3.5" /> Open
              </a>
            </Button>
          </div>
        )}
      </Panel>

      {projectId && (
        <Panel title={`Issued links (${links.length})`}>
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground">No technician or client link issued for this project yet.</p>
          ) : (
            <div className="space-y-2">
              {links.map((l) => {
                const state = linkState(l);
                const known = urls[l.id];
                return (
                  <div key={l.id} className="flex flex-wrap items-center gap-2 border border-border p-3 text-xs">
                    <Chip className="border-foreground font-semibold text-foreground">
                      {ROLE_LABEL[l.link_role].toUpperCase()}
                    </Chip>
                    <Chip className="border-muted-foreground text-muted-foreground">{state}</Chip>
                    <span className="font-medium">{l.assignee_label ?? l.recipient_label ?? "Unnamed"}</span>
                    <span className="text-muted-foreground">
                      created {formatDate(l.created_at)} · opened {l.access_count}× · expires {formatDate(l.expires_at)}
                    </span>
                    {state === "active" && known && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => copy(known)}>
                          <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={known} target="_blank" rel="noreferrer">
                            <ExternalLink className="mr-1 h-3.5 w-3.5" /> Open
                          </a>
                        </Button>
                      </>
                    )}
                    {state === "active" && !known && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            const url = await revealDeliveryLink(l.id, l.link_role);
                            if (!url) throw new Error("This link cannot be recovered. Use Regenerate to issue a fresh one.");
                            setUrls((prev) => ({ ...prev, [l.id]: url }));
                          }, "Link ready to copy")
                        }
                      >
                        Show link
                      </Button>
                    )}
                    {!l.revoked_at && (
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => run(() => revokeDeliveryLink(l.id), "Link revoked")}>
                        <ShieldOff className="mr-1 h-3.5 w-3.5" /> Revoke
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      )}

      {projectId && legacy.length > 0 && (
        <Panel title={`Existing project view links (${legacy.length})`}>
          <p className="mb-3 text-xs text-muted-foreground">
            Read-only client project views issued earlier. They still work for whoever already has the address, and nothing
            here has been changed or replaced.
          </p>
          <div className="space-y-2">
            {legacy.map((l) => (
              <div key={l.id} className="flex flex-wrap items-center gap-2 border border-border p-3 text-xs">
                <Chip className="border-foreground font-semibold text-foreground">CLIENT / PROJECT VIEW</Chip>
                <Chip className="border-muted-foreground text-muted-foreground">{shareState(l)}</Chip>
                <span className="font-medium">{l.title}</span>
                <span className="text-muted-foreground">
                  created {formatDate(l.created_at)} · expires {formatDate(l.expires_at)}
                </span>
                {shareState(l) === "active" && (
                  <>
                    <span className="text-muted-foreground">
                      Original address not recoverable — create a new client link.
                    </span>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => run(() => revokeShareLink(l.id), "Link revoked")}>
                      <ShieldOff className="mr-1 h-3.5 w-3.5" /> Revoke
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
};

export default ShareViewTab;
