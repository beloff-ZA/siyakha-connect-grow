# Printable Satio sign-off sheet for completed job cards

Right now a completed job card can only be read on screen or sent as a plain email summary. This adds a proper replica of the Satio sign-off sheet you can print, hand over, or email as a PDF attachment.

## What you get

1. **A sign-off sheet page** that looks like Satio's own form: their header block (call number, SIT number, date), client and site details, contact person, engineer, arrival and departure times, opening/closing kilometres, fault as logged, work done, additional items table, and the customer sign-off block with the typed name, satisfaction rating, comment and the signature drawn on the device.
2. **Print / Save as PDF** button on that page, set up for clean A4 output: one sheet where possible, no menus or buttons in the print, black-and-white friendly.
3. **Attached to the email.** When the customer signs on the device, the completed sheet is generated as a PDF and attached to the notification that already goes to accounts@ and admin@siyakhatechnology.co.za, plus the logging client (Satio) and the site contact when their addresses are on the call. The email body keeps the short summary; the attachment is the replica sheet.
4. **A "Send sign-off sheet" button** on the job card, so you can re-send the same PDF later without asking the customer to sign again.
5. Blank fields print as ruled empty lines, so you can also print the sheet before the visit and fill it in by hand if there is no signal.
6. **Sign on this device, on the sheet itself.** A "Hand over to client to sign" button on the job card opens the full Satio sheet on the tablet, phone or PC in your hand. The client sees the actual form — all the call, site, fault, work-done and items detail filled in — and signs inside the sign-off block at the bottom of that same sheet: first name, surname, signature drawn with a finger or stylus, and the date and time exactly as the Satio form asks (filled automatically, editable if they sign later than the work finished), plus the service rating and an optional comment. They hand the device back, and the signed sheet is what gets emailed and printed. No link to send, no login for them.

Nothing on a signed job card can change — the sheet is generated from the stored record every time, and re-sending does not alter the sign-off.

## Technical approach

- New `src/lib/jobCardSheet.ts`: builds the sign-off sheet as self-contained HTML from a `LoggedCall`, its items and sign-off fields (shared by the browser view and the edge function, no React dependency).
- New `src/pages/helpdesk/JobCardSheet.tsx` at route `/helpdesk/logged-calls/:callId/sheet`, rendering that HTML inside the admin shell with a print button and A4 `@page`/`print:` styles. Existing `LoggedCallCardView` keeps its role as the on-screen record and gains a link to the sheet.
- `supabase/functions/job-card-signoff/index.ts`: after a successful sign, render the same HTML, convert to PDF, and attach it to the Resend send (`attachments: [{ filename, content: base64 }]`). PDF rendering via a Deno-compatible HTML-to-PDF path; if conversion fails, the email still sends with the HTML body inline so notification is never blocked. Recipient dedupe/validation and one-time sign-off lock stay as they are.
- New `resend` action in the same function (staff-authenticated, service-role read) for the "Send sign-off sheet" button, logged as an audit row rather than mutating the call.
- On-device signing: `LoggedCallView` gains a kiosk-style "Hand over to client to sign" action that renders the existing `JobCardSignoff` flow (summary + `SignaturePad` + rating + typed name) in a full-screen overlay on the current device, submitting through the same public `job-card-signoff` sign action and token. Overlay hides admin navigation while open and returns to the job card after signing. Signature canvas sized for touch, min 44px controls.
- No schema change to `logged_calls` or `logged_call_items`; no change to BOQ or portal data.
- Tests added to `src/lib/loggedCalls.test.ts` (or a new `jobCardSheet.test.ts`) covering field mapping, blank-field fallbacks and that sensitive internal fields are excluded.
