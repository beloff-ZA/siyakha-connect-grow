## Goal

Replace the Google Translate widget with proper static translations using **react-i18next**, with all copy stored in JSON files for English, Arabic, French, Italian, Spanish, Portuguese, and Chinese (Simplified).

## Honest scope warning

Your home page alone has ~30 banner components, plus Footer, MiniNav, FaithSection, Hero, etc. — roughly **4,300 lines of TSX outside the admin area**, containing hundreds of distinct strings (headlines, taglines, feature lists, CTAs, alt text). Translating *every* string across 7 languages = effectively 6 full translated copies of the marketing site.

I can do this fully on my own using Lovable AI (Gemini 2.5 Pro) — no manual translation work for you — but to keep quality high and avoid one giant unreviewable change, I'll do it in **phases**.

## Phase 1 — Foundation + high-impact copy (this approval)

### Setup
1. Install `react-i18next`, `i18next`, `i18next-browser-languagedetector`.
2. Create `src/i18n/index.ts` — initialises i18next, loads JSON locales, detects saved language from `localStorage` (key `site_lang`, same as today), defaults to English.
3. Create `src/i18n/locales/{en,ar,fr,it,es,pt,zh-CN}.json` — namespaced keys (e.g. `header.selectLanguage`, `hero.slide1.headline`, `engineerSupport.title`).
4. Import `./i18n` in `src/main.tsx` so it loads before render.

### Replace LanguageToggle behaviour
- Keep the existing dropdown UI (chip + native names) — only swap the engine.
- On select: call `i18n.changeLanguage(code)`, save to `localStorage`, set `document.documentElement.dir` (rtl for `ar`) and `lang`.
- Remove all Google Translate script injection, polling, style overrides, and the hidden `#google_translate_element` div.

### Translate (Phase 1 components)
The most visible / branded copy first:
- `Header` (tagline, "Select Your Language")
- `SmartEstateHero` (both slides — already bilingual EN/AR; expand to all 7)
- `BespokeBanner`, `VisionStatement`, `TurnkeyManifesto`
- `EngineerSupportBanner` (your core revenue line)
- `Footer`, `MiniNav`, `WhatsAppContact`
- `DeveloperCTA` (contact section)

Each component will use `const { t } = useTranslation()` and reference keys instead of hard-coded strings. The Arabic block in the hero stays as a featured slide but will pull from the AR locale.

### How translations get generated
I'll write a one-off Node script in `/tmp` that reads the English JSON, calls Lovable AI Gateway (`google/gemini-2.5-pro`) once per target language with the brand glossary embedded in the prompt ("Siyakha Interlink", "L2 & L3 engineers", "EMEA", region names — keep untranslated), and writes the 6 translated JSON files. I run it, review the output, and commit. No API key needed from you.

### Out of scope for Phase 1
- All 30+ sector banner components (Cabling, Enterprise WiFi, CCTV, Smart Home, Hotel, Franchise, Mine, Retail, Farm, etc.) — they stay English-only until Phase 2. Browser auto-translate still works as a fallback for those.
- Helpdesk / Director OS / Auth pages — internal admin tools, not for translation.
- SEO meta tags / JSON-LD schema — keep English (Google handles localisation via hreflang separately if needed later).

## Phase 2 (separate approval, after you see Phase 1 working)

Translate the remaining ~25 sector banner components in batches. Same process, no code architecture changes — purely content extraction + AI translation runs.

## Technical details

- **No flicker**: i18next loads synchronously from bundled JSON; first paint is in the chosen language.
- **RTL**: handled by setting `dir="rtl"` on `<html>` for Arabic, same as today. Tailwind's logical properties already work.
- **Bundle size**: 7 JSON files ~5–15KB each gzipped. Negligible.
- **Type safety**: optional `resources` typing later; not required for v1.
- **Fallback**: missing keys fall back to English automatically.
- **Removed**: all `googleTranslateElementInit`, `goog-te-combo`, `notranslate`, GT style overrides.

## Files

**New**
- `src/i18n/index.ts`
- `src/i18n/locales/en.json`, `ar.json`, `fr.json`, `it.json`, `es.json`, `pt.json`, `zh-CN.json`

**Edited**
- `src/main.tsx` (import i18n)
- `src/components/LanguageToggle.tsx` (swap engine, keep UI)
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/components/MiniNav.tsx`
- `src/components/WhatsAppContact.tsx`
- `src/components/FaithSection.tsx`
- `src/components/smart-estate/SmartEstateHero.tsx`
- `src/components/smart-estate/BespokeBanner.tsx`
- `src/components/smart-estate/VisionStatement.tsx`
- `src/components/smart-estate/TurnkeyManifesto.tsx`
- `src/components/smart-estate/EngineerSupportBanner.tsx`
- `src/components/smart-estate/DeveloperCTA.tsx`

**Removed (uninstall)**
- `googletagmanager`-style Google Translate script injection in `LanguageToggle`

## Confirm before I start

Approve this and I'll execute Phase 1 end-to-end. After you verify language switching works on the home page hero/banners, say the word and I'll roll Phase 2 across all remaining sector banners.
