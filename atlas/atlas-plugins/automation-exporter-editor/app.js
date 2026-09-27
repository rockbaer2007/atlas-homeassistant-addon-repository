const state = {
  sourceName: "",
  automations: [],
  selectedIds: new Set(),
  exports: [],
  activeId: "",
  groupBy: "none",
  groupFilter: "",
};

const elements = {
  loadSystem: document.querySelector("#load-system"),
  upload: document.querySelector("#yaml-upload"),
  sourceStatus: document.querySelector("#source-status"),
  exportFolder: document.querySelector("#export-folder"),
  search: document.querySelector("#search"),
  groupBy: document.querySelector("#group-by"),
  groupFilter: document.querySelector("#group-filter"),
  filterWarnings: document.querySelector("#filter-warnings"),
  selectAll: document.querySelector("#select-all"),
  selectNone: document.querySelector("#select-none"),
  exportSelected: document.querySelector("#export-selected"),
  previewConflicts: document.querySelector("#preview-conflicts"),
  clearHistory: document.querySelector("#clear-history"),
  list: document.querySelector("#automation-list"),
  details: document.querySelector("#details"),
  history: document.querySelector("#export-history"),
  selectionCount: document.querySelector("#selection-count"),
  countAutomations: document.querySelector("#count-automations"),
  countEntities: document.querySelector("#count-entities"),
  countServices: document.querySelector("#count-services"),
  countConflicts: document.querySelector("#count-conflicts"),
  countWarnings: document.querySelector("#count-warnings"),
};

let currentLanguage = readLanguageFromLocation();
let currentThemePreference = readThemePreferenceFromLocation() ?? "auto";

