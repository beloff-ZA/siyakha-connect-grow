# Architecture rules

- Public fact-only case studies reuse `CASE_STUDIES`; optional dates and portrait hero metadata prevent invented dates and misrepresented context photography.
- Case-study equipment identities are opt-in per entry with official source metadata; this prevents manufacturer assignments leaking into unrelated projects.
- Case-study customer logos use separate opt-in `clientIdentity` metadata with exact official asset sources, so customer branding does not imply equipment supply, partnership or endorsement.
- Homepage latest-project selection is explicit content metadata, so adding a case study does not silently replace curated projects.
- Opt-in `typeCover` uses one shared native typographic cover across project pages and cards; photo-free entries omit image structured data to avoid implying site photography.
- Optional case-study status is rendered on detail, listing and latest cards; in-progress projects cannot silently appear as completed work.
- Opt-in `heroPhoto.preserveFullScene` renders approved full-scene photos at their native aspect ratio; other case-study photo framing stays unchanged.
- Public project classification uses tested shared filter helpers; empty locations remain unassigned so unknown venues cannot inherit the legacy regional default.

- December photo quotes extend `submit-lead`, use bounded JSON/base64 and validated private `website-orders` uploads, and store the server-generated photo reference in the existing lead description; this avoids a second lead system or schema/security changes.
- Campaign-only email routing and idempotency stay server-owned; public clients cannot choose recipients, URLs or storage paths, and provider acceptance is not delivery confirmation.