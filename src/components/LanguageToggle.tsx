import { useEffect, useState } from "react";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

const STORAGE_KEY = "site_lang";

const ensureGtStyles = () => {
  if (document.getElementById("gt-style-overrides")) return;
  const style = document.createElement("style");
  style.id = "gt-style-overrides";
  style.textContent = `
    .goog-te-banner-frame.skiptranslate,
    .goog-te-gadget,
    iframe.goog-te-banner-frame { display: none !important; }
    body { top: 0 !important; position: static !important; }
    .goog-tooltip, .goog-tooltip:hover, .goog-text-highlight { background: transparent !important; box-shadow: none !important; }
    #google_translate_element { position: absolute !important; left: -9999px !important; top: -9999px !important; }
  `;
  document.head.appendChild(style);
};

const ensureTranslateLoaded = (): Promise<void> => {
  ensureGtStyles();

  if (!document.getElementById("google_translate_element")) {
    const div = document.createElement("div");
    div.id = "google_translate_element";
    document.body.appendChild(div);
  }

  return new Promise((resolve) => {
    const ready = () =>
      !!document.querySelector<HTMLSelectElement>(
        "select.goog-te-combo"
      );

    if (ready()) {
      resolve();
      return;
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
            },
            "google_translate_element"
          );
        } catch {
          /* noop */
        }
      };
    }

    if (!document.querySelector("script[data-gtranslate]")) {
      const s = document.createElement("script");
      s.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      s.defer = true;
      s.dataset.gtranslate = "true";
      document.body.appendChild(s);
    }

    // Poll until the Google select element exists
    const start = Date.now();
    const poll = window.setInterval(() => {
      if (ready()) {
        window.clearInterval(poll);
        resolve();
      } else if (Date.now() - start > 8000) {
        window.clearInterval(poll);
        resolve(); // give up; toggle will no-op gracefully
      }
    }, 150);
  });
};

const applyLanguage = async (lang: "en" | "ar") => {
  await ensureTranslateLoaded();
  const select = document.querySelector<HTMLSelectElement>(
    "select.goog-te-combo"
  );
  if (!select) return;
  // For English we set value to "" to restore the original page
  select.value = lang === "en" ? "" : "ar";
  select.dispatchEvent(new Event("change"));

  // Update document attributes
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
};

const LanguageToggle = () => {
  const [lang, setLang] = useState<"en" | "ar">("en");

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as "en" | "ar" | null) || "en";
    setLang(saved);
    // Apply saved language on mount
    applyLanguage(saved);
  }, []);

  const toggle = async () => {
    const next = lang === "en" ? "ar" : "en";
    setLang(next);
    localStorage.setItem(STORAGE_KEY, next);
    await applyLanguage(next);
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