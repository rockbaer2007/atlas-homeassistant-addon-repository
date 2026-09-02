import {
  createRuntimePluginAdministrationView,
  createRuntimePluginInstallPackage,
  parseRuntimePluginInstallPackage,
  RuntimePluginCatalog,
} from "@atlas/runtime";
import {
  createHomeAssistantCardEditorAppReleaseReadiness,
  createHomeAssistantCardEditorPlugin,
  createHomeAssistantCardEditorPluginInstallPackage,
  createHomeAssistantConnectionConfiguration,
  deriveHomeAssistantWebSocketUrl,
  HomeAssistantCardEditorPluginId,
} from "@atlas/homeassistant";
import {
  createFileStudioPlugin,
  createFileStudioPluginInstallPackage,
  FileStudioPluginId,
} from "@atlas/file-studio";

const languageButtons = Array.from(document.querySelectorAll("[data-language]"));
const themeButtons = Array.from(document.querySelectorAll("[data-theme-mode]"));
const homeAssistantUrl = document.querySelector("#home-assistant-url");
const homeAssistantToken = document.querySelector("#home-assistant-token");
const translationProviderInputs = Array.from(document.querySelectorAll('input[name="translation-provider"]'));
const translationApiKeyInputs = {
  chatgpt: document.querySelector("#translation-api-key-chatgpt"),
  gemini: document.querySelector("#translation-api-key-gemini"),
  "deepl-free": document.querySelector("#translation-api-key-deepl-free"),
  "deepl-pro": document.querySelector("#translation-api-key-deepl-pro"),
  "custom-ai": document.querySelector("#translation-api-key-custom-ai"),
};
const rememberAdminToken = document.querySelector("#remember-admin-token");
const autoConnectEditor = document.querySelector("#auto-connect-editor");
const saveAdminSettings = document.querySelector("#save-admin-settings");
const forgetAdminToken = document.querySelector("#forget-admin-token");
const exportAdminSettings = document.querySelector("#export-admin-settings");
const openCardEditor = document.querySelector("#open-card-editor");
const openSidebarPluginDialog = document.querySelector("#open-sidebar-plugin-dialog");
const sidebarPluginDialog = document.querySelector("#sidebar-plugin-dialog");
const sidebarPluginList = document.querySelector("#sidebar-plugin-list");
const closeSidebarPluginDialog = document.querySelector("#close-sidebar-plugin-dialog");
const adminConnectionModeHint = document.querySelector("#admin-connection-mode-hint");
const editorStartMode = document.querySelector("#editor-start-mode");
const importPluginPackage = document.querySelector("#import-plugin-package");
const pluginPackageFile = document.querySelector("#plugin-package-file");
const openPluginRepositoryDialog = document.querySelector("#open-plugin-repository-dialog");
const pluginRepositoryDialog = document.querySelector("#plugin-repository-dialog");
const pluginRepositoryUrl = document.querySelector("#plugin-repository-url");
const pluginRepositoryType = document.querySelector("#plugin-repository-type");
const addPluginRepository = document.querySelector("#add-plugin-repository");
const closePluginRepositoryDialog = document.querySelector("#close-plugin-repository-dialog");
const previewPluginRepository = document.querySelector("#preview-plugin-repository");
const pluginRepositoryPreviewStatus = document.querySelector("#plugin-repository-preview-status");
const pluginRepositoryPreviewList = document.querySelector("#plugin-repository-preview-list");
const refreshPluginRepositories = document.querySelector("#refresh-plugin-repositories");
const pluginRepositoryStatus = document.querySelector("#plugin-repository-status");
const pluginRepositoryList = document.querySelector("#plugin-repository-list");
const pluginRepositoryPluginList = document.querySelector("#plugin-repository-plugin-list");
const refreshPluginUpdates = document.querySelector("#refresh-plugin-updates");
const pluginUpdateSummary = document.querySelector("#plugin-update-summary");
const pluginUpdateList = document.querySelector("#plugin-update-list");
const adminSaveState = document.querySelector("#admin-save-state");
const pluginSummary = document.querySelector("#plugin-summary");
const pluginList = document.querySelector("#plugin-list");
const policySummary = document.querySelector("#policy-summary");
const allowAddonsPath = document.querySelector("#allow-addons-path");
const fileStudioPathAccessInputs = Array.from(document.querySelectorAll("[data-file-studio-path-access]"));
const fileStudioAccessHint = document.querySelector("#file-studio-access-hint");
const refreshAppRuntime = document.querySelector("#refresh-app-runtime");
const appRuntimeSummary = document.querySelector("#app-runtime-summary");
const appRuntimeStatus = document.querySelector("#app-runtime-status");
const appRuntimeSurfaces = document.querySelector("#app-runtime-surfaces");
const appRuntimeLinks = document.querySelector("#app-runtime-links");
const appRuntimeDistribution = document.querySelector("#app-runtime-distribution");
const appReleaseSummary = document.querySelector("#app-release-summary");
const appReleaseChecks = document.querySelector("#app-release-checks");
const appReleaseTargets = document.querySelector("#app-release-targets");
const parcelProviderSummary = document.querySelector("#parcel-provider-summary");
const parcelProviderList = document.querySelector("#parcel-provider-list");
const adminStorageKey = "atlas.administration.configuration";
const adminPluginStorageKey = "atlas.administration.importedPlugins";
const adminPluginStateStorageKey = "atlas.administration.pluginState";
const adminPluginRepositoryStorageKey = "atlas.administration.pluginRepository";
const adminPluginUpdateCheckStorageKey = "atlas.administration.pluginUpdateCheck";
const atlasThemeStorageKey = "atlas.themePreference";
const adminConnectionCookieName = "atlas_admin_connection";
const adminSecretsCookieName = "atlas_admin_secrets";
const sharedPluginCatalogCookieName = "atlas_plugin_catalog";
const adminSecretsKeyStorageKey = "atlas.administration.secretsCookieKey";
const legacyAdminTranslationApiKeysCookieName = "atlas_admin_translation_api_keys";
const legacyAdminTranslationApiKeysKeyStorageKey = "atlas.administration.translationApiKeysCookieKey";
const adminConnectionApiPath = "/api/admin-connection";
const adminDeviceApiPath = "/api/admin-device";
const defaultTranslationApiEndpoint = "https://api.deepl.com/v2/translate";
const translationProviderValues = ["none", "chatgpt", "gemini", "deepl-free", "deepl-pro", "custom-ai"];
const pluginRepositoryTypeValues = ["plugin", "card", "integration", "tool", "theme"];
const parcelProviderDefaults = [
  {
    id: "dhl",
    name: "DHL",
    region: "DE/EU",
    authMode: "public-tracking",
    status: "ready",
    trackingUrl: "https://www.dhl.de/de/privatkunden/dhl-sendungsverfolgung.html?piececode={trackingNumber}",
    capabilities: ["tracking-link", "tracking-number"],
  },
  {
    id: "deutsche-post",
    name: "Deutsche Post",
    region: "DE",
    authMode: "public-tracking",
    status: "ready",
    trackingUrl: "https://www.deutschepost.de/sendung/simpleQuery.html?piececode={trackingNumber}",
    capabilities: ["tracking-link", "tracking-number"],
  },
  {
    id: "hermes",
    name: "Hermes",
    region: "DE",
    authMode: "public-tracking",
    status: "ready",
    trackingUrl: "https://www.myhermes.de/empfangen/sendungsverfolgung/sendungsinformation/#{trackingNumber}",
    capabilities: ["tracking-link", "tracking-number"],
  },
  {
    id: "dpd",
    name: "DPD",
    region: "DE/EU",
    authMode: "public-tracking",
    status: "ready",
    trackingUrl: "https://tracking.dpd.de/status/de_DE/parcel/{trackingNumber}",
    capabilities: ["tracking-link", "tracking-number"],
  },
  {
    id: "gls",
    name: "GLS",
    region: "DE/EU",
    authMode: "public-tracking",
    status: "ready",
    trackingUrl: "https://gls-group.com/DE/de/paketverfolgung?match={trackingNumber}",
    capabilities: ["tracking-link", "tracking-number"],
  },
  {
    id: "ups",
    name: "UPS",
    region: "Global",
    authMode: "public-tracking",
    status: "ready",
    trackingUrl: "https://www.ups.com/track?loc=de_DE&tracknum={trackingNumber}",
    capabilities: ["tracking-link", "tracking-number"],
  },
  {
    id: "fedex",
    name: "FedEx",
    region: "Global",
    authMode: "public-tracking",
    status: "ready",
    trackingUrl: "https://www.fedex.com/fedextrack/?trknbr={trackingNumber}",
    capabilities: ["tracking-link", "tracking-number"],
  },
  {
    id: "amazon",
    name: "Amazon Logistics",
    region: "Global",
    authMode: "account-required",
    status: "manual-account",
    trackingUrl: "https://www.amazon.de/progress-tracker/package",
    capabilities: ["account-link", "manual-status"],
  },
];
const editorOrigin = createPortOrigin(4174);
const appRuntimeApiUrl = createPortNavigationUrl(4176, "/app");
const longTermCookieMaxAge = 31536000;
const pluginCatalog = new RuntimePluginCatalog();
pluginCatalog.register(createHomeAssistantCardEditorPlugin());
pluginCatalog.register(createFileStudioPlugin());
const bundledPluginIds = new Set(pluginCatalog.list().map(plugin => plugin.id));
const localPluginAssetDirectories = {
  [HomeAssistantCardEditorPluginId]: "homeassistant-card-editor",
  [FileStudioPluginId]: "file-studio",
  "atlas.plugin.simple-editor": "simple-editor",
};

let currentLanguage = "en";
let currentThemePreference = "auto";
let activePluginIds = new Set([HomeAssistantCardEditorPluginId]);
let importedPluginDescriptors = [];
let pluginRepositories = [];
let repositoryPluginDescriptors = [];
let pendingRepositoryPreview;
let lastEditorWindow;
let lastAppRuntime;
let currentDistributionTarget = "standalone-docker-preview";
let currentAdminDeviceBinding;
let currentParcelProviderSettings = normalizeParcelProviderSettings();

