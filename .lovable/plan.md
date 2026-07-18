## Goal
Add a real online store to siyakhatechnology.co.za for physical products (10–50 SKUs) with full card checkout — without disturbing the existing monochrome site, Director OS, or lead flows.

## Recommended approach: Shopify
For physical products with real card checkout, Shopify is the right fit (Paddle can't sell physical goods; Stripe would require you to build inventory/shipping/tax yourself). The project already has `SHOPIFY_ACCESS_TOKEN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` configured, so the connection is in place.

Shopify handles: inventory, variants, shipping rates, tax, secure checkout, order emails, refunds, and the admin dashboard for you to manage stock and fulfil orders. We embed the catalog and cart on your site; checkout happens on Shopify's secure hosted checkout (opens in a new tab), then the customer returns.

## What gets built

1. **Store routes** (new, additive — home page unchanged in structure)
   - `/shop` — product grid pulled live from Shopify (title, image, price, "Add to Cart"), with "No products yet" empty state
   - `/shop/:handle` — product detail page (gallery, description, variant selector, quantity, Add to Cart)
   - Header "Solutions" and "Company" dropdowns stay; add a new top-level **Shop** link
   - Footer gets a small "Shop" link
   - Full monochrome styling, same typography/spacing as the rest of the site

2. **Cart system** (Zustand, persisted in localStorage)
   - Cart drawer (sheet) opens from a cart icon added to the header, with item count badge
   - Real-time sync with Shopify Storefront API (cartCreate / cartLinesAdd / cartLinesUpdate / cartLinesRemove)
   - "Checkout" button opens Shopify's hosted checkout in a new tab (`channel=online_store`)
   - Cart auto-clears after successful checkout on return

3. **Shopify integration layer**
   - `src/lib/shopify.ts` — Storefront API client (2025-07), GraphQL queries for products + cart mutations
   - `src/stores/cartStore.ts` — Zustand store with add/update/remove/sync
   - `src/hooks/useCartSync.ts` — clears completed orders when tab regains focus
   - Uses existing `SHOPIFY_STOREFRONT_ACCESS_TOKEN` and shop permanent domain (both already configured)

4. **Products**
   - After the store scaffolding is live, you tell me the products (title, description, price, variants, images) and I create them via the Shopify API — they appear on both your site and in your Shopify admin instantly. No mock/placeholder products.

5. **Not touched**
   - Home page structure, case studies, Director OS, partner engineer flow, lead forms, WhatsApp/email routing, monochrome theme, i18n, existing SEO

## Costs & next steps to go live
- Development/sandbox store is free while we build.
- To accept real money you claim the store (starts a 120-day Shopify free trial), then a paid Shopify subscription is required to keep selling after the trial. I'll prompt you when you're ready.

## Technical notes (for reference)
- API version: Shopify Storefront `2025-07`
- Checkout URL always includes `channel=online_store` and opens in a new tab
- Cart persists across sessions via `localStorage` under key `shopify-cart`
- No manual checkout permalinks or product-page redirects — everything goes through the Storefront API cart

## Open question before I build
Where should **Shop** sit in navigation — as its own top-level tab in the header (recommended), or nested under a dropdown? I'll default to top-level unless you say otherwise.