const translations = {
  de: {
    eyebrow: "ATLAS Plugin", title: "Automation Exporter / Editor", themeLabel: "Darstellung", themeAuto: "Auto", themeLight: "Hell", themeDark: "Dunkel", languageLabel: "Sprache", pluginHub: "Plugin Hub", sourcesAndExport: "Quellen und Export", status: "Status", automations: "Automationen", entities: "Entitäten", services: "Services", conflicts: "Konflikte", warnings: "Hinweise", source: "Quelle", loadSystem: "System automations.yaml", uploadYaml: "YAML hochladen", export: "Export", exportFolder: "Export-Ordner", exportHint: "Ausgewählte Automationen werden als einzelne YAML-Dateien gespeichert. Existierende Dateien werden nicht überschrieben.", tools: "Werkzeuge", searchPlaceholder: "Alias, ID, Entität oder Service suchen", groupBy: "Gruppieren nach", groupNone: "Keine Gruppierung", domain: "Domain", area: "Bereich", device: "Gerät", filterGroup: "Gruppe filtern", allGroups: "Alle Gruppen", warningsOnly: "Nur Hinweise anzeigen", selectAll: "Alle markieren", selectNone: "Auswahl leeren", exportSelected: "Auswahl exportieren", previewConflicts: "Konflikte prüfen", emptyAutomationList: "Lade eine Systemdatei oder eine fremde YAML hoch.", details: "Details", chooseAutomation: "Wähle eine Automation aus.", exportedAutomations: "Exportierte Automationen", clearList: "Liste leeren", noExports: "Noch keine Exporte in dieser Sitzung.", ready: "Bereit. Lade die echte /config/automations.yaml oder lade eine fremde YAML hoch.", loadingSystem: "Lese /config/automations.yaml ...", systemUnreadable: "/config/automations.yaml ist nicht lesbar. Bitte /config freigeben oder YAML hochladen.", systemEmpty: "/config/automations.yaml ist leer.", systemLoaded: "{path}: {count} Automationen erkannt. Backup: {backup}", systemLoadError: "/config/automations.yaml konnte nicht gesichert oder geladen werden. Bitte File-Studio-Zugriff prüfen oder YAML hochladen.", sourceLoaded: "{source}: {count} Automationen erkannt{warning}.", noAutomationMatch: "Keine passende Automation gefunden.", selectAutomation: "{alias} auswählen", automationSelected: "{count} ausgewählt", automationCount: "{count} Automation(en)", trigger: "Trigger", condition: "Bedingungen", action: "Aktionen", domainPrefix: "Domain", areaPrefix: "Bereich", devicePrefix: "Gerät", conflictPrefix: "Konflikt", warningPrefix: "Hinweis", selectForExport: "Keine Automation für den Export ausgewählt.", exporting: "Exportiere {count} Automation(en) nach {folder} ...", exported: "{count} Automation(en) in {folder} gespeichert: Exportversion mit ID, bereinigte Importversion ohne ID.", exportFailed: "Export fehlgeschlagen: {error} Browser-Download wird als Rückfall genutzt.", saved: "gespeichert", openExport: "Export öffnen", openImport: "Import-Version öffnen", copyExport: "Export-YAML kopieren", copyImport: "Import-YAML kopieren", copied: "{filename}: YAML kopiert.", copiedImport: "{filename}: bereinigte Import-YAML kopiert.", conflictSelect: "Keine Automation für die Konfliktprüfung ausgewählt.", conflictNone: "Konfliktprüfung: {count} Automation(en), keine doppelten IDs oder Aliase in der Auswahl.", conflictFound: "Konfliktprüfung: {count} mögliche Konflikte. {summary}", withoutDomain: "Ohne Domain", withoutArea: "Ohne Bereich", withoutDevice: "Ohne Gerät", withoutGroup: "Ohne Gruppe", domains: "Domains", areas: "Bereiche", devices: "Geräte", groups: "Gruppen", selectedDetails: "{triggers} Trigger, {conditions} Bedingungen, {actions} Aktionen, {entities} Entitäten, {services} Services", exportSaved: "Export und bereinigte Import-Version gespeichert", download: "Download", browserDownload: "Browser-Download", errorOutsideRoot: "Pfad liegt außerhalb der freigegebenen Bereiche.", errorMissing: "Zielordner wurde nicht gefunden oder konnte nicht erstellt.", errorExists: "Eine Zieldatei existiert bereits.", errorInvalid: "Exportordner oder Dateiname ist ungültig.",
  },
  en: {
    eyebrow: "ATLAS Plugin", title: "Automation Exporter / Editor", themeLabel: "Appearance", themeAuto: "Auto", themeLight: "Light", themeDark: "Dark", languageLabel: "Language", pluginHub: "Plugin Hub", sourcesAndExport: "Sources and export", status: "Status", automations: "Automations", entities: "Entities", services: "Services", conflicts: "Conflicts", warnings: "Warnings", source: "Source", loadSystem: "System automations.yaml", uploadYaml: "Upload YAML", export: "Export", exportFolder: "Export folder", exportHint: "Selected automations are saved as separate YAML files. Existing files are not overwritten.", tools: "Tools", searchPlaceholder: "Search alias, ID, entity or service", groupBy: "Group by", groupNone: "No grouping", domain: "Domain", area: "Area", device: "Device", filterGroup: "Filter group", allGroups: "All groups", warningsOnly: "Show warnings only", selectAll: "Select all", selectNone: "Clear selection", exportSelected: "Export selection", previewConflicts: "Check conflicts", emptyAutomationList: "Load the system file or upload another YAML file.", details: "Details", chooseAutomation: "Select an automation.", exportedAutomations: "Exported automations", clearList: "Clear list", noExports: "No exports in this session yet.", ready: "Ready. Load /config/automations.yaml or upload another YAML file.", loadingSystem: "Reading /config/automations.yaml ...", systemUnreadable: "/config/automations.yaml cannot be read. Grant access to /config or upload YAML.", systemEmpty: "/config/automations.yaml is empty.", systemLoaded: "{path}: found {count} automation(s). Backup: {backup}", systemLoadError: "Could not back up or load /config/automations.yaml. Check File Studio access or upload YAML.", sourceLoaded: "{source}: found {count} automation(s){warning}.", noAutomationMatch: "No matching automation found.", selectAutomation: "Select {alias}", automationSelected: "{count} selected", automationCount: "{count} automation(s)", trigger: "Triggers", condition: "Conditions", action: "Actions", domainPrefix: "Domain", areaPrefix: "Area", devicePrefix: "Device", conflictPrefix: "Conflict", warningPrefix: "Warning", selectForExport: "Select an automation to export.", exporting: "Exporting {count} automation(s) to {folder} ...", exported: "Saved {count} automation(s) in {folder}: export version with ID and cleaned import version without ID.", exportFailed: "Export failed: {error} Falling back to browser downloads.", saved: "saved", openExport: "Open export", openImport: "Open import version", copyExport: "Copy export YAML", copyImport: "Copy import YAML", copied: "{filename}: YAML copied.", copiedImport: "{filename}: cleaned import YAML copied.", conflictSelect: "Select an automation to check for conflicts.", conflictNone: "Conflict check: {count} automation(s); no duplicate IDs or aliases in the selection.", conflictFound: "Conflict check: {count} possible conflicts. {summary}", withoutDomain: "No domain", withoutArea: "No area", withoutDevice: "No device", withoutGroup: "No group", domains: "Domains", areas: "Areas", devices: "Devices", groups: "Groups", selectedDetails: "{triggers} triggers, {conditions} conditions, {actions} actions, {entities} entities, {services} services", exportSaved: "Export and cleaned import version saved", download: "Download", browserDownload: "Browser download", errorOutsideRoot: "The path is outside the approved locations.", errorMissing: "The target folder was not found or could not be created.", errorExists: "A target file already exists.", errorInvalid: "The export folder or file name is invalid.",
  },
  fr: {
    eyebrow: "Plugin ATLAS", title: "Exportateur / Éditeur d’automatisations", themeLabel: "Apparence", themeAuto: "Auto", themeLight: "Clair", themeDark: "Sombre", languageLabel: "Langue", pluginHub: "Hub des plugins", sourcesAndExport: "Sources et exportation", status: "État", automations: "Automatisations", entities: "Entités", services: "Services", conflicts: "Conflits", warnings: "Avertissements", source: "Source", loadSystem: "Automatisations du système (automations.yaml)", uploadYaml: "Importer un fichier YAML", export: "Exportation", exportFolder: "Dossier d’exportation", exportHint: "Les automatisations sélectionnées sont enregistrées dans des fichiers YAML séparés. Les fichiers existants ne sont pas remplacés.", tools: "Outils", searchPlaceholder: "Rechercher un alias, un ID, une entité ou un service", groupBy: "Regrouper par", groupNone: "Aucun regroupement", domain: "Domaine", area: "Zone", device: "Appareil", filterGroup: "Filtrer le groupe", allGroups: "Tous les groupes", warningsOnly: "Afficher uniquement les avertissements", selectAll: "Tout sélectionner", selectNone: "Effacer la sélection", exportSelected: "Exporter la sélection", previewConflicts: "Vérifier les conflits", emptyAutomationList: "Chargez le fichier système ou importez un autre fichier YAML.", details: "Détails", chooseAutomation: "Sélectionnez une automatisation.", exportedAutomations: "Automatisations exportées", clearList: "Vider la liste", noExports: "Aucune exportation pour cette session.", ready: "Prêt. Chargez /config/automations.yaml ou importez un autre fichier YAML.", loadingSystem: "Lecture de /config/automations.yaml ...", systemUnreadable: "Impossible de lire /config/automations.yaml. Autorisez l’accès à /config ou importez un fichier YAML.", systemEmpty: "/config/automations.yaml est vide.", systemLoaded: "{path} : {count} automatisation(s) détectée(s). Sauvegarde : {backup}", systemLoadError: "Impossible de sauvegarder ou de charger /config/automations.yaml. Vérifiez l’accès à File Studio ou importez un fichier YAML.", sourceLoaded: "{source} : {count} automatisation(s) détectée(s){warning}.", noAutomationMatch: "Aucune automatisation correspondante.", selectAutomation: "Sélectionner {alias}", automationSelected: "{count} sélectionnée(s)", automationCount: "{count} automatisation(s)", trigger: "Déclencheurs", condition: "Conditions", action: "Actions", domainPrefix: "Domaine", areaPrefix: "Zone", devicePrefix: "Appareil", conflictPrefix: "Conflit", warningPrefix: "Avertissement", selectForExport: "Sélectionnez une automatisation à exporter.", exporting: "Exportation de {count} automatisation(s) vers {folder} ...", exported: "{count} automatisation(s) enregistrée(s) dans {folder} : version d’exportation avec ID et version d’importation nettoyée sans ID.", exportFailed: "Échec de l’exportation : {error} Téléchargement par le navigateur utilisé en solution de repli.", saved: "enregistré", openExport: "Ouvrir l’exportation", openImport: "Ouvrir la version d’importation", copyExport: "Copier le YAML exporté", copyImport: "Copier le YAML d’importation", copied: "{filename} : YAML copié.", copiedImport: "{filename} : YAML d’importation nettoyé copié.", conflictSelect: "Sélectionnez une automatisation pour vérifier les conflits.", conflictNone: "Vérification des conflits : {count} automatisation(s), aucun ID ni alias en double dans la sélection.", conflictFound: "Vérification des conflits : {count} conflit(s) possible(s). {summary}", withoutDomain: "Sans domaine", withoutArea: "Sans zone", withoutDevice: "Sans appareil", withoutGroup: "Sans groupe", domains: "Domaines", areas: "Zones", devices: "Appareils", groups: "Groupes", selectedDetails: "{triggers} déclencheur(s), {conditions} condition(s), {actions} action(s), {entities} entité(s), {services} service(s)", exportSaved: "Version d’exportation et version d’importation nettoyée enregistrées", download: "Téléchargement", browserDownload: "Téléchargement du navigateur", errorOutsideRoot: "Le chemin se trouve en dehors des emplacements autorisés.", errorMissing: "Le dossier cible est introuvable ou n’a pas pu être créé.", errorExists: "Un fichier cible existe déjà.", errorInvalid: "Le dossier d’exportation ou le nom du fichier est invalide.",
  },
};