const translations = {
  en: {
    "page.title": "ATLAS Administration",
    "page.subtitle": "Manage plugins, install packages and central Home Assistant access.",
    "heading.access": "Connection settings",
    "heading.haConnection": "Home Assistant connection",
    "heading.translationSettings": "Card translation",
    "heading.parcelSettings": "Parcel service providers",
    "heading.appRuntime": "App runtime status",
    "heading.runtimeSurfaces": "Surfaces",
    "heading.runtimeLinks": "Links",
    "heading.appRelease": "App release readiness",
    "heading.releaseChecks": "Release checks",
    "heading.releaseTargets": "Distribution targets",
    "heading.plugins": "Installed plugins",
    "heading.pluginUpdates": "Plugin updates",
    "heading.policy": "Plugin access policy",
    "heading.addPluginRepository": "Add ATLAS repository",
    "heading.sidebarPluginDialog": "Plugin sidebar entry",
    "label.haUrl": "Home Assistant URL",
    "label.accessToken": "Access token",
    "label.translationProvider": "Translation module",
    "label.rememberToken": "Remember token locally for Administration",
    "label.autoConnectEditor": "Auto-connect Card Editor after handoff",
    "label.editorStartMode": "Editor start mode",
    "label.appUrl": "App",
    "label.adminUrl": "Administration",
    "label.editorUrl": "Card Editor",
    "label.healthUrl": "Health",
    "label.distributionOrder": "Distribution order",
    "label.version": "Version",
    "label.availableVersion": "Available version",
    "label.installedVersion": "Installed version",
    "label.extensionPoints": "Extension points",
    "label.capabilities": "Capabilities",
    "label.compatibility": "Compatibility",
    "label.icon": "Icon",
    "label.logo": "Logo",
    "label.preview": "Preview",
    "label.sidebarYaml": "configuration.yaml",
    "label.pluginRepositories": "Custom repositories",
    "label.pluginRepositoryUrl": "Repository",
    "label.pluginRepositoryType": "Type",
    "label.parcelEnabled": "Enabled",
    "label.allowAddonsPath": "Allow File Studio access to /addons",
    "label.fileStudioAccessConfig": "config",
    "label.fileStudioAccessWww": "www",
    "label.fileStudioAccessCustomComponents": "custom_components",
    "label.fileStudioAccessAddons": "addons",
    "label.fileStudioAccessParentOfConfig": "parent-of-config",
    "theme.auto": "Auto",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "button.saveSettings": "Save settings",
    "button.forgetToken": "Forget token",
    "button.exportSettings": "Export settings",
    "button.openEditor": "Open Plugin Hub",
    "button.refreshRuntime": "Refresh status",
    "button.inspect": "Inspect",
    "button.activate": "Activate",
    "button.deactivate": "Deactivate",
    "button.exportPackage": "Export package",
    "button.importPackage": "Import package",
    "button.openSidebarPluginDialog": "Add plugin to sidebar",
    "button.prepareSidebarPlugin": "Copy YAML",
    "button.close": "Close",
    "button.openRepositoryDialog": "Add ATLAS repository",
    "button.previewRepository": "Preview repository",
    "button.addRepository": "Add",
    "button.cancel": "Cancel",
    "button.refreshRepositories": "Refresh repositories",
    "button.refreshPluginUpdates": "Check updates",
    "button.removeRepository": "Remove repository",
    "button.installRepositoryPackage": "Install",
    "button.updateRepositoryPackage": "Update",
    "button.bundledRepositoryPackage": "Built in",
    "button.removeRepositoryPackage": "Remove",
    "button.removeImportedPackage": "Remove import",
    "provider.none": "Default / fallback files",
    "provider.chatgpt": "ChatGPT / OpenAI",
    "provider.gemini": "Gemini",
    "provider.deeplFree": "DeepL API Free",
    "provider.deeplPro": "DeepL API Pro",
    "provider.customAi": "Custom AI provider",
    "placeholder.chatgptApiKey": "OpenAI API key later",
    "placeholder.geminiApiKey": "Gemini API key later",
    "placeholder.deeplFreeApiKey": "Free API key later",
    "placeholder.deeplProApiKey": "Pro API key later",
    "placeholder.customAiApiKey": "Custom provider API key later",
    "placeholder.pluginRepositoryUrl": "https://example.test/atlas/repository.json",
    "aria.language": "Language",
    "aria.theme": "Theme",
    "message.accessHint": "Tokens stay in Administration. Plugins receive approved paths and capabilities only.",
    "message.connectionHaAppHint": "These Home Assistant connection values come from the Home Assistant App/Add-on options.",
    "message.connectionStandaloneHint": "In Docker and Linux mode these values are managed here.",
    "message.fileStudioAccessHaAppHint": "In Home Assistant App/Add-on mode these file capabilities come from the App/Add-on configuration.",
    "message.fileStudioAccessStandaloneHint": "In Docker and Linux mode these file capabilities are managed here.",
    "message.openAiApiKeyLink": "Get OpenAI API key:",
    "message.geminiApiKeyLink": "Get Gemini API key:",
    "message.deeplApiKeyLink": "Get DeepL API key:",
    "message.pluginsHint": "The Home Assistant Card Editor is the first official reference plugin.",
    "message.appRuntimeHint": "Read the combined app server status exposed on port 4176.",
    "message.appRuntimeLoading": "Loading app runtime status...",
    "message.appRuntimeSummary": "{name} {version}: {status}, started {startedAt}.",
    "message.appRuntimeUnavailable": "App runtime status is unavailable.",
    "message.runtimeSurfaceReady": "Port {port} is ready.",
    "message.runtimeSurfaceUnavailable": "Port {port} is not answering yet.",
    "message.appReleaseHint": "Track the local app path before the later Home Assistant/HACS integration.",
    "message.appReleaseSummary": "{ready} ready, {inProgress} in progress, {planned} planned",
    "message.parcelProviderSummary": "{enabled} of {total} service providers enabled. Public tracking links are prefilled automatically; account-only providers stay marked for later connection.",
    "message.preparedForLaterUse": "(prepared for later use)",
    "message.pluginSummary": "{total} plugins, {active} active, {available} available, {disabled} disabled",
    "message.policySummary": "Current approved context: Home Assistant URL {url}, WebSocket path {websocket}.",
    "message.saved": "Settings saved.",
    "message.savedWithToken": "Token saved.",
    "message.tokenForgotten": "Token forgotten.",
    "message.settingsExported": "Settings exported.",
    "message.secretsInvalidForDevice": "Saved secrets belong to another Atlas Administration instance and were ignored.",
    "message.autoConnectNeedsToken": "Auto-connect needs a saved access token.",
    "message.editorOpened": "Plugin Hub opened and connection settings saved.",
    "message.editorOpenedWithoutToken": "Plugin Hub opened. Home Assistant connection still needs a saved access token.",
    "message.editorReady": "Card Editor requested connection settings.",
    "message.editorTokenMissing": "Save or enter an access token before opening the Card Editor.",
    "message.pluginInspected": "{name}: {points} extension points, {capabilities} capabilities.",
    "message.pluginActivated": "{name} activated.",
    "message.pluginDeactivated": "{name} deactivated.",
    "message.pluginPackageExported": "{name} plugin package exported.",
    "message.pluginPackageImported": "{name} plugin package imported.",
    "message.pluginPackageDuplicate": "{name} is already installed.",
    "message.pluginPackageImportFailed": "Plugin package could not be imported.",
    "message.pluginPackageRemoved": "{name} imported package removed.",
    "message.pluginRepositoryEmpty": "Add an ATLAS repository to preview installable plugins.",
    "message.pluginRepositoryDuplicate": "This repository is already listed.",
    "message.pluginRepositoryAdded": "Repository added.",
    "message.pluginRepositoryRemoved": "Repository removed.",
    "message.pluginRepositoryLoading": "Loading plugin repositories...",
    "message.pluginRepositoryLoaded": "{count} repository plugins loaded from {countRepositories} repositories.",
    "message.pluginRepositoryFailed": "Plugin repository could not be loaded.",
    "message.pluginRepositoryInvalid": "Plugin repository response is invalid or is missing the ATLAS plugin repository marker.",
    "message.pluginRepositoryWrongType": "This is a Home Assistant add-on repository. Add it in Home Assistant under Settings > Add-ons > Add-on Store > Repositories, not in Atlas Administration.",
    "message.pluginRepositoryNoEntries": "No custom repositories added yet.",
    "message.pluginRepositoryPreviewEmpty": "Enter a repository URL and preview it before adding.",
    "message.pluginRepositoryPreviewLoaded": "{count} plugins found in {name}.",
    "message.pluginRepositoryPluginInstalled": "{name} installed from repository.",
    "message.pluginRepositoryPluginUpdated": "{name} updated from repository.",
    "message.pluginRepositoryPluginRemoved": "{name} removed.",
    "message.pluginRepositoryInstallFailed": "{name} could not be installed from repository.",
    "message.pluginRepositoryUpdateAvailable": "Update available: {installed} -> {available}",
    "message.pluginRepositoryInstalledVersion": "Installed: {version}",
    "message.pluginRepositoryBundledVersion": "Built in: {version}",
    "message.pluginRepositoryNotInstalled": "Not installed",
    "message.pluginRepositoryNoPackage": "No installable package or manifest URL.",
    "message.sidebarPluginDialogHint": "Prepare a Home Assistant sidebar entry and copy the panel_iframe YAML block.",
    "message.sidebarPluginCopied": "{name} panel_iframe YAML copied.",
    "message.sidebarPluginUnavailable": "No launch URL available yet.",
    "message.pluginUpdatesHint": "Atlas checks custom plugin repositories on Administration start and after reload.",
    "message.pluginUpdatesChecking": "Checking plugin repositories for updates...",
    "message.pluginUpdatesNoRepositories": "No custom plugin repositories configured yet.",
    "message.pluginUpdatesNone": "No plugin updates found. Last checked: {checkedAt}.",
    "message.pluginUpdatesFound": "{count} plugin update(s) found. Last checked: {checkedAt}.",
    "message.pluginUpdatesPending": "Plugin update check has not run yet.",
    "type.plugin": "Plugin",
    "type.card": "Card",
    "type.integration": "Integration",
    "type.tool": "Tool",
    "type.theme": "Theme",
    "guide.sidebarStep1": "Open Home Assistant Settings > Dashboards.",
    "guide.sidebarStep2": "Add a dashboard of type Webpage.",
    "guide.sidebarStep3": "Paste the copied panel_iframe block into configuration.yaml or create a matching Webpage dashboard entry.",
    "guide.sidebarStep4": "Check the YAML configuration, reload Panel iFrames or restart Home Assistant.",
    "mode.simple": "Simple",
    "mode.expert": "Expert",
    "policy.token": "The Card Editor receives the token only as a browser session handoff.",
    "policy.paths": "Plugins receive approved URLs, WebSocket paths and resource paths.",
    "policy.capabilities": "Capabilities are declared through the Runtime plugin manifest and file paths are released here.",
    "text.pluginStatusAvailable": "Available",
    "text.pluginStatusActive": "Active",
    "text.pluginStatusDisabled": "Disabled",
    "text.releaseStatusReady": "Ready",
    "text.releaseStatusInProgress": "In progress",
    "text.releaseStatusPlanned": "Planned",
    "text.runtimeReady": "Ready",
    "text.runtimeUnavailable": "Unavailable",
    "release.admin-session-handoff.label": "Administration session handoff",
    "release.admin-session-handoff.reason": "The editor receives Home Assistant connection settings from Administration without shared token storage.",
    "release.problem-report-preview.label": "Opt-in problem reports",
    "release.problem-report-preview.reason": "The editor previews sanitized debug data before copy or GitHub issue creation.",
    "release.plugin-install-package.label": "Reference plugin package",
    "release.plugin-install-package.reason": "Administration can export the Home Assistant Card Editor as an .atlas-plugin.json package.",
    "release.hacs-card-bundle.label": "HACS card bundle export",
    "release.hacs-card-bundle.reason": "Card bundles can be exported and imported, while the final installable repository flow still needs release wiring.",
    "release.home-assistant-frontend.label": "Home Assistant frontend integration",
    "release.home-assistant-frontend.reason": "The local app and reference plugin path come before the later native Home Assistant/HACS frontend integration.",
    "release.standalone-docker.label": "Standalone Docker container",
    "release.standalone-docker.reason": "Dockerfile and Compose wiring build the local image, start the app surfaces and pass the container health check.",
    "release.home-assistant-app.label": "Home Assistant App / Add-on",
    "release.home-assistant-app.reason": "The App/Add-on scaffold builds a local preview image from the verified container runtime and reports its app target through /app.",
    "release.linux-installer.label": "Linux VM / LXC installer",
    "release.linux-installer.reason": "Add a systemd-based installer for VM, LXC or bare Linux after the container path is stable.",
    "release.atlas-plugin.label": "ATLAS reference plugin",
    "release.atlas-plugin.reason": "The Card Editor is registered as the first official ATLAS reference plugin and can be exported as a plugin package.",
    "release.home-assistant-hacs.label": "Home Assistant / HACS integration",
    "release.home-assistant-hacs.reason": "HACS-oriented card bundles exist first; native Home Assistant frontend installation remains a later integration target.",
    "text.parcelStatusReady": "Ready",
    "text.parcelStatusManualAccount": "Account required",
    "text.parcelAuthPublicTracking": "Public tracking link",
    "text.parcelAuthAccountRequired": "Account sign-in required",
  },
  de: {
    "page.title": "ATLAS Administration",
    "page.subtitle": "Plugins, Installpakete und zentralen Home-Assistant-Zugriff verwalten.",
    "heading.access": "Verbindungseinstellungen",
    "heading.haConnection": "Home-Assistant-Verbindung",
    "heading.translationSettings": "Card-Übersetzung",
    "heading.parcelSettings": "Paket-Dienstleister",
    "heading.appRuntime": "App-Laufzeitstatus",
    "heading.runtimeSurfaces": "Oberflächen",
    "heading.runtimeLinks": "Links",
    "heading.appRelease": "App-Freigabe",
    "heading.releaseChecks": "Freigabe-Checks",
    "heading.releaseTargets": "Ausgabeziele",
    "heading.plugins": "Installierte Plugins",
    "heading.pluginUpdates": "Plugin-Updates",
    "heading.policy": "Plugin-Zugriffsregel",
    "heading.addPluginRepository": "ATLAS Repository hinzufügen",
    "heading.sidebarPluginDialog": "Plugin als Seitenleisteneintrag",
    "label.haUrl": "Home Assistant URL",
    "label.accessToken": "Access Token",
    "label.translationProvider": "Übersetzungsmodul",
    "label.rememberToken": "Token lokal für die Administration merken",
    "label.autoConnectEditor": "Card Editor nach Übergabe automatisch verbinden",
    "label.editorStartMode": "Editor-Startmodus",
    "label.appUrl": "App",
    "label.adminUrl": "Administration",
    "label.editorUrl": "Card Editor",
    "label.healthUrl": "Health",
    "label.distributionOrder": "Distributionsreihenfolge",
    "label.version": "Version",
    "label.availableVersion": "Verfügbare Version",
    "label.installedVersion": "Installierte Version",
    "label.extensionPoints": "Extension Points",
    "label.capabilities": "Fähigkeiten",
    "label.compatibility": "Kompatibilität",
    "label.icon": "Icon",
    "label.logo": "Logo",
    "label.preview": "Vorschau",
    "label.sidebarYaml": "configuration.yaml",
    "label.pluginRepositories": "Benutzerdefinierte Repositories",
    "label.pluginRepositoryUrl": "Repository",
    "label.pluginRepositoryType": "Typ",
    "label.parcelEnabled": "Aktiv",
    "label.allowAddonsPath": "File-Studio-Zugriff auf /addons erlauben",
    "label.fileStudioAccessConfig": "config",
    "label.fileStudioAccessWww": "www",
    "label.fileStudioAccessCustomComponents": "custom_components",
    "label.fileStudioAccessAddons": "addons",
    "label.fileStudioAccessParentOfConfig": "parent-of-config",
    "theme.auto": "Auto",
    "theme.light": "Hell",
    "theme.dark": "Dunkel",
    "button.saveSettings": "Einstellungen speichern",
    "button.forgetToken": "Token vergessen",
    "button.exportSettings": "Einstellungen exportieren",
    "button.openEditor": "Plugin-Hub öffnen",
    "button.refreshRuntime": "Status aktualisieren",
    "button.inspect": "Prüfen",
    "button.activate": "Aktivieren",
    "button.deactivate": "Deaktivieren",
    "button.exportPackage": "Paket exportieren",
    "button.importPackage": "Paket importieren",
    "button.openSidebarPluginDialog": "Plugin zur Seitenleiste hinzufügen",
    "button.prepareSidebarPlugin": "YAML kopieren",
    "button.close": "Schließen",
    "button.openRepositoryDialog": "ATLAS Repository hinzufügen",
    "button.previewRepository": "Repository prüfen",
    "button.addRepository": "Hinzufügen",
    "button.cancel": "Abbrechen",
    "button.refreshRepositories": "Repositories aktualisieren",
    "button.refreshPluginUpdates": "Updates prüfen",
    "button.removeRepository": "Repository entfernen",
    "button.installRepositoryPackage": "Installieren",
    "button.updateRepositoryPackage": "Aktualisieren",
    "button.bundledRepositoryPackage": "Eingebaut",
    "button.removeRepositoryPackage": "Entfernen",
    "button.removeImportedPackage": "Import entfernen",
    "provider.none": "Standard / Fallback-Dateien",
    "provider.chatgpt": "ChatGPT / OpenAI",
    "provider.gemini": "Gemini",
    "provider.deeplFree": "DeepL API Free",
    "provider.deeplPro": "DeepL API Pro",
    "provider.customAi": "Eigener KI-Anbieter",
    "placeholder.chatgptApiKey": "OpenAI API-Key später",
    "placeholder.geminiApiKey": "Gemini API-Key später",
    "placeholder.deeplFreeApiKey": "Kostenloser API-Key später",
    "placeholder.deeplProApiKey": "Kostenpflichtiger API-Key später",
    "placeholder.customAiApiKey": "Eigener Provider-API-Key später",
    "placeholder.pluginRepositoryUrl": "https://example.test/atlas/repository.json",
    "aria.language": "Sprache",
    "aria.theme": "Darstellung",
    "message.accessHint": "Tokens bleiben in der Administration. Plugins erhalten nur freigegebene Pfade und Fähigkeiten.",
    "message.connectionHaAppHint": "Diese Home-Assistant-Verbindungswerte kommen aus den Home-Assistant-App/Add-on-Optionen.",
    "message.connectionStandaloneHint": "Im Docker- und Linux-Modus werden diese Werte hier verwaltet.",
    "message.fileStudioAccessHaAppHint": "Im Home-Assistant-App/Add-on-Modus kommen diese Datei-Fähigkeiten aus der App/Add-on-Konfiguration.",
    "message.fileStudioAccessStandaloneHint": "Im Docker- und Linux-Modus werden diese Datei-Fähigkeiten hier verwaltet.",
    "message.openAiApiKeyLink": "OpenAI API-Key erhalten:",
    "message.geminiApiKeyLink": "Gemini API-Key erhalten:",
    "message.deeplApiKeyLink": "DeepL API-Key erhalten:",
    "message.pluginsHint": "Der Home Assistant Card Editor ist das erste offizielle Referenz-Plugin.",
    "message.appRuntimeHint": "Liest den gemeinsamen App-Server-Status auf Port 4176.",
    "message.appRuntimeLoading": "App-Laufzeitstatus wird geladen...",
    "message.appRuntimeSummary": "{name} {version}: {status}, gestartet {startedAt}.",
    "message.appRuntimeUnavailable": "App-Laufzeitstatus ist nicht erreichbar.",
    "message.runtimeSurfaceReady": "Port {port} ist bereit.",
    "message.runtimeSurfaceUnavailable": "Port {port} antwortet noch nicht.",
    "message.appReleaseHint": "Verfolge den lokalen App-Pfad vor der späteren Home-Assistant/HACS-Integration.",
    "message.appReleaseSummary": "{ready} bereit, {inProgress} in Arbeit, {planned} geplant",
    "message.parcelProviderSummary": "{enabled} von {total} Dienstleistern aktiv. Öffentliche Tracking-Links sind automatisch vorbelegt; Konto-Dienstleister bleiben für die spätere Anbindung markiert.",
    "message.preparedForLaterUse": "(vorbereitet für spätere Nutzung)",
    "message.pluginSummary": "{total} Plugins, {active} aktiv, {available} verfügbar, {disabled} deaktiviert",
    "message.policySummary": "Aktuell freigegebener Kontext: Home-Assistant-URL {url}, WebSocket-Pfad {websocket}.",
    "message.saved": "Einstellungen gespeichert.",
    "message.savedWithToken": "Token gespeichert.",
    "message.tokenForgotten": "Token vergessen.",
    "message.settingsExported": "Einstellungen exportiert.",
    "message.secretsInvalidForDevice": "Gespeicherte Secrets gehoeren zu einer anderen Atlas-Administration-Instanz und wurden ignoriert.",
    "message.autoConnectNeedsToken": "Auto-connect braucht einen gespeicherten Access Token.",
    "message.editorOpened": "Plugin-Hub geöffnet und Verbindungseinstellungen gespeichert.",
    "message.editorOpenedWithoutToken": "Plugin-Hub geöffnet. Die Home-Assistant-Verbindung braucht noch einen gespeicherten Access Token.",
    "message.editorReady": "Card Editor hat Verbindungseinstellungen angefordert.",
    "message.editorTokenMissing": "Gib zuerst einen Access Token ein oder speichere ihn, bevor du den Card Editor öffnest.",
    "message.pluginInspected": "{name}: {points} Extension Points, {capabilities} Fähigkeiten.",
    "message.pluginActivated": "{name} aktiviert.",
    "message.pluginDeactivated": "{name} deaktiviert.",
    "message.pluginPackageExported": "{name} Plugin-Paket exportiert.",
    "message.pluginPackageImported": "{name} Plugin-Paket importiert.",
    "message.pluginPackageDuplicate": "{name} ist bereits installiert.",
    "message.pluginPackageImportFailed": "Plugin-Paket konnte nicht importiert werden.",
    "message.pluginPackageRemoved": "{name} importiertes Paket entfernt.",
    "message.pluginRepositoryEmpty": "Füge ein ATLAS-Repository hinzu, um installierbare Plugins anzusehen.",
    "message.pluginRepositoryDuplicate": "Dieses Repository ist bereits in der Liste.",
    "message.pluginRepositoryAdded": "Repository hinzugefügt.",
    "message.pluginRepositoryRemoved": "Repository entfernt.",
    "message.pluginRepositoryLoading": "Plugin-Repositories werden geladen...",
    "message.pluginRepositoryLoaded": "{count} Repository-Plugins aus {countRepositories} Repositories geladen.",
    "message.pluginRepositoryFailed": "Plugin-Repository konnte nicht geladen werden.",
    "message.pluginRepositoryInvalid": "Plugin-Repository-Antwort ist ungültig oder enthält keine ATLAS-Plugin-Repository-Kennung.",
    "message.pluginRepositoryWrongType": "Das ist ein Home-Assistant-Add-on-Repository. Füge es in Home Assistant unter Einstellungen > Add-ons > Add-on Store > Repositories hinzu, nicht in Atlas Administration.",
    "message.pluginRepositoryNoEntries": "Noch keine benutzerdefinierten Repositories hinzugefügt.",
    "message.pluginRepositoryPreviewEmpty": "Gib eine Repository-URL ein und prüfe sie vor dem Hinzufügen.",
    "message.pluginRepositoryPreviewLoaded": "{count} Plugins in {name} gefunden.",
    "message.pluginRepositoryPluginInstalled": "{name} aus Repository installiert.",
    "message.pluginRepositoryPluginUpdated": "{name} aus Repository aktualisiert.",
    "message.pluginRepositoryPluginRemoved": "{name} entfernt.",
    "message.pluginRepositoryInstallFailed": "{name} konnte nicht aus dem Repository installiert werden.",
    "message.pluginRepositoryUpdateAvailable": "Update verfügbar: {installed} -> {available}",
    "message.pluginRepositoryInstalledVersion": "Installiert: {version}",
    "message.pluginRepositoryBundledVersion": "Eingebaut: {version}",
    "message.pluginRepositoryNotInstalled": "Nicht installiert",
    "message.pluginRepositoryNoPackage": "Keine installierbare Paket- oder Manifest-URL.",
    "message.sidebarPluginDialogHint": "Bereitet einen Home-Assistant-Seitenleisteneintrag vor und kopiert den panel_iframe-YAML-Block.",
    "message.sidebarPluginCopied": "{name}: panel_iframe-YAML kopiert.",
    "message.sidebarPluginUnavailable": "Noch keine Start-URL verfügbar.",
    "message.pluginUpdatesHint": "Atlas prüft benutzerdefinierte Plugin-Repositories beim Start der Administration und nach einem Reload.",
    "message.pluginUpdatesChecking": "Plugin-Repositories werden auf Updates geprüft...",
    "message.pluginUpdatesNoRepositories": "Noch keine benutzerdefinierten Plugin-Repositories eingerichtet.",
    "message.pluginUpdatesNone": "Keine Plugin-Updates gefunden. Zuletzt geprüft: {checkedAt}.",
    "message.pluginUpdatesFound": "{count} Plugin-Update(s) gefunden. Zuletzt geprüft: {checkedAt}.",
    "message.pluginUpdatesPending": "Plugin-Update-Prüfung wurde noch nicht ausgeführt.",
    "type.plugin": "Plugin",
    "type.card": "Card",
    "type.integration": "Integration",
    "type.tool": "Tool",
    "type.theme": "Theme",
    "guide.sidebarStep1": "Öffne Home Assistant Einstellungen > Dashboards.",
    "guide.sidebarStep2": "Füge ein Dashboard vom Typ Webseite hinzu.",
    "guide.sidebarStep3": "Füge den kopierten panel_iframe-Block in configuration.yaml ein oder lege einen passenden Webseiten-Dashboard-Eintrag an.",
    "guide.sidebarStep4": "Prüfe die YAML-Konfiguration und lade Panel-iFrames neu oder starte Home Assistant neu.",
    "mode.simple": "Simple",
    "mode.expert": "Expert",
    "policy.token": "Der Card Editor erhält den Token nur als Browser-Sitzungsübergabe.",
    "policy.paths": "Plugins erhalten freigegebene URLs, WebSocket-Pfade und Ressourcenpfade.",
    "policy.capabilities": "Fähigkeiten werden über das Runtime-Plugin-Manifest deklariert und Dateipfade hier freigegeben.",
    "text.pluginStatusAvailable": "Verfügbar",
    "text.pluginStatusActive": "Aktiv",
    "text.pluginStatusDisabled": "Deaktiviert",
    "text.releaseStatusReady": "Bereit",
    "text.releaseStatusInProgress": "In Arbeit",
    "text.releaseStatusPlanned": "Geplant",
    "text.runtimeReady": "Bereit",
    "text.runtimeUnavailable": "Nicht erreichbar",
    "release.admin-session-handoff.label": "Administration-Sitzungsübergabe",
    "release.admin-session-handoff.reason": "Der Editor erhält Home-Assistant-Verbindungseinstellungen aus der Administration ohne gemeinsam gespeicherten Token.",
    "release.problem-report-preview.label": "Opt-in-Problemberichte",
    "release.problem-report-preview.reason": "Der Editor zeigt bereinigte Debug-Daten vor dem Kopieren oder Öffnen eines GitHub-Issues als Vorschau.",
    "release.plugin-install-package.label": "Referenz-Plugin-Paket",
    "release.plugin-install-package.reason": "Die Administration kann den Home Assistant Card Editor als .atlas-plugin.json-Paket exportieren.",
    "release.hacs-card-bundle.label": "HACS-Card-Bundle-Export",
    "release.hacs-card-bundle.reason": "Card-Bundles können exportiert und importiert werden; der finale installierbare Repository-Flow braucht noch Release-Verdrahtung.",
    "release.home-assistant-frontend.label": "Home-Assistant-Frontend-Integration",
    "release.home-assistant-frontend.reason": "Der lokale App- und Referenz-Plugin-Pfad kommt vor der späteren nativen Home-Assistant/HACS-Frontend-Integration.",
    "release.standalone-docker.label": "Standalone-Docker-Container",
    "release.standalone-docker.reason": "Dockerfile und Compose-Verdrahtung bauen das lokale Image, starten die App-Oberflächen und bestehen den Container-Healthcheck.",
    "release.home-assistant-app.label": "Home Assistant App / Add-on",
    "release.home-assistant-app.reason": "Der App/Add-on-Scaffold baut ein lokales Preview-Image aus der verifizierten Container-Runtime und meldet sein App-Ziel über /app.",
    "release.linux-installer.label": "Linux-VM-/LXC-Installer",
    "release.linux-installer.reason": "Ergänze nach dem stabilen Container-Pfad einen systemd-basierten Installer für VM, LXC oder bare Linux.",
    "release.atlas-plugin.label": "ATLAS-Referenz-Plugin",
    "release.atlas-plugin.reason": "Der Card Editor ist als erstes offizielles ATLAS-Referenz-Plugin registriert und kann als Plugin-Paket exportiert werden.",
    "release.home-assistant-hacs.label": "Home Assistant / HACS-Integration",
    "release.home-assistant-hacs.reason": "HACS-orientierte Card-Bundles existieren zuerst; die native Home-Assistant-Frontend-Installation bleibt ein späteres Integrationsziel.",
    "text.parcelStatusReady": "Fertig",
    "text.parcelStatusManualAccount": "Konto noetig",
    "text.parcelAuthPublicTracking": "Öffentlicher Tracking-Link",
    "text.parcelAuthAccountRequired": "Konto-Anmeldung erforderlich",
  },
};

