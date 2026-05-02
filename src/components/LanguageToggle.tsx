import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

type LangCode = "en" | "ar" | "fr" | "it" | "es" | "pt" | "zh-CN";

const LANGUAGES: { code: LangCode; label: string; native: string }[] = [
  { code: "en", label: "EN", native: "English" },
  { code: "ar", label: "AR", native: "العربية" },
  { code: "fr", label: "FR", native: "Français" },
  { code: "it", label: "IT", native: "Italiano" },
  { code: "es", label: "ES", native: "Español" },
  { code: "pt", label: "PT", native: "Português" },
  { code: "zh-CN", label: "ZH", native: "中文" },
];

const RTL_LANGS: LangCode[] = ["ar"];
const STORAGE_KEY = "site_lang";
const INCLUDED = LANGUAGES.map((l) => l.code).join(",");

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
      !!document.querySelector<HTMLSelectElement>("select.goog-te-combo");

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
              includedLanguages: INCLUDED,
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

    const start = Date.now();
    const poll = window.setInterval(() => {
      if (ready()) {
        window.clearInterval(poll);
        resolve();
      } else if (Date.now() - start > 8000) {
        window.clearInterval(poll);
        resolve();
      }
    }, 150);
  });
};

const applyLanguage = async (lang: LangCode) => {
  await ensureTranslateLoaded();
  const select = document.querySelector<HTMLSelectElement>("select.goog-te-combo");
  if (!select) return;
  // For English we set value to "" to restore the original page
  select.value = lang === "en" ? "" : lang;
  select.dispatchEvent(new Event("change"));

  document.documentElement.dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
  document.documentElement.lang = lang;
};

const LanguageToggle = () => {
  const [lang, setLang] = useState<LangCode>("en");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as LangCode | null) || "en";
    setLang(saved);
    applyLanguage(saved);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const choose = async (next: LangCode) => {
    setLang(next);
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, next);
    await applyLanguage(next);
  };

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div ref={ref} className="relative notranslate flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 border border-border rounded-sm text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-foreground/80 hover:text-accent hover:border-accent transition-colors"
      >
        <span className="font-semibold text-foreground">{current.label}</span>
        <svg
          className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-2 min-w-[160px] bg-background border border-border rounded-sm shadow-lg z-50 py-1"
        >
          {LANGUAGES.map((l) => {
            const active = l.code === lang;
            return (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => choose(l.code)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 text-xs uppercase tracking-[0.14em] transition-colors ${
                    active
                      ? "bg-foreground/5 text-foreground"
                      : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                  }`}
                >
                  <span className="font-semibold">{l.label}</span>
                  <span className="text-[10px] tracking-normal normal-case text-foreground/60">
                    {l.native}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguageToggle;