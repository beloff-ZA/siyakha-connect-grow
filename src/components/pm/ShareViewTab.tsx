import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Panel, Field, Chip, selectCls } from "./ui";
import { formatDate } from "@/lib/portalFiles";
import { buildProjectPack } from "@/lib/projectPack";
import {
  createShareLink,
  loadShareLinks,
  revokeShareLink,
  shareState,
  type ShareLink,
} from "@/lib/shareLinks";
import { Copy, Link2, ShieldOff } from "lucide-react";
import type { PmWorkspace } from "@/hooks/usePmWorkspace";
import { assertClientSafe, assertExplicitAction, VIEW_ONLY_SHARE_DEFAULTS } from "@/lib/reporting";

/**
 * Simple view-only share workflow. Creates a read-only, client-safe deck link
 * from the existing secure share-link capability. Nothing is emailed, and no
 * approval, acceptance, comment or proposal controls are exposed here.
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
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [days, setDays] = useState("30");
  const [issued, setIssued] = useState("");
  const [busy, setBusy] = useState(false);

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
      return;
    }
    try {
      setLinks(await loadShareLinks({ project_id: id }));
    } catch (e) {
      toast({ title: "Could not load links", description: (e as Error)?.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    setIssued("");
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

  /** Explicit-click only: opening the tab never creates a link. */
  const create = async (trigger: "user" | "effect" = "user") => {
    if (!projectId) return;
    setBusy(true);
    try {
      assertExplicitAction(trigger, "Creating a view link");
      const snapshot = await buildProjectPack(projectId, true);
      assertClientSafe(snapshot, "The shared project view");
      const { url } = await createShareLink({
        resource_type: "project_pack",
        resource_id: null,
        revision_label: null,
        title: `${snapshot.project.title} — view only`,
        project_id: projectId,
        client_id: (snapshot.client as { id?: string } | null)?.id ?? null,
        snapshot,
        ...VIEW_ONLY_SHARE_DEFAULTS,
        require_client_login: false,
        expires_at: new Date(Date.now() + Math.max(1, Number(days) || 30) * 86400000).toISOString(),
      });
      setIssued(url);
      await copy(url);
      await refresh(projectId);
    } catch (e) {
      toast({ title: "Could not create the view link", description: (e as Error)?.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (id: string) => {
    setBusy(true);
    try {
      await revokeShareLink(id);
      toast({ title: "Link revoked" });
      await refresh(projectId);
    } catch (e) {
      toast({ title: "Could not revoke the link", description: (e as Error)?.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Panel title="Share view link">
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Expires in (days)">
            <Input type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} />
          </Field>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Creates a secure, read-only link to a frozen client-safe view of the project. Supplier costs, markup, margin
          and internal notes are never included, and no email is sent — you copy and share the link yourself.
        </p>
        <Button className="mt-3" size="sm" disabled={!projectId || busy} onClick={create}>
          <Link2 className="mr-1 h-3.5 w-3.5" /> Create view link
        </Button>
        {issued && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border border-border p-3 text-xs">
            <span className="min-w-0 flex-1 truncate">{issued}</span>
            <Button size="sm" variant="outline" onClick={() => copy(issued)}>
              <Copy className="mr-1 h-3.5 w-3.5" /> Copy
            </Button>
          </div>
        )}
      </Panel>

      {projectId && (
        <Panel title={`Issued links (${links.length})`}>
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground">No links issued for this project yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {links.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate">{l.title}</span>
                    <span className="text-xs text-muted-foreground">expires {formatDate(l.expires_at)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Chip className="border-muted-foreground text-muted-foreground">{shareState(l)}</Chip>
                    {shareState(l) === "active" && (
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => revoke(l.id)}>
                        <ShieldOff className="mr-1 h-3.5 w-3.5" /> Revoke
                      </Button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </div>
  );
};

export default ShareViewTab;
