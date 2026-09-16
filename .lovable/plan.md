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
