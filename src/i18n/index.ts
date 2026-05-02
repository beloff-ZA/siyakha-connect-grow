import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ar from "./locales/ar.json";
import fr from "./locales/fr.json";
import it from "./locales/it.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";
import zhCN from "./locales/zh-CN.json";

export type LangCode = "en" | "ar" | "fr" | "it" | "es" | "pt" | "zh-CN";

export const SUPPORTED_LANGS: LangCode[] = ["en", "ar", "fr", "it", "es", "pt", "zh-CN"];
export const RTL_LANGS: LangCode[] = ["ar"];
const STORAGE_KEY = "site_lang";

const saved = (typeof window !== "undefined"
  ? (localStorage.getItem(STORAGE_KEY) as LangCode | null)
  : null) || "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      fr: { translation: fr },
      it: { translation: it },
      es: { translation: es },
      pt: { translation: pt },
      "zh-CN": { translation: zhCN },
    },
    lng: saved,
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGS,
    interpolation: { escapeValue: false },
    returnObjects: true,
  });

export const applyLanguage = (lang: LangCode) => {
  i18n.changeLanguage(lang);
  if (typeof document !== "undefined") {
    document.documentElement.dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, lang);
  }
};

// Apply on initial load (dir/lang attributes)
if (typeof document !== "undefined") {
  document.documentElement.dir = RTL_LANGS.includes(saved as LangCode) ? "rtl" : "ltr";
  document.documentElement.lang = saved;
}

export default i18n;