function t(key, values = {}) {
  return (translations[currentLanguage]?.[key] ?? translations.en[key] ?? key)
    .replace(/\{([^}]+)\}/g, (match, name) => String(values[name] ?? match));
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach(element => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
}

function createAppUrl(path) {
  try {
    const baseUrl = new URL(window.location.href);
    baseUrl.search = "";
    baseUrl.hash = "";
    baseUrl.pathname = baseUrl.pathname.replace(/\/plugin-assets\/automation-exporter-editor\/.*$/, "/");
    if (!baseUrl.pathname.endsWith("/")) {
      baseUrl.pathname = `${baseUrl.pathname}/`;
    }
    return new URL(String(path ?? "").replace(/^\/+/, ""), baseUrl).toString();
  } catch {
    return path;
  }
}

function readThemePreferenceFromLocation() {
  try {
    const preference = new URL(window.location.href).searchParams.get("theme");
    return ["auto", "light", "dark"].includes(preference) ? preference : undefined;
  } catch {
    return undefined;
  }
}

function readLanguageFromLocation() {
  try {
    const language = new URL(window.location.href).searchParams.get("language");
    if (["de", "en", "fr"].includes(language)) return language;
  } catch {
    // Continue with the saved shared preference.
  }
  try {
    const language = localStorage.getItem("atlas.languagePreference");
    if (["de", "en", "fr"].includes(language)) return language;
  } catch {
    // Try the shared cookie when local storage is unavailable.
  }
  try {
    const cookie = document.cookie.split(";").map(value => value.trim())
      .find(value => value.startsWith("atlas_language_preference="));
    const language = cookie ? decodeURIComponent(cookie.slice("atlas_language_preference=".length)) : "";
    if (["de", "en", "fr"].includes(language)) return language;
  } catch {
    // Fall back to the browser language.
  }
  const browserLanguage = navigator.language?.toLowerCase() ?? "";
  return browserLanguage.startsWith("fr") ? "fr" : browserLanguage.startsWith("de") ? "de" : "en";
}

function bindHubLinks() {
  for (const link of document.querySelectorAll("[data-open-hub]")) {
    const url = new URL(createAppUrl("hub"), window.location.href);
    url.searchParams.set("theme", currentThemePreference);
    url.searchParams.set("language", currentLanguage);
    link.href = url.toString();
  }

  for (const link of document.querySelectorAll("[data-open-file-studio]")) {
    const url = new URL(createAppUrl("plugin-assets/file-studio/index.html"), window.location.href);
    url.searchParams.set("theme", currentThemePreference);
    url.searchParams.set("language", currentLanguage);
    link.href = url.toString();
  }
}

function applyThemePreference(preference = currentThemePreference) {
  currentThemePreference = ["auto", "light", "dark"].includes(preference) ? preference : "auto";
  const resolvedTheme = currentThemePreference === "auto" && window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : currentThemePreference === "dark"
      ? "dark"
      : "light";
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.themePreference = currentThemePreference;
  updateChromeControls();
  updateLocationState();
  bindHubLinks();
}

