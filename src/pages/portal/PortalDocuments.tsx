import React, { useEffect, useMemo, useState } from "react";
import { Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePortal } from "@/hooks/usePortal";
import { PageHeader, Loading, ErrorNote, NoProject, EmptyState } from "@/components/portal/ui";
import { DOCUMENTS_BUCKET, formatDate, formatFileSize, signedDownloadUrl, signedUrl } from "@/lib/portalFiles";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type Doc = {
  id: string;
  title: string;
  category: string;
  version: string | null;
  reference: string | null;
  phase_id: string | null;
  document_date: string | null;
  storage_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  notes: string | null;
};


const PortalDocuments: React.FC = () => {
  const { activeProject, loading, error } = usePortal();
  const { toast } = useToast();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [phaseNames, setPhaseNames] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    document.title = "Documents | Siyakha Client Portal";
  }, []);

  useEffect(() => {
    if (!activeProject) {
      setBusy(false);
      return;
    }
    let cancelled = false;
    setBusy(true);
    Promise.all([
      supabase
        .from("portal_documents")
        .select("*")
        .eq("project_id", activeProject.id)
        .order("document_date", { ascending: false, nullsFirst: false }),
      supabase.from("portal_phases").select("id,name").eq("project_id", activeProject.id),
    ]).then(([docRes, phaseRes]) => {
      if (cancelled) return;
      setDocs((docRes.data ?? []) as unknown as Doc[]);
      setPhaseNames(
        Object.fromEntries(((phaseRes.data ?? []) as { id: string; name: string }[]).map((p) => [p.id, p.name])),
      );
      setBusy(false);
    });
    return () => {
      cancelled = true;
    };
  }, [activeProject]);



  const categories = useMemo(
    () => ["all", ...Array.from(new Set(docs.map((d) => d.category)))],
    [docs],
  );

  const filtered = docs.filter((d) => {
    const matchesCategory = category === "all" || d.category === category;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      d.title.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      (d.notes ?? "").toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const open = async (doc: Doc, download: boolean) => {
    if (!doc.storage_path) {
      toast({ title: "File not available", description: "This document record has no file attached yet." });
      return;
    }
    try {
      const url = download
        ? await signedDownloadUrl(DOCUMENTS_BUCKET, doc.storage_path, `${doc.title}.pdf`)
        : await signedUrl(DOCUMENTS_BUCKET, doc.storage_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast({
        title: "Could not open document",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive" as never,
      });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorNote message={error} />;
  if (!activeProject) return <NoProject />;

  return (
    <div className="max-w-5xl">
      <PageHeader
        eyebrow="Document register"
        title="Documents"
        description="Approved plans, drawings and project records. Files are stored privately and opened through short-lived secure links."
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1">
          <label htmlFor="doc-search" className="sr-only">
            Search documents
          </label>
          <Input
            id="doc-search"
            placeholder="Search documents…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="doc-category" className="sr-only">
            Filter by category
          </label>
          <select
            id="doc-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 w-full sm:w-56 border border-input bg-background px-3 text-sm"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {busy ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={docs.length === 0 ? "No documents yet" : "No documents match your search"}
          description={
            docs.length === 0
              ? "Approved plans and project records will appear here as they are issued."
              : "Try a different search term or category."
          }
        />
      ) : (
        <ul className="border border-border divide-y divide-border">
          {filtered.map((d) => (
            <li key={d.id} className="p-5 md:p-6 flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-1">
                  {d.category}
                </p>
                <p className="font-display text-lg font-light tracking-tight">{d.title}</p>
                {d.notes && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{d.notes}</p>}
                <div className="flex flex-wrap gap-2 mt-3">
                  {d.version && (
                    <span className="text-[10px] uppercase tracking-[0.2em] border border-border px-2 py-1">
                      {d.version}
                    </span>
                  )}
                  {d.reference && (
                    <span className="text-[10px] uppercase tracking-[0.2em] border border-border px-2 py-1">
                      Ref {d.reference}
                    </span>
                  )}
                  {d.phase_id && phaseNames[d.phase_id] && (
                    <span className="text-[10px] uppercase tracking-[0.2em] border border-border px-2 py-1">
                      {phaseNames[d.phase_id]}
                    </span>
                  )}
                  {!d.storage_path && (
                    <span className="text-[10px] uppercase tracking-[0.2em] border border-border px-2 py-1">
                      File pending
                    </span>
                  )}
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-3">
                  Issued {formatDate(d.document_date)} · {formatFileSize(d.file_size)}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => open(d, false)}
                  disabled={!d.storage_path}
                  className="inline-flex items-center gap-2 border border-border px-4 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Eye className="h-3.5 w-3.5" strokeWidth={1.5} /> View
                </button>
                <button
                  type="button"
                  onClick={() => open(d, true)}
                  disabled={!d.storage_path}
                  className="inline-flex items-center gap-2 border border-border px-4 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download className="h-3.5 w-3.5" strokeWidth={1.5} /> Download
                </button>
              </div>
            </li>

          ))}
        </ul>
      )}
    </div>
  );
};

export default PortalDocuments;
