/**
 * Builds a printable replica of the Satio "SERVICE REQUEST / END CUSTOMER
 * SIGN-OFF FORM" from a logged call. Pure string building so the same markup
 * can be printed in the browser and emailed from an edge function.
 * Mirror of src/lib/jobCardSheet.ts — keep both copies identical.
 * Keep this file in sync with supabase/functions/_shared/jobCardSheet.ts.
 */

export type SheetCall = Record<string, unknown>;
export type SheetItem = { description?: unknown; quantity?: unknown; serial_number?: unknown };

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const txt = (v: unknown) => {
  const s = String(v ?? "").trim();
  return s ? esc(s) : "&nbsp;";
};

const multiline = (v: unknown) => {
  const s = String(v ?? "").trim();
  return s ? esc(s).replace(/\n/g, "<br />") : "&nbsp;";
};

/** dd / mm / yyyy, blank when unknown. */
export const sheetDate = (iso?: unknown) => {
  if (!iso) return "";
  const d = new Date(String(iso));
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())} / ${p(d.getMonth() + 1)} / ${d.getFullYear()}`;
};

/** "09 Hrs 45 min", blank when unknown. */
export const sheetTime = (iso?: unknown) => {
  if (!iso) return "";
  const d = new Date(String(iso));
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())} Hrs ${p(d.getMinutes())} min`;
};

export const sheetKm = (opening: unknown, closing: unknown) => {
  if (opening === null || opening === undefined || opening === "" ) return "";
  if (closing === null || closing === undefined || closing === "") return "";
  const diff = Number(closing) - Number(opening);
  return Number.isFinite(diff) && diff >= 0 ? String(diff) : "";
};

export const JOB_CARD_SHEET_CSS = `
.satio-sheet{font-family:Arial,Helvetica,sans-serif;color:#000;background:#fff;font-size:11px;line-height:1.35;max-width:780px;margin:0 auto}
.satio-sheet table{width:100%;border-collapse:collapse;table-layout:fixed}
.satio-sheet td{border:1px solid #000;padding:4px 6px;vertical-align:top;word-wrap:break-word}
.satio-sheet .sh-title{text-align:center;font-weight:bold;font-size:13px;padding:7px 6px;text-transform:uppercase}
.satio-sheet .sh-band{text-align:center;font-weight:bold;background:#eee;text-transform:none}
.satio-sheet .sh-label{font-size:9px;text-transform:uppercase;letter-spacing:.4px;color:#333}
.satio-sheet .sh-value{font-size:11px;min-height:15px;font-weight:bold}
.satio-sheet .sh-cell{height:34px}
.satio-sheet .sh-free{height:96px;white-space:normal}
.satio-sheet .sh-small{height:60px}
.satio-sheet .sh-note{font-size:9px;color:#333;text-align:center;padding:5px 6px}
.satio-sheet .sh-foot{display:flex;justify-content:space-between;font-size:9px;color:#333;margin-top:6px}
.satio-sheet .sh-sig{height:110px}
.satio-sheet .sh-sig img{max-height:88px;max-width:100%}
.satio-sheet .sh-items td{height:22px}
.satio-sheet .sh-qty{width:70px;text-align:center}
`;

const cell = (label: string, value: string, cls = "sh-cell", colspan = 1) =>
  `<td class="${cls}"${colspan > 1 ? ` colspan="${colspan}"` : ""}>` +
  `<div class="sh-label">${label}</div><div class="sh-value">${value}</div></td>`;

/**
 * Sheet body markup. `signBlock`:
 *  - "auto": show captured sign-off details (or blank lines when unsigned)
 *  - "omit": leave the sign-off block out (used when React renders live inputs)
 */