function applyLanguage(language = currentLanguage, persistPreference = false) {
  currentLanguage = ["de", "en", "fr"].includes(language) ? language : "en";
  if (persistPreference) {
    try {
      localStorage.setItem("atlas.languagePreference", currentLanguage);
      localStorage.setItem("atlas.automationExporter.language", currentLanguage);
    } catch {
      // Keep the in-memory language when browser storage is unavailable.
    }
    try {
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `atlas_language_preference=${encodeURIComponent(currentLanguage)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    } catch {
      // Keep the in-memory language when cookies are unavailable.
    }
  }
  document.documentElement.lang = currentLanguage;
  applyTranslations();
  updateChromeControls();
  updateLocationState();
  bindHubLinks();
  document.title = `ATLAS ${t("title")}`;
  render();
  renderHistory();
}

function updateChromeControls() {
  for (const button of document.querySelectorAll("[data-theme-mode]")) {
    button.setAttribute("aria-pressed", String(button.dataset.themeMode === currentThemePreference));
  }
  for (const button of document.querySelectorAll("[data-language]")) {
    button.setAttribute("aria-pressed", String(button.dataset.language === currentLanguage));
  }
}

function updateLocationState() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("theme", currentThemePreference);
    url.searchParams.set("language", currentLanguage);
    window.history.replaceState(null, "", url.toString());
  } catch {
    // The current URL cannot be rewritten in every embedded browser mode.
  }
}

elements.loadSystem.addEventListener("click", loadSystemAutomations);
elements.upload.addEventListener("change", handleUpload);
elements.search.addEventListener("input", render);
elements.groupBy.addEventListener("change", () => {
  state.groupBy = elements.groupBy.value;
  state.groupFilter = "";
  updateGroupFilterOptions();
  render();
});
elements.groupFilter.addEventListener("change", () => {
  state.groupFilter = elements.groupFilter.value;
  render();
});
elements.filterWarnings.addEventListener("change", render);
elements.selectAll.addEventListener("click", selectVisible);
elements.selectNone.addEventListener("click", () => {
  state.selectedIds.clear();
  render();
});
elements.exportSelected.addEventListener("click", () => void exportSelected());
elements.previewConflicts.addEventListener("click", previewConflicts);
elements.clearHistory.addEventListener("click", () => {
  state.exports = [];
  renderHistory();
});

for (const button of document.querySelectorAll("[data-theme-mode]")) {
  button.addEventListener("click", () => applyThemePreference(button.dataset.themeMode));
}
for (const button of document.querySelectorAll("[data-language]")) {
  button.addEventListener("click", () => applyLanguage(button.dataset.language, true));
}
window.matchMedia?.("(prefers-color-scheme: dark)")?.addEventListener("change", () => {
  if (currentThemePreference === "auto") {
    applyThemePreference("auto");
  }
});

applyLanguage(currentLanguage);
applyThemePreference(currentThemePreference);
setStatus(t("ready"));

async function loadSystemAutomations() {
  setStatus(t("loadingSystem"));
  try {
    const url = new URL(createAppUrl("api/file-studio/file"), window.location.href);
    url.searchParams.set("path", "/config/automations.yaml");
    const response = await fetch(url.toString(), { cache: "no-store" });
    if (!response.ok) {
      setStatus(t("systemUnreadable"));
      return;
    }
    const payload = await response.json();
    const content = typeof payload.content === "string" ? payload.content : "";
    if (!content.trim()) {
      setStatus(t("systemEmpty"));
      return;
    }
    const backup = await createSourceBackup(content);
    analyzeSource(payload.path || "/config/automations.yaml", content);
    setStatus(t("systemLoaded", { path: payload.path || "/config/automations.yaml", count: state.automations.length, backup: backup.path }));
  } catch {
    setStatus(t("systemLoadError"));
  }
}

async function handleUpload(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }
  const content = await file.text();
  analyzeSource(file.name, content);
  event.target.value = "";
}

function analyzeSource(sourceName, content) {
  state.sourceName = sourceName;
  state.automations = parseAutomations(content);
  state.selectedIds = new Set();
  state.activeId = state.automations[0]?.localId ?? "";
  state.groupFilter = "";
  const warningCount = countWarnings(state.automations);
  const warningText = warningCount > 0 ? `, ${warningCount} Hinweis(e)` : ", keine Hinweise";
  setStatus(t("sourceLoaded", { source: sourceName, count: state.automations.length, warning: warningText }));
  render();
}

function parseAutomations(content) {
  const automations = splitAutomationBlocks(content).map((block, index) => {
    const alias = readYamlValue(block, "alias") || `automation-${index + 1}`;
    const id = readYamlValue(block, "id");
    const entities = uniqueMatches(block, /(?:entity_id:\s*|['"])([a-z_]+\.[a-zA-Z0-9_]+)['"]?/g);
    const services = uniqueMatches(block, /(?:service|action):\s*['"]?([a-z_]+\.[a-zA-Z0-9_]+)['"]?/g);
    const triggerCount = countTopLevelSections(block, ["trigger", "triggers"]);
    const conditionCount = countTopLevelSections(block, ["condition", "conditions"]);
    const actionCount = countTopLevelSections(block, ["action", "actions"]);
    const disabled = /^\s*-?\s*(initial_state|enabled)\s*:\s*(false|off|no)\s*$/im.test(block);
    return {
      localId: `${index}-${slugify(alias || id || "automation")}`,
      alias,
      id,
      entities,
      services,
      domains: extractDomains(entities, services),
      areas: extractAreas(entities),
      devices: extractDevices(entities),
      triggerCount,
      conditionCount,
      actionCount,
      disabled,
      warnings: [],
      yaml: normalizeAutomationYaml(block),
      sourceIndex: index + 1,
    };
  });
  return addAutomationWarnings(automations);
}

function splitAutomationBlocks(content) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const starts = lines
    .map((line, index) => (/^-\s+(id|alias)\s*:/.test(line) ? index : -1))
    .filter(index => index >= 0);

  if (!starts.length) {
    const block = lines.join("\n").trimEnd();
    return isAutomationBlock(block) ? [block] : [];
  }

  const blocks = [];
  for (let index = 0; index < starts.length; index += 1) {
    const start = starts[index];
    const end = starts[index + 1] ?? lines.length;
    blocks.push(lines.slice(start, end).join("\n").trimEnd());
  }
  return blocks.filter(isAutomationBlock);
}

function isAutomationBlock(block) {
  return /(^|\n)\s*-?\s*(alias|trigger|triggers|action|actions)\s*:/.test(block);
}

function readYamlValue(block, key) {
  const match = block.match(new RegExp(`^\\s*-?\\s*${key}:\\s*["']?([^"'\\n#]+)`, "m"));
  return match?.[1]?.trim() ?? "";
}

function countTopLevelSections(block, keys) {
  const keyPattern = keys.map(key => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const match = block.match(new RegExp(`^\\s*-?\\s*(${keyPattern})\\s*:`, "gim"));
  return match?.length ?? 0;
}

function addAutomationWarnings(automations) {
  const idCounts = countBy(automations.map(item => item.id).filter(Boolean));
  const aliasCounts = countBy(automations.map(item => item.alias).filter(Boolean).map(value => value.toLowerCase()));
  return automations.map(automation => {
    const warnings = [];
    const conflicts = [];
    if (!automation.id) warnings.push("Keine ID gefunden");
    if (!automation.alias || /^automation-\d+$/.test(automation.alias)) warnings.push("Kein Alias gefunden");
    if (automation.id && idCounts.get(automation.id) > 1) {
      conflicts.push(`Doppelte ID: ${automation.id}`);
    }
    if (automation.alias && aliasCounts.get(automation.alias.toLowerCase()) > 1) {
      conflicts.push(`Doppelter Alias: ${automation.alias}`);
    }
    if (automation.triggerCount === 0) warnings.push("Kein Trigger erkannt");
    if (automation.actionCount === 0) warnings.push("Keine Action erkannt");
    if (automation.disabled) warnings.push("Deaktiviert");
    return { ...automation, warnings, conflicts };
  });
}

function countBy(values) {
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

function normalizeAutomationYaml(block) {
  const lines = block.replace(/\r\n/g, "\n").replace(/^\s*-\s*/, "").split("\n");
  const yaml = lines
    .map((line, index) => index === 0 ? line : line.replace(/^\s{2}/, ""))
    .join("\n")
    .trimStart() + "\n";
  return normalizeTimeTriggerValues(yaml);
}

function normalizeTimeTriggerValues(yaml) {
  return yaml.replace(/^(\s*-?\s*at:\s*)(?:["']?(\d{1,2}:\d{2}:\d{2})["']?|(\d{1,5}))\s*$/gm, (_line, prefix, clockValue, numericValue) => {
    if (clockValue) {
      return `${prefix}'${clockValue.padStart(8, "0")}'`;
    }
    const seconds = Number(numericValue);
    if (!Number.isInteger(seconds) || seconds < 0 || seconds > 86399) {
      return `${prefix}${numericValue}`;
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    const two = value => String(value).padStart(2, "0");
    return `${prefix}'${two(hours)}:${two(minutes)}:${two(remainingSeconds)}'`;
  });
}

function uniqueMatches(text, regex) {
  const values = new Set();
  for (const match of text.matchAll(regex)) {
    values.add(match[1]);
  }
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

function extractDomains(entities, services) {
  return uniqueValues([...entities, ...services].map(value => value.split(".")[0]).filter(Boolean));
}

function extractAreas(entities) {
  return uniqueValues(entities
    .map(value => value.split(".")[1] ?? "")
    .map(entityId => entityId.split("_")[0])
    .filter(Boolean));
}

function extractDevices(entities) {
  return uniqueValues(entities
    .map(value => value.split(".")[1] ?? "")
    .map(entityId => entityId.split("_").slice(0, 2).join("_"))
    .filter(Boolean));
}

function uniqueValues(values) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function render() {
  updateGroupFilterOptions();
  const visible = getVisibleAutomations();
  elements.list.classList.toggle("empty-state", visible.length === 0);
  elements.list.innerHTML = "";
  if (visible.length === 0) {
    elements.list.textContent = t("noAutomationMatch");
  } else if (state.groupBy === "none") {
    for (const automation of visible) {
      elements.list.append(createAutomationRow(automation));
    }
  } else {
    for (const group of groupAutomations(visible)) {
      elements.list.append(createGroupHeader(group.label, group.items.length));
      for (const automation of group.items) {
        elements.list.append(createAutomationRow(automation));
      }
    }
  }
  renderDetails();
  renderSummary();
}

function updateGroupFilterOptions() {
  if (!elements.groupBy || !elements.groupFilter) {
    return;
  }
  elements.groupBy.value = state.groupBy;
  const values = getAllGroupValues(state.automations, state.groupBy);
  const current = values.includes(state.groupFilter) ? state.groupFilter : "";
  elements.groupFilter.replaceChildren();
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = state.groupBy === "none" ? t("allGroups") : `${t("allGroups")} (${t(getGroupLabelPlural(state.groupBy))})`;
  elements.groupFilter.append(allOption);
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    elements.groupFilter.append(option);
  }
  state.groupFilter = current;
  elements.groupFilter.value = current;
  elements.groupFilter.disabled = state.groupBy === "none";
}

function groupAutomations(automations) {
  const groups = new Map();
  for (const automation of automations) {
    const values = getAutomationGroupValues(automation, state.groupBy);
    const groupValues = values.length ? values : [getEmptyGroupLabel(state.groupBy)];
    for (const value of groupValues) {
      if (!groups.has(value)) {
        groups.set(value, []);
      }
      groups.get(value).push(automation);
    }
  }
  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }))
    .map(([label, items]) => ({ label, items }));
}

function createGroupHeader(label, count) {
  const header = document.createElement("div");
  header.className = "group-header";
  const title = document.createElement("span");
  title.textContent = label;
  const amount = document.createElement("span");
  amount.textContent = t("automationCount", { count });
  header.append(title, amount);
  return header;
}

function createAutomationRow(automation) {
  const row = document.createElement("article");
  row.className = "automation-row";
  row.classList.toggle("has-conflict", automation.conflicts.length > 0);
  const main = document.createElement("div");
  main.className = "automation-main";
  const title = document.createElement("div");
  title.className = "automation-title";
  title.textContent = automation.alias;
  const meta = document.createElement("div");
  meta.className = "automation-meta";
  meta.textContent = [
    `#${automation.sourceIndex}`,
    `ID ${automation.id || "-"}`,
    `${automation.triggerCount} ${t("trigger")}`,
    `${automation.conditionCount} ${t("condition")}`,
    `${automation.actionCount} ${t("action")}`,
    `${t("domainPrefix")} ${automation.domains.slice(0, 3).join(", ") || "-"}`,
  ].join(" · ");
  const tags = document.createElement("div");
  tags.className = "tag-list";
  for (const value of [
    ...automation.conflicts.map(conflict => `${t("conflictPrefix")}: ${conflict}`),
    ...automation.warnings.map(warning => `${t("warningPrefix")}: ${warning}`),
    ...automation.domains.slice(0, 3).map(domain => `${t("domainPrefix")}: ${domain}`),
    ...automation.areas.slice(0, 2).map(area => `${t("areaPrefix")}: ${area}`),
    ...automation.devices.slice(0, 2).map(device => `${t("devicePrefix")}: ${device}`),
    ...automation.entities.slice(0, 4),
    ...automation.services.slice(0, 3),
  ]) {
    const tag = document.createElement("span");
    tag.className = "tag";
    if (value.startsWith(`${t("conflictPrefix")}: `)) tag.classList.add("conflict");
    if (value.startsWith(`${t("warningPrefix")}: `)) tag.classList.add("warning");
    if (["domainPrefix", "areaPrefix", "devicePrefix"].some(key => value.startsWith(`${t(key)}: `))) tag.classList.add("group");
    tag.textContent = value;
    tags.append(tag);
  }
  main.append(title, meta, tags);

  const actions = document.createElement("div");
  actions.className = "automation-actions";
  const details = document.createElement("button");
  details.type = "button";
  details.textContent = t("details");
  details.addEventListener("click", () => {
    state.activeId = automation.localId;
    renderDetails();
  });
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = state.selectedIds.has(automation.localId);
  checkbox.setAttribute("aria-label", t("selectAutomation", { alias: automation.alias }));
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      state.selectedIds.add(automation.localId);
    } else {
      state.selectedIds.delete(automation.localId);
    }
    renderSummary();
  });
  actions.append(details, checkbox);
  row.append(main, actions);
  return row;
}

function renderDetails() {
  const automation = state.automations.find(item => item.localId === state.activeId);
  elements.details.classList.toggle("empty-state", !automation);
  elements.details.innerHTML = "";
  if (!automation) {
    elements.details.textContent = t("chooseAutomation");
    return;
  }
  const title = document.createElement("strong");
  title.textContent = automation.alias;
  const meta = document.createElement("p");
  meta.className = "muted";
  meta.textContent = t("selectedDetails", { triggers: automation.triggerCount, conditions: automation.conditionCount, actions: automation.actionCount, entities: automation.entities.length, services: automation.services.length });
  const pre = document.createElement("pre");
  pre.className = "yaml-preview";
  pre.innerHTML = highlightYaml(automation.yaml);
  elements.details.append(
    title,
    meta,
    createTagBlock(t("conflicts"), automation.conflicts, "conflict"),
    createTagBlock(t("warnings"), automation.warnings, "warning"),
    createTagBlock(t("domains"), automation.domains),
    createTagBlock(t("areas"), automation.areas),
    createTagBlock(t("devices"), automation.devices),
    createTagBlock(t("entities"), automation.entities),
    createTagBlock(t("services"), automation.services),
    pre,
  );
}

function createTagBlock(label, values, variant = "") {
  const wrapper = document.createElement("div");
  const heading = document.createElement("h3");
  heading.textContent = label;
  const tags = document.createElement("div");
  tags.className = "tag-list";
  for (const value of values.length ? values : ["-"]) {
    const tag = document.createElement("span");
    tag.className = "tag";
    if (variant) tag.classList.add(variant);
    tag.textContent = value;
    tags.append(tag);
  }
  wrapper.append(heading, tags);
  return wrapper;
}

function renderSummary() {
  const allEntities = new Set(state.automations.flatMap(item => item.entities));
  const allServices = new Set(state.automations.flatMap(item => item.services));
  elements.countAutomations.textContent = String(state.automations.length);
  elements.countEntities.textContent = String(allEntities.size);
  elements.countServices.textContent = String(allServices.size);
  elements.countConflicts.textContent = String(state.automations.filter(item => item.conflicts.length > 0).length);
  elements.countWarnings.textContent = String(countWarnings(state.automations));
  elements.selectionCount.textContent = t("automationSelected", { count: state.selectedIds.size });
}

function renderHistory() {
  elements.history.classList.toggle("empty-state", state.exports.length === 0);
  elements.history.innerHTML = "";
  if (state.exports.length === 0) {
    elements.history.textContent = t("noExports");
    return;
  }
  for (const item of state.exports) {
    const row = document.createElement("div");
    row.className = "export-row";
    const name = document.createElement("div");
    const groups = [
      item.domains?.length ? `Domains: ${item.domains.join(", ")}` : "",
      item.areas?.length ? `${t("areas")}: ${item.areas.join(", ")}` : "",
      item.devices?.length ? `${t("devices")}: ${item.devices.join(", ")}` : "",
    ].filter(Boolean).join(" · ");
    name.innerHTML = `<strong>${escapeHtml(item.filename)}</strong><div class="automation-meta">${escapeHtml(item.status ?? t("saved"))} · ${escapeHtml(item.folder)} · ${escapeHtml(item.sourceName)}</div>${groups ? `<div class="automation-meta">${escapeHtml(groups)}</div>` : ""}`;
    const actions = document.createElement("div");
    actions.className = "export-actions";
    const open = document.createElement("a");
    open.className = "ghost-link";
    open.href = createFileStudioFileUrl(item.path);
    open.textContent = t("openExport");
    const openImport = document.createElement("a");
    openImport.className = "ghost-link";
    openImport.href = createFileStudioFileUrl(item.importPath);
    openImport.textContent = t("openImport");
    const copy = document.createElement("button");
    copy.type = "button";
    copy.textContent = t("copyExport");
    copy.addEventListener("click", () => void copyText(item.yaml, t("copied", { filename: item.filename })));
    const copyImport = document.createElement("button");
    copyImport.type = "button";
    copyImport.textContent = t("copyImport");
    copyImport.addEventListener("click", () => void copyText(item.importYaml ?? item.yaml, t("copiedImport", { filename: item.filename })));
    actions.append(open, copy);
    if (item.importPath) {
      actions.append(openImport);
    }
    if (item.importYaml) {
      actions.append(copyImport);
    }
    row.append(name, actions);
    elements.history.append(row);
  }
}

function getVisibleAutomations() {
  const query = elements.search.value.trim().toLowerCase();
  const warningOnly = elements.filterWarnings.checked;
  return state.automations.filter(item => {
    if (warningOnly && item.warnings.length === 0 && item.conflicts.length === 0) {
      return false;
    }
    if (state.groupFilter && !getAutomationGroupValues(item, state.groupBy).includes(state.groupFilter)) {
      return false;
    }
    if (!query) {
      return true;
    }
    return [
    item.alias,
    item.id,
    ...item.warnings,
    ...item.entities,
    ...item.services,
    item.yaml,
    ].join(" ").toLowerCase().includes(query);
  });
}

function getAllGroupValues(automations, groupBy) {
  if (groupBy === "none") {
    return [];
  }
  return uniqueValues(automations.flatMap(item => getAutomationGroupValues(item, groupBy)));
}

function getAutomationGroupValues(automation, groupBy) {
  if (groupBy === "domain") return automation.domains;
  if (groupBy === "area") return automation.areas;
  if (groupBy === "device") return automation.devices;
  return [];
}

function getGroupLabelPlural(groupBy) {
  if (groupBy === "domain") return "domains";
  if (groupBy === "area") return "areas";
  if (groupBy === "device") return "devices";
  return "groups";
}

function getEmptyGroupLabel(groupBy) {
  if (groupBy === "domain") return t("withoutDomain");
  if (groupBy === "area") return t("withoutArea");
  if (groupBy === "device") return t("withoutDevice");
  return t("withoutGroup");
}

function countWarnings(automations) {
  return automations.reduce((sum, automation) => sum + automation.warnings.length, 0);
}

function selectVisible() {
  for (const automation of getVisibleAutomations()) {
    state.selectedIds.add(automation.localId);
  }
  render();
}

async function exportSelected() {
  const selected = state.automations.filter(item => state.selectedIds.has(item.localId));
  if (selected.length === 0) {
    setStatus(t("selectForExport"));
    return;
  }
  const runFolderName = createExportRunFolderName(new Date());
  const folder = normalizeExportFolder(elements.exportFolder.value);
  const runFolder = `${folder}/${runFolderName}`;
  const exportFolder = `${runFolder}/export-version`;
  const importFolder = `${runFolder}/bereinigte-import-version`;
  elements.exportSelected.disabled = true;
  setStatus(t("exporting", { count: selected.length, folder: runFolder }));
  try {
    await ensureExportFolder(exportFolder);
    await ensureExportFolder(importFolder);
    const usedFilenames = new Set();
    const exported = [];
    for (const automation of selected) {
      const filename = createExportFilename(automation.alias, usedFilenames);
      const exportYaml = createExportAutomationYaml(automation.yaml);
      const exportResult = await writeExportFile(exportFolder, filename, exportYaml);
      const importYaml = createImportAutomationYaml(exportYaml);
      const importResult = await writeExportFile(importFolder, filename, importYaml);
      exported.push({
        filename,
        path: exportResult.path || `${exportFolder}/${filename}`,
        importPath: importResult.path || `${importFolder}/${filename}`,
        folder: runFolder,
        sourceName: state.sourceName,
        status: t("exportSaved"),
        yaml: exportYaml,
        importYaml,
        id: automation.id,
        alias: automation.alias,
        domains: automation.domains,
        areas: automation.areas,
        devices: automation.devices,
      });
    }
    state.exports.unshift(...exported);
    state.exports = state.exports.slice(0, 50);
    setStatus(t("exported", { count: exported.length, folder: runFolder }));
    renderHistory();
  } catch (error) {
    setStatus(t("exportFailed", { error: describeExportError(error) }));
    const usedFilenames = new Set();
    for (const automation of selected) {
      const filename = createExportFilename(automation.alias, usedFilenames);
      const exportYaml = createExportAutomationYaml(automation.yaml);
      const importYaml = createImportAutomationYaml(exportYaml);
      downloadText(filename, exportYaml);
      downloadText(`import-${filename}`, importYaml);
      state.exports.unshift({
        filename,
        path: filename,
        importPath: "",
        folder: t("browserDownload"),
        sourceName: state.sourceName,
        status: t("download"),
        yaml: exportYaml,
        importYaml,
        id: automation.id,
        alias: automation.alias,
        domains: automation.domains,
        areas: automation.areas,
        devices: automation.devices,
      });
    }
    state.exports = state.exports.slice(0, 50);
    renderHistory();
  } finally {
    elements.exportSelected.disabled = false;
  }
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: "text/yaml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function createExportAutomationYaml(yaml) {
  return normalizeTimeTriggerValues(yaml);
}

function createImportAutomationYaml(yaml) {
  return normalizeTimeTriggerValues(yaml.replace(/^\s*id:\s*.*\n?/m, "").trimStart() + "\n");
}

function previewConflicts() {
  const selected = state.automations.filter(item => state.selectedIds.has(item.localId));
  if (!selected.length) {
    setStatus(t("conflictSelect"));
    return;
  }
  const conflicts = findConflicts(selected);
  if (!conflicts.length) {
    setStatus(t("conflictNone", { count: selected.length }));
    return;
  }
  const summary = conflicts.slice(0, 5).map(conflict => `${conflict.kind} "${conflict.value}" (${conflict.count}x)`).join("; ");
  setStatus(t("conflictFound", { count: conflicts.length, summary }));
}

function findConflicts(automations) {
  const conflicts = [];
  const idCounts = countBy(automations.map(item => item.id).filter(Boolean));
  const aliasCounts = countBy(automations.map(item => item.alias).filter(Boolean).map(value => value.toLowerCase()));
  for (const [value, count] of idCounts) {
    if (count > 1) conflicts.push({ kind: "ID", value, count });
  }
  for (const [value, count] of aliasCounts) {
    if (count > 1) conflicts.push({ kind: "Alias", value, count });
  }
  return conflicts;
}

async function copyText(value, successMessage) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.className = "copy-fallback";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  setStatus(successMessage);
}

