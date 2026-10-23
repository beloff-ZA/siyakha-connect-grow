import { buildLeadEmailRequests, type ResendRequest } from "./leadEmail.ts";
import { decodeCabinetPhoto, type CabinetPhoto } from "./campaignPhoto.ts";

type Lead = Record<string, unknown> & { id: string };
export interface QuoteDependencies {
  find: (key: string) => Promise<Lead | null>;
  store: (path: string, bytes: Uint8Array, mime: string) => Promise<void>;
  remove: (path: string) => Promise<void>;
  insert: (row: Record<string, unknown>) => Promise<Lead | null>;
  notify: (request: ResendRequest, key: string) => Promise<boolean>;
  updateNotification: (id: string, status: string) => Promise<void>;
  hash: (value: string) => Promise<string>;
  randomId: () => string;
  emailConfigured: boolean;
  emailHtml: (lead: Lead) => string;
}

/** Store photo before reporting a persisted quote; DB unique key resolves concurrent retries. */
export async function submitCampaignQuote(row: Record<string, unknown>, photo: CabinetPhoto, deps: QuoteDependencies) {
  const { bytes, extension } = decodeCabinetPhoto(photo);
  const photoHash = await deps.hash(photo.base64);
  const key = await deps.hash(`${row.dedupe_key}|${row.source}|${row.phone}|${row.company}|${photoHash}`);
  let lead = await deps.find(key);
  const duplicate = Boolean(lead);
  if (!lead) {
    const path = `december-cleanup-2026/${deps.randomId()}.${extension}`;
    await deps.store(path, bytes, photo.mime);
    try {
      lead = await deps.insert({ ...row, dedupe_key: key,
        project_description: `${row.project_description}\nPrivate cabinet photo: website-orders/${path}\nPhoto SHA-256: ${photoHash}` });
      if (!lead) {
        lead = await deps.find(key);
        await deps.remove(path);
      }
    } catch (error) {
      await deps.remove(path).catch(() => undefined);
      throw error;
    }
  }
  if (!lead?.id) throw new Error("Your photo quote could not be stored. Please try again.");
  // Legacy campaign records have no photo. Never report a photo quote as stored for those.
  if (!String(lead.project_description).includes("Private cabinet photo: website-orders/december-cleanup-2026/")) {
    throw new Error("The cabinet photo was not stored. Please try again.");
  }
  let notificationStatus = String(lead.notification_status ?? "pending");
  if (deps.emailConfigured && notificationStatus !== "sent") {
    const requests = buildLeadEmailRequests(lead, deps.emailHtml(lead), { filename: `cabinet.${extension}`, content: photo.base64 });
    let accepted = 0;
    for (const request of requests) {
      try {
        // Resend idempotency prevents repeat delivery while retries repair partial failures.
        if (await deps.notify(request, `december-quote/${lead.id}/${request.to[0]}`)) accepted++;
      } catch { /* Continue independently; never log photos/contact data. */ }
    }
    notificationStatus = accepted === 2 ? "sent" : accepted === 1 ? "partial" : "failed";
    await deps.updateNotification(lead.id, notificationStatus);
  } else if (!deps.emailConfigured) notificationStatus = "skipped";
  return { lead_id: lead.id, duplicate, status: "stored", photo_stored: true,
    notification_status: notificationStatus, email_delivered: false,
    email_accepted: notificationStatus === "sent" || notificationStatus === "partial" };
}