import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortal, statusLabel } from "@/hooks/usePortal";
import { PageHeader, Loading, ErrorNote, NoProject, EmptyState } from "@/components/portal/ui";
import { formatDate } from "@/lib/portalFiles";

type Update = {
  id: string;
  title: string;
  body: string | null;
  status: string | null;
  author_name: string | null;
  posted_at: string;
};

const PortalUpdates: React.FC = () => {
  const { activeProject, loading, error } = usePortal();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    document.title = "Project Updates | Siyakha Client Portal";
  }, []);

  useEffect(() => {
    if (!activeProject) {
      setBusy(false);
      return;
    }
    let cancelled = false;
    setBusy(true);
    supabase
      .from("portal_updates")
      .select("id, title, body, status, author_name, posted_at")
      .eq("project_id", activeProject.id)
      .order("posted_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setUpdates((data ?? []) as unknown as Update[]);
        setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeProject]);

  if (loading) return <Loading />;
  if (error) return <ErrorNote message={error} />;
  if (!activeProject) return <NoProject />;

  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Activity log"
        title="Project updates"
        description="Chronological implementation updates published by the Siyakha delivery team."
      />

      {busy ? (
        <Loading />
      ) : updates.length === 0 ? (
        <EmptyState
          title="No updates published yet"
          description="Progress notes will appear here as the project moves through survey, design and installation."
        />
      ) : (
        <ol className="border-l border-border pl-6 space-y-8">
          {updates.map((u) => (
            <li key={u.id} className="relative">
              <span
                className="absolute -left-[1.6rem] top-2 h-2 w-2 bg-foreground"
                aria-hidden="true"
              />
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {formatDate(u.posted_at)}
                {u.status ? ` · ${statusLabel(u.status)}` : ""}
                {u.author_name ? ` · ${u.author_name}` : ""}
              </p>
              <h2 className="font-display text-lg font-light tracking-tight mt-2">{u.title}</h2>
              {u.body && (
                <div className="mt-2 space-y-3 text-sm text-foreground/85 leading-relaxed">
                  {u.body.split(/\n{2,}/).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default PortalUpdates;