function createFileStudioFileUrl(path) {
  const fileStudioUrl = new URL(createAppUrl("plugin-assets/file-studio/index.html"), window.location.href);
  fileStudioUrl.searchParams.set("theme", currentThemePreference);
  fileStudioUrl.searchParams.set("language", currentLanguage);
  if (path && path.startsWith("/config/")) {
    fileStudioUrl.searchParams.set("path", path);
  }
  return fileStudioUrl.toString();
}

async function createSourceBackup(content) {
  const backupFolder = `/config/atlas_backups/automations/${createExportRunFolderName(new Date())}`;
  await ensureExportFolder(backupFolder);
  const result = await writeExportFile(backupFolder, "automations.yaml", content);
  return {
    folder: backupFolder,
    path: result.path || `${backupFolder}/automations.yaml`,
  };
}

async function ensureExportFolder(folder) {
  const parts = folder.split("/").filter(Boolean);
  if (parts[0] !== "config") {
    throw new Error("Exportordner muss unter /config liegen.");
  }
  for (const part of parts.slice(1)) {
    if (!isSafeFileStudioName(part)) {
      throw new Error("Exportordner enthält ungültige Pfadteile.");
    }
  }
  let current = "/config";
  for (const part of parts.slice(1)) {
    const parentPath = current;
    current = `${current}/${part}`;
    try {
      await apiJson("api/file-studio/create-directory", {
        method: "POST",
        body: JSON.stringify({ parentPath, name: part }),
      });
    } catch (error) {
      if (!/already exists/i.test(error instanceof Error ? error.message : String(error))) {
        throw error;
      }
    }
  }
}

