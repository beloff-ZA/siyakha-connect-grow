import { supabase } from "@/integrations/supabase/client";
import type { PhotoCategory } from "@/lib/siteDelivery";

/**
 * Guest-side client for the two site-delivery links. Every call goes through
 * the `site-delivery` edge function, which validates the share token, its role
 * and its expiry before any project data is touched.
 */

export type LinkState = "ok" | "expired" | "revoked" | "unavailable" | "denied";

export type FieldFloor = {
  id: string;
  level_number: number;
  display_name: string;
  floor_use: string | null;
  progress_pct: number;
  status: string;
  note: string | null;
  drawing_url: string | null;
};

export type GuestPhoto = {
  id: string;
  update_id?: string | null;
  category: PhotoCategory;
  caption: string | null;
  floor_id: string | null;
  taken_at: string;
  client_visible: boolean;
  url: string | null;
};

export type GuestProject = {
  title: string;
  reference: string | null;
  status: string | null;
  scope: string | null;
  address: string | null;
  start_date: string | null;
  target_date: string | null;
  client_name: string | null;
  site_name: string | null;
  site_location: string | null;
};

export type GuestDocument = { id: string; title: string; category: string | null; reference: string | null; url: string | null };

export type FieldJob = {
  state: LinkState;
  role?: "field";
  technician?: { id: string; name: string; role_label: string };
  device_remembered?: boolean;
  project?: GuestProject;
  floors?: FieldFloor[];
  updates?: any[];
  issues?: any[];
  documents?: GuestDocument[];
  photos?: GuestPhoto[];
  today?: string;
};

export type ClientProgress = {
  state: LinkState;
  role?: "client";
  project?: GuestProject;
  overall_progress?: number;
  last_updated?: string | null;
  floors?: FieldFloor[];
  updates?: any[];
  issues?: any[];
  photos?: GuestPhoto[];
  documents?: GuestDocument[];
};

const DEVICE_KEY = "siyakha_field_device";

export const rememberedDevice = () => {
  try {
    return localStorage.getItem(DEVICE_KEY) ?? "";
  } catch {
    return "";
  }
};

export const storeDevice = (value: string) => {
  try {
    localStorage.setItem(DEVICE_KEY, value);
  } catch {
    /* private mode — the link still works, it just asks again */
  }
};

export const clearDevice = () => {
  try {
    localStorage.removeItem(DEVICE_KEY);
  } catch {
    /* ignore */
  }
};

async function call<T>(token: string, action: string, payload?: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke("site-delivery", {
    body: { token, action, device: rememberedDevice(), payload: payload ?? {} },
  });
  if (error) throw error;
  return data as T;
}

export const loadFieldJob = (token: string) => call<FieldJob>(token, "job");
export const loadClientProgress = (token: string) => call<ClientProgress>(token, "client_view");

export async function rememberThisDevice(token: string, label: string) {
  const res = await call<{ state: LinkState; device?: string }>(token, "remember", { device_label: label });
  if (res.device) storeDevice(res.device);
  return res;
}

export type DraftPhoto = {
  /** Local id so a failed upload can be retried or removed before submitting. */
  localId: string;
  status: "uploading" | "ready" | "failed";
  storage_path: string;
  category: PhotoCategory;
  caption: string;
  floor_id: string | null;
  mime_type?: string;
  file_size?: number;
  previewUrl?: string;
  file?: File;
  errorMessage?: string;
};

export type ReadyPhoto = Pick<DraftPhoto, "storage_path" | "category" | "caption" | "floor_id" | "mime_type" | "file_size">;

export const readyPhotos = (photos: DraftPhoto[]): ReadyPhoto[] =>
  photos
    .filter((p) => p.status === "ready" && p.storage_path)
    .map(({ storage_path, category, caption, floor_id, mime_type, file_size }) => ({
      storage_path,
      category,
      caption,
      floor_id,
      mime_type,
      file_size,
    }));

/**
 * Shrinks a camera photo before upload so site updates go through on mobile
 * data, while keeping enough resolution to be useful evidence. Falls back to
 * the original file if the browser cannot decode it.
 */
export async function compressImage(file: File, maxEdge = 1800, quality = 0.75): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1_200_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

/** Uploads one photo straight from the camera into the private bucket. */
export async function uploadFieldPhoto(token: string, file: File) {
  const compressed = await compressImage(file);
  const extension = (compressed.name.split(".").pop() ?? "jpg").toLowerCase();
  const prep = await call<{ state: LinkState; path?: string; token?: string; bucket?: string }>(token, "upload_url", {
    extension,
  });
  if (!prep.path || !prep.token) throw new Error("Upload could not be prepared. Check your signal and try again.");
  const { error } = await supabase.storage
    .from(prep.bucket ?? "site-progress")
    .uploadToSignedUrl(prep.path, prep.token, compressed, { contentType: compressed.type || "image/jpeg" });
  if (error) throw error;
  return { storage_path: prep.path, mime_type: compressed.type, file_size: compressed.size };
}

export type UpdateSubmission = {
  shift_date: string;
  category: string;
  floor_id: string | null;
  area_label: string;
  work_completed: string;
  work_outstanding: string;
  blockers: string;
  materials_required: string;
  team_onsite: string;
  progress_pct: number;
  next_shift_plan: string;
  notes: string;
  photos: ReadyPhoto[];
};

export const submitFieldUpdate = (token: string, payload: UpdateSubmission) =>
  call<{ state: LinkState; id?: string; error?: string }>(token, "submit_update", payload);

export type IssueSubmission = {
  title: string;
  description: string;
  severity: string;
  floor_id: string | null;
  location_note: string;
  reported_by_name: string;
  photos: Omit<DraftPhoto, "previewUrl">[];
};

export const reportFieldIssue = (token: string, payload: IssueSubmission) =>
  call<{ state: LinkState; id?: string; error?: string }>(token, "report_issue", payload);

export const linkMessage = (state: LinkState | undefined) => {
  switch (state) {
    case "expired":
      return "This link has expired. Ask Siyakha for a new one.";
    case "revoked":
      return "This link has been withdrawn.";
    case "denied":
      return "This link cannot be used here.";
    case "unavailable":
      return "This link is not valid.";
    default:
      return "";
  }
};
