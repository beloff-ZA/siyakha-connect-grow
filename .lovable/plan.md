## Curated Instagram gallery

A hand-picked, on-brand gallery of your best Instagram shots rendered in monochrome — no live API, no tokens to maintain, and full control over which images represent Siyakha Technology.

### What you get

- A new `From The Field` gallery section on the Home page (below case studies) with 8–12 curated shots.
- A larger gallery block on the About page.
- Each image gets a short caption (e.g. "Structured cabling — Sandton", "Rack rebuild — Fourways").
- Small "Follow on Instagram" link/button under the gallery pointing to `https://www.instagram.com/siyakhatech/` (opens in new tab).
- All images forced to grayscale via CSS so they match the strict monochrome aesthetic — even if you swap in a colour photo later, the site stays consistent.
- Lightbox on click so visitors can view full-size.

### How the images get in

Because Instagram doesn't allow direct scraping, you send me the shots you want featured (or I can pull from the images already uploaded in this chat over the last few sessions — rack rebuilds, KFC, Kwamashu training room, the on-site engineer photos, etc.). I add them to `src/assets/gallery/` and wire them into a small `galleryImages.ts` content file so you can add/remove entries later just by editing that list.

### Where it goes

```text
Home page
 ├── Hero
 ├── Solutions
 ├── Case studies (existing)
 ├── From The Field (NEW gallery, 8 tiles, masonry) 
 └── Footer

About page
 └── "On The Ground" (existing) + expanded gallery grid
```

### Technical notes

- New component: `src/components/gallery/InstagramGallery.tsx` — responsive CSS grid (2 cols mobile, 4 cols desktop), `filter: grayscale(100%)` with a subtle hover un-grayscale for interactivity (optional, can be pure mono).
- Content source: `src/content/galleryImages.ts` exporting `{ src, alt, caption, location }[]`.
- Lightbox: reuse existing shadcn `Dialog` — no new dependency.
- Images optimized and imported as ES6 imports so Vite handles hashing/caching.
- No Instagram API, no edge function, no secrets, no third-party script — zero ongoing maintenance risk.

### Refresh workflow

When you post something great on Instagram, drop the image(s) in chat and I add them to the gallery in one turn.

### What this plan does NOT do

- No live/auto-syncing feed (that path was rejected in favour of the curated approach).
- No Instagram profile stats, follower count, or like counts.
- No new pages — purely additive sections on Home and About.