export function jobCardSheetHtml(
  call: SheetCall,
  items: SheetItem[] = [],
  opts: { signBlock?: "auto" | "omit" } = {},
): string {
  const c = call;
  const signBlock = opts.signBlock ?? "auto";
  const rows = Math.max(4, items.length);
  const itemRows = Array.from({ length: rows })
    .map((_, i) => {
      const it = items[i];
      const desc = it
        ? `${String(it.description ?? "")}${it.serial_number ? ` — S/N ${String(it.serial_number)}` : ""}`
        : "";
      return `<tr><td class="sh-value">${txt(desc)}</td><td class="sh-value sh-qty">${
        it ? txt(it.quantity) : "&nbsp;"
      }</td></tr>`;
    })
    .join("");

  const signature = String(c.signature_data ?? "");
  const signedName = String(c.signed_by_name ?? "").trim();
  const rating = c.satisfaction_rating ? `${String(c.satisfaction_rating)} / 5` : "";

  const signSection =
    signBlock === "omit"
      ? ""
      : `<table style="margin-top:8px">
  <tr><td class="sh-title sh-band" colspan="2">Customer sign-off<br />and satisfaction pertaining to above fault solution</td></tr>
  <tr>
    ${cell("End customer name", txt(signedName))}
    <td class="sh-cell" rowspan="3" style="text-align:center">
      <div class="sh-label">Dear end customer</div>
      <div style="font-size:9px;margin-top:4px">Please complete this section in FULL to enable proper customer feedback.<br /><strong>Thank you</strong></div>
      <div class="sh-label" style="margin-top:6px">Satisfaction rating</div>
      <div class="sh-value">${txt(rating)}</div>
    </td>
  </tr>
  <tr>${cell("Date / time", `${txt(sheetDate(c.signed_at))} &nbsp;&nbsp; ${txt(sheetTime(c.signed_at))}`)}</tr>
  <tr>
    <td class="sh-sig">
      <div class="sh-label">Signature</div>
      ${signature.startsWith("data:image/") ? `<img src="${esc(signature)}" alt="Customer signature" />` : "&nbsp;"}
    </td>
  </tr>
  <tr><td colspan="2" class="sh-cell"><div class="sh-label">Customer comment</div><div class="sh-value">${multiline(
    c.signoff_comment,
  )}</div></td></tr>
</table>`;

  return `<div class="satio-sheet">
<table>
  <tr><td class="sh-title" colspan="4">Service request / end customer sign-off form</td></tr>
  <tr>
    ${cell("SiT number", txt(c.sit_number ?? c.call_ref))}
    ${cell("Engineer name", txt(c.engineer_name))}
    ${cell("Time logged", txt(sheetTime(c.logged_at)))}
    ${cell("Date logged", txt(sheetDate(c.logged_at)))}
  </tr>
  <tr>
    ${cell("Customer logging call", txt(c.logging_customer), "sh-cell", 2)}
    ${cell("Customer ref. / order nr.", txt(c.customer_order_ref), "sh-cell", 2)}
  </tr>
  <tr><td class="sh-band" colspan="4">End customer contact information</td></tr>
  <tr>
    ${cell("Company", txt(c.end_customer_company), "sh-cell", 2)}
    ${cell("First name", txt(c.end_customer_first_name))}
    ${cell("Last name", txt(c.end_customer_last_name))}
  </tr>
  <tr>
    ${cell("Address", txt(c.site_address), "sh-cell", 2)}
    ${cell("City", txt(c.city))}
    ${cell("Contact number", txt(c.contact_number))}
  </tr>
</table>

<table style="margin-top:8px">
  <tr>
    ${cell("Arrival date", txt(sheetDate(c.arrival_at)))}
    ${cell("Arrival time", txt(sheetTime(c.arrival_at)))}
    <td class="sh-band" colspan="2">Odometer readings</td>
  </tr>
  <tr>
    ${cell("Departure date", txt(sheetDate(c.departure_at)))}
    ${cell("Departure time", txt(sheetTime(c.departure_at)))}
    ${cell("Opening km", txt(c.opening_km))}
    ${cell("Closing km", `${txt(c.closing_km)}`)}
  </tr>
  <tr>
    ${cell("Total kms", txt(sheetKm(c.opening_km, c.closing_km)), "sh-cell", 4)}
  </tr>
</table>

<table style="margin-top:8px">
  <tr><td class="sh-band">Fault description as logged by customer</td></tr>
  <tr><td class="sh-free">${multiline(c.fault_description)}</td></tr>
  <tr><td class="sh-band">Fault solution description (please complete comprehensively)</td></tr>
  <tr><td class="sh-free">${multiline(c.fault_solution)}</td></tr>
  <tr><td class="sh-band">Change control (only complete if equipment is replaced or taken from site: S/N + description)</td></tr>
  <tr><td class="sh-small">${multiline(c.change_control)}</td></tr>
</table>

<table style="margin-top:8px" class="sh-items">
  <tr><td class="sh-band" colspan="2">Additional items used (if applicable)</td></tr>
  <tr><td class="sh-label">Item description</td><td class="sh-label sh-qty">QTY</td></tr>
  ${itemRows}
</table>

${signSection}

<div class="sh-note">Completed digitally by Siyakha Technology Solutions · 087 723 9183 · admin@siyakhatechnology.co.za</div>
<div class="sh-foot"><span>&copy; SatioBS form layout</span><span>${txt(
    [c.end_customer_company, c.city].filter(Boolean).join(" - "),
  )}</span></div>
</div>`;
}

/** Standalone document (printing, email attachment). */
export function jobCardSheetDocument(call: SheetCall, items: SheetItem[] = []): string {
  const ref = String(call.sit_number || call.call_ref || "job-card");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sign-off ${esc(ref)}</title>
<style>@page{size:A4;margin:12mm}body{margin:0;padding:12px;background:#fff}${JOB_CARD_SHEET_CSS}</style>
</head><body>${jobCardSheetHtml(call, items)}</body></html>`;
}

export function jobCardSheetFileName(call: SheetCall) {
  const ref = String(call.sit_number || call.call_ref || "job-card").replace(/[^\w.-]+/g, "-");
  return `Sign-off ${ref}.html`;
}