function t(key, values = {}) {
  let text = translations[currentLanguage]?.[key] ?? translations.en[key] ?? key;
  for (const [name, value] of Object.entries(values)) {
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

function normalizeLocalizedPluginText(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const entries = Object.entries(value)
    .filter(([locale, text]) => locale.trim() && typeof text === "string" && text.trim())
    .map(([locale, text]) => [locale.trim().toLowerCase(), text.trim()]);

  return entries.length ? Object.fromEntries(entries) : undefined;
}

function applyTranslations() {
  document.documentElement.lang = currentLanguage;
  document.title = t("page.title");
  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }
  for (const element of document.querySelectorAll("[data-i18n-aria-label]")) {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  }
  for (const element of document.querySelectorAll("[data-i18n-placeholder]")) {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  }
  for (const button of languageButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.language === currentLanguage));
  }
  for (const button of themeButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.themeMode === currentThemePreference));
  }
  applyHomeAssistantConnectionEditMode();
}

function normalizeThemePreference(value) {
  return ["auto", "light", "dark"].includes(value) ? value : "auto";
}

function readThemePreferenceFromLocation() {
  try {
    const preference = new URL(window.location.href).searchParams.get("theme");
    return ["auto", "light", "dark"].includes(preference) ? preference : undefined;
  } catch {
    return undefined;
  }
}

function currentSystemTheme() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemePreference() {
  const resolvedTheme = currentThemePreference === "auto" ? currentSystemTheme() : currentThemePreference;
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.themePreference = currentThemePreference;
  for (const button of themeButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.themeMode === currentThemePreference));
  }
}

function setThemePreference(preference) {
  currentThemePreference = normalizeThemePreference(preference);
  applyThemePreference();
  try {
    localStorage.setItem(atlasThemeStorageKey, currentThemePreference);
  } catch {
    // Theme preference can fall back to automatic mode if storage is blocked.
  }
  persistConfiguration();
}

function restoreThemePreference(savedPreference) {
  try {
    currentThemePreference = normalizeThemePreference(
      readThemePreferenceFromLocation() ?? savedPreference ?? localStorage.getItem(atlasThemeStorageKey),
    );
  } catch {
    currentThemePreference = normalizeThemePreference(readThemePreferenceFromLocation() ?? savedPreference);
  }
  applyThemePreference();
}

function normalizeDistributionTarget(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "standalone-docker-preview";
}

function normalizeEditorStartMode(value) {
  return value === "expert" ? "expert" : "simple";
}

function isHomeAssistantAppDistribution(value = currentDistributionTarget) {
  return normalizeDistributionTarget(value).startsWith("home-assistant-app");
}

function applyHomeAssistantConnectionEditMode() {
  const readonly = isHomeAssistantAppDistribution();
  homeAssistantUrl.readOnly = readonly;
  homeAssistantToken.readOnly = readonly;
  editorStartMode.disabled = readonly;
  rememberAdminToken.disabled = readonly;
  autoConnectEditor.disabled = readonly;
  forgetAdminToken.disabled = readonly;
  adminConnectionModeHint.textContent = readonly
    ? t("message.connectionHaAppHint")
    : t("message.connectionStandaloneHint");
  allowAddonsPath.disabled = readonly;
  for (const input of fileStudioPathAccessInputs) {
    if (input.dataset.fileStudioPathAccess !== "config") {
      input.disabled = readonly;
    }
  }
  fileStudioAccessHint.textContent = readonly
    ? t("message.fileStudioAccessHaAppHint")
    : t("message.fileStudioAccessStandaloneHint");
}

function currentWebSocketPath() {
  try {
    const configuration = createHomeAssistantConnectionConfiguration({ url: homeAssistantUrl.value });
    return deriveHomeAssistantWebSocketUrl(configuration);
  } catch {
    return "-";
  }
}

function normalizeTranslationProvider(value) {
  return translationProviderValues.includes(value) ? value : "none";
}

function currentTranslationProvider() {
  return normalizeTranslationProvider(translationProviderInputs.find(input => input.checked)?.value);
}

function setTranslationProvider(value) {
  const normalizedProvider = normalizeTranslationProvider(value);
  for (const input of translationProviderInputs) {
    input.checked = input.value === normalizedProvider;
  }
}

function normalizeTranslationApiEndpoint(value) {
  if (typeof value !== "string" || !value.trim()) {
    return defaultTranslationApiEndpoint;
  }

  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.toString() : defaultTranslationApiEndpoint;
  } catch {
    return defaultTranslationApiEndpoint;
  }
}

function normalizeParcelProviderSettings(value) {
  const savedProviders = Array.isArray(value?.providers) ? value.providers : Array.isArray(value) ? value : [];
  const savedById = new Map(savedProviders
    .filter(provider => provider && typeof provider.id === "string")
    .map(provider => [provider.id, provider]));

  return {
    version: 1,
    providers: parcelProviderDefaults.map(provider => {
      const saved = savedById.get(provider.id);
      return {
        ...provider,
        enabled: typeof saved?.enabled === "boolean"
          ? saved.enabled
          : provider.status === "ready",
        trackingUrl: typeof saved?.trackingUrl === "string" && saved.trackingUrl.trim()
          ? saved.trackingUrl.trim()
          : provider.trackingUrl,
      };
    }),
  };
}

function readParcelProviderSettings() {
  if (!parcelProviderList.children.length) {
    return currentParcelProviderSettings;
  }

  const providers = parcelProviderDefaults.map(provider => {
    const enabledInput = document.querySelector(`[data-parcel-provider-enabled="${provider.id}"]`);
    const trackingUrlInput = document.querySelector(`[data-parcel-provider-url="${provider.id}"]`);
    return {
      ...provider,
      enabled: enabledInput ? enabledInput.checked : provider.status === "ready",
      trackingUrl: trackingUrlInput?.value.trim() || provider.trackingUrl,
    };
  });

  currentParcelProviderSettings = {
    version: 1,
    providers,
  };
  return currentParcelProviderSettings;
}

function applyParcelProviderSettings(settings) {
  const normalized = normalizeParcelProviderSettings(settings);
  currentParcelProviderSettings = normalized;
  for (const provider of normalized.providers) {
    const enabledInput = document.querySelector(`[data-parcel-provider-enabled="${provider.id}"]`);
    const trackingUrlInput = document.querySelector(`[data-parcel-provider-url="${provider.id}"]`);
    if (enabledInput) {
      enabledInput.checked = provider.enabled;
    }
    if (trackingUrlInput) {
      trackingUrlInput.value = provider.trackingUrl;
    }
  }
  renderParcelProviderSummary(normalized);
}

function translateParcelProviderStatus(status) {
  if (status === "manual-account") return t("text.parcelStatusManualAccount");
  return t("text.parcelStatusReady");
}

function translateParcelProviderAuthMode(authMode) {
  if (authMode === "account-required") return t("text.parcelAuthAccountRequired");
  return t("text.parcelAuthPublicTracking");
}

function renderParcelProviderSummary(settings = readParcelProviderSettings()) {
  currentParcelProviderSettings = normalizeParcelProviderSettings(settings);
  const providers = settings.providers ?? [];
  parcelProviderSummary.textContent = t("message.parcelProviderSummary", {
    enabled: providers.filter(provider => provider.enabled).length,
    total: providers.length,
  });
}

function renderParcelProviders() {
  const settings = readParcelProviderSettings();
  parcelProviderList.replaceChildren();

  for (const provider of normalizeParcelProviderSettings(settings).providers) {
    const row = document.createElement("label");
    const option = document.createElement("span");
    const checkbox = document.createElement("input");
    const optionText = document.createElement("span");
    const meta = document.createElement("span");
    const name = document.createElement("span");
    const detail = document.createElement("span");
    const urlInput = document.createElement("input");

    row.className = "parcel-provider-row";
    option.className = "provider-option";
    meta.className = "parcel-provider-meta";
    name.className = "parcel-provider-name";
    detail.className = "parcel-provider-detail";
    urlInput.className = "provider-key";
    urlInput.type = "url";
    urlInput.inputMode = "url";
    urlInput.spellcheck = false;
    urlInput.value = provider.trackingUrl;
    urlInput.dataset.parcelProviderUrl = provider.id;
    checkbox.type = "checkbox";
    checkbox.checked = provider.enabled;
    checkbox.dataset.parcelProviderEnabled = provider.id;
    optionText.textContent = t("label.parcelEnabled");
    name.textContent = provider.name;
    detail.textContent = [
      provider.region,
      translateParcelProviderStatus(provider.status),
      translateParcelProviderAuthMode(provider.authMode),
    ].join(" - ");

    checkbox.addEventListener("change", () => {
      renderParcelProviderSummary();
      persistConfiguration();
    });
    urlInput.addEventListener("input", () => {
      renderParcelProviderSummary();
      persistConfiguration();
    });

    option.append(checkbox, optionText);
    meta.append(name, detail);
    row.append(option, meta, urlInput);
    parcelProviderList.append(row);
  }

  renderParcelProviderSummary();
}

function normalizeFileStudioAccessSettings(settings = {}) {
  const allowedPaths = settings && typeof settings.allowedPaths === "object" && !Array.isArray(settings.allowedPaths)
    ? settings.allowedPaths
    : {};
  return {
    allowAddonsPath: settings?.allowAddonsPath === true || allowedPaths.addons === true,
    allowWwwPath: settings?.allowWwwPath === true || allowedPaths.www === true,
    allowCustomComponentsPath: settings?.allowCustomComponentsPath === true || allowedPaths.customComponents === true,
    allowParentOfConfigPath: settings?.allowParentOfConfigPath === true || allowedPaths.parentOfConfig === true,
    allowedPaths: {
      config: true,
      www: settings?.allowWwwPath === true || allowedPaths.www === true,
      customComponents: settings?.allowCustomComponentsPath === true || allowedPaths.customComponents === true,
      addons: settings?.allowAddonsPath === true || allowedPaths.addons === true,
      parentOfConfig: settings?.allowParentOfConfigPath === true || allowedPaths.parentOfConfig === true,
    },
  };
}

function readFileStudioAccessSettings() {
  const allowedPaths = Object.fromEntries(fileStudioPathAccessInputs
    .map(input => [input.dataset.fileStudioPathAccess, input.checked]));
  return normalizeFileStudioAccessSettings({
    allowAddonsPath: allowAddonsPath.checked,
    allowWwwPath: allowedPaths.www === true,
    allowCustomComponentsPath: allowedPaths.customComponents === true,
    allowParentOfConfigPath: allowedPaths.parentOfConfig === true,
    allowedPaths,
  });
}

function applyFileStudioAccessSettings(settings) {
  const normalized = normalizeFileStudioAccessSettings(settings);
  allowAddonsPath.checked = normalized.allowAddonsPath;
  for (const input of fileStudioPathAccessInputs) {
    const key = input.dataset.fileStudioPathAccess;
    input.checked = key === "config" ? true : normalized.allowedPaths[key] === true;
  }
  applyHomeAssistantConnectionEditMode();
}

function readTranslationApiKeys() {
  return Object.fromEntries(
    Object.entries(translationApiKeyInputs).map(([provider, input]) => [provider, input?.value.trim() ?? ""]),
  );
}

function applyTranslationApiKeys(keys) {
  if (!keys || typeof keys !== "object") {
    return;
  }

  for (const [provider, input] of Object.entries(translationApiKeyInputs)) {
    if (input && typeof keys[provider] === "string") {
      input.value = keys[provider];
    }
  }
}

function hasTranslationApiKey(provider, keys = readTranslationApiKeys()) {
  return Boolean(keys[normalizeTranslationProvider(provider)]?.trim());
}

function createTranslationApiKeyConfiguredByProvider(keys = readTranslationApiKeys()) {
  return Object.fromEntries(
    translationProviderValues
      .filter(provider => provider !== "none")
      .map(provider => [provider, hasTranslationApiKey(provider, keys)]),
  );
}

function readAdminSecrets() {
  return {
    token: rememberAdminToken.checked ? homeAssistantToken.value.trim() : "",
    translationApiKeys: readTranslationApiKeys(),
  };
}

function applyAdminSecrets(secrets) {
  if (!secrets || typeof secrets !== "object") {
    return;
  }

  if (typeof secrets.token === "string" && secrets.token) {
    homeAssistantToken.value = secrets.token;
    rememberAdminToken.checked = true;
  }
  applyTranslationApiKeys(secrets.translationApiKeys);
}

function hasAnyAdminSecret(secrets) {
  return Boolean(secrets?.token?.trim()) || hasAnyTranslationApiKey(secrets?.translationApiKeys);
}

async function fetchAdminDeviceBinding() {
  try {
    const response = await fetch(adminDeviceApiPath, { cache: "no-store" });
    if (!response.ok) {
      return undefined;
    }
    const binding = await response.json();
    return normalizeAdminDeviceBinding(binding);
  } catch {
    return undefined;
  }
}

function normalizeAdminDeviceBinding(binding) {
  if (
    !binding
    || typeof binding !== "object"
    || binding.version !== 1
    || typeof binding.installationId !== "string"
    || typeof binding.bindingFingerprint !== "string"
  ) {
    return undefined;
  }

  return {
    version: 1,
    installationId: binding.installationId,
    bindingFingerprint: binding.bindingFingerprint,
    source: typeof binding.source === "string" ? binding.source : "unknown",
  };
}

async function restoreAdminDeviceBinding() {
  currentAdminDeviceBinding = await fetchAdminDeviceBinding();
}

function validateAdminSecretsDeviceBinding(secrets) {
  const binding = normalizeAdminDeviceBinding(secrets?.deviceBinding);
  if (!binding) {
    return true;
  }

  return Boolean(currentAdminDeviceBinding)
    && binding.bindingFingerprint === currentAdminDeviceBinding.bindingFingerprint;
}

function persistConfiguration() {
  const token = homeAssistantToken.value.trim();
  const secrets = readAdminSecrets();
  const translationApiKeys = secrets.translationApiKeys;
  const configuration = {
    language: currentLanguage,
    themePreference: currentThemePreference,
    url: homeAssistantUrl.value,
    translationProvider: currentTranslationProvider(),
    translationApiEndpoint: defaultTranslationApiEndpoint,
    translationApiKeyConfigured: hasTranslationApiKey(currentTranslationProvider(), translationApiKeys),
    translationApiKeyConfiguredByProvider: createTranslationApiKeyConfiguredByProvider(translationApiKeys),
    parcelProviders: readParcelProviderSettings(),
    fileStudioAccess: readFileStudioAccessSettings(),
    pluginRepositories,
    editorStartMode: normalizeEditorStartMode(editorStartMode.value),
    rememberToken: rememberAdminToken.checked,
    autoConnectEditor: autoConnectEditor.checked,
    tokenConfigured: rememberAdminToken.checked && Boolean(token),
  };
  localStorage.setItem(adminStorageKey, JSON.stringify(configuration));
  void persistEncryptedAdminSecretsCookie(secrets);
  persistSharedConnectionCookie(configuration);
  void persistServerConnectionSettings({
    ...configuration,
    token: secrets.token,
    translationApiKeys: secrets.translationApiKeys,
  });
}

async function persistServerConnectionSettings(configuration) {
  await fetch(adminConnectionApiPath, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      url: configuration.url,
      token: configuration.rememberToken ? configuration.token : "",
      rememberToken: configuration.rememberToken,
      autoConnectEditor: configuration.autoConnectEditor,
      editorStartMode: configuration.editorStartMode,
      translationProvider: configuration.translationProvider,
      translationApiEndpoint: configuration.translationApiEndpoint,
      translationApiKeys: configuration.translationApiKeys,
      parcelProviders: configuration.parcelProviders,
      fileStudioAccess: configuration.fileStudioAccess,
    }),
  });
}

function persistSharedConnectionCookie(configuration) {
  if (!configuration.rememberToken || !configuration.tokenConfigured) {
    deleteSharedConnectionCookie();
    return;
  }

  document.cookie = [
    `${adminConnectionCookieName}=${encodeURIComponent(JSON.stringify({
      url: configuration.url,
      autoConnectEditor: configuration.autoConnectEditor,
      editorStartMode: configuration.editorStartMode,
      translationProvider: configuration.translationProvider,
      translationApiEndpoint: configuration.translationApiEndpoint,
      translationApiKeyConfigured: configuration.translationApiKeyConfigured,
      translationApiKeyConfiguredByProvider: configuration.translationApiKeyConfiguredByProvider,
      parcelProviders: configuration.parcelProviders,
      fileStudioAccess: configuration.fileStudioAccess,
      tokenConfigured: configuration.tokenConfigured,
      updatedAt: new Date().toISOString(),
    }))}`,
    "path=/",
    "max-age=2592000",
    "SameSite=Lax",
  ].join("; ");
}

function deleteSharedConnectionCookie() {
  document.cookie = `${adminConnectionCookieName}=; path=/; max-age=0; SameSite=Lax`;
}

function hasAnyTranslationApiKey(keys) {
  return Object.values(keys ?? {}).some(value => typeof value === "string" && value.trim());
}

function readCookieValue(name) {
  const cookie = document.cookie
    .split("; ")
    .find(entry => entry.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : "";
}

function deleteCookie(name) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function encodeBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function decodeBase64(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

async function getAdminSecretsCryptoKey() {
  if (!globalThis.crypto?.subtle) {
    return undefined;
  }

  let keyBytes;
  const savedKey = localStorage.getItem(adminSecretsKeyStorageKey);
  if (savedKey) {
    keyBytes = decodeBase64(savedKey);
  } else {
    keyBytes = new Uint8Array(32);
    crypto.getRandomValues(keyBytes);
    localStorage.setItem(adminSecretsKeyStorageKey, encodeBase64(keyBytes));
  }

  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function getLegacyTranslationApiKeysCryptoKey() {
  if (!globalThis.crypto?.subtle) {
    return undefined;
  }

  const savedKey = localStorage.getItem(legacyAdminTranslationApiKeysKeyStorageKey);
  if (!savedKey) {
    return undefined;
  }

  return crypto.subtle.importKey("raw", decodeBase64(savedKey), { name: "AES-GCM" }, false, ["decrypt"]);
}

async function encryptAdminSecrets(secrets) {
  const cryptoKey = await getAdminSecretsCryptoKey();
  if (!cryptoKey) {
    return "";
  }
  if (!currentAdminDeviceBinding) {
    await restoreAdminDeviceBinding();
  }

  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const payload = new TextEncoder().encode(JSON.stringify({
    ...secrets,
    deviceBinding: currentAdminDeviceBinding,
  }));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, payload);
  return JSON.stringify({
    v: 1,
    alg: "A256GCM",
    binding: currentAdminDeviceBinding
      ? {
          version: currentAdminDeviceBinding.version,
          fingerprint: currentAdminDeviceBinding.bindingFingerprint,
          source: currentAdminDeviceBinding.source,
        }
      : undefined,
    iv: encodeBase64(iv),
    data: encodeBase64(new Uint8Array(encrypted)),
    updatedAt: new Date().toISOString(),
  });
}

async function decryptAdminSecrets(value, { legacy = false } = {}) {
  const payload = JSON.parse(value);
  if (payload?.v !== 1 || payload.alg !== "A256GCM" || typeof payload.iv !== "string" || typeof payload.data !== "string") {
    return undefined;
  }

  const cryptoKey = legacy ? await getLegacyTranslationApiKeysCryptoKey() : await getAdminSecretsCryptoKey();
  if (!cryptoKey) {
    return undefined;
  }

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: decodeBase64(payload.iv) },
    cryptoKey,
    decodeBase64(payload.data),
  );
  const secrets = JSON.parse(new TextDecoder().decode(decrypted));
  if (!validateAdminSecretsDeviceBinding(secrets)) {
    throw new Error("Admin secrets belong to another Atlas Administration instance.");
  }
  return secrets && typeof secrets === "object" ? secrets : undefined;
}

async function persistEncryptedAdminSecretsCookie(secrets) {
  if (!hasAnyAdminSecret(secrets)) {
    deleteCookie(adminSecretsCookieName);
    return;
  }

  try {
    const encryptedSecrets = await encryptAdminSecrets(secrets);
    if (!encryptedSecrets) {
      return;
    }
    document.cookie = [
      `${adminSecretsCookieName}=${encodeURIComponent(encryptedSecrets)}`,
      "path=/",
      `max-age=${longTermCookieMaxAge}`,
      "SameSite=Lax",
    ].join("; ");
  } catch {
    // Keep the current in-memory fields usable if the browser blocks Web Crypto or cookies.
  }
}

async function restoreEncryptedAdminSecretsCookie() {
  const encryptedSecrets = readCookieValue(adminSecretsCookieName);
  if (encryptedSecrets) {
    try {
      applyAdminSecrets(await decryptAdminSecrets(encryptedSecrets));
      return;
    } catch {
      deleteCookie(adminSecretsCookieName);
      adminSaveState.textContent = t("message.secretsInvalidForDevice");
    }
  }

  await restoreLegacyEncryptedTranslationApiKeysCookie();
}

async function restoreLegacyEncryptedTranslationApiKeysCookie() {
  const encryptedKeys = readCookieValue(legacyAdminTranslationApiKeysCookieName);
  if (!encryptedKeys) {
    return;
  }

  try {
    const legacyKeys = await decryptAdminSecrets(encryptedKeys, { legacy: true });
    if (legacyKeys) {
      applyTranslationApiKeys(legacyKeys);
      void persistEncryptedAdminSecretsCookie(readAdminSecrets());
    }
  } catch {
    deleteCookie(legacyAdminTranslationApiKeysCookieName);
  }
}

function saveConnectionSettings() {
  const token = homeAssistantToken.value.trim();
  if (token) {
    rememberAdminToken.checked = true;
  }
  if (autoConnectEditor.checked && !token) {
    adminSaveState.textContent = t("message.autoConnectNeedsToken");
  } else {
    adminSaveState.textContent = token ? t("message.savedWithToken") : t("message.saved");
  }
  persistConfiguration();
}

function restoreConfiguration() {
  try {
    const saved = JSON.parse(localStorage.getItem(adminStorageKey) ?? "null");
    let migratedConfiguration = false;
    if (saved?.language === "de" || saved?.language === "en") {
      currentLanguage = saved.language;
    }
    restoreThemePreference(saved?.themePreference);
    if (typeof saved?.url === "string") {
      homeAssistantUrl.value = saved.url;
    }
    if (typeof saved?.editorStartMode === "string") {
      editorStartMode.value = normalizeEditorStartMode(saved.editorStartMode);
    }
    if (typeof saved?.translationProvider === "string") {
      setTranslationProvider(saved.translationProvider);
    }
    applyParcelProviderSettings(saved?.parcelProviders);
    applyFileStudioAccessSettings(saved?.fileStudioAccess);
    if (Array.isArray(saved?.pluginRepositories)) {
      pluginRepositories = normalizeStoredPluginRepositories(saved.pluginRepositories);
    } else if (typeof saved?.pluginRepositoryUrl === "string" && saved.pluginRepositoryUrl.trim()) {
      pluginRepositories = normalizeStoredPluginRepositories([{ url: saved.pluginRepositoryUrl, type: "plugin" }]);
      migratedConfiguration = true;
    }
    if (saved?.translationApiKeys && typeof saved.translationApiKeys === "object") {
      applyTranslationApiKeys(saved.translationApiKeys);
      void persistEncryptedAdminSecretsCookie(readAdminSecrets());
      delete saved.translationApiKeys;
      migratedConfiguration = true;
    }
    if (saved?.rememberToken === true) {
      rememberAdminToken.checked = true;
      if (typeof saved.token === "string") {
        homeAssistantToken.value = saved.token;
        void persistEncryptedAdminSecretsCookie(readAdminSecrets());
        delete saved.token;
        migratedConfiguration = true;
      }
    }
    if (saved?.autoConnectEditor === true) {
      autoConnectEditor.checked = true;
    }
    if (migratedConfiguration) {
      saved.tokenConfigured = Boolean(homeAssistantToken.value.trim());
      localStorage.setItem(adminStorageKey, JSON.stringify(saved));
    }
  } catch {
    localStorage.removeItem(adminStorageKey);
  }
}

function persistPluginRepositories() {
  try {
    localStorage.setItem(adminPluginRepositoryStorageKey, JSON.stringify(pluginRepositories));
  } catch {
    // Repository previews are optional local Admin state.
  }
}

function restorePluginRepositories() {
  try {
    const saved = localStorage.getItem(adminPluginRepositoryStorageKey);
    if (!saved) {
      return;
    }
    const parsed = saved.trim().startsWith("[") ? JSON.parse(saved) : saved;
    pluginRepositories = normalizeStoredPluginRepositories(Array.isArray(parsed)
      ? parsed
      : [{ url: parsed, type: "plugin" }]);
  } catch {
    localStorage.removeItem(adminPluginRepositoryStorageKey);
  }
}

