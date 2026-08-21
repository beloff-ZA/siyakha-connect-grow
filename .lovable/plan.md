# Siyakha Connect — multi-client, multi-site platform

Generalise the existing portal (auth, floor-plan canvas, cable routes, rack equipment, BOQ, documents, gallery, reports, audit) into a tenanted platform: **Organisation → Site → Project → Plan/page → devices, routes, equipment, BOQ, docs, reports**. Nothing working gets rebuilt; existing tables are extended, not replaced.

Confirmed from the upload: `Platinum_Tote_Technology_Drawings_Rev03_Camera_Labels.pdf` is a single A0 page (2384 × 3370 pt) with page rotation 270 — it will be rasterised with rotation baked in so the canvas shows it upright.

Assumption to flag: C01–C44 exist as labels on the drawing but their coordinates are not machine-readable from the PDF. They will be created as **reference (unplaced-on-canvas) camera records with real labels, areas and NVR assignment**, ready for one drag each in the mapping workspace. No coordinates will be invented for any camera, C45–C48 included, and the design hold "Four camera positions remain to be confirmed" is shown.

## Phase 1 — Tenancy foundation (schema + security)

- New tables: `portal_organisations` (rename-free wrapper over existing `portal_clients` via a `client_id` link, or `portal_clients` gains `parent_reference`, `status`), `portal_sites`, `portal_memberships` (user ↔ organisation/site + role), `app_role` extended with `super_admin`, `project_manager`, `engineer`, `client_admin`, `client_editor`, `client_viewer`.
- `portal_projects` gains `site_id`; every existing project is back-filled. Ebrahim Ally / 353 Anton Lembede becomes Organisation "E. Ally" → Site "353 Anton Lembede Street" → its current project, with all markers, routes, racks, BOQ, docs and gallery untouched.
- Security-definer helpers in `private`: `is_super_admin()`, `has_org_access(org)`, `has_site_access(site)`, `can_edit_project(project)`. All existing portal RLS policies are rewritten to route through these, plus GRANTs on every new public table.
- Audit: extend existing history tables pattern with a generic `portal_activity` log.
- Idempotent migrations only (`if not exists`, guarded back-fill).

## Phase 2 — Accounts and roles

- Invite **Nikita Jacobs / nikita@siyakhatechnology.co.za** as `super_admin` and **Anthony / anthony@ewcoffee.co.za** as `client_admin` of Platinum Bingo & Slots, both via the existing `invite-client-user` / `invite-admin-user` edge functions using Supabase Auth invitations. No passwords anywhere in code, SQL, env or tables; no auth users created by SQL.
- `must_change_password` flag honoured on first login.
- "Preview as client" for super admins: switches the active organisation context but still passes through the same RLS (read-only, no impersonation tokens).

## Phase 3 — Platinum site and register

- Site: **Platinum Bingo & Slots – Lydenburg K1**, 59 De Beer Street, Lydenburg, 1120, Mpumalanga. Venue type "Betting and slots venue" (never "casino"). Project: CCTV, Wi-Fi, operational data and structured cabling, status Planning, budget reference R167,000 incl VAT, internal-visibility by default.
- Original PDF stored in private storage; high-res upright PNG generated as the plan page image, signed URLs only.
- Seeded registers: 48 cameras (C01–C44 reference, C45–C48 unplaced) with gaming vs operational allocation; NVR-01/02/03 Hikvision 16-ch with C01–16 / C17–32 / C33–48; 7 APs (W01–W07 named areas); 9 data points (D01–D09); 64 planned Cat6 links home-run to rack R01 with source, destination, service, estimated/measured length, status, test result, label and >90 m warning flag.
- Rack R01: existing 18U, 3 × 24-port patch panels, Grandstream GWN7803PH-PRO 24-port PoE (400 W), router/uplink, PDU, UPS, 3 × 16-ch NVRs, shelves/managers/leads — with U-utilisation, free capacity, and validation of switch ports, PoE budget, NVR channels and patch-panel capacity.

## Phase 4 — Reusable mapping workspace

One canvas built by generalising `FloorPlanCanvas` + `planGeometry`: device palette, layers, properties panel, page selector, search/filters, device schedule, explicit save/cancel, version history, audit trail, local undo/redo.

Object types: camera, Wi-Fi AP, rack, switch, NVR, router/firewall, data/POS point, fibre aggregation switch, LIU/ODF, splice point, patch panel, access-control device, cable route, fibre route, containment route, note/risk marker. CCTV keeps direction/FOV/range/cone plus NVR + channel; Wi-Fi gets coverage radius, band/model, switch/port, VLAN/SSID, PoE notes; cables keep normalised coordinates with endpoints attached to devices, editable waypoints, optional orthogonal routing, copper 90 m warning, fibre strand/SFP fields and CSV export. Normalised coordinates guarantee no drift on reload/resize/zoom/pan.

## Phase 5 — Plans, onboarding, dashboards, reports, BOQ

- Plan management: PDF/PNG/JPG, multi-page PDFs, multiple buildings/floors, revisions with comparison and archive, validation, duplicate detection, rotation/zoom/pan/fit, page naming, client-visible vs internal, original preserved, signed URLs only.
- Onboarding wizard (9 steps as specified) ending in "Pending review"; Siyakha approval gate for registrations and uploaded plans; rate limits on upload/onboarding.
- Super-admin dashboard (clients, sites, active projects, pending registrations, plans awaiting review, approvals, risks, delayed projects, portfolio totals, activity) and client dashboard (org/site/project selectors, status, device totals, docs, BOQ, progress, reports, questions, approvals, updates).
- Reports: the full listed set as PDF (print styles) and CSV, all totals derived from the selected client/site/project. Platinum shows 48 target / 44 placed-reference / 4 unplaced cameras, 48 NVR channels, 7 APs, 9 data points, 64 Cat6 links.
- BOQ generalised: sections, quantities, customer rates, VAT, internal supplier cost, markup/margin, visibility, revisions, comments, change requests, approval, product images/specs, PDF/CSV. Clients never see supplier cost, margin or other tenants' pricing.

## Verification (end of build)

Migrations listed with counts; typecheck/build once; focused authenticated browser tests for super-admin visibility, Anthony's isolation to Platinum only, unchanged Ebrahim Ally access, cross-tenant RLS denial, Rev03 orientation, plan upload, and marker persistence across save/reload/resize. Nothing published — revision stays in preview, with commit SHA reported.

## Technical notes

Credit-efficient: existing components and design tokens reused, one shared canvas, data-driven pages (no per-client pages), no new dependencies beyond PDF rasterisation already available in the sandbox, no payments/SMS/native work. Future features stay schema-ready only.

Because of its size this ships phase by phase — Phase 1 and 2 first (tenancy + accounts, the security-critical part), then 3, then 4, then 5.
