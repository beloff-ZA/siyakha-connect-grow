import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { resolveShare, RESOURCE_LABELS, type ShareResourceType } from "@/lib/shareLinks";
import { SIYAKHA } from "@/lib/proposals";
import { formatDate } from "@/lib/portalFiles";
import ProposalDocument from "@/components/pm/ProposalDocument";
import BoqPrintView from "@/components/pm/BoqPrintView";
import ProjectPackDocument from "@/components/pm/ProjectPackDocument";
import PlanSheet from "@/components/pm/PlanSheet";
import { Printer } from "lucide-react";

type Resolved = Awaited<ReturnType<typeof resolveShare>>;

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <main className="min-h-screen bg-background px-4 py-16">
    <div className="mx-auto max-w-md border border-border p-8 text-center">
      <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{SIYAKHA.company}</p>
      {children}
    </div>
  </main>
);

/** Branded, guest-accessible page for one explicitly shared document revision. */
const SharePage: React.FC = () => {
  const { token = "" } = useParams();
  const { toast } = useToast();
  const [state, setState] = useState<Resolved["state"] | "loading">("loading");
  const [data, setData] = useState<Resolved | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const { data: sess } = await supabase.auth.getSession();
      const res = await resolveShare(token, { access_token: sess.session?.access_token ?? "" });
      setData(res);
      setState(res.state);
    } catch {
      setState("unavailable");
    }
  };

  useEffect(() => {
    document.title = "Shared document — Siyakha Technology Solutions";
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const submit = async (action: "comment" | "approve") => {
    setBusy(true);
    try {
      const res = await resolveShare(token, { action, message });
      if (res.state !== "ok") throw new Error("This action is not permitted on this link.");
      toast({ title: action === "approve" ? "Acceptance recorded" : "Message sent to Siyakha" });
      setMessage("");
    } catch (e) {
      toast({ title: "Could not submit", description: (e as any)?.message, variant: "destructive" as never });
    } finally {
      setBusy(false);
    }
  };

  if (state === "loading")
    return (
      <Shell>
        <p className="mt-3 text-sm text-muted-foreground">Opening secure document…</p>
      </Shell>
    );

  if (state === "expired" || state === "revoked" || state === "unavailable" || state === "rate_limited" || state === "denied")
    return (
      <Shell>
        <h1 className="mt-3 text-lg font-semibold">
          {state === "expired" ? "This link has expired" : state === "revoked" ? "This link has been revoked" : state === "rate_limited" ? "Too many attempts" : "Link unavailable"}
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
          Sign in to your client portal with the same device, then reopen this link.
        </p>
        <Button className="mt-4" onClick={() => (window.location.href = "/client-login")}>
          Go to client login
        </Button>
      </Shell>
    );

  const link = data?.link;
  const snap = data?.snapshot ?? {};
  const type = (link?.resource_type ?? "report") as ShareResourceType;

  const body = () => {
    if (type === "proposal" || type === "costing")
      return snap?.proposal ? <ProposalDocument proposal={snap.proposal} variant={type === "costing" ? "costing" : "full"} /> : null;
    if (type === "boq") return snap?.boq_snapshot ? <BoqPrintView snapshot={snap.boq_snapshot} /> : null;
    if (type === "project_pack" || type === "report") return <ProjectPackDocument pack={snap} />;
    if (type === "floor_plan_view")
      return (
        <div className="doc-root space-y-6 bg-white p-6 text-black">
          <h1 className="text-[13pt] font-semibold">{link?.title}</h1>
          {(snap.floors ?? []).map((f: any) => (
            <PlanSheet key={f.id} floor={f} />
          ))}
        </div>
      );
    return null;
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="screen-only sticky top-0 z-10 border-b border-neutral-300 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">{SIYAKHA.company}</p>
            <p className="text-sm font-semibold text-black">
              {RESOURCE_LABELS[type]}
              {link?.revision_label ? ` · ${link.revision_label}` : ""}
            </p>
            <p className="text-xs text-neutral-500">Access valid until {formatDate(link?.expires_at ?? null)}</p>
          </div>
          {link?.download_allowed && (
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" strokeWidth={1.5} /> Download / print
            </Button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-[210mm] bg-white px-6 py-8 print:px-0 print:py-0">{body()}</div>

      {(link?.comments_allowed || link?.approval_allowed) && (
        <section className="screen-only mx-auto max-w-[210mm] border-t border-neutral-300 bg-white px-6 py-6">
          <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">
            {link?.approval_allowed ? "Accept this document" : "Send a query"}
          </p>
          <Textarea
            rows={4}
            className="mt-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={link?.approval_allowed ? "Optional note with your acceptance" : "Your question or comment"}
          />
          <Button
            className="mt-3"
            disabled={busy || (!link?.approval_allowed && !message.trim())}
            onClick={() => submit(link?.approval_allowed ? "approve" : "comment")}
          >
            {link?.approval_allowed ? "Accept document" : "Send to Siyakha"}
          </Button>
        </section>
      )}

      <footer className="screen-only px-4 py-8 text-center text-xs text-neutral-500">
        {SIYAKHA.company} · {SIYAKHA.email} · {SIYAKHA.website}
      </footer>
    </div>
  );
};

export default SharePage;
