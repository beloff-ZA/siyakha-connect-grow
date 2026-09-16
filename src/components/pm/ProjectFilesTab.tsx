import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Panel, Field, selectCls } from "./ui";
import { DOCUMENTS_BUCKET, formatDate, formatFileSize, signedDownloadUrl } from "@/lib/portalFiles";
import { loadSiteImages, type SiteImageWithUrl } from "@/lib/siteImages";
import {
  DOC_CATEGORIES,
  documentLabel,
  loadProjectDocuments,
  markCurrentRevision,
  updateProjectDocument,
  uploadProjectDocument,
  type ProjectDocument,
} from "@/lib/projectDocuments";
import type { PmWorkspace } from "@/hooks/usePmWorkspace";
import { Download } from "lucide-react";

type Doc = ProjectDocument;

const inputCls = "h-10 border border-input bg-background px-3 text-sm w-full";


const emptyMeta = () => ({
  title: "",
  category: "Drawing" as string,
  reference: "",
  version: "",
  document_date: "",
  floor_id: "",
  client_visible: false,
  technician_visible: false,
});

/**
 * The project's documents and site images. Documents use the existing
 * `portal_documents` records and private storage bucket; this screen only adds
 * the office upload and visibility controls.
 */
const ProjectFilesTab: React.FC<{
  ws: PmWorkspace;
  projectId: string;
  setProjectId: (id: string) => void;
  /** Hides the project picker when the project comes from the URL. */
  locked?: boolean;
}> = ({ ws, projectId, setProjectId, locked }) => {
  const { toast } = useToast();
  const { projects, clients, sites } = ws;
  const [docs, setDocs] = useState<Doc[]>([]);
  const [images, setImages] = useState<SiteImageWithUrl[]>([]);
  const [busy, setBusy] = useState(false);
  const [floors, setFloors] = useState<{ id: string; display_name: string }[]>([]);
  const [meta, setMeta] = useState(emptyMeta());
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const options = useMemo(
    () =>
      projects.map((p) => {
        const client = clients.find((c) => c.id === p.client_id)?.display_name ?? "Unassigned";
        const site = sites.find((s) => s.id === p.site_id)?.name;
        return { id: p.id, label: [client, site, p.title].filter(Boolean).join(" — ") };
      }),
    [projects, clients, sites],
  );

  const reloadDocs = async () => setDocs(await loadProjectDocuments(projectId));

  useEffect(() => {
    if (!projectId) {
      setDocs([]);
      setImages([]);
      setFloors([]);
      return;
    }
    let cancelled = false;
    setBusy(true);
    (async () => {
      try {
        const [documents, imgs, floorRes] = await Promise.all([
          loadProjectDocuments(projectId),
          loadSiteImages(projectId),
          supabase
            .from("portal_floors")
            .select("id, display_name")
            .eq("project_id", projectId)
            .order("sort_order"),
        ]);
        if (cancelled) return;
        setDocs(documents);
        setImages(imgs);
        setFloors((floorRes.data ?? []) as { id: string; display_name: string }[]);
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

  const run = async (fn: () => Promise<void>, ok: string) => {
    setSaving(true);
    try {
      await fn();
      await reloadDocs();
      toast({ title: ok });
    } catch (e) {
      toast({ title: "Could not save", description: (e as Error)?.message ?? String(e), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const upload = () =>
    run(async () => {
      if (!file) throw new Error("Choose a file to upload.");
      await uploadProjectDocument(projectId, file, meta);
      setMeta(emptyMeta());
      setFile(null);
    }, "Document uploaded");

  const floorLabel = (id: string | null) => floors.find((f) => f.id === id)?.display_name ?? "Whole project";


  return (
    <div>
      <Panel title="Documents &amp; site images">
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
      </Panel>

      {!projectId ? (
        <p className="text-sm text-muted-foreground">Select a project to see its documents and site images.</p>
      ) : busy ? (
        <p className="text-sm text-muted-foreground">Loading project files…</p>
      ) : (
        <>
          <Panel title="Upload a document or drawing">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Title">
                <input
                  className={inputCls}
                  value={meta.title}
                  placeholder="Low Level Layout – Fifth Floor"
                  onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                />
              </Field>
              <Field label="Type">
                <select className={selectCls} value={meta.category} onChange={(e) => setMeta({ ...meta, category: e.target.value })}>
                  {DOC_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Reference">
                <input className={inputCls} value={meta.reference} onChange={(e) => setMeta({ ...meta, reference: e.target.value })} />
              </Field>
              <Field label="Revision">
                <input
                  className={inputCls}
                  value={meta.version}
                  placeholder="C"
                  onChange={(e) => setMeta({ ...meta, version: e.target.value })}
                />
              </Field>
              <Field label="Document date">
                <input
                  type="date"
                  className={inputCls}
                  value={meta.document_date}
                  onChange={(e) => setMeta({ ...meta, document_date: e.target.value })}
                />
              </Field>
              <Field label="Floor / area">
                <select className={selectCls} value={meta.floor_id} onChange={(e) => setMeta({ ...meta, floor_id: e.target.value })}>
                  <option value="">Whole project</option>
                  {floors.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.display_name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="File">
                <input type="file" className={inputCls} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </Field>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={meta.technician_visible}
                  onChange={(e) => setMeta({ ...meta, technician_visible: e.target.checked })}
                />
                Technician can see it
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={meta.client_visible}
                  onChange={(e) => setMeta({ ...meta, client_visible: e.target.checked })}
                />
                Client can see it
              </label>
              <Button size="sm" disabled={saving || !file || !meta.title.trim()} onClick={upload}>
                Upload document
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Files stay in private storage. Technician and client links only ever receive a short-lived link to the
              documents you release to them.
            </p>
          </Panel>

          <Panel title={`Documents (${docs.length})`}>
            {docs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents stored for this project.</p>
            ) : (
              <ul className="divide-y divide-border">
                {docs.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate">
                        {documentLabel(d)}
                        {d.is_current && !d.archived ? " · CURRENT" : ""}
                        {!d.is_current ? " · superseded" : ""}
                        {d.archived ? " · archived" : ""}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {d.category} · {floorLabel(d.floor_id)} · {formatDate(d.document_date)} ·{" "}
                        {formatFileSize(d.file_size)} · {d.technician_visible ? "technician" : "office only"}
                        {d.client_visible ? " · client" : ""}
                      </span>
                    </span>
                    <span className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" disabled={!d.storage_path} onClick={() => download(d)}>
                        <Download className="mr-1 h-3.5 w-3.5" /> Open
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={saving}
                        onClick={() => run(() => updateProjectDocument(d.id, { client_visible: !d.client_visible }), "Client visibility updated")}
                      >
                        {d.client_visible ? "Hide from client" : "Show to client"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={saving}
                        onClick={() =>
                          run(() => updateProjectDocument(d.id, { technician_visible: !d.technician_visible }), "Technician visibility updated")
                        }
                      >
                        {d.technician_visible ? "Hide from technician" : "Show to technician"}
                      </Button>
                      {!d.is_current && (
                        <Button size="sm" variant="ghost" disabled={saving} onClick={() => run(() => markCurrentRevision(d, docs), "Marked as current")}>
                          Mark current
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={saving}
                        onClick={() =>
                          run(
                            () =>
                              updateProjectDocument(d.id, {
                                archived: !d.archived,
                                ...(d.archived ? {} : { is_current: false }),
                              }),
                            d.archived ? "Restored" : "Archived as history",
                          )
                        }
                      >
                        {d.archived ? "Restore" : "Archive"}
                      </Button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Marking a revision current keeps older revisions on record but stops them showing as the current drawing.
              Nothing is deleted.
            </p>
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
