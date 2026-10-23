/** Shared, bounded photo validation; no caller URLs or storage paths. */
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const REQUEST_MAX_BYTES = 7_050_000;
export const CAMPAIGN_SOURCE = "december-cleanup-2026";
export interface CabinetPhoto { mime: string; base64: string }

export function assertCampaignEnvelope(raw: unknown): void {
  if (!raw || typeof raw !== "object") throw new Error("Invalid quote request.");
  if (["to", "cc", "bcc", "recipients", "reply_to", "photo_path", "photo_url"].some(key => key in raw)) {
    throw new Error("Recipients and photo storage are managed by Siyakha.");
  }
}

export function validatePhotoBytes(bytes: Uint8Array, mime: string): string {
  if (!bytes.length || bytes.length > PHOTO_MAX_BYTES) throw new Error("Choose one cabinet photo up to 5MB.");
  const matches = (offset: number, values: number[]) => values.every((v, i) => bytes[offset + i] === v);
  const text = (offset: number, length: number) => String.fromCharCode(...bytes.slice(offset, offset + length));
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (mime === "image/png" && bytes.length >= 45 && matches(0, [137,80,78,71,13,10,26,10]) &&
    view.getUint32(8) === 13 && text(12, 4) === "IHDR" && view.getUint32(16) > 0 && view.getUint32(20) > 0 &&
    matches(bytes.length - 12, [0,0,0,0,73,69,78,68,174,66,96,130])) {
    let offset = 8, image = false;
    while (offset + 12 <= bytes.length) {
      const size = view.getUint32(offset), kind = text(offset + 4, 4);
      if (offset + 12 + size > bytes.length) break;
      // Validate every chunk checksum, not just PNG's opening/closing signatures.
      let crc = 0xffffffff;
      for (let i = offset + 4; i < offset + 8 + size; i++) {
        crc ^= bytes[i];
        for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
      }
      if (((crc ^ 0xffffffff) >>> 0) !== view.getUint32(offset + 8 + size)) break;
      if (kind === "IDAT" && size > 0) image = true;
      offset += 12 + size;
    }
    if (image && offset === bytes.length) return "png";
  }
  if (mime === "image/jpeg" && bytes.length >= 20 && matches(0, [255,216,255]) &&
    matches(bytes.length - 2, [255,217])) {
    // Require a dimension-bearing frame and scan, not just a renamed signature.
    let offset = 2, frame = false;
    while (offset + 4 <= bytes.length) {
      if (bytes[offset] !== 255) break;
      const marker = bytes[offset + 1];
      const length = view.getUint16(offset + 2);
      if (length < 2 || offset + 2 + length > bytes.length) break;
      if ([192,193,194].includes(marker) && length >= 8 && view.getUint16(offset + 5) > 0 && view.getUint16(offset + 7) > 0) frame = true;
      if (marker === 218 && frame && offset + 2 + length < bytes.length - 2) return "jpg";
      offset += 2 + length;
    }
  }
  if (mime === "image/webp" && bytes.length >= 30 && text(0,4) === "RIFF" && text(8,4) === "WEBP" &&
    view.getUint32(4,true) + 8 === bytes.length) {
    let offset = 12, image = false;
    while (offset + 8 <= bytes.length) {
      const kind = text(offset,4), size = view.getUint32(offset + 4,true);
      if (!size || offset + 8 + size > bytes.length) break;
      if (kind === "VP8 " && size >= 10 && matches(offset + 11,[157,1,42])) image = true;
      if (kind === "VP8L" && size >= 5 && bytes[offset + 8] === 47) image = true;
      offset += 8 + size + (size % 2);
    }
    if (image && offset === bytes.length) return "webp";
  }
  throw new Error("The photo must be a genuine JPG, PNG or WebP matching its file type.");
}

export function decodeCabinetPhoto(photo: CabinetPhoto): { bytes: Uint8Array; extension: string } {
  if (typeof photo?.base64 !== "string" || typeof photo?.mime !== "string" ||
    photo.base64.length > Math.ceil(PHOTO_MAX_BYTES / 3) * 4 || photo.base64.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(photo.base64)) {
    throw new Error("Invalid cabinet photo encoding.");
  }
  const binary = atob(photo.base64);
  if (btoa(binary) !== photo.base64) throw new Error("Invalid cabinet photo encoding.");
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return { bytes, extension: validatePhotoBytes(bytes, photo.mime) };
}

/** Enforce the actual streamed byte count before JSON parsing, even without Content-Length. */
export async function readBoundedJson(req: Request): Promise<{ body: unknown; size: number }> {
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new Error("Expected JSON.");
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > REQUEST_MAX_BYTES) throw new Error("Request too large.");
  const reader = req.body?.getReader();
  if (!reader) throw new Error("Empty request.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const result = await reader.read();
    if (result.done) break;
    size += result.value.length;
    if (size > REQUEST_MAX_BYTES) { await reader.cancel(); throw new Error("Request too large."); }
    chunks.push(result.value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return { body: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)), size };
}