async function writeExportFile(folder, filename, content) {
  try {
    return await writeFile(folder, filename, content, false);
  } catch (uploadError) {
    return await createAndWriteExportFile(folder, filename, content, uploadError);
  }
}

async function writeFile(folder, filename, content, overwrite) {
  const result = await apiJson("api/file-studio/upload", {
    method: "POST",
    body: JSON.stringify({
      parentPath: folder,
      name: filename,
      contentBase64: encodeBase64Utf8(content),
      overwrite,
    }),
  });
  if (result.ok === false) {
    throw new Error(result.error ?? "upload failed");
  }
  return result;
}

async function createAndWriteExportFile(folder, filename, content, uploadError) {
  const path = `${folder}/${filename}`;
  try {
    await apiJson("api/file-studio/create-file", {
      method: "POST",
      body: JSON.stringify({
        parentPath: folder,
        name: filename,
      }),
    });
    const result = await apiJson("api/file-studio/write", {
      method: "POST",
      body: JSON.stringify({
        path,
        content,
      }),
    });
    if (result.ok === false) {
      throw new Error(result.error ?? "write failed");
    }
    return {
      ...result,
      kind: "atlas.file-studio.export-write",
      path: result.path || path,
      name: filename,
      replaced: false,
    };
  } catch (writeError) {
    const firstMessage = uploadError instanceof Error ? uploadError.message : String(uploadError ?? "");
    const secondMessage = writeError instanceof Error ? writeError.message : String(writeError ?? "");
    throw new Error([firstMessage, secondMessage].filter(Boolean).join(" / "));
  }
}

