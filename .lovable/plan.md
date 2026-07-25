# Siyakha Interlink — homepage & navigation rebuild

Rebuild the homepage and nav around two axes: **who we serve** (Estates, Commercial, Schools, Government/Border) and **what we build** (five capabilities). Kill the current five-equal-pitches homepage. Nothing on Director OS, `/shop`, or the quote flow changes.

## Homepage — new section order

Replace `src/pages/Index.tsx` section stack with, in order:

1. **Hero** — rewrite `SmartEstateHero.tsx`.
   - Headline: "The single technology partner for security, connectivity and operations — across estates, commercial sites, and schools."
   - Primary CTA "Talk to us about your project" scrolls to `#qualify`.
   - Secondary CTA "See our work" scrolls to `#case-studies`.
   - Keep the cable-management video and monochrome grade. Drop the 4-stat ledger from inside the hero — it becomes the proof strip.

2. **Proof strip** — new `ProofStrip.tsx`, immediately after hero, above the fold on desktop.
   - Stats: sites secured, km of perimeter covered, years operating, countries active.
   - Values marked as placeholders in code with a `// TODO: real figures` comment and a subtle "indicative" note until real numbers are supplied.

3. **The problem** — new `ProblemFrame.tsx`. One short paragraph, no icons-and-fluff.

4. **Who we work with** — new `AudienceGrid.tsx`. Four cards:
   - Estates → `/who-we-serve/estates` — community safety, HOA buy-in.
   - Commercial → `/who-we-serve/commercial` — uptime, tenant experience, compliance.
   - Schools → `/who-we-serve/schools` — child safety, access control, budget cycles.
   - Government / Border → `/who-we-serve/government` — large-scale perimeter, border intrusion detection. Rendered visually smaller / last but still on the homepage.

5. **What we build** — new `CapabilityGrid.tsx` (replaces `CapabilityPillars.tsx` on `/`). Five teaser cards, each linking to `/capabilities/*`:
   - Smart Estate Systems
   - AI Surveillance
   - Border Radar & Perimeter Detection
   - Fibre & Connectivity
   - Command Centre Operations
   - Visually distinct from the audience grid (different card treatment) so the two sections don't blur together.

6. **Case studies** — new `CaseStudiesTriad.tsx`. Three fixed slots: Estates, Commercial, Schools. Government/Border does not compete here — it lives on its own page. If real material only exists for one vertical, keep all three slots present with a clear "New project — coming soon" state so it doesn't read as estates-only.

7. **Where we operate** — new `RegionsMap.tsx`. SVG EMEA map with pinned markers: Johannesburg (HQ), Dubai, Riyadh, Doha, London.

8. **Why Siyakha** — trim `WhySiyakhaBand.tsx` to 3–4 points, all framed as "one integrated partner vs. stitched vendors."

9. **Qualifying contact form** — new `QualifyForm.tsx` at `#qualify`. Fields: name, company, region (SA / GCC / UK / Other), client type (Estates / Commercial / Schools / Government / Other), timeline, message. Posts through the existing `send-email` pipeline to `nikita@siyakhatechnology.co.za`. No schema changes.

## Sections pulled off the homepage

Kept in the codebase but removed from `/`: `BespokeBanner`, `IndustrySolutionsBand`, `AdvancedTechBento`, `OutcomesBanner`, `InstagramGallery`, `FeaturedProductsBand`, `ManagedItPlansPreview`, `TurnkeyManifesto`, `EngineerSupportBanner`, `BrandsWeTrust`, `VisionStatement`, `FinalCtaBand`, `FaithSection`. `FaithSection` and `InstagramGallery` continue to live on `/about`; `FeaturedProductsBand` continues to live on `/shop`.

## New pages

Add routes in `src/App.tsx` and build each from the existing `ServicePageTemplate` pattern.

**Who we serve** (4 pages)
- `/who-we-serve/estates`
- `/who-we-serve/commercial`
- `/who-we-serve/schools`
- `/who-we-serve/government`

Each: buyer-specific pain, the capabilities that solve it (pulled from the shared capability data), one relevant case study, and a contact CTA that deep-links to `/#qualify?type=<clienttype>` — `QualifyForm` reads the query param and pre-selects client type.

**Capabilities** (5 pages)
- `/capabilities/smart-estates`
- `/capabilities/ai-surveillance`
- `/capabilities/border-radar`
- `/capabilities/fibre-connectivity`
- `/capabilities/command-centre`

Each: what it is, high-level how, who it's for, relevant case study, spec sheet link, contact CTA.

**Projects page** — upgrade the existing recent-projects surface into `/projects` with client-type and region filters. Homepage triad still shows the three curated cards.

**About** and **Contact** — extend the existing `/about`; add a `/contact` route that reuses `QualifyForm` plus regional contacts.

## Navigation rebuild

Rewrite `src/components/Header.tsx` dropdowns:

- **Who We Serve** — Estates, Commercial, Schools, Government/Border.
- **Solutions** — Smart Estate Systems, AI Surveillance, Border Radar, Fibre & Connectivity, Command Centre Operations.
- Keep Projects, Shop, Language toggle, Cart.
- Mobile sheet mirrors both dropdowns.
- Retire the current "Company" dropdown; move About and Contact into a small right-side link cluster or into the mobile sheet only.

## SEO / metadata

- `Index.tsx` title: "Siyakha Interlink — Security, Connectivity & Operations for Estates, Commercial Sites & Schools." Matching description in the same shape. Drop the five-city / five-capability keyword stuffing from the homepage tags.
- Each new page sets its own title/description via the existing `SiteSEO.tsx` helper.
- `index.html` sitewide fallback updated to match.
- `public/sitemap.xml` gains all new `/who-we-serve/*`, `/capabilities/*`, `/projects`, `/contact` URLs.
- Existing FAQ / Organization JSON-LD stays; add a `BreadcrumbList` per new subpage.

## Design direction

- Keep the current monochrome palette and Space Grotesk / DM Sans typography — already matches the serious/technical brief. One sharp accent stays as-is, no new AI-blue gradients.
- Real photography only — draw from existing `galleryImages.ts` and case study assets. No stock imagery introduced.
- Regions section renders as a real SVG map, not decorative art.
- Audience grid and capability grid use visually distinct card treatments (different border, density, or accent placement) so buyers can tell "who we serve" apart from "what we build" at a glance.

## Out of scope

- Director OS / helpdesk backend.
- `/shop` and the quote flow.
- No new Supabase tables, no new edge functions. Qualifying form uses the existing email pipeline.
- Real proof-strip figures, real Commercial and Schools flagship case studies, and any regional-office contact details — placeholders/coming-soon states will ship until you supply the real content.

## Open questions before build

1. **Proof strip numbers** — supply real figures for sites secured / km perimeter / years / countries, or ship with clearly-flagged placeholders?
2. **Case study triad** — which specific projects anchor the Estates, Commercial, and Schools slots? If Commercial or Schools has no launchable case study yet, confirm the "coming soon" placeholder approach.
3. **Government/Border page content** — do we have a real border-radar deployment we can name and describe, or does that page launch as a capability overview only?

If you'd rather not block, say "proceed with placeholders" and I'll ship it with clearly-marked TODOs you can swap later.
