# Simple phone daily site form

## Goal
Turn every secure field-engineer link into a plain, phone-first daily update wizard. Michael’s link will show his name automatically, and future engineers will get the same experience with their own link identity.

## Field experience
- Replace the current dense form and four-tab header with a compact “SIYAKHA SITE UPDATE” screen showing project, engineer, and today’s date.
- Use eight short guided steps with large tap targets: floor, work done, quantity, problems, needs, photos, next work, and review/send.
- Add cabling-work shortcuts without removing free-text entry.
- Translate simple answers into the existing structured daily-report fields behind the scenes.
- Keep prior updates and drawings available through simple secondary controls, without exposing admin tools or project-management terminology.

## Photos and poor-signal handling
- Make Timestamp App photos the most prominent step, with large camera/library controls, large previews, simple Before/Work/After/Problem choices, one shared “I used Timestamp App” confirmation, and inherited floor selection.
- Preserve original files and metadata while retaining compressed display copies, retries, clear upload states, and multiple-image support.
- Block technician submission without at least one successfully uploaded photo; office staff retain the existing override workflow.
- Autosave the text/form draft and current wizard step locally. Uploaded photo records remain available in the open form; explain clearly if a page refresh requires photos to be selected again.

## Voice and confirmation
- Add an optional microphone control to relevant text fields using supported Android browser speech recognition; hide/disable it cleanly when unavailable.
- Show a short review with floor, work, problem, and photo count before the large green “SEND DAILY UPDATE” action.
- After success, show a large confirmation tick, thank the engineer by link-derived name, and display the submitted update with a clear option to start another update.

## Validation
- Add focused tests for shortcut-to-report mapping, quantities, problem severity, photo requirement, and draft restoration.
- Test the live flow at an ordinary Android viewport: secure link, automatic identity, wizard navigation, photo selection/upload states, review, submission, confirmation, history, and revoked-link blocking.

## Technical details
- Keep the existing database, private storage, secure role-scoped links, edge function, original-image evidence handling, EXIF extraction, admin controls, and client visibility rules unchanged.
- Refactor `FieldJobPage` into small field-only controls and pure mapping helpers so the simplified wording cannot weaken reporting or security.
- Use the project’s existing monochrome tokens; the send action uses the semantic success/accent treatment rather than hardcoded colors.

## Work dates and backdating
- Simple date choice on the field form: Today / Yesterday / Choose date, with future dates refused.
- Store the chosen work date separately from the automatic submission time, and show both to the office ("Work date" and "Submitted on").
- Days already signed off by the office stay read-only to the engineer.

## Additional works register (no pricing)
- New operational register for work identified outside the agreed scope, recording work date, floor/area, description, why it came up, where it came from (Mike's update, office update, client instruction, site condition), a simple status from Identified through to Completed or Not proceeding, supporting photos, and office-controlled client visibility.
- No prices, rates, costs or margins anywhere in this register or in the field and client views.
- Extra routing/containment installed because a planned drop had no usable pathway is flagged for office review as possible additional work, with no statement about money or entitlement.

## Site diary and reporting
- Record the confirmed days: 10 Sep site induction, 11 and 12 Sep cable pulling, 14 Sep cable pulling plus the routing/access constraint and the existing materials record kept in the exact wording supplied, 15 Sep additional routing with 9 PVC pipes on Fifth Floor and photos still outstanding.
- Nothing is invented: no quantities or photos beyond what was supplied, and 16 September shows "Awaiting Mike site update" until he reports.
- Daily timeline grouped by date with clear labels: Health & Safety, Cabling, Site Constraint, Procurement, Additional Routing, Photos/Evidence. Additional works appear in their own section, separate from agreed-scope progress.
- Office-side updates can be tagged against the existing scope baseline categories (LAN move, LAN new install, access points, cameras, biometric readers) without changing any of its quantities; the field form keeps simple cabling wording.
- The engineer is shown as "Michael (Mike)" in office views, and by his link's own name on his phone.
