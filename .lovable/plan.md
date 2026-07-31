Add the uploaded brand Wi-Fi hero image to the `/brand-wifi` page as a full-width, grayscale-to-colour hero.

## What will change

1. **Asset handling**
   - Upload the uploaded image to Lovable Assets via the sandbox CLI.
   - Create `src/assets/brand-wifi-hero.png.asset.json` pointing to the CDN URL.

2. **New component**
   - Create `src/components/site/BrandWifiHero.tsx` that:
     - Uses the uploaded image as a full-width background.
     - Defaults to grayscale and transitions to full colour on hover (`duration-1000` / `duration-1200`).
     - Adds dark gradient overlays for legibility.
     - Preserves the existing "Back home" link.
     - Keeps the current headline, tagline, and two CTA buttons.

3. **Page update**
   - Replace the existing plain hero section in `src/pages/BrandWifi.tsx` with the new `<BrandWifiHero />` component.
   - Remove the old headline/CTA block to avoid duplication.
   - Leave all other sections (where it lives, why brands sponsor it, proven in the field, Why Siyakha, footer) unchanged.

4. **Verification**
   - Run a build check to confirm the page compiles.
   - Confirm the hover effect reveals colour on the `/brand-wifi` preview.