async function readFileContent(path) {
  const url = new URL(createAppUrl("api/file-studio/file"), window.location.href);
  url.searchParams.set("path", path);
  const response = await fetch(url.toString(), { cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error ?? body.message ?? `HTTP ${response.status}`);
  }
  return {
    path: body.path || path,
    content: typeof body.content === "string" ? body.content : "",
  };
}

async function apiJson(path, options = {}) {
  const response = await fetch(createAppUrl(path), {
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error ?? body.message ?? `HTTP ${response.status}`);
  }
  return body;
}

function normalizeExportFolder(value) {
  const normalized = String(value || "/config/atlas_exports/automations")
    .replace(/\\/g, "/")
    .trim()
    .replace(/\/+$/g, "");
  if (!normalized || normalized === "/") {
    return "/config/atlas_exports/automations";
  }
  return `/${normalized.replace(/^\/+/, "")}`;
}

function createExportFilename(alias, usedFilenames) {
  const baseName = slugify(alias);
  let filename = `${baseName}.yaml`;
  let index = 2;
  while (usedFilenames.has(filename)) {
    filename = `${baseName}-${index}.yaml`;
    index += 1;
  }
  usedFilenames.add(filename);
  return filename;
}

function isSafeFileStudioName(value) {
  return Boolean(value) && value !== "." && value !== ".." && !value.includes("..") && !/[\\/]/.test(value);
}

