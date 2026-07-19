## Goal

Add only **Computers, Storage, Screens, and Smartboards** from the three Esquire 27th Anniversary Sale emails (Deals #06, #07, #08) to the Shopify store, marked up **30%** on the listed dealer price incl. VAT. Skip everything else — laundry, fridges, small appliances, Casey cookware, solar kits.

Skip storage-pricing markup for now (as confirmed).

## Approach

1. **Extract deal page images** — the emails are just image galleries hosted at `esquiredirect.co.za/Specials/01-Anniversary/Deals{06,07,08}/Esquire/PageNN.jpg`. Download all pages from each deal.
2. **OCR each page** with `pytesseract` to pull product title, spec bullets, SKU, and dealer price.
3. **Filter** to only the 4 target categories:
   - **Computers** — desktops, laptops, mini PCs, all-in-ones
   - **Storage** — external drives, SSDs, NAS, USB storage
   - **Screens** — monitors, displays (NOT televisions unless marketed as commercial display)
   - **Smartboards** — interactive flat panels / IFPDs
4. **Present the filtered list back** with each item's dealer price + 30% retail price for a quick sanity check before creating anything (avoids adding wrong products from noisy OCR).
5. **Create products in Shopify** via `shopify--create_product` — each with title, description (spec bullets), SKU, marked-up price, and the source page image saved to `src/assets/shopify/esquire/`.
6. **Categories on `/shop`** — reuse existing `Storage` filter; add new filters `Computers` and `Displays` (covers Screens + Smartboards) to `src/pages/Shop.tsx` category chips.

## Technical Details

- Image source pattern: `https://www.esquiredirect.co.za/Specials/01-Anniversary/Deals{06|07|08}/Esquire/Page{01..15}.jpg`
- Only the `/Esquire/` folder is in scope. Skip `/Casey/` (cookware) and `/Solar/` folders entirely.
- Markup: `retail = round(dealer_incl_vat * 1.30, 2)` — matches convention used for EcoFlow and Cattex fibre.
- Product category tags will follow the existing pattern (`storage`, `computers`, `displays`) so `Shop.tsx` filters pick them up.
- Images: save each product's source page as a cropped PNG to `src/assets/shopify/esquire/{slug}.png` and upload to Shopify.

## Confirmation Step

After OCR + filtering, I'll post the extracted candidate list (title / dealer / retail) in chat before creating any products, so you can strike anything that shouldn't be listed.
