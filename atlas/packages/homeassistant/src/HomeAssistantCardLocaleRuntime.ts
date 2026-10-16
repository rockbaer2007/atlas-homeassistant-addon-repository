// This code runs in the exported HA module, independently of the ATLAS server.
export function createHomeAssistantCardLocaleRuntime(title: string, replacementHint: string): string {
  return `const ATLAS_EN = ${JSON.stringify({ title, unavailable: "Unavailable", replaceDemoEntities: replacementHint })};
const ATLAS_LOCALE_BASE = new URL("./locales/", import.meta.url);
const ATLAS_LOCALES = new Map();
function atlasReadLocale(language) {
  if (!ATLAS_LOCALES.has(language)) ATLAS_LOCALES.set(language, (async () => {
    if (typeof fetch !== "function") return {};
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    try {
      const response = await fetch(new URL(language + ".json", ATLAS_LOCALE_BASE), {
        credentials: "omit", mode: "same-origin", redirect: "error", cache: "no-cache", signal: controller.signal,
      });
      if (!response.ok) return {};
      const text = await response.text();
      if (text.length > 65536) return {};
      const value = JSON.parse(text);
      if (!value || value._meta?.language !== language || !value.card || Array.isArray(value.card)) return {};
      return Object.fromEntries(Object.keys(ATLAS_EN).flatMap(key => {
        const text = value.card[key];
        return typeof text === "string" && text.trim() && text.length <= 2000 ? [[key, text]] : [];
      }));
    } catch { return {}; }
    finally { clearTimeout(timeout); }
  })());
  return ATLAS_LOCALES.get(language);
}
async function atlasLoadLocale(language) {
  const [english, selected] = await Promise.all([
    atlasReadLocale("en"), language === "en" ? {} : atlasReadLocale(language),
  ]);
  return { ...ATLAS_EN, ...english, ...selected };
}
`;
}

export const homeAssistantCardLocaleMethods = `  cardLanguage() {
    const requested = this.config?.language || this._hass?.locale?.language || this._hass?.language || "en";
    const base = typeof requested === "string" ? requested.toLowerCase().split(/[-_]/)[0] : "en";
    return /^[a-z]{2}$/.test(base) ? base : "en";
  }
  translated(key) { return this._locale?.[key] ?? ATLAS_EN[key]; }
  localizedTitle() {
    return this.config?.title && this.config.title !== DEFAULT_CONFIG.title
      ? this.config.title : this.translated("title");
  }
  localizedHint() {
    return this.config?.replacement_hint && this.config.replacement_hint !== DEFAULT_CONFIG.replacement_hint
      ? this.config.replacement_hint : this.translated("replaceDemoEntities");
  }
`;
