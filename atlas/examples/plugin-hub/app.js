const pluginGrid = document.querySelector("#plugin-grid");
const pluginSummary = document.querySelector("#plugin-summary");
const languageButtons = Array.from(document.querySelectorAll("[data-language]"));
const surfaceLinks = Array.from(document.querySelectorAll(".hub-actions a[href], .sidebar-hint a[href]"));
const atlasThemeStorageKey = "atlas.themePreference";
const hubLanguageStorageKey = "atlas.pluginHub.language";
const translations = {
  en: {
    "heading.hub": "Plugin Hub",
    "link.admin": "Administration",
    "link.sidebarHelper": "Sidebar helper",
    "aria.surfaces": "ATLAS surfaces",
    "aria.language": "Language",
    "aria.filters": "Plugin filters",
    "message.loading": "Loading plugins...",
    "message.catalogUnavailable": "Plugin catalog unavailable.",
    "message.unknownCatalogError": "Unknown plugin catalog error.",
    "message.noPlugins": "No plugins installed",
    "message.noPluginsHint": "Open Administration to add an ATLAS plugin repository or import a plugin package.",
    "message.sidebarHint": "Plugins can be added to the Home Assistant sidebar as Webpage dashboards. Open Administration to prepare name, URL and icon.",
    "label.sidebarUrl": "Sidebar URL",
    "summary.noPlugins": "No plugins installed",
    "summary.oneActive": "1 active plugin opens directly from ATLAS start",
    "summary.many": "{plugins} plugins detected, {active} active",
    "button.open": "Open",
    "button.planned": "Planned",
    "button.disabled": "Disabled",
    "status.active": "Active",
    "status.available": "Available",
    "status.planned": "Planned",
    "status.disabled": "Disabled",
    "alt.pluginImage": "{name} plugin image",
  },
  de: {
    "heading.hub": "Plugin Hub",
    "link.admin": "Administration",
    "link.sidebarHelper": "Seitenleisten-Hilfe",
    "aria.surfaces": "ATLAS-Oberflächen",
    "aria.language": "Sprache",
    "aria.filters": "Plugin-Filter",
    "message.loading": "Plugins werden geladen...",
    "message.catalogUnavailable": "Plugin-Katalog nicht erreichbar.",
    "message.unknownCatalogError": "Unbekannter Plugin-Katalogfehler.",
    "message.noPlugins": "Keine Plugins installiert",
    "message.noPluginsHint": "Öffne die Administration, um ein ATLAS-Plugin-Repository hinzuzufügen oder ein Plugin-Paket zu importieren.",
    "message.sidebarHint": "Plugins können in Home Assistant als Webseiten-Dashboard zur Seitenleiste hinzugefügt werden. In der Administration lassen sich Name, URL und Icon vorbereiten.",
    "label.sidebarUrl": "Seitenleisten-URL",
    "summary.noPlugins": "Keine Plugins installiert",
    "summary.oneActive": "1 aktives Plugin öffnet direkt vom ATLAS-Start",
    "summary.many": "{plugins} Plugins erkannt, {active} aktiv",
    "button.open": "Öffnen",
    "button.planned": "Geplant",
    "button.disabled": "Deaktiviert",
    "status.active": "Aktiv",
    "status.available": "Verfügbar",
    "status.planned": "Geplant",
    "status.disabled": "Deaktiviert",
    "alt.pluginImage": "{name} Plugin-Bild",
  },
};
let currentLanguage = readStoredLanguage();
let lastPlugins = [];

applyThemePreference();
window.matchMedia?.("(prefers-color-scheme: dark)")?.addEventListener("change", applyThemePreference);
applyLanguage();

loadPlugins();

function readStoredLanguage() {
  try {
    return localStorage.getItem(hubLanguageStorageKey) === "en" ? "en" : "de";
  } catch {
    return "de";
  }
}

function t(key, parameters = {}) {
  let text = translations[currentLanguage]?.[key] ?? translations.en[key] ?? key;
  for (const [name, value] of Object.entries(parameters)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}

function localizedPluginText(plugin, field, fallback = "") {
  const localized = plugin?.[`${field}I18n`];
  if (localized && typeof localized === "object" && !Array.isArray(localized)) {
    const text = localized[currentLanguage] ?? localized.en ?? localized.de;
    if (typeof text === "string" && text.trim()) {
      return text.trim();
    }
  }

  const value = plugin?.[field];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }
  for (const element of document.querySelectorAll("[data-i18n-aria-label]")) {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  }
  for (const button of languageButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.language === currentLanguage));
  }
}

function setLanguage(language) {
  currentLanguage = language === "en" ? "en" : "de";
  try {
    localStorage.setItem(hubLanguageStorageKey, currentLanguage);
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
  applyLanguage();
  renderPlugins(lastPlugins);
}

function readThemePreferenceFromLocation() {
  try {
    const preference = new URL(window.location.href).searchParams.get("theme");
    return ["auto", "light", "dark"].includes(preference) ? preference : undefined;
  } catch {
    return undefined;
  }
}

function applyThemePreference() {
  let preference = readThemePreferenceFromLocation() ?? "auto";
  try {
    preference = readThemePreferenceFromLocation() ?? localStorage.getItem(atlasThemeStorageKey) ?? "auto";
  } catch {
    preference = readThemePreferenceFromLocation() ?? "auto";
  }
  if (!["auto", "light", "dark"].includes(preference)) {
    preference = "auto";
  }
  const resolvedTheme = preference === "auto" && window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : preference === "dark"
      ? "dark"
      : "light";
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.themePreference = preference;
  bindSurfaceLinks(preference);
}

function bindSurfaceLinks(preference) {
  for (const link of surfaceLinks) {
    try {
      const url = new URL(createAppUrl(link.getAttribute("href")), window.location.href);
      url.searchParams.set("theme", preference);
      link.href = url.toString();
    } catch {
      // Keep the static link if URL construction is unavailable.
    }
  }
}

function createAppUrl(path) {
  try {
    const baseUrl = new URL(window.location.href);
    baseUrl.search = "";
    baseUrl.hash = "";
    if (baseUrl.pathname.endsWith("/hub/")) {
      baseUrl.pathname = baseUrl.pathname.slice(0, -4);
    } else if (baseUrl.pathname.endsWith("/hub")) {
      baseUrl.pathname = baseUrl.pathname.slice(0, -3);
    }
    if (!baseUrl.pathname.endsWith("/")) {
      baseUrl.pathname = `${baseUrl.pathname}/`;
    }
    return new URL(String(path ?? "").replace(/^\/+/, ""), baseUrl).toString();
  } catch {
    return path;
  }
}

function createPluginActionUrl(entryUrl) {
  if (typeof entryUrl !== "string" || !entryUrl.trim()) {
    return "";
  }

  try {
    const url = new URL(entryUrl, window.location.href);
    if (url.origin === window.location.origin) {
      return createAppUrl(`${url.pathname.replace(/^\/+/, "")}${url.search}${url.hash}`);
    }
  } catch {
    // Relative URLs are normalized against the current ATLAS app path below.
  }
  return createAppUrl(entryUrl);
}

function createPluginMediaUrl(mediaUrl) {
  if (typeof mediaUrl !== "string" || !mediaUrl.trim()) {
    return "";
  }

  try {
    const url = new URL(mediaUrl, window.location.href);
    if (url.origin === window.location.origin) {
      return createAppUrl(`${url.pathname.replace(/^\/+/, "")}${url.search}${url.hash}`);
    }
    return url.toString();
  } catch {
    return createAppUrl(mediaUrl);
  }
}

async function loadPlugins() {
  try {
    const response = await fetch(createAppUrl("api/plugins"), { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Plugin catalog returned HTTP ${response.status}.`);
    }
    const catalog = await response.json();
    renderPlugins(Array.isArray(catalog.plugins) ? catalog.plugins : []);
  } catch (error) {
    pluginSummary.textContent = t("message.catalogUnavailable");
    pluginGrid.innerHTML = "";
    const message = document.createElement("p");
    message.className = "plugin-description";
    message.textContent = error instanceof Error ? error.message : t("message.unknownCatalogError");
    pluginGrid.append(message);
  }
}

function renderPlugins(plugins) {
  const visiblePlugins = plugins;
  lastPlugins = visiblePlugins;
  const activePlugins = visiblePlugins.filter(plugin => plugin.status === "active" && plugin.entryUrl);
  pluginSummary.textContent = createPluginSummaryText(visiblePlugins, activePlugins);
  pluginGrid.innerHTML = "";
  if (!visiblePlugins.length) {
    const empty = document.createElement("article");
    empty.className = "plugin-card";
    const body = document.createElement("div");
    body.className = "plugin-body";
    const title = document.createElement("h2");
    title.className = "plugin-name";
    title.textContent = t("message.noPlugins");
    const description = document.createElement("p");
    description.className = "plugin-description";
    description.textContent = t("message.noPluginsHint");
    const action = document.createElement("a");
    action.className = "plugin-action";
    action.href = createAppUrl("admin");
    action.textContent = t("link.admin");
    body.append(title, description, action);
    empty.append(body);
    pluginGrid.append(empty);
    return;
  }
  if (shouldOpenSingleActivePlugin(activePlugins)) {
    window.location.replace(createPluginActionUrl(activePlugins[0].entryUrl));
    return;
  }
  for (const plugin of visiblePlugins) {
    pluginGrid.append(createPluginCard(plugin));
  }
}

function shouldOpenSingleActivePlugin(activePlugins) {
  if (activePlugins.length !== 1) return false;
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get("select") !== "1";
  } catch {
    return true;
  }
}

function createPluginSummaryText(plugins, activePlugins) {
  if (!plugins.length) return t("summary.noPlugins");
  if (activePlugins.length === 1) return t("summary.oneActive");
  return t("summary.many", { plugins: plugins.length, active: activePlugins.length });
}

function createPluginCard(plugin) {
  const card = document.createElement("article");
  card.className = "plugin-card";

  const body = document.createElement("div");
  body.className = "plugin-body";

  const titleRow = document.createElement("div");
  titleRow.className = "plugin-title-row";

  const imageUrl = createPluginMediaUrl(plugin.iconUrl || plugin.logoUrl || plugin.previewUrl);
  const pluginName = localizedPluginText(plugin, "name", plugin.id);
  let icon;
  if (imageUrl) {
    icon = document.createElement("img");
    icon.className = "plugin-image";
    icon.alt = t("alt.pluginImage", { name: pluginName });
    icon.src = imageUrl;
  }

  const title = document.createElement("div");
  const name = document.createElement("h2");
  name.className = "plugin-name";
  name.textContent = pluginName;
  const version = document.createElement("div");
  version.className = "plugin-version";
  version.textContent = plugin.version;
  title.append(name, version);

  const status = document.createElement("span");
  status.className = "plugin-status";
  status.dataset.status = plugin.status;
  status.textContent = t(`status.${plugin.status}`) === `status.${plugin.status}`
    ? plugin.status
    : t(`status.${plugin.status}`);

  titleRow.append(...[icon, title, status].filter(Boolean));
  body.append(titleRow);

  const description = document.createElement("p");
  description.className = "plugin-description";
  description.textContent = localizedPluginText(plugin, "description", plugin.id);
  body.append(description);

  const capabilities = document.createElement("div");
  capabilities.className = "capability-list";
  for (const capability of plugin.capabilities ?? []) {
    const tag = document.createElement("span");
    tag.textContent = capability;
    capabilities.append(tag);
  }
  body.append(capabilities);

  const action = document.createElement("a");
  action.className = "plugin-action";
  const launchable = plugin.status === "active" && plugin.entryUrl;
  action.textContent = launchable
    ? t("button.open")
    : plugin.status === "planned"
      ? t("button.planned")
      : t("button.disabled");
  if (launchable) {
    const actionUrl = createPluginActionUrl(plugin.entryUrl);
    const sidebarUrl = document.createElement("p");
    sidebarUrl.className = "plugin-sidebar-url";
    sidebarUrl.textContent = `${t("label.sidebarUrl")}: ${actionUrl}`;
    body.append(sidebarUrl);
    action.href = actionUrl;
  } else {
    action.href = "#";
    action.setAttribute("aria-disabled", "true");
    action.addEventListener("click", event => event.preventDefault());
  }
  body.append(action);

  card.append(body);
  return card;
}

for (const button of languageButtons) {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
}
