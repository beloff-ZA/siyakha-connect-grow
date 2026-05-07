# Siyakha Technology — Website Growth Strategy Build

Strict monochrome stays. Lead forms route to `nikita@siyakhatechnology.co.za` via the existing `formSubmission` + `send-email` pipeline. Pricing tiers show **Request Pricing** only. WhatsApp `081 501 2993`. No physical address.

Shipped in 4 phases so each one is reviewable on its own.

---

## Phase 1 — Managed IT Services page (anchor page)

**Route:** `/managed-it`

New page using existing banner/section patterns (`EngineerSupportBanner`, `BespokeBanner` style):

- Hero: *"Managed IT Services for Modern Businesses — Your Outsourced IT Department."* CTAs: **Book a Free IT Assessment** · **WhatsApp Us**.
- 7 capability blocks: Outsourced IT Dept · Remote Monitoring · Cybersecurity · Microsoft 365 · Backup & Recovery · Network Management · SLA Support.
- **Managed IT Plans** — three monochrome cards (Essential / Professional / Enterprise) listing inclusions, each with a `Request Pricing` CTA opening the lead-magnet dialog.
- Why-Siyakha 6-pillar grid (Fast Response · End-to-End · Scalable · Industry Experience · Professional Installations · Future-Ready).
- Final CTA band → Free IT Assessment form.

## Phase 2 — Homepage rework

Edits to `src/pages/Index.tsx` and the related banner components — no new homepage components unless needed.

- **Hero copy update** (`SmartEstateHero`): headline *"Global IT Solutions for Schools, Businesses & Smart Infrastructure"*; sub *"Enterprise-grade networking, CCTV, cloud, managed IT and smart security across South Africa."* CTAs: **Get a Free Assessment** · **Talk to an Expert** · **WhatsApp Us**.
- New **Industry Solutions** band — 5 cards (Schools · Business · Security · Student Accommodation · Panel Beating / Automotive) each linking to its service page or `/contact`.
- New **Why Siyakha** 6-pillar band (mirrors managed-IT pillars for consistency).
- New **Featured Projects** strip — pulls from the case-study system (Phase 3), shows 2–3 cards with `View Case Study` link.
- New **Managed IT Plans** preview band linking to `/managed-it`.
- Final CTA band: *"Let's Build Smarter Technology Infrastructure"* with Schedule Consultation / Free Site Assessment / Contact buttons.
- Reorder/trim existing global-services banners so the page reads: Hero → Industry Solutions → Why Siyakha → Outcomes (existing) → Featured Projects → Managed IT Plans → existing tech banners → Final CTA.

## Phase 3 — Service pages + About

Four additional routes, same template as Managed IT:

- `/security-surveillance` — AI CCTV · Access Control · Remote Monitoring · AI Analytics · Perimeter · Commercial · School Surveillance.
- `/schools` — Classroom Networking · Wi-Fi · CCTV & Access · IT Support · Device Mgmt · Smart Classroom · LMS. Anchor case study: Marist Brothers Linmeyer.
- `/cloud-networking` — Structured Cabling · Wi-Fi Design · UniFi · Switching · Fibre · Cloud Backups · VPN · Hybrid Work.
- `/about` — Founder story · Mission · Vision · Values · Industries served · Certifications. Human-first, monochrome editorial layout. **No physical address.**

Header `MiniNav` gets a "Solutions" dropdown linking to all five service pages.

## Phase 4 — Case Study system + Lead-Magnet forms

**Case Study system**
- Data file `src/content/caseStudies.ts` — typed array (slug, client, industry, hero image, problem, solution, process[], results[], gallery[], quote).
- Reusable `<CaseStudyCard>` (used on homepage Featured Projects and per-service-page Featured Projects).
- Dynamic route `/case-studies/:slug` rendering Problem → Solution → Process → Results → Gallery → Client Quote → CTA.
- Seed entry: **Marist Brothers Linmeyer — 22-Classroom Network Infrastructure** (cabling, data points, switching, testing).

**Lead-magnet forms** — one shared `<LeadMagnetDialog kind="..." />`:
- Free Network Assessment
- Free Security Audit
- Free IT Infrastructure Review
- Free Wi-Fi Performance Check

Fields (zod-validated): Name · Company · Phone · Email · Business Size (Select) · Site location (optional). Submits via existing `lib/formSubmission.ts` → `send-email` edge function with subject prefixed by the magnet kind. Success toast + WhatsApp fallback.

Triggered from: every service-page CTA, homepage Industry cards, Managed IT Plans cards.

---

## Technical notes

- All new components live in `src/components/site/` (page sections) and `src/components/leads/` (forms). Existing `smart-estate/*` banners are not duplicated — reused where they fit.
- New routes added in `src/App.tsx`, all under `BrowserRouter`. SEO `<title>`, meta description, canonical and JSON-LD `Service` schema set per page (matching the pattern in `Index.tsx`).
- Sitemap `public/sitemap.xml` updated with the 5 new routes + `/case-studies/marist-brothers-linmeyer`.
- No DB changes. No new secrets. No auth UI. Form submissions reuse the current pipeline.
- Strict monochrome preserved — no blue accents introduced. Outcome cards, plan cards and case-study layouts use `border-foreground/15`, `bg-foreground/[0.03]` hover, and the `font-display` italic accents already established.

---

## Implementation order (ship-as-you-go)

```text
1. Managed IT Services page + LeadMagnetDialog component (Phase 1 + part of Phase 4)
2. Case Study data layer + Marist study + dynamic route (rest of Phase 3-anchor + Phase 4)
3. Homepage rework with Industry / Why / Featured / Plans / Final-CTA bands (Phase 2)
4. Security, Schools, Cloud-Networking, About pages + MiniNav dropdown + sitemap (Phase 3)
```

Each step is independently reviewable in the preview before moving on.
