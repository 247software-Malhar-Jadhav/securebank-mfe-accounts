import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import mr from "./locales/mr.json";

/**
 * i18n bootstrap for the Accounts remote.
 *
 * FEDERATION NOTE: `i18next` and `react-i18next` are SHARED SINGLETONS. When embedded, the
 * shell has already called `i18n.init(...)`. We must NOT re-init (that would clobber the
 * shell's language/config). Instead we:
 *   - detect whether i18n is already initialized (embedded) and, if so, only ensure OUR
 *     translation resource bundles are added (so the shell can render our keys);
 *   - otherwise (standalone) initialize i18n ourselves with sensible defaults.
 *
 * Either way our keys live under their own namespaces (dashboard/accounts/common) so they
 * never collide with the shell's strings.
 */

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
} as const;

export function initAccountsI18n(): typeof i18n {
  if (i18n.isInitialized) {
    // EMBEDDED: the shell owns init; just merge our bundles into the existing instance.
    // `deep: true, overwrite: false` keeps the shell's strings authoritative on any clash.
    for (const [lng, ns] of Object.entries(resources)) {
      i18n.addResourceBundle(lng, "translation", ns.translation, true, false);
    }
    return i18n;
  }

  // STANDALONE: full init with our defaults.
  void i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    supportedLngs: ["en", "hi", "mr"],
    interpolation: { escapeValue: false }, // React already escapes.
    react: { useSuspense: false },
  });

  return i18n;
}

export default i18n;
