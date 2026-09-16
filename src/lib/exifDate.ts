/**
 * Minimal, dependency-free reader for the EXIF capture time of a JPEG.
 *
 * We only read what the file itself already carries — nothing is invented,
 * overlaid or rewritten. If the tag is absent or unreadable we return null so
 * the photo is simply recorded without a capture time.
 */

const DATE_TIME_ORIGINAL = 0x9003;
const DATE_TIME_DIGITIZED = 0x9004;
const DATE_TIME = 0x0132;
const EXIF_IFD_POINTER = 0x8769;

/** "2026:09:15 07:42:11" -> ISO string, or null when the value is not a date. */
export function parseExifDateString(value: string): string | null {
  const m = value.trim().match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

/** Reads DateTimeOriginal (falling back to Digitized/DateTime) from JPEG bytes. */
export function readExifCaptureTime(buffer: ArrayBuffer): string | null {
  try {
    const view = new DataView(buffer);
    if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null; // not a JPEG

    let offset = 2;
    while (offset + 4 < view.byteLength) {
      if (view.getUint8(offset) !== 0xff) break;
      const marker = view.getUint8(offset + 1);
      const size = view.getUint16(offset + 2);
      if (marker === 0xe1 && view.getUint32(offset + 4) === 0x45786966) {
        return readTiff(view, offset + 10);
      }
      if (marker === 0xda) break; // start of image data
      offset += 2 + size;
    }
    return null;
  } catch {
    return null;
  }
}

function readTiff(view: DataView, start: number): string | null {
  const byteOrder = view.getUint16(start);
  if (byteOrder !== 0x4949 && byteOrder !== 0x4d4d) return null;
  const little = byteOrder === 0x4949;
  const u16 = (o: number) => view.getUint16(o, little);
  const u32 = (o: number) => view.getUint32(o, little);

  const ifd0 = start + u32(start + 4);
  const candidates: number[] = [];

  const scan = (dirStart: number): string | null => {
    if (dirStart + 2 > view.byteLength) return null;
    const count = u16(dirStart);
    for (let i = 0; i < count; i++) {
      const entry = dirStart + 2 + i * 12;
      if (entry + 12 > view.byteLength) break;
      const tag = u16(entry);
      if (tag === EXIF_IFD_POINTER) candidates.push(start + u32(entry + 8));
      if (tag === DATE_TIME_ORIGINAL || tag === DATE_TIME_DIGITIZED || tag === DATE_TIME) {
        const length = u32(entry + 4);
        const valueOffset = length > 4 ? start + u32(entry + 8) : entry + 8;
        let text = "";
        for (let c = 0; c < Math.min(length, 20) && valueOffset + c < view.byteLength; c++) {
          const code = view.getUint8(valueOffset + c);
          if (!code) break;
          text += String.fromCharCode(code);
        }
        const iso = parseExifDateString(text);
        if (iso) return iso;
      }
    }
    return null;
  };

  const fromIfd0 = scan(ifd0);
  if (fromIfd0) return fromIfd0;
  for (const sub of candidates) {
    const iso = scan(sub);
    if (iso) return iso;
  }
  return null;
}

/** Convenience wrapper for a picked File. Never throws. */
export async function fileCaptureTime(file: File): Promise<string | null> {
  try {
    if (!/jpe?g$/i.test(file.type) && !/\.jpe?g$/i.test(file.name)) return null;
    const head = await file.slice(0, 256 * 1024).arrayBuffer();
    return readExifCaptureTime(head);
  } catch {
    return null;
  }
}
