# Architecture rules

- Public fact-only case studies reuse `CASE_STUDIES`; optional dates and portrait hero metadata prevent invented dates and misrepresented context photography.

- December photo quotes extend `submit-lead`, use bounded JSON/base64 and validated private `website-orders` uploads, and store the server-generated photo reference in the existing lead description; this avoids a second lead system or schema/security changes.
- Campaign-only email routing and idempotency stay server-owned; public clients cannot choose recipients, URLs or storage paths, and provider acceptance is not delivery confirmation.