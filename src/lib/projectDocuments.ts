import { supabase } from "@/integrations/supabase/client";
import { DOCUMENTS_BUCKET } from "@/lib/portalFiles";

/**
 * Project documents live in the EXISTING `portal_documents` table and the
 * existing private `client-documents` bucket. This module only adds the office
 * controls Phase 5 asks for (category, reference, revision, floor association,
 * role visibility and current-revision marking) — no second document system.
 */

const db = supabase as any;

export const DOC_CATEGORIES = [
  "Drawing",
  "Scope document",
  "Site instruction",
  "Specification",
  "Client-approved document",
  "Other",
] as const;

export type ProjectDocument = {
  id: string;
  project_id: string;
  title: string;
  category: string;
  reference: string | null;
  version: string | null;
  document_date: string | null;
  floor_id: string | null;
  storage_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  client_visible: boolean;
  technician_visible: boolean;
  is_current: boolean;
  archived: boolean;
  created_at: string;
};

const DOC_COLUMNS =
  "id, project_id, title, category, reference, version, document_date, floor_id, storage_path, file_size, mime_type, client_visible, technician_visible, is_current, archived, created_at";

export async function loadProjectDocuments(projectId: string) {
  const { data, error } = await db
    .from("portal_documents")
    .select(DOC_COLUMNS)
    .eq("project_id", projectId)
    .order("document_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProjectDocument[];
}

export type DocumentMeta = {
  title: string;
  category: string;
  reference?: string | null;
  version?: string | null;
  document_date?: string | null;
  floor_id?: string | null;
  client_visible?: boolean;
  technician_visible?: boolean;
  is_current?: boolean;
};

const nullable = (v?: string | null) => {
  const t = (v ?? "").trim();
  return t.length ? t : null;
};

/** Uploads into the private project folder the storage policies already scope. */
export async function uploadProjectDocument(projectId: string, file: File, meta: DocumentMeta) {
  if (!nullable(meta.title)) throw new Error("Give the document a title.");
  const safe = file.name.replace(/[^\w.\-]+/g, "-").slice(-80);
  const path = `${projectId}/documents/${Date.now()}-${safe}`;
  const up = await supabase.storage.from(DOCUMENTS_BUCKET).upload(path, file, { upsert: false });
  if (up.error) throw up.error;
  const { data, error } = await db
    .from("portal_documents")
    .insert({
      project_id: projectId,
      title: meta.title.trim(),
      category: meta.category,
      reference: nullable(meta.reference),
      version: nullable(meta.version),
      document_date: nullable(meta.document_date),
      floor_id: meta.floor_id || null,
      storage_path: path,
      file_size: file.size,
      mime_type: file.type || null,
      client_visible: !!meta.client_visible,
      technician_visible: !!meta.technician_visible,
      is_current: meta.is_current !== false,
    })
    .select(DOC_COLUMNS)
    .maybeSingle();
  if (error) throw error;
  return data as ProjectDocument;
}

export async function updateProjectDocument(id: string, patch: Partial<ProjectDocument>) {
  const { error } = await db.from("portal_documents").update(patch).eq("id", id);
  if (error) throw error;
}

/**
 * Marks one revision current. Other documents sharing the same reference (or
 * title when no reference exists) become historical — they are retained, never
 * deleted, and stop reading as the current drawing.
 */
export async function markCurrentRevision(doc: ProjectDocument, all: ProjectDocument[]) {
  const siblings = revisionSiblings(doc, all);
  for (const s of siblings) await updateProjectDocument(s.id, { is_current: false });
  await updateProjectDocument(doc.id, { is_current: true, archived: false });
}

/** Documents that describe the same drawing/document as `doc`, excluding itself. */
export function revisionSiblings(doc: ProjectDocument, all: ProjectDocument[]) {
  const key = (d: ProjectDocument) => (d.reference?.trim() || d.title.trim()).toLowerCase();
  return all.filter((d) => d.id !== doc.id && d.project_id === doc.project_id && key(d) === key(doc));
}

/** What a technician link may see: technician-visible, current and not archived. */
export const technicianVisible = (docs: ProjectDocument[]) =>
  docs.filter((d) => d.technician_visible && d.is_current && !d.archived);

/** What a client link may see: only what the office explicitly released. */
export const clientVisible = (docs: ProjectDocument[]) =>
  docs.filter((d) => d.client_visible && !d.archived);

/** "Low Level Layout – Fifth Floor, Rev C" style label used in reports and lists. */
export function documentLabel(d: { title: string; reference?: string | null; version?: string | null }) {
  const ref = (d.reference ?? "").trim();
  const rev = (d.version ?? "").trim();
  const head = ref && ref.toLowerCase() !== d.title.trim().toLowerCase() ? `${d.title} (${ref})` : d.title;
  return rev ? `${head}, Rev ${rev.replace(/^rev\s*/i, "")}` : head;
}
