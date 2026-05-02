import { useEffect, useState } from "react";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

const clearGoogTransCookie = () => {
  const expire = "Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `googtrans=;path=/;expires=${expire}`;
  const host = window.location.hostname;
  const parts = host.split(".");
  if (parts.length > 1) {
    const domain = "." + parts.slice(-2).join(".");
    document.cookie = `googtrans=;path=/;domain=${domain};expires=${expire}`;
  }
};

const setGoogTransCookie = (lang: "en" | "ar") => {
  clearGoogTransCookie();
  if (lang === "en") return;
  const value = `/en/${lang}`;
  document.cookie = `googtrans=${value};path=/`;
  const host = window.location.hostname;
  const parts = host.split(".");
  if (parts.length > 1) {
    const domain = "." + parts.slice(-2).join(".");
    document.cookie = `googtrans=${value};path=/;domain=${domain}`;
  }
};

const ensureGtStyles = () => {
  if (document.getElementById("gt-style-overrides")) return;
  const style = document.createElement("style");
  style.id = "gt-style-overrides";
  // Hide Google's top banner / tooltip artefacts so the page stays clean
  style.textContent = `
    .goog-te-banner-frame.skiptranslate,
    .goog-te-gadget,
    iframe.goog-te-banner-frame { display: none !important; }
    body { top: 0 !important; }
    .goog-tooltip, .goog-tooltip:hover, .goog-text-highlight { background: transparent !important; box-shadow: none !important; }
    #google_translate_element { position: absolute; left: -9999px; top: -9999px; visibility: hidden; }
  `;
  document.head.appendChild(style);
};

const ensureTranslateLoaded = () => {
  ensureGtStyles();

  if (!document.getElementById("google_translate_element")) {
    const div = document.createElement("div");
    div.id = "google_translate_element";
    document.body.appendChild(div);
  }

  if (!window.googleTranslateElementInit) {
    window.googleTranslateElementInit = () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new (window.google as any).translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,ar",
            autoDisplay: false,
            layout: 0,
          },
          "google_translate_element"
        );
      } catch (e) {
        // ignore
      }
    };
  }

  if (!document.querySelector('script[data-gtranslate]')) {
    const s = document.createElement("script");
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    s.defer = true;
    s.dataset.gtranslate = "true";
    document.body.appendChild(s);
  }
};

const LanguageToggle = () => {
  const [lang, setLang] = useState<"en" | "ar">("en");

  useEffect(() => {
    ensureTranslateLoaded();

    const match = document.cookie.match(/googtrans=\/en\/(en|ar)/);
    const current = (match?.[1] as "en" | "ar") || "en";
    setLang(current);
    document.documentElement.dir = current === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = current;
  }, []);

  const toggle = () => {
    const next = lang === "en" ? "ar" : "en";
    setGoogTransCookie(next);
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = next;
    // Hard reload so Google Translate re-evaluates the cookie cleanly
    window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={lang === "en" ? "Switch to Arabic" : "Switch to English"}
      className="notranslate flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 border border-border rounded-sm text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-foreground/80 hover:text-accent hover:border-accent transition-colors"
    >
      <span className={lang === "en" ? "font-semibold text-foreground" : ""}>EN</span>
      <span className="opacity-40">/</span>
      <span className={lang === "ar" ? "font-semibold text-foreground" : ""}>AR</span>
    </button>
  );
};

export default LanguageToggle;