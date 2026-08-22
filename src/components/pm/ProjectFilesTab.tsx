import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Panel, Field, selectCls } from "./ui";
import { DOCUMENTS_BUCKET, formatDate, formatFileSize, signedDownloadUrl } from "@/lib/portalFiles";
import { loadSiteImages, type SiteImageWithUrl } from "@/lib/siteImages";
import type { PmWorkspace } from "@/hooks/usePmWorkspace";
import { Download } from "lucide-react";

type Doc = {
  id: string;
  title: string;
  category: string;
  document_date: string | null;
  storage_path: string | null;
  file_size: number | null;
};

/**
 * Read-only view of the documents and site images already stored against the
 * selected project. Uses the existing secure portal data access only.
 */
const ProjectFilesTab: React.FC<{
  ws: PmWorkspace;
  projectId: string;
  setProjectId: (id: string) => void;
}> = ({ ws, projectId, setProjectId }) => {
  const { toast } = useToast();
  const { projects, clients, sites } = ws;
  const [docs, setDocs] = useState<Doc[]>([]);
  const [images, setImages] = useState<SiteImageWithUrl[]>([]);
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

  useEffect(() => {
    if (!projectId) {
      setDocs([]);
      setImages([]);
      return;
    }
    let cancelled = false;
    setBusy(true);
    (async () => {
      try {
        const [docRes, imgs] = await Promise.all([
          supabase
            .from("portal_documents")
            .select("id, title, category, document_date, storage_path, file_size")
            .eq("project_id", projectId)
            .order("document_date", { ascending: false, nullsFirst: false }),
          loadSiteImages(projectId),
        ]);
        if (cancelled) return;
        setDocs((docRes.data ?? []) as unknown as Doc[]);
        setImages(imgs);
      } catch (e) {
        if (!cancelled)
          toast({
            title: "Could not load project files",
            description: (e as Error)?.message ?? String(e),
            variant: "destructive",
          });
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const download = async (d: Doc) => {
    if (!d.storage_path) return;
    try {
      const url = await signedDownloadUrl(DOCUMENTS_BUCKET, d.storage_path, d.title);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast({ title: "Could not open the file", description: (e as Error)?.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <Panel title="Documents &amp; site images">
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
      </Panel>

      {!projectId ? (
        <p className="text-sm text-muted-foreground">Select a project to see its documents and site images.</p>
      ) : busy ? (
        <p className="text-sm text-muted-foreground">Loading project files…</p>
      ) : (
        <>
          <Panel title={`Documents (${docs.length})`}>
            {docs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents stored for this project.</p>
            ) : (
              <ul className="divide-y divide-border">
                {docs.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate">{d.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {d.category} · {formatDate(d.document_date)} · {formatFileSize(d.file_size)}
                      </span>
                    </span>
                    <Button size="sm" variant="outline" disabled={!d.storage_path} onClick={() => download(d)}>
                      <Download className="mr-1 h-3.5 w-3.5" /> Open
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={`Site images (${images.length})`}>
            {images.length === 0 ? (
              <p className="text-sm text-muted-foreground">No site images stored for this project.</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((img) => (
                  <li key={img.id} className="border border-border">
                    {img.url ? (
                      <img
                        src={img.url}
                        alt={img.title || img.original_filename}
                        loading="lazy"
                        className="h-44 w-full object-cover grayscale"
                      />
                    ) : (
                      <div className="flex h-44 w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                        Image unavailable
                      </div>
                    )}
                    <div className="p-3">
                      <p className="truncate text-sm">{img.title || img.original_filename}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {formatDate(img.captured_on)}
                        {img.area ? ` · ${img.area}` : ""}
                        {img.client_visible ? "" : " · internal"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}
    </div>
  );
};

export default ProjectFilesTab;
