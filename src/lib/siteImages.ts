import { supabase } from "@/integrations/supabase/client";
import { DOCUMENTS_BUCKET, signedUrl } from "@/lib/portalFiles";

export const SITE_IMAGES_BUCKET = DOCUMENTS_BUCKET;

export type SiteImage = {
  id: string;
  project_id: string;
  storage_path: string;
  original_filename: string;
  title: string;
  caption: string | null;
  area: string | null;
  category: string;
  captured_on: string | null;
  sort_order: number;
  client_visible: boolean;
};

export type SiteImageWithUrl = SiteImage & { url?: string };

/** Loads site images for a project and resolves short-lived signed URLs. */
export async function loadSiteImages(projectId: string, expiresIn = 600) {
  const { data, error } = await supabase
    .from("portal_site_images")
    .select(
      "id, project_id, storage_path, original_filename, title, caption, area, category, captured_on, sort_order, client_visible",
    )
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as SiteImage[];
  return Promise.all(
    rows.map(async (row) => {
      try {
        return { ...row, url: await signedUrl(SITE_IMAGES_BUCKET, row.storage_path, expiresIn) };
      } catch {
        return { ...row } as SiteImageWithUrl;
      }
    }),
  );
}

export function siteImageStoragePath(projectId: string, capturedOn: string, filename: string) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const day = /^\d{4}-\d{2}-\d{2}$/.test(capturedOn) ? capturedOn : "undated";
  return `projects/${projectId}/site-images/${day}/${safe}`;
}

export const uniqueValues = (values: (string | null)[]) =>
  Array.from(new Set(values.filter((v): v is string => !!v && v.trim().length > 0))).sort();
