import { supabase } from "@/integrations/supabase/client";

export const DOCUMENTS_BUCKET = "client-documents";
export const PHOTOS_BUCKET = "client-photos";

/** Creates a short-lived signed URL for a private portal file. */
export async function signedUrl(bucket: string, path: string, expiresIn = 120) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export async function signedDownloadUrl(bucket: string, path: string, fileName?: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 120, { download: fileName ?? true });
  if (error) throw error;
  return data.signedUrl;
}

export function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(value?: string | null) {
  if (!value) return "TBC";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "TBC";
  return d.toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "2-digit" });
}
