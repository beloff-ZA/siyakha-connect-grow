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
  // Always clear first so switching back to EN fully restores the original page
  clearGoogTransCookie();
  if (lang === "en") return; // No cookie => Google Translate stays off, page is original English
  const value = `/en/${lang}`;
  document.cookie = `googtrans=${value};path=/`;
  const host = window.location.hostname;
  const parts = host.split(".");
  if (parts.length > 1) {
    const domain = "." + parts.slice(-2).join(".");
    document.cookie = `googtrans=${value};path=/;domain=${domain}`;
  }
};

const LanguageToggle = () => {
  const [lang, setLang] = useState<"en" | "ar">("en");

  useEffect(() => {
    // Inject hidden Google Translate container + script (only once)
    if (!document.getElementById("google_translate_element")) {
      const div = document.createElement("div");
      div.id = "google_translate_element";
      div.style.display = "none";
      document.body.appendChild(div);
    }

    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new (window.google as any).translate.TranslateElement(
          { pageLanguage: "en", includedLanguages: "en,ar", autoDisplay: false },
          "google_translate_element"
        );
      };
    }

    if (!document.querySelector('script[src*="translate.google.com/translate_a/element.js"]')) {
      const s = document.createElement("script");
      s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      document.body.appendChild(s);
    }

    // Restore previous selection
    const match = document.cookie.match(/googtrans=\/en\/(en|ar)/);
    if (match && (match[1] === "ar" || match[1] === "en")) {
      setLang(match[1] as "en" | "ar");
      document.documentElement.dir = match[1] === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = match[1];
    }
  }, []);

  const toggle = () => {
    const next = lang === "en" ? "ar" : "en";
    setLang(next);
    setGoogTransCookie(next);
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = next;
    // Reload so Google Translate applies the cookie selection across the page
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