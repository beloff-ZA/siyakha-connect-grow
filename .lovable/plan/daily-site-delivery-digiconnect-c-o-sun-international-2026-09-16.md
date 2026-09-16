# Daily site delivery: DIGICONNECT C/O SUN INTERNATIONAL

## What this adds

A live site-delivery layer on the existing project workspace, with two separate secure links off one project:

- **Field technician link** (Michael first) — phone-first daily site updates, photos straight from the camera, issue reporting, floor drawings.
- **Client view link** — clean read-only progress portal for Digiconnect / Sun International stakeholders, showing only what Nikita has approved.

The project is created once as a normal project in the existing register, titled exactly **DIGICONNECT C/O SUN INTERNATIONAL**, with the six floors (Ground, First, Second, Third, Fourth, Fifth) and the drawing pack *Low Level Layouts - All Floors* (project number 01_01_2026_33). No parallel project system, no duplicate job cards.

## What we reuse (nothing rebuilt)

| Need | Existing thing reused |
| --- | --- |
| Project, client, site records | `portal_projects`, `portal_clients`, `portal_sites`, project register + `/helpdesk/project-management/:projectId` workspace |
| Floors | `portal_floors` (level, display name, client-visible flag) |
| Floor drawings / pack pages | `portal_plan_revisions` — already carries drawing number, title, page number, current-revision flag, review status and client-visible flag |
| Other documents | `portal_documents` |
| Secure links | `portal_share_links` (random token, only its hash stored, expiry, revoke, access counters) + the `share-resolve` pattern |
| Guest session + audit pattern | `deck-client` function and `portal_deck_viewers` (opaque session token, hashed, expiring) |
| Private file storage | existing private buckets `client-documents`, `client-photos` |
| Admin activity trail | `portal_activity`, `portal_share_access_log` |
| Look and feel | existing monochrome Siyakha components (`components/pm/ui`, deck components) |

`portal_updates` stays for the existing client-portal announcements — it is too thin for site diaries (no floor, photos, progress, approval), so daily updates get their own tables.

## Data model (new)

- **`portal_site_updates`** — one row per submission: project, floor, submitted-by identity (technician link or admin), submitted_at, shift date, work completed, work outstanding, blockers, materials required, team onsite, progress %, next-shift plan, internal notes (never client-visible), `client_visible`, `approval_status` (draft / submitted / approved / locked), approved_by, approved_at, published_at.
- **`portal_site_update_photos`** — storage path, category (before / during / after / issue / completed), caption, floor, `client_visible`, sort order.
- **`portal_site_issues`** — title, description, severity, status, floor, location note, linked update, `client_visible`, opened/closed timestamps, photo links.
- **`portal_floor_progress`** — progress % and status per floor per project, derived from updates and overridable by admin.
- **`portal_field_access`** — one row per technician link: name, role, share-link reference, optional remembered-device session hash + expiry, last seen. Revoking the share link kills all devices instantly.
- **`portal_drawing_pins`** (schema only in phase 1) — floor, drawing revision, x/y normalised coordinates, linked update/issue. Lets us add PDF pin annotation later without another migration.

Extensions to existing tables: `portal_share_links` gets `link_role` (`client` | `field`) and `assignee_label`; `portal_floors` gets nothing new (progress lives in its own table).

Every new table gets GRANTs, RLS on, admin/PM full access, no anon access. All technician and client reads/writes go through edge functions using the service role after validating the token — the raw project id is never an authorisation key.

## Security

- Both links are 32-byte random tokens; only the SHA-256 hash is stored, scoped to exactly one project and one role, with expiry and revoke.
- New edge function **`site-field`** for the technician link: token check first, then submit update, upload photo (short-lived signed upload URL into a private bucket), report issue, list own prior updates. Locked/approved updates are rejected server-side.
- Client link is served by extending `share-resolve` with a `site_progress` resource that returns only approved, client-visible rows through the existing strict key allowlist — costs, margins, supplier data, internal notes and internal-only issues are structurally impossible to return.
- "Remember this device" is an opaque hashed session token with a short expiry, revocable from the admin screen and dead the moment the link is revoked.
- Every view, submission and approval is logged with who, when and the approval timestamp.

## Screens

**Admin — new "Site delivery" tab in the project workspace**
Daily activity dashboard: overall and per-floor progress, "Updated today / Awaiting update", day-by-day timeline, counts of completed and outstanding tasks, open blockers, photos and issues, and the audit trail. Each update, photo and issue has a client-visible toggle plus approve/publish. Link manager issues, expires and revokes the client link and the technician link (Michael), and lists remembered devices.

**Field — `/field/:token`** (mobile-first, no admin chrome)
Job header (project, client, site, scope), today's outstanding work, floor drawing list. One big **Add site update** button opening a single-screen form: date/time prefilled, technician identity, floor/area, completed, outstanding, blockers, materials, team onsite, progress slider, next-shift plan, notes, and camera-first photo capture with category and caption per photo. Quick **Report issue** action with severity, floor and photo evidence. Prior updates are readable; approved ones are read-only. Large touch targets, drafts kept locally so a weak signal never loses a shift's work.

**Client — `/site-progress/:token`**
Restrained corporate read-only portal: DIGICONNECT C/O SUN INTERNATIONAL, overall progress, status, last updated, floor-by-floor progress, approved daily updates with approved photos, client-visible blockers, upcoming work, and approved drawings.

## Phases

1. **Foundation** — migrations, RLS, storage policies, seed the project with client, six floors and the drawing pack placeholder; admin link manager for both roles.
2. **Field app** — `site-field` function, `/field/:token`, update form, camera photos, issue reporting, Michael's link.
3. **Admin dashboard + approvals** — daily activity dashboard, timeline, approve/publish and client-visibility controls, audit view.
4. **Client portal** — `/site-progress/:token`, approved-only feed, drawings, progress.
5. **Later (architected now)** — drawing pins/annotations and one-click client-ready daily/weekly progress reports from approved updates.

## Assumptions

- The drawing pack PDF and Digiconnect contact details aren't in the project yet; I'll build the upload/attachment structure and you supply the file. No quantities will be inferred from the drawings.
- Michael's link is created without a login; identity comes from the link plus his typed name on each update.
- No automatic emails to the client — you decide when to send the link.
