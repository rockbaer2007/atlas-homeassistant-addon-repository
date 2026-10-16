// This code runs in the exported HA module, independently of the ATLAS server.
export function createHomeAssistantCardLocaleRuntime(title: string, replacementHint: string, languages: readonly string[] = ["en"]): string {
  const expected = [...new Set(["en", ...languages.filter(language => /^[a-z]{2}$/.test(language))])].slice(0, 32);
  return `const ATLAS_EN = ${JSON.stringify({ title, unavailable: "Unavailable", replaceDemoEntities: replacementHint })};
const ATLAS_EXPECTED_LOCALES = ${JSON.stringify(expected)};
const ATLAS_LOCALE_BASE = new URL("./locales/", import.meta.url);
const ATLAS_LOCALES = new Map();
function atlasReadLocale(language) {
  if (!ATLAS_LOCALES.has(language)) ATLAS_LOCALES.set(language, (async () => {
    const failed = { text: {}, readable: false };
    if (typeof fetch !== "function") return failed;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    try {
      const response = await fetch(new URL(language + ".json", ATLAS_LOCALE_BASE), {
        credentials: "omit", mode: "same-origin", redirect: "error", cache: "no-cache", signal: controller.signal,
      });
      if (!response.ok) return failed;
      const text = await response.text();
      if (text.length > 65536) return failed;
      const value = JSON.parse(text);
      if (!value || value._meta?.language !== language || !value.card || typeof value.card !== "object" || Array.isArray(value.card)) return failed;
      return { readable: true, text: Object.fromEntries(Object.keys(ATLAS_EN).flatMap(key => {
        const text = value.card[key];
        return typeof text === "string" && text.trim() && text.length <= 2000 ? [[key, text]] : [];
      })) };
    } catch { return failed; }
    finally { clearTimeout(timeout); }
  })());
  return ATLAS_LOCALES.get(language);
}
async function atlasLoadLocale(language) {
  const checked = [...new Set([...ATLAS_EXPECTED_LOCALES, language])];
  const results = new Map(await Promise.all(checked.map(async code => [code, await atlasReadLocale(code)])));
  return {
    text: { ...ATLAS_EN, ...results.get("en").text, ...results.get(language).text },
    issues: ATLAS_EXPECTED_LOCALES.filter(code => !results.get(code).readable).map(code => "locales/" + code + ".json"),
  };
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
  integrityNotice() {
    if (!this._localeIssues?.length) return [];
    const messages = {
      en: ["Card installation incomplete or unreadable: ", ". In HACS, redownload the complete Card package, then reload the browser. Restore your backup if needed."],
      de: ["Card-Installation unvollständig oder nicht lesbar: ", ". In HACS das vollständige Card-Paket erneut herunterladen und den Browser neu laden. Bei Bedarf die Sicherung wiederherstellen."],
      fr: ["Installation Card incomplète ou illisible : ", ". Dans HACS, retélécharger le paquet Card complet, puis recharger le navigateur. Restaurer la sauvegarde si nécessaire."],
    };
    const words = messages[this.cardLanguage()] ?? messages.en;
    const notice = document.createElement("p");
    notice.className = "atlas-card-integrity";
    notice.setAttribute("role", "status");
    notice.style.cssText = "margin:8px 0;padding:8px 12px;border:1px solid var(--warning-color,#e0a000);border-radius:8px;font-size:13px;line-height:1.4;color:var(--primary-text-color);overflow-wrap:anywhere";
    notice.textContent = words[0] + this._localeIssues.join(", ") + words[1];
    return [notice];
  }
`;
