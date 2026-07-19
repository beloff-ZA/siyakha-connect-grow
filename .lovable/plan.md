# Import Hikvision IP Cameras from Sensor Pricelist

## What the spreadsheet contains

The uploaded file is Sensor Security's **July 2026 distributor pricelist** (Hikvision + other brands). Sheets I inspected:

- `3-Line cameras` — 17 real Hikvision **network / IP** cameras (bullet, dome, fisheye, varifocal)
- `Surveillance` — 319 rows, mostly analogue/Turbo HD (excluded per your choice)
- `Networking`, `Audio`, `Alarm`, `Intercom & AC`, etc. — not in scope this round

Per your answers, scope = **3-Line cameras only**, priced at **Retail incl. 15% VAT already** (Retail column in the sheet is already the marked-up figure; Sub-D is the distributor cost — I'll use `Retail` as the shop selling price).

## The 17 products to import

| Category | Model | Retail (ZAR) |
|---|---|---|
| Short-range 40m bullet | DS-2CD3046G2H-LI 2.8mm | 4,762.92 |
| Short-range 40m bullet | DS-2CD3046G2H-LI 4mm | 4,665.14 |
| Short-range 40m bullet | DS-2CD3046G3-IUY/SL 2.8mm (strobe + siren) | 6,798.10 |
| Long-range 60m bullet | DS-2CD3T46G2H-LIS 2.8mm | 7,192.22 |
| Long-range 60m bullet | DS-2CD3T46G2H-LIS 4mm | 7,192.22 |
| Long-range 60m bullet | DS-2CD3T46G2H-LISU/SL 2.8mm (strobe + siren) | 7,383.17 |
| Long-range 60m bullet | DS-2CD3T46G2H-LISU/SL 4mm (strobe + siren) | 7,383.17 |
| Vari-focal 60m bullet | DS-2CD3646G2HT-LIZS 2.7-13.5mm | 8,967.02 |
| Fisheye | DS-2CD3956G2-ISU 1.05mm | 6,091.68 |
| Fixed dome | DS-2CD3146G2H-LISU 2.8mm | 4,787.33 |
| Fixed dome | DS-2CD3346G2H-LISU/SL 2.8mm | 5,471.04 |
| Vari-focal 40m dome (PTRZ) | DS-2CD3746G2H-LIZSU 2.7-13.5mm | 10,080.86 |

*(A couple of models above are single SKUs; the Excel row count of 17 reflects lens/variant duplicates that will each become their own Shopify product for clarity.)*

## How images are handled

Yes — I can auto-fetch official Hikvision product renders from the model code, since:

- The `Image` column in the spreadsheet is empty
- Every model uses Hikvision's public SKU (DS-2CD…) which resolves to product pages on `hikvision.com` and mirrored e-tail sites

Flow per product:

1. Search the web for the exact model code (Firecrawl `search`), restricted to Hikvision-owned or high-authority reseller pages.
2. Pick the first result and scrape it for the hero product image URL.
3. Download the image to `/tmp/hik/<sku>.png`.
4. Attach it to the Shopify product on creation.
5. If no image can be resolved, publish the product anyway with no image and log the SKU so you can supply one manually.

Firecrawl is needed for this — I'll ask you to connect it before the fetch runs. No image bytes get committed to the repo.

## Shopify product structure

For each row:

- **Title** — friendly name derived from description + lens size (e.g. `Hikvision AcuSense 4MP Bullet Camera 2.8mm 40m IR | DS-2CD3046G2H-LI`)
- **Body (HTML)** — description from the spreadsheet + bulleted key specs (MP, IR range, WDR, PoE, lens) + supplier code
- **Vendor** — `Hikvision`
- **Product type** — `IP Cameras` (sub-grouped in tags: `Bullet`, `Dome`, `Fisheye`, `Vari-Focal`, `Strobe & Siren`)
- **Tags** — `Hikvision, IP Camera, AcuSense, PoE, 4MP` + category
- **SKU** — Sensor Product Code (e.g. `DS-2CD3046G2H-LI 2.8mm`)
- **Price** — `Retail` column value from the sheet
- **Inventory tracked** = yes; **inventory_policy** = `deny`; **requires_shipping** = true
- **Image(s)** — auto-fetched hero shot (single image per product on first import)

## Steps

1. Connect the **Firecrawl** connector (I'll prompt you when we start).
2. I extract the 17 product rows from the spreadsheet into a working JSON at `/tmp/hik-catalog.json`.
3. For each SKU: search + scrape + download image to `/tmp/hik/`.
4. For each SKU: call `shopify--create_product` with title, description, tags, price, SKU, and image.
5. Report a summary listing any products that were created without an image so you can fill those in later.
6. Confirm they appear on `/shop` and in the new "Featured Products" band on the home page (already wired).

## Technical notes

- **No code changes required** to the site. The storefront already lists everything created in Shopify.
- Products land in the currently connected store (`kjuvg2-c1.myshopify.com`).
- Image sourcing is best-effort — Hikvision's site occasionally rejects scraping; those SKUs will be logged.
- Nothing from the analogue `Surveillance` sheet or `Networking` sheet is imported. If you later want the Networking sheet (switches, PoE injectors) I'll rerun this flow scoped to that sheet.

## Out of scope

- Variant grouping (each lens length is its own product, not a variant — simpler for the shop UI and matches how Sensor lists them).
- Datasheets, PDFs, spec-sheet uploads.
- Stock quantity sync (the pricelist only marks availability bands like "Availability A"; not a numeric quantity).
