import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { applyLanguage, LangCode } from "@/i18n";

const LANGUAGES: { code: LangCode; label: string; native: string }[] = [
  { code: "en", label: "EN", native: "English" },
  { code: "ar", label: "AR", native: "العربية" },
  { code: "fr", label: "FR", native: "Français" },
  { code: "it", label: "IT", native: "Italiano" },
  { code: "es", label: "ES", native: "Español" },
  { code: "pt", label: "PT", native: "Português" },
  { code: "zh-CN", label: "ZH", native: "中文" },
];

const LanguageToggle = () => {
  const { i18n, t } = useTranslation();
  const [lang, setLang] = useState<LangCode>((i18n.language as LangCode) || "en");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const choose = (next: LangCode) => {
    setLang(next);
    setOpen(false);
    applyLanguage(next);
  };

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div ref={ref} className="relative notranslate flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("languageToggle.ariaLabel") as string}
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