function normalizeStoredPluginRepositories(repositories) {
  const seen = new Set();
  return repositories
    .map((repository, index) => normalizeStoredPluginRepository(repository, index))
    .filter(Boolean)
    .filter(repository => {
      const key = repository.url.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

function normalizeStoredPluginRepository(repository, index) {
  const url = typeof repository?.url === "string" ? repository.url.trim() : "";
  if (!url) {
    return undefined;
  }
  return {
    id: typeof repository.id === "string" && repository.id.trim()
      ? repository.id.trim()
      : createPluginRepositoryId(url, index),
    name: typeof repository.name === "string" && repository.name.trim() ? repository.name.trim() : "",
    url,
    type: pluginRepositoryTypeValues.includes(repository.type) ? repository.type : "plugin",
    status: typeof repository.status === "string" ? repository.status : "unknown",
    lastChecked: typeof repository.lastChecked === "string" ? repository.lastChecked : "",
    pluginCount: Number.isInteger(repository.pluginCount) ? repository.pluginCount : 0,
    error: typeof repository.error === "string" ? repository.error : "",
  };
}

function createPluginRepositoryId(url, index) {
  const normalizedUrl = url
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
  return normalizedUrl ? `repository-${normalizedUrl}` : `repository-${index + 1}`;
}

function normalizeRepositoryType(value) {
  return pluginRepositoryTypeValues.includes(value) ? value : "plugin";
}

function openPluginRepositoryAddDialog() {
  pendingRepositoryPreview = undefined;
  pluginRepositoryPreviewStatus.textContent = t("message.pluginRepositoryPreviewEmpty");
  pluginRepositoryPreviewList.replaceChildren();
  pluginRepositoryType.value = "plugin";
  if (typeof pluginRepositoryDialog.showModal === "function") {
    pluginRepositoryDialog.showModal();
  } else {
    pluginRepositoryDialog.setAttribute("open", "");
  }
  pluginRepositoryUrl.focus();
}

function closePluginRepositoryAddDialog() {
  if (typeof pluginRepositoryDialog.close === "function") {
    pluginRepositoryDialog.close();
  } else {
    pluginRepositoryDialog.removeAttribute("open");
  }
}

function addPluginRepositoryEntry() {
  const url = normalizePluginRepositoryInputUrl(pluginRepositoryUrl.value);
  if (!url) {
    pluginRepositoryPreviewStatus.textContent = t("message.pluginRepositoryEmpty");
    return;
  }

  if (isPluginRepositoryDuplicateInput(url)) {
    pluginRepositoryPreviewStatus.textContent = t("message.pluginRepositoryDuplicate");
    return;
  }

  const previewMatchesInput = pendingRepositoryPreview
    && normalizePluginRepositoryInputUrl(pendingRepositoryPreview.inputUrl).toLowerCase() === url.toLowerCase()
    && pendingRepositoryPreview.type === normalizeRepositoryType(pluginRepositoryType.value);
  if (!previewMatchesInput) {
    pluginRepositoryPreviewStatus.textContent = t("message.pluginRepositoryPreviewEmpty");
    return;
  }

  pluginRepositories = [
    ...pluginRepositories,
    normalizeStoredPluginRepository({
      url: pendingRepositoryPreview.url,
      type: normalizeRepositoryType(pluginRepositoryType.value),
      name: pendingRepositoryPreview.name,
      pluginCount: pendingRepositoryPreview.plugins.length,
      status: "ready",
      lastChecked: pendingRepositoryPreview.lastChecked,
    }, pluginRepositories.length),
  ].filter(Boolean);
  pluginRepositoryUrl.value = "";
  pendingRepositoryPreview = undefined;
  persistPluginRepositories();
  persistConfiguration();
  renderPluginRepositories();
  pluginRepositoryStatus.textContent = t("message.pluginRepositoryAdded");
  closePluginRepositoryAddDialog();
  void loadPluginRepositoriesPreview();
}

async function previewPluginRepositoryEntry() {
  const inputUrl = pluginRepositoryUrl.value.trim();
  const url = normalizePluginRepositoryInputUrl(inputUrl);
  const type = normalizeRepositoryType(pluginRepositoryType.value);
  pendingRepositoryPreview = undefined;
  pluginRepositoryPreviewList.replaceChildren();

  if (!url) {
    pluginRepositoryPreviewStatus.textContent = t("message.pluginRepositoryEmpty");
    return;
  }

  if (isPluginRepositoryDuplicateInput(url)) {
    pluginRepositoryPreviewStatus.textContent = t("message.pluginRepositoryDuplicate");
    return;
  }

  pluginRepositoryPreviewStatus.textContent = t("message.pluginRepositoryLoading");
  try {
    const { repository, repositoryUrl } = await fetchAtlasPluginRepository(inputUrl);
    const repositoryEntry = normalizeStoredPluginRepository({ url: repositoryUrl, type }, pluginRepositories.length);
    const plugins = normalizePluginRepository(repository, repositoryEntry);
    pendingRepositoryPreview = {
      inputUrl,
      url: repositoryUrl,
      type,
      name: typeof repository.name === "string" && repository.name.trim() ? repository.name.trim() : url,
      lastChecked: new Date().toLocaleString(currentLanguage === "de" ? "de-DE" : "en-US"),
      plugins,
    };
    renderPluginRepositoryDialogPreview(plugins);
    pluginRepositoryPreviewStatus.textContent = t("message.pluginRepositoryPreviewLoaded", {
      count: plugins.length,
      name: pendingRepositoryPreview.name,
    });
  } catch (error) {
    pluginRepositoryPreviewStatus.textContent = t(error?.message === "home-assistant-add-on-repository" || isHomeAssistantAddOnRepositoryUrl(inputUrl)
      ? "message.pluginRepositoryWrongType"
      : "message.pluginRepositoryFailed");
  }
}

function renderPluginRepositoryDialogPreview(plugins) {
  pluginRepositoryPreviewList.replaceChildren();
  if (!plugins.length) {
    const empty = document.createElement("p");
    empty.textContent = t("message.pluginRepositoryEmpty");
    pluginRepositoryPreviewList.append(empty);
    return;
  }

  for (const plugin of plugins) {
    const item = document.createElement("article");
    const title = document.createElement("h3");
    const description = document.createElement("p");
    const meta = document.createElement("p");
    const media = document.createElement("div");

    item.className = "repository-preview-card";
    media.className = "repository-preview-media";
    title.textContent = localizedPluginText(plugin, "name", plugin.id);
    description.textContent = localizedPluginText(plugin, "description", plugin.id);
    meta.textContent = [plugin.version, plugin.packageUrl ? "Package" : "Manifest"].filter(Boolean).join(" · ");
    if (plugin.logoUrl || plugin.iconUrl) {
      const icon = document.createElement("img");
      icon.src = plugin.logoUrl || plugin.iconUrl;
      icon.alt = "";
      media.append(icon);
    }
    item.append(media, title, description, meta);
    pluginRepositoryPreviewList.append(item);
  }
}

function removePluginRepositoryEntry(repositoryId) {
  pluginRepositories = pluginRepositories.filter(repository => repository.id !== repositoryId);
  persistPluginRepositories();
  persistConfiguration();
  renderPluginRepositories();
  void loadPluginRepositoriesPreview();
  pluginRepositoryStatus.textContent = t("message.pluginRepositoryRemoved");
}

function renderPluginRepositories() {
  pluginRepositoryList.replaceChildren();
  if (!pluginRepositories.length) {
    const empty = document.createElement("p");
    empty.textContent = t("message.pluginRepositoryNoEntries");
    pluginRepositoryList.append(empty);
    return;
  }

  for (const repository of pluginRepositories) {
    const item = document.createElement("article");
    const details = document.createElement("div");
    const title = document.createElement("h3");
    const url = document.createElement("p");
    const meta = document.createElement("p");
    const actions = document.createElement("div");
    const removeButton = document.createElement("button");

    item.className = "repository-card";
    details.className = "repository-details";
    actions.className = "action-grid";
    title.textContent = repository.name || t(`type.${repository.type}`);
    url.textContent = repository.url;
    meta.textContent = [
      t(`type.${repository.type}`),
      repository.pluginCount ? `${repository.pluginCount} plugins` : "",
      repository.lastChecked ? repository.lastChecked : "",
      repository.error,
    ].filter(Boolean).join(" · ");
    removeButton.type = "button";
    removeButton.className = "danger-icon-button";
    removeButton.textContent = "🗑";
    removeButton.title = t("button.removeRepository");
    removeButton.setAttribute("aria-label", t("button.removeRepository"));
    removeButton.addEventListener("click", () => removePluginRepositoryEntry(repository.id));

    details.append(title, url, meta);
    actions.append(removeButton);
    item.append(details, actions);
    pluginRepositoryList.append(item);
  }
}

async function loadPluginRepositoriesPreview() {
  repositoryPluginDescriptors = [];
  pluginRepositoryPluginList.replaceChildren();
  renderPluginUpdateStatus({ checking: true });

  if (!pluginRepositories.length) {
    renderPluginRepositories();
    pluginRepositoryStatus.textContent = t("message.pluginRepositoryEmpty");
    renderPluginUpdateStatus();
    return;
  }

  pluginRepositoryStatus.textContent = t("message.pluginRepositoryLoading");
  const nextRepositories = [];
  for (const repositoryEntry of pluginRepositories) {
    try {
      const { repository, repositoryUrl } = await fetchAtlasPluginRepository(repositoryEntry.url);
      const normalizedRepositoryEntry = {
        ...repositoryEntry,
        url: repositoryUrl,
      };
      const plugins = normalizePluginRepository(repository, normalizedRepositoryEntry);
      repositoryPluginDescriptors.push(...plugins);
      nextRepositories.push({
        ...normalizedRepositoryEntry,
        name: typeof repository.name === "string" && repository.name.trim() ? repository.name.trim() : repositoryEntry.name,
        status: "ready",
        lastChecked: new Date().toLocaleString(currentLanguage === "de" ? "de-DE" : "en-US"),
        pluginCount: plugins.length,
        error: "",
      });
    } catch (error) {
      nextRepositories.push({
        ...repositoryEntry,
        status: "failed",
        lastChecked: new Date().toLocaleString(currentLanguage === "de" ? "de-DE" : "en-US"),
        pluginCount: 0,
        error: t(error?.message === "home-assistant-add-on-repository" || isHomeAssistantAddOnRepositoryUrl(repositoryEntry.url)
          ? "message.pluginRepositoryWrongType"
          : "message.pluginRepositoryFailed"),
      });
    }
  }

  repositoryPluginDescriptors = deduplicateRepositoryPlugins(repositoryPluginDescriptors);
  pluginRepositories = nextRepositories;
  persistPluginRepositories();
  persistConfiguration();
  renderPluginRepositories();
  renderPluginRepositoryPreview();
  renderPluginUpdateStatus();
  pluginRepositoryStatus.textContent = t("message.pluginRepositoryLoaded", {
    count: repositoryPluginDescriptors.length,
    countRepositories: pluginRepositories.length,
  });
}

function deduplicateRepositoryPlugins(plugins) {
  const pluginsById = new Map();
  for (const plugin of plugins) {
    const existing = pluginsById.get(plugin.id);
    if (!existing) {
      pluginsById.set(plugin.id, plugin);
      continue;
    }
    const preferred = comparePluginVersions(plugin.version, existing.version) >= 0 ? plugin : existing;
    const fallback = preferred === plugin ? existing : plugin;
    pluginsById.set(plugin.id, {
      ...preferred,
      repositoryName: [...new Set([
        ...String(fallback.repositoryName ?? "").split(",").map(value => value.trim()).filter(Boolean),
        ...String(preferred.repositoryName ?? "").split(",").map(value => value.trim()).filter(Boolean),
      ])].join(", "),
    });
  }
  return [...pluginsById.values()]
    .sort((left, right) => left.name.localeCompare(right.name, currentLanguage === "de" ? "de" : "en", { sensitivity: "base" }));
}

function normalizePluginRepository(repository, repositoryEntry) {
  if (
    !isAtlasPluginRepositoryDocument(repository)
    || !Array.isArray(repository.plugins)
  ) {
    throw new Error(t("message.pluginRepositoryInvalid"));
  }

  return repository.plugins
    .map((plugin, index) => normalizeRepositoryPlugin(plugin, repositoryEntry, index))
    .filter(Boolean);
}

function normalizeRepositoryPlugin(plugin, repositoryEntry, index) {
  if (!isAtlasPluginRepositoryPlugin(plugin)) {
    return undefined;
  }
  const id = typeof plugin.id === "string" && plugin.id.trim()
    ? plugin.id.trim()
    : `repository-plugin-${index + 1}`;
  return {
    id,
    slug: typeof plugin.slug === "string" && plugin.slug.trim() ? plugin.slug.trim() : "",
    name: typeof plugin.name === "string" && plugin.name.trim() ? plugin.name.trim() : id,
    nameI18n: normalizeLocalizedPluginText(plugin.nameI18n),
    version: typeof plugin.version === "string" ? plugin.version : "",
    description: typeof plugin.description === "string" ? plugin.description : "",
    descriptionI18n: normalizeLocalizedPluginText(plugin.descriptionI18n),
    repositoryId: `${repositoryEntry.type}:${repositoryEntry.url}`,
    repositoryName: repositoryEntry.name || repositoryEntry.url,
    repositoryType: repositoryEntry.type,
    repositoryUrl: repositoryEntry.url,
    iconUrl: resolveRepositoryUrl(repositoryEntry.url, plugin.icon),
    logoUrl: resolveRepositoryUrl(repositoryEntry.url, plugin.logo),
    previewUrl: resolveRepositoryUrl(repositoryEntry.url, plugin.preview),
    entry: typeof plugin.entry === "string" ? plugin.entry.trim() : "",
    manifestUrl: resolveRepositoryUrl(repositoryEntry.url, plugin.manifest),
    packageUrl: resolveRepositoryUrl(repositoryEntry.url, plugin.package),
    capabilities: Array.isArray(plugin.capabilities)
      ? plugin.capabilities.filter(capability => typeof capability === "string")
      : [],
    compatibility: normalizeRepositoryPluginCompatibility(plugin.compatibility),
  };
}

function normalizeRepositoryPluginCompatibility(compatibility) {
  if (!compatibility || typeof compatibility !== "object" || Array.isArray(compatibility)) {
    return {};
  }

  return {
    atlas: typeof compatibility.atlas === "string" ? compatibility.atlas : "",
    host: typeof compatibility.host === "string" ? compatibility.host : "",
    homeAssistant: typeof compatibility.homeAssistant === "string" ? compatibility.homeAssistant : "",
  };
}

function formatRepositoryPluginCompatibility(compatibility) {
  const values = [
    compatibility?.atlas ? `ATLAS ${compatibility.atlas}` : "",
    compatibility?.host ? `Host ${compatibility.host}` : "",
    compatibility?.homeAssistant ? `Home Assistant ${compatibility.homeAssistant}` : "",
  ].filter(Boolean);

  return values.length ? values : ["-"];
}

function normalizePluginRepositoryInputUrl(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isPluginRepositoryDuplicateInput(value) {
  const candidates = createPluginRepositoryUrlCandidates(value).map(candidate => candidate.toLowerCase());
  return pluginRepositories.some(repository => candidates.includes(repository.url.toLowerCase()));
}

async function fetchAtlasPluginRepository(inputUrl) {
  const candidates = createPluginRepositoryUrlCandidates(inputUrl);
  for (const repositoryUrl of candidates) {
    try {
      const response = await fetch(createNoCacheUrl(repositoryUrl), {
        cache: "no-store",
      });
      if (!response.ok) {
        continue;
      }
      const repository = await response.json();
      if (isAtlasPluginRepositoryDocument(repository) && Array.isArray(repository.plugins)) {
        return { repository, repositoryUrl };
      }
    } catch {
      // Try the next normalized repository candidate.
    }
  }

  if (await hasHomeAssistantAddOnRepositoryMetadata(inputUrl)) {
    throw new Error("home-assistant-add-on-repository");
  }

  throw new Error("atlas-plugin-repository-not-found");
}

function isAtlasPluginRepositoryDocument(repository) {
  return Boolean(
    repository
    && typeof repository === "object"
    && repository.kind === "atlas.plugin.repository"
    && repository.atlas
    && typeof repository.atlas === "object"
    && repository.atlas.type === "plugin-repository"
    && repository.atlas.schemaVersion === 1,
  );
}

function isAtlasPluginRepositoryPlugin(plugin) {
  return Boolean(
    plugin
    && typeof plugin === "object"
    && plugin.atlas
    && typeof plugin.atlas === "object"
    && plugin.atlas.type === "plugin"
    && plugin.atlas.schemaVersion === 1,
  );
}

function createPluginRepositoryUrlCandidates(inputUrl) {
  const values = [];
  const trimmed = normalizePluginRepositoryInputUrl(inputUrl);
  if (!trimmed) {
    return values;
  }

  values.push(trimmed);
  const githubRepositoryJsonUrl = createGitHubRawRepositoryJsonUrl(trimmed);
  if (githubRepositoryJsonUrl) {
    values.push(githubRepositoryJsonUrl);
  }

  return [...new Set(values)];
}

function createGitHubRawRepositoryJsonUrl(value) {
  try {
    const url = new URL(value);
    if (url.hostname.toLowerCase() !== "github.com") {
      return "";
    }

    const [owner, repository, view, branch, ...pathParts] = url.pathname
      .split("/")
      .filter(Boolean);
    if (!owner || !repository) {
      return "";
    }

    const repositoryName = repository.replace(/\.git$/i, "");
    if (view === "blob" && branch && pathParts.length) {
      return `https://raw.githubusercontent.com/${owner}/${repositoryName}/${branch}/${pathParts.join("/")}`;
    }
    if (view === "tree" && branch) {
      return `https://raw.githubusercontent.com/${owner}/${repositoryName}/${branch}/repository.json`;
    }
    if (!view) {
      return `https://raw.githubusercontent.com/${owner}/${repositoryName}/main/repository.json`;
    }
  } catch {
    return "";
  }

  return "";
}

async function hasHomeAssistantAddOnRepositoryMetadata(inputUrl) {
  for (const metadataUrl of createHomeAssistantRepositoryYamlCandidates(inputUrl)) {
    try {
      const response = await fetch(createNoCacheUrl(metadataUrl), {
        cache: "no-store",
      });
      if (response.ok) {
        const text = await response.text();
        if (/^\s*name\s*:/m.test(text) && /^\s*(url|maintainer)\s*:/m.test(text)) {
          return true;
        }
      }
    } catch {
      // A missing metadata file just means this is not recognized as a Home Assistant add-on repository.
    }
  }
  return false;
}

function createHomeAssistantRepositoryYamlCandidates(inputUrl) {
  const candidates = [];
  const trimmed = normalizePluginRepositoryInputUrl(inputUrl);
  if (!trimmed) {
    return candidates;
  }

  try {
    const url = new URL(trimmed);
    if (url.hostname.toLowerCase() === "github.com") {
      const [owner, repository, view, branch] = url.pathname.split("/").filter(Boolean);
      if (owner && repository) {
        const repositoryName = repository.replace(/\.git$/i, "");
        candidates.push(`https://raw.githubusercontent.com/${owner}/${repositoryName}/${view === "tree" && branch ? branch : "main"}/repository.yaml`);
      }
    } else if (url.hostname.toLowerCase() === "raw.githubusercontent.com") {
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length >= 3) {
        candidates.push(`https://raw.githubusercontent.com/${parts[0]}/${parts[1]}/${parts[2]}/repository.yaml`);
      }
    } else {
      candidates.push(new URL("repository.yaml", url).toString());
    }
  } catch {
    return candidates;
  }

  return [...new Set(candidates)];
}

function isHomeAssistantAddOnRepositoryUrl(value) {
  try {
    const url = new URL(value);
    return url.hostname.toLowerCase() === "github.com"
      && url.pathname.replace(/\/+$/u, "").toLowerCase() === "/rockbaer2007/atlas-homeassistant-addon-repository";
  } catch {
    return false;
  }
}

function resolveRepositoryUrl(repositoryUrl, value) {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }
  try {
    return new URL(value, repositoryUrl).toString();
  } catch {
    return "";
  }
}

function createNoCacheUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    url.searchParams.set("_atlasCacheBust", String(Date.now()));
    return url.toString();
  } catch {
    return value;
  }
}

function findInstalledPlugin(pluginId) {
  return currentPluginDescriptors().find(plugin => plugin.id === pluginId);
}

function findImportedPlugin(pluginId) {
  return importedPluginDescriptors.find(plugin => plugin.id === pluginId);
}

function isRepositoryInstalledPlugin(pluginId) {
  return importedPluginDescriptors.some(plugin => plugin.id === pluginId && plugin.source === "repository");
}

function comparePluginVersions(left, right) {
  const leftValue = typeof left === "string" ? left : "";
  const rightValue = typeof right === "string" ? right : "";

  if (!leftValue && !rightValue) return 0;
  if (leftValue && !rightValue) return 1;
  if (!leftValue && rightValue) return -1;

  return leftValue.localeCompare(rightValue, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function repositoryPluginInstallState(plugin) {
  const installed = findInstalledPlugin(plugin.id);
  const bundled = Boolean(installed && bundledPluginIds.has(plugin.id));
  const installedVersion = installed?.version ?? "";
  const updateAvailable = Boolean(installed && !bundled && comparePluginVersions(plugin.version, installedVersion) > 0);

  return {
    installed,
    bundled,
    installedVersion,
    updateAvailable,
    removable: isRepositoryInstalledPlugin(plugin.id),
  };
}

function readLastPluginUpdateCheck() {
  try {
    const saved = JSON.parse(localStorage.getItem(adminPluginUpdateCheckStorageKey) ?? "null");
    return saved && typeof saved.checkedAt === "string" ? saved : undefined;
  } catch {
    localStorage.removeItem(adminPluginUpdateCheckStorageKey);
    return undefined;
  }
}

function persistLastPluginUpdateCheck(updates) {
  const checkedAt = new Date().toISOString();
  const summary = {
    checkedAt,
    updateCount: updates.length,
    updates: updates.map(update => ({
      id: update.id,
      name: update.name,
      installedVersion: update.installedVersion,
      availableVersion: update.availableVersion,
      repositoryName: update.repositoryName,
    })),
  };
  localStorage.setItem(adminPluginUpdateCheckStorageKey, JSON.stringify(summary));
  return summary;
}

function collectPluginUpdates() {
  return repositoryPluginDescriptors
    .map(plugin => {
      const installState = repositoryPluginInstallState(plugin);
      if (!installState.updateAvailable) {
        return undefined;
      }
      return {
        id: plugin.id,
        name: localizedPluginText(plugin, "name", plugin.id),
        installedVersion: installState.installedVersion,
        availableVersion: plugin.version || "-",
        repositoryName: plugin.repositoryName,
        plugin,
      };
    })
    .filter(Boolean);
}

function renderPluginUpdateStatus(options = {}) {
  pluginUpdateList.replaceChildren();

  if (options.checking) {
    pluginUpdateSummary.textContent = t("message.pluginUpdatesChecking");
    return;
  }

  if (!pluginRepositories.length) {
    pluginUpdateSummary.textContent = t("message.pluginUpdatesNoRepositories");
    return;
  }

  const updates = collectPluginUpdates();
  const savedCheck = persistLastPluginUpdateCheck(updates);
  const checkedAt = formatRuntimeDate(savedCheck.checkedAt);
  pluginUpdateSummary.textContent = updates.length
    ? t("message.pluginUpdatesFound", { count: updates.length, checkedAt })
    : t("message.pluginUpdatesNone", { checkedAt });

  for (const update of updates) {
    const item = document.createElement("div");
    const title = document.createElement("div");
    const reason = document.createElement("div");
    const status = document.createElement("span");

    item.className = "readiness-item";
    title.className = "readiness-title";
    reason.className = "readiness-reason";
    status.className = "readiness-status";
    status.dataset.status = "in-progress";
    title.textContent = update.name;
    reason.textContent = [
      t("message.pluginRepositoryUpdateAvailable", {
        installed: update.installedVersion,
        available: update.availableVersion,
      }),
      update.repositoryName,
    ].filter(Boolean).join(" · ");
    status.textContent = t("button.updateRepositoryPackage");
    item.append(title, reason, status);
    pluginUpdateList.append(item);
  }
}

function renderPersistedPluginUpdateStatus() {
  const savedCheck = readLastPluginUpdateCheck();
  if (!savedCheck) {
    pluginUpdateSummary.textContent = t("message.pluginUpdatesPending");
    pluginUpdateList.replaceChildren();
    return;
  }

  const checkedAt = formatRuntimeDate(savedCheck.checkedAt);
  pluginUpdateSummary.textContent = savedCheck.updateCount
    ? t("message.pluginUpdatesFound", { count: savedCheck.updateCount, checkedAt })
    : t("message.pluginUpdatesNone", { checkedAt });
  pluginUpdateList.replaceChildren();
}

async function fetchRepositoryPluginInstallPackage(plugin) {
  if (plugin.packageUrl) {
    const response = await fetch(createNoCacheUrl(plugin.packageUrl), {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Repository plugin package could not be loaded.");
    }
    return parseRuntimePluginInstallPackage(await response.text());
  }

  if (plugin.manifestUrl) {
    const response = await fetch(createNoCacheUrl(plugin.manifestUrl), {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Repository plugin manifest could not be loaded.");
    }
    return {
      plugin: normalizeRepositoryPluginManifest(await response.json(), plugin),
      files: [],
    };
  }

  throw new Error("Repository plugin has no installable package or manifest.");
}

function normalizeRepositoryPluginManifest(manifest, fallbackPlugin) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new Error("Repository plugin manifest is invalid.");
  }

  const id = typeof manifest.id === "string" && manifest.id.trim() ? manifest.id.trim() : fallbackPlugin.id;
  const name = typeof manifest.name === "string" && manifest.name.trim() ? manifest.name.trim() : fallbackPlugin.name;
  const nameI18n = normalizeLocalizedPluginText(manifest.nameI18n) ?? fallbackPlugin.nameI18n;
  const version = typeof manifest.version === "string" && manifest.version.trim()
    ? manifest.version.trim()
    : fallbackPlugin.version;
  const description = typeof manifest.description === "string" && manifest.description.trim()
    ? manifest.description.trim()
    : fallbackPlugin.description;
  const descriptionI18n = normalizeLocalizedPluginText(manifest.descriptionI18n) ?? fallbackPlugin.descriptionI18n;
  const dependencies = Array.isArray(manifest.dependencies) ? manifest.dependencies : [];
  const extensionPoints = Array.isArray(manifest.extensionPoints)
    ? manifest.extensionPoints.filter(value => typeof value === "string")
    : [];
  const providesSource = Array.isArray(manifest.provides)
    ? manifest.provides
    : Array.isArray(manifest.capabilities)
      ? manifest.capabilities
      : fallbackPlugin.capabilities;

  return {
    id,
    name,
    nameI18n,
    version,
    description,
    descriptionI18n,
    icon: typeof manifest.icon === "string" ? manifest.icon : "",
    logo: typeof manifest.logo === "string" ? manifest.logo : "",
    preview: typeof manifest.preview === "string" ? manifest.preview : "",
    dependencies,
    extensionPoints,
    provides: Array.isArray(providesSource)
      ? providesSource.filter(value => typeof value === "string")
      : [],
  };
}

async function installRepositoryPluginPackage(plugin) {
  const existing = findInstalledPlugin(plugin.id);
  const imported = findImportedPlugin(plugin.id);

  if (existing && imported?.source !== "repository") {
    adminSaveState.textContent = t("message.pluginPackageDuplicate", { name: existing.name });
    return;
  }

  try {
    const installPackage = await fetchRepositoryPluginInstallPackage(plugin);
    const descriptor = installPackage.plugin;
    if (descriptor.id !== plugin.id) {
      throw new Error("Repository plugin id does not match descriptor.");
    }

    const installedPlugin = {
      ...descriptor,
      source: "repository",
      repositoryId: plugin.repositoryId,
      repositoryName: plugin.repositoryName,
      repositoryType: plugin.repositoryType,
      repositoryUrl: plugin.repositoryUrl,
      manifestUrl: plugin.manifestUrl,
      packageUrl: plugin.packageUrl,
      iconUrl: plugin.iconUrl,
      logoUrl: plugin.logoUrl,
      previewUrl: plugin.previewUrl,
      entry: plugin.entry,
      slug: plugin.slug,
      compatibility: plugin.compatibility,
      files: installPackage.files,
      installedAt: new Date().toISOString(),
    };
    const wasInstalled = Boolean(imported);

    importedPluginDescriptors = [
      ...importedPluginDescriptors.filter(entry => entry.id !== descriptor.id),
      installedPlugin,
    ];
    activePluginIds.add(descriptor.id);
    persistImportedPlugins();
    persistPluginState();
    renderPluginRepositoryPreview();
    renderAdministration();
    adminSaveState.textContent = t(
      wasInstalled ? "message.pluginRepositoryPluginUpdated" : "message.pluginRepositoryPluginInstalled",
      { name: descriptor.name },
    );
  } catch {
    adminSaveState.textContent = t("message.pluginRepositoryInstallFailed", { name: localizedPluginText(plugin, "name", plugin.id) });
  }
}

function removeRepositoryPluginPackage(plugin) {
  if (!isRepositoryInstalledPlugin(plugin.id)) {
    return;
  }

  importedPluginDescriptors = importedPluginDescriptors.filter(entry =>
    !(entry.id === plugin.id && entry.source === "repository"),
  );
  activePluginIds.delete(plugin.id);
  persistImportedPlugins();
  persistPluginState();
  renderPluginRepositoryPreview();
  renderAdministration();
  adminSaveState.textContent = t("message.pluginRepositoryPluginRemoved", { name: localizedPluginText(plugin, "name", plugin.id) });
}

function renderPluginRepositoryPreview() {
  pluginRepositoryPluginList.replaceChildren();
  for (const plugin of repositoryPluginDescriptors) {
    const installState = repositoryPluginInstallState(plugin);
    const item = document.createElement("article");
    const header = document.createElement("div");
    const media = document.createElement("div");
    const titleGroup = document.createElement("div");
    const title = document.createElement("h3");
    const description = document.createElement("p");
    const status = document.createElement("span");
    const details = document.createElement("div");
    const actions = document.createElement("div");
    const installButton = document.createElement("button");
    const removeButton = document.createElement("button");

    item.className = "plugin-card";
    header.className = "plugin-header";
    media.className = "plugin-media";
    status.className = "plugin-status";
    details.className = "plugin-details";
    actions.className = "action-grid";

    title.textContent = localizedPluginText(plugin, "name", plugin.id);
    description.textContent = localizedPluginText(plugin, "description", plugin.id);
    if (installState.updateAvailable) {
      status.textContent = t("message.pluginRepositoryUpdateAvailable", {
        installed: installState.installedVersion,
        available: plugin.version || "-",
      });
    } else if (installState.bundled) {
      status.textContent = t("message.pluginRepositoryBundledVersion", {
        version: installState.installedVersion || "-",
      });
    } else if (installState.installed) {
      status.textContent = t("message.pluginRepositoryInstalledVersion", {
        version: installState.installedVersion || "-",
      });
    } else {
      status.textContent = t("message.pluginRepositoryNotInstalled");
    }
    if (plugin.logoUrl || plugin.iconUrl) {
      const icon = document.createElement("img");
      icon.src = plugin.logoUrl || plugin.iconUrl;
      icon.alt = "";
      media.append(icon);
    }
    titleGroup.append(title, description);
    header.append(media, titleGroup, status);
    if (plugin.previewUrl) {
      const preview = document.createElement("img");
      preview.className = "plugin-preview";
      preview.src = plugin.previewUrl;
      preview.alt = "";
      item.append(preview);
    }
    details.append(
      createDetail(t("label.availableVersion"), [plugin.version || "-"]),
      createDetail(t("label.installedVersion"), [
        installState.installed ? installState.installedVersion || "-" : t("message.pluginRepositoryNotInstalled"),
      ]),
      createDetail(t("label.pluginRepositories"), [plugin.repositoryName]),
      createDetail(t("label.pluginRepositoryType"), [t(`type.${plugin.repositoryType}`)]),
      createDetail(t("label.compatibility"), formatRepositoryPluginCompatibility(plugin.compatibility)),
      createDetail(t("label.icon"), [plugin.iconUrl || "-"]),
      createDetail(t("label.logo"), [plugin.logoUrl || "-"]),
      createDetail(t("label.preview"), [plugin.previewUrl || "-"]),
      createDetail("Manifest", [plugin.manifestUrl || "-"]),
      createDetail("Package", [plugin.packageUrl || "-"]),
      createDetail(t("label.capabilities"), plugin.capabilities),
    );
    installButton.type = "button";
    installButton.className = "accent";
    installButton.textContent = installState.updateAvailable
      ? t("button.updateRepositoryPackage")
      : installState.bundled
        ? t("button.bundledRepositoryPackage")
        : t("button.installRepositoryPackage");
    installButton.disabled = installState.bundled
      || Boolean(installState.installed && !installState.removable)
      || Boolean(installState.installed && !installState.updateAvailable)
      || (!plugin.packageUrl && !plugin.manifestUrl);
    if (!plugin.packageUrl && !plugin.manifestUrl) {
      installButton.title = t("message.pluginRepositoryNoPackage");
    }
    installButton.addEventListener("click", () => {
      void installRepositoryPluginPackage(plugin);
    });
    actions.append(installButton);
    if (installState.removable) {
      removeButton.type = "button";
      removeButton.className = "secondary";
      removeButton.textContent = t("button.removeRepositoryPackage");
      removeButton.addEventListener("click", () => removeRepositoryPluginPackage(plugin));
      actions.append(removeButton);
    }
    item.append(header, details, actions);
    pluginRepositoryPluginList.append(item);
  }

  if (!repositoryPluginDescriptors.length) {
    const empty = document.createElement("p");
    empty.textContent = t("message.pluginRepositoryEmpty");
    pluginRepositoryPluginList.append(empty);
  }
}

async function restoreServerConnectionSettings() {
  try {
    const response = await fetch(`${adminConnectionApiPath}?includeSecrets=1`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return;
    }

    const saved = await response.json();
    if (typeof saved.distributionTarget === "string") {
      currentDistributionTarget = normalizeDistributionTarget(saved.distributionTarget);
      applyHomeAssistantConnectionEditMode();
    }
    if (typeof saved.url === "string" && saved.url) {
      homeAssistantUrl.value = saved.url;
    }
    if (
      typeof saved.translationProvider === "string"
      && (normalizeTranslationProvider(saved.translationProvider) !== "none" || currentTranslationProvider() === "none")
    ) {
      setTranslationProvider(saved.translationProvider);
    }
    applyTranslationApiKeys(saved.translationApiKeys);
    applyParcelProviderSettings(saved.parcelProviders);
    applyFileStudioAccessSettings(saved.fileStudioAccess);
    if (typeof saved.token === "string" && saved.token && !homeAssistantToken.value.trim()) {
      homeAssistantToken.value = saved.token;
      rememberAdminToken.checked = true;
    }
    if (typeof saved.rememberToken === "boolean") {
      rememberAdminToken.checked = saved.rememberToken || Boolean(homeAssistantToken.value.trim());
    }
    void persistEncryptedAdminSecretsCookie(readAdminSecrets());
    if (typeof saved.autoConnectEditor === "boolean") {
      autoConnectEditor.checked = saved.autoConnectEditor;
    }
    if (typeof saved.editorStartMode === "string") {
      editorStartMode.value = normalizeEditorStartMode(saved.editorStartMode);
    }
    applyHomeAssistantConnectionEditMode();
    renderAdministration();
  } catch {
    // The Admin server may not have saved settings yet; local settings remain usable.
  }
}

function restoreImportedPlugins() {
  try {
    const saved = JSON.parse(localStorage.getItem(adminPluginStorageKey) ?? "[]");
    const restoredPlugins = Array.isArray(saved)
      ? saved.filter(plugin =>
        plugin
        && typeof plugin.id === "string"
        && typeof plugin.name === "string"
        && typeof plugin.version === "string",
      )
      : [];
    importedPluginDescriptors = removeBundledImportedPlugins(restoredPlugins);
    if (importedPluginDescriptors.length !== restoredPlugins.length) {
      persistImportedPlugins();
    }
  } catch {
    importedPluginDescriptors = [];
    localStorage.removeItem(adminPluginStorageKey);
  }
}

function persistImportedPlugins() {
  localStorage.setItem(adminPluginStorageKey, JSON.stringify(importedPluginDescriptors));
  persistSharedPluginCatalogCookie();
}

function restorePluginState() {
  try {
    const saved = JSON.parse(localStorage.getItem(adminPluginStateStorageKey) ?? "null");
    const savedPluginIds = Array.isArray(saved?.activePluginIds)
      ? saved.activePluginIds.filter(pluginId => typeof pluginId === "string")
      : undefined;
    activePluginIds = new Set(savedPluginIds ?? [HomeAssistantCardEditorPluginId]);
  } catch {
    activePluginIds = new Set([HomeAssistantCardEditorPluginId]);
    localStorage.removeItem(adminPluginStateStorageKey);
  }
}

function persistPluginState() {
  localStorage.setItem(adminPluginStateStorageKey, JSON.stringify({
    activePluginIds: [...activePluginIds],
  }));
  persistSharedPluginCatalogCookie();
}

function currentPluginDescriptors() {
  const pluginsById = new Map();
  for (const plugin of pluginCatalog.list()) {
    pluginsById.set(plugin.id, plugin);
  }
  for (const plugin of importedPluginDescriptors) {
    if (!pluginsById.has(plugin.id)) {
      pluginsById.set(plugin.id, plugin);
    }
  }
  return [...pluginsById.values()];
}

function removeBundledImportedPlugins(plugins) {
  const seen = new Set();
  return plugins.filter(plugin => {
    if (bundledPluginIds.has(plugin.id) || seen.has(plugin.id)) {
      return false;
    }
    seen.add(plugin.id);
    return true;
  });
}

function persistSharedPluginCatalogCookie() {
  const plugins = importedPluginDescriptors
    .filter(plugin => plugin.source === "repository")
    .map(plugin => ({
      id: plugin.id,
      name: plugin.name,
      nameI18n: plugin.nameI18n,
      version: plugin.version,
      description: plugin.description,
      descriptionI18n: plugin.descriptionI18n,
      status: activePluginIds.has(plugin.id) ? "active" : "available",
      capabilities: plugin.capabilities,
      iconUrl: resolvePluginDisplayAssetUrl(plugin, "icon"),
      logoUrl: resolvePluginDisplayAssetUrl(plugin, "logo"),
      previewUrl: resolvePluginDisplayAssetUrl(plugin, "preview"),
      entry: plugin.entry,
      slug: plugin.slug,
    }));

  const encodedCatalog = encodeURIComponent(JSON.stringify({ plugins }));
  document.cookie = `${sharedPluginCatalogCookieName}=${encodedCatalog}; Max-Age=${longTermCookieMaxAge}; Path=/; SameSite=Lax`;
}

function resolvePluginDisplayAssetUrl(plugin, kind) {
  const directUrl = kind === "logo"
    ? plugin.logoUrl
    : kind === "preview"
      ? plugin.previewUrl
      : plugin.iconUrl;
  if (directUrl) {
    return directUrl;
  }

  const assetPath = plugin?.[kind];
  const directory = localPluginAssetDirectories[plugin.id];
  if (typeof assetPath !== "string" || !assetPath.trim() || !directory) {
    return "";
  }

  return `/atlas-plugins/${encodeURIComponent(directory)}/${assetPath}`;
}

function isImportedPlugin(pluginId) {
  return importedPluginDescriptors.some(plugin => plugin.id === pluginId);
}

function translatePluginStatus(status) {
  if (status === "active") return t("text.pluginStatusActive");
  if (status === "disabled") return t("text.pluginStatusDisabled");
  return t("text.pluginStatusAvailable");
}

function translateReleaseStatus(status) {
  if (status === "ready") return t("text.releaseStatusReady");
  if (status === "in-progress") return t("text.releaseStatusInProgress");
  return t("text.releaseStatusPlanned");
}

function translatePluginAction(action) {
  if (action === "activate") return t("button.activate");
  if (action === "deactivate") return t("button.deactivate");
  if (action === "export-package") return t("button.exportPackage");
  return t("button.inspect");
}

function createReadinessItem(entry) {
  const item = document.createElement("div");
  const title = document.createElement("div");
  const reason = document.createElement("div");
  const status = document.createElement("span");

  item.className = "readiness-item";
  title.className = "readiness-title";
  reason.className = "readiness-reason";
  status.className = "readiness-status";
  status.dataset.status = entry.status;

  title.textContent = t(`release.${entry.id}.label`) === `release.${entry.id}.label`
    ? entry.label
    : t(`release.${entry.id}.label`);
  reason.textContent = t(`release.${entry.id}.reason`) === `release.${entry.id}.reason`
    ? entry.reason
    : t(`release.${entry.id}.reason`);
  status.textContent = translateReleaseStatus(entry.status);

  item.append(title, reason, status);
  return item;
}

function renderAppReleaseReadiness() {
  const readiness = createHomeAssistantCardEditorAppReleaseReadiness();

  appReleaseSummary.textContent = t("message.appReleaseSummary", readiness.summary);
  appReleaseChecks.replaceChildren(
    ...readiness.checks.map(check => createReadinessItem(check)),
  );
  appReleaseTargets.replaceChildren(
    ...readiness.targets.map(target => createReadinessItem(target)),
  );
}

function formatRuntimeDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(currentLanguage === "de" ? "de-DE" : "en-US", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

function translateRuntimeStatus(ready) {
  return ready ? t("text.runtimeReady") : t("text.runtimeUnavailable");
}

function createRuntimeSurfaceItem(id, surface) {
  const item = document.createElement("div");
  const title = document.createElement("div");
  const reason = document.createElement("div");
  const status = document.createElement("span");
  const labelKey = id === "administration" ? "label.adminUrl" : "label.editorUrl";

  item.className = "readiness-item";
  title.className = "readiness-title";
  reason.className = "readiness-reason";
  status.className = "readiness-status";
  status.dataset.status = surface.ready ? "ready" : "planned";

  title.textContent = t(labelKey);
  reason.textContent = surface.ready
    ? t("message.runtimeSurfaceReady", { port: surface.port })
    : t("message.runtimeSurfaceUnavailable", { port: surface.port });
  status.textContent = translateRuntimeStatus(surface.ready);

  item.append(title, reason, status);
  return item;
}

function createRuntimeLink(label, url) {
  const item = document.createElement("div");
  const title = document.createElement("span");
  const link = document.createElement("a");

  item.className = "runtime-link";
  title.textContent = label;
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = url;

  item.append(title, link);
  return item;
}

function renderAppRuntimeStatus(runtime) {
  lastAppRuntime = runtime;

  if (!runtime) {
    appRuntimeSummary.textContent = t("message.appRuntimeUnavailable");
    appRuntimeStatus.textContent = "";
    appRuntimeSurfaces.replaceChildren();
    appRuntimeLinks.replaceChildren();
    appRuntimeDistribution.replaceChildren();
    applyHomeAssistantConnectionEditMode();
    return;
  }

  const surfaces = runtime.surfaces ?? {};
  currentDistributionTarget = normalizeDistributionTarget(runtime.distribution?.current);
  applyHomeAssistantConnectionEditMode();
  appRuntimeSummary.textContent = t("message.appRuntimeSummary", {
    name: runtime.name ?? "ATLAS",
    version: runtime.version ?? "-",
    status: runtime.status ?? "-",
    startedAt: formatRuntimeDate(runtime.startedAt),
  });
  appRuntimeStatus.textContent = "";
  appRuntimeSurfaces.replaceChildren(
    ...Object.entries(surfaces).map(([id, surface]) => createRuntimeSurfaceItem(id, surface)),
  );
  appRuntimeLinks.replaceChildren(
    createRuntimeLink(t("label.appUrl"), runtime.urls?.app ?? appRuntimeApiUrl),
    createRuntimeLink(t("label.adminUrl"), runtime.urls?.admin ?? editorOrigin.replace(":4174", ":4175")),
    createRuntimeLink(t("label.editorUrl"), runtime.urls?.editor ?? editorOrigin),
    createRuntimeLink(t("label.healthUrl"), runtime.urls?.health ?? appRuntimeApiUrl.replace("/app", "/health")),
  );
  appRuntimeDistribution.replaceChildren(
    ...(runtime.distribution?.order ?? []).map(target => {
      const chip = document.createElement("span");
      const translationKey = `release.${target}.label`;
      const translated = t(translationKey);
      chip.textContent = translated === translationKey ? target : translated;
      return chip;
    }),
  );
}

async function loadAppRuntimeStatus() {
  appRuntimeSummary.textContent = t("message.appRuntimeLoading");
  appRuntimeStatus.textContent = "";

  try {
    const response = await fetch(appRuntimeApiUrl, { cache: "no-store" });
    renderAppRuntimeStatus(await response.json());
  } catch {
    renderAppRuntimeStatus(undefined);
  }
}

function createDetail(label, values) {
  const detail = document.createElement("div");
  const caption = document.createElement("div");
  const chips = document.createElement("div");
  caption.className = "detail-label";
  chips.className = "chip-list";
  caption.textContent = label;

  for (const value of values) {
    const chip = document.createElement("span");
    chip.textContent = value;
    chips.append(chip);
  }

  detail.append(caption, chips);
  return detail;
}

function downloadTextFile(filename, content, type) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([content], { type }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function createSecretSummary(secrets) {
  return {
    tokenConfigured: Boolean(secrets.token?.trim()),
    translationApiKeyConfiguredByProvider: Object.fromEntries(
      Object.entries(secrets.translationApiKeys ?? {}).map(([provider, key]) => [provider, Boolean(key?.trim())]),
    ),
  };
}

async function createAdminSettingsExport() {
  const secrets = readAdminSecrets();
  const encryptedSecretText = hasAnyAdminSecret(secrets) ? await encryptAdminSecrets(secrets) : "";
  const encryptedSecrets = encryptedSecretText ? JSON.parse(encryptedSecretText) : undefined;
  return {
    kind: "atlas.administration.settings",
    version: 1,
    exportedAt: new Date().toISOString(),
    encryption: {
      secrets: encryptedSecrets
        ? "aes-gcm-browser-local-admin-key"
        : "none",
      deviceBinding: currentAdminDeviceBinding
        ? {
            version: currentAdminDeviceBinding.version,
            fingerprint: currentAdminDeviceBinding.bindingFingerprint,
            source: currentAdminDeviceBinding.source,
          }
        : undefined,
      note: "Encrypted secrets can be restored by the same browser profile while the local Admin encryption key and Atlas Admin instance binding match.",
    },
    settings: {
      language: currentLanguage,
      url: homeAssistantUrl.value.trim(),
      editorStartMode: normalizeEditorStartMode(editorStartMode.value),
      translationProvider: currentTranslationProvider(),
      translationApiEndpoint: defaultTranslationApiEndpoint,
      parcelProviders: readParcelProviderSettings(),
      fileStudioAccess: readFileStudioAccessSettings(),
      rememberToken: rememberAdminToken.checked,
      autoConnectEditor: autoConnectEditor.checked,
    },
    plugins: {
      activePluginIds: [...activePluginIds],
      importedPluginDescriptors,
    },
    secretSummary: createSecretSummary(secrets),
    ...(encryptedSecrets ? { encryptedSecrets } : {}),
  };
}

async function exportAdministrationSettings() {
  persistConfiguration();
  const settingsExport = await createAdminSettingsExport();
  downloadTextFile(
    "atlas-admin-settings.json",
    JSON.stringify(settingsExport, null, 2),
    "application/json",
  );
  adminSaveState.textContent = t("message.settingsExported");
}

function createEditorConnectionHandoff() {
  const provider = currentTranslationProvider();
  const translationApiKeyConfiguredByProvider = createTranslationApiKeyConfiguredByProvider();
  return {
    type: "atlas.admin.connection.v1",
    url: homeAssistantUrl.value.trim(),
    token: homeAssistantToken.value,
    autoConnect: autoConnectEditor.checked,
    editorStartMode: normalizeEditorStartMode(editorStartMode.value),
    translationProvider: provider,
    translationApiEndpoint: defaultTranslationApiEndpoint,
    translationApiKeyConfigured: translationApiKeyConfiguredByProvider[provider] === true,
    translationApiKeyConfiguredByProvider,
    parcelProviders: readParcelProviderSettings(),
    sentAt: new Date().toISOString(),
  };
}

function postEditorConnectionHandoff(editorWindow) {
  if (!editorWindow) {
    return false;
  }

  editorWindow.postMessage(createEditorConnectionHandoff(), editorOrigin);
  return true;
}

function openEditorWithConnectionHandoff() {
  persistConfiguration();
  adminSaveState.textContent = homeAssistantToken.value
    ? t("message.editorOpened")
    : t("message.editorOpenedWithoutToken");
  window.location.assign(createHubNavigationUrl());
}

function createEditorNavigationUrl() {
  const search = new URLSearchParams();
  search.set("atlasAdminHandoff", "1");
  search.set("theme", currentThemePreference);
  return createPortNavigationUrl(4174, "/", search.toString(), `${editorOrigin}/?${search.toString()}`);
}

function createHubNavigationUrl() {
  return appendThemeSearch(lastAppRuntime?.urls?.hub) || createPortNavigationUrl(4176, "/hub", createThemeSearch());
}

function createPluginNavigationUrl(plugin) {
  const entry = typeof plugin?.entry === "string" ? plugin.entry.trim() : "";
  if (plugin.id === HomeAssistantCardEditorPluginId || entry === "editor") {
    return createEditorNavigationUrl();
  }
  if (entry === "admin") {
    return appendThemeSearch(lastAppRuntime?.urls?.admin) || createPortNavigationUrl(4175, "/", createThemeSearch());
  }
  if (!entry) {
    return "";
  }

  try {
    const appUrl = new URL(lastAppRuntime?.urls?.app ?? createPortNavigationUrl(4176, "/"), window.location.href);
    appUrl.pathname = "/";
    appUrl.search = "";
    appUrl.hash = "";
    const pluginUrl = new URL(entry.replace(/^\/+/, ""), appUrl);
    pluginUrl.searchParams.set("theme", currentThemePreference);
    return pluginUrl.toString();
  } catch {
    return "";
  }
}

function createPluginSidebarIcon(plugin) {
  if (plugin.id === HomeAssistantCardEditorPluginId) return "mdi:view-dashboard-edit";
  if (plugin.id === FileStudioPluginId) return "mdi:file-document-edit";
  return "mdi:puzzle";
}

function openSidebarPluginEntryDialog() {
  renderSidebarPluginEntries();
  if (typeof sidebarPluginDialog.showModal === "function") {
    sidebarPluginDialog.showModal();
  } else {
    sidebarPluginDialog.setAttribute("open", "");
  }
}

function shouldOpenSidebarPluginEntryDialog() {
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get("sidebar") === "plugins"
      || url.searchParams.get("dialog") === "plugin-sidebar"
      || url.hash === "#plugin-sidebar";
  } catch {
    return false;
  }
}

function closeSidebarPluginEntryDialog() {
  sidebarPluginDialog.close?.();
  sidebarPluginDialog.removeAttribute("open");
}

function renderSidebarPluginEntries() {
  sidebarPluginList.replaceChildren();
  const plugins = currentPluginDescriptors()
    .slice()
    .sort((left, right) => (left.order ?? 999) - (right.order ?? 999) || localizedPluginText(left, "name", left.id).localeCompare(localizedPluginText(right, "name", right.id)));

  for (const plugin of plugins) {
    sidebarPluginList.append(createSidebarPluginEntry(plugin));
  }
}

function createSidebarPluginEntry(plugin) {
  const card = document.createElement("article");
  const body = document.createElement("div");
  const title = document.createElement("div");
  const meta = document.createElement("div");
  const yamlLabel = document.createElement("span");
  const yaml = document.createElement("pre");
  const yamlCode = document.createElement("code");
  const action = document.createElement("button");
  const name = localizedPluginText(plugin, "name", plugin.id);
  const url = createPluginNavigationUrl(plugin);
  const icon = createPluginSidebarIcon(plugin);
  const panelId = createPanelIframeId(plugin, name);
  const panelIframeYaml = url ? createPanelIframeYaml({ panelId, name, url, icon }) : "";
  const status = activePluginIds.has(plugin.id) ? t("text.pluginStatusActive") : translatePluginStatus(plugin.status);

  card.className = "sidebar-plugin-card";
  title.className = "sidebar-plugin-title";
  meta.className = "sidebar-plugin-meta";
  yamlLabel.className = "sidebar-plugin-yaml-label";
  yaml.className = "sidebar-plugin-yaml";
  title.textContent = name;
  meta.append(
    createTextLine(`${status} · ${plugin.version}`),
    createTextLine(url || t("message.sidebarPluginUnavailable")),
    createTextLine(icon),
  );
  yamlLabel.textContent = t("label.sidebarYaml");
  yamlCode.textContent = panelIframeYaml;
  yaml.append(yamlCode);
  action.type = "button";
  action.className = "accent";
  action.textContent = t("button.prepareSidebarPlugin");
  action.disabled = !url;
  action.addEventListener("click", () => copySidebarPluginEntry({ name, url, icon, panelId, panelIframeYaml }));

  body.append(title, meta);
  if (panelIframeYaml) {
    body.append(yamlLabel, yaml);
  }
  card.append(body, action);
  return card;
}

function createTextLine(text) {
  const line = document.createElement("span");
  line.textContent = text;
  return line;
}

async function copySidebarPluginEntry({ name, url, icon, panelId, panelIframeYaml }) {
  const text = panelIframeYaml || createPanelIframeYaml({ panelId, name, url, icon });

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const fallback = document.createElement("textarea");
    fallback.value = text;
    fallback.className = "visually-hidden";
    document.body.append(fallback);
    fallback.select();
    document.execCommand("copy");
    fallback.remove();
  }

  adminSaveState.textContent = t("message.sidebarPluginCopied", { name });
}

function createPanelIframeId(plugin, name) {
  const source = plugin?.id || name || "atlas_plugin";
  const suffix = String(source)
    .toLowerCase()
    .replace(/^atlas\.plugin\./, "atlas_")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return suffix || "atlas_plugin";
}

function createPanelIframeYaml({ panelId, name, url, icon }) {
  return [
    "panel_iframe:",
    `  ${panelId}:`,
    `    title: "${escapeYamlDoubleQuotedString(name)}"`,
    `    url: "${escapeYamlDoubleQuotedString(url)}"`,
    `    icon: "${escapeYamlDoubleQuotedString(icon)}"`,
  ].join("\n");
}

function escapeYamlDoubleQuotedString(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function createThemeSearch() {
  const search = new URLSearchParams();
  search.set("theme", currentThemePreference);
  return search.toString();
}

function appendThemeSearch(value) {
  if (!value) return undefined;
  try {
    const url = new URL(value, window.location.href);
    url.searchParams.set("theme", currentThemePreference);
    return url.toString();
  } catch {
    return value;
  }
}

function createPortOrigin(port) {
  try {
    const url = new URL(window.location.href);
    url.port = String(port);
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url.origin;
  } catch {
    return "";
  }
}

function createPortNavigationUrl(port, pathname = "/", search = "", fallback = "") {
  try {
    const navigationUrl = new URL(window.location.href);
    navigationUrl.port = String(port);
    navigationUrl.pathname = pathname;
    navigationUrl.search = search;
    navigationUrl.hash = "";
    return navigationUrl.toString();
  } catch {
    return fallback;
  }
}

function receiveEditorReady(event) {
  if (event.origin !== editorOrigin || event.data?.type !== "atlas.editor.ready.v1") {
    return;
  }

  lastEditorWindow = event.source;
  adminSaveState.textContent = t("message.editorReady");
  postEditorConnectionHandoff(lastEditorWindow);
}

function handlePluginAction(action, plugin) {
  const pluginName = localizedPluginText(plugin, "name", plugin.id);
  if (action === "activate") {
    activePluginIds.add(plugin.id);
    persistPluginState();
    adminSaveState.textContent = t("message.pluginActivated", { name: pluginName });
    renderAdministration();
    return;
  }

  if (action === "deactivate") {
    activePluginIds.delete(plugin.id);
    persistPluginState();
    adminSaveState.textContent = t("message.pluginDeactivated", { name: pluginName });
    renderAdministration();
    return;
  }

  if (action === "export-package") {
    const pluginPackage = createPluginInstallPackage(plugin);
    downloadTextFile(pluginPackage.filename, JSON.stringify(pluginPackage, null, 2), "application/json");
    adminSaveState.textContent = t("message.pluginPackageExported", { name: pluginName });
    return;
  }

  adminSaveState.textContent = t("message.pluginInspected", {
    name: pluginName,
    points: plugin.extensionPoints.length,
    capabilities: plugin.provides.length,
  });
}

function createPluginInstallPackage(plugin) {
  if (plugin.id === HomeAssistantCardEditorPluginId) {
    return createHomeAssistantCardEditorPluginInstallPackage();
  }

  if (plugin.id === FileStudioPluginId) {
    return createFileStudioPluginInstallPackage();
  }

  return createRuntimePluginInstallPackage({ plugin });
}

function removeImportedPluginPackage(plugin) {
  if (!isImportedPlugin(plugin.id)) {
    return;
  }

  importedPluginDescriptors = importedPluginDescriptors.filter(entry => entry.id !== plugin.id);
  activePluginIds.delete(plugin.id);
  persistImportedPlugins();
  persistPluginState();
  renderAdministration();
  adminSaveState.textContent = t("message.pluginPackageRemoved", { name: localizedPluginText(plugin, "name", plugin.id) });
}

async function importSelectedPluginPackage() {
  const file = pluginPackageFile.files?.[0];
  if (!file) {
    return;
  }

  try {
    const installPackage = parseRuntimePluginInstallPackage(await file.text());
    const plugin = installPackage.plugin;
    const existing = currentPluginDescriptors().find(entry => entry.id === plugin.id);

    if (existing) {
      adminSaveState.textContent = t("message.pluginPackageDuplicate", { name: existing.name });
      return;
    }

    importedPluginDescriptors = [...importedPluginDescriptors, plugin];
    persistImportedPlugins();
    renderAdministration();
    adminSaveState.textContent = t("message.pluginPackageImported", { name: localizedPluginText(plugin, "name", plugin.id) });
  } catch {
    adminSaveState.textContent = t("message.pluginPackageImportFailed");
  } finally {
    pluginPackageFile.value = "";
  }
}

function renderAdministration() {
  const view = createRuntimePluginAdministrationView({
    plugins: currentPluginDescriptors(),
    activePluginIds: [...activePluginIds],
  });
  pluginSummary.textContent = t("message.pluginSummary", view.summary);
  policySummary.textContent = t("message.policySummary", {
    url: homeAssistantUrl.value.trim() || "-",
    websocket: currentWebSocketPath(),
  });
  renderAppReleaseReadiness();
  pluginList.replaceChildren();

  for (const plugin of view.plugins) {
    const item = document.createElement("article");
    const header = document.createElement("div");
    const media = document.createElement("div");
    const titleGroup = document.createElement("div");
    const title = document.createElement("h3");
    const description = document.createElement("p");
    const status = document.createElement("span");
    const details = document.createElement("div");
    const actions = document.createElement("div");

    item.className = "plugin-card";
    header.className = "plugin-header";
    media.className = "plugin-media";
    status.className = "plugin-status";
    details.className = "plugin-details";
    actions.className = "action-grid";

    title.textContent = localizedPluginText(plugin, "name", plugin.id);
    description.textContent = localizedPluginText(plugin, "description", plugin.id);
    status.textContent = translatePluginStatus(plugin.status);
    const displayAssetUrl = resolvePluginDisplayAssetUrl(plugin, "logo")
      || resolvePluginDisplayAssetUrl(plugin, "icon");
    if (displayAssetUrl) {
      const image = document.createElement("img");
      image.src = displayAssetUrl;
      image.alt = "";
      media.append(image);
    }
    titleGroup.append(title, description);
    header.append(media, titleGroup, status);

    details.append(
      createDetail(t("label.version"), [plugin.version]),
      createDetail(t("label.logo"), [resolvePluginDisplayAssetUrl(plugin, "logo") || "-"]),
      createDetail(t("label.extensionPoints"), plugin.extensionPoints),
      createDetail(t("label.capabilities"), plugin.provides),
    );

    for (const action of plugin.actions) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = translatePluginAction(action);
      button.addEventListener("click", () => handlePluginAction(action, plugin));
      actions.append(button);
    }

    if (isImportedPlugin(plugin.id)) {
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "secondary";
      removeButton.textContent = t("button.removeImportedPackage");
      removeButton.addEventListener("click", () => removeImportedPluginPackage(plugin));
      actions.append(removeButton);
    }

    item.append(header, details, actions);
    pluginList.append(item);
  }
}

function setLanguage(language) {
  currentLanguage = language === "de" ? "de" : "en";
  applyTranslations();
  renderParcelProviders();
  renderPluginRepositories();
  renderPluginRepositoryPreview();
  renderPersistedPluginUpdateStatus();
  renderAdministration();
  renderAppRuntimeStatus(lastAppRuntime);
  persistConfiguration();
}

void initializeAdministration();

async function initializeAdministration() {
  restoreConfiguration();
  restoreThemePreference(currentThemePreference);
  if (!pluginRepositories.length) {
    restorePluginRepositories();
  }
  await restoreAdminDeviceBinding();
  await restoreEncryptedAdminSecretsCookie();
  restoreImportedPlugins();
  restorePluginState();
  persistSharedPluginCatalogCookie();
  if (
    (rememberAdminToken.checked && homeAssistantToken.value.trim())
    || hasAnyTranslationApiKey(readTranslationApiKeys())
  ) {
    persistConfiguration();
  }
  applyTranslations();
  renderParcelProviders();
  renderPluginRepositories();
  renderPluginRepositoryPreview();
  renderPersistedPluginUpdateStatus();
  renderAdministration();
  pluginRepositoryStatus.textContent = t("message.pluginRepositoryEmpty");
  void loadPluginRepositoriesPreview();
  void loadAppRuntimeStatus();
  void restoreServerConnectionSettings();
  if (shouldOpenSidebarPluginEntryDialog()) {
    openSidebarPluginEntryDialog();
  }
}

for (const button of languageButtons) {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
}

for (const button of themeButtons) {
  button.addEventListener("click", () => setThemePreference(button.dataset.themeMode));
}

window.matchMedia?.("(prefers-color-scheme: dark)")?.addEventListener("change", () => {
  if (currentThemePreference === "auto") {
    applyThemePreference();
  }
});

homeAssistantUrl.addEventListener("input", () => {
  renderAdministration();
  persistConfiguration();
});

for (const input of translationProviderInputs) {
  input.addEventListener("change", persistConfiguration);
}
for (const input of Object.values(translationApiKeyInputs)) {
  input?.addEventListener("input", persistConfiguration);
}

homeAssistantToken.addEventListener("input", () => {
  if (rememberAdminToken.checked) {
    persistConfiguration();
  }
});

editorStartMode.addEventListener("change", persistConfiguration);
allowAddonsPath.addEventListener("change", persistConfiguration);
for (const input of fileStudioPathAccessInputs) {
  input.addEventListener("change", () => {
    if (input.dataset.fileStudioPathAccess === "addons") {
      allowAddonsPath.checked = input.checked;
    }
    persistConfiguration();
  });
}

rememberAdminToken.addEventListener("change", () => {
  if (!rememberAdminToken.checked) {
    homeAssistantToken.value = "";
    autoConnectEditor.checked = false;
  }
  persistConfiguration();
});

autoConnectEditor.addEventListener("change", () => {
  if (autoConnectEditor.checked) {
    rememberAdminToken.checked = true;
    if (!homeAssistantToken.value.trim()) {
      adminSaveState.textContent = t("message.autoConnectNeedsToken");
    }
  }
  persistConfiguration();
});

window.addEventListener("message", receiveEditorReady);

saveAdminSettings.addEventListener("click", saveConnectionSettings);
refreshAppRuntime.addEventListener("click", () => {
  void loadAppRuntimeStatus();
});

exportAdminSettings.addEventListener("click", () => {
  void exportAdministrationSettings();
});

openCardEditor.addEventListener("click", openEditorWithConnectionHandoff);
openSidebarPluginDialog?.addEventListener("click", openSidebarPluginEntryDialog);
closeSidebarPluginDialog.addEventListener("click", closeSidebarPluginEntryDialog);
importPluginPackage.addEventListener("click", () => pluginPackageFile.click());
pluginPackageFile.addEventListener("change", importSelectedPluginPackage);
openPluginRepositoryDialog.addEventListener("click", openPluginRepositoryAddDialog);
pluginRepositoryUrl.addEventListener("input", () => {
  persistConfiguration();
});
pluginRepositoryUrl.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    void previewPluginRepositoryEntry();
  }
});
pluginRepositoryType.addEventListener("change", persistConfiguration);
addPluginRepository.addEventListener("click", addPluginRepositoryEntry);
previewPluginRepository.addEventListener("click", () => {
  void previewPluginRepositoryEntry();
});
closePluginRepositoryDialog.addEventListener("click", closePluginRepositoryAddDialog);
refreshPluginRepositories.addEventListener("click", () => {
  void loadPluginRepositoriesPreview();
});
refreshPluginUpdates.addEventListener("click", () => {
  void loadPluginRepositoriesPreview();
});

forgetAdminToken.addEventListener("click", () => {
  homeAssistantToken.value = "";
  rememberAdminToken.checked = false;
  autoConnectEditor.checked = false;
  persistConfiguration();
  adminSaveState.textContent = t("message.tokenForgotten");
});
