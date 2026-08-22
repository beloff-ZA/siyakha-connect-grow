import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Chip, Field, selectCls } from "./ui";
import { formatDate } from "@/lib/portalFiles";
import {
  createShareLink,
  loadShareAccessLog,
  loadShareLinks,
  PERMISSIONS,
  permissionLabel,
  RESOURCE_LABELS,
  regenerateShareLink,
  revokeShareLink,
  setShareExpiry,
  shareState,
  type ShareLink,
  type ShareResourceType,
  type SharePermission,
} from "@/lib/shareLinks";
import { Copy, History, Link2, RefreshCw, ShieldOff } from "lucide-react";

export type ShareTarget = {
  resource_type: ShareResourceType;
  resource_id?: string | null;
  revision_label?: string | null;
  title: string;
  project_id: string;
  client_id?: string | null;
  /** Frozen, client-safe snapshot of exactly what will be shared. */
  snapshot: unknown;
};

const stateTone = (s: string) =>
  s === "active" ? "border-foreground text-foreground" : "border-muted-foreground text-muted-foreground";

/**
 * Admin-only share manager. Creating or copying a link never sends any email or
 * message — the owner shares the URL manually.
 */
const ShareDialog: React.FC<{ open: boolean; onOpenChange: (v: boolean) => void; target: ShareTarget | null }> = ({
  open,
  onOpenChange,
  target,
}) => {
  const { toast } = useToast();
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState<string>("");
  const [history, setHistory] = useState<{ id: string; rows: any[] } | null>(null);
  const [form, setForm] = useState({
    permission_scope: "view" as SharePermission,
    days: "30",
    require_client_login: false,
    recipient_label: "",
    recipient_email: "",
  });

  const refresh = async () => {
    if (!target) return;
    try {
      setLinks(
        await loadShareLinks(
          target.resource_id ? { resource_id: target.resource_id } : { project_id: target.project_id },
        ),
      );
    } catch (e) {
      toast({ title: "Could not load share links", description: (e as any)?.message, variant: "destructive" as never });
    }
  };

  useEffect(() => {
    if (open) {
      setIssued("");
      setHistory(null);
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, target?.resource_id, target?.project_id]);

  const expiresAt = useMemo(
    () => new Date(Date.now() * 1 + Math.max(1, Number(form.days) || 30) * 86400000).toISOString(),
    [form.days],
  );

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: "Nothing was emailed — share it manually." });
    } catch {
      toast({ title: "Copy the link manually", description: url });
    }
  };

  const create = async () => {
    if (!target) return;
    setBusy(true);
    try {
      const { url } = await createShareLink({
        resource_type: target.resource_type,
        resource_id: target.resource_id ?? null,
        revision_label: target.revision_label ?? null,
        title: target.title,
        project_id: target.project_id,
        client_id: target.client_id ?? null,
        snapshot: target.snapshot,
        permission_scope: form.permission_scope,
        require_client_login: form.require_client_login,
        recipient_label: form.recipient_label,
        recipient_email: form.recipient_email,
        expires_at: expiresAt,
      });
      setIssued(url);
      await copy(url);
      await refresh();
    } catch (e) {
      toast({ title: "Could not create link", description: (e as any)?.message, variant: "destructive" as never });
    } finally {
      setBusy(false);
    }
  };

  const act = async (fn: () => Promise<unknown>, title: string) => {
    setBusy(true);
    try {
      const res = await fn();
      if (typeof res === "string") {
        setIssued(res);
        await copy(res);
      }
      toast({ title });
      await refresh();
    } catch (e) {
      toast({ title: "Action failed", description: (e as any)?.message, variant: "destructive" as never });
    } finally {
      setBusy(false);
    }
  };

  const openHistory = async (id: string) => {
    try {
      setHistory({ id, rows: await loadShareAccessLog(id) });
    } catch (e) {
      toast({ title: "Could not load access history", description: (e as any)?.message, variant: "destructive" as never });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share with client</DialogTitle>
        </DialogHeader>

        {target && (
          <>
            <p className="text-xs text-muted-foreground">
              {RESOURCE_LABELS[target.resource_type]} · {target.title}
              {target.revision_label ? ` · ${target.revision_label}` : ""}. The link opens a branded Siyakha page showing
              this exact frozen revision. Supplier costs, markup, margin and internal notes are never included.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Permission scope">
                <select
                  className={selectCls}
                  value={form.permission_scope}
                  onChange={(e) => setForm({ ...form, permission_scope: e.target.value as SharePermission })}
                >
                  {PERMISSIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Expires in (days)">
                <Input type="number" min={1} value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} />
              </Field>
              <Field label="Recipient label (admin reference)">
                <Input value={form.recipient_label} onChange={(e) => setForm({ ...form, recipient_label: e.target.value })} />
              </Field>
              <Field label="Recipient email (admin reference only)">
                <Input value={form.recipient_email} onChange={(e) => setForm({ ...form, recipient_email: e.target.value })} />
              </Field>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.require_client_login}
                  onChange={(e) => setForm({ ...form, require_client_login: e.target.checked })}
                />
                Client portal login required (otherwise a secure guest link)
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={create} disabled={busy}>
                <Link2 className="mr-2 h-4 w-4" strokeWidth={1.5} /> Create link
              </Button>
              {issued && (
                <Button size="sm" variant="outline" onClick={() => copy(issued)}>
                  <Copy className="mr-2 h-4 w-4" strokeWidth={1.5} /> Copy link
                </Button>
              )}
            </div>

            {issued && (
              <p className="mt-3 break-all border border-border p-3 text-xs">
                {issued}
                <br />
                <span className="text-muted-foreground">
                  Shown once — only a hash is stored. Regenerate the link if it is lost.
                </span>
              </p>
            )}
          </>
        )}

        <div className="mt-6">
          <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Existing links ({links.length})
          </p>
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground">No links created yet.</p>
          ) : (
            <div className="space-y-3">
              {links.map((l) => {
                const st = shareState(l);
                return (
                  <article key={l.id} className="border border-border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip className={stateTone(st)}>{st}</Chip>
                      <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {RESOURCE_LABELS[l.resource_type]}
                        {l.revision_label ? ` · ${l.revision_label}` : ""}
                      </span>
                      {l.require_client_login && <Chip>Login required</Chip>}
                    </div>
                    <p className="mt-1 text-sm">{l.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {permissionLabel(l.permission_scope)} · expires {formatDate(l.expires_at)} · {l.access_count} views
                      {l.last_accessed_at ? ` · last ${formatDate(l.last_accessed_at)}` : ""}
                      {l.recipient_label ? ` · for ${l.recipient_label}` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy || st === "revoked"}
                        onClick={() => act(() => setShareExpiry(l.id, new Date(Date.now() + 30 * 86400000).toISOString()), "Expiry extended by 30 days")}
                      >
                        Extend 30 days
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => act(() => regenerateShareLink(l.id), "New link issued")}>
                        <RefreshCw className="mr-2 h-4 w-4" strokeWidth={1.5} /> Regenerate
                      </Button>
                      <Button size="sm" variant="ghost" disabled={busy || st === "revoked"} onClick={() => act(() => revokeShareLink(l.id), "Link revoked")}>
                        <ShieldOff className="mr-2 h-4 w-4" strokeWidth={1.5} /> Revoke
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openHistory(l.id)}>
                        <History className="mr-2 h-4 w-4" strokeWidth={1.5} /> Access history
                      </Button>
                    </div>

                    {history?.id === l.id && (
                      <div className="mt-3 border-t border-border pt-2">
                        {history.rows.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No access recorded.</p>
                        ) : (
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            {history.rows.map((r) => (
                              <li key={r.id}>
                                {formatDate(r.accessed_at)} · {r.action} · {r.outcome}
                                {r.detail ? ` · ${r.detail}` : ""}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