function encodeBase64Utf8(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.slice(index, index + 0x8000));
  }
  return btoa(binary);
}

function describeExportError(error) {
  const message = error instanceof Error ? error.message : String(error ?? "unbekannter Fehler");
  if (/outside configured root/i.test(message)) return t("errorOutsideRoot");
  if (/not found|parent directory/i.test(message)) return t("errorMissing");
  if (/already exists/i.test(message)) return t("errorExists");
  if (/path separators|relative path/i.test(message)) return t("errorInvalid");
  return message;
}

function createExportRunFolderName(date) {
  const two = value => String(value).padStart(2, "0");
  const three = value => String(value).padStart(3, "0");
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}_${two(date.getHours())}-${two(date.getMinutes())}-${two(date.getSeconds())}-${three(date.getMilliseconds())}`;
}

function slugify(value) {
  return (value || "automation")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    || "automation";
}

function setStatus(message) {
  elements.sourceStatus.textContent = message;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function highlightYaml(value) {
  return escapeHtml(value)
    .split("\n")
    .map(line => highlightYamlLine(line))
    .join("\n");
}

function highlightYamlLine(line) {
  const commentIndex = line.indexOf("#");
  const yamlPart = commentIndex >= 0 ? line.slice(0, commentIndex) : line;
  const commentPart = commentIndex >= 0
    ? `<span class="yaml-comment">${line.slice(commentIndex)}</span>`
    : "";
  const highlighted = yamlPart
    .replace(/^(\s*-?\s*)([A-Za-z0-9_-]+)(\s*:)/, `$1<span class="yaml-key">$2</span>$3`)
    .replace(/([A-Za-z_]+\.[A-Za-z0-9_]+)/g, `<span class="yaml-ha-token">$1</span>`)
    .replace(/(&quot;[^&]*?&quot;|'[^']*?')/g, `<span class="yaml-string">$1</span>`)
    .replace(/(:\s*)(true|false|on|off|null|yes|no)\b/gi, `$1<span class="yaml-boolean">$2</span>`)
    .replace(/(:\s*)(-?\d+(?:\.\d+)?)\b/g, `$1<span class="yaml-number">$2</span>`);
  return highlighted + commentPart;
}

renderHistory();
