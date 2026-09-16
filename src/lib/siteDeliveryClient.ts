import { supabase } from "@/integrations/supabase/client";
import { fileCaptureTime } from "@/lib/exifDate";
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
  title?: string | null;
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
  scope_of_work?: string | null;
  deliverables?: string | null;
  site_notes?: string | null;
  address: string | null;
  start_date: string | null;
  target_date: string | null;
  client_name: string | null;
  site_name: string | null;
  site_location: string | null;
};

export type GuestDocument = {
  id: string;
  title: string;
  category: string | null;
  reference: string | null;
  document_date?: string | null;
  url: string | null;
};

/** Additional / out-of-scope works shown to the client. Operational only — never any pricing. */
export type GuestScopeChange = {
  id: string;
  work_date: string;
  title: string;
  description: string | null;
  trigger_reason: string | null;
  status: string;
  floor_id: string | null;
  area_label: string | null;
  baseline_category: string | null;
};

/** One shared next-steps list, already filtered for this link's audience. */
export type GuestNextStep = {
  id: string;
  title: string;
  detail: string | null;
  category: string;
  status: string;
  due_date: string | null;
};

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
  next_steps?: GuestNextStep[];
  today?: string;
};

export type ClientProgress = {
  state: LinkState;
  role?: "client";
  project?: GuestProject;
  overall_progress?: number;
  last_updated?: string | null;
  last_published_at?: string | null;
  current_area?: { floor_id: string | null; area_label: string | null } | null;
  next_activity?: string | null;
  generated_at?: string | null;
  floors?: FieldFloor[];
  updates?: any[];
  issues?: any[];
  scope_changes?: GuestScopeChange[];
  photos?: GuestPhoto[];
  documents?: GuestDocument[];
  next_steps?: GuestNextStep[];
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
  /** Display copy (a smaller derivative when compression helped, else the original). */
  storage_path: string;
  /** The untouched uploaded file, kept as the evidentiary original. */
  original_storage_path?: string;
  category: PhotoCategory;
  /** Required image name, mirroring the named-image rule used for project site images. */
  title: string;
  caption: string;
  floor_id: string | null;
  /** Engineer's own declaration that this image came from the approved Timestamp App. */
  timestamp_confirmed: boolean;
  original_filename?: string;
  original_file_size?: number;
  exif_captured_at?: string | null;
  mime_type?: string;
  file_size?: number;
  previewUrl?: string;
  file?: File;
  errorMessage?: string;
};

export type ReadyPhoto = Pick<
  DraftPhoto,
  | "storage_path"
  | "original_storage_path"
  | "category"
  | "title"
  | "caption"
  | "floor_id"
  | "timestamp_confirmed"
  | "original_filename"
  | "original_file_size"
  | "exif_captured_at"
  | "mime_type"
  | "file_size"
>;

export const readyPhotos = (photos: DraftPhoto[]): ReadyPhoto[] =>
  photos
    .filter((p) => p.status === "ready" && p.storage_path)
    .map((p) => ({
      storage_path: p.storage_path,
      original_storage_path: p.original_storage_path,
      category: p.category,
      title: p.title,
      caption: p.caption,
      floor_id: p.floor_id,
      timestamp_confirmed: p.timestamp_confirmed,
      original_filename: p.original_filename,
      original_file_size: p.original_file_size,
      exif_captured_at: p.exif_captured_at ?? null,
      mime_type: p.mime_type,
      file_size: p.file_size,
    }));

/** Photo-evidence checklist shown to the engineer before sending an update. */
export const evidenceSummary = (photos: DraftPhoto[]) => {
  const ready = photos.filter((p) => p.status === "ready");
  const confirmed = ready.filter((p) => p.timestamp_confirmed).length;
  return {
    total: photos.length,
    ready: ready.length,
    uploading: photos.filter((p) => p.status === "uploading").length,
    failed: photos.filter((p) => p.status === "failed").length,
    timestampConfirmed: confirmed,
    timestampUnconfirmed: ready.length - confirmed,
    hasEvidence: ready.length > 0,
  };
};

/**
 * Shrinks a camera photo for on-screen use so site updates load quickly on
 * mobile data. This is a derivative only — the original file is always uploaded
 * and kept as the evidence copy. Returns null when shrinking is not worthwhile.
 */
export async function compressImage(file: File, maxEdge = 1800, quality = 0.75): Promise<File | null> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return null;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1_200_000) return null;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob || blob.size >= file.size) return null;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + "-preview.jpg", { type: "image/jpeg" });
  } catch {
    return null;
  }
}

async function putFile(token: string, file: File) {
  const extension = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const prep = await call<{ state: LinkState; path?: string; token?: string; bucket?: string }>(token, "upload_url", {
    extension,
  });
  if (!prep.path || !prep.token) throw new Error("Upload could not be prepared. Check your signal and try again.");
  const { error } = await supabase.storage
    .from(prep.bucket ?? "site-progress")
    .uploadToSignedUrl(prep.path, prep.token, file, { contentType: file.type || "image/jpeg" });
  if (error) throw error;
  return prep.path;
}

/**
 * Uploads one photo. The original file goes up untouched as the evidentiary
 * copy; a smaller preview is uploaded as well when it helps, and only ever used
 * for display.
 */
export async function uploadFieldPhoto(token: string, file: File) {
  const exif_captured_at = await fileCaptureTime(file);
  const original_storage_path = await putFile(token, file);
  let storage_path = original_storage_path;
  let mime_type = file.type;
  let file_size = file.size;
  const preview = await compressImage(file);
  if (preview) {
    try {
      storage_path = await putFile(token, preview);
      mime_type = preview.type;
      file_size = preview.size;
    } catch {
      /* preview is optional — the original is already safely stored */
    }
  }
  return {
    storage_path,
    original_storage_path,
    original_filename: file.name.slice(0, 240),
    original_file_size: file.size,
    exif_captured_at,
    mime_type,
    file_size,
  };
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
  photos: ReadyPhoto[];
};

export const reportFieldIssue = (token: string, payload: IssueSubmission) =>
  call<{ state: LinkState; id?: string; error?: string }>(token, "report_issue", payload);

/** Technician marks an installation step in progress or done. */
export const setFieldStepStatus = (token: string, id: string, status: string) =>
  call<{ state: LinkState }>(token, "next_step_status", { id, status });

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
