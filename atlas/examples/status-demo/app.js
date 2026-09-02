import {
  createThemeTokens,
} from "@atlas/theme";
import {
  createHomeAssistantStatusPanel,
  createHomeAssistantCardExportPackage,
  createHomeAssistantCardExportPayload,
  createHomeAssistantEntityState,
  createHomeAssistantConnectionConfiguration,
  createBrowserHomeAssistantWebSocket,
  createHomeAssistantRuntimeConnection,
  analyzeHomeAssistantCardEditorSurface,
  arrangeHomeAssistantCardEditorSurfaceFields,
  createHomeAssistantCardEditorConfiguration,
  createHomeAssistantCardEditorHacsBundle,
  createHomeAssistantCardEditorHacsBundleArchive,
  createHomeAssistantCardEditorPackagePlan,
  createHomeAssistantCardEditorScriptExport,
  createHomeAssistantCardEditorFieldFromTemplate,
  createHomeAssistantAtlasFrontendIntegrationPlan,
  createHomeAssistantCardEditorFrontendIntegrationPlan,
  decideHomeAssistantCardArtifactImport,
  formatHomeAssistantCardArtifactReviewLines,
  serializeHomeAssistantCardEditorFrontendResourceReferences,
  serializeHomeAssistantAtlasFrontendResourceReferences,
  createHomeAssistantEntityPresentation,
  createHomeAssistantEntityCatalog,
  createHomeAssistantCardConfiguration,
  createHomeAssistantPanelGroup,
  createHomeAssistantServiceCommand,
  createHomeAssistantStatusPanelRegistry,
  createHomeAssistantCardEditorProblemReport,
  createHomeAssistantCardEditorProblemReportPreviewText,
  createHomeAssistantCardEditorProblemReportIssueUrl,
  filterHomeAssistantEntityCatalog,
  listHomeAssistantEntityCatalogDomains,
  listHomeAssistantEntityDomainShortcuts,
  listHomeAssistantBubbleButtonTypes,
  normalizeHomeAssistantCardEditorScriptFilename,
  createInMemoryHomeAssistantEntityStateTransport,
  convertHomeAssistantCardModStylesToUixStyle,
  inspectHomeAssistantCardDependency,
  inspectHomeAssistantCardDependencyAvailability,
  inspectHomeAssistantCardStyleBlocks,
  inspectHomeAssistantCardEditorHacsBundleArchive,
  formatHomeAssistantCardEditorHacsBundlePackageReadinessReviewLines,
  readHomeAssistantCardEditorHacsBundleArchivePackage,
  listHomeAssistantCardEditorTemplates,
  listHomeAssistantCardTargets,
  serializeHomeAssistantEntitiesCardConfiguration,
  summarizeHomeAssistantCardImport,
  deriveHomeAssistantWebSocketUrl,
  findHomeAssistantStatusPanel,
  inspectHomeAssistantConnectionReadiness,
  bindHomeAssistantEntityStatusPanel,
  sanitizeHomeAssistantCardEditorDebugUrl,
} from "@atlas/homeassistant";

const statusRoot = document.querySelector("#atlas-status-root");
const statusMessage = document.querySelector("#status-message");
const selectedEntitiesPanel = document.querySelector("#selected-entities-panel");
const buttons = Array.from(document.querySelectorAll("[data-entity-state]"));
const languageButtons = Array.from(document.querySelectorAll("[data-language]"));
const themeButtons = Array.from(document.querySelectorAll("[data-theme-mode]"));
const openProblemReport = document.querySelector("#open-problem-report");
const problemReportBackdrop = document.querySelector("#problem-report-backdrop");
const closeProblemReport = document.querySelector("#close-problem-report");
const problemReportPreview = document.querySelector("#problem-report-preview");
const copyProblemReport = document.querySelector("#copy-problem-report");
const openProblemIssue = document.querySelector("#open-problem-issue");
const problemReportStatus = document.querySelector("#problem-report-status");
const homeAssistantUrl = document.querySelector("#home-assistant-url");
const homeAssistantConnectionDetails = document.querySelector("#home-assistant-connection-details");
const homeAssistantConnectionSummary = document.querySelector("#home-assistant-connection-summary");
const connectionWarning = document.querySelector("#connection-warning");
const connectionReadiness = document.querySelector("#connection-readiness");
const connectionState = document.querySelector("#connection-state");
const entitySyncState = document.querySelector("#entity-sync-state");
const adminHandoffState = document.querySelector("#admin-handoff-state");
const adminTranslationModuleState = document.querySelector("#admin-translation-module-state");
const openAdminLinks = Array.from(document.querySelectorAll("[data-open-admin]"));
const openHubLinks = Array.from(document.querySelectorAll("[data-open-hub]"));
const connectButton = document.querySelector("#connect-home-assistant");
const disconnectButton = document.querySelector("#disconnect-home-assistant");
const homeAssistantEntity = document.querySelector("#home-assistant-entity");
const homeAssistantEntityDomain = document.querySelector("#home-assistant-entity-domain");
const homeAssistantEntityDomainShortcuts = document.querySelector("#home-assistant-entity-domain-shortcuts");
const homeAssistantEntitySearch = document.querySelector("#home-assistant-entity-search");
const clearHomeAssistantEntitySearch = document.querySelector("#clear-home-assistant-entity-search");
const homeAssistantEntityPicker = document.querySelector("#home-assistant-entity-picker");
const homeAssistantEntityPickerStatus = document.querySelector("#home-assistant-entity-picker-status");
const addHomeAssistantEntity = document.querySelector("#add-home-assistant-entity");
const refreshHomeAssistantEntities = document.querySelector("#refresh-home-assistant-entities");
const simpleEntityControls = document.querySelector("#simple-entity-controls");
const homeAssistantGroup = document.querySelector("#home-assistant-group");
const homeAssistantGroupName = document.querySelector("#home-assistant-group-name");
const haCardTarget = document.querySelector("#ha-card-target");
const haCardLayout = document.querySelector("#ha-card-layout");
const haCardFormat = document.querySelector("#ha-card-format");
const cardStyleExportControl = document.querySelector("#card-style-export-control");
const haCardStyleExport = document.querySelector("#ha-card-style-export");
const haCardScriptFilename = document.querySelector("#ha-card-script-filename");
const cardExportLanguageInputs = Array.from(document.querySelectorAll("[data-card-export-language]"));
const cardAutoTranslate = document.querySelector("#card-auto-translate");
const cardTranslationProgress = document.querySelector("#card-translation-progress");
const cardTranslationStatus = document.querySelector("#card-translation-status");
const saveHomeAssistantGroup = document.querySelector("#save-home-assistant-group");
const deleteHomeAssistantGroup = document.querySelector("#delete-home-assistant-group");
const duplicateHomeAssistantGroup = document.querySelector("#duplicate-home-assistant-group");
const exportHomeAssistantConfig = document.querySelector("#export-home-assistant-config");
const exportHaCardConfig = document.querySelector("#export-ha-card-config");
const exportHaCardPackage = document.querySelector("#export-ha-card-package");
const exportHaCardScript = document.querySelector("#export-ha-card-script");
const exportHaCardBundle = document.querySelector("#export-ha-card-bundle");
const haCardExportBackdrop = document.querySelector("#ha-card-export-backdrop");
const closeHaCardExport = document.querySelector("#close-ha-card-export");
const haCardExportStyleControl = document.querySelector("#ha-card-export-style-control");
const haCardExportStyleInputs = Array.from(document.querySelectorAll("input[name='ha-card-export-style']"));
const saveHaCardExportAs = document.querySelector("#save-ha-card-export-as");
const downloadHaCardExport = document.querySelector("#download-ha-card-export");
const haCardExportStatus = document.querySelector("#ha-card-export-status");
const copyHaCardConfig = document.querySelector("#copy-ha-card-config");
const copyHaCardResources = document.querySelector("#copy-ha-card-resources");
const checkHaCardResources = document.querySelector("#check-ha-card-resources");
const importHomeAssistantConfig = document.querySelector("#import-home-assistant-config");
const importHaCardConfig = document.querySelector("#import-ha-card-config");
const openHaCardPasteImport = document.querySelector("#open-ha-card-paste-import");
const haCardPasteImportBackdrop = document.querySelector("#ha-card-paste-import-backdrop");
const closeHaCardPasteImport = document.querySelector("#close-ha-card-paste-import");
const haCardPasteImportText = document.querySelector("#ha-card-paste-import-text");
const pasteHaCardFromClipboard = document.querySelector("#paste-ha-card-from-clipboard");
const clearHaCardPasteImport = document.querySelector("#clear-ha-card-paste-import");
const openHaCardFileImport = document.querySelector("#open-ha-card-file-import");
const haCardFileImport = document.querySelector("#ha-card-file-import");
const applyHaCardPasteImport = document.querySelector("#apply-ha-card-paste-import");
const haCardPasteImportStatus = document.querySelector("#ha-card-paste-import-status");
const haCardPasteStyleReview = document.querySelector("#ha-card-paste-style-review");
const haCardPreview = document.querySelector("#ha-card-preview");
const haCardVisualPreview = document.querySelector("#ha-card-visual-preview");
const resetSimplePreview = document.querySelector("#reset-simple-preview");
const haCardDependency = document.querySelector("#ha-card-dependency");
const toggleTemporaryResourceDebug = document.querySelector("#toggle-temporary-resource-debug");
const temporaryResourceDebug = document.querySelector("#temporary-resource-debug");
const temporaryHaCardResourceList = document.querySelector("#temporary-ha-card-resource-list");
const haCardImportReview = document.querySelector("#ha-card-import-review");
const haCardStyleReview = document.querySelector("#ha-card-style-review");
const diagnosticsPanel = document.querySelector("#diagnostics-panel");
const selectedEntity = document.querySelector("#selected-entity");
const cardEntityOverview = document.querySelector("#card-entity-overview");
const editorModeButtons = document.querySelectorAll("[data-editor-mode]");
const panelGroupControl = document.querySelector("#panel-group-control");
const groupNameControl = document.querySelector("#group-name-control");
const cardTargetControl = document.querySelector("#card-target-control");
const cardLayoutControl = document.querySelector("#card-layout-control");
const simpleCardSection = document.querySelector("#simple-card-section");
const expertEditorSection = document.querySelector("#expert-editor-section");
const expertCardName = document.querySelector("#expert-card-name");
const expertTemplate = document.querySelector("#expert-template");
const expertTarget = document.querySelector("#expert-target");
const expertBubbleTypeControl = document.querySelector("#expert-bubble-type-control");
const expertBubbleButtonType = document.querySelector("#expert-bubble-button-type");
const expertTitle = document.querySelector("#expert-title");
const applyExpertTitle = document.querySelector("#apply-expert-title");
const useEntityNameAsTitle = document.querySelector("#use-entity-name-as-title");
const expertEntity = document.querySelector("#expert-entity");
const expertColumn = document.querySelector("#expert-column");
const expertRow = document.querySelector("#expert-row");
const expertWidth = document.querySelector("#expert-width");
const expertHeight = document.querySelector("#expert-height");
const expertGridColumnsControl = document.querySelector("#expert-grid-columns");
const expertGridRowsControl = document.querySelector("#expert-grid-rows");
const expertGridZoomControl = document.querySelector("#expert-grid-zoom");
const expertGridColumnsOutput = document.querySelector("#expert-grid-columns-output");
const expertGridRowsOutput = document.querySelector("#expert-grid-rows-output");
const expertGridZoomOutput = document.querySelector("#expert-grid-zoom-output");
const addExpertField = document.querySelector("#add-expert-field");
const editExpertField = document.querySelector("#edit-expert-field");
const arrangeExpertFields = document.querySelector("#arrange-expert-fields");
const resetExpertSurfaceSize = document.querySelector("#reset-expert-surface-size");
const clearExpertFields = document.querySelector("#clear-expert-fields");
const expertTemplatePalette = document.querySelector("#expert-template-palette");
const expertPaletteSearch = document.querySelector("#expert-palette-search");
const saveExpertPaletteFavorites = document.querySelector("#save-expert-palette-favorites");
const showAllExpertPaletteCards = document.querySelector("#show-all-expert-palette-cards");
const scanExpertPaletteCards = document.querySelector("#scan-expert-palette-cards");
const resetExpertTemplateSizing = document.querySelector("#reset-expert-template-sizing");
const resetExpertPaletteFavorites = document.querySelector("#reset-expert-palette-favorites");
const expertEditorDropzone = document.querySelector("#expert-editor-dropzone");
const expertEditorCanvasRow = document.querySelector(".expert-editor-canvas-row");
const expertSelectedCardDetails = document.querySelector("#expert-selected-card-details");
const expertEditorSummary = document.querySelector("#expert-editor-summary");
const expertFieldList = document.querySelector("#expert-field-list");
const expertEditorPreview = document.querySelector("#expert-editor-preview");
const resetExpertPreview = document.querySelector("#reset-expert-preview");
const tabbedCardSettingsBackdrop = document.querySelector("#tabbed-card-settings-backdrop");
const closeTabbedCardSettings = document.querySelector("#close-tabbed-card-settings");
const tabbedCardTabList = document.querySelector("#tabbed-card-tab-list");
const addTabbedCardTab = document.querySelector("#add-tabbed-card-tab");
const moveTabbedCardTabUp = document.querySelector("#move-tabbed-card-tab-up");
const moveTabbedCardTabDown = document.querySelector("#move-tabbed-card-tab-down");
const removeTabbedCardTab = document.querySelector("#remove-tabbed-card-tab");
const tabbedCardTabLabel = document.querySelector("#tabbed-card-tab-label");
const tabbedCardTabIcon = document.querySelector("#tabbed-card-tab-icon");
const tabbedCardFullWidth = document.querySelector("#tabbed-card-full-width");
const tabbedCardAutoHeight = document.querySelector("#tabbed-card-auto-height");
const applyTabbedCardTab = document.querySelector("#apply-tabbed-card-tab");
const tabbedCardSettingsStatus = document.querySelector("#tabbed-card-settings-status");
const stackCardSettingsBackdrop = document.querySelector("#stack-card-settings-backdrop");
const closeStackCardSettings = document.querySelector("#close-stack-card-settings");
const stackCardFullWidth = document.querySelector("#stack-card-full-width");
const stackCardAutoHeight = document.querySelector("#stack-card-auto-height");
const stackCardColumns = document.querySelector("#stack-card-columns");
const stackCardColumnsOutput = document.querySelector("#stack-card-columns-output");
const applyStackCardSettings = document.querySelector("#apply-stack-card-settings");
const stackCardSettingsStatus = document.querySelector("#stack-card-settings-status");
const entityList = document.querySelector("#atlas-entity-list");
const stackSelectionSummary = document.querySelector("#stack-selection-summary");
const groupSummary = document.querySelector("#group-summary");
const groupIssues = document.querySelector("#group-issues");
const configurationStorageKey = "atlas.homeassistant.demo.configuration";
const entityCatalogCacheStorageKey = "atlas.homeassistant.demo.entityCatalogCache";
const exportFilenameHistoryStorageKey = "atlas.homeassistant.demo.exportFilenameHistory";
const atlasThemeStorageKey = "atlas.themePreference";
const defaultAtlasExportEntityIds = ["binary_sensor.atlas_status", "sensor.atlas_temperature"];
const problemReportIssueUrl = "https://github.com/rockbaer2007/atlas/issues/new";
const adminOrigin = createPortOrigin(4175);
const adminConnectionApiUrl = createCurrentSurfaceUrl("api/admin-connection");
const adminLovelaceResourcesApiUrl = createCurrentSurfaceUrl("api/homeassistant/lovelace-resources");
const adminCardTranslationApiUrl = createCurrentSurfaceUrl("api/card-translation");
const adminConnectionCookieName = "atlas_admin_connection";
const translationProviderValues = ["none", "chatgpt", "gemini", "deepl-free", "deepl-pro", "custom-ai"];
const cardTargets = listHomeAssistantCardTargets();
const cardEditorTemplates = listHomeAssistantCardEditorTemplates();
const bubbleButtonTypes = listHomeAssistantBubbleButtonTypes();
let currentLanguage = "en";
let currentThemePreference = "auto";
const translations = {
  en: {
    "page.title": "ATLAS Home Assistant Card Editor",
    "page.subtitle": "Build Simple or Expert Home Assistant cards from live or local entities.",
    "heading.resourceHint": "Resource hint",
    "heading.temporaryResourceDebug": "Temporary HA card resource check",
    "label.haUrl": "Home Assistant URL",
    "label.panelGroup": "Panel group",
    "label.groupName": "Group name",
    "label.cardTarget": "Card target",
    "label.cardLayout": "Card layout",
    "label.cardFormat": "Card format",
    "label.cardStyleExport": "Style export",
    "label.scriptFilename": "HACS script filename",
    "label.cardExportLanguages": "Card export languages",
    "label.autoTranslateCardLanguages": "Run automatic translation on export",
    "label.entityIds": "Entity IDs",
    "label.entityType": "Entity type",
    "label.entitySearch": "Entity search",
    "label.entityPicker": "Entity picker",
    "label.showTemporaryResourceDebug": "Show resource debug",
    "label.haCardPreview": "HA card preview",
    "label.haCardCode": "HA card code",
    "label.expertHaCardCode": "Expert HA card code",
    "label.expertCardName": "Expert card name",
    "label.template": "Template",
    "label.cardFamily": "Card family",
    "label.bubbleButtonType": "Bubble button type",
    "label.title": "Title",
    "label.entity": "Entity",
    "label.name": "Name",
    "label.icon": "Icon",
    "label.tabLabel": "Tab label",
    "label.tabIcon": "Tab icon",
    "label.tabbedCardFullWidth": "Full width",
    "label.tabbedCardAutoHeight": "Automatic height",
    "label.stackCardColumns": "Card width",
    "label.column": "Column",
    "label.row": "Row",
    "label.width": "Width",
    "label.height": "Height",
    "label.gridColumns": "Horizontal grid",
    "label.gridRows": "Vertical grid",
    "label.gridZoom": "Zoom",
    "button.connect": "Connect",
    "button.disconnect": "Disconnect",
    "button.saveGroup": "Save group",
    "button.deleteGroup": "Delete group",
    "button.duplicateGroup": "Duplicate group",
    "button.export": "Export",
    "button.exportHaCard": "Export HA card",
    "button.exportExpertHaCard": "Export Expert HA card",
    "button.exportCardPackage": "Export card package",
    "button.exportCardScript": "Export card script",
    "button.exportCardBundle": "Export HACS bundle",
    "button.copyHaCard": "Copy HA card",
    "button.copyExpertHaCard": "Copy Expert HA card",
    "button.copyResources": "Copy resources",
    "button.copyExpertResources": "Copy Expert resources",
    "button.checkResources": "Check resources",
    "button.import": "Import",
    "button.importHaCard": "Import HA card",
    "button.pasteHaCard": "Paste YAML",
    "button.pasteClipboard": "Paste from clipboard",
    "button.clearPasteImport": "Clear",
    "button.openYamlFile": "Open YAML file",
    "button.applyImport": "Import into editor",
    "button.saveAs": "Choose save location",
    "button.download": "Download",
    "button.addEntity": "Add entity",
    "button.save": "Save",
    "button.cancel": "Cancel",
    "button.refreshEntities": "Refresh entities",
    "button.saveFavorites": "Save favorites",
    "button.showAllCards": "Show all cards",
    "button.showFavorites": "Show favorites",
    "button.scanHaCards": "Scan HA cards",
    "button.resetSizes": "Reset sizes",
    "button.resetFavorites": "Reset favorites",
    "button.addTemplate": "Add template",
    "button.editSelected": "Edit selected",
    "button.stopEditing": "Stop editing",
    "button.autoArrange": "Auto arrange",
    "button.resetSize": "Reset size",
    "button.clearPreview": "Clear preview",
    "button.resetPreview": "Reset preview",
    "button.applyTitle": "Apply title",
    "button.useEntityName": "Use entity name",
    "button.addTab": "Add tab",
    "button.removeTab": "Remove",
    "button.moveTabUp": "Up",
    "button.moveTabDown": "Down",
    "button.applyTab": "Apply tab",
    "button.applyStackSettings": "Apply settings",
    "button.settings": "Settings",
    "button.moveOut": "Move out",
    "button.off": "Off",
    "button.on": "On",
    "button.unavailable": "Unavailable",
    "button.simpleMode": "Simple",
    "button.expertMode": "Expert",
    "button.reportProblem": "Report problem",
    "button.copyProblemReport": "Copy report",
    "button.openProblemIssue": "Open GitHub issue",
    "button.turnOn": "Turn on",
    "button.turnOff": "Turn off",
    "link.openAdmin": "Open Atlas Administration",
    "link.openHub": "Open Plugin Hub",
    "message.connectionDetailsToggleHint": "Details",
    "message.connectionSummaryClosed": "Home Assistant: not connected",
    "message.connectionSummaryFailed": "Home Assistant: not connected",
    "message.connectionSummaryConnecting": "Home Assistant: connecting",
    "message.connectionSummaryConnected": "Home Assistant: connected · {count} entities",
    "message.connectionProblemAddon": "Not connected. Check the ATLAS Add-on configuration for the Home Assistant URL and a valid saved access token, then restart ATLAS.",
    "message.connectionProblemStandalone": "Not connected. Open Atlas Administration and check the Home Assistant URL and access token, then reconnect or restart ATLAS.",
    "theme.auto": "Auto",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "heading.expertEditor": "Expert editor preview",
    "heading.cardList": "Card list",
    "heading.tabbedCardSettings": "Tabbed Card V2 settings",
    "heading.stackCardSettings": "Stack settings",
    "heading.overviewCardEntities": "Overview entities",
    "heading.selectedCardDetails": "Selected card",
    "heading.exportHaCard": "Export HA card",
    "heading.pasteHaCard": "Paste HA card YAML",
    "heading.problemReport": "Report problem",
    "heading.tabs": "Tabs",
    "heading.diagnostics": "Diagnostics",
    "heading.statusPreview": "ATLAS Status Preview",
    "heading.entitySelection": "Entities for the card",
    "heading.selectedEntities": "Entities detected in HA",
    "table.entity": "Entity",
    "table.state": "State",
    "table.type": "Type / source",
    "table.actions": "Actions",
    "group.overview": "Overview",
    "group.energy": "Energy",
    "group.safety": "Safety",
    "group.custom": "Custom",
    "layout.single": "Simple",
    "layout.horizontal": "Horizontal stack",
    "layout.vertical": "Vertical stack",
    "placeholder.entitySearch": "Filter by name or entity ID",
    "placeholder.scriptFilename": "energy-kitchen.js",
    "placeholder.expertCardName": "ATLAS Expert card",
    "placeholder.expertTitle": "Use template title when empty",
    "placeholder.expertEntity": "Use current entity when empty",
    "placeholder.cardSearch": "Search cards",
    "placeholder.haCardYamlPaste": "Paste YAML or JSON card configuration here",
    "aria.entityTypeShortcuts": "Entity type shortcuts",
    "aria.clearEntitySearch": "Clear entity search",
    "aria.language": "Language",
    "aria.theme": "Theme",
    "aria.atlasNavigation": "ATLAS navigation",
    "aria.cardEditorMode": "Card editor mode",
    "aria.availableCards": "Available Home Assistant cards",
    "aria.expertTemplates": "Expert editor templates",
    "aria.expertSurface": "Expert editor surface",
    "aria.resizeExpertSurface": "Resize Expert editor surface",
    "aria.closeTabbedCardSettings": "Close Tabbed Card V2 settings",
    "aria.closeStackCardSettings": "Close stack settings",
    "aria.closeHaCardExport": "Close HA card export",
    "aria.closeHaCardPasteImport": "Close HA card YAML import",
    "aria.closeProblemReport": "Close problem report",
    "aria.showStatusPreview": "Show {entityId} in the ATLAS Status Preview",
    "aria.moveEntityUp": "Move {entityId} up",
    "aria.moveEntityDown": "Move {entityId} down",
    "aria.removeEntity": "Remove {entityId}",
    "aria.useEntityInStack": "Use {entityId} in stack export",
    "aria.entityState": "Entity state",
    "message.emptySelection": "Select at least one entity.",
    "message.noExpertFields": "No expert fields added.",
    "message.dragCard": "Drag a card from the left into this editor surface.",
    "message.addTemplatePreview": "Add a template field to preview the Expert editor output.",
    "message.addTemplateBeforeExport": "Add a template field before exporting an Expert HA card.",
    "message.statusPanelNotRegistered": "Status panel is not registered.",
    "message.connectionUrlReady": "Connection URL ready: {url}",
    "message.connectionState": "Connection: {state}",
    "message.connectionStateWithReason": "Connection: {state} ({reason})",
    "message.connectionStateWithSubscription": "Connection: {state}, subscription {subscription}",
    "message.reconnecting": "Reconnecting in {seconds}s ({attempt}/3).",
    "message.stackSelectedEntities": "Stack-selected entities: {selected}/{total}{entities}",
    "message.stackEntitySuffix": " - {entities}",
    "message.simpleUsesFirstEntity": "Simple uses the first entity: {entityId}",
    "message.simpleUsesFirstEntityEmpty": "Simple uses the first entity.",
    "message.noEntitiesFound": "No entities found for {domain}{search}.",
    "message.entitySearchSuffix": " and \"{search}\"",
    "message.entitiesFound": "{count} {entityLabel} found for {domain}.",
    "message.entitySingular": "entity",
    "message.entityPlural": "entities",
    "message.allTypes": "all types",
    "message.selectEntityFirst": "Select an entity first.",
    "message.entityListRequested": "Entity list requested from Home Assistant ({requestId}).",
    "message.connectBeforeRefreshingEntities": "Connect to Home Assistant before refreshing entities.",
    "message.resourcesRequested": "Lovelace resources requested ({requestId}).",
    "message.connectBeforeCheckingResources": "Connect to Home Assistant before checking resources.",
    "message.invalidConnectionUrl": "Home Assistant URL is invalid.",
    "message.paletteEntriesDetected": "{total} palette entries detected from loaded HA resources, including {hacs} /hacsfiles resources.",
    "message.noPaletteEntriesDetected": "No additional scan-only palette entries detected from loaded HA resources.",
    "message.refreshingResources": "{message} Refreshing Lovelace resources from Home Assistant.",
    "message.connectAndScanAgain": "{message} Connect to Home Assistant and scan again to refresh the list.",
    "message.templateSizeSet": "{template} size set to {columns} columns and {rows} rows.",
    "message.surfaceResized": "Expert editor grid set to {columns}x{rows}.",
    "message.surfaceSizeReset": "Expert editor surface size reset to the default.",
    "message.arrangeNeedsFields": "Add Expert fields before arranging the editor surface.",
    "message.fieldsArranged": "Expert fields arranged. Overlaps: {previous} -> {next}.",
    "message.selectFieldBeforeResize": "Select an Expert field before changing its size.",
    "message.fieldResized": "{field} resized to {width}x{height}.",
    "message.fieldMoved": "{field} moved on the Expert editor surface.",
    "message.tabbedCardSettingsOpened": "Tabbed Card V2 settings opened for {field}.",
    "message.stackCardSettingsOpened": "Stack settings opened for {field}.",
    "message.stackCardSettingsUpdated": "Stack settings updated for {field}.",
    "message.overviewEntitiesOpened": "Overview entities opened for {field}.",
    "message.overviewEntitiesUpdated": "Overview entities updated for {field}.",
    "message.selectTabbedCardFirst": "Select a Tabbed Card V2 field first.",
    "message.tabAdded": "Tab {label} added.",
    "message.tabRemoved": "Tab removed.",
    "message.tabUpdated": "Tab {label} updated.",
    "message.tabMoved": "Tab moved.",
    "message.tabSelected": "Tab {tab} selected.",
    "message.cardAddedToTab": "{card} added to tab {tab}.",
    "message.cardAddedToContainer": "{card} added to {container}.",
    "message.containerCardSelected": "{card} selected inside {container}.",
    "message.containerCardUpdated": "{card} updated inside {container}.",
    "message.containerCardRemoved": "{card} removed from {container}.",
    "message.containerCardMovedOut": "{card} moved out of {container}.",
    "message.fieldRemoved": "{field} removed.",
    "message.tabbedCardNeedsTab": "Add a tab before placing cards inside Tabbed Card V2.",
    "message.groupStatus": "Group status: {ready} ready, {pending} pending, {blocked} blocked.",
    "message.needsAttention": "Needs attention: {entities}.",
    "message.needsAttentionCount": "{count} need attention.",
    "message.selectedForHaPreview": "{entityId} selected for the HA card preview.",
    "message.selectedForDiagnosticsPreview": "{entityId} selected for the Diagnostics status preview.",
    "message.selectedForDiagnosticsWithStack": "{entityId} selected for Diagnostics. Use the checkbox to include it in the stack export.",
    "message.stackNeedsEntity": "{entityId} remains selected; stack export needs at least one entity.",
    "message.addedToStackPreview": "{entityId} added to the stack preview.",
    "message.removedFromStackPreview": "{entityId} removed from the stack preview.",
    "message.entityRemoved": "{entityId} removed.",
    "message.justNow": "just now",
    "message.minutesAgo": "{count} min ago",
    "message.hoursAgo": "{count} h ago",
    "message.sendServiceConfirm": "Send {service} to {entityId}?",
    "message.commandSent": "Command sent for {entityId}.",
    "message.noActiveConnection": "No active Home Assistant connection.",
    "message.commandCompleted": "Command completed for {entityId}.",
    "message.commandFailed": "Command failed for {entityId}: {reason}",
    "message.unknownError": "Unknown error.",
    "message.loadedEntities": "Loaded {count} entities from Home Assistant.",
    "message.loadedEntitiesWithChanges": "Loaded {count} entities from Home Assistant. Cache: +{added}, -{removed}.",
    "message.entitySyncIdle": "Entities: no Home Assistant catalog loaded yet.",
    "message.entitySyncCached": "Entities: cache ready · {count} entries.",
    "message.entitySyncing": "Entities: synchronizing with Home Assistant...",
    "message.entitySyncDone": "Entities: done · {count} loaded · +{added} / -{removed}.",
    "message.entitySyncFailed": "Entities: failed · {reason}",
    "message.entityListFailed": "Entity list failed: {reason}",
    "message.loadedResources": "Loaded {count} Lovelace resources from Home Assistant. {total} palette entries detected, including {hacs} /hacsfiles resources.",
    "message.lovelaceFailed": "Lovelace resources failed: {reason}",
    "message.liveEntity": "Live entity: {entityId}",
    "message.demoEntityTarget": "Demo entity: {entityId}",
    "message.waitingForUpdates": "Waiting for updates from {entityId}.",
    "message.demoControlsTarget": "Demo controls target {entityId}.",
    "message.tokenRequired": "Open Atlas Administration on port 4175 and hand over the connection settings before connecting.",
    "message.adminHandoffWaiting": "Waiting for connection settings from Atlas Administration.",
    "message.adminHandoffReceived": "Connection settings received from Atlas Administration.",
    "message.entityStateUpdated": "Entity state updated: {state}.",
    "message.titleCopied": "{title} copied from the selected entity.",
    "message.expertPreviewCleared": "Expert editor preview cleared.",
    "message.previewReset": "Preview reset.",
    "message.confirmPreviewReset": "Do you really want to do this?",
    "message.groupRequiresNameAndEntity": "A group name and at least one entity are required.",
    "message.groupSaved": "Group {title} saved.",
    "message.builtInGroupsCannotDelete": "Built-in groups cannot be deleted.",
    "message.groupDeleted": "Group deleted.",
    "message.selectGroupToDuplicate": "Select a group to duplicate.",
    "message.groupCreated": "Group {title} created.",
    "message.haCardCopied": "HA card {format} copied to clipboard.",
    "message.haCardExported": "HA card exported as {filename}.",
    "message.defaultAtlasEntitiesUsed": "No entities selected. ATLAS example entities were inserted for this export: {entities}.",
    "message.exportCancelled": "Export cancelled.",
    "message.exportFailed": "Export failed.",
    "message.exportPathHint": "Choose a save location if your browser supports it, or use the normal download fallback.",
    "message.savePickerUnavailable": "Your browser cannot choose a save location here. Use Download instead.",
    "message.copyPreviewFailed": "Copy failed: use the preview text instead.",
    "message.problemReportHint": "Review the debug data before copying or opening GitHub. Home Assistant tokens and provider API keys are never included.",
    "message.problemReportReady": "Problem report preview created. Review it before sharing.",
    "message.problemReportCopied": "Problem report copied to clipboard.",
    "message.problemReportCopyFailed": "Copy failed: use the preview text instead.",
    "message.problemIssueOpened": "GitHub issue opened with the reviewed debug report.",
    "message.resourcesCopiedWithDependency": "ATLAS and {dependency} Lovelace resources {format} copied to clipboard.",
    "message.atlasResourceCopied": "ATLAS Lovelace resource {format} copied to clipboard.",
    "message.copyDependencyFailed": "Copy failed: use the dependency path instead.",
    "message.importConfigurationConfirm": "Import {name}: {groups} groups and {entities} entities?",
    "message.unnamedConfiguration": "Unnamed configuration",
    "message.configurationImported": "Configuration imported: {groups} groups and {entities} entities.",
    "message.importConfigurationFailed": "Import failed: invalid configuration.",
    "message.importPaused": "Import paused: review the compatibility details before mapping this artifact.",
    "message.importRejected": "Import rejected: unsupported Home Assistant card artifact.",
    "message.haCardImported": "{type} {format} imported: {title} with {entities} entities.",
    "message.importHaCardFailed": "Import failed: invalid Home Assistant entities card JSON or YAML.",
    "message.pasteImportEmpty": "Paste YAML or JSON before importing.",
    "message.clipboardReadFailed": "Clipboard could not be read.",
    "message.fileReadFailed": "File could not be read.",
    "message.styleBlocksDetected": "Styles detected: {global} global, {cards} card, {layout} layout.",
    "message.noStyleBlocksDetected": "No card_mod/UIX style blocks detected.",
    "message.entityStylesAssigned": "{count} entity style blocks are assigned in the preview.",
    "message.hacsBundleInspected": "HACS bundle checked: {count} files, script {scriptFilename}.",
    "message.hacsBundleRejected": "HACS bundle rejected: {reason}",
    "message.invalidDragPayload": "Could not read dragged card.",
    "message.packageExported": "Card package exported with HACS script {scriptFilename}.",
    "message.scriptExported": "Card script exported as {scriptFilename}.",
    "message.bundleExported": "HACS bundle exported as {filename} with {count} files.",
    "message.cardExportLanguageHint": "EN is the required fallback. Additional languages are exported as English fallback files for now. Please review and translate the corresponding language files before publishing. Automatic translation later requires an internet connection.",
    "message.packageExportedWithLanguages": "Card package exported with HACS script {scriptFilename} and languages {languages}.",
    "message.bundleExportedWithLanguages": "HACS bundle exported as {filename} with {count} files and languages {languages}.",
    "message.translationProviderReady": "Translation module from Administration: {provider}.",
    "message.translationProviderNotConfigured": "Translation module from Administration: not configured.",
    "message.translationFallbackNoProvider": "Automatic translation requested, but no translation module is configured. Exporting fallback language files.",
    "message.translationFallbackProviderPending": "Automatic translation requested with {provider}. API endpoint prepared: {endpoint}. Provider execution is not connected yet, so fallback language files are exported for review.",
    "message.translationProviderMissingKey": "Automatic translation requested with {provider}, but no provider API key is configured in Administration. Exporting fallback language files.",
    "message.translationProviderRequest": "Requesting machine translation with {provider}: {percent}%.",
    "message.translationProviderComplete": "Machine translation completed with {provider}: {languages}. Review before publishing.",
    "message.translationProviderFailed": "Machine translation failed with {provider}: {reason}. Exporting fallback language files.",
    "message.translationProgress": "Preparing language files: {percent}%.",
    "message.translationComplete": "Language files prepared: {percent}%.",
    "message.scriptFilenameNormalized": "HACS script filename will be exported as {scriptFilename}.",
    "message.atlasPackage": "ATLAS card package",
    "message.haCard": "HA card",
    "dependency.resource": " Resource: {paths}.",
    "dependency.installPath": " Install path: {paths}.",
    "dependency.atlasFrontend": " ATLAS frontend: {paths}.",
    "dependency.builtIn": "Uses built-in Home Assistant card.{atlasHint}",
    "dependency.requiresUnchecked": "Requires {dependency}.{resourceHint}{installHint}{atlasHint} Connect to Home Assistant or check resources.",
    "dependency.ready": "{dependency} and ATLAS frontend resources found.{resourceHint}{atlasHint}",
    "dependency.cardFoundAtlasMissing": "{dependency} resource found.{resourceHint}{atlasHint} Missing ATLAS frontend: {missing}.",
    "dependency.missing": "Requires {dependency}.{resourceHint}{installHint}{atlasHint} Missing: {missing}.",
    "text.allEntityTypes": "All entity types",
    "text.all": "All",
    "text.favorite": "Favorite",
    "text.scannedOnly": "Scanned only",
    "text.builtIn": "Built-in",
    "text.resourceUnchecked": "Resource unchecked",
    "text.resourceInstalled": "Resource installed",
    "text.resourceMissing": "Resource missing",
    "text.temporaryResourceDebugUnchecked": "Temporary check: no Lovelace resources loaded yet. Click Check resources while Home Assistant is connected.",
    "text.temporaryResourceDebugLoading": "Temporary check: Lovelace resources requested, waiting for Home Assistant...",
    "text.temporaryResourceDebugRestLoading": "Temporary check: WebSocket did not answer yet. Trying REST fallback...",
    "text.temporaryResourceDebugFailed": "Temporary check failed: {reason}",
    "text.temporaryResourceDebugTimeout": "Temporary check: Home Assistant did not answer the Lovelace resource request. The WebSocket connection is active, but this command may be blocked or unsupported for the current user/session.",
    "text.temporaryResourceDebugSummary": "Temporary check ({source}): {total} Lovelace resources, {hacs} HACS resources, {known} known cards, {scanOnly} scan-only resources, {ignored} ignored/non-card resources.",
    "text.temporaryResourceDebugEvents": "Debug timeline",
    "text.temporaryResourceKnown": "Known cards",
    "text.temporaryResourceScanOnly": "Scan-only resources",
    "text.temporaryResourceIgnored": "Ignored / non-card resources",
    "text.demoEntity": "demo entity",
    "text.noEntity": "no entity",
    "text.none": "none",
    "text.entityName": "Entity name",
    "text.entityId": "Entity ID",
    "text.cardIcon": "Icon",
    "text.cardTitle": "Title",
    "text.cardName": "Card name",
    "text.cardType": "Card type",
    "text.cardSettings": "Settings",
    "text.cardColumns": "Columns",
    "text.cardRows": "Rows",
    "text.cardOptions": "Options",
    "text.containedCards": "Contained cards",
    "text.entityEntries": "Entities",
    "text.simplePrimaryEntity": "Simple primary entity",
    "text.ready": "Ready",
    "text.pending": "Pending",
    "text.blocked": "Blocked",
    "text.stackSelection": "Stack selection",
    "text.entityPicker": "Entity picker",
    "text.styleCode": "Style code",
    "text.noSelectedCard": "Select a card on the editor surface.",
    "text.waiting": "Waiting",
    "text.col": "col",
    "text.row": "row",
    "text.full": "full",
    "text.auto": "auto",
    "text.categoryCore": "Core",
    "text.categoryCommunity": "Community",
    "text.registeredNotMapped": "{category} registered, not mapped yet",
    "text.paletteDetail": "{layout}, {size}, {target}",
    "text.scannedCardUnavailable": "{label} is registered in Home Assistant, but ATLAS does not map this custom card yet.",
    "text.paletteCardSelected": "{label} selected from the card list.",
    "text.paletteSelectionChanged": "Favorite selection changed. Use Save favorites to apply it.",
    "text.noPaletteSearchResults": "No matching cards found.",
    "text.fullCardListVisible": "Full Core and Community card list is visible for favorite selection.",
    "text.savedFavoritesVisible": "Saved favorites are visible.",
    "text.favoritesSaved": "{count} favorite cards saved.",
    "text.allCardsRemainVisible": "Favorite selection saved. All cards remain visible.",
    "text.allCardsVisibleAgain": "All Core and Community cards are visible again.",
    "text.templateSizesReset": "Template sizes reset to their defaults.",
    "text.removeField": "Remove {field}",
    "text.fieldRemoved": "{field} removed from the Expert editor preview.",
    "text.enterTitle": "Enter a title before applying it.",
    "text.titlePrepared": "{title} prepared for the next Expert field.",
    "text.titleApplied": "{title} set as Expert field title.",
    "text.targetUpdated": "{field} card family updated to {target}.",
    "text.bubbleTypeUpdated": "{field} Bubble button type set to {type}.",
    "text.entityPrepared": "{entityId} prepared for the next Expert field.",
    "text.entityAssigned": "{entityId} assigned to {title}.",
    "text.fieldSelected": "{field} selected on the Expert editor surface.",
    "text.selectFieldBeforeEditing": "Select an Expert field before editing.",
    "text.editHandlesEnabled": "{field} editing handles enabled.",
    "text.editHandlesHidden": "{field} editing handles hidden.",
    "text.overlappingField": "overlapping another field",
    "text.expertFieldsSummary": "Expert fields: {count} ({populated} populated{empty})",
    "text.emptyFieldsSummary": ", {count} empty",
    "text.rowsSummary": "Rows: {count}",
    "text.surfaceSummary": "Surface: {columns}x{rows}",
    "text.overlapsSummary": "Overlaps: {count}",
    "text.targetsSummary": "Targets: {targets}",
    "text.layoutsSummary": "Layouts: {layouts}",
    "text.expertFieldsZero": "Expert fields: 0.",
    "text.fieldAdded": "{field} added to the Expert editor preview.",
    "text.fieldPlaced": "{field} placed on the Expert editor surface.",
    "text.tabbedCardContainer": "{count} tabs",
    "text.tabCardCount": "{count} cards",
    "palette.core-entity": "Entity",
    "palette.core-entities": "Entities",
    "palette.core-button": "Button",
    "palette.core-grid": "Grid",
    "palette.core-sensor": "Sensor",
    "palette.core-horizontal-stack": "Horizontal stack",
    "palette.core-vertical-stack": "Vertical stack",
    "palette.core-thermostat": "Thermostat",
    "palette.core-link": "Link",
    "palette.core-webpage": "Webpage",
    "palette.community-mushroom-template": "Mushroom template",
    "palette.community-bubble-state": "Bubble state",
    "palette.community-bubble-switch": "Bubble switch",
    "palette.community-bubble-slider": "Bubble slider",
    "palette.community-bubble-name": "Bubble name",
    "palette.community-tabbed-card-v2": "Tabbed Card V2",
    "target.entities": "Entities",
    "target.glance": "Overview / Glance",
    "target.entity": "Entity",
    "target.button": "Button",
    "target.sensor": "Sensor",
    "target.thermostat": "Thermostat",
    "target.link": "Link",
    "target.webpage": "Webpage",
    "target.mushroom-template": "Mushroom template",
    "target.bubble": "Bubble",
    "target.tabbed-card-v2": "Tabbed Card V2",
    "template.entity-list": "Entity list",
    "template.glance-card": "Overview / Glance",
    "template.entity-card": "Entity",
    "template.button-card": "Button",
    "template.grid": "Grid",
    "template.sensor-card": "Sensor",
    "template.horizontal-stack": "Horizontal stack",
    "template.vertical-stack": "Vertical stack",
    "template.thermostat-card": "Thermostat",
    "template.link-card": "Link",
    "template.webpage-card": "Webpage",
    "template.tabbed-card-v2": "Tabbed Card V2",
    "template.state-button": "State button",
    "template.switch-button": "Switch button",
  },
  de: {
    "page.title": "ATLAS Home Assistant Card Editor",
    "page.subtitle": "Erstelle Simple- oder Expert-Home-Assistant-Cards aus Live- oder lokalen Entitäten.",
    "heading.resourceHint": "Ressourcen-Hinweis",
    "heading.temporaryResourceDebug": "Temporärer HA-Card-Ressourcencheck",
    "label.haUrl": "Home Assistant URL",
    "label.panelGroup": "Panel-Gruppe",
    "label.groupName": "Gruppenname",
    "label.cardTarget": "Card-Ziel",
    "label.cardLayout": "Card-Layout",
    "label.cardFormat": "Card-Format",
    "label.cardStyleExport": "Style-Export",
    "label.scriptFilename": "HACS-Script-Dateiname",
    "label.cardExportLanguages": "Card-Export-Sprachen",
    "label.autoTranslateCardLanguages": "Automatische Übersetzung beim Export ausführen",
    "label.entityIds": "Entitäts-IDs",
    "label.entityType": "Entitätstyp",
    "label.entitySearch": "Entität suchen",
    "label.entityPicker": "Entitätsauswahl",
    "label.showTemporaryResourceDebug": "Ressourcen-Debug anzeigen",
    "label.haCardPreview": "HA-Card-Vorschau",
    "label.haCardCode": "HA-Card-Code",
    "label.expertHaCardCode": "Expert-HA-Card-Code",
    "label.expertCardName": "Expert-Card-Name",
    "label.template": "Template",
    "label.cardFamily": "Card-Familie",
    "label.bubbleButtonType": "Bubble-Button-Typ",
    "label.title": "Titel",
    "label.entity": "Entität",
    "label.name": "Name",
    "label.icon": "Icon",
    "label.tabLabel": "Tab-Label",
    "label.tabIcon": "Tab-Icon",
    "label.tabbedCardFullWidth": "Volle Breite",
    "label.tabbedCardAutoHeight": "Automatische Höhe",
    "label.stackCardColumns": "Card-Breite",
    "label.column": "Spalte",
    "label.row": "Zeile",
    "label.width": "Breite",
    "label.height": "Höhe",
    "label.gridColumns": "Raster horizontal",
    "label.gridRows": "Raster vertikal",
    "label.gridZoom": "Zoom",
    "button.connect": "Verbinden",
    "button.disconnect": "Trennen",
    "button.saveGroup": "Gruppe speichern",
    "button.deleteGroup": "Gruppe löschen",
    "button.duplicateGroup": "Gruppe duplizieren",
    "button.export": "Export",
    "button.exportHaCard": "HA-Card exportieren",
    "button.exportExpertHaCard": "Expert-HA-Card exportieren",
    "button.exportCardPackage": "Card-Paket exportieren",
    "button.exportCardScript": "Card-Script exportieren",
    "button.exportCardBundle": "HACS-Bundle exportieren",
    "button.copyHaCard": "HA-Card kopieren",
    "button.copyExpertHaCard": "Expert-HA-Card kopieren",
    "button.copyResources": "Ressourcen kopieren",
    "button.copyExpertResources": "Expert-Ressourcen kopieren",
    "button.checkResources": "Ressourcen prüfen",
    "button.import": "Import",
    "button.importHaCard": "HA-Card importieren",
    "button.pasteHaCard": "YAML einfügen",
    "button.pasteClipboard": "Aus Zwischenablage einfügen",
    "button.clearPasteImport": "Leeren",
    "button.openYamlFile": "YAML-Datei öffnen",
    "button.applyImport": "In Editor importieren",
    "button.saveAs": "Speicherort wählen",
    "button.download": "Download",
    "button.addEntity": "Entität hinzufügen",
    "button.save": "Speichern",
    "button.cancel": "Abbrechen",
    "button.refreshEntities": "Entitäten aktualisieren",
    "button.saveFavorites": "Favoriten speichern",
    "button.showAllCards": "Alle Cards anzeigen",
    "button.showFavorites": "Favoriten anzeigen",
    "button.scanHaCards": "HA-Cards scannen",
    "button.resetSizes": "Größen zurücksetzen",
    "button.resetFavorites": "Favoriten zurücksetzen",
    "button.addTemplate": "Template hinzufügen",
    "button.editSelected": "Auswahl bearbeiten",
    "button.stopEditing": "Bearbeitung beenden",
    "button.autoArrange": "Automatisch anordnen",
    "button.resetSize": "Größe zurücksetzen",
    "button.clearPreview": "Vorschau leeren",
    "button.resetPreview": "Vorschau zurücksetzen",
    "button.applyTitle": "Titel übernehmen",
    "button.useEntityName": "Entitätsname nutzen",
    "button.addTab": "Tab hinzufügen",
    "button.removeTab": "Entfernen",
    "button.moveTabUp": "Hoch",
    "button.moveTabDown": "Runter",
    "button.applyTab": "Tab übernehmen",
    "button.applyStackSettings": "Einstellungen übernehmen",
    "button.settings": "Einstellungen",
    "button.moveOut": "Rausziehen",
    "button.off": "Aus",
    "button.on": "Ein",
    "button.unavailable": "Nicht verfügbar",
    "button.simpleMode": "Simple",
    "button.expertMode": "Expert",
    "button.reportProblem": "Problem melden",
    "button.copyProblemReport": "Report kopieren",
    "button.openProblemIssue": "GitHub-Issue öffnen",
    "button.turnOn": "Einschalten",
    "button.turnOff": "Ausschalten",
    "link.openAdmin": "Atlas Administration öffnen",
    "link.openHub": "Plugin-Hub öffnen",
    "message.connectionDetailsToggleHint": "Details",
    "message.connectionSummaryClosed": "Home Assistant: nicht verbunden",
    "message.connectionSummaryFailed": "Home Assistant: nicht verbunden",
    "message.connectionSummaryConnecting": "Home Assistant: verbindet",
    "message.connectionSummaryConnected": "Home Assistant: verbunden · {count} Entitäten",
    "message.connectionProblemAddon": "Nicht verbunden. Bitte prüfe in der ATLAS Add-on-Konfiguration, ob die Home-Assistant-URL stimmt und ein gültiger Access Token gespeichert ist. Danach ATLAS neu starten.",
    "message.connectionProblemStandalone": "Nicht verbunden. Bitte öffne ATLAS Administration und prüfe dort Home-Assistant-URL und Access Token. Danach Verbindung erneut starten oder ATLAS neu starten.",
    "theme.auto": "Auto",
    "theme.light": "Hell",
    "theme.dark": "Dunkel",
    "heading.expertEditor": "Expert-Editor-Vorschau",
    "heading.cardList": "Card-Liste",
    "heading.tabbedCardSettings": "Tabbed Card V2 Einstellungen",
    "heading.stackCardSettings": "Stack-Einstellungen",
    "heading.overviewCardEntities": "Übersichts-Entitäten",
    "heading.selectedCardDetails": "Ausgewählte Card",
    "heading.exportHaCard": "HA-Card exportieren",
    "heading.pasteHaCard": "HA-Card-YAML einfügen",
    "heading.problemReport": "Problem melden",
    "heading.tabs": "Tabs",
    "heading.diagnostics": "Diagnose",
    "heading.statusPreview": "ATLAS Status Vorschau",
    "heading.entitySelection": "Entitäten für die Card",
    "heading.selectedEntities": "In HA erkannte Entitäten",
    "table.entity": "Entität",
    "table.state": "Status",
    "table.type": "Typ / Quelle",
    "table.actions": "Aktionen",
    "group.overview": "Übersicht",
    "group.energy": "Energie",
    "group.safety": "Sicherheit",
    "group.custom": "Benutzerdefiniert",
    "layout.single": "Einfach",
    "layout.horizontal": "Horizontaler Stapel",
    "layout.vertical": "Vertikaler Stapel",
    "placeholder.entitySearch": "Nach Name oder Entitäts-ID filtern",
    "placeholder.scriptFilename": "energie-küche.js",
    "placeholder.expertCardName": "ATLAS Expert Card",
    "placeholder.expertTitle": "Template-Titel nutzen, wenn leer",
    "placeholder.expertEntity": "Aktuelle Entität nutzen, wenn leer",
    "placeholder.cardSearch": "Cards suchen",
    "placeholder.haCardYamlPaste": "YAML- oder JSON-Card-Konfiguration hier einfügen",
    "aria.entityTypeShortcuts": "Entitätstyp-Schnellauswahl",
    "aria.clearEntitySearch": "Entitätssuche löschen",
    "aria.language": "Sprache",
    "aria.theme": "Darstellung",
    "aria.atlasNavigation": "ATLAS Navigation",
    "aria.cardEditorMode": "Card-Editor-Modus",
    "aria.availableCards": "Verfügbare Home Assistant Cards",
    "aria.expertTemplates": "Expert-Editor-Templates",
    "aria.expertSurface": "Expert-Editor-Fläche",
    "aria.resizeExpertSurface": "Expert-Editor-Fläche vergrößern",
    "aria.closeTabbedCardSettings": "Tabbed Card V2 Einstellungen schließen",
    "aria.closeStackCardSettings": "Stack-Einstellungen schließen",
    "aria.closeHaCardExport": "HA-Card-Export schließen",
    "aria.closeHaCardPasteImport": "HA-Card-YAML-Import schließen",
    "aria.closeProblemReport": "Problembericht schließen",
    "aria.showStatusPreview": "{entityId} in der ATLAS Status Vorschau anzeigen",
    "aria.moveEntityUp": "{entityId} nach oben verschieben",
    "aria.moveEntityDown": "{entityId} nach unten verschieben",
    "aria.removeEntity": "{entityId} entfernen",
    "aria.useEntityInStack": "{entityId} im Stapel-Export nutzen",
    "aria.entityState": "Entitätsstatus",
    "message.emptySelection": "Wähle mindestens eine Entität aus.",
    "message.noExpertFields": "Keine Expert-Felder hinzugefügt.",
    "message.dragCard": "Ziehe eine Card von links in diese Editor-Fläche.",
    "message.addTemplatePreview": "Füge ein Template-Feld hinzu, um die Expert-Ausgabe zu sehen.",
    "message.addTemplateBeforeExport": "Füge vor dem Export einer Expert-HA-Card ein Template-Feld hinzu.",
    "message.statusPanelNotRegistered": "Status-Panel ist nicht registriert.",
    "message.connectionUrlReady": "Connection-URL bereit: {url}",
    "message.connectionState": "Verbindung: {state}",
    "message.connectionStateWithReason": "Verbindung: {state} ({reason})",
    "message.connectionStateWithSubscription": "Verbindung: {state}, Subscription {subscription}",
    "message.reconnecting": "Verbinde erneut in {seconds}s ({attempt}/3).",
    "message.stackSelectedEntities": "Für Stapel ausgewählte Entitäten: {selected}/{total}{entities}",
    "message.stackEntitySuffix": " - {entities}",
    "message.simpleUsesFirstEntity": "Simple nutzt die erste Entität: {entityId}",
    "message.simpleUsesFirstEntityEmpty": "Simple nutzt die erste Entität.",
    "message.noEntitiesFound": "Keine Entitäten gefunden für {domain}{search}.",
    "message.entitySearchSuffix": " und \"{search}\"",
    "message.entitiesFound": "{count} {entityLabel} gefunden für {domain}.",
    "message.entitySingular": "Entität",
    "message.entityPlural": "Entitäten",
    "message.allTypes": "alle Typen",
    "message.selectEntityFirst": "Wähle zuerst eine Entität aus.",
    "message.entityListRequested": "Entitätsliste von Home Assistant angefordert ({requestId}).",
    "message.connectBeforeRefreshingEntities": "Verbinde zuerst Home Assistant, bevor du Entitäten aktualisierst.",
    "message.resourcesRequested": "Lovelace-Ressourcen angefordert ({requestId}).",
    "message.connectBeforeCheckingResources": "Verbinde zuerst Home Assistant, bevor du Ressourcen prüfst.",
    "message.invalidConnectionUrl": "Home-Assistant-URL ist ungültig.",
    "message.paletteEntriesDetected": "{total} Palette-Einträge aus geladenen HA-Ressourcen erkannt, davon {hacs} /hacsfiles-Ressourcen.",
    "message.noPaletteEntriesDetected": "Keine zusätzlichen Scan-only-Palette-Einträge aus geladenen HA-Ressourcen erkannt.",
    "message.refreshingResources": "{message} Lovelace-Ressourcen werden von Home Assistant aktualisiert.",
    "message.connectAndScanAgain": "{message} Verbinde Home Assistant und scanne erneut, um die Liste zu aktualisieren.",
    "message.templateSizeSet": "{template} Größe auf {columns} Spalten und {rows} Zeilen gesetzt.",
    "message.surfaceResized": "Expert-Editor-Raster auf {columns}x{rows} gesetzt.",
    "message.surfaceSizeReset": "Expert-Editor-Fläche auf Standardgröße zurückgesetzt.",
    "message.arrangeNeedsFields": "Füge Expert-Felder hinzu, bevor du die Editor-Fläche anordnest.",
    "message.fieldsArranged": "Expert-Felder angeordnet. Überlappungen: {previous} -> {next}.",
    "message.selectFieldBeforeResize": "Wähle ein Expert-Feld aus, bevor du seine Größe änderst.",
    "message.fieldResized": "{field} auf {width}x{height} geändert.",
    "message.fieldMoved": "{field} auf der Expert-Editor-Fläche verschoben.",
    "message.tabbedCardSettingsOpened": "Tabbed Card V2 Einstellungen für {field} geöffnet.",
    "message.stackCardSettingsOpened": "Stack-Einstellungen für {field} geöffnet.",
    "message.stackCardSettingsUpdated": "Stack-Einstellungen für {field} aktualisiert.",
    "message.overviewEntitiesOpened": "Übersichts-Entitäten für {field} geöffnet.",
    "message.overviewEntitiesUpdated": "Übersichts-Entitäten für {field} aktualisiert.",
    "message.selectTabbedCardFirst": "Wähle zuerst ein Tabbed Card V2 Feld aus.",
    "message.tabAdded": "Tab {label} hinzugefügt.",
    "message.tabRemoved": "Tab entfernt.",
    "message.tabUpdated": "Tab {label} aktualisiert.",
    "message.tabMoved": "Tab verschoben.",
    "message.tabSelected": "Tab {tab} ausgewählt.",
    "message.cardAddedToTab": "{card} in Tab {tab} eingefügt.",
    "message.cardAddedToContainer": "{card} in {container} eingefügt.",
    "message.containerCardSelected": "{card} in {container} ausgewählt.",
    "message.containerCardUpdated": "{card} in {container} aktualisiert.",
    "message.containerCardRemoved": "{card} aus {container} entfernt.",
    "message.containerCardMovedOut": "{card} aus {container} auf die Fläche gelegt.",
    "message.fieldRemoved": "{field} entfernt.",
    "message.tabbedCardNeedsTab": "Füge erst einen Tab hinzu, bevor Cards in Tabbed Card V2 abgelegt werden.",
    "message.groupStatus": "Gruppenstatus: {ready} bereit, {pending} wartend, {blocked} blockiert.",
    "message.needsAttention": "Braucht Aufmerksamkeit: {entities}.",
    "message.needsAttentionCount": "{count} brauchen Aufmerksamkeit.",
    "message.selectedForHaPreview": "{entityId} für die HA-Card-Vorschau ausgewählt.",
    "message.selectedForDiagnosticsPreview": "{entityId} für die Diagnose-Statusvorschau ausgewählt.",
    "message.selectedForDiagnosticsWithStack": "{entityId} für Diagnose ausgewählt. Nutze die Checkbox, um sie in den Stapel-Export aufzunehmen.",
    "message.stackNeedsEntity": "{entityId} bleibt ausgewählt; der Stapel-Export braucht mindestens eine Entität.",
    "message.addedToStackPreview": "{entityId} zur Stapel-Vorschau hinzugefügt.",
    "message.removedFromStackPreview": "{entityId} aus der Stapel-Vorschau entfernt.",
    "message.entityRemoved": "{entityId} entfernt.",
    "message.justNow": "gerade eben",
    "message.minutesAgo": "vor {count} Min.",
    "message.hoursAgo": "vor {count} Std.",
    "message.sendServiceConfirm": "{service} an {entityId} senden?",
    "message.commandSent": "Befehl für {entityId} gesendet.",
    "message.noActiveConnection": "Keine aktive Home-Assistant-Verbindung.",
    "message.commandCompleted": "Befehl für {entityId} abgeschlossen.",
    "message.commandFailed": "Befehl für {entityId} fehlgeschlagen: {reason}",
    "message.unknownError": "Unbekannter Fehler.",
    "message.loadedEntities": "{count} Entitäten aus Home Assistant geladen.",
    "message.loadedEntitiesWithChanges": "{count} Entitäten aus Home Assistant geladen. Cache: +{added}, -{removed}.",
    "message.entitySyncIdle": "Entitäten: noch kein Home-Assistant-Katalog geladen.",
    "message.entitySyncCached": "Entitäten: Cache bereit · {count} Einträge.",
    "message.entitySyncing": "Entitäten: synchronisiere mit Home Assistant...",
    "message.entitySyncDone": "Entitäten: fertig · {count} geladen · +{added} / -{removed}.",
    "message.entitySyncFailed": "Entitäten: Fehler · {reason}",
    "message.entityListFailed": "Entitätsliste fehlgeschlagen: {reason}",
    "message.loadedResources": "{count} Lovelace-Ressourcen aus Home Assistant geladen. {total} Palette-Einträge erkannt, davon {hacs} /hacsfiles-Ressourcen.",
    "message.lovelaceFailed": "Lovelace-Ressourcen fehlgeschlagen: {reason}",
    "message.liveEntity": "Live-Entität: {entityId}",
    "message.demoEntityTarget": "Demo-Entität: {entityId}",
    "message.waitingForUpdates": "Warte auf Updates von {entityId}.",
    "message.demoControlsTarget": "Demo-Controls steuern {entityId}.",
    "message.tokenRequired": "Öffne zuerst die Atlas Administration auf Port 4175 und übergib die Verbindungseinstellungen.",
    "message.adminHandoffWaiting": "Warte auf Verbindungseinstellungen aus der Atlas Administration.",
    "message.adminHandoffReceived": "Verbindungseinstellungen aus der Atlas Administration empfangen.",
    "message.entityStateUpdated": "Entitätsstatus aktualisiert: {state}.",
    "message.titleCopied": "{title} aus der ausgewählten Entität kopiert.",
    "message.expertPreviewCleared": "Expert-Editor-Vorschau geleert.",
    "message.previewReset": "Vorschau zurückgesetzt.",
    "message.confirmPreviewReset": "Willst du es wirklich tun?",
    "message.groupRequiresNameAndEntity": "Gruppenname und mindestens eine Entität werden benötigt.",
    "message.groupSaved": "Gruppe {title} gespeichert.",
    "message.builtInGroupsCannotDelete": "Eingebaute Gruppen können nicht gelöscht werden.",
    "message.groupDeleted": "Gruppe gelöscht.",
    "message.selectGroupToDuplicate": "Wähle eine Gruppe zum Duplizieren aus.",
    "message.groupCreated": "Gruppe {title} erstellt.",
    "message.haCardCopied": "HA-Card {format} in die Zwischenablage kopiert.",
    "message.haCardExported": "HA-Card als {filename} exportiert.",
    "message.defaultAtlasEntitiesUsed": "Keine Entitäten ausgewählt. ATLAS-Beispielentitäten wurden für diesen Export eingesetzt: {entities}.",
    "message.exportCancelled": "Export abgebrochen.",
    "message.exportFailed": "Export fehlgeschlagen.",
    "message.exportPathHint": "Wähle einen Speicherort, wenn dein Browser das unterstützt, oder nutze den normalen Download-Fallback.",
    "message.savePickerUnavailable": "Dein Browser kann hier keinen Speicherort wählen. Nutze stattdessen Download.",
    "message.copyPreviewFailed": "Kopieren fehlgeschlagen: Nutze stattdessen den Vorschautext.",
    "message.problemReportHint": "Prüfe die Debug-Daten vor dem Kopieren oder Öffnen von GitHub. Home-Assistant-Tokens und Provider-API-Keys werden nie eingefügt.",
    "message.problemReportReady": "Problembericht-Vorschau erstellt. Bitte vor dem Teilen prüfen.",
    "message.problemReportCopied": "Problembericht in die Zwischenablage kopiert.",
    "message.problemReportCopyFailed": "Kopieren fehlgeschlagen: Nutze stattdessen den Vorschautext.",
    "message.problemIssueOpened": "GitHub-Issue mit geprüftem Debug-Bericht geöffnet.",
    "message.resourcesCopiedWithDependency": "ATLAS- und {dependency}-Lovelace-Ressourcen {format} in die Zwischenablage kopiert.",
    "message.atlasResourceCopied": "ATLAS-Lovelace-Ressource {format} in die Zwischenablage kopiert.",
    "message.copyDependencyFailed": "Kopieren fehlgeschlagen: Nutze stattdessen den Abhängigkeitspfad.",
    "message.importConfigurationConfirm": "{name} importieren: {groups} Gruppen und {entities} Entitäten?",
    "message.unnamedConfiguration": "Unbenannte Konfiguration",
    "message.configurationImported": "Konfiguration importiert: {groups} Gruppen und {entities} Entitäten.",
    "message.importConfigurationFailed": "Import fehlgeschlagen: ungültige Konfiguration.",
    "message.importPaused": "Import pausiert: Prüfe die Kompatibilitätsdetails, bevor dieses Artefakt gemappt wird.",
    "message.importRejected": "Import abgelehnt: nicht unterstütztes Home-Assistant-Card-Artefakt.",
    "message.haCardImported": "{type} {format} importiert: {title} mit {entities} Entitäten.",
    "message.importHaCardFailed": "Import fehlgeschlagen: ungültige Home-Assistant-Entities-Card als JSON oder YAML.",
    "message.pasteImportEmpty": "Füge zuerst YAML oder JSON ein.",
    "message.clipboardReadFailed": "Zwischenablage konnte nicht gelesen werden.",
    "message.fileReadFailed": "Datei konnte nicht gelesen werden.",
    "message.styleBlocksDetected": "Styles erkannt: {global} global, {cards} Card, {layout} Layout.",
    "message.noStyleBlocksDetected": "Keine card_mod/UIX-Style-Blöcke erkannt.",
    "message.entityStylesAssigned": "{count} Entity-Style-Blöcke sind in der Vorschau zugeordnet.",
    "message.hacsBundleInspected": "HACS-Bundle geprüft: {count} Dateien, Script {scriptFilename}.",
    "message.hacsBundleRejected": "HACS-Bundle abgelehnt: {reason}",
    "message.invalidDragPayload": "Gezogene Card konnte nicht gelesen werden.",
    "message.packageExported": "Card-Paket mit HACS-Script {scriptFilename} exportiert.",
    "message.scriptExported": "Card-Script als {scriptFilename} exportiert.",
    "message.bundleExported": "HACS-Bundle als {filename} mit {count} Dateien exportiert.",
    "message.cardExportLanguageHint": "EN ist der Pflicht-Fallback. Zusätzliche Sprachen werden aktuell als englische Fallback-Dateien exportiert. Bitte die entsprechenden Languagefiles vor der Veröffentlichung prüfen und übersetzen. Automatische Übersetzung braucht später eine Internetverbindung.",
    "message.packageExportedWithLanguages": "Card-Paket mit HACS-Script {scriptFilename} und Sprachen {languages} exportiert.",
    "message.bundleExportedWithLanguages": "HACS-Bundle als {filename} mit {count} Dateien und Sprachen {languages} exportiert.",
    "message.translationProviderReady": "Übersetzungsmodul aus Administration: {provider}.",
    "message.translationProviderNotConfigured": "Übersetzungsmodul aus Administration: nicht konfiguriert.",
    "message.translationFallbackNoProvider": "Automatische Übersetzung angefordert, aber kein Übersetzungsmodul ist konfiguriert. Fallback-Languagefiles werden exportiert.",
    "message.translationFallbackProviderPending": "Automatische Übersetzung mit {provider} angefordert. API-Endpunkt vorbereitet: {endpoint}. Provider-Ausführung ist noch nicht angebunden, daher werden Fallback-Languagefiles zur Prüfung exportiert.",
    "message.translationProviderMissingKey": "Automatische Übersetzung mit {provider} angefordert, aber in der Administration ist kein Provider-API-Key konfiguriert. Fallback-Languagefiles werden exportiert.",
    "message.translationProviderRequest": "Maschinelle Übersetzung mit {provider} wird angefragt: {percent}%.",
    "message.translationProviderComplete": "Maschinelle Übersetzung mit {provider} abgeschlossen: {languages}. Vor Veröffentlichung prüfen.",
    "message.translationProviderFailed": "Maschinelle Übersetzung mit {provider} fehlgeschlagen: {reason}. Fallback-Languagefiles werden exportiert.",
    "message.translationProgress": "Languagefiles werden vorbereitet: {percent}%.",
    "message.translationComplete": "Languagefiles vorbereitet: {percent}%.",
    "message.scriptFilenameNormalized": "HACS-Script-Dateiname wird als {scriptFilename} exportiert.",
    "message.atlasPackage": "ATLAS-Card-Paket",
    "message.haCard": "HA-Card",
    "dependency.resource": " Ressource: {paths}.",
    "dependency.installPath": " Installationspfad: {paths}.",
    "dependency.atlasFrontend": " ATLAS-Frontend: {paths}.",
    "dependency.builtIn": "Nutzt eine eingebaute Home-Assistant-Card.{atlasHint}",
    "dependency.requiresUnchecked": "Benötigt {dependency}.{resourceHint}{installHint}{atlasHint} Verbinde Home Assistant oder prüfe die Ressourcen.",
    "dependency.ready": "{dependency}- und ATLAS-Frontend-Ressourcen gefunden.{resourceHint}{atlasHint}",
    "dependency.cardFoundAtlasMissing": "{dependency}-Ressource gefunden.{resourceHint}{atlasHint} ATLAS-Frontend fehlt: {missing}.",
    "dependency.missing": "Benötigt {dependency}.{resourceHint}{installHint}{atlasHint} Fehlt: {missing}.",
    "text.allEntityTypes": "Alle Entitätstypen",
    "text.all": "Alle",
    "text.favorite": "Favorit",
    "text.scannedOnly": "Nur Scan",
    "text.builtIn": "Eingebaut",
    "text.resourceUnchecked": "Ressource ungeprüft",
    "text.resourceInstalled": "Ressource installiert",
    "text.resourceMissing": "Ressource fehlt",
    "text.temporaryResourceDebugUnchecked": "Temporärer Check: Noch keine Lovelace-Ressourcen geladen. Klicke Ressourcen prüfen, während Home Assistant verbunden ist.",
    "text.temporaryResourceDebugLoading": "Temporärer Check: Lovelace-Ressourcen angefordert, warte auf Home Assistant...",
    "text.temporaryResourceDebugRestLoading": "Temporärer Check: WebSocket hat noch nicht geantwortet. Versuche REST-Fallback...",
    "text.temporaryResourceDebugFailed": "Temporärer Check fehlgeschlagen: {reason}",
    "text.temporaryResourceDebugTimeout": "Temporärer Check: Home Assistant hat auf die Lovelace-Ressourcenanfrage nicht geantwortet. Die WebSocket-Verbindung ist aktiv, aber dieser Befehl ist für den aktuellen Benutzer oder die aktuelle Sitzung eventuell blockiert oder nicht unterstützt.",
    "text.temporaryResourceDebugSummary": "Temporärer Check ({source}): {total} Lovelace-Ressourcen, {hacs} HACS-Ressourcen, {known} bekannte Cards, {scanOnly} Scan-only-Ressourcen, {ignored} ignorierte/Nicht-Card-Ressourcen.",
    "text.temporaryResourceDebugEvents": "Debug-Verlauf",
    "text.temporaryResourceKnown": "Bekannte Cards",
    "text.temporaryResourceScanOnly": "Scan-only-Ressourcen",
    "text.temporaryResourceIgnored": "Ignoriert / keine Card",
    "text.demoEntity": "Demo-Entität",
    "text.noEntity": "keine Entität",
    "text.none": "keine",
    "text.entityName": "Entitätsname",
    "text.entityId": "Entitäts-ID",
    "text.cardIcon": "Icon",
    "text.cardTitle": "Titel",
    "text.cardName": "Cardname",
    "text.cardType": "Cardtyp",
    "text.cardSettings": "Einstellungen",
    "text.cardColumns": "Spalten",
    "text.cardRows": "Zeilen",
    "text.cardOptions": "Optionen",
    "text.containedCards": "Enthaltene Cards",
    "text.entityEntries": "Entitäten",
    "text.simplePrimaryEntity": "Simple erste Entität",
    "text.ready": "Bereit",
    "text.pending": "Wartend",
    "text.blocked": "Blockiert",
    "text.stackSelection": "Stapel-Auswahl",
    "text.entityPicker": "Entitätsauswahl",
    "text.styleCode": "Style-Code",
    "text.noSelectedCard": "Wähle eine Card auf der Editor-Fläche aus.",
    "text.waiting": "Wartet",
    "text.col": "Sp.",
    "text.row": "Zeile",
    "text.full": "voll",
    "text.auto": "auto",
    "text.categoryCore": "Core",
    "text.categoryCommunity": "Community",
    "text.registeredNotMapped": "{category} registriert, noch nicht gemappt",
    "text.paletteDetail": "{layout}, {size}, {target}",
    "text.scannedCardUnavailable": "{label} ist in Home Assistant registriert, aber ATLAS mappt diese Custom Card noch nicht.",
    "text.paletteCardSelected": "{label} aus der Card-Liste ausgewählt.",
    "text.paletteSelectionChanged": "Favoritenauswahl geändert. Nutze Favoriten speichern, um sie anzuwenden.",
    "text.noPaletteSearchResults": "Keine passenden Cards gefunden.",
    "text.fullCardListVisible": "Die volle Core- und Community-Card-Liste ist zur Favoritenauswahl sichtbar.",
    "text.savedFavoritesVisible": "Gespeicherte Favoriten sind sichtbar.",
    "text.favoritesSaved": "{count} Favoriten-Cards gespeichert.",
    "text.allCardsRemainVisible": "Favoritenauswahl gespeichert. Alle Cards bleiben sichtbar.",
    "text.allCardsVisibleAgain": "Alle Core- und Community-Cards sind wieder sichtbar.",
    "text.templateSizesReset": "Template-Größen auf Standard zurückgesetzt.",
    "text.removeField": "{field} entfernen",
    "text.fieldRemoved": "{field} aus der Expert-Editor-Vorschau entfernt.",
    "text.enterTitle": "Gib einen Titel ein, bevor du ihn übernimmst.",
    "text.titlePrepared": "{title} für das nächste Expert-Feld vorbereitet.",
    "text.titleApplied": "{title} als Expert-Feld-Titel gesetzt.",
    "text.targetUpdated": "{field} Card-Familie auf {target} geändert.",
    "text.bubbleTypeUpdated": "{field} Bubble-Button-Typ auf {type} gesetzt.",
    "text.entityPrepared": "{entityId} für das nächste Expert-Feld vorbereitet.",
    "text.entityAssigned": "{entityId} {title} zugewiesen.",
    "text.fieldSelected": "{field} auf der Expert-Editor-Fläche ausgewählt.",
    "text.selectFieldBeforeEditing": "Wähle ein Expert-Feld aus, bevor du es bearbeitest.",
    "text.editHandlesEnabled": "{field} Bearbeitungsanfasser aktiviert.",
    "text.editHandlesHidden": "{field} Bearbeitungsanfasser ausgeblendet.",
    "text.overlappingField": "überlappt ein anderes Feld",
    "text.expertFieldsSummary": "Expert-Felder: {count} ({populated} belegt{empty})",
    "text.emptyFieldsSummary": ", {count} leer",
    "text.rowsSummary": "Zeilen: {count}",
    "text.surfaceSummary": "Fläche: {columns}x{rows}",
    "text.overlapsSummary": "Überlappungen: {count}",
    "text.targetsSummary": "Ziele: {targets}",
    "text.layoutsSummary": "Layouts: {layouts}",
    "text.expertFieldsZero": "Expert-Felder: 0.",
    "text.fieldAdded": "{field} zur Expert-Editor-Vorschau hinzugefügt.",
    "text.fieldPlaced": "{field} auf der Expert-Editor-Fläche platziert.",
    "text.tabbedCardContainer": "{count} Tabs",
    "text.tabCardCount": "{count} Cards",
    "palette.core-entity": "Entität",
    "palette.core-entities": "Entitäten",
    "palette.core-button": "Button",
    "palette.core-grid": "Raster",
    "palette.core-sensor": "Sensor",
    "palette.core-horizontal-stack": "Horizontaler Stapel",
    "palette.core-vertical-stack": "Vertikaler Stapel",
    "palette.core-thermostat": "Thermostat",
    "palette.core-link": "Verknüpfung",
    "palette.core-webpage": "Webseite",
    "palette.community-mushroom-template": "Mushroom Template",
    "palette.community-bubble-state": "Bubble Status",
    "palette.community-bubble-switch": "Bubble Switch",
    "palette.community-bubble-slider": "Bubble Slider",
    "palette.community-bubble-name": "Bubble Name",
    "palette.community-tabbed-card-v2": "Tabbed Card V2",
    "target.entities": "Entitäten",
    "target.glance": "Übersicht / Glance",
    "target.entity": "Entität",
    "target.button": "Button",
    "target.sensor": "Sensor",
    "target.thermostat": "Thermostat",
    "target.link": "Verknüpfung",
    "target.webpage": "Webseite",
    "target.mushroom-template": "Mushroom Template",
    "target.bubble": "Bubble",
    "target.tabbed-card-v2": "Tabbed Card V2",
    "template.entity-list": "Entitätenliste",
    "template.glance-card": "Übersicht / Glance",
    "template.entity-card": "Entität",
    "template.button-card": "Button",
    "template.grid": "Raster",
    "template.sensor-card": "Sensor",
    "template.horizontal-stack": "Horizontaler Stapel",
    "template.vertical-stack": "Vertikaler Stapel",
    "template.thermostat-card": "Thermostat",
    "template.link-card": "Verknüpfung",
    "template.webpage-card": "Webseite",
    "template.tabbed-card-v2": "Tabbed Card V2",
    "template.state-button": "Status-Button",
    "template.switch-button": "Switch-Button",
  },
};
let emptyEntitySelectionMessage = translations.en["message.emptySelection"];

function t(key, values = {}) {
  let text = translations[currentLanguage]?.[key] ?? translations.en[key] ?? key;
  for (const [name, value] of Object.entries(values)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}

function applyTranslations() {
  document.documentElement.lang = currentLanguage;
  document.title = t("page.title");
  emptyEntitySelectionMessage = t("message.emptySelection");
  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }
  for (const element of document.querySelectorAll("[data-i18n-placeholder]")) {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  }
  for (const element of document.querySelectorAll("[data-i18n-aria-label]")) {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  }
  for (const element of document.querySelectorAll("[data-i18n-title]")) {
    element.title = t(element.dataset.i18nTitle);
  }
  for (const button of languageButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.language === currentLanguage));
  }
  for (const button of themeButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.themeMode === currentThemePreference));
  }
  renderEntityCatalogSyncStatus();
  renderConnectionPanelState();
}

function setLanguage(language) {
  currentLanguage = language === "de" ? "de" : "en";
  applyTranslations();
  renderCardTargetOptions(haCardTarget.value);
  renderExpertEditorOptions();
  renderGroupOptions(homeAssistantGroup.value);
  renderEntityDomainOptions();
  renderExpertTemplatePalette();
  renderEditorMode(activeEditorMode);
  renderEntityList();
  renderConnectionReadiness();
  renderCardTranslationModuleStatus();
  renderTemporaryHaCardResourceList();
  persistConfiguration();
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

function normalizeEditorStartMode(value) {
  return value === "expert" ? "expert" : "simple";
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
  bindAdminNavigationLinks();
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

function maybeTranslate(key, fallback) {
  return translations[currentLanguage]?.[key] ?? translations.en[key] ?? fallback;
}

function translateCardTarget(target, fallback = target) {
  return maybeTranslate(`target.${target}`, fallback);
}

function translateTemplateLabel(templateId, fallback = templateId) {
  return maybeTranslate(`template.${templateId}`, fallback);
}

function expertPaletteTargetLabel(card, template) {
  if (card.target === "tabbed-card-v2") return translateCardTarget(card.target, card.target);
  if (template?.layout === "horizontal-stack" || template?.layout === "vertical-stack" || template?.layout === "grid") {
    return translateTemplateLabel(template.id, template.label);
  }
  return translateCardTarget(card.target, card.target);
}

function expertFieldTypeLabel(field) {
  if (field.target === "tabbed-card-v2") return translateCardTarget(field.target, field.target);
  if ((field.layout ?? "card") === "horizontal-stack") return translateTemplateLabel("horizontal-stack", "Horizontal stack");
  if ((field.layout ?? "card") === "vertical-stack") return translateTemplateLabel("vertical-stack", "Vertical stack");
  if ((field.layout ?? "card") === "grid") return translateTemplateLabel("grid", "Grid");
  return translateCardTarget(field.target, field.target);
}

function shouldShowExpertFieldEntity(field) {
  return !isEditableContainerField(field) && (field.layout ?? "card") !== "grid";
}

function translatePaletteCardLabel(card) {
  return card.scanned === true
    ? card.label
    : maybeTranslate(`palette.${card.id}`, card.label);
}

function translatePaletteCategory(category) {
  if (category === "Core") return t("text.categoryCore");
  if (category === "Community") return t("text.categoryCommunity");
  return category;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function expertFieldTitleBase(templateId, target = expertTarget.value) {
  if (templateId === "tabbed-card-v2" || target === "tabbed-card-v2") return "Tabbed";
  if (templateId === "vertical-stack") return "Vertical";
  if (templateId === "horizontal-stack") return "Horizontal";
  if (target === "bubble") return "Bubble";
  if (target === "mushroom-template") return "Mushroom";
  const baseByTemplate = {
    "entity-list": "Entities",
    "glance-card": "Glance",
    "entity-card": "Entity",
    "button-card": "Button",
    grid: "Grid",
    "sensor-card": "Sensor",
    "thermostat-card": "Thermostat",
    "link-card": "Link",
    "webpage-card": "Webpage",
    "state-button": "Bubble",
    "switch-button": "Bubble",
  };
  return baseByTemplate[templateId] ?? "Card";
}

function listExpertEditorCardTitles() {
  return expertEditorFields.flatMap(field => [
    field.id,
    ...(field.entries ?? []).flatMap(entry => [
      entry.id,
      ...(entry.cards ?? []).map(card => card.id),
    ]),
  ]).filter(Boolean);
}

function nextExpertEditorTitle(templateId, target = expertTarget.value) {
  const base = expertFieldTitleBase(templateId, target);
  const titlePattern = new RegExp(`^${escapeRegExp(base)}(?:\\s+(\\d+))?$`, "i");
  const maxNumber = listExpertEditorCardTitles().reduce((highest, title) => {
    const match = String(title).trim().match(titlePattern);
    if (!match) return highest;
    return Math.max(highest, match[1] ? Number(match[1]) : 1);
  }, 0);
  return `${base} ${maxNumber + 1}`;
}

function expertTitleIsExisting(title) {
  const normalizedTitle = title.trim().toLowerCase();
  return listExpertEditorCardTitles().some(existingTitle => String(existingTitle).trim().toLowerCase() === normalizedTitle);
}

function expertTitleForNewField(templateId, proposedTitle) {
  const title = proposedTitle?.trim() ?? "";
  return title && !expertTitleIsExisting(title)
    ? title
    : nextExpertEditorTitle(templateId);
}

function expertTitleForNewCardEntry(target, proposedTitle) {
  const title = proposedTitle?.trim() ?? "";
  const templateId = templateIdForCardTarget(target);
  return title && !expertTitleIsExisting(title)
    ? title
    : nextExpertEditorTitle(templateId, target);
}

let expertPaletteCards = [
  { id: "core-entity", category: "Core", label: "Entity", templateId: "entity-card", target: "entity", preview: ["type: entity"] },
  { id: "core-entities", category: "Core", label: "Entities", templateId: "entity-list", target: "entities", preview: ["Entity list"] },
  { id: "core-glance", category: "Core", label: "Overview / Glance", templateId: "glance-card", target: "glance", preview: ["type: glance", "entities"] },
  { id: "core-button", category: "Core", label: "Button", templateId: "button-card", target: "button", preview: ["type: button"] },
  { id: "core-grid", category: "Core", label: "Grid", templateId: "grid", target: "entities", preview: ["type: grid"] },
  { id: "core-sensor", category: "Core", label: "Sensor", templateId: "sensor-card", target: "sensor", preview: ["type: sensor"] },
  { id: "core-horizontal-stack", category: "Core", label: "Horizontal stack", templateId: "horizontal-stack", target: "entities", preview: ["Cards in a row"] },
  { id: "core-vertical-stack", category: "Core", label: "Vertical stack", templateId: "vertical-stack", target: "entities", preview: ["Cards in a column"] },
  { id: "core-thermostat", category: "Core", label: "Thermostat", templateId: "thermostat-card", target: "thermostat", preview: ["type: thermostat"] },
  { id: "core-link", category: "Core", label: "Link", templateId: "link-card", target: "link", preview: ["navigate"] },
  { id: "core-webpage", category: "Core", label: "Webpage", templateId: "webpage-card", target: "webpage", preview: ["type: iframe"] },
  { id: "community-mushroom-template", category: "Community", label: "Mushroom template", templateId: "state-button", target: "mushroom-template", preview: ["Primary / secondary"] },
  { id: "community-tabbed-card-v2", category: "Community", label: "Tabbed Card V2", templateId: "tabbed-card-v2", target: "tabbed-card-v2", preview: ["custom:tabbed-card-v2", "tabs"] },
  { id: "community-bubble-state", category: "Community", label: "Bubble state", templateId: "state-button", target: "bubble", bubbleButtonType: "state", preview: ["button_type: state"] },
  { id: "community-bubble-switch", category: "Community", label: "Bubble switch", templateId: "switch-button", target: "bubble", bubbleButtonType: "switch", preview: ["button_type: switch"] },
  { id: "community-bubble-slider", category: "Community", label: "Bubble slider", templateId: "state-button", target: "bubble", bubbleButtonType: "slider", preview: ["button_type: slider"] },
  { id: "community-bubble-name", category: "Community", label: "Bubble name", templateId: "state-button", target: "bubble", bubbleButtonType: "name", preview: ["button_type: name"] },
];
const expertEditorFields = [];
const expertPaletteFavoriteIds = new Set();
const expertPaletteDraftFavoriteIds = new Set();
const expertTemplateSizing = new Map(cardEditorTemplates.map(template => [
  template.id,
  {
    columns: String(template.defaultWidth),
    rows: "auto",
  },
]));
const expertGridBaseColumns = 12;
const expertGridBaseRows = 12;
const expertGridMaxExtraColumns = 5;
const expertGridMaxExtraRows = 5;
const expertGridDefaultCellSize = 52;
const expertGridGap = 4;
const expertGridMinCellSize = 40;
const expertGridMaxCellSize = 72;
let expertGridCellSize = expertGridDefaultCellSize;
let expertGridColumns = expertGridBaseColumns;
let expertGridRows = expertGridBaseRows;
const expertFieldMaxResizeDelta = 5;
let expertEditorSurfaceSize = { columns: 0, rows: 0 };
let expertDragFieldOffset = { column: 0, row: 0 };
let connection;
let removeLifecycleListener;
let removeServiceResultListener;
let removeEntityStateListListener;
let removeLovelaceResourceListener;
let panelBinding;
let activeTransport;
let removeEntityListListener;
let adminConnectionToken = "";
let adminTranslationProvider = "none";
let adminTranslationApiEndpoint = "https://api.deepl.com/v2/translate";
let adminTranslationApiKeyConfigured = false;
let adminTranslationApiKeyConfiguredByProvider = {};
let reconnectToken;
let reconnectTimer;
let reconnectAttempts = 0;
let connectionLifecycleState = "closed";
let activeConnectionSignature = "";
let lovelaceResources = [];
let lovelaceResourcesChecked = false;
let lovelaceResourceRequestTimer;
let activeLovelaceResourceRequestId;
const lovelaceResourceDebugEvents = [];
let activeEditorMode = "simple";
let importedSimpleCard;
let importedSimpleCodePreview;
let importedSimpleStyleInspection;
let importedSimpleEntityNames = new Map();
let applyingImportedSimpleSummary = false;
let expertPaletteShowAllCards = false;
let expertPaletteSearchQuery = "";
let selectedExpertFieldIndex = -1;
let expertFieldEditing = false;
let selectedContainerCardRef;
const entitySnapshots = new Map();
const knownEntityIds = new Set();
const cachedHomeAssistantEntityIds = new Set();
let entityCatalogRevision = 0;
let cachedEntityPickerCatalog = [];
let cachedEntityPickerDomains = [];
let cachedEntityPickerSignature = "";
let entityPickerRenderTimer;
let entityTableSort = { key: "type", direction: "asc" };
let entityCatalogSyncStatus = { state: "idle", count: 0, added: 0, removed: 0, reason: "" };
const stackSelectedEntityIds = new Set();
let statusPreviewEntityId;
let pendingImport;
let initialEditorMode = "simple";
let initialGroupSelection = "overview";
let initialCardTarget = "entities";
let panelGroups = [
  createHomeAssistantPanelGroup({ id: "overview", title: "Overview", entityIds: ["binary_sensor.atlas_status", "sensor.atlas_temperature"] }),
  createHomeAssistantPanelGroup({ id: "energy", title: "Energy", entityIds: ["sensor.atlas_power", "sensor.atlas_energy"] }),
  createHomeAssistantPanelGroup({ id: "safety", title: "Safety", entityIds: ["binary_sensor.atlas_status", "binary_sensor.atlas_door"] }),
];
for (const group of panelGroups) {
  for (const entityId of group.entityIds) {
    knownEntityIds.add(entityId);
  }
}
loadCachedEntityCatalog();
restoreThemePreference();

try {
  const savedConfiguration = JSON.parse(localStorage.getItem(configurationStorageKey) ?? "null");
  if (savedConfiguration?.language === "de" || savedConfiguration?.language === "en") {
    currentLanguage = savedConfiguration.language;
  }
  restoreThemePreference(savedConfiguration?.themePreference);
  if (typeof savedConfiguration?.url === "string") {
    homeAssistantUrl.value = savedConfiguration.url;
  }
  if (typeof savedConfiguration?.entities === "string") {
    homeAssistantEntity.value = savedConfiguration.entities;
    initialGroupSelection = "custom";
  }
  if (typeof savedConfiguration?.entityDomain === "string") {
    homeAssistantEntityDomain.value = savedConfiguration.entityDomain;
  }
  if (typeof savedConfiguration?.entitySearch === "string") {
    homeAssistantEntitySearch.value = savedConfiguration.entitySearch;
  }
  if (Array.isArray(savedConfiguration?.stackEntityIds)) {
    for (const entityId of savedConfiguration.stackEntityIds) {
      if (typeof entityId === "string" && entityId.trim()) {
        stackSelectedEntityIds.add(entityId.trim());
      }
    }
  }
  if (Array.isArray(savedConfiguration?.expertPaletteFavoriteIds)) {
    for (const paletteId of savedConfiguration.expertPaletteFavoriteIds) {
      if (typeof paletteId === "string" && paletteId.trim()) {
        expertPaletteFavoriteIds.add(paletteId);
        expertPaletteDraftFavoriteIds.add(paletteId);
      }
    }
  }
  if (Array.isArray(savedConfiguration?.expertTemplateSizing)) {
    for (const entry of savedConfiguration.expertTemplateSizing) {
      if (typeof entry?.templateId === "string" && cardEditorTemplates.some(template => template.id === entry.templateId)) {
        expertTemplateSizing.set(entry.templateId, normalizeExpertTemplateSizing(entry));
      }
    }
  }
  if (savedConfiguration?.expertEditorSurfaceSize && typeof savedConfiguration.expertEditorSurfaceSize === "object") {
    expertEditorSurfaceSize = {
      columns: clampExpertEditorSurfaceDelta(savedConfiguration.expertEditorSurfaceSize.columns),
      rows: clampExpertEditorSurfaceDelta(savedConfiguration.expertEditorSurfaceSize.rows, expertGridMaxExtraRows),
    };
  }
  expertGridCellSize = clampExpertGridCellSize(savedConfiguration?.expertGridCellSize);
  if (Array.isArray(savedConfiguration?.expertEditorFields)) {
    expertEditorFields.push(...createHomeAssistantCardEditorPackagePlan({
      editorMode: "expert",
      fields: savedConfiguration.expertEditorFields,
    }).fields);
  }
  if (Number.isInteger(savedConfiguration?.selectedExpertFieldIndex)) {
    selectedExpertFieldIndex = Math.max(-1, Math.min(expertEditorFields.length - 1, savedConfiguration.selectedExpertFieldIndex));
  }
  if (savedConfiguration?.editorMode === "expert") {
    initialEditorMode = "expert";
  }
  if (typeof savedConfiguration?.expertCardName === "string") {
    expertCardName.value = savedConfiguration.expertCardName;
  }
  if (savedConfiguration?.diagnosticsOpen === true) {
    diagnosticsPanel.open = true;
  }
  if (Array.isArray(savedConfiguration?.groups)) {
    panelGroups = savedConfiguration.groups.map(createHomeAssistantPanelGroup);
  }
  if (typeof savedConfiguration?.cardTarget === "string" && cardTargets.some(descriptor => descriptor.target === savedConfiguration.cardTarget)) {
    initialCardTarget = savedConfiguration.cardTarget;
  }
  if (savedConfiguration?.cardLayout === "single" || savedConfiguration?.cardLayout === "horizontal-stack" || savedConfiguration?.cardLayout === "vertical-stack") {
    haCardLayout.value = savedConfiguration.cardLayout;
  }
  if (savedConfiguration?.cardFormat === "json" || savedConfiguration?.cardFormat === "yaml") {
    haCardFormat.value = savedConfiguration.cardFormat;
  }
  if (savedConfiguration?.cardStyleExport === "card-mod" || savedConfiguration?.cardStyleExport === "uix-style") {
    haCardStyleExport.value = savedConfiguration.cardStyleExport;
  }
  if (typeof savedConfiguration?.cardScriptFilename === "string") {
    haCardScriptFilename.value = savedConfiguration.cardScriptFilename;
  }
  if (Array.isArray(savedConfiguration?.cardExportLanguages)) {
    const selectedLanguages = new Set(savedConfiguration.cardExportLanguages.filter(language => typeof language === "string"));
    for (const input of cardExportLanguageInputs) {
      input.checked = input.dataset.cardExportLanguage === "en" || selectedLanguages.has(input.dataset.cardExportLanguage);
    }
  }
  if (typeof savedConfiguration?.cardAutoTranslate === "boolean") {
    cardAutoTranslate.checked = savedConfiguration.cardAutoTranslate;
  }
  if (typeof savedConfiguration?.adminTranslationProvider === "string") {
    adminTranslationProvider = normalizeTranslationProvider(savedConfiguration.adminTranslationProvider);
  }
  if (typeof savedConfiguration?.adminTranslationApiEndpoint === "string") {
    adminTranslationApiEndpoint = normalizeTranslationApiEndpoint(savedConfiguration.adminTranslationApiEndpoint);
  }
  if (savedConfiguration?.adminTranslationApiKeyConfiguredByProvider && typeof savedConfiguration.adminTranslationApiKeyConfiguredByProvider === "object") {
    adminTranslationApiKeyConfiguredByProvider = normalizeTranslationApiKeyConfiguredByProvider(
      savedConfiguration.adminTranslationApiKeyConfiguredByProvider,
    );
  }
  if (typeof savedConfiguration?.adminTranslationApiKeyConfigured === "boolean") {
    adminTranslationApiKeyConfigured = getProviderApiKeyConfigured(
      adminTranslationProvider,
      adminTranslationApiKeyConfiguredByProvider,
      savedConfiguration.adminTranslationApiKeyConfigured,
    );
  } else {
    adminTranslationApiKeyConfigured = getProviderApiKeyConfigured(
      adminTranslationProvider,
      adminTranslationApiKeyConfiguredByProvider,
      adminTranslationApiKeyConfigured,
    );
  }
  if (typeof savedConfiguration?.selectedGroup === "string") {
    initialGroupSelection = savedConfiguration.selectedGroup;
  }
} catch {
  // The demo remains usable when browser storage is unavailable or malformed.
}

const tokens = createThemeTokens({
  colorBackground: "#f5f7fb",
  colorSurface: "#ffffff",
  colorText: "#172033",
  colorAccent: "#0f766e",
  spacing: "20px",
});
const panel = createHomeAssistantStatusPanel({
  id: "atlas-status-demo",
  title: "ATLAS status",
  targetIdentifier: "atlas-status-root",
});
const panelRegistry = createHomeAssistantStatusPanelRegistry([panel]);
const transport = createInMemoryHomeAssistantEntityStateTransport();

function renderCardTargetOptions(selectedTarget = haCardTarget.value || "entities") {
  haCardTarget.replaceChildren();
  for (const descriptor of cardTargets) {
    const option = document.createElement("option");
    option.value = descriptor.target;
    option.textContent = translateCardTarget(descriptor.target, descriptor.label);
    haCardTarget.append(option);
  }
  haCardTarget.value = cardTargets.some(descriptor => descriptor.target === selectedTarget) ? selectedTarget : "entities";
  syncCardLayoutState();
}

function renderEditorMode(mode = "simple") {
  const expert = mode === "expert";
  activeEditorMode = expert ? "expert" : "simple";
  panelGroupControl.hidden = expert;
  groupNameControl.hidden = expert;
  cardTargetControl.hidden = expert;
  cardLayoutControl.hidden = expert;
  cardStyleExportControl.hidden = !expert;
  saveHomeAssistantGroup.hidden = expert;
  deleteHomeAssistantGroup.hidden = expert;
  duplicateHomeAssistantGroup.hidden = expert;
  simpleEntityControls.hidden = false;
  simpleCardSection.hidden = expert;
  expertEditorSection.hidden = !expert;
  for (const button of editorModeButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.editorMode === activeEditorMode));
  }
  exportHaCardConfig.textContent = expert ? t("button.exportExpertHaCard") : t("button.exportHaCard");
  copyHaCardConfig.textContent = expert ? t("button.copyExpertHaCard") : t("button.copyHaCard");
  copyHaCardResources.textContent = expert ? t("button.copyExpertResources") : t("button.copyResources");
  renderHaCardPreview();
  renderExpertEditorPreview();
}

function renderExpertEditorOptions() {
  const selectedTemplate = expertTemplate.value || cardEditorTemplates[0]?.id || "";
  const selectedTarget = expertTarget.value || "bubble";
  const selectedBubbleButtonType = expertBubbleButtonType.value || "state";

  expertTemplate.replaceChildren();
  for (const template of cardEditorTemplates) {
    const option = document.createElement("option");
    option.value = template.id;
    option.textContent = translateTemplateLabel(template.id, template.label);
    expertTemplate.append(option);
  }
  expertTemplate.value = cardEditorTemplates.some(template => template.id === selectedTemplate)
    ? selectedTemplate
    : cardEditorTemplates[0]?.id || "";

  expertTarget.replaceChildren();
  for (const descriptor of cardTargets) {
    const option = document.createElement("option");
    option.value = descriptor.target;
    option.textContent = translateCardTarget(descriptor.target, descriptor.label);
    expertTarget.append(option);
  }
  expertTarget.value = cardTargets.some(descriptor => descriptor.target === selectedTarget) ? selectedTarget : "bubble";
  expertBubbleButtonType.replaceChildren();
  for (const type of bubbleButtonTypes) {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    expertBubbleButtonType.append(option);
  }
  expertBubbleButtonType.value = bubbleButtonTypes.includes(selectedBubbleButtonType) ? selectedBubbleButtonType : "state";
  syncExpertBubbleTypeControl();
}

function syncExpertBubbleTypeControl() {
  const isBubble = expertTarget.value === "bubble";
  expertBubbleTypeControl.hidden = !isBubble;
  expertBubbleButtonType.disabled = !isBubble;
}

function syncCardLayoutState() {
  const supportsStackLayout = haCardTarget.value === "mushroom-template" || haCardTarget.value === "bubble";
  haCardLayout.disabled = !supportsStackLayout;
  if (!supportsStackLayout) {
    haCardLayout.value = "single";
  }
}

async function renderEntityState(state) {
  const registeredPanel = findHomeAssistantStatusPanel(panelRegistry, panel.id);
  if (!registeredPanel) {
    statusMessage.textContent = t("message.statusPanelNotRegistered");
    return;
  }
  if (trackedEntityIds().length === 0) {
    renderEmptyStatusPreview();
    statusMessage.textContent = emptyEntitySelectionMessage;
    return;
  }

  await transport.publish(createHomeAssistantEntityState({
    entityId: currentEntityId(),
    state,
  }));
}

function renderConnectionReadiness() {
  const configuration = createHomeAssistantConnectionConfiguration({ url: homeAssistantUrl.value });
  const readiness = inspectHomeAssistantConnectionReadiness(configuration);
  connectionReadiness.textContent = readiness.ready
    ? t("message.connectionUrlReady", { url: deriveHomeAssistantWebSocketUrl(configuration) })
    : readiness.reason;
  renderConnectionPanelState();
}

function renderAdminHandoffState() {
  adminHandoffState.textContent = adminConnectionToken || adminTranslationProvider !== "none"
    ? t("message.adminHandoffReceived")
    : t("message.adminHandoffWaiting");
}

function renderCardTranslationModuleStatus() {
  const provider = normalizeTranslationProvider(adminTranslationProvider);
  const text = provider === "none"
    ? t("message.translationProviderNotConfigured")
    : t("message.translationProviderReady", { provider });
  cardTranslationStatus.textContent = text;
  adminTranslationModuleState.textContent = text;
  renderConnectionPanelState();
}

function renderConnectionPanelState() {
  if (!homeAssistantConnectionSummary || !homeAssistantConnectionDetails) {
    return;
  }

  const disconnected = connectionLifecycleState === "closed" || connectionLifecycleState === "failed";
  const missingToken = !adminConnectionToken;
  const problem = disconnected || missingToken;
  const count = entityCatalogSyncStatus.count ?? cachedHomeAssistantEntityIds.size ?? 0;
  homeAssistantConnectionDetails.dataset.connectionState = problem
    ? (connectionLifecycleState === "failed" ? "failed" : "closed")
    : connectionLifecycleState;

  if (connectionLifecycleState === "connected") {
    homeAssistantConnectionSummary.textContent = t("message.connectionSummaryConnected", { count });
  } else if (connectionLifecycleState === "connecting" || connectionLifecycleState === "authenticating") {
    homeAssistantConnectionSummary.textContent = t("message.connectionSummaryConnecting");
  } else if (connectionLifecycleState === "failed") {
    homeAssistantConnectionSummary.textContent = t("message.connectionSummaryFailed");
  } else {
    homeAssistantConnectionSummary.textContent = t("message.connectionSummaryClosed");
  }

  if (connectionWarning) {
    connectionWarning.hidden = !problem;
    connectionWarning.textContent = problem
      ? t(isHomeAssistantAppSurface() ? "message.connectionProblemAddon" : "message.connectionProblemStandalone")
      : "";
  }

  homeAssistantConnectionDetails.open = problem;
}

function normalizeTranslationProvider(value) {
  return translationProviderValues.includes(value) ? value : "none";
}

function normalizeTranslationApiEndpoint(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "https://api.deepl.com/v2/translate";
  }

  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.toString() : "https://api.deepl.com/v2/translate";
  } catch {
    return "https://api.deepl.com/v2/translate";
  }
}

function normalizeTranslationApiKeyConfiguredByProvider(value) {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    translationProviderValues
      .filter(provider => provider !== "none" && typeof value[provider] === "boolean")
      .map(provider => [provider, value[provider]]),
  );
}

function hasProviderApiKeyConfiguredEntry(provider, configuredByProvider) {
  return Object.prototype.hasOwnProperty.call(configuredByProvider, normalizeTranslationProvider(provider));
}

function getProviderApiKeyConfigured(provider, configuredByProvider, fallback = false) {
  const normalizedProvider = normalizeTranslationProvider(provider);
  return hasProviderApiKeyConfiguredEntry(normalizedProvider, configuredByProvider)
    ? configuredByProvider[normalizedProvider] === true
    : fallback;
}

function readAdminConnectionCookie() {
  const cookie = document.cookie
    .split("; ")
    .find(entry => entry.startsWith(`${adminConnectionCookieName}=`));
  if (!cookie) return;

  try {
    return JSON.parse(decodeURIComponent(cookie.slice(adminConnectionCookieName.length + 1)));
  } catch {
    return undefined;
  }
}

function hasConfiguredTranslationProvider(settings) {
  return normalizeTranslationProvider(settings?.translationProvider) !== "none";
}

function mergeAdminConnectionSettings(primary, fallback) {
  if (!primary) {
    return fallback;
  }
  if (!fallback) {
    return primary;
  }

  const merged = { ...fallback, ...primary };
  if (!hasConfiguredTranslationProvider(primary) && hasConfiguredTranslationProvider(fallback)) {
    merged.translationProvider = fallback.translationProvider;
    merged.translationApiEndpoint = fallback.translationApiEndpoint;
    merged.translationApiKeyConfigured = fallback.translationApiKeyConfigured;
    merged.translationApiKeyConfiguredByProvider = fallback.translationApiKeyConfiguredByProvider;
  }
  return merged;
}

function applyAdminConnectionSettings(settings, { autoConnect = false } = {}) {
  if (!settings || typeof settings !== "object") {
    return false;
  }

  let appliedSettings = false;
  if (typeof settings.url === "string" && settings.url.trim()) {
    homeAssistantUrl.value = settings.url.trim();
    appliedSettings = true;
  }
  if (typeof settings.token === "string") {
    adminConnectionToken = settings.token;
    appliedSettings = true;
  }
  const incomingTranslationProvider = normalizeTranslationProvider(settings.translationProvider);
  const nextTranslationProvider = incomingTranslationProvider === "none" && adminTranslationProvider !== "none"
    ? adminTranslationProvider
    : incomingTranslationProvider;
  if (typeof settings.editorStartMode === "string") {
    initialEditorMode = normalizeEditorStartMode(settings.editorStartMode);
    renderEditorMode(initialEditorMode);
    appliedSettings = true;
  }
  if (nextTranslationProvider !== adminTranslationProvider) {
    appliedSettings = true;
  }
  adminTranslationProvider = nextTranslationProvider;
  if (typeof settings.translationApiEndpoint === "string" || incomingTranslationProvider !== "none") {
    adminTranslationApiEndpoint = normalizeTranslationApiEndpoint(settings.translationApiEndpoint);
  }

  const incomingConfiguredByProvider = normalizeTranslationApiKeyConfiguredByProvider(settings.translationApiKeyConfiguredByProvider);
  if (Object.keys(incomingConfiguredByProvider).length) {
    adminTranslationApiKeyConfiguredByProvider = {
      ...adminTranslationApiKeyConfiguredByProvider,
      ...incomingConfiguredByProvider,
    };
    adminTranslationApiKeyConfigured = getProviderApiKeyConfigured(
      adminTranslationProvider,
      adminTranslationApiKeyConfiguredByProvider,
      settings.translationApiKeyConfigured === true,
    );
    appliedSettings = true;
  } else if (typeof settings.translationApiKeyConfigured === "boolean") {
    adminTranslationApiKeyConfigured = settings.translationApiKeyConfigured;
    adminTranslationApiKeyConfiguredByProvider = {
      ...adminTranslationApiKeyConfiguredByProvider,
      [adminTranslationProvider]: settings.translationApiKeyConfigured,
    };
    appliedSettings = true;
  }
  renderCardTranslationModuleStatus();
  renderConnectionReadiness();
  renderAdminHandoffState();
  persistConfiguration();

  if ((autoConnect || settings.autoConnectEditor === true || settings.autoConnect === true) && adminConnectionToken) {
    connectHomeAssistant();
  }

  return appliedSettings;
}

async function fetchAdminConnectionSettings() {
  try {
    const response = await fetch(adminConnectionApiUrl, {
      cache: "no-store",
      mode: "cors",
    });
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  } catch {
    return undefined;
  }
}

async function applyStoredAdminConnectionSettings({ autoConnect = false } = {}) {
  const serverSettings = await fetchAdminConnectionSettings();
  const cookieSettings = readAdminConnectionCookie();
  const applied = applyAdminConnectionSettings(
    mergeAdminConnectionSettings(serverSettings, cookieSettings),
    { autoConnect },
  );
  if (applied) {
    statusMessage.textContent = t("message.adminHandoffReceived");
  }
  return applied;
}

function receiveAdminConnectionHandoff(event) {
  if (event.origin !== adminOrigin || event.data?.type !== "atlas.admin.connection.v1") {
    return;
  }

  applyAdminConnectionSettings(event.data);
  statusMessage.textContent = t("message.adminHandoffReceived");
}

function requestAdminConnectionHandoff() {
  if (!window.opener || window.opener.closed) {
    return;
  }

  window.opener.postMessage({
    type: "atlas.editor.ready.v1",
    sentAt: new Date().toISOString(),
  }, adminOrigin);
}

function createAdminNavigationUrl() {
  return createPortNavigationUrl(4175, "/", createThemeSearch());
}

function createHubNavigationUrl() {
  return createPortNavigationUrl(4176, "/hub", createThemeSearch());
}

function createThemeSearch() {
  const search = new URLSearchParams();
  search.set("theme", currentThemePreference);
  return search.toString();
}

function createCurrentSurfaceUrl(path) {
  try {
    const baseUrl = new URL(window.location.href);
    if (!baseUrl.pathname.endsWith("/")) {
      baseUrl.pathname = `${baseUrl.pathname}/`;
    }
    baseUrl.search = "";
    baseUrl.hash = "";
    return new URL(path, baseUrl).toString();
  } catch {
    return path;
  }
}

function isHomeAssistantAppSurface() {
  try {
    const url = new URL(window.location.href);
    return url.port === "4176"
      || url.pathname.includes("/api/hassio_ingress/")
      || url.pathname.includes("/ingress/");
  } catch {
    return false;
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
    const url = new URL(window.location.href);
    url.port = String(port);
    url.pathname = pathname;
    url.search = search;
    url.hash = "";
    return url.toString();
  } catch {
    return fallback;
  }
}

function bindAdminNavigationLinks() {
  const adminNavigationUrl = createAdminNavigationUrl();
  for (const link of openAdminLinks) {
    link.href = adminNavigationUrl;
  }
  const hubNavigationUrl = createHubNavigationUrl();
  for (const link of openHubLinks) {
    link.href = hubNavigationUrl;
  }
}

function renderConnectionLifecycle(lifecycle) {
  connectionLifecycleState = lifecycle.state;
  if (
    lifecycle.state === "failed"
    || (lifecycle.state === "closed" && (!reconnectToken || reconnectAttempts >= 3))
  ) {
    activeConnectionSignature = "";
  }
  connectionState.dataset.state = lifecycle.state;
  connectionState.textContent = lifecycle.reason
    ? t("message.connectionStateWithReason", { state: lifecycle.state, reason: lifecycle.reason })
    : lifecycle.subscription
      ? t("message.connectionStateWithSubscription", { state: lifecycle.state, subscription: lifecycle.subscription })
      : t("message.connectionState", { state: lifecycle.state });
  if (connectButton) {
    connectButton.disabled = true;
  }
  if (disconnectButton) {
    disconnectButton.disabled = true;
  }
  checkHaCardResources.disabled = lifecycle.state !== "connected";

  if (lifecycle.state === "connected") {
    reconnectAttempts = 0;
    clearTimeout(reconnectTimer);
    bindSelectedEntity(connection?.getClient()?.transport);
  } else if (lifecycle.state === "closed" || lifecycle.state === "failed") {
    setEntityCatalogSyncStatus(cachedHomeAssistantEntityIds.size
      ? { state: "cached", count: cachedHomeAssistantEntityIds.size }
      : { state: "idle", count: 0 });
    bindSelectedEntity(transport);
    if (lifecycle.state === "closed") {
      scheduleReconnect();
    }
  }
  refreshHomeAssistantEntities.disabled = lifecycle.state !== "connected";
  renderConnectionPanelState();
}

function createConnectionSignature(configuration, token) {
  return `${deriveHomeAssistantWebSocketUrl(configuration)}|${token}`;
}

function hasMatchingActiveConnectionAttempt(connectionSignature) {
  return activeConnectionSignature === connectionSignature
    && (
      ["connecting", "authenticating", "connected"].includes(connectionLifecycleState)
      || Boolean(reconnectTimer)
    );
}

function scheduleReconnect() {
  if (!connection || !reconnectToken || reconnectTimer || reconnectAttempts >= 3) {
    return;
  }

  reconnectAttempts += 1;
  const delay = reconnectAttempts * 1000;
  statusMessage.textContent = t("message.reconnecting", { seconds: delay / 1000, attempt: reconnectAttempts });
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = undefined;
    connection?.reconnect(reconnectToken);
  }, delay);
}

function persistConfiguration() {
  try {
    localStorage.setItem(configurationStorageKey, JSON.stringify({
      language: currentLanguage,
      themePreference: currentThemePreference,
      url: homeAssistantUrl.value,
      entities: homeAssistantEntity.value,
      entityDomain: homeAssistantEntityDomain.value,
      entitySearch: homeAssistantEntitySearch.value,
      selectedGroup: homeAssistantGroup.value,
      cardTarget: haCardTarget.value,
      cardLayout: haCardLayout.value,
      cardFormat: haCardFormat.value,
      cardScriptFilename: haCardScriptFilename.value,
      cardExportLanguages: selectedCardExportLanguages(),
      cardAutoTranslate: cardAutoTranslate.checked,
      adminTranslationProvider,
      adminTranslationApiEndpoint,
      adminTranslationApiKeyConfigured,
      adminTranslationApiKeyConfiguredByProvider,
      stackEntityIds: selectedStackEntityIds(),
      expertPaletteFavoriteIds: [...expertPaletteFavoriteIds],
      expertTemplateSizing: serializedExpertTemplateSizing(),
      expertEditorSurfaceSize,
      expertGridCellSize,
      expertEditorFields,
      selectedExpertFieldIndex,
      expertCardName: expertCardName.value,
      diagnosticsOpen: diagnosticsPanel.open,
      editorMode: activeEditorMode,
      groups: panelGroups,
    }));
  } catch {
    // Connection configuration remains session-only when storage is unavailable.
  }
}

function renderGroupOptions(selectedId = homeAssistantGroup.value) {
  homeAssistantGroup.replaceChildren();
  for (const group of panelGroups) {
    const option = document.createElement("option");
    option.value = group.id;
    option.textContent = maybeTranslate(`group.${group.id}`, group.title);
    homeAssistantGroup.append(option);
  }
  const custom = document.createElement("option");
  custom.value = "custom";
  custom.textContent = t("group.custom");
  homeAssistantGroup.append(custom);
  homeAssistantGroup.value = [...homeAssistantGroup.options].some(option => option.value === selectedId) ? selectedId : "custom";
}

function currentEntityId() {
  const entityIds = trackedEntityIds();
  if (statusPreviewEntityId && entityIds.includes(statusPreviewEntityId)) {
    return statusPreviewEntityId;
  }
  return entityIds[0] ?? "binary_sensor.atlas_status";
}

function trackedEntityIds() {
  const entityIds = [...new Set(homeAssistantEntity.value.split(",").map(entityId => entityId.trim()).filter(Boolean))];
  for (const entityId of entityIds) {
    knownEntityIds.add(entityId);
  }
  return entityIds;
}

function renderEmptyStatusPreview() {
  const emptyState = document.createElement("div");
  emptyState.className = "empty-selection-state";
  emptyState.textContent = emptyEntitySelectionMessage;
  statusRoot.replaceChildren(emptyState);
}

function knownEntityPickerIds() {
  return [...new Set([
    ...knownEntityIds,
    ...trackedEntityIds(),
    ...panelGroups.flatMap(group => group.entityIds),
    ...entitySnapshots.keys(),
  ])].sort((left, right) => left.localeCompare(right));
}

function loadCachedEntityCatalog() {
  try {
    const cached = JSON.parse(localStorage.getItem(entityCatalogCacheStorageKey) ?? "null");
    if (!cached || cached.version !== 1 || !Array.isArray(cached.entities)) return;
    for (const entity of cached.entities) {
      if (!entity || typeof entity.entityId !== "string") continue;
      const normalized = {
        entityId: entity.entityId,
        state: entity.state || "unknown",
        ...(typeof entity.value === "string" ? { value: entity.value } : {}),
        ...(typeof entity.name === "string" ? { name: entity.name } : {}),
        ...(typeof entity.unit === "string" ? { unit: entity.unit } : {}),
        updatedAt: entity.updatedAt || cached.updatedAt || Date.now(),
        cached: true,
      };
      entitySnapshots.set(normalized.entityId, normalized);
      knownEntityIds.add(normalized.entityId);
      cachedHomeAssistantEntityIds.add(normalized.entityId);
    }
    entityCatalogRevision += 1;
    setEntityCatalogSyncStatus({ state: "cached", count: cachedHomeAssistantEntityIds.size });
  } catch {
    // The editor falls back to live/demo entities when the cache is unavailable.
  }
}

function saveCachedEntityCatalog() {
  try {
    const entities = [...entitySnapshots.values()]
      .filter(entity => typeof entity.entityId === "string" && cachedHomeAssistantEntityIds.has(entity.entityId))
      .map(entity => ({
        entityId: entity.entityId,
        state: entity.state || "unknown",
        ...(typeof entity.value === "string" ? { value: entity.value } : {}),
        ...(typeof entity.name === "string" ? { name: entity.name } : {}),
        ...(typeof entity.unit === "string" ? { unit: entity.unit } : {}),
        updatedAt: entity.updatedAt || Date.now(),
      }));
    localStorage.setItem(entityCatalogCacheStorageKey, JSON.stringify({
      version: 1,
      updatedAt: Date.now(),
      entities,
    }));
  } catch {
    // Cache persistence is best-effort.
  }
}

function entityPickerCatalogSignature() {
  return JSON.stringify({
    revision: entityCatalogRevision,
    tracked: trackedEntityIds(),
    groups: panelGroups.map(group => [group.id, ...group.entityIds]),
  });
}

function createEntityPickerCatalog() {
  const signature = entityPickerCatalogSignature();
  if (signature === cachedEntityPickerSignature) {
    return cachedEntityPickerCatalog;
  }
  cachedEntityPickerCatalog = createHomeAssistantEntityCatalog({
    entityIds: knownEntityPickerIds(),
    entities: [...entitySnapshots.values()],
  });
  cachedEntityPickerDomains = listHomeAssistantEntityCatalogDomains(cachedEntityPickerCatalog);
  cachedEntityPickerSignature = signature;
  return cachedEntityPickerCatalog;
}

function createEntityPickerCatalogDomains() {
  createEntityPickerCatalog();
  return cachedEntityPickerDomains;
}

function invalidateEntityPickerCatalog() {
  entityCatalogRevision += 1;
}

function setEntityCatalogSyncStatus(status) {
  entityCatalogSyncStatus = {
    ...entityCatalogSyncStatus,
    ...status,
  };
  renderEntityCatalogSyncStatus();
}

function renderEntityCatalogSyncStatus() {
  if (!entitySyncState) return;
  const status = entityCatalogSyncStatus;
  entitySyncState.dataset.syncState = status.state;
  if (status.state === "cached") {
    entitySyncState.textContent = t("message.entitySyncCached", { count: status.count ?? 0 });
  } else if (status.state === "syncing") {
    entitySyncState.textContent = t("message.entitySyncing");
  } else if (status.state === "done") {
    entitySyncState.textContent = t("message.entitySyncDone", {
      count: status.count ?? 0,
      added: status.added ?? 0,
      removed: status.removed ?? 0,
    });
  } else if (status.state === "failed") {
    entitySyncState.textContent = t("message.entitySyncFailed", { reason: status.reason || t("message.unknownError") });
  } else {
    entitySyncState.textContent = t("message.entitySyncIdle");
  }
}

function replaceLiveEntitySnapshots(entities) {
  const previous = new Set(cachedHomeAssistantEntityIds);
  const next = new Set();
  for (const entityId of cachedHomeAssistantEntityIds) {
    knownEntityIds.delete(entityId);
    entitySnapshots.delete(entityId);
  }
  cachedHomeAssistantEntityIds.clear();
  for (const entity of entities) {
    if (!entity?.entityId) continue;
    next.add(entity.entityId);
    knownEntityIds.add(entity.entityId);
    cachedHomeAssistantEntityIds.add(entity.entityId);
    entitySnapshots.set(entity.entityId, { ...entity, updatedAt: Date.now(), cached: false });
  }
  invalidateEntityPickerCatalog();
  saveCachedEntityCatalog();
  return {
    count: next.size,
    added: [...next].filter(entityId => !previous.has(entityId)).length,
    removed: [...previous].filter(entityId => !next.has(entityId)).length,
  };
}

function scheduleEntityPickerOptionsRender(delay = 140) {
  window.clearTimeout(entityPickerRenderTimer);
  entityPickerRenderTimer = window.setTimeout(renderEntityPickerOptions, delay);
}

function renderEntityDomainOptions() {
  const selected = homeAssistantEntityDomain.value || "all";
  const domains = createEntityPickerCatalogDomains();

  homeAssistantEntityDomain.replaceChildren();
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = t("text.allEntityTypes");
  homeAssistantEntityDomain.append(allOption);
  for (const domain of domains) {
    const option = document.createElement("option");
    option.value = domain;
    option.textContent = domain;
    homeAssistantEntityDomain.append(option);
  }
  homeAssistantEntityDomain.value = selected === "all" || domains.includes(selected) ? selected : "all";
  renderEntityDomainShortcuts(domains);
}

function renderEntityDomainShortcuts(domains) {
  const selected = homeAssistantEntityDomain.value || "all";
  const shortcutDomains = listHomeAssistantEntityDomainShortcuts(domains);

  homeAssistantEntityDomainShortcuts.replaceChildren();
  for (const domain of shortcutDomains) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.entityDomain = domain;
    button.textContent = domain === "all" ? t("text.all") : domain;
    button.setAttribute("aria-pressed", String(domain === selected));
    button.title = domain === "all" ? t("text.allEntityTypes") : `${domain}`;
    homeAssistantEntityDomainShortcuts.append(button);
  }
}

function usesStackEntitySelection() {
  return activeEditorMode === "simple"
    && haCardTarget.value !== "entities"
    && (haCardLayout.value === "horizontal-stack" || haCardLayout.value === "vertical-stack");
}

function reconcileStackEntitySelection() {
  const entityIds = trackedEntityIds();
  for (const entityId of [...stackSelectedEntityIds]) {
    if (!entityIds.includes(entityId)) {
      stackSelectedEntityIds.delete(entityId);
    }
  }
  if (stackSelectedEntityIds.size === 0) {
    for (const entityId of entityIds) {
      stackSelectedEntityIds.add(entityId);
    }
  }
}

function selectedStackEntityIds() {
  reconcileStackEntitySelection();
  return trackedEntityIds().filter(entityId => stackSelectedEntityIds.has(entityId));
}

function cardPreviewEntityIds() {
  return usesStackEntitySelection() ? selectedStackEntityIds() : trackedEntityIds();
}

function cardExportEntityIds() {
  const entityIds = cardPreviewEntityIds();
  return entityIds.length ? entityIds : [...defaultAtlasExportEntityIds];
}

function usesDefaultAtlasExportEntities() {
  return activeEditorMode === "simple" && cardPreviewEntityIds().length === 0;
}

function defaultAtlasExportMessage() {
  return t("message.defaultAtlasEntitiesUsed", { entities: defaultAtlasExportEntityIds.join(", ") });
}

function renderEntitySummaryChips(target, entries) {
  target.replaceChildren();
  target.classList.add("entity-summary-chips");
  for (const entry of entries) {
    const chip = document.createElement("span");
    const label = document.createElement("span");
    const value = document.createElement("strong");
    chip.className = "entity-summary-chip";
    chip.dataset.kind = entry.kind ?? "info";
    label.textContent = entry.label;
    value.textContent = entry.value;
    chip.append(label, value);
    target.append(chip);
  }
  renderConnectionPanelState();
}

function renderEntitySummaryText(target, text) {
  target.classList.remove("entity-summary-chips");
  target.textContent = text;
}

function renderStackSelectionSummary() {
  const entityIds = trackedEntityIds();
  if (entityIds.length === 0) {
    renderEntitySummaryText(stackSelectionSummary, emptyEntitySelectionMessage);
    return;
  }

  if (usesStackEntitySelection()) {
    const selectedIds = selectedStackEntityIds();
    renderEntitySummaryChips(stackSelectionSummary, [{
      label: t("text.stackSelection"),
      value: `${selectedIds.length}/${entityIds.length}`,
      kind: selectedIds.length ? "ready" : "pending",
    }]);
    return;
  }

  renderEntitySummaryChips(stackSelectionSummary, [{
    label: t("text.simplePrimaryEntity"),
    value: entityIds[0] || t("text.noEntity"),
    kind: entityIds[0] ? "ready" : "pending",
  }]);
}

function renderEntityPickerOptions() {
  const selected = homeAssistantEntityPicker.value;
  renderEntityDomainOptions();
  const selectedDomain = homeAssistantEntityDomain.value;
  const searchTerm = homeAssistantEntitySearch.value;
  clearHomeAssistantEntitySearch.disabled = searchTerm.trim().length === 0;
  const entityEntries = filterHomeAssistantEntityCatalog(createEntityPickerCatalog(), {
    domain: selectedDomain,
    search: searchTerm,
  });
  const entityIds = entityEntries.map(entry => entry.entityId);

  homeAssistantEntityPicker.replaceChildren();
  for (const entry of entityEntries) {
    const option = document.createElement("option");
    option.value = entry.entityId;
    option.textContent = entry.label !== entry.entityId
      ? `${entry.label} (${entry.entityId})`
      : entry.entityId;
    homeAssistantEntityPicker.append(option);
  }
  homeAssistantEntityPicker.value = entityIds.includes(selected) ? selected : entityIds[0] ?? "";
  addHomeAssistantEntity.disabled = !homeAssistantEntityPicker.value;
  homeAssistantEntityPicker.disabled = entityIds.length === 0;
  const domainLabel = selectedDomain === "all" ? t("message.allTypes") : selectedDomain;
  const searchSuffix = searchTerm.trim() ? t("message.entitySearchSuffix", { search: searchTerm.trim() }) : "";
  homeAssistantEntityPickerStatus.textContent = entityIds.length === 0
    ? t("message.noEntitiesFound", { domain: domainLabel, search: searchSuffix })
    : t("message.entitiesFound", {
      count: entityIds.length,
      entityLabel: entityIds.length === 1 ? t("message.entitySingular") : t("message.entityPlural"),
      domain: domainLabel,
    });
}

function addSelectedEntityFromPicker() {
  const entityId = homeAssistantEntityPicker.value.trim();
  if (!entityId) {
    statusMessage.textContent = t("message.selectEntityFirst");
    return;
  }
  if (usesStackEntitySelection()) {
    addEntityForStatusPreview(entityId);
    return;
  }
  if (activeEditorMode === "expert") {
    applyEntityToSelectedExpertField(entityId);
    return;
  }
  selectPrimaryEntity(entityId);
}

function refreshLiveEntityStates() {
  const client = connection?.getClient();
  const entityResult = client?.requestEntityStates();
  if (entityResult?.accepted) {
    setEntityCatalogSyncStatus({ state: "syncing", requestId: entityResult.requestId });
  } else {
    setEntityCatalogSyncStatus({
      state: "failed",
      reason: entityResult?.reason ?? t("message.connectBeforeRefreshingEntities"),
    });
  }
  statusMessage.textContent = entityResult?.accepted
    ? t("message.entityListRequested", { requestId: entityResult.requestId })
    : entityResult?.reason ?? t("message.connectBeforeRefreshingEntities");
  checkLiveLovelaceResources({ appendStatus: true });
}

function checkLiveLovelaceResources(options = {}) {
  window.clearTimeout(lovelaceResourceRequestTimer);
  const result = connection?.getClient()?.requestLovelaceResources("lovelace/resources");
  const message = result?.accepted
    ? t("message.resourcesRequested", { requestId: result.requestId })
    : result?.reason ?? t("message.connectBeforeCheckingResources");
  addLovelaceResourceDebugEvent(result?.accepted
    ? `WS request #${result.requestId} sent: ${result.command ?? "lovelace/resources"}`
    : `WS request rejected: ${message}`);
  statusMessage.textContent = options.appendStatus
    ? `${statusMessage.textContent} ${message}`
    : message;
  if (result?.accepted) {
    lovelaceResourcesChecked = false;
    activeLovelaceResourceRequestId = result.requestId;
    renderTemporaryHaCardResourceList("loading");
    lovelaceResourceRequestTimer = window.setTimeout(() => {
      if (activeLovelaceResourceRequestId !== result.requestId) return;
      lovelaceResourcesChecked = false;
      addLovelaceResourceDebugEvent(`WS request #${result.requestId} timeout after 8s`);
      requestLovelaceResourcesListFallback();
    }, 8000);
    renderHaCardPreview();
  } else {
    void fetchLovelaceResourcesViaRestFallback(message);
  }
}

function requestLovelaceResourcesListFallback() {
  window.clearTimeout(lovelaceResourceRequestTimer);
  const result = connection?.getClient()?.requestLovelaceResources("lovelace/resources/list");
  if (!result?.accepted) {
    addLovelaceResourceDebugEvent(`WS list fallback rejected: ${result?.reason ?? t("message.connectBeforeCheckingResources")}`);
    void fetchLovelaceResourcesViaRestFallback(result?.reason);
    return;
  }
  addLovelaceResourceDebugEvent(`WS request #${result.requestId} sent: ${result.command ?? "lovelace/resources/list"}`);
  activeLovelaceResourceRequestId = result.requestId;
  renderTemporaryHaCardResourceList("loading");
  lovelaceResourceRequestTimer = window.setTimeout(() => {
    if (activeLovelaceResourceRequestId !== result.requestId) return;
    lovelaceResourcesChecked = false;
    addLovelaceResourceDebugEvent(`WS request #${result.requestId} timeout after 8s`);
    renderTemporaryHaCardResourceList("rest-loading");
    void fetchLovelaceResourcesViaRestFallback();
  }, 8000);
}

async function fetchLovelaceResourcesViaRestFallback(initialReason = "") {
  if (!adminConnectionToken) {
    addLovelaceResourceDebugEvent("Admin proxy skipped: no admin token handoff");
    renderTemporaryHaCardResourceList("failed", initialReason || t("message.tokenRequired"));
    return;
  }
  addLovelaceResourceDebugEvent("Admin proxy request sent: /api/homeassistant/lovelace-resources");
  renderTemporaryHaCardResourceList("rest-loading");
  try {
    const response = await fetch(adminLovelaceResourcesApiUrl, {
      headers: {
        Accept: "application/json",
      },
    });
    const payload = await response.json().catch(() => undefined);
    if (!response.ok) {
      throw new Error(payload?.error ?? `Admin REST ${response.status} ${response.statusText}`.trim());
    }
    lovelaceResources = Array.isArray(payload?.resources) ? payload.resources : [];
    lovelaceResourcesChecked = true;
    addLovelaceResourceDebugEvent(
      `Admin proxy response: ${response.status}, ${payload?.source ?? "unknown"}, ${lovelaceResources.length} resources`,
    );
    const scannedCards = refreshScannedExpertPaletteCards();
    renderHaCardPreview();
    renderExpertTemplatePalette();
    renderTemporaryHaCardResourceList("ready", payload?.source ?? "Admin proxy");
    statusMessage.textContent = t("message.loadedResources", {
      count: lovelaceResources.length,
      total: scannedCards.total,
      hacs: scannedCards.hacs,
    });
  } catch (error) {
    lovelaceResourcesChecked = false;
    const reason = error instanceof Error ? error.message : String(error);
    const combinedReason = initialReason ? `${initialReason} Admin proxy: ${reason}` : reason;
    addLovelaceResourceDebugEvent(`Admin proxy failed: ${combinedReason}`);
    renderTemporaryHaCardResourceList("failed", combinedReason);
    statusMessage.textContent = t("text.temporaryResourceDebugFailed", { reason: combinedReason });
  }
}

function addLovelaceResourceDebugEvent(message) {
  const time = new Date().toLocaleTimeString(currentLanguage === "de" ? "de-DE" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  lovelaceResourceDebugEvents.unshift(`${time} ${message}`);
  lovelaceResourceDebugEvents.splice(8);
}

function isTransparentOrLightButtonBackground(color) {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([.\d]+))?\)/i);
  if (!match) return false;
  const [, red, green, blue, alpha = "1"] = match;
  if (Number(alpha) === 0) return true;
  return Number(red) > 245 && Number(green) > 245 && Number(blue) > 245;
}

function isDangerControl(control) {
  const label = `${control.textContent ?? ""} ${control.getAttribute("aria-label") ?? ""} ${control.title ?? ""}`.toLowerCase();
  return /\b(delete|remove)\b|löschen|loeschen|entfernen/.test(label);
}

function triggerControlClickFeedback(control) {
  if (!control || control.disabled || control.getAttribute("aria-disabled") === "true") return;
  const feedbackClasses = [
    "atlas-click-feedback-neutral",
    "atlas-click-feedback-colored",
    "atlas-click-feedback-danger",
  ];
  control.classList.remove(...feedbackClasses);
  void control.offsetWidth;
  const neutral = isTransparentOrLightButtonBackground(window.getComputedStyle(control).backgroundColor);
  const className = isDangerControl(control)
    ? "atlas-click-feedback-danger"
    : neutral
      ? "atlas-click-feedback-neutral"
      : "atlas-click-feedback-colored";
  control.classList.add(className);
  window.setTimeout(() => {
    control.classList.remove(className);
  }, 280);
}

function normalizeLovelaceResourceUrl(resource) {
  const url = typeof resource === "string" ? resource : resource?.url;
  return typeof url === "string" ? url.split("?")[0].toLowerCase() : "";
}

function formatLovelaceResourceLabel(url) {
  const fileName = url.split("/").filter(Boolean).pop() ?? url;
  return fileName.replace(/\.js$/i, "").replace(/[-_]+/g, " ");
}

function createLovelaceResourcePaletteId(url, index) {
  const slug = url.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return `ha-resource-${slug || index}`;
}

function isHacsLovelaceResourceUrl(url) {
  return url.includes("/hacsfiles/");
}

function isHacsBundleArchiveFile(file) {
  return file.name.toLowerCase().endsWith(".zip") || file.type === "application/zip";
}

const ignoredLovelaceResourceTerms = [
  "card-mad",
  "card-tools",
  "wallpanel",
  "lovelace-buuble-room",
  "lovelace-bubble-room",
  "mushroom-strategy",
  "ha-dashboard",
  "swipe-navigation",
  "auto-entities",
  "floorplan",
  "view-assistant",
  "sidebar-card",
  "cardbuilder.zip",
  "icon",
  "andy",
];

function normalizeLovelaceResourceSearchText(url) {
  return url.replace(/[^a-z0-9.]+/g, "-");
}

function shouldIgnoreLovelaceResourceUrl(url) {
  const normalizedUrl = normalizeLovelaceResourceSearchText(url);
  return /\.zip(?:$|[?#])/i.test(url) || ignoredLovelaceResourceTerms.some(term => normalizedUrl.includes(term));
}

function isMappedLovelaceResourceUrl(url) {
  return url.includes("/bubble-card/")
    || url.includes("bubble-card.js")
    || url.includes("/lovelace-mushroom/")
    || url.includes("mushroom.js")
    || url.includes("/tabbed-card-v2/")
    || url.includes("tabbed-card-v2.js");
}

function describeMappedLovelaceResource(url) {
  if (url.includes("/bubble-card/") || url.includes("bubble-card.js")) return "Bubble Card";
  if (url.includes("/lovelace-mushroom/") || url.includes("mushroom.js")) return "Mushroom";
  if (url.includes("/tabbed-card-v2/") || url.includes("tabbed-card-v2.js")) return "Tabbed Card V2";
  return "";
}

function analyzeTemporaryHaCardResources(resources) {
  const urls = [...new Set(resources.map(normalizeLovelaceResourceUrl).filter(Boolean))];
  const known = [];
  const scanOnly = [];
  const ignored = [];
  for (const url of urls) {
    const mappedLabel = describeMappedLovelaceResource(url);
    if (mappedLabel) {
      known.push(`${mappedLabel}: ${url}`);
    } else if (shouldIgnoreLovelaceResourceUrl(url) || url.includes("/atlas/") || url.includes("atlas-card")) {
      ignored.push(url);
    } else {
      scanOnly.push(url);
    }
  }
  return {
    total: urls.length,
    hacs: urls.filter(isHacsLovelaceResourceUrl).length,
    known,
    scanOnly,
    ignored,
  };
}

function formatTemporaryResourceSection(label, entries) {
  if (!entries.length) return `${label}: -`;
  return [
    `${label}:`,
    ...entries.map((entry, index) => `${index + 1}. ${entry}`),
  ].join("\n");
}

function formatLovelaceResourceDebugText() {
  return formatTemporaryResourceSection(t("text.temporaryResourceDebugEvents"), lovelaceResourceDebugEvents);
}

function formatTemporaryResourceDebugBody(lines) {
  return [
    ...lines,
    formatLovelaceResourceDebugText(),
  ].filter(Boolean).join("\n\n");
}

function syncTemporaryResourceDebugVisibility() {
  if (!toggleTemporaryResourceDebug || !temporaryResourceDebug) return;
  temporaryResourceDebug.hidden = !toggleTemporaryResourceDebug.checked;
  temporaryResourceDebug.open = toggleTemporaryResourceDebug.checked;
}

function renderTemporaryHaCardResourceList(state = lovelaceResourcesChecked ? "ready" : "unchecked", reason = "") {
  if (!temporaryHaCardResourceList) return;
  if (state === "loading") {
    temporaryHaCardResourceList.textContent = formatTemporaryResourceDebugBody([
      t("text.temporaryResourceDebugLoading"),
    ]);
    return;
  }
  if (state === "rest-loading") {
    temporaryHaCardResourceList.textContent = formatTemporaryResourceDebugBody([
      t("text.temporaryResourceDebugRestLoading"),
    ]);
    return;
  }
  if (state === "timeout") {
    temporaryHaCardResourceList.textContent = formatTemporaryResourceDebugBody([
      t("text.temporaryResourceDebugTimeout"),
    ]);
    return;
  }
  if (state === "failed") {
    temporaryHaCardResourceList.textContent = formatTemporaryResourceDebugBody([
      t("text.temporaryResourceDebugFailed", {
        reason: reason || t("message.unknownError"),
      }),
    ]);
    return;
  }
  if (!lovelaceResourcesChecked) {
    temporaryHaCardResourceList.textContent = formatTemporaryResourceDebugBody([
      t("text.temporaryResourceDebugUnchecked"),
    ]);
    return;
  }
  const analysis = analyzeTemporaryHaCardResources(lovelaceResources);
  const source = reason || "WebSocket";
  temporaryHaCardResourceList.textContent = formatTemporaryResourceDebugBody([
    t("text.temporaryResourceDebugSummary", {
      source,
      total: analysis.total,
      hacs: analysis.hacs,
      known: analysis.known.length,
      scanOnly: analysis.scanOnly.length,
      ignored: analysis.ignored.length,
    }),
    formatTemporaryResourceSection(t("text.temporaryResourceKnown"), analysis.known),
    formatTemporaryResourceSection(t("text.temporaryResourceScanOnly"), analysis.scanOnly),
    formatTemporaryResourceSection(t("text.temporaryResourceIgnored"), analysis.ignored),
  ]);
}

function createScannedExpertPaletteCards(resources) {
  const urls = [...new Set(resources.map(normalizeLovelaceResourceUrl).filter(Boolean))]
    .filter(url => !shouldIgnoreLovelaceResourceUrl(url));

  const resourceCards = urls
    .filter(url => !url.includes("/atlas/") && !url.includes("atlas-card") && !isMappedLovelaceResourceUrl(url))
    .map((url, index) => ({
      id: createLovelaceResourcePaletteId(url, index),
      category: isHacsLovelaceResourceUrl(url) ? "HACS resource" : "HA resource",
      label: formatLovelaceResourceLabel(url),
      templateId: "entity-list",
      target: "entities",
      preview: [url],
      resourceUrl: url,
      disabled: true,
      scanned: true,
    }));

  return dedupeExpertPaletteCards(resourceCards);
}

function dedupeExpertPaletteCards(cards) {
  const seen = new Set();
  return cards.filter(card => {
    const key = card.resourceUrl
      ? `resource:${normalizeLovelaceResourceSearchText(card.resourceUrl)}`
      : `${card.category}:${card.label}:${card.templateId}:${card.target}:${card.bubbleButtonType ?? ""}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function refreshScannedExpertPaletteCards() {
  const staticCards = expertPaletteCards.filter(card => !card.scanned);
  const scannedCards = createScannedExpertPaletteCards(lovelaceResources);
  expertPaletteCards = dedupeExpertPaletteCards([...staticCards, ...scannedCards]);
  return {
    total: scannedCards.length,
    hacs: scannedCards.filter(card => card.resourceUrl && isHacsLovelaceResourceUrl(card.resourceUrl)).length,
  };
}

function scanExpertPaletteCardsFromHomeAssistant() {
  const detectedCards = refreshScannedExpertPaletteCards();
  expertPaletteShowAllCards = true;
  renderExpertTemplatePalette();
  const clientReady = Boolean(connection?.getClient());
  if (clientReady) {
    checkLiveLovelaceResources({ appendStatus: true });
  }
  const scanMessage = detectedCards.total
    ? t("message.paletteEntriesDetected", { total: detectedCards.total, hacs: detectedCards.hacs })
    : t("message.noPaletteEntriesDetected");
  statusMessage.textContent = clientReady
    ? t("message.refreshingResources", { message: scanMessage })
    : t("message.connectAndScanAgain", { message: scanMessage });
}

function createHaCardConfig({ useExportFallback = false } = {}) {
  if (importedSimpleCard && haCardTarget.value === "custom-card") {
    return importedSimpleCard;
  }
  const group = panelGroups.find(candidate => candidate.id === homeAssistantGroup.value);
  return createHomeAssistantCardConfiguration({
    target: haCardTarget.value,
    layout: haCardLayout.value,
    title: group?.title ?? (homeAssistantGroupName.value.trim() || "ATLAS panel"),
    entityIds: useExportFallback ? cardExportEntityIds() : cardPreviewEntityIds(),
  });
}

function clearImportedSimplePreviewState() {
  importedSimpleCard = undefined;
  importedSimpleCodePreview = undefined;
  importedSimpleStyleInspection = undefined;
  importedSimpleEntityNames = new Map();
}

function confirmPreviewReset() {
  return window.confirm(t("message.confirmPreviewReset"));
}

function resetSimplePreviewState() {
  if (!confirmPreviewReset()) return;
  clearImportedSimplePreviewState();
  homeAssistantEntity.value = "";
  selectedStackEntities.clear();
  clearHaCardStyleInspection();
  haCardImportReview.textContent = "";
  haCardImportReview.removeAttribute("data-action");
  renderEntityList();
  renderHaCardPreview();
  persistConfiguration();
  statusMessage.textContent = t("message.previewReset");
}

function resetExpertPreviewState() {
  if (!confirmPreviewReset()) return;
  expertEditorFields.length = 0;
  selectedExpertFieldIndex = -1;
  selectedContainerCardRef = undefined;
  expertFieldEditing = false;
  expertTitle.value = "";
  expertEntity.value = "";
  clearImportedSimplePreviewState();
  clearHaCardStyleInspection();
  haCardImportReview.textContent = "";
  haCardImportReview.removeAttribute("data-action");
  renderExpertEditorPreview();
  persistConfiguration();
  statusMessage.textContent = t("message.previewReset");
}

function formatSimpleHaCardCodePreview(card) {
  return activeEditorMode === "simple" && haCardFormat.value === "yaml" && importedSimpleCodePreview
    ? importedSimpleCodePreview
    : serializeHomeAssistantEntitiesCardConfiguration(card, haCardFormat.value);
}

function createExpertHaCardConfig() {
  return createHomeAssistantCardEditorConfiguration({
    cardName: currentExpertCardName(),
    editorMode: "expert",
    fields: normalizedExpertEditorFields(),
  });
}

function createActiveHaCardConfig({ useExportFallback = false } = {}) {
  return activeEditorMode === "expert" ? createExpertHaCardConfig() : createHaCardConfig({ useExportFallback });
}

function createActiveCardEditorPlan({ useExportFallback = false } = {}) {
  return createHomeAssistantCardEditorPackagePlan({
    cardName: currentHaCardExportName(),
    scriptFilename: currentHaCardScriptFilename(),
    editorMode: activeEditorMode,
    simpleTarget: haCardTarget.value,
    defaultEntityIds: useExportFallback ? cardExportEntityIds() : cardPreviewEntityIds(),
    fields: activeEditorMode === "expert" ? normalizedExpertEditorFields() : [],
  });
}

function normalizedExpertEditorFields() {
  return expertEditorFields.map(field => isStackContainerField(field) ? normalizeStackContainerLayout(field) : field);
}

function currentExpertCardName() {
  return expertCardName.value.trim() || "ATLAS Expert card";
}

function currentHaCardExportName() {
  if (activeEditorMode === "expert") {
    return currentExpertCardName();
  }
  const group = panelGroups.find(candidate => candidate.id === homeAssistantGroup.value);
  return group?.title ?? (homeAssistantGroupName.value.trim() || "ATLAS Home Assistant card");
}

function currentHaCardScriptFilename() {
  return normalizeHomeAssistantCardEditorScriptFilename(haCardScriptFilename.value.trim() || currentHaCardExportName());
}

function renderHaCardPreview() {
  if (cardPreviewEntityIds().length === 0) {
    haCardPreview.textContent = emptyEntitySelectionMessage;
    renderSimpleHaCardVisualPreview(undefined);
    haCardDependency.dataset.required = "false";
    haCardDependency.dataset.status = "not-required";
    haCardDependency.textContent = emptyEntitySelectionMessage;
    copyHaCardResources.disabled = true;
    return;
  }

  const card = importedSimpleCard ?? createHaCardConfig();
  renderSimpleHaCardVisualPreview(card);
  haCardPreview.textContent = formatSimpleHaCardCodePreview(createHaCardConfig());
  renderHaCardDependency(card);
}

function renderSimpleHaCardVisualPreview(card) {
  haCardVisualPreview.replaceChildren();
  if (!card) {
    const empty = document.createElement("span");
    empty.textContent = emptyEntitySelectionMessage;
    haCardVisualPreview.append(empty);
    return;
  }
  haCardVisualPreview.append(createSimpleHaCardPreviewCard(card));
}

function createSimpleHaCardPreviewCard(card) {
  const wrapper = document.createElement("article");
  wrapper.className = "ha-card-visual-card";
  const variant = getSimplePreviewCardVariant(card);
  if (variant.kind) {
    wrapper.classList.add("card-kind-preview");
    wrapper.dataset.cardKind = variant.kind;
  }
  if (variant.detail) {
    wrapper.dataset.cardVariant = variant.detail;
  }
  if (variant.kind === "bubble") {
    wrapper.classList.add("bubble-card-preview");
    wrapper.dataset.bubbleType = variant.detail;
  }

  const header = document.createElement("header");
  const title = document.createElement("strong");
  title.textContent = getSimplePreviewCardTitle(card);
  const type = document.createElement("span");
  type.className = "ha-card-visual-type";
  type.textContent = variant.label || card.type;
  header.append(title, type);
  wrapper.append(header);

  const entities = getSimplePreviewCardEntities(card);
  if (entities.length) {
    const list = document.createElement("div");
    list.className = "ha-card-visual-entities";
    for (const entity of entities) {
      list.append(createSimpleHaCardPreviewEntityRow(entity));
    }
    wrapper.append(list);
  }

  return wrapper;
}

function createSimpleHaCardPreviewEntityRow(entity) {
  const row = document.createElement("div");
  row.className = "ha-card-visual-row";

  const text = document.createElement("div");
  const name = document.createElement("strong");
  const importedName = importedSimpleEntityNames.get(entity.entity);
  name.textContent = entity.name || importedName || formatEntityIdAsTitle(entity.entity) || entity.entity;
  const id = document.createElement("small");
  id.textContent = entity.entity;
  text.append(name, id);
  row.append(text);

  const styles = getImportedEntityStyleBlocks(entity.entity);
  if (styles.length) {
    const badge = document.createElement("span");
    badge.className = "ha-card-entity-style-badge";
    badge.textContent = `${styles.length} style`;
    row.append(badge);

    const details = document.createElement("details");
    details.className = "ha-card-entity-style";
    const summary = document.createElement("summary");
    summary.textContent = "Entity style";
    const code = document.createElement("pre");
    code.textContent = styles.map(block => block.code).join("\n\n");
    details.append(summary, code);
    row.append(details);
  }

  return row;
}

function getSimplePreviewCardTitle(card) {
  if (typeof card.title === "string" && card.title.trim()) return card.title.trim();
  if (typeof card.name === "string" && card.name.trim()) return card.name.trim();
  if (typeof card.primary === "string" && card.primary.trim()) return card.primary.trim();
  if (card.type === "custom:tabbed-card-v2") return card.tabs?.[0]?.attributes?.label ?? "Tabbed Card V2";
  return String(card.type).replace(/^custom:/, "");
}

function getSimplePreviewCardVariant(card) {
  if (!card || typeof card !== "object") {
    return { kind: "", detail: "", label: "" };
  }
  if (card.type === "custom:bubble-card") {
    const detail = bubbleButtonTypes.includes(card.button_type) ? card.button_type : "state";
    return { kind: "bubble", detail, label: `Bubble ${detail}` };
  }
  if (card.type === "custom:mushroom-template-card") {
    return { kind: "mushroom", detail: "template", label: "Mushroom template" };
  }
  if (card.type === "custom:tabbed-card-v2") {
    return { kind: "tabbed", detail: "v2", label: "Tabbed Card V2" };
  }
  const type = typeof card.type === "string" ? card.type.replace(/^custom:/, "") : "";
  return { kind: type ? "core" : "", detail: type, label: type || "" };
}

function getSimplePreviewCardEntities(card) {
  if (Array.isArray(card.entities)) {
    return card.entities
      .map(entity => typeof entity === "string"
        ? { entity }
        : entity && typeof entity === "object" && typeof entity.entity === "string"
          ? {
              entity: entity.entity,
              name: typeof entity.name === "string" ? entity.name : "",
              icon: typeof entity.icon === "string" ? entity.icon : "",
              show_last_changed: typeof entity.show_last_changed === "boolean" ? entity.show_last_changed : undefined,
              styleBlocks: Array.isArray(entity.styleBlocks) ? entity.styleBlocks : undefined,
            }
          : undefined)
      .filter(Boolean);
  }
  return collectSimplePreviewCardEntities(card);
}

function collectImportedSimpleEntityNames(card) {
  const names = new Map();
  for (const entity of getSimplePreviewCardEntities(card)) {
    if (entity.name) {
      names.set(entity.entity, entity.name);
    }
  }
  return names;
}

function createExpertFieldsFromImportedCard(card) {
  const entities = getSimplePreviewCardEntities(card);
  if (card?.type === "glance") {
    return [createImportedOverviewExpertField(card, entities)];
  }
  return entities.map((entity, index) => createHomeAssistantCardEditorFieldFromTemplate({
    template: "entity-card",
    target: "entity",
    entityId: entity.entity,
    id: entity.name || formatEntityIdAsTitle(entity.entity) || entity.entity,
    column: (index % 3) * 4,
    row: Math.floor(index / 3) * 2,
    width: 4,
    height: 2,
  }));
}

function createImportedOverviewExpertField(card, entities) {
  const title = getSimplePreviewCardTitle(card) || "Glance 1";
  return {
    id: title,
    target: "glance",
    importedCardType: "glance",
    entityId: "",
    layout: "card",
    entries: entities.map((entity, index) => ({
      id: entity.name || formatEntityIdAsTitle(entity.entity) || `Entity ${index + 1}`,
      target: "entity",
      entityId: entity.entity,
      ...(entity.icon ? { icon: entity.icon } : {}),
      ...(typeof entity.show_last_changed === "boolean" ? { show_last_changed: entity.show_last_changed } : {}),
      styleBlocks: getImportedEntityStyleBlocks(entity.entity).map(block => ({ ...block })),
    })),
    importedOptions: {
      ...(typeof card.show_name === "boolean" ? { show_name: card.show_name } : {}),
      ...(typeof card.show_icon === "boolean" ? { show_icon: card.show_icon } : {}),
      ...(typeof card.show_state === "boolean" ? { show_state: card.show_state } : {}),
      ...(typeof card.columns === "number" ? { columns: card.columns } : {}),
      ...(typeof card.state_color === "boolean" ? { state_color: card.state_color } : {}),
    },
    column: 0,
    row: 0,
    width: 8,
    height: Math.max(2, Math.ceil(Math.max(1, entities.length) / 4) * 2),
  };
}

function collectSimplePreviewCardEntities(value, key = "") {
  if (typeof value === "string") {
    return /^entity\d*$/i.test(key) && /^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/i.test(value.trim())
      ? [{ entity: value.trim() }]
      : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap(item => collectSimplePreviewCardEntities(item));
  }
  if (!value || typeof value !== "object") {
    return [];
  }
  const seen = new Set();
  return Object.entries(value).flatMap(([entryKey, entryValue]) =>
    collectSimplePreviewCardEntities(entryValue, entryKey),
  ).filter(item => {
    if (seen.has(item.entity)) return false;
    seen.add(item.entity);
    return true;
  });
}

function getImportedEntityStyleBlocks(entityId) {
  if (!importedSimpleStyleInspection?.cardStyles?.length) return [];
  return importedSimpleStyleInspection.cardStyles.filter(block => block.label === entityId);
}

function getEntryStyleBlocks(entry) {
  if (Array.isArray(entry?.styleBlocks) && entry.styleBlocks.length) {
    return entry.styleBlocks;
  }
  return getImportedEntityStyleBlocks(entry?.entityId);
}

function renderHaCardDependency(card) {
  if (activeEditorMode === "expert") {
    renderExpertHaCardDependency();
    return;
  }

  const dependency = inspectHomeAssistantCardDependency(card);
  const availability = inspectHomeAssistantCardDependencyAvailability(card, lovelaceResources);
  const integrationPlan = createHomeAssistantAtlasFrontendIntegrationPlan({
    mode: "server",
    card,
    resources: lovelaceResources,
  });
  haCardDependency.dataset.required = String(dependency.required);
  haCardDependency.dataset.status = lovelaceResourcesChecked
    ? integrationPlan.ready ? "installed" : "missing"
    : dependency.required ? "unchecked" : "not-required";
  copyHaCardResources.disabled = false;
  const resourceHint = dependency.resourcePaths.length
    ? t("dependency.resource", { paths: dependency.resourcePaths.join(", ") })
    : "";
  const installHint = dependency.installPaths.length
    ? t("dependency.installPath", { paths: dependency.installPaths.join(", ") })
    : "";
  const atlasHint = t("dependency.atlasFrontend", { paths: integrationPlan.atlasResource.resourcePaths.join(", ") });
  if (!dependency.required) {
    haCardDependency.textContent = t("dependency.builtIn", { atlasHint });
  } else if (!lovelaceResourcesChecked) {
    haCardDependency.textContent = t("dependency.requiresUnchecked", {
      dependency: dependency.label,
      resourceHint,
      installHint,
      atlasHint,
    });
  } else if (integrationPlan.ready) {
    haCardDependency.textContent = t("dependency.ready", {
      dependency: dependency.label,
      resourceHint,
      atlasHint,
    });
  } else if (availability.status === "installed") {
    haCardDependency.textContent = t("dependency.cardFoundAtlasMissing", {
      dependency: dependency.label,
      resourceHint,
      atlasHint,
      missing: integrationPlan.atlasAvailability.missingResourcePaths.join(", "),
    });
  } else {
    haCardDependency.textContent = t("dependency.missing", {
      dependency: dependency.label,
      resourceHint,
      installHint,
      atlasHint,
      missing: [
        ...integrationPlan.atlasAvailability.missingResourcePaths,
        ...availability.missingResourcePaths,
      ].join(", "),
    });
  }
}

function renderExpertHaCardDependency() {
  const integrationPlan = createHomeAssistantCardEditorFrontendIntegrationPlan({
    mode: "server",
    editorPlan: createActiveCardEditorPlan(),
    resources: lovelaceResources,
  });
  const requiredDependencies = integrationPlan.editorDependencyPlan.dependencies.filter(dependency => dependency.required);
  const dependencyLabel = formatDependencyLabels(requiredDependencies);
  const resourceHint = integrationPlan.editorDependencyPlan.requiredResourcePaths.length
    ? t("dependency.resource", { paths: integrationPlan.editorDependencyPlan.requiredResourcePaths.join(", ") })
    : "";
  const installHint = integrationPlan.editorDependencyPlan.installSteps.length
    ? t("dependency.installPath", { paths: integrationPlan.editorDependencyPlan.installSteps.join(", ") })
    : "";
  const atlasHint = t("dependency.atlasFrontend", { paths: integrationPlan.atlasResource.resourcePaths.join(", ") });
  haCardDependency.dataset.required = String(requiredDependencies.length > 0);
  haCardDependency.dataset.status = lovelaceResourcesChecked
    ? integrationPlan.ready ? "installed" : "missing"
    : requiredDependencies.length ? "unchecked" : "not-required";
  copyHaCardResources.disabled = false;

  if (requiredDependencies.length === 0) {
    haCardDependency.textContent = t("dependency.builtIn", { atlasHint });
  } else if (!lovelaceResourcesChecked) {
    haCardDependency.textContent = t("dependency.requiresUnchecked", {
      dependency: dependencyLabel,
      resourceHint,
      installHint,
      atlasHint,
    });
  } else if (integrationPlan.ready) {
    haCardDependency.textContent = t("dependency.ready", {
      dependency: dependencyLabel,
      resourceHint,
      atlasHint,
    });
  } else if (integrationPlan.missingCardResourcePaths.length === 0) {
    haCardDependency.textContent = t("dependency.cardFoundAtlasMissing", {
      dependency: dependencyLabel,
      resourceHint,
      atlasHint,
      missing: integrationPlan.atlasAvailability.missingResourcePaths.join(", "),
    });
  } else {
    haCardDependency.textContent = t("dependency.missing", {
      dependency: dependencyLabel,
      resourceHint,
      installHint,
      atlasHint,
      missing: [
        ...integrationPlan.atlasAvailability.missingResourcePaths,
        ...integrationPlan.missingCardResourcePaths,
      ].join(", "),
    });
  }
}

function formatDependencyLabels(dependencies) {
  return [...new Set(dependencies.map(dependency => dependency.label))].join(", ");
}

function renderHaCardImportDecision(text) {
  const decision = decideHomeAssistantCardArtifactImport(text);
  haCardImportReview.dataset.action = decision.action;

  if (decision.action === "import") {
    haCardImportReview.textContent = decision.message;
    return decision;
  }

  if (decision.action === "review") {
    haCardImportReview.textContent = formatHomeAssistantCardArtifactReviewLines(text).join("\n");
    return decision;
  }

  haCardImportReview.textContent = `${decision.message} ${decision.inspection.reason}`;
  return decision;
}

function formatHacsBundlePackageReadReview(packageRead) {
  return formatHomeAssistantCardEditorHacsBundlePackageReadinessReviewLines(packageRead).join("\n");
}

function importHaCardTextIntoEditor(text) {
  const styleInspection = renderHaCardStyleInspection(text);
  const decision = renderHaCardImportDecision(text);
  if (decision.action !== "import") {
    statusMessage.textContent = decision.action === "review"
      ? t("message.importPaused")
      : t("message.importRejected");
    return false;
  }

  const summary = summarizeHomeAssistantCardImport(text);
  importedSimpleStyleInspection = styleInspection.hasStyles ? styleInspection : undefined;
  importedSimpleCodePreview = summary.format === "yaml" ? text : undefined;
  applyHomeAssistantCardImportSummary(summary);
  return true;
}

function clearHaCardStyleInspection() {
  haCardStyleReview.hidden = true;
  haCardStyleReview.textContent = "";
  if (haCardPasteStyleReview) {
    haCardPasteStyleReview.hidden = true;
    haCardPasteStyleReview.textContent = "";
  }
}

function renderHaCardStyleInspection(text) {
  const inspection = inspectHomeAssistantCardStyleBlocks(text);
  const content = formatHaCardStyleInspection(inspection);
  const showReview = content.trim().length > 0;
  haCardStyleReview.hidden = !showReview;
  haCardStyleReview.textContent = content;
  if (haCardPasteStyleReview) {
    haCardPasteStyleReview.hidden = !showReview;
    haCardPasteStyleReview.textContent = content;
  }
  return inspection;
}

function formatHaCardStyleInspection(inspection) {
  if (!inspection.hasStyles) return "";
  const sections = [
    formatHaCardStyleInspectionSection("Global", inspection.globalStyles),
    formatHaCardStyleInspectionSection("Layout", inspection.layoutOptions),
  ].filter(Boolean);
  const entityStyleMessage = inspection.cardStyles.length
    ? t("message.entityStylesAssigned", { count: inspection.cardStyles.length })
    : "";
  if (!sections.length && !entityStyleMessage) return "";
  return [
    t("message.styleBlocksDetected", {
      global: inspection.globalStyles.length,
      cards: inspection.cardStyles.length,
      layout: inspection.layoutOptions.length,
    }),
    entityStyleMessage,
    ...sections,
  ].filter(Boolean).join("\n\n");
}

function formatHaCardStyleInspectionSection(label, blocks) {
  if (!blocks.length) return "";
  return [
    `[${label}]`,
    ...blocks.map((block, index) => [
      `# ${index + 1}. ${block.label} (${block.key})`,
      block.code,
    ].join("\n")),
  ].join("\n\n");
}

function expertPaletteCardMatchesSearch(card, template, query) {
  if (!query) return true;
  const normalizedQuery = query.toLowerCase();
  return [
    translatePaletteCardLabel(card),
    translatePaletteCategory(card.category),
    translateTemplateLabel(template.id, template.label),
    translateTemplateLabel(template.id, template.layout),
    translateCardTarget(card.target, card.target),
    card.target,
    card.templateId,
    card.bubbleButtonType,
    card.resourceUrl,
    ...(card.preview ?? []),
  ].some(value => String(value ?? "").toLowerCase().includes(normalizedQuery));
}

function renderExpertTemplatePalette() {
  expertTemplatePalette.replaceChildren();
  const baseCards = expertPaletteFavoriteIds.size && !expertPaletteShowAllCards
    ? expertPaletteCards.filter(card => expertPaletteFavoriteIds.has(card.id))
    : expertPaletteCards;
  const visibleCards = baseCards.filter(card => {
    const template = cardEditorTemplates.find(candidate => candidate.id === card.templateId);
    return template ? expertPaletteCardMatchesSearch(card, template, expertPaletteSearchQuery.trim()) : false;
  });
  saveExpertPaletteFavorites.disabled = !isExpertPaletteFavoriteDraftDirty();
  showAllExpertPaletteCards.disabled = false;
  showAllExpertPaletteCards.textContent = expertPaletteShowAllCards ? t("button.showFavorites") : t("button.showAllCards");
  resetExpertTemplateSizing.disabled = !isExpertTemplateSizingDirty();
  resetExpertPaletteFavorites.disabled = expertPaletteFavoriteIds.size === 0;
  if (visibleCards.length === 0) {
    const empty = document.createElement("small");
    empty.textContent = t("text.noPaletteSearchResults");
    expertTemplatePalette.append(empty);
    return;
  }
  for (const card of visibleCards) {
    const template = cardEditorTemplates.find(candidate => candidate.id === card.templateId);
    if (!template) continue;
    const cardLabel = translatePaletteCardLabel(card);
    const cardCategory = translatePaletteCategory(card.category);
    const item = document.createElement("article");
    item.className = "expert-template-card";
    item.classList.toggle("selected", isExpertPaletteCardSelected(card));
    item.classList.toggle("disabled", card.disabled === true);
    item.draggable = card.disabled !== true;
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.setAttribute("aria-disabled", String(card.disabled === true));
    item.dataset.paletteCard = card.id;

    const main = document.createElement("div");
    main.className = "expert-template-main";
    const meta = document.createElement("div");
    meta.className = "expert-template-meta";
    const category = document.createElement("span");
    category.className = "palette-category";
    category.textContent = cardCategory;
    const title = document.createElement("strong");
    title.textContent = cardLabel;
    const detail = document.createElement("small");
    const bubbleType = card.target === "bubble" ? `, ${card.bubbleButtonType}` : "";
    detail.textContent = card.disabled === true
      ? t("text.registeredNotMapped", { category: cardCategory })
      : t("text.paletteDetail", {
        layout: translateTemplateLabel(template.id, template.layout),
        size: `${template.defaultWidth}x${template.defaultHeight}`,
        target: `${expertPaletteTargetLabel(card, template)}${bubbleType}`,
      });
    const preview = document.createElement("span");
    preview.textContent = card.preview.join(" / ");
    const availability = document.createElement("span");
    availability.textContent = card.disabled === true ? t("text.scannedOnly") : formatExpertTemplateAvailability(card.target);

    main.append(category, title);
    meta.append(detail, preview, availability);
    const favorite = document.createElement("label");
    favorite.className = "favorite-toggle";
    const favoriteCheckbox = document.createElement("input");
    favoriteCheckbox.type = "checkbox";
    favoriteCheckbox.checked = expertPaletteDraftFavoriteIds.has(card.id);
    favorite.append(favoriteCheckbox, t("text.favorite"));
    main.append(favorite);
    favorite.addEventListener("click", event => event.stopPropagation());
    favoriteCheckbox.addEventListener("change", event => {
      event.stopPropagation();
      setExpertPaletteFavoriteDraft(card.id, favoriteCheckbox.checked);
    });

    if (card.disabled !== true) {
      const sizing = createExpertTemplateSizingControls(template);
      meta.append(sizing);
    }
    item.append(main, meta);

    item.addEventListener("click", () => {
      if (card.disabled === true) {
        statusMessage.textContent = t("text.scannedCardUnavailable", { label: cardLabel });
        return;
      }
      selectExpertPaletteCard(card.id);
    });
    item.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (card.disabled === true) {
          statusMessage.textContent = t("text.scannedCardUnavailable", { label: cardLabel });
          return;
        }
        selectExpertPaletteCard(card.id);
      }
    });
    item.addEventListener("dragstart", event => {
      if (card.disabled === true) {
        event.preventDefault();
        return;
      }
      event.dataTransfer?.setData("text/plain", card.templateId);
      event.dataTransfer?.setData("application/x-atlas-template", card.templateId);
      event.dataTransfer?.setData("application/x-atlas-palette-card", card.id);
      event.dataTransfer?.setDragImage(item, 12, 12);
      expertDragFieldOffset = { column: 0, row: 0 };
      item.classList.add("dragging");
    });
    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
    });
    expertTemplatePalette.append(item);
  }
}

function isExpertPaletteFavoriteDraftDirty() {
  if (expertPaletteDraftFavoriteIds.size !== expertPaletteFavoriteIds.size) return true;
  for (const cardId of expertPaletteDraftFavoriteIds) {
    if (!expertPaletteFavoriteIds.has(cardId)) return true;
  }
  return false;
}

function isExpertTemplateSizingDirty() {
  return cardEditorTemplates.some(template => {
    const sizing = expertTemplateSizing.get(template.id) ?? { columns: String(template.defaultWidth), rows: "auto" };
    return sizing.columns !== String(template.defaultWidth) || sizing.rows !== "auto";
  });
}

function isExpertPaletteCardSelected(card) {
  return expertTemplate.value === card.templateId
    && expertTarget.value === card.target
    && (card.target !== "bubble" || expertBubbleButtonType.value === (card.bubbleButtonType ?? "state"));
}

function setExpertPaletteFavoriteDraft(cardId, favorite) {
  if (favorite) {
    expertPaletteDraftFavoriteIds.add(cardId);
  } else {
    expertPaletteDraftFavoriteIds.delete(cardId);
  }
  renderExpertTemplatePalette();
  statusMessage.textContent = t("text.paletteSelectionChanged");
}

function toggleExpertPaletteAllCards() {
  if (!expertPaletteShowAllCards) {
    expertPaletteShowAllCards = true;
    expertPaletteSearchQuery = "";
    expertPaletteSearch.value = "";
  } else {
    expertPaletteShowAllCards = expertPaletteFavoriteIds.size === 0;
  }
  renderExpertTemplatePalette();
  statusMessage.textContent = expertPaletteShowAllCards
    ? t("text.fullCardListVisible")
    : t("text.savedFavoritesVisible");
}

function saveExpertPaletteFavoriteSelection() {
  expertPaletteFavoriteIds.clear();
  for (const cardId of expertPaletteDraftFavoriteIds) {
    expertPaletteFavoriteIds.add(cardId);
  }
  expertPaletteShowAllCards = expertPaletteFavoriteIds.size === 0;
  persistConfiguration();
  renderExpertTemplatePalette();
  statusMessage.textContent = expertPaletteFavoriteIds.size
    ? t("text.favoritesSaved", { count: expertPaletteFavoriteIds.size })
    : t("text.allCardsRemainVisible");
}

function resetExpertPaletteFavoriteSelection() {
  expertPaletteFavoriteIds.clear();
  expertPaletteDraftFavoriteIds.clear();
  expertPaletteShowAllCards = false;
  persistConfiguration();
  renderExpertTemplatePalette();
  statusMessage.textContent = t("text.allCardsVisibleAgain");
}

function normalizeExpertTemplateSizing(input) {
  const columns = input?.columns === "full" ? "full" : String(Math.max(1, Math.min(expertGridColumns, Number(input?.columns) || 1)));
  const rows = input?.rows === "auto" ? "auto" : String(Math.max(1, Math.min(8, Number(input?.rows) || 1)));
  return { columns, rows };
}

function serializedExpertTemplateSizing() {
  return [...expertTemplateSizing.entries()].map(([templateId, sizing]) => ({
    templateId,
    ...normalizeExpertTemplateSizing(sizing),
  }));
}

function resetExpertTemplateSizingDefaults() {
  expertTemplateSizing.clear();
  for (const template of cardEditorTemplates) {
    expertTemplateSizing.set(template.id, {
      columns: String(template.defaultWidth),
      rows: "auto",
    });
  }
}

function resetExpertTemplateSizingSelection() {
  resetExpertTemplateSizingDefaults();
  syncExpertInputsFromTemplateSizing(expertTemplate.value);
  persistConfiguration();
  renderExpertTemplatePalette();
  statusMessage.textContent = t("text.templateSizesReset");
}

function createExpertTemplateSizingControls(template) {
  const sizing = expertTemplateSizing.get(template.id) ?? { columns: String(template.defaultWidth), rows: "auto" };
  const controls = document.createElement("span");
  controls.className = "expert-template-sizing";

  const columns = document.createElement("select");
  columns.setAttribute("aria-label", `${translateTemplateLabel(template.id, template.label)} ${t("label.column")}`);
  for (let index = 1; index <= expertGridColumns; index += 1) {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${index} ${t("text.col")}`;
    columns.append(option);
  }
  const full = document.createElement("option");
  full.value = "full";
  full.textContent = t("text.full");
  columns.append(full);
  columns.value = sizing.columns;

  const rows = document.createElement("select");
  rows.setAttribute("aria-label", `${translateTemplateLabel(template.id, template.label)} ${t("label.row")}`);
  const auto = document.createElement("option");
  auto.value = "auto";
  auto.textContent = t("text.auto");
  rows.append(auto);
  for (let index = 1; index <= 8; index += 1) {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${index} ${t("text.row")}`;
    rows.append(option);
  }
  rows.value = sizing.rows;

  const update = () => {
    expertTemplateSizing.set(template.id, {
      columns: columns.value,
      rows: rows.value,
    });
    if (expertTemplate.value === template.id) {
      syncExpertInputsFromTemplateSizing(template.id);
    }
    persistConfiguration();
    renderExpertTemplatePalette();
    statusMessage.textContent = t("message.templateSizeSet", {
      template: translateTemplateLabel(template.id, template.label),
      columns: columns.value,
      rows: rows.value,
    });
  };
  for (const control of [columns, rows]) {
    control.addEventListener("click", event => event.stopPropagation());
    control.addEventListener("mousedown", event => event.stopPropagation());
    control.addEventListener("dragstart", event => event.stopPropagation());
    control.addEventListener("change", update);
  }

  controls.append(columns, rows);
  return controls;
}

function formatExpertTemplateAvailability(target) {
  const dependency = inspectHomeAssistantCardDependency(target);
  if (!dependency.required) return t("text.builtIn");
  if (!lovelaceResourcesChecked) return t("text.resourceUnchecked");
  const availability = inspectHomeAssistantCardDependencyAvailability(target, lovelaceResources);
  return availability.status === "installed" ? t("text.resourceInstalled") : t("text.resourceMissing");
}

function selectExpertTemplate(templateId) {
  const template = cardEditorTemplates.find(candidate => candidate.id === templateId);
  if (!template) return;
  expertTemplate.value = template.id;
  syncExpertInputsFromTemplateSizing(template.id);
  expertTarget.value = template.target;
  syncExpertBubbleTypeControl();
  renderExpertTemplatePalette();
}

function selectExpertPaletteCard(cardId) {
  const card = expertPaletteCards.find(candidate => candidate.id === cardId);
  const template = cardEditorTemplates.find(candidate => candidate.id === card?.templateId);
  if (!card || !template) return undefined;
  if (card.disabled === true) {
    statusMessage.textContent = t("text.scannedCardUnavailable", { label: translatePaletteCardLabel(card) });
    return undefined;
  }
  expertTemplate.value = template.id;
  syncExpertInputsFromTemplateSizing(template.id);
  expertTarget.value = card.target;
  expertBubbleButtonType.value = card.bubbleButtonType ?? "state";
  syncExpertBubbleTypeControl();
  renderExpertTemplatePalette();
  statusMessage.textContent = t("text.paletteCardSelected", { label: translatePaletteCardLabel(card) });
  return card;
}

function syncExpertInputsFromTemplateSizing(templateId) {
  const template = cardEditorTemplates.find(candidate => candidate.id === templateId);
  if (!template) return;
  const sizing = expertTemplateSizing.get(templateId) ?? { columns: String(template.defaultWidth), rows: "auto" };
  expertWidth.value = sizing.columns === "full" ? String(expertGridColumns) : sizing.columns;
  expertHeight.value = sizing.rows === "auto" ? String(template.defaultHeight) : sizing.rows;
}

function renderExpertFieldList() {
  expertFieldList.replaceChildren();
  renderExpertEditButton();
  arrangeExpertFields.disabled = expertEditorFields.length === 0;
  if (expertEditorFields.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = t("message.noExpertFields");
    expertFieldList.append(empty);
    return;
  }

  expertEditorFields.forEach((field, index) => {
    const item = document.createElement("div");
    item.className = "expert-field-row";
    item.classList.toggle("selected", index === selectedExpertFieldIndex);
    const text = document.createElement("span");
    const bubbleType = field.target === "bubble" ? `, ${field.bubbleButtonType ?? "state"}` : "";
    const entityText = shouldShowExpertFieldEntity(field)
      ? `, ${field.entityId || t("text.demoEntity")}`
      : "";
    text.textContent = `${field.id}: ${expertFieldTypeLabel(field)}${bubbleType}, ${field.layout ?? "card"}, ${field.width}x${field.height}${entityText}`;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "icon-button";
    remove.textContent = "🗑";
    remove.title = t("text.removeField", { field: field.id });
    remove.setAttribute("aria-label", t("text.removeField", { field: field.id }));
    remove.addEventListener("click", event => {
      event.stopPropagation();
      expertEditorFields.splice(index, 1);
      if (selectedExpertFieldIndex === index) {
        selectedExpertFieldIndex = -1;
        expertFieldEditing = false;
      } else if (selectedExpertFieldIndex > index) {
        selectedExpertFieldIndex -= 1;
      }
      persistConfiguration();
      renderExpertEditorPreview();
      statusMessage.textContent = t("text.fieldRemoved", { field: field.id });
    });
    item.addEventListener("click", () => {
      selectExpertEditorField(index);
    });
    item.append(text, remove);
    expertFieldList.append(item);
  });
}

function formatEntityIdAsTitle(entityId) {
  const localName = entityId.includes(".") ? entityId.split(".").slice(1).join(".") : entityId;
  return localName
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, character => character.toUpperCase());
}

function currentExpertEntityTitle(entityId = expertEntity.value.trim() || currentEntityId()) {
  const entity = entitySnapshots.get(entityId);
  if (entity) {
    return createHomeAssistantEntityPresentation(entity).label;
  }
  return formatEntityIdAsTitle(entityId) || entityId;
}

function updateSelectedExpertFieldTitle(title) {
  if (selectedContainerCardRef) {
    const nextTitle = title.trim();
    if (!nextTitle) {
      statusMessage.textContent = t("text.enterTitle");
      return false;
    }
    return updateSelectedContainerCard(card => ({ ...card, id: nextTitle }));
  }

  const field = expertEditorFields[selectedExpertFieldIndex];
  const nextTitle = title.trim();
  if (!nextTitle) {
    statusMessage.textContent = t("text.enterTitle");
    return false;
  }
  if (!field) {
    statusMessage.textContent = t("text.titlePrepared", { title: nextTitle });
    return false;
  }
  expertEditorFields[selectedExpertFieldIndex] = {
    ...field,
    id: nextTitle,
    entries: renameExpertFieldEntries(field, nextTitle),
  };
  persistConfiguration();
  renderExpertEditorPreview();
  statusMessage.textContent = t("text.titleApplied", { title: nextTitle });
  return true;
}

function renameExpertFieldEntries(field, title) {
  if ((field.layout ?? "card") === "card" || !field.entries?.length) return field.entries;
  if (isEditableContainerField(field)) return field.entries;
  return field.entries.map((entry, index) => ({
    ...entry,
    id: field.entries.length === 1 ? title : `${title} ${index + 1}`,
    ...(entry.target === "bubble" ? { bubbleButtonType: entry.bubbleButtonType ?? "state" } : {}),
  }));
}

function isTabbedCardField(field) {
  return field?.target === "tabbed-card-v2";
}

function isStackContainerField(field) {
  return field && ((field.layout ?? "card") === "horizontal-stack" || (field.layout ?? "card") === "vertical-stack");
}

function isEditableContainerField(field) {
  return isTabbedCardField(field) || isStackContainerField(field);
}

function selectedTabbedCardField() {
  const field = expertEditorFields[selectedExpertFieldIndex];
  return isTabbedCardField(field) ? field : undefined;
}

function selectedStackContainerField() {
  const field = expertEditorFields[selectedExpertFieldIndex];
  return isStackContainerField(field) ? field : undefined;
}

function selectedEditableContainerField() {
  const field = expertEditorFields[selectedExpertFieldIndex];
  return isEditableContainerField(field) ? field : undefined;
}

function normalizeTabbedCardTabIndex(field) {
  const count = field?.entries?.length ?? 0;
  const index = Math.floor(Number(field?.activeTabIndex ?? 0));
  return Math.max(0, Math.min(Math.max(0, count - 1), Number.isFinite(index) ? index : 0));
}

function updateSelectedTabbedCardField(updater) {
  const field = selectedTabbedCardField();
  if (!field) {
    statusMessage.textContent = t("message.selectTabbedCardFirst");
    return undefined;
  }
  const nextField = updater(field);
  expertEditorFields[selectedExpertFieldIndex] = nextField;
  persistConfiguration();
  renderExpertEditorPreview();
  renderTabbedCardSettings();
  return nextField;
}

function updateSelectedStackContainerField(updater) {
  const field = selectedStackContainerField();
  if (!field) {
    statusMessage.textContent = t("message.selectFieldBeforeEditing");
    return undefined;
  }
  const nextField = normalizeStackContainerLayout(updater(field));
  expertEditorFields[selectedExpertFieldIndex] = nextField;
  persistConfiguration();
  renderExpertEditorPreview();
  renderStackCardSettings();
  return nextField;
}

function createTabbedCardEntry(input = {}) {
  const entityId = input.entityId?.trim() || expertEntity.value.trim() || currentEntityId();
  const target = input.target && input.target !== "tabbed-card-v2" ? input.target : "entity";
  const title = expertTitleForNewCardEntry(target, input.title);
  return {
    id: title,
    target,
    ...(target === "bubble" ? { bubbleButtonType: input.bubbleButtonType ?? expertBubbleButtonType.value ?? "state" } : {}),
    entityId,
    icon: input.icon?.trim() || "mdi:tab",
  };
}

function createTabbedCardTab(input = {}) {
  return {
    id: input.title?.trim() || input.id?.trim() || "Tab",
    icon: input.icon?.trim() || "mdi:tab",
    cards: Array.isArray(input.cards) ? input.cards : [],
  };
}

function addTabbedCardEntryToField(field, entry) {
  const entries = [...(field.entries ?? [])];
  const activeTabIndex = entries.length;
  entries.push(entry);
  return {
    ...field,
    entityId: field.entityId ?? "",
    entries,
    activeTabIndex,
  };
}

function addCardEntryToActiveTabInField(field, cardEntry) {
  const entries = [...(field.entries ?? [])];
  if (entries.length === 0) {
    return addTabbedCardEntryToField(field, {
      ...cardEntry,
      icon: cardEntry.icon ?? "mdi:tab",
      cards: [cardEntry],
    });
  }
  const activeTabIndex = normalizeTabbedCardTabIndex(field);
  const activeEntry = entries[activeTabIndex];
  const legacyCard = activeEntry.target ? [{
    id: activeEntry.id,
    target: activeEntry.target,
    ...(activeEntry.bubbleButtonType ? { bubbleButtonType: activeEntry.bubbleButtonType } : {}),
    entityId: activeEntry.entityId,
  }] : [];
  const tabCards = activeEntry.cards?.length ? [...activeEntry.cards] : legacyCard;
  tabCards.push(cardEntry);
  entries[activeTabIndex] = {
    ...activeEntry,
    cards: tabCards,
  };
  return {
    ...field,
    entityId: field.entityId ?? "",
    entries,
    activeTabIndex,
  };
}

function addCurrentExpertSelectionToActiveTabbedCard(input = {}) {
  const field = selectedTabbedCardField();
  if (!field) {
    statusMessage.textContent = t("message.selectTabbedCardFirst");
    return false;
  }
  const entry = createTabbedCardEntry(input);
  const tab = field.entries?.[normalizeTabbedCardTabIndex(field)] ?? entry;
  addCardToTabbedCardFieldAt(selectedExpertFieldIndex, entry);
  expertEntity.value = "";
  statusMessage.textContent = t("message.cardAddedToTab", { card: entry.id, tab: tab.id });
  return true;
}

function addEntryToTabbedCardFieldAt(fieldIndex, entry) {
  const field = expertEditorFields[fieldIndex];
  if (!isTabbedCardField(field)) return false;
  expertEditorFields[fieldIndex] = addTabbedCardEntryToField(field, entry);
  selectedExpertFieldIndex = fieldIndex;
  persistConfiguration();
  renderExpertEditorPreview();
  renderTabbedCardSettings();
  return true;
}

function addEntryToStackContainerFieldAt(fieldIndex, entry) {
  const field = expertEditorFields[fieldIndex];
  if (!isStackContainerField(field)) return false;
  const entries = [...(field.entries ?? []), entry];
  expertEditorFields[fieldIndex] = normalizeStackContainerLayout({
    ...field,
    entityId: field.entityId ?? "",
    entries,
  });
  selectedExpertFieldIndex = fieldIndex;
  selectedContainerCardRef = {
    fieldIndex,
    cardIndex: entries.length - 1,
  };
  persistConfiguration();
  renderExpertEditorPreview();
  statusMessage.textContent = t("message.cardAddedToContainer", { card: entry.id, container: field.id });
  return true;
}

function addCardEntryToSelectedContainer(input = {}) {
  const field = selectedEditableContainerField();
  if (!field) return false;
  const entry = createTabbedCardEntry(input);
  if (isTabbedCardField(field)) {
    return addCurrentExpertSelectionToActiveTabbedCard(input);
  }
  return addEntryToStackContainerFieldAt(selectedExpertFieldIndex, entry);
}

function setActiveTabbedCardTab(fieldIndex, tabIndex) {
  const field = expertEditorFields[fieldIndex];
  if (!isTabbedCardField(field)) return false;
  const entries = field.entries ?? [];
  const activeTabIndex = Math.max(0, Math.min(Math.max(0, entries.length - 1), Math.floor(Number(tabIndex))));
  expertEditorFields[fieldIndex] = {
    ...field,
    activeTabIndex,
  };
  selectedExpertFieldIndex = fieldIndex;
  selectedContainerCardRef = undefined;
  persistConfiguration();
  renderExpertEditorPreview();
  renderTabbedCardSettings();
  statusMessage.textContent = t("message.tabSelected", { tab: entries[activeTabIndex]?.id ?? `Tab ${activeTabIndex + 1}` });
  return true;
}

function selectContainerCard(reference) {
  const field = expertEditorFields[reference.fieldIndex];
  const card = getContainerCard(reference);
  if (!field || !card) return false;
  selectedExpertFieldIndex = reference.fieldIndex;
  selectedContainerCardRef = reference;
  expertTitle.value = card.id;
  expertEntity.value = card.entityId;
  expertTarget.value = card.target;
  expertBubbleButtonType.value = card.bubbleButtonType ?? "state";
  syncExpertBubbleTypeControl();
  persistConfiguration();
  renderExpertFieldList();
  renderExpertEditorSurface();
  renderTabbedCardSettings();
  renderStackCardSettings();
  statusMessage.textContent = t("message.containerCardSelected", { card: card.id, container: field.id });
  return true;
}

function getContainerCard(reference) {
  const field = expertEditorFields[reference?.fieldIndex];
  if (!field) return undefined;
  if (isTabbedCardField(field)) {
    const tab = field.entries?.[reference.tabIndex ?? normalizeTabbedCardTabIndex(field)];
    if (!tab) return undefined;
    return tab.cards?.[reference.cardIndex ?? 0];
  }
  if (isStackContainerField(field)) {
    return field.entries?.[reference.cardIndex ?? 0];
  }
  return undefined;
}

function updateSelectedContainerCard(updater) {
  const reference = selectedContainerCardRef;
  const field = expertEditorFields[reference?.fieldIndex];
  if (!reference || !field) return false;
  const nextField = updateContainerCard(field, reference, updater);
  if (!nextField) return false;
  expertEditorFields[reference.fieldIndex] = isStackContainerField(nextField)
    ? normalizeStackContainerLayout(nextField)
    : nextField;
  selectedExpertFieldIndex = reference.fieldIndex;
  persistConfiguration();
  renderExpertEditorPreview();
  const card = getContainerCard(reference);
  statusMessage.textContent = t("message.containerCardUpdated", { card: card?.id ?? "", container: field.id });
  return true;
}

function updateContainerCard(field, reference, updater) {
  const entries = [...(field.entries ?? [])];
  if (isTabbedCardField(field)) {
    const tabIndex = reference.tabIndex ?? normalizeTabbedCardTabIndex(field);
    const tab = entries[tabIndex];
    if (!tab) return undefined;
    const cards = [...(tab.cards ?? [])];
    const cardIndex = reference.cardIndex ?? 0;
    const card = cards[cardIndex];
    if (!card) return undefined;
    cards[cardIndex] = updater(card);
    entries[tabIndex] = { ...tab, cards };
    return {
      ...field,
      entityId: entries[0]?.entityId ?? field.entityId,
      entries,
    };
  }
  if (isStackContainerField(field)) {
    const cardIndex = reference.cardIndex ?? 0;
    const card = entries[cardIndex];
    if (!card) return undefined;
    entries[cardIndex] = updater(card);
    return {
      ...field,
      entityId: entries[0]?.entityId ?? field.entityId,
      entries,
    };
  }
  return undefined;
}

function removeContainerCard(reference) {
  const field = expertEditorFields[reference?.fieldIndex];
  const card = getContainerCard(reference);
  if (!field || !card) return false;
  const entries = [...(field.entries ?? [])];
  if (isTabbedCardField(field)) {
    const tabIndex = reference.tabIndex ?? normalizeTabbedCardTabIndex(field);
    const tab = entries[tabIndex];
    const cards = [...(tab?.cards ?? [])];
    cards.splice(reference.cardIndex ?? 0, 1);
    entries[tabIndex] = { ...tab, cards };
  } else if (isStackContainerField(field)) {
    entries.splice(reference.cardIndex ?? 0, 1);
  } else {
    return false;
  }
  expertEditorFields[reference.fieldIndex] = {
    ...field,
    entityId: entries[0]?.entityId ?? field.entityId,
    entries,
  };
  if (isStackContainerField(expertEditorFields[reference.fieldIndex])) {
    expertEditorFields[reference.fieldIndex] = normalizeStackContainerLayout(expertEditorFields[reference.fieldIndex]);
  }
  selectedExpertFieldIndex = reference.fieldIndex;
  selectedContainerCardRef = undefined;
  persistConfiguration();
  renderExpertEditorPreview();
  statusMessage.textContent = t("message.containerCardRemoved", { card: card.id, container: field.id });
  return true;
}

function moveContainerCardToSurface(reference, placementOverride) {
  const field = expertEditorFields[reference?.fieldIndex];
  const card = getContainerCard(reference);
  if (!field || !card) return false;
  const preferredPlacement = placementOverride ?? {};
  const placement = findAvailableExpertSurfacePlacement(
    preferredPlacement.width ?? 3,
    preferredPlacement.height ?? 1,
    preferredPlacement,
  );
  if (!removeContainerCard(reference)) return false;
  const templateId = templateIdForCardTarget(card.target);
  const target = card.target ?? "entity";
  expertEditorFields.push({
    id: card.id,
    target,
    ...(card.bubbleButtonType ? { bubbleButtonType: card.bubbleButtonType } : {}),
    entityId: card.entityId ?? currentEntityId(),
    layout: "card",
    column: placement.column,
    row: placement.row,
    width: placement.width ?? 3,
    height: placement.height ?? 1,
    resizeBaseWidth: placement.width ?? 3,
    resizeBaseHeight: placement.height ?? 1,
    templateId,
  });
  selectedExpertFieldIndex = expertEditorFields.length - 1;
  selectedContainerCardRef = undefined;
  persistConfiguration();
  renderExpertEditorPreview();
  statusMessage.textContent = t("message.containerCardMovedOut", { card: card.id, container: field.id });
  return true;
}

function findAvailableExpertSurfacePlacement(width, height, preferredPlacement = {}, excludeIndex = -1) {
  const nextWidth = Math.max(1, Math.min(expertGridColumns, width));
  const nextHeight = Math.max(1, Math.min(expertGridRows, height));
  const fieldConflicts = candidate => expertEditorFields.some((field, index) => (
    index !== excludeIndex && expertFieldsOverlap(candidate, field)
  ));
  if (Number.isFinite(preferredPlacement.column) && Number.isFinite(preferredPlacement.row)) {
    const preferred = {
      column: Math.max(0, Math.min(expertGridColumns - nextWidth, preferredPlacement.column)),
      row: Math.max(0, Math.min(expertGridRows - nextHeight, preferredPlacement.row)),
      width: nextWidth,
      height: nextHeight,
    };
    if (!fieldConflicts(preferred)) {
      return preferred;
    }
  }
  for (let row = 0; row <= expertGridRows - nextHeight; row += 1) {
    for (let column = 0; column <= expertGridColumns - nextWidth; column += 1) {
      const candidate = { column, row, width: nextWidth, height: nextHeight };
      if (!fieldConflicts(candidate)) {
        return candidate;
      }
    }
  }
  return {
    column: 0,
    row: 0,
    width: nextWidth,
    height: nextHeight,
  };
}

function expertFieldsOverlap(first, second) {
  return first.column < second.column + second.width
    && first.column + first.width > second.column
    && first.row < second.row + second.height
    && first.row + first.height > second.row;
}

function templateIdForCardTarget(target) {
  if (target === "bubble") return "state-button";
  if (target === "mushroom-template") return "state-button";
  if (target === "button") return "button-card";
  if (target === "sensor") return "sensor-card";
  if (target === "thermostat") return "thermostat-card";
  if (target === "link") return "link-card";
  if (target === "webpage") return "webpage-card";
  if (target === "entities") return "entity-list";
  return "entity-card";
}

function addCardToTabbedCardFieldAt(fieldIndex, entry) {
  const field = expertEditorFields[fieldIndex];
  if (!isTabbedCardField(field)) return false;
  expertEditorFields[fieldIndex] = addCardEntryToActiveTabInField(field, entry);
  selectedExpertFieldIndex = fieldIndex;
  persistConfiguration();
  renderExpertEditorPreview();
  renderTabbedCardSettings();
  return true;
}

function addPaletteCardToTabbedCardField(fieldIndex, paletteCardId) {
  const card = expertPaletteCards.find(candidate => candidate.id === paletteCardId);
  const template = cardEditorTemplates.find(candidate => candidate.id === card?.templateId);
  if (!card || !template || card.disabled === true || card.target === "tabbed-card-v2") return false;
  const entityId = expertEntity.value.trim() || currentEntityId();
  const entry = createTabbedCardEntry({
    entityId,
    target: card.target,
    bubbleButtonType: card.bubbleButtonType,
  });
  const tab = expertEditorFields[fieldIndex]?.entries?.[normalizeTabbedCardTabIndex(expertEditorFields[fieldIndex])] ?? entry;
  const added = addCardToTabbedCardFieldAt(fieldIndex, entry);
  if (added) {
    statusMessage.textContent = t("message.cardAddedToTab", { card: entry.id, tab: tab.id });
  }
  return added;
}

function moveExpertFieldIntoTabbedCard(fieldIndex, tabbedFieldIndex) {
  const field = expertEditorFields[fieldIndex];
  const container = expertEditorFields[tabbedFieldIndex];
  if (!field || !isTabbedCardField(container) || fieldIndex === tabbedFieldIndex || field.target === "tabbed-card-v2") return false;
  const entry = createTabbedCardEntry({
    title: field.id,
    entityId: field.entityId || field.entries?.[0]?.entityId || currentEntityId(),
    target: field.target,
    bubbleButtonType: field.bubbleButtonType,
  });
  const tab = container.entries?.[normalizeTabbedCardTabIndex(container)] ?? entry;
  expertEditorFields[tabbedFieldIndex] = addCardEntryToActiveTabInField(container, entry);
  expertEditorFields.splice(fieldIndex, 1);
  selectedExpertFieldIndex = fieldIndex < tabbedFieldIndex ? tabbedFieldIndex - 1 : tabbedFieldIndex;
  persistConfiguration();
  renderExpertEditorPreview();
  renderTabbedCardSettings();
  statusMessage.textContent = t("message.cardAddedToTab", { card: entry.id, tab: tab.id });
  return true;
}

function openTabbedCardSettings() {
  const field = selectedTabbedCardField();
  if (!field) {
    statusMessage.textContent = t("message.selectTabbedCardFirst");
    return;
  }
  tabbedCardSettingsBackdrop.hidden = false;
  renderTabbedCardSettings();
  statusMessage.textContent = t("message.tabbedCardSettingsOpened", { field: field.id });
}

function openStackCardSettings() {
  const field = selectedStackContainerField();
  if (!field) {
    statusMessage.textContent = t("message.selectFieldBeforeEditing");
    return;
  }
  stackCardSettingsBackdrop.hidden = false;
  renderStackCardSettings();
  statusMessage.textContent = t("message.stackCardSettingsOpened", { field: field.id });
}

function openOverviewCardEntitiesDialog(fieldIndex = selectedExpertFieldIndex) {
  const field = expertEditorFields[fieldIndex];
  if (!isOverviewField(field)) {
    statusMessage.textContent = t("message.selectFieldBeforeEditing");
    return;
  }

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  const dialog = document.createElement("section");
  dialog.className = "tabbed-card-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");

  const header = document.createElement("header");
  const title = document.createElement("h2");
  title.textContent = t("heading.overviewCardEntities");
  const close = document.createElement("button");
  close.type = "button";
  close.className = "icon-button";
  close.setAttribute("aria-label", t("button.cancel"));
  close.title = t("button.cancel");
  close.textContent = "×";
  header.append(title, close);

  const body = document.createElement("div");
  body.className = "tabbed-card-dialog-body single-column";
  const list = document.createElement("div");
  list.className = "overview-entity-editor-list";
  body.append(list);

  const picker = document.createElement("section");
  picker.className = "overview-entity-picker";
  picker.hidden = true;
  const pickerTitle = document.createElement("strong");
  pickerTitle.textContent = t("text.entityPicker");
  const pickerSearch = document.createElement("input");
  pickerSearch.type = "search";
  pickerSearch.autocomplete = "off";
  pickerSearch.spellcheck = false;
  pickerSearch.placeholder = t("label.entitySearch");
  const pickerDomains = document.createElement("div");
  pickerDomains.className = "overview-entity-domain-filters";
  const pickerResults = document.createElement("div");
  pickerResults.className = "overview-entity-picker-results";
  picker.append(pickerTitle, pickerSearch, pickerDomains, pickerResults);
  body.append(picker);

  const actions = document.createElement("div");
  actions.className = "connection-actions";
  const add = document.createElement("button");
  add.type = "button";
  add.textContent = t("button.addEntity");
  const save = document.createElement("button");
  save.type = "button";
  save.textContent = t("button.save");
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.textContent = t("button.cancel");
  actions.append(add, save, cancel);
  body.append(actions);
  dialog.append(header, body);
  backdrop.append(dialog);
  document.body.append(backdrop);

  let entries = [...(field.entries ?? [])].map(entry => ({ ...entry }));
  let selectedPickerDomain = "all";
  let pickerRenderTimer;

  const closeDialog = () => {
    window.clearTimeout(pickerRenderTimer);
    backdrop.remove();
  };
  const renderPicker = () => {
    const catalog = createEntityPickerCatalog();
    const domains = listHomeAssistantEntityCatalogDomains(catalog);
    const shortcutDomains = listHomeAssistantEntityDomainShortcuts(domains);
    if (selectedPickerDomain !== "all" && !domains.includes(selectedPickerDomain)) {
      selectedPickerDomain = "all";
    }
    pickerDomains.replaceChildren();
    for (const domain of shortcutDomains) {
      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "overview-entity-picker-domain";
      radio.value = domain;
      radio.checked = domain === selectedPickerDomain;
      const text = document.createElement("span");
      text.textContent = domain === "all" ? t("text.all") : domain;
      radio.addEventListener("change", () => {
        selectedPickerDomain = domain;
        renderPicker();
      });
      label.append(radio, text);
      pickerDomains.append(label);
    }

    const entityEntries = filterHomeAssistantEntityCatalog(catalog, {
      domain: selectedPickerDomain,
      search: pickerSearch.value,
    });
    pickerResults.replaceChildren();
    for (const entityEntry of entityEntries) {
      const result = document.createElement("button");
      result.type = "button";
      const title = document.createElement("strong");
      const detail = document.createElement("small");
      title.textContent = entityEntry.label;
      detail.textContent = `${entityEntry.entityId} · ${entityIcon(entityEntry.entityId)}`;
      result.append(title, detail);
      result.addEventListener("click", () => {
        entries.push({
          id: entityEntry.label,
          target: "entity",
          entityId: entityEntry.entityId,
          icon: entityIcon(entityEntry.entityId),
        });
        renderRows();
      });
      pickerResults.append(result);
    }
    if (entityEntries.length === 0) {
      const empty = document.createElement("p");
      empty.className = "dialog-hint";
      const domainLabel = selectedPickerDomain === "all" ? t("message.allTypes") : selectedPickerDomain;
      const searchSuffix = pickerSearch.value.trim() ? t("message.entitySearchSuffix", { search: pickerSearch.value.trim() }) : "";
      empty.textContent = t("message.noEntitiesFound", { domain: domainLabel, search: searchSuffix });
      pickerResults.append(empty);
    }
  };
  const schedulePickerRender = () => {
    window.clearTimeout(pickerRenderTimer);
    pickerRenderTimer = window.setTimeout(renderPicker, 120);
  };
  const renderRows = () => {
    list.replaceChildren();
    entries.forEach((entry, index) => {
      list.append(createOverviewEntityEditorRow(entry, index, entries.length, {
        update: nextEntry => {
          entries[index] = nextEntry;
        },
        move: direction => {
          const nextIndex = index + direction;
          if (nextIndex < 0 || nextIndex >= entries.length) return;
          [entries[index], entries[nextIndex]] = [entries[nextIndex], entries[index]];
          renderRows();
        },
        remove: () => {
          entries.splice(index, 1);
          renderRows();
        },
      }));
    });
    if (entries.length === 0) {
      const empty = document.createElement("p");
      empty.className = "dialog-hint";
      empty.textContent = t("message.dragCard");
      list.append(empty);
    }
  };

  add.addEventListener("click", () => {
    picker.hidden = !picker.hidden;
    if (!picker.hidden) {
      renderPicker();
      pickerSearch.focus();
    }
  });
  pickerSearch.addEventListener("input", schedulePickerRender);
  save.addEventListener("click", () => {
    const normalizedEntries = entries
      .map((entry, index) => ({
        id: String(entry.id ?? "").trim() || entityDisplayName(entry.entityId) || `Entity ${index + 1}`,
        target: "entity",
        entityId: String(entry.entityId ?? "").trim(),
        ...(String(entry.icon ?? "").trim() ? { icon: String(entry.icon).trim() } : {}),
        ...(typeof entry.show_last_changed === "boolean" ? { show_last_changed: entry.show_last_changed } : {}),
        ...(Array.isArray(entry.styleBlocks) && entry.styleBlocks.length ? { styleBlocks: entry.styleBlocks.map(block => ({ ...block })) } : {}),
      }))
      .filter(entry => entry.entityId);
    expertEditorFields[fieldIndex] = {
      ...expertEditorFields[fieldIndex],
      entries: normalizedEntries,
    };
    selectedExpertFieldIndex = fieldIndex;
    selectedContainerCardRef = undefined;
    persistConfiguration();
    renderExpertEditorPreview();
    statusMessage.textContent = t("message.overviewEntitiesUpdated", { field: expertEditorFields[fieldIndex]?.id ?? "" });
    closeDialog();
  });
  cancel.addEventListener("click", closeDialog);
  close.addEventListener("click", closeDialog);
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) closeDialog();
  });
  renderRows();
  statusMessage.textContent = t("message.overviewEntitiesOpened", { field: field.id });
}

function createOverviewEntityEditorRow(entry, index, total, callbacks) {
  const row = document.createElement("div");
  row.className = "overview-entity-editor-row";

  const name = createLabeledInput(t("label.name"), entry.id ?? "");
  const entity = createLabeledInput(t("label.entity"), entry.entityId ?? "");
  const icon = createLabeledInput(t("label.icon"), entry.icon ?? "");
  const showLastChanged = document.createElement("label");
  showLastChanged.className = "checkbox-row";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = entry.show_last_changed === true;
  const checkboxLabel = document.createElement("span");
  checkboxLabel.textContent = "show_last_changed";
  showLastChanged.append(checkbox, checkboxLabel);

  const actions = document.createElement("div");
  actions.className = "overview-entity-actions";
  const up = createSmallActionButton("↑", index === 0, () => callbacks.move(-1));
  const down = createSmallActionButton("↓", index >= total - 1, () => callbacks.move(1));
  const remove = createSmallActionButton("×", false, callbacks.remove);
  actions.append(up, down, remove);

  const sync = () => callbacks.update({
    ...entry,
    id: name.input.value,
    entityId: entity.input.value,
    icon: icon.input.value,
    show_last_changed: checkbox.checked,
  });
  for (const control of [name.input, entity.input, icon.input, checkbox]) {
    control.addEventListener("input", sync);
    control.addEventListener("change", sync);
  }

  row.append(name.wrapper, entity.wrapper, icon.wrapper, showLastChanged, actions);
  const styleBlocks = getEntryStyleBlocks(entry);
  if (styleBlocks.length) {
    const style = document.createElement("details");
    style.className = "overview-entity-editor-style";
    const label = document.createElement("summary");
    label.textContent = t("text.styleCode");
    const code = document.createElement("pre");
    code.textContent = styleBlocks.map(block => block.code).join("\n\n");
    style.append(label, code);
    row.append(style);
  }
  return row;
}

function createLabeledInput(labelText, value) {
  const wrapper = document.createElement("div");
  wrapper.className = "field-pair";
  const label = document.createElement("label");
  label.textContent = labelText;
  const input = document.createElement("input");
  input.type = "text";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.value = value ?? "";
  wrapper.append(label, input);
  return { wrapper, input };
}

function createSmallActionButton(label, disabled, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.disabled = disabled;
  button.addEventListener("click", onClick);
  return button;
}

function closeTabbedCardSettingsDialog() {
  tabbedCardSettingsBackdrop.hidden = true;
}

function closeStackCardSettingsDialog() {
  stackCardSettingsBackdrop.hidden = true;
}

function renderTabbedCardSettings() {
  if (tabbedCardSettingsBackdrop.hidden) return;
  const field = selectedTabbedCardField();
  tabbedCardTabList.replaceChildren();
  if (!field) {
    tabbedCardSettingsBackdrop.hidden = true;
    return;
  }
  const entries = field.entries ?? [];
  const activeIndex = normalizeTabbedCardTabIndex(field);
  entries.forEach((entry, index) => {
    const row = document.createElement("div");
    row.className = "tabbed-card-tab-row";
    row.classList.toggle("selected", index === activeIndex);
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${entry.icon ?? "mdi:tab"} ${entry.id}`;
    button.addEventListener("click", () => {
      updateSelectedTabbedCardField(current => ({ ...current, activeTabIndex: index }));
    });
    const detail = document.createElement("small");
    detail.textContent = t("text.tabCardCount", { count: entry.cards?.length ?? 0 });
    row.append(button, detail);
    tabbedCardTabList.append(row);
  });

  const activeEntry = entries[activeIndex];
  tabbedCardTabLabel.value = activeEntry?.id ?? "";
  tabbedCardTabIcon.value = activeEntry?.icon ?? "mdi:tab";
  tabbedCardFullWidth.checked = field.columns === "full" || field.fullWidth === true;
  tabbedCardAutoHeight.checked = field.rows === "auto" || field.autoHeight === true;
  removeTabbedCardTab.disabled = entries.length === 0;
  moveTabbedCardTabUp.disabled = activeIndex <= 0;
  moveTabbedCardTabDown.disabled = activeIndex >= entries.length - 1;
  applyTabbedCardTab.disabled = entries.length === 0;
}

function handleAddTabbedCardTab() {
  const index = selectedTabbedCardField()?.entries?.length ?? 0;
  const entry = createTabbedCardTab({
    title: `Tab ${index + 1}`,
    icon: "mdi:tab",
  });
  updateSelectedTabbedCardField(field => addTabbedCardEntryToField(field, entry));
  tabbedCardSettingsStatus.textContent = t("message.tabAdded", { label: entry.id });
}

function removeActiveTabbedCardTab() {
  updateSelectedTabbedCardField(field => {
    const entries = [...(field.entries ?? [])];
    if (entries.length === 0) return field;
    const activeIndex = normalizeTabbedCardTabIndex(field);
    entries.splice(activeIndex, 1);
    return {
      ...field,
      entityId: entries[0]?.entityId ?? "",
      entries,
      activeTabIndex: Math.max(0, Math.min(activeIndex, entries.length - 1)),
    };
  });
  tabbedCardSettingsStatus.textContent = t("message.tabRemoved");
}

function moveActiveTabbedCardTab(direction) {
  updateSelectedTabbedCardField(field => {
    const entries = [...(field.entries ?? [])];
    const activeIndex = normalizeTabbedCardTabIndex(field);
    const nextIndex = activeIndex + direction;
    if (nextIndex < 0 || nextIndex >= entries.length) return field;
    [entries[activeIndex], entries[nextIndex]] = [entries[nextIndex], entries[activeIndex]];
    return {
      ...field,
      entries,
      activeTabIndex: nextIndex,
    };
  });
  tabbedCardSettingsStatus.textContent = t("message.tabMoved");
}

function applyActiveTabbedCardTab() {
  const label = tabbedCardTabLabel.value.trim();
  updateSelectedTabbedCardField(field => {
    const activeIndex = normalizeTabbedCardTabIndex(field);
    const entries = [...(field.entries ?? [])];
    const current = entries[activeIndex];
    if (!current) return field;
    entries[activeIndex] = {
      ...current,
      id: label || current.id,
      icon: tabbedCardTabIcon.value.trim() || "mdi:tab",
    };
    return {
      ...field,
      entityId: entries[0]?.entityId ?? field.entityId,
      entries,
    };
  });
  tabbedCardSettingsStatus.textContent = t("message.tabUpdated", { label: label || tabbedCardTabLabel.value });
}

function applyTabbedCardContainerOptions() {
  updateSelectedTabbedCardField(field => ({
    ...field,
    columns: tabbedCardFullWidth.checked ? "full" : undefined,
    rows: tabbedCardAutoHeight.checked ? "auto" : undefined,
    fullWidth: undefined,
    autoHeight: undefined,
    ...(tabbedCardFullWidth.checked ? { column: 0, width: expertGridColumns } : {}),
  }));
  renderExpertEditButton();
  tabbedCardSettingsStatus.textContent = t("message.tabUpdated", { label: tabbedCardTabLabel.value || selectedTabbedCardField()?.id || "Tabbed Card V2" });
}

function renderStackCardSettings() {
  if (stackCardSettingsBackdrop.hidden) return;
  const field = selectedStackContainerField();
  if (!field) {
    stackCardSettingsBackdrop.hidden = true;
    return;
  }
  const columns = normalizeStackColumns(typeof field.columns === "number" ? field.columns : field.width);
  stackCardFullWidth.checked = field.columns === "full" || field.fullWidth === true;
  stackCardAutoHeight.checked = field.rows === "auto" || field.autoHeight === true;
  stackCardColumns.value = String(columns);
  stackCardColumns.disabled = stackCardFullWidth.checked;
  renderStackCardColumnsOutput();
}

function applyStackCardContainerOptions() {
  updateSelectedStackContainerField(field => {
    const fullWidth = stackCardFullWidth.checked;
    const width = fullWidth ? expertGridColumns : normalizeStackColumns(stackCardColumns.value);
    return {
      ...field,
      columns: fullWidth ? "full" : width,
      rows: stackCardAutoHeight.checked ? "auto" : undefined,
      fullWidth: undefined,
      autoHeight: undefined,
      column: fullWidth ? 0 : Math.min(field.column, expertGridColumns - width),
      width,
    };
  });
  renderExpertEditButton();
  stackCardSettingsStatus.textContent = t("message.stackCardSettingsUpdated", { field: selectedStackContainerField()?.id || "" });
}

function normalizeStackColumns(value) {
  return Math.max(4, Math.min(10, Math.floor(Number(value) || 4)));
}

function renderStackCardColumnsOutput() {
  const columns = stackCardFullWidth.checked ? expertGridColumns : normalizeStackColumns(stackCardColumns.value);
  stackCardColumnsOutput.textContent = `${columns} ${t("label.column")}`;
}

function normalizeStackContainerLayout(field) {
  if (!isStackContainerField(field)) return field;
  const fullWidth = field.columns === "full" || field.fullWidth === true;
  const width = fullWidth ? expertGridColumns : normalizeStackColumns(typeof field.columns === "number" ? field.columns : field.width);
  const next = {
    ...field,
    ...(fullWidth ? { columns: "full" } : { columns: width }),
    width,
    column: fullWidth ? 0 : Math.min(field.column, expertGridColumns - width),
  };
  if (field.rows === "auto" || field.autoHeight === true) {
    return {
      ...next,
      rows: "auto",
      height: calculateStackContainerAutoHeight(next),
    };
  }
  return next;
}

function calculateStackContainerAutoHeight(field) {
  const entries = field.entries?.length ?? 0;
  if (entries === 0) return 2;
  if ((field.layout ?? "vertical-stack") === "horizontal-stack") {
    const cardsPerRow = Math.max(1, Math.floor(Math.max(1, field.width) / 4));
    return Math.max(2, 2 + Math.ceil(entries / cardsPerRow) * 2);
  }
  return Math.max(2, 2 + entries * 2);
}

function updateSelectedExpertFieldTarget() {
  syncExpertBubbleTypeControl();
  if (selectedContainerCardRef) {
    const nextTarget = expertTarget.value === "tabbed-card-v2" ? "entity" : expertTarget.value;
    const nextBubbleButtonType = nextTarget === "bubble" ? expertBubbleButtonType.value : undefined;
    return updateSelectedContainerCard(card => ({
      ...card,
      target: nextTarget,
      ...(nextBubbleButtonType ? { bubbleButtonType: nextBubbleButtonType } : { bubbleButtonType: undefined }),
    }));
  }

  const field = expertEditorFields[selectedExpertFieldIndex];
  if (!field) return;
  const nextTarget = expertTarget.value;
  const nextBubbleButtonType = nextTarget === "bubble" ? expertBubbleButtonType.value : undefined;
  expertEditorFields[selectedExpertFieldIndex] = {
    ...field,
    target: nextTarget,
    ...(nextBubbleButtonType ? { bubbleButtonType: nextBubbleButtonType } : { bubbleButtonType: undefined }),
    entries: (field.entries ?? []).map(entry => ({
      ...entry,
      target: nextTarget,
      ...(nextBubbleButtonType ? { bubbleButtonType: nextBubbleButtonType } : { bubbleButtonType: undefined }),
    })),
  };
  persistConfiguration();
  renderExpertEditorPreview();
  statusMessage.textContent = t("text.targetUpdated", { field: field.id, target: translateCardTarget(nextTarget, nextTarget) });
}

function updateSelectedExpertFieldBubbleType() {
  if (selectedContainerCardRef) {
    return updateSelectedContainerCard(card => card.target === "bubble"
      ? { ...card, bubbleButtonType: expertBubbleButtonType.value }
      : card);
  }

  const field = expertEditorFields[selectedExpertFieldIndex];
  if (!field || expertTarget.value !== "bubble") return;
  expertEditorFields[selectedExpertFieldIndex] = {
    ...field,
    bubbleButtonType: expertBubbleButtonType.value,
    entries: (field.entries ?? []).map(entry => ({
      ...entry,
      bubbleButtonType: expertBubbleButtonType.value,
    })),
  };
  persistConfiguration();
  renderExpertEditorPreview();
  statusMessage.textContent = t("text.bubbleTypeUpdated", { field: field.id, type: expertBubbleButtonType.value });
}

function getExpertFieldResizeBase(field) {
  return {
    width: Math.max(1, Math.floor(Number(field.resizeBaseWidth ?? field.width))),
    height: Math.max(1, Math.floor(Number(field.resizeBaseHeight ?? field.height))),
  };
}

function getExpertFieldResizeLimit(field) {
  const base = getExpertFieldResizeBase(field);
  return {
    width: Math.min(expertGridColumns, base.width + expertFieldMaxResizeDelta),
    height: Math.min(expertGridRows, base.height + expertFieldMaxResizeDelta),
  };
}

function clampExpertFieldSpan(value, fallback, limit) {
  const numericValue = Number(value);
  const nextValue = Number.isFinite(numericValue) ? Math.floor(numericValue) : fallback;
  return Math.max(1, Math.min(limit, nextValue));
}

function clampExpertFieldOffset(value, fallback, max) {
  const numericValue = Number(value);
  const nextValue = Number.isFinite(numericValue) ? Math.floor(numericValue) : fallback;
  return Math.max(0, Math.min(max, nextValue));
}

function clampExpertEditorSurfaceDelta(value, max = expertGridMaxExtraColumns) {
  const numericValue = Number(value);
  const nextValue = Number.isFinite(numericValue) ? Math.floor(numericValue) : 0;
  return Math.max(0, Math.min(max, nextValue));
}

function clampExpertGridColumns(value) {
  const numericValue = Number(value);
  const nextValue = Number.isFinite(numericValue) ? Math.floor(numericValue) : expertGridBaseColumns;
  return Math.max(expertGridBaseColumns, Math.min(expertGridBaseColumns + expertGridMaxExtraColumns, nextValue));
}

function clampExpertGridRows(value) {
  const numericValue = Number(value);
  const nextValue = Number.isFinite(numericValue) ? Math.floor(numericValue) : expertGridBaseRows;
  return Math.max(expertGridBaseRows, Math.min(expertGridBaseRows + expertGridMaxExtraRows, nextValue));
}

function clampExpertGridCellSize(value) {
  const numericValue = Number(value);
  const nextValue = Number.isFinite(numericValue) ? Math.floor(numericValue) : expertGridDefaultCellSize;
  return Math.max(expertGridMinCellSize, Math.min(expertGridMaxCellSize, nextValue));
}

function syncExpertGridSizeFromSurfaceDelta() {
  expertGridColumns = clampExpertGridColumns(expertGridBaseColumns + clampExpertEditorSurfaceDelta(expertEditorSurfaceSize.columns));
  expertGridRows = clampExpertGridRows(expertGridBaseRows + clampExpertEditorSurfaceDelta(expertEditorSurfaceSize.rows, expertGridMaxExtraRows));
  expertEditorSurfaceSize = {
    columns: expertGridColumns - expertGridBaseColumns,
    rows: expertGridRows - expertGridBaseRows,
  };
}

function syncExpertSurfaceDeltaFromGridSize() {
  expertEditorSurfaceSize = {
    columns: expertGridColumns - expertGridBaseColumns,
    rows: expertGridRows - expertGridBaseRows,
  };
}

function syncExpertGridControls() {
  if (expertGridColumnsControl) {
    expertGridColumnsControl.min = String(expertGridBaseColumns);
    expertGridColumnsControl.max = String(expertGridBaseColumns + expertGridMaxExtraColumns);
    expertGridColumnsControl.value = String(expertGridColumns);
  }
  if (expertGridRowsControl) {
    expertGridRowsControl.min = String(expertGridBaseRows);
    expertGridRowsControl.max = String(expertGridBaseRows + expertGridMaxExtraRows);
    expertGridRowsControl.value = String(expertGridRows);
  }
  if (expertGridZoomControl) {
    expertGridZoomControl.min = String(expertGridMinCellSize);
    expertGridZoomControl.max = String(expertGridMaxCellSize);
    expertGridZoomControl.value = String(expertGridCellSize);
  }
  if (expertGridColumnsOutput) {
    expertGridColumnsOutput.value = String(expertGridColumns);
    expertGridColumnsOutput.textContent = String(expertGridColumns);
  }
  if (expertGridRowsOutput) {
    expertGridRowsOutput.value = String(expertGridRows);
    expertGridRowsOutput.textContent = String(expertGridRows);
  }
  if (expertGridZoomOutput) {
    expertGridZoomOutput.value = `${expertGridCellSize}px`;
    expertGridZoomOutput.textContent = `${expertGridCellSize}px`;
  }
}

function applyExpertEditorSurfaceSize() {
  syncExpertGridSizeFromSurfaceDelta();
  syncExpertGridControls();
  const surfaceWidth = expertGridColumns * expertGridCellSize + Math.max(0, expertGridColumns - 1) * expertGridGap;
  const surfaceHeight = expertGridRows * expertGridCellSize + Math.max(0, expertGridRows - 1) * expertGridGap;
  expertEditorDropzone.style.setProperty("--expert-editor-columns", String(expertGridColumns));
  expertEditorDropzone.style.setProperty("--expert-editor-rows", String(expertGridRows));
  expertEditorDropzone.style.setProperty("--expert-editor-cell-size", `${expertGridCellSize}px`);
  expertEditorDropzone.style.setProperty("--expert-editor-grid-gap", `${expertGridGap}px`);
  expertEditorDropzone.style.setProperty("--expert-editor-surface-width", `${surfaceWidth}px`);
  expertEditorDropzone.style.setProperty("--expert-editor-surface-height", `${surfaceHeight}px`);
}

function updateExpertEditorGridSize() {
  expertGridColumns = clampExpertGridColumns(expertGridColumnsControl?.value);
  expertGridRows = clampExpertGridRows(expertGridRowsControl?.value);
  syncExpertSurfaceDeltaFromGridSize();
  clampExpertFieldsToGrid();
  persistConfiguration();
  renderExpertEditorPreview();
  statusMessage.textContent = t("message.surfaceResized", {
    columns: expertGridColumns,
    rows: expertGridRows,
  });
}

function updateExpertEditorZoom() {
  expertGridCellSize = clampExpertGridCellSize(expertGridZoomControl?.value);
  syncExpertGridControls();
  applyExpertEditorSurfaceSize();
  persistConfiguration();
  statusMessage.textContent = t("message.surfaceResized", {
    columns: expertGridColumns,
    rows: expertGridRows,
  });
}

function resetExpertEditorSurfaceSize() {
  expertEditorSurfaceSize = { columns: 0, rows: 0 };
  expertGridCellSize = expertGridDefaultCellSize;
  syncExpertGridSizeFromSurfaceDelta();
  persistConfiguration();
  renderExpertEditorPreview();
  statusMessage.textContent = t("message.surfaceSizeReset");
}

function clampExpertFieldsToGrid() {
  for (const [index, field] of expertEditorFields.entries()) {
    const width = Math.max(1, Math.min(expertGridColumns, field.width));
    const height = Math.max(1, Math.min(expertGridRows, field.height));
    expertEditorFields[index] = {
      ...field,
      width,
      height,
      column: Math.max(0, Math.min(expertGridColumns - width, field.column)),
      row: Math.max(0, Math.min(expertGridRows - height, field.row)),
    };
  }
}

function arrangeExpertEditorFields() {
  if (expertEditorFields.length === 0) {
    statusMessage.textContent = t("message.arrangeNeedsFields");
    return;
  }

  const previousOverlapCount = analyzeHomeAssistantCardEditorSurface(expertEditorFields).overlapCount;
  const arrangedFields = arrangeHomeAssistantCardEditorSurfaceFields(expertEditorFields, {
    columns: expertGridColumns,
    rows: expertGridRows,
  });
  expertEditorFields.splice(0, expertEditorFields.length, ...arrangedFields);
  selectedExpertFieldIndex = Math.min(Math.max(0, selectedExpertFieldIndex), expertEditorFields.length - 1);
  persistConfiguration();
  renderExpertEditorPreview();
  const nextOverlapCount = analyzeHomeAssistantCardEditorSurface(expertEditorFields).overlapCount;
  statusMessage.textContent = t("message.fieldsArranged", { previous: previousOverlapCount, next: nextOverlapCount });
}

function updateSelectedExpertFieldGeometry() {
  const field = expertEditorFields[selectedExpertFieldIndex];
  if (!field) {
    statusMessage.textContent = t("message.selectFieldBeforeResize");
    return false;
  }

  const base = getExpertFieldResizeBase(field);
  const limit = getExpertFieldResizeLimit(field);
  const width = clampExpertFieldSpan(expertWidth.value, field.width, limit.width);
  const height = clampExpertFieldSpan(expertHeight.value, field.height, limit.height);
  const column = clampExpertFieldOffset(expertColumn.value, field.column, expertGridColumns - width);
  const row = clampExpertFieldOffset(expertRow.value, field.row, expertGridRows - height);
  expertEditorFields[selectedExpertFieldIndex] = {
    ...field,
    column,
    row,
    width,
    height,
    resizeBaseWidth: base.width,
    resizeBaseHeight: base.height,
  };
  expertColumn.value = String(column);
  expertRow.value = String(row);
  expertWidth.value = String(width);
  expertHeight.value = String(height);
  persistConfiguration();
  renderExpertEditorPreview();
  statusMessage.textContent = t("message.fieldResized", { field: field.id, width, height });
  return true;
}

function applyEntityToSelectedExpertField(entityId) {
  const title = currentExpertEntityTitle(entityId);
  expertEntity.value = entityId;
  expertTitle.value = title;
  if (selectedContainerCardRef) {
    return updateSelectedContainerCard(card => ({
      ...card,
      id: title,
      entityId,
    }));
  }

  const field = expertEditorFields[selectedExpertFieldIndex];
  if (!field) {
    statusMessage.textContent = t("text.entityPrepared", { entityId });
    return false;
  }

  const entries = (field.layout ?? "card") === "card"
    ? field.entries
    : [{ id: title, target: field.target, bubbleButtonType: field.bubbleButtonType, entityId }];
  expertEditorFields[selectedExpertFieldIndex] = {
    ...field,
    id: title,
    entityId,
    entries,
  };
  persistConfiguration();
  renderExpertEditorPreview();
  statusMessage.textContent = t("text.entityAssigned", { entityId, title });
  return true;
}

function renderExpertEditButton() {
  if (selectedExpertFieldIndex < 0 || !expertEditorFields[selectedExpertFieldIndex]) {
    editExpertField.disabled = true;
    editExpertField.textContent = t("button.editSelected");
    editExpertField.setAttribute("aria-pressed", "false");
    return;
  }

  editExpertField.disabled = false;
  editExpertField.textContent = isTabbedCardField(expertEditorFields[selectedExpertFieldIndex])
    ? t("button.settings")
    : expertFieldEditing ? t("button.stopEditing") : t("button.editSelected");
  editExpertField.setAttribute("aria-pressed", String(expertFieldEditing));
}

function selectExpertEditorField(index) {
  const field = expertEditorFields[index];
  if (!field) return;
  selectedExpertFieldIndex = index;
  selectedContainerCardRef = undefined;
  const limit = getExpertFieldResizeLimit(field);
  expertColumn.value = String(field.column);
  expertRow.value = String(field.row);
  expertWidth.value = String(field.width);
  expertHeight.value = String(field.height);
  expertWidth.max = String(limit.width);
  expertHeight.max = String(limit.height);
  expertTarget.value = field.target;
  expertBubbleButtonType.value = field.bubbleButtonType ?? "state";
  syncExpertBubbleTypeControl();
  expertTitle.value = field.id;
  expertEntity.value = field.entityId;
  persistConfiguration();
  renderExpertFieldList();
  renderExpertEditorSurface();
  renderTabbedCardSettings();
  renderStackCardSettings();
  statusMessage.textContent = t("text.fieldSelected", { field: field.id });
}

function toggleExpertFieldEditing() {
  const field = expertEditorFields[selectedExpertFieldIndex];
  if (!field) {
    expertFieldEditing = false;
    renderExpertEditButton();
    statusMessage.textContent = t("text.selectFieldBeforeEditing");
    return;
  }

  if (isTabbedCardField(field)) {
    openTabbedCardSettings();
    return;
  }
  if (isStackContainerField(field)) {
    openStackCardSettings();
    return;
  }

  expertFieldEditing = !expertFieldEditing;
  renderExpertEditButton();
  renderExpertEditorSurface();
  statusMessage.textContent = expertFieldEditing
    ? t("text.editHandlesEnabled", { field: field.id })
    : t("text.editHandlesHidden", { field: field.id });
}

function removeExpertEditorField(index) {
  const field = expertEditorFields[index];
  if (!field) return false;
  expertEditorFields.splice(index, 1);
  if (selectedExpertFieldIndex === index) {
    selectedExpertFieldIndex = -1;
    selectedContainerCardRef = undefined;
    expertFieldEditing = false;
  } else if (selectedExpertFieldIndex > index) {
    selectedExpertFieldIndex -= 1;
  }
  persistConfiguration();
  renderExpertEditorPreview();
  statusMessage.textContent = t("message.fieldRemoved", { field: field.id });
  return true;
}

function renderExpertEditorSurface() {
  expertEditorDropzone.replaceChildren();
  applyExpertEditorSurfaceSize();
  const grid = document.createElement("div");
  grid.className = "expert-surface-grid";
  const surfaceAnalysis = analyzeHomeAssistantCardEditorSurface(expertEditorFields);
  const overlappingFieldIds = new Set(surfaceAnalysis.overlappingFieldIds);
  if (expertEditorFields.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = t("message.dragCard");
    grid.append(empty);
    expertEditorDropzone.append(grid);
    renderExpertSelectedCardDetails();
    return;
  }

  expertEditorFields.forEach((storedField, index) => {
    const field = isStackContainerField(storedField) && (storedField.rows === "auto" || storedField.autoHeight === true)
      ? normalizeStackContainerLayout(storedField)
      : storedField;
    const tile = document.createElement("div");
    tile.tabIndex = 0;
    tile.className = "expert-surface-field";
    tile.classList.toggle("selected", index === selectedExpertFieldIndex);
    tile.classList.toggle("editing", index === selectedExpertFieldIndex && expertFieldEditing);
    tile.classList.toggle("tabbed-container", isTabbedCardField(field));
    tile.classList.toggle("stack-container", isStackContainerField(field));
    const variant = getExpertPreviewVariant(field);
    if (variant.kind) {
      tile.classList.add("card-kind-preview");
      tile.dataset.cardKind = variant.kind;
    }
    if (variant.detail) {
      tile.dataset.cardVariant = variant.detail;
    }
    tile.classList.toggle("bubble-card-preview", variant.kind === "bubble");
    if (variant.kind === "bubble") {
      tile.dataset.bubbleType = variant.detail;
    }
    tile.classList.toggle("conflict", overlappingFieldIds.has(field.id) && !isEditableContainerField(field));
    tile.dataset.expertFieldIndex = String(index);
    tile.setAttribute("role", "button");
    const conflictLabel = overlappingFieldIds.has(field.id) && !isEditableContainerField(field) ? `, ${t("text.overlappingField")}` : "";
    tile.setAttribute("aria-label", `${field.id} on column ${field.column + 1}, row ${field.row + 1}${conflictLabel}`);
    tile.setAttribute("aria-pressed", String(index === selectedExpertFieldIndex));
    tile.draggable = true;
    tile.style.gridColumn = (field.columns === "full" || field.fullWidth === true) && isEditableContainerField(field)
      ? `1 / span ${expertGridColumns}`
      : `${field.column + 1} / span ${Math.min(expertGridColumns, field.width)}`;
    tile.style.gridRow = `${field.row + 1} / span ${Math.min(expertGridRows, field.height)}`;
    tile.append(createExpertSurfaceFieldHeader(field));
    if (isTabbedCardField(field)) {
      tile.append(createTabbedCardInlineView(field, index));
    } else if (isStackContainerField(field)) {
      tile.append(createStackContainerInlineView(field, index));
    }
    tile.addEventListener("click", () => {
      selectExpertEditorField(index);
      if (isOverviewField(field)) {
        openOverviewCardEntitiesDialog(index);
      }
    });
    tile.addEventListener("keydown", event => {
      handleExpertSurfaceFieldKeydown(event, index);
    });
    tile.addEventListener("pointerdown", event => {
      expertDragFieldOffset = calculateExpertFieldPointerOffset(event, tile, field);
    });
    tile.addEventListener("dragstart", event => {
      event.dataTransfer?.setData("application/x-atlas-field-index", String(index));
      tile.classList.add("dragging");
    });
    tile.addEventListener("dragend", () => {
      tile.classList.remove("dragging");
      expertDragFieldOffset = { column: 0, row: 0 };
    });
    if (isEditableContainerField(field)) {
      tile.addEventListener("dragover", event => {
        event.preventDefault();
        tile.classList.add("drag-over");
      });
      tile.addEventListener("dragleave", event => {
        if (!(event.relatedTarget instanceof Node) || !tile.contains(event.relatedTarget)) {
          tile.classList.remove("drag-over");
        }
      });
      tile.addEventListener("drop", event => {
        event.preventDefault();
        event.stopPropagation();
        tile.classList.remove("drag-over");
        if (isTabbedCardField(field)) {
          handleDropIntoTabbedCard(event, index);
        } else {
          handleDropIntoStackContainer(event, index);
        }
      });
    }
    if (index === selectedExpertFieldIndex && expertFieldEditing) {
      const handle = document.createElement("span");
      handle.className = "expert-resize-handle";
      handle.dataset.corner = "se";
      handle.setAttribute("aria-hidden", "true");
      handle.addEventListener("pointerdown", event => {
        startExpertFieldResize(event, index, "se", tile);
      });
      tile.append(handle);
    }
    grid.append(tile);
  });
  expertEditorDropzone.append(grid);
  renderExpertSelectedCardDetails();
}

function createExpertSurfaceFieldHeader(field) {
  const title = document.createElement("strong");
  title.className = "expert-surface-field-title";
  title.textContent = field.id;
  return title;
}

function getExpertFieldStyleBlocks(field) {
  const blocks = [];
  if (field.entityId) {
    blocks.push(...getImportedEntityStyleBlocks(field.entityId));
  }
  for (const entry of field.entries ?? []) {
    blocks.push(...getEntryStyleBlocks(entry));
    for (const card of entry.cards ?? []) {
      blocks.push(...getEntryStyleBlocks(card));
    }
  }
  return blocks;
}

function selectedExpertDetailContext() {
  const field = expertEditorFields[selectedExpertFieldIndex];
  if (!field) return undefined;
  if (selectedContainerCardRef) {
    const card = getContainerCard(selectedContainerCardRef);
    if (card) {
      return {
        field,
        fieldIndex: selectedExpertFieldIndex,
        card,
        cardRef: selectedContainerCardRef,
      };
    }
  }
  return { field, fieldIndex: selectedExpertFieldIndex };
}

function entityDisplayName(entityId) {
  if (!entityId) return t("text.noEntity");
  const entity = entitySnapshots.get(entityId);
  if (entity) return createHomeAssistantEntityPresentation(entity).label;
  return importedSimpleEntityNames.get(entityId) ?? entityId;
}

function entityIcon(entityId) {
  if (!entityId) return "";
  const domain = entityId.split(".")[0];
  const fallbackByDomain = {
    binary_sensor: "mdi:radiobox-marked",
    sensor: "mdi:eye",
    switch: "mdi:toggle-switch",
    light: "mdi:lightbulb",
    climate: "mdi:thermostat",
    input_number: "mdi:numeric",
    input_boolean: "mdi:toggle-switch-outline",
  };
  return fallbackByDomain[domain] ?? "mdi:home-assistant";
}

function cardIcon(card) {
  return card?.icon || entityIcon(card?.entityId);
}

function appendDetailRow(list, label, value, className) {
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = value || t("text.none");
  if (className) description.className = className;
  list.append(term, description);
}

function expertDetailSettingsText(field, card) {
  if (card) {
    return [
      card.target === "bubble" ? `button_type ${card.bubbleButtonType ?? "state"}` : "",
      card.icon ? `icon ${card.icon}` : "",
    ].filter(Boolean).join(" · ");
  }
  const entries = field.entries ?? [];
  const cardCount = isTabbedCardField(field)
    ? entries.reduce((count, entry) => count + (entry.cards?.length ?? 0), 0)
    : entries.length;
  return [
    `${field.layout ?? "card"}`,
    `grid c${field.column + 1}/r${field.row + 1}`,
    `size ${field.width}x${field.height}`,
    isTabbedCardField(field) ? `${entries.length} tabs` : "",
    isEditableContainerField(field) ? `${cardCount} cards` : "",
  ].filter(Boolean).join(" · ");
}

function expertContainerColumnsText(field) {
  if (!isEditableContainerField(field)) return "";
  if (field.columns === "full" || field.fullWidth === true) return "full";
  return String(typeof field.columns === "number" ? field.columns : field.width);
}

function expertContainerRowsText(field) {
  if (!isEditableContainerField(field)) return "";
  if (field.rows === "auto" || field.autoHeight === true) return "auto";
  return String(typeof field.rows === "number" ? field.rows : field.height);
}

function expertImportedOptionsText(field) {
  const options = field.importedOptions ?? {};
  return Object.entries(options)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");
}

function isOverviewField(field) {
  return field?.target === "glance" || field?.importedCardType === "glance";
}

function renderExpertSelectedCardDetails() {
  expertSelectedCardDetails.replaceChildren();
  const context = selectedExpertDetailContext();
  const heading = document.createElement("h3");
  heading.textContent = t("heading.selectedCardDetails");
  expertSelectedCardDetails.append(heading);
  if (!context) {
    const empty = document.createElement("p");
    empty.textContent = t("text.noSelectedCard");
    expertSelectedCardDetails.append(empty);
    return;
  }

  const { field, fieldIndex, card, cardRef } = context;
  const selectedCard = card ?? field;
  const variant = getExpertPreviewVariant(selectedCard);
  const entityId = selectedCard.entityId ?? "";
  const details = document.createElement("dl");
  appendDetailRow(details, t("text.cardName"), selectedCard.id);
  appendDetailRow(details, t("text.cardType"), variant.label ?? translateCardTarget(selectedCard.target, selectedCard.target), "detail-card-type");
  appendDetailRow(details, t("text.cardIcon"), cardIcon(selectedCard));
  appendDetailRow(details, t("text.entityName"), entityDisplayName(entityId));
  appendDetailRow(details, t("text.entityId"), entityId || t("text.noEntity"));
  appendDetailRow(details, t("text.cardSettings"), expertDetailSettingsText(field, card));
  if (!card && isOverviewField(field)) {
    appendDetailRow(details, t("text.cardOptions"), expertImportedOptionsText(field));
  }
  if (!card && isEditableContainerField(field)) {
    appendDetailRow(details, t("text.cardColumns"), expertContainerColumnsText(field));
    appendDetailRow(details, t("text.cardRows"), expertContainerRowsText(field));
  }
  const styles = card ? getImportedEntityStyleBlocks(entityId) : getExpertFieldStyleBlocks(field);
  appendDetailRow(
    details,
    t("text.styleCode"),
    styles.length ? listImportedStyleTypes(styles).map(styleType => styleType.label).join(" · ") : t("text.none"),
    "detail-style-state",
  );
  expertSelectedCardDetails.append(details);

  if (!card && isEditableContainerField(field)) {
    expertSelectedCardDetails.append(createExpertDetailContainedCards(field, fieldIndex));
  }
  if (!card && isOverviewField(field)) {
    expertSelectedCardDetails.append(createExpertDetailEntityEntries(field));
  }

  if (styles.length) {
    const code = document.createElement("pre");
    code.className = "expert-detail-style-code";
    code.textContent = styles.map(block => block.code).join("\n\n");
    expertSelectedCardDetails.append(code);
  }

  const actions = document.createElement("div");
  actions.className = "expert-detail-actions";
  if (!card && (isEditableContainerField(field) || isOverviewField(field))) {
    const settings = document.createElement("button");
    settings.type = "button";
    settings.textContent = t("button.settings");
    settings.addEventListener("click", () => {
      if (isOverviewField(field)) {
        openOverviewCardEntitiesDialog(fieldIndex);
      } else if (isTabbedCardField(field)) {
        openTabbedCardSettings();
      } else {
        openStackCardSettings();
      }
    });
    actions.append(settings);
  }
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "expert-detail-delete";
  remove.textContent = t("button.removeTab");
  remove.addEventListener("click", () => {
    if (cardRef) {
      removeContainerCard(cardRef);
    } else {
      removeExpertEditorField(fieldIndex);
    }
  });
  actions.append(remove);
  expertSelectedCardDetails.append(actions);
}

function createExpertDetailEntityEntries(field) {
  const section = document.createElement("section");
  section.className = "expert-detail-card-list";
  const title = document.createElement("strong");
  title.textContent = t("text.entityEntries");
  const list = document.createElement("ul");
  section.append(title, list);
  for (const [index, entry] of (field.entries ?? []).entries()) {
    const item = document.createElement("li");
    item.className = "expert-detail-card-item";
    const entityId = entry.entityId || "";
    const parts = [
      `${index + 1}. ${entry.id || entityDisplayName(entityId)}`,
      entityId,
      entry.icon || entityIcon(entityId),
      typeof entry.show_last_changed === "boolean" ? `show_last_changed: ${entry.show_last_changed}` : "",
    ].filter(Boolean);
    item.textContent = parts.join(" · ");
    list.append(item);
  }
  if (list.children.length === 0) {
    const empty = document.createElement("small");
    empty.textContent = t("message.dragCard");
    section.append(empty);
  }
  return section;
}

function createExpertDetailContainedCards(field, fieldIndex) {
  const section = document.createElement("section");
  section.className = "expert-detail-card-list";
  const title = document.createElement("strong");
  title.textContent = t("text.containedCards");
  const list = document.createElement("ul");
  section.append(title, list);
  if (isTabbedCardField(field)) {
    const activeIndex = normalizeTabbedCardTabIndex(field);
    const activeTab = field.entries?.[activeIndex];
    for (const [cardIndex, card] of (activeTab?.cards ?? []).entries()) {
      list.append(createExpertDetailCardItem(card, cardIndex));
    }
  } else {
    for (const [cardIndex, card] of (field.entries ?? []).entries()) {
      list.append(createExpertDetailCardItem(card, cardIndex));
    }
  }
  if (list.children.length === 0) {
    const empty = document.createElement("small");
    empty.textContent = t("message.dragCard");
    section.append(empty);
  }
  return section;
}

function createExpertDetailCardItem(card, index) {
  const item = document.createElement("li");
  const variant = getExpertPreviewVariant(card);
  item.className = "expert-detail-card-item";
  item.textContent = `${index + 1}. ${card.id} · ${variant.label ?? card.target} · ${card.entityId || t("text.noEntity")}`;
  return item;
}

function createImportedEntityStyleButton(field, styles) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "expert-entity-style-button";
  button.textContent = `Style (${styles.length})`;
  button.addEventListener("click", event => {
    event.stopPropagation();
    openImportedEntityStyleDialog(field, styles);
  });
  return button;
}

function openImportedEntityStyleDialog(field, styles) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  const dialog = document.createElement("section");
  dialog.className = "tabbed-card-dialog imported-style-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");

  const header = document.createElement("header");
  const title = document.createElement("h2");
  title.textContent = field.id || field.entityId || "Entity style";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "icon-button";
  close.setAttribute("aria-label", "Close style preview");
  close.title = "Close style preview";
  close.textContent = "\u00d7";
  header.append(title, close);

  const body = document.createElement("div");
  body.className = "tabbed-card-dialog-body single-column";
  const entity = document.createElement("p");
  entity.className = "imported-style-entity";
  entity.textContent = field.entityId || "";
  const code = document.createElement("pre");
  code.className = "imported-style-code";
  code.textContent = styles.map(block => block.code).join("\n\n");
  const detectedStyles = document.createElement("div");
  detectedStyles.className = "imported-style-detection";
  for (const styleType of listImportedStyleTypes(styles)) {
    const badge = document.createElement("span");
    badge.className = `imported-style-detection-badge ${styleType.className}`;
    badge.textContent = styleType.label;
    detectedStyles.append(badge);
  }
  body.append(entity, code, detectedStyles);
  dialog.append(header, body);
  backdrop.append(dialog);

  const closeDialog = () => {
    backdrop.remove();
    document.removeEventListener("keydown", handleKeydown);
  };
  const handleKeydown = event => {
    if (event.key === "Escape") closeDialog();
  };
  close.addEventListener("click", closeDialog);
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) closeDialog();
  });
  document.addEventListener("keydown", handleKeydown);
  document.body.append(backdrop);
  close.focus();
}

function listImportedStyleTypes(styles) {
  const types = [];
  const hasCardMod = styles.some(block => block.key === "card_mod" || /^card_mod:/m.test(block.code));
  const hasUix = styles.some(block => block.key === "uix" || block.key === "uix_style" || /^(uix|uix_style):/m.test(block.code));
  if (hasCardMod) {
    types.push({ className: "card-mod", label: "card-mod style erkannt" });
  }
  if (hasUix) {
    types.push({ className: "uix-style", label: "UIX Style erkannt" });
  }
  if (!types.length) {
    types.push({ className: "unknown", label: "Style erkannt" });
  }
  return types;
}

function createStackContainerInlineView(field, fieldIndex) {
  const wrapper = document.createElement("div");
  wrapper.className = "expert-tab-inline";
  const count = document.createElement("small");
  count.textContent = t("text.tabbedCardContainer", { count: field.entries?.length ?? 0 });
  const preview = document.createElement("div");
  preview.className = `expert-tab-preview ${(field.layout ?? "vertical-stack") === "horizontal-stack" ? "horizontal" : "vertical"}`;
  if ((field.layout ?? "vertical-stack") === "horizontal-stack") {
    const minimumWidth = Math.max(33, Math.round((4 / Math.max(4, field.width)) * 100));
    preview.style.gridTemplateColumns = `repeat(auto-fit, minmax(min(100%, ${minimumWidth}%), 1fr))`;
  }
  preview.addEventListener("dragover", event => {
    event.preventDefault();
    preview.classList.add("drag-over");
  });
  preview.addEventListener("dragleave", event => {
    if (!(event.relatedTarget instanceof Node) || !preview.contains(event.relatedTarget)) {
      preview.classList.remove("drag-over");
    }
  });
  preview.addEventListener("drop", event => {
    event.preventDefault();
    event.stopPropagation();
    preview.classList.remove("drag-over");
    handleDropIntoStackContainer(event, fieldIndex);
  });

  const entries = field.entries ?? [];
  if (entries.length === 0) {
    const empty = document.createElement("small");
    empty.textContent = t("message.dragCard");
    preview.append(empty);
  } else {
    entries.forEach((entry, cardIndex) => {
      preview.append(createContainerPreviewCard(entry, {
        reference: { fieldIndex, cardIndex },
        selected: selectedContainerCardRef?.fieldIndex === fieldIndex && selectedContainerCardRef?.cardIndex === cardIndex,
        onClick: () => selectContainerCard({ fieldIndex, cardIndex }),
        onRemove: () => removeContainerCard({ fieldIndex, cardIndex }),
        onMoveOut: () => moveContainerCardToSurface({ fieldIndex, cardIndex }),
      }));
    });
  }

  wrapper.append(count, preview);
  return wrapper;
}

function createTabbedCardInlineView(field, fieldIndex) {
  const wrapper = document.createElement("div");
  wrapper.className = "expert-tab-inline";
  const entries = field.entries ?? [];
  const activeIndex = normalizeTabbedCardTabIndex(field);
  const count = document.createElement("small");
  count.textContent = t("text.tabbedCardContainer", { count: entries.length });
  const tabs = document.createElement("div");
  tabs.className = "expert-tab-summary";
  entries.forEach((entry, tabIndex) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "expert-tab-chip";
    chip.classList.toggle("active", tabIndex === activeIndex);
    chip.textContent = `${entry.icon ?? "mdi:tab"} ${entry.id}`;
    chip.addEventListener("click", event => {
      event.stopPropagation();
      setActiveTabbedCardTab(fieldIndex, tabIndex);
    });
    chip.addEventListener("dragover", event => {
      event.preventDefault();
      chip.classList.add("active");
    });
    chip.addEventListener("dragleave", () => {
      chip.classList.toggle("active", tabIndex === activeIndex);
    });
    chip.addEventListener("drop", event => {
      event.preventDefault();
      event.stopPropagation();
      setActiveTabbedCardTab(fieldIndex, tabIndex);
      handleDropIntoTabbedCard(event, fieldIndex);
    });
    tabs.append(chip);
  });

  const preview = document.createElement("div");
  preview.className = "expert-tab-preview";
  preview.addEventListener("dragover", event => {
    event.preventDefault();
    preview.classList.add("drag-over");
  });
  preview.addEventListener("dragleave", event => {
    if (!(event.relatedTarget instanceof Node) || !preview.contains(event.relatedTarget)) {
      preview.classList.remove("drag-over");
    }
  });
  preview.addEventListener("drop", event => {
    event.preventDefault();
    event.stopPropagation();
    preview.classList.remove("drag-over");
    handleDropIntoTabbedCard(event, fieldIndex);
  });

  const activeEntry = entries[activeIndex];
  const cards = activeEntry?.cards ?? [];
  if (cards.length === 0) {
    const empty = document.createElement("small");
    empty.textContent = t("message.dragCard");
    preview.append(empty);
  } else {
    for (const card of cards) {
      preview.append(createContainerPreviewCard(card, {
        reference: { fieldIndex, tabIndex: activeIndex, cardIndex: cards.indexOf(card) },
        selected: selectedContainerCardRef?.fieldIndex === fieldIndex
          && selectedContainerCardRef?.tabIndex === activeIndex
          && selectedContainerCardRef?.cardIndex === cards.indexOf(card),
        onClick: () => selectContainerCard({ fieldIndex, tabIndex: activeIndex, cardIndex: cards.indexOf(card) }),
        onRemove: () => removeContainerCard({ fieldIndex, tabIndex: activeIndex, cardIndex: cards.indexOf(card) }),
        onMoveOut: () => moveContainerCardToSurface({ fieldIndex, tabIndex: activeIndex, cardIndex: cards.indexOf(card) }),
      }));
    }
  }

  wrapper.append(count, tabs, preview);
  return wrapper;
}

function createContainerPreviewCard(card, options = {}) {
  const item = document.createElement("article");
  item.className = "expert-tab-preview-card";
  const variant = getExpertPreviewVariant(card);
  if (variant.kind) {
    item.classList.add("card-kind-preview");
    item.dataset.cardKind = variant.kind;
  }
  if (variant.detail) {
    item.dataset.cardVariant = variant.detail;
  }
  item.classList.toggle("bubble-card-preview", variant.kind === "bubble");
  if (variant.kind === "bubble") {
    item.dataset.bubbleType = variant.detail;
  }
  item.classList.toggle("selected", options.selected === true);
  item.tabIndex = 0;
  item.draggable = true;
  item.setAttribute("role", "button");
  const title = document.createElement("strong");
  title.textContent = card.id;
  const detail = document.createElement("small");
  const bubbleType = card.target === "bubble" ? `, ${card.bubbleButtonType ?? "state"}` : "";
  detail.textContent = `${translateCardTarget(card.target, card.target)}${bubbleType} - ${card.entityId || t("text.demoEntity")}`;
  const actions = document.createElement("span");
  actions.className = "expert-tab-preview-card-actions";
  const moveOut = document.createElement("button");
  moveOut.type = "button";
  moveOut.className = "expert-tab-preview-card-out";
  moveOut.textContent = "Out";
  moveOut.addEventListener("click", event => {
    event.stopPropagation();
    options.onMoveOut?.();
  });
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "expert-tab-preview-card-remove";
  remove.textContent = "x";
  remove.addEventListener("click", event => {
    event.stopPropagation();
    options.onRemove?.();
  });
  actions.append(moveOut, remove);
  item.append(actions, title, detail);
  if (variant.label) {
    item.append(createCardTypeBadge(variant));
  }
  item.addEventListener("click", event => {
    event.stopPropagation();
    options.onClick?.();
  });
  item.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      options.onClick?.();
    }
  });
  item.addEventListener("dragstart", event => {
    if (!options.reference) return;
    event.stopPropagation();
    event.dataTransfer?.setData("application/x-atlas-container-card", JSON.stringify(options.reference));
    event.dataTransfer?.setDragImage(item, 12, 12);
  });
  return item;
}

function getExpertPreviewVariant(card) {
  const target = card?.target ?? "entity";
  if (target === "bubble") {
    const detail = bubbleButtonTypes.includes(card.bubbleButtonType) ? card.bubbleButtonType : "state";
    return { kind: "bubble", detail, label: `Bubble: ${detail}` };
  }
  if (target === "mushroom-template") {
    return { kind: "mushroom", detail: "template", label: "Mushroom template" };
  }
  if (target === "tabbed-card-v2") {
    return { kind: "tabbed", detail: "v2", label: "Tabbed Card V2" };
  }
  return { kind: "core", detail: target, label: translateCardTarget(target, target) };
}

function createCardTypeBadge(variant) {
  const badge = document.createElement("span");
  badge.className = "card-type-badge";
  if (variant.kind) badge.dataset.cardKind = variant.kind;
  if (variant.detail) badge.dataset.cardVariant = variant.detail;
  badge.textContent = variant.label;
  return badge;
}

function handleDropIntoTabbedCard(event, fieldIndex) {
  expertEditorDropzone.classList.remove("drag-over");
  const draggedFieldIndex = event.dataTransfer?.getData("application/x-atlas-field-index");
  if (draggedFieldIndex && moveExpertFieldIntoTabbedCard(Number(draggedFieldIndex), fieldIndex)) return true;
  const paletteCardId = event.dataTransfer?.getData("application/x-atlas-palette-card");
  if (paletteCardId && addPaletteCardToTabbedCardField(fieldIndex, paletteCardId)) return true;
  const templateId = event.dataTransfer?.getData("application/x-atlas-template") || event.dataTransfer?.getData("text/plain");
  const template = cardEditorTemplates.find(candidate => candidate.id === templateId);
  if (!template || template.id === "tabbed-card-v2") return false;
  return addCardToTabbedCardFieldAt(fieldIndex, createTabbedCardEntry({
    target: template.target === "tabbed-card-v2" ? "entity" : template.target,
    entityId: expertEntity.value.trim() || currentEntityId(),
  }));
}

function handleDropIntoStackContainer(event, fieldIndex) {
  expertEditorDropzone.classList.remove("drag-over");
  const draggedFieldIndex = event.dataTransfer?.getData("application/x-atlas-field-index");
  if (draggedFieldIndex) {
    const field = expertEditorFields[Number(draggedFieldIndex)];
    if (field && Number(draggedFieldIndex) !== fieldIndex && !isEditableContainerField(field)) {
      const entry = createTabbedCardEntry({
        title: field.id,
        entityId: field.entityId || field.entries?.[0]?.entityId || currentEntityId(),
        target: field.target,
        bubbleButtonType: field.bubbleButtonType,
      });
      addEntryToStackContainerFieldAt(fieldIndex, entry);
      expertEditorFields.splice(Number(draggedFieldIndex), 1);
      const nextFieldIndex = Number(draggedFieldIndex) < fieldIndex ? fieldIndex - 1 : fieldIndex;
      selectedExpertFieldIndex = nextFieldIndex;
      selectedContainerCardRef = {
        fieldIndex: nextFieldIndex,
        cardIndex: expertEditorFields[nextFieldIndex]?.entries?.length ? expertEditorFields[nextFieldIndex].entries.length - 1 : 0,
      };
      persistConfiguration();
      renderExpertEditorPreview();
      return true;
    }
  }
  const paletteCardId = event.dataTransfer?.getData("application/x-atlas-palette-card");
  if (paletteCardId) {
    const card = expertPaletteCards.find(candidate => candidate.id === paletteCardId);
    if (card && card.disabled !== true && card.target !== "tabbed-card-v2") {
      return addEntryToStackContainerFieldAt(fieldIndex, createTabbedCardEntry({
        target: card.target,
        bubbleButtonType: card.bubbleButtonType,
        entityId: expertEntity.value.trim() || currentEntityId(),
      }));
    }
  }
  const templateId = event.dataTransfer?.getData("application/x-atlas-template") || event.dataTransfer?.getData("text/plain");
  const template = cardEditorTemplates.find(candidate => candidate.id === templateId);
  if (!template || template.id === "tabbed-card-v2") return false;
  return addEntryToStackContainerFieldAt(fieldIndex, createTabbedCardEntry({
    target: template.target === "tabbed-card-v2" ? "entity" : template.target,
    entityId: expertEntity.value.trim() || currentEntityId(),
  }));
}

function calculateExpertFieldPointerOffset(event, tile, field) {
  const tileBounds = tile.getBoundingClientRect();
  const gridBounds = expertEditorGridBounds();
  const cellWidth = Math.max(1, gridBounds.width / expertGridColumns);
  const cellHeight = Math.max(1, gridBounds.height / expertGridRows);
  return {
    column: Math.max(0, Math.min(field.width - 1, Math.floor((event.clientX - tileBounds.left) / cellWidth))),
    row: Math.max(0, Math.min(field.height - 1, Math.floor((event.clientY - tileBounds.top) / cellHeight))),
  };
}

function expertEditorGridBounds() {
  const grid = expertEditorDropzone.querySelector(".expert-surface-grid");
  return (grid ?? expertEditorDropzone).getBoundingClientRect();
}

function handleExpertSurfaceFieldKeydown(event, index) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    selectExpertEditorField(index);
    focusExpertSurfaceField(index);
    return;
  }

  const deltas = {
    ArrowLeft: { column: -1, row: 0 },
    ArrowRight: { column: 1, row: 0 },
    ArrowUp: { column: 0, row: -1 },
    ArrowDown: { column: 0, row: 1 },
  };
  const delta = deltas[event.key];
  if (!delta) return;

  event.preventDefault();
  selectExpertEditorField(index);
  if (event.shiftKey && expertFieldEditing) {
    resizeExpertEditorFieldBy(index, delta);
    return;
  }
  nudgeExpertEditorField(index, delta);
}

function focusExpertSurfaceField(index) {
  const tile = expertEditorDropzone.querySelector(`[data-expert-field-index="${index}"]`);
  tile?.focus();
}

function nudgeExpertEditorField(index, delta) {
  const field = expertEditorFields[index];
  if (!field) return;
  moveExpertEditorField(index, {
    column: field.column + delta.column,
    row: field.row + delta.row,
  });
  focusExpertSurfaceField(index);
}

function resizeExpertEditorFieldBy(index, delta) {
  const field = expertEditorFields[index];
  if (!field) return;
  const base = getExpertFieldResizeBase(field);
  const limit = getExpertFieldResizeLimit(field);
  const nextWidth = clampExpertFieldSpan(field.width + delta.column, field.width, Math.min(limit.width, expertGridColumns - field.column));
  const nextHeight = clampExpertFieldSpan(field.height + delta.row, field.height, Math.min(limit.height, expertGridRows - field.row));
  expertEditorFields[index] = {
    ...field,
    width: nextWidth,
    height: nextHeight,
    resizeBaseWidth: base.width,
    resizeBaseHeight: base.height,
  };
  expertWidth.value = String(nextWidth);
  expertHeight.value = String(nextHeight);
  selectedExpertFieldIndex = index;
  persistConfiguration();
  renderExpertEditorPreview();
  focusExpertSurfaceField(index);
  statusMessage.textContent = t("message.fieldResized", { field: field.id, width: nextWidth, height: nextHeight });
}

function startExpertFieldResize(event, index, corner, tile) {
  const field = expertEditorFields[index];
  if (!field) return;
  event.preventDefault();
  event.stopPropagation();
  tile.draggable = false;
  const grid = tile.closest(".expert-surface-grid");
  const gridBounds = grid.getBoundingClientRect();
  const starting = {
    column: field.column,
    row: field.row,
    width: field.width,
    height: field.height,
  };
  const base = getExpertFieldResizeBase(field);
  const limit = getExpertFieldResizeLimit(field);

  const pointerToGridCell = pointerEvent => ({
    column: Math.max(0, Math.min(expertGridColumns - 1, Math.floor(((pointerEvent.clientX - gridBounds.left) / gridBounds.width) * expertGridColumns))),
    row: Math.max(0, Math.min(expertGridRows - 1, Math.floor(((pointerEvent.clientY - gridBounds.top) / gridBounds.height) * expertGridRows))),
  });

  const applyResize = pointerEvent => {
    const pointer = pointerToGridCell(pointerEvent);
    const next = { ...starting };
    if (corner.includes("e")) {
      const right = Math.max(starting.column + 1, Math.min(expertGridColumns, pointer.column + 1));
      next.width = right - starting.column;
    }
    if (corner.includes("s")) {
      const bottom = Math.max(starting.row + 1, Math.min(expertGridRows, pointer.row + 1));
      next.height = bottom - starting.row;
    }
    if (corner.includes("w")) {
      next.column = Math.max(0, Math.min(starting.column + starting.width - 1, pointer.column));
      next.width = starting.column + starting.width - next.column;
    }
    if (corner.includes("n")) {
      next.row = Math.max(0, Math.min(starting.row + starting.height - 1, pointer.row));
      next.height = starting.row + starting.height - next.row;
    }
    if (next.width > limit.width) {
      if (corner.includes("w")) {
        next.column = Math.max(0, starting.column + starting.width - limit.width);
      }
      next.width = limit.width;
    }
    if (next.height > limit.height) {
      if (corner.includes("n")) {
        next.row = Math.max(0, starting.row + starting.height - limit.height);
      }
      next.height = limit.height;
    }
    next.column = Math.max(0, Math.min(expertGridColumns - next.width, next.column));
    next.row = Math.max(0, Math.min(expertGridRows - next.height, next.row));

    expertEditorFields[index] = {
      ...field,
      column: next.column,
      row: next.row,
      width: next.width,
      height: next.height,
      resizeBaseWidth: base.width,
      resizeBaseHeight: base.height,
    };
    expertColumn.value = String(next.column);
    expertRow.value = String(next.row);
    expertWidth.value = String(next.width);
    expertHeight.value = String(next.height);
    tile.style.gridColumn = `${next.column + 1} / span ${next.width}`;
    tile.style.gridRow = `${next.row + 1} / span ${next.height}`;
  };

  const finishResize = () => {
    window.removeEventListener("pointermove", applyResize);
    window.removeEventListener("pointerup", finishResize);
    tile.draggable = true;
    persistConfiguration();
    renderExpertEditorPreview();
    const resizedField = expertEditorFields[index];
    statusMessage.textContent = t("message.fieldResized", {
      field: resizedField.id,
      width: resizedField.width,
      height: resizedField.height,
    });
  };

  window.addEventListener("pointermove", applyResize);
  window.addEventListener("pointerup", finishResize, { once: true });
}

function renderExpertEditorPreview() {
  if (expertEditorFields.length === 0) {
    expertEditorSummary.textContent = t("text.expertFieldsZero");
    expertEditorPreview.textContent = t("message.addTemplatePreview");
    if (activeEditorMode === "expert") {
      haCardDependency.textContent = t("message.addTemplateBeforeExport");
      haCardDependency.dataset.required = "false";
      haCardDependency.dataset.status = "not-required";
      copyHaCardResources.disabled = true;
    }
    renderExpertFieldList();
    renderExpertEditorSurface();
    renderTabbedCardSettings();
    renderStackCardSettings();
    return;
  }

  const card = createExpertHaCardConfig();
  const surfaceAnalysis = analyzeHomeAssistantCardEditorSurface(expertEditorFields);
  const emptyText = surfaceAnalysis.emptyFieldCount
    ? t("text.emptyFieldsSummary", { count: surfaceAnalysis.emptyFieldCount })
    : "";
  expertEditorSummary.textContent = [
    t("text.expertFieldsSummary", {
      count: surfaceAnalysis.fieldCount,
      populated: surfaceAnalysis.populatedFieldCount,
      empty: emptyText,
    }),
    t("text.rowsSummary", { count: surfaceAnalysis.rowCount }),
    t("text.surfaceSummary", { columns: surfaceAnalysis.usedColumns, rows: surfaceAnalysis.usedRows }),
    t("text.overlapsSummary", { count: surfaceAnalysis.overlapCount }),
    t("text.targetsSummary", { targets: surfaceAnalysis.usedTargets.map(target => translateCardTarget(target, target)).join(", ") }),
    t("text.layoutsSummary", { layouts: surfaceAnalysis.layouts.join(", ") }),
  ].join(". ");
  expertEditorPreview.textContent = formatExpertHaCardCodePreview(card);
  if (activeEditorMode === "expert") renderHaCardDependency(card);
  renderExpertFieldList();
  renderExpertEditorSurface();
  renderTabbedCardSettings();
  renderStackCardSettings();
}

function formatExpertHaCardCodePreview(card) {
  return activeEditorMode === "expert" && haCardFormat.value === "yaml" && importedSimpleCodePreview
    ? formatImportedYamlForStyleExport(importedSimpleCodePreview)
    : formatExpertYamlForStyleExport(serializeHomeAssistantEntitiesCardConfiguration(card, haCardFormat.value));
}

function formatExpertYamlForStyleExport(text) {
  if (haCardFormat.value !== "yaml") return text;
  const withImportedStyles = appendImportedStylesToExpertYaml(text);
  return haCardStyleExport.value === "uix-style"
    ? convertHomeAssistantCardModStylesToUixStyle(withImportedStyles)
    : withImportedStyles;
}

function formatImportedYamlForStyleExport(text) {
  return haCardStyleExport.value === "uix-style"
    ? convertHomeAssistantCardModStylesToUixStyle(text)
    : text;
}

function appendImportedStylesToExpertYaml(text) {
  if (!importedSimpleStyleInspection?.hasStyles && !expertEditorHasEntryStyleBlocks()) return text;
  const lines = text.split(/\r?\n/);
  const output = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    output.push(line);
    const entityMatch = line.match(/^(\s*)entity:\s*(.+?)\s*$/);
    if (!entityMatch) continue;
    const indent = entityMatch[1] ?? "";
    const entityId = stripYamlPreviewQuotes(entityMatch[2] ?? "");
    const hasFollowingStyle = yamlEntityBlockHasStyle(lines, index, indent.length);
    if (hasFollowingStyle) continue;
    for (const block of getExpertEditorEntityStyleBlocks(entityId)) {
      output.push(indentImportedStyleBlock(block.code, indent));
    }
  }

  const globalBlocks = importedSimpleStyleInspection?.globalStyles ?? [];
  const hasGlobalStyle = lines.some(line => /^(card_mod|uix|uix_style):/.test(line.trim()));
  if (globalBlocks.length && !hasGlobalStyle) {
    output.push(...globalBlocks.map(block => normalizeImportedStyleBlock(block.code)));
  }
  return output.join("\n");
}

function expertEditorHasEntryStyleBlocks() {
  return expertEditorFields.some(field =>
    (field.entries ?? []).some(entry =>
      getEntryStyleBlocks(entry).length || (entry.cards ?? []).some(card => getEntryStyleBlocks(card).length),
    ),
  );
}

function getExpertEditorEntityStyleBlocks(entityId) {
  const blocks = [];
  for (const field of expertEditorFields) {
    for (const entry of field.entries ?? []) {
      if (entry.entityId === entityId) blocks.push(...getEntryStyleBlocks(entry));
      for (const card of entry.cards ?? []) {
        if (card.entityId === entityId) blocks.push(...getEntryStyleBlocks(card));
      }
    }
  }
  blocks.push(...getImportedEntityStyleBlocks(entityId));
  const seen = new Set();
  return blocks.filter(block => {
    const key = `${block.key}:${block.code}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function yamlEntityBlockHasStyle(lines, entityLineIndex, entityIndentSize) {
  for (let index = entityLineIndex + 1; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    if (!line.trim()) continue;
    const indentSize = line.match(/^ */)?.[0].length ?? 0;
    if (indentSize <= entityIndentSize && line.trimStart().startsWith("- ")) return false;
    if (indentSize < entityIndentSize) return false;
    if (/^(card_mod|uix|uix_style):/.test(line.trim())) return true;
  }
  return false;
}

function stripYamlPreviewQuotes(value) {
  return value.trim().replace(/^["']|["']$/g, "");
}

function normalizeImportedStyleBlock(code) {
  const lines = code.split(/\r?\n/);
  const indents = lines
    .filter(line => line.trim())
    .map(line => line.match(/^ */)?.[0].length ?? 0);
  const minIndent = indents.length ? Math.min(...indents) : 0;
  return lines.map(line => line.slice(Math.min(minIndent, line.length))).join("\n").trimEnd();
}

function indentImportedStyleBlock(code, indent) {
  return normalizeImportedStyleBlock(code)
    .split(/\r?\n/)
    .map(line => `${indent}${line}`)
    .join("\n");
}

function addExpertEditorField() {
  if (selectedContainerCardRef) {
    const updated = updateSelectedContainerCard(card => ({
      ...card,
      id: expertTitle.value.trim() || card.id,
      target: expertTarget.value === "tabbed-card-v2" ? "entity" : expertTarget.value,
      ...(expertTarget.value === "bubble" ? { bubbleButtonType: expertBubbleButtonType.value } : { bubbleButtonType: undefined }),
      entityId: expertEntity.value.trim() || card.entityId || currentEntityId(),
    }));
    if (updated) return;
  }

  if (selectedTabbedCardField() && expertTemplate.value !== "tabbed-card-v2") {
    addCurrentExpertSelectionToActiveTabbedCard({
      title: expertTitle.value.trim() || undefined,
      target: expertTarget.value,
      bubbleButtonType: expertTarget.value === "bubble" ? expertBubbleButtonType.value : undefined,
    });
    return;
  }

  const selectedContainer = selectedEditableContainerField();
  if (selectedContainer && !isTabbedCardField(selectedContainer) && expertTemplate.value !== "tabbed-card-v2") {
    addCardEntryToSelectedContainer({
      title: expertTitle.value.trim() || undefined,
      target: expertTarget.value,
      bubbleButtonType: expertTarget.value === "bubble" ? expertBubbleButtonType.value : undefined,
    });
    return;
  }

  const entityId = expertEntity.value.trim() || currentEntityId();
  const sizing = resolveExpertTemplateSizing(expertTemplate.value);
  const fieldTitle = expertTitle.value.trim() || undefined;
  const placement = findAvailableExpertSurfacePlacement(sizing.width, sizing.height, {
    column: Number(expertColumn.value),
    row: Number(expertRow.value),
  });
  const field = createExpertEditorField({
    templateId: expertTemplate.value,
    entityId,
    title: fieldTitle,
    column: placement.column,
    row: placement.row,
    width: sizing.width,
    height: sizing.height,
  });
  expertEditorFields.push(field);
  selectedExpertFieldIndex = expertEditorFields.length - 1;
  expertFieldEditing = false;
  expertTitle.value = field.id;
  expertEntity.value = "";
  persistConfiguration();
  renderExpertEditorPreview();
  statusMessage.textContent = t("text.fieldAdded", { field: field.id });
}

function createExpertEditorField(input) {
  const template = cardEditorTemplates.find(candidate => candidate.id === input.templateId);
  const isOverviewTemplate = input.templateId === "glance-card" || expertTarget.value === "glance";
  const supportsMultipleEntries = template?.layout === "horizontal-stack"
    || template?.layout === "vertical-stack"
    || template?.layout === "grid"
    || isOverviewTemplate;
  const isTabbedTemplate = input.templateId === "tabbed-card-v2" || expertTarget.value === "tabbed-card-v2";
  const isContainerTemplate = isTabbedTemplate || supportsMultipleEntries;
  const entryTarget = isTabbedTemplate ? "entity" : expertTarget.value;
  const stackEntityIds = supportsMultipleEntries
    ? selectedStackEntityIds()
    : [];
  const width = template?.layout === "horizontal-stack"
    ? Math.min(expertGridColumns, Math.max(1, input.width) * Math.max(1, stackEntityIds.length))
    : input.width;
  const field = createHomeAssistantCardEditorFieldFromTemplate({
    template: input.templateId,
    target: expertTarget.value,
    bubbleButtonType: expertTarget.value === "bubble" ? expertBubbleButtonType.value : undefined,
    entityId: isContainerTemplate ? "" : input.entityId,
    id: expertTitleForNewField(input.templateId, input.title),
    column: input.column,
    row: input.row,
    width,
    height: input.height,
  });
  const fieldWithResizeBase = {
    ...field,
    resizeBaseWidth: field.width,
    resizeBaseHeight: field.height,
    templateId: input.templateId,
  };
  if (stackEntityIds.length > 1 && field.layout !== "card") {
    const fieldWithEntries = {
      ...fieldWithResizeBase,
      entityId: "",
      entries: stackEntityIds.map((entityId, index) => isTabbedTemplate
        ? createTabbedCardTab({
            title: `${field.id} ${index + 1}`,
            icon: index === 0 ? "mdi:tab" : "mdi:tab-plus",
          })
        : {
            id: `${field.id} ${index + 1}`,
            target: entryTarget,
            ...(expertTarget.value === "bubble" ? { bubbleButtonType: expertBubbleButtonType.value } : {}),
            entityId,
          }),
      ...(isTabbedTemplate ? { activeTabIndex: 0 } : {}),
    };
    return isStackContainerField(fieldWithEntries)
      ? normalizeStackContainerLayout({ ...fieldWithEntries, columns: fieldWithEntries.width, rows: "auto" })
      : fieldWithEntries;
  }
  const fieldWithEntries = {
    ...fieldWithResizeBase,
    entries: isTabbedTemplate
      ? [createTabbedCardTab({
          title: field.id,
          icon: "mdi:tab",
        })]
      : supportsMultipleEntries
        ? []
      : renameExpertFieldEntries(field, field.id),
    ...(isTabbedTemplate ? { activeTabIndex: 0 } : {}),
  };
  return isStackContainerField(fieldWithEntries)
    ? normalizeStackContainerLayout({ ...fieldWithEntries, columns: fieldWithEntries.width, rows: "auto" })
    : fieldWithEntries;
}

function addExpertEditorFieldFromTemplate(templateId, placement = calculateExpertDropPlacement(), options = {}) {
  if (!options.preserveSelection) {
    selectExpertTemplate(templateId);
  }
  if (!options.forceSurface && selectedTabbedCardField() && templateId !== "tabbed-card-v2") {
    const template = cardEditorTemplates.find(candidate => candidate.id === templateId);
    addCurrentExpertSelectionToActiveTabbedCard({
      title: expertTitle.value.trim() || (template ? translateTemplateLabel(template.id, template.label) : undefined),
      target: expertTarget.value,
      bubbleButtonType: expertTarget.value === "bubble" ? expertBubbleButtonType.value : undefined,
    });
    return;
  }
  const selectedContainer = selectedEditableContainerField();
  if (!options.forceSurface && selectedContainer && !isTabbedCardField(selectedContainer) && templateId !== "tabbed-card-v2") {
    const template = cardEditorTemplates.find(candidate => candidate.id === templateId);
    addCardEntryToSelectedContainer({
      title: expertTitle.value.trim() || (template ? translateTemplateLabel(template.id, template.label) : undefined),
      target: expertTarget.value,
      bubbleButtonType: expertTarget.value === "bubble" ? expertBubbleButtonType.value : undefined,
    });
    return;
  }

  const sizing = resolveExpertTemplateSizing(templateId);
  const fieldTitle = expertTitle.value.trim() || undefined;
  const freePlacement = findAvailableExpertSurfacePlacement(sizing.width, sizing.height, placement);
  const field = createExpertEditorField({
    templateId,
    entityId: expertEntity.value.trim() || currentEntityId(),
    title: fieldTitle,
    column: freePlacement.column,
    row: freePlacement.row,
    width: sizing.width,
    height: sizing.height,
  });
  expertEditorFields.push(field);
  selectedExpertFieldIndex = expertEditorFields.length - 1;
  expertFieldEditing = false;
  expertTitle.value = field.id;
  expertEntity.value = "";
  persistConfiguration();
  renderExpertEditorPreview();
  statusMessage.textContent = t("text.fieldPlaced", { field: field.id });
}

function addExpertEditorFieldFromPaletteCard(cardId, placement = calculateExpertDropPlacement()) {
  const card = selectExpertPaletteCard(cardId);
  if (!card) return;
  addExpertEditorFieldFromTemplate(card.templateId, placement, { preserveSelection: true });
}

function resolveExpertTemplateSizing(templateId) {
  const template = cardEditorTemplates.find(candidate => candidate.id === templateId);
  const sizing = expertTemplateSizing.get(templateId);
  return {
    width: sizing?.columns === "full" ? expertGridColumns : Number(sizing?.columns ?? template?.defaultWidth ?? expertWidth.value),
    height: sizing?.rows === "auto" ? template?.defaultHeight ?? Number(expertHeight.value) : Number(sizing?.rows ?? expertHeight.value),
  };
}

function calculateExpertDropPlacement(event) {
  if (!event) {
    return {
      column: Number(expertColumn.value),
      row: Number(expertRow.value),
    };
  }
  const bounds = expertEditorGridBounds();
  const rawColumn = Math.floor(((event.clientX - bounds.left) / bounds.width) * expertGridColumns);
  const rawRow = Math.floor(((event.clientY - bounds.top) / bounds.height) * expertGridRows);
  const column = Math.max(0, Math.min(expertGridColumns - 1, rawColumn - expertDragFieldOffset.column));
  const row = Math.max(0, Math.min(expertGridRows - 1, rawRow - expertDragFieldOffset.row));
  return { column, row };
}

function moveExpertEditorField(index, placement) {
  const field = expertEditorFields[index];
  if (!field) return;
  const freePlacement = findAvailableExpertSurfacePlacement(field.width, field.height, placement, index);
  const column = Math.max(0, Math.min(expertGridColumns - field.width, freePlacement.column));
  const row = Math.max(0, Math.min(expertGridRows - field.height, freePlacement.row));
  expertEditorFields[index] = {
    ...field,
    column,
    row,
  };
  selectedExpertFieldIndex = index;
  expertColumn.value = String(column);
  expertRow.value = String(row);
  persistConfiguration();
  renderExpertEditorPreview();
  statusMessage.textContent = t("message.fieldMoved", { field: field.id });
}

function createHaCardExportPayload() {
  const card = createActiveHaCardConfig({ useExportFallback: true });
  const payload = createHomeAssistantCardExportPayload({
    card,
    format: haCardFormat.value,
    name: currentHaCardExportName(),
  });
  if (activeEditorMode === "simple" && haCardFormat.value === "yaml" && importedSimpleCodePreview) {
    return { ...payload, content: importedSimpleCodePreview };
  }
  if (activeEditorMode === "expert" && haCardFormat.value === "yaml" && importedSimpleCodePreview) {
    return { ...payload, content: formatImportedYamlForStyleExport(importedSimpleCodePreview) };
  }
  if (activeEditorMode === "expert") {
    return { ...payload, content: formatExpertYamlForStyleExport(payload.content) };
  }
  return payload;
}

function openHaCardExportDialog() {
  setHaCardExportDialogStyle(haCardStyleExport.value);
  haCardExportStyleControl.hidden = !(activeEditorMode === "expert" && haCardFormat.value === "yaml");
  saveHaCardExportAs.disabled = typeof window.showSaveFilePicker !== "function";
  haCardExportStatus.textContent = [
    saveHaCardExportAs.disabled ? t("message.savePickerUnavailable") : "",
    usesDefaultAtlasExportEntities() ? defaultAtlasExportMessage() : "",
  ].filter(Boolean).join(" ");
  haCardExportBackdrop.hidden = false;
  (haCardExportStyleControl.hidden
    ? (saveHaCardExportAs.disabled ? downloadHaCardExport : saveHaCardExportAs)
    : (haCardExportStyleInputs.find(input => input.checked) ?? haCardExportStyleInputs[0])).focus();
}

function closeHaCardExportDialog() {
  haCardExportBackdrop.hidden = true;
}

function syncHaCardExportStyleSelection() {
  if (activeEditorMode === "expert" && haCardFormat.value === "yaml") {
    haCardStyleExport.value = getHaCardExportDialogStyle();
    persistConfiguration();
    renderExpertEditorPreview();
  }
}

function getHaCardExportDialogStyle() {
  return haCardExportStyleInputs.find(input => input.checked)?.value ?? "card-mod";
}

function setHaCardExportDialogStyle(value) {
  const normalizedValue = value === "uix-style" ? "uix-style" : "card-mod";
  for (const input of haCardExportStyleInputs) {
    input.checked = input.value === normalizedValue;
  }
}

function downloadHaCardPayload(payload) {
  const filename = nextHaCardExportFilename(payload.manifest.filename);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([payload.content], { type: payload.manifest.mimeType }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
  rememberHaCardExportFilename(payload.manifest.filename);
  return filename;
}

async function saveHaCardPayloadWithPicker(payload) {
  if (typeof window.showSaveFilePicker !== "function") {
    haCardExportStatus.textContent = t("message.savePickerUnavailable");
    return false;
  }

  const extension = payload.manifest.format === "yaml" ? ".yaml" : ".json";
  const filename = nextHaCardExportFilename(payload.manifest.filename);
  const handle = await window.showSaveFilePicker({
    suggestedName: filename,
    types: [{
      description: payload.manifest.format === "yaml" ? "YAML" : "JSON",
      accept: { [payload.manifest.mimeType]: [extension] },
    }],
  });
  const writable = await handle.createWritable();
  await writable.write(new Blob([payload.content], { type: payload.manifest.mimeType }));
  await writable.close();
  rememberHaCardExportFilename(payload.manifest.filename);
  return filename;
}

function splitExportFilename(filename) {
  const match = filename.match(/^(.*?)(\.[^.]+)?$/);
  return {
    base: match?.[1] || filename,
    extension: match?.[2] || "",
  };
}

function readExportFilenameHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(exportFilenameHistoryStorageKey) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function nextHaCardExportFilename(filename) {
  const history = readExportFilenameHistory();
  const count = Number.isInteger(history[filename]) ? history[filename] : 0;
  if (count <= 0) return filename;
  const { base, extension } = splitExportFilename(filename);
  return `${base} (${count + 1})${extension}`;
}

function rememberHaCardExportFilename(filename) {
  try {
    const history = readExportFilenameHistory();
    const count = Number.isInteger(history[filename]) ? history[filename] : 0;
    localStorage.setItem(exportFilenameHistoryStorageKey, JSON.stringify({
      ...history,
      [filename]: count + 1,
    }));
  } catch {
  }
}

async function exportHaCardPayload(useSavePicker) {
  syncHaCardExportStyleSelection();
  const payload = createHaCardExportPayload();
  let filename = payload.manifest.filename;
  try {
    if (useSavePicker) {
      const savedFilename = await saveHaCardPayloadWithPicker(payload);
      if (!savedFilename) return;
      filename = savedFilename;
    } else {
      filename = downloadHaCardPayload(payload);
    }
    closeHaCardExportDialog();
    statusMessage.textContent = [
      t("message.haCardExported", { filename }),
      usesDefaultAtlasExportEntities() ? defaultAtlasExportMessage() : "",
    ].filter(Boolean).join(" ");
  } catch (error) {
    haCardExportStatus.textContent = error?.name === "AbortError"
      ? t("message.exportCancelled")
      : t("message.exportFailed");
  }
}

function selectedCardExportLanguages() {
  return [
    "en",
    ...cardExportLanguageInputs
      .filter(input => input.checked && input.dataset.cardExportLanguage !== "en")
      .map(input => input.dataset.cardExportLanguage),
  ];
}

function sleep(milliseconds) {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}

async function prepareCardExportTranslations(cardPackage) {
  if (!cardAutoTranslate.checked) {
    cardTranslationProgress.hidden = true;
    cardTranslationProgress.value = 0;
    renderCardTranslationModuleStatus();
    return cardPackage;
  }

  const languages = cardPackage.manifest.languages;
  const targetLanguages = languages.filter(language => language !== "en");
  const provider = normalizeTranslationProvider(adminTranslationProvider);
  const translationApiEndpoint = normalizeTranslationApiEndpoint(adminTranslationApiEndpoint);
  cardTranslationProgress.hidden = false;
  cardTranslationProgress.value = 0;
  if (provider === "none") {
    cardTranslationStatus.textContent = t("message.translationFallbackNoProvider");
    return await prepareFallbackCardExportTranslations(languages, cardPackage);
  }

  if (targetLanguages.length === 0) {
    cardTranslationProgress.value = 100;
    statusMessage.textContent = t("message.translationComplete", { percent: 100 });
    return cardPackage;
  }

  if (provider !== "chatgpt") {
    cardTranslationStatus.textContent = t("message.translationFallbackProviderPending", { provider, endpoint: translationApiEndpoint });
    return await prepareFallbackCardExportTranslations(languages, cardPackage);
  }

  if (!adminTranslationApiKeyConfigured) {
    cardTranslationStatus.textContent = t("message.translationProviderMissingKey", { provider });
    return await prepareFallbackCardExportTranslations(languages, cardPackage);
  }

  try {
    cardTranslationProgress.value = 15;
    statusMessage.textContent = t("message.translationProviderRequest", { provider, percent: 15 });
    const translatedLocales = await requestCardLocaleTranslations(cardPackage, targetLanguages);
    cardTranslationProgress.value = 100;
    statusMessage.textContent = t("message.translationProviderComplete", {
      provider,
      languages: translatedLocales.map(locale => locale.language).join(", "),
    });
    cardTranslationStatus.textContent = statusMessage.textContent;
    return mergeTranslatedCardLocales(cardPackage, translatedLocales);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown error";
    cardTranslationStatus.textContent = t("message.translationProviderFailed", { provider, reason });
    return await prepareFallbackCardExportTranslations(languages, cardPackage);
  }
}

async function prepareFallbackCardExportTranslations(languages, cardPackage) {
  const steps = Math.max(1, languages.length);
  for (let index = 0; index < steps; index += 1) {
    const percent = Math.round(((index + 1) / steps) * 100);
    cardTranslationProgress.value = percent;
    statusMessage.textContent = t("message.translationProgress", { percent });
    await sleep(60);
  }

  statusMessage.textContent = t("message.translationComplete", { percent: 100 });
  return cardPackage;
}

async function requestCardLocaleTranslations(cardPackage, targetLanguages) {
  const sourceLocale = cardPackage.locales.find(locale => locale.language === "en")?.content;
  if (!sourceLocale) {
    throw new Error("source locale missing");
  }

  const response = await fetch(adminCardTranslationApiUrl, {
    method: "POST",
    mode: "cors",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      provider: adminTranslationProvider,
      languages: targetLanguages,
      sourceLocale,
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }
  return Array.isArray(body.locales) ? body.locales : [];
}

function mergeTranslatedCardLocales(cardPackage, translatedLocales) {
  const translatedByLanguage = new Map(translatedLocales.map(locale => [locale.language, locale]));
  const translatedLanguages = new Set(translatedByLanguage.keys());
  return {
    ...cardPackage,
    manifest: {
      ...cardPackage.manifest,
      fallbackLanguages: cardPackage.manifest.fallbackLanguages.filter(language => !translatedLanguages.has(language)),
    },
    locales: cardPackage.locales.map(locale => translatedByLanguage.get(locale.language) ?? locale),
  };
}

function createHaCardExportPackage() {
  const card = createActiveHaCardConfig({ useExportFallback: true });
  const editorPlan = createActiveCardEditorPlan({ useExportFallback: true });
  const cardPackage = createHomeAssistantCardExportPackage({
    card,
    format: haCardFormat.value,
    name: currentHaCardExportName(),
    languages: selectedCardExportLanguages(),
    editorPlan,
    script: createHomeAssistantCardEditorScriptExport(editorPlan),
  });
  if (activeEditorMode === "simple" && haCardFormat.value === "yaml" && importedSimpleCodePreview) {
    return { ...cardPackage, content: importedSimpleCodePreview };
  }
  if (activeEditorMode === "expert" && haCardFormat.value === "yaml" && importedSimpleCodePreview) {
    return { ...cardPackage, content: formatImportedYamlForStyleExport(importedSimpleCodePreview) };
  }
  if (activeEditorMode === "expert") {
    return { ...cardPackage, content: formatExpertYamlForStyleExport(cardPackage.content) };
  }
  return cardPackage;
}

function canExportHaCard() {
  return activeEditorMode === "expert" ? expertEditorFields.length > 0 : true;
}

async function writeClipboardText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.inset = "0 auto auto 0";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) {
    throw new Error("Clipboard copy was rejected.");
  }
}

function deriveProblemReportWebSocketUrl(configuration) {
  try {
    return deriveHomeAssistantWebSocketUrl(configuration);
  } catch {
    return "";
  }
}

function createProblemReportData() {
  const configuration = createHomeAssistantConnectionConfiguration({ url: homeAssistantUrl.value });
  const canIncludeCardPreview = canExportHaCard();
  const activeCardPayload = canIncludeCardPreview ? createHaCardExportPayload() : undefined;
  const resourceAnalysis = lovelaceResourcesChecked ? analyzeTemporaryHaCardResources(lovelaceResources) : undefined;

  return createHomeAssistantCardEditorProblemReport({
    app: {
      name: "ATLAS Home Assistant Card Editor",
      demoUrl: sanitizeHomeAssistantCardEditorDebugUrl(window.location.href),
      language: currentLanguage,
      editorMode: activeEditorMode,
    },
    connection: {
      homeAssistantUrl: sanitizeHomeAssistantCardEditorDebugUrl(homeAssistantUrl.value),
      websocketUrl: sanitizeHomeAssistantCardEditorDebugUrl(deriveProblemReportWebSocketUrl(configuration)),
      lifecycleState: connectionLifecycleState,
      sessionHandoffTokenConfigured: Boolean(adminConnectionToken),
      sessionHandoffTokenIncluded: false,
      autoReconnectAttempts: reconnectAttempts,
    },
    translation: {
      provider: normalizeTranslationProvider(adminTranslationProvider),
      apiEndpoint: sanitizeHomeAssistantCardEditorDebugUrl(adminTranslationApiEndpoint),
      apiKeyConfigured: adminTranslationApiKeyConfigured,
      apiKeyConfiguredByProvider: adminTranslationApiKeyConfiguredByProvider,
      apiKeyIncluded: false,
      autoTranslateRequested: cardAutoTranslate.checked,
    },
    card: {
      canExport: canIncludeCardPreview,
      name: currentHaCardExportName(),
      format: haCardFormat.value,
      target: activeEditorMode === "expert" ? "expert" : haCardTarget.value,
      layout: activeEditorMode === "expert" ? "expert-grid" : haCardLayout.value,
      styleExport: haCardStyleExport.value,
      scriptFilename: currentHaCardScriptFilename(),
      exportLanguages: selectedCardExportLanguages(),
      preview: activeCardPayload ? {
        filename: activeCardPayload.manifest.filename,
        mimeType: activeCardPayload.manifest.mimeType,
        content: activeCardPayload.content,
      } : undefined,
    },
    simple: {
      group: homeAssistantGroup.value,
      groupName: homeAssistantGroupName.value,
      entityIds: trackedEntityIds(),
      stackEntityIds: selectedStackEntityIds(),
      importedCardPresent: Boolean(importedSimpleCard),
      importedStyleBlocks: importedSimpleStyleInspection ? {
        global: importedSimpleStyleInspection.globalStyles.length,
        cards: importedSimpleStyleInspection.cardStyles.length,
        layout: importedSimpleStyleInspection.layoutStyles.length,
      } : undefined,
    },
    expert: {
      cardName: currentExpertCardName(),
      selectedFieldIndex: selectedExpertFieldIndex,
      editing: expertFieldEditing,
      grid: {
        columns: expertGridColumns,
        rows: expertGridRows,
        cellSize: expertGridCellSize,
      },
      surfaceSize: expertEditorSurfaceSize,
      fields: normalizedExpertEditorFields(),
      summary: expertEditorSummary.textContent,
    },
    resources: {
      checked: lovelaceResourcesChecked,
      loadedCount: lovelaceResources.length,
      analysis: resourceAnalysis ? {
        total: resourceAnalysis.total,
        hacs: resourceAnalysis.hacs,
        known: resourceAnalysis.known.slice(0, 30),
        scanOnly: resourceAnalysis.scanOnly.slice(0, 30),
        ignored: resourceAnalysis.ignored.slice(0, 30),
      } : undefined,
      recentEvents: lovelaceResourceDebugEvents.slice(-10),
      dependencyText: haCardDependency.textContent,
    },
    browser: {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      },
      clipboardApiAvailable: Boolean(navigator.clipboard?.writeText),
      saveFilePickerAvailable: typeof window.showSaveFilePicker === "function",
    },
    ui: {
      statusMessage: statusMessage.textContent,
      connectionReadiness: connectionReadiness.textContent,
      entitySyncState: entitySyncState.textContent,
      adminHandoffState: adminHandoffState.textContent,
      translationModuleState: adminTranslationModuleState.textContent,
      importReview: haCardImportReview.textContent,
    },
  });
}

function createProblemReportPreviewText() {
  return createHomeAssistantCardEditorProblemReportPreviewText(createProblemReportData());
}

function openProblemReportDialog() {
  problemReportPreview.value = createProblemReportPreviewText();
  problemReportStatus.textContent = t("message.problemReportReady");
  problemReportBackdrop.hidden = false;
  problemReportPreview.focus();
  problemReportPreview.select();
}

function closeProblemReportDialog() {
  problemReportBackdrop.hidden = true;
}

async function copyProblemReportPreview() {
  try {
    await writeClipboardText(problemReportPreview.value || createProblemReportPreviewText());
    problemReportStatus.textContent = t("message.problemReportCopied");
  } catch {
    problemReportStatus.textContent = t("message.problemReportCopyFailed");
  }
}

function openProblemReportIssue() {
  const body = problemReportPreview.value || createProblemReportPreviewText();
  window.open(createHomeAssistantCardEditorProblemReportIssueUrl({
    baseUrl: problemReportIssueUrl,
    body,
  }), "_blank", "noopener,noreferrer");
  problemReportStatus.textContent = t("message.problemIssueOpened");
}

function createGroupId(title) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "home-assistant-card";
  let candidate = `group-${slug}`;
  let counter = 2;
  while (panelGroups.some(group => group.id === candidate)) {
    candidate = `group-${slug}-${counter}`;
    counter += 1;
  }
  return candidate;
}

function createEntityTableEntry(entityId) {
  const entity = entitySnapshots.get(entityId);
  const presentation = entity ? createHomeAssistantEntityPresentation(entity) : undefined;
  const importedName = importedSimpleEntityNames.get(entityId);
  const domain = entityId.split(".", 1)[0] || "";
  const label = presentation?.label ?? importedName ?? entityId;
  const valueText = entity?.value && presentation?.category === "battery" && !entity.unit
    ? `${entity.value}%`
    : entity?.value ?? entity?.state ?? t("text.waiting");
  const typeText = entity?.updatedAt
    ? `${presentation?.detail ?? domain} · ${formatRelativeTime(entity.updatedAt)}`
    : importedName
      ? entityId
      : presentation?.detail ?? domain;
  return {
    entityId,
    entity,
    presentation,
    label,
    valueText,
    detailText: typeText,
    sortEntity: `${label} ${entityId}`,
    sortState: valueText,
    sortType: `${presentation?.detail ?? domain} ${entityId}`,
  };
}

function compareTextValues(left, right) {
  return String(left).localeCompare(String(right), currentLanguage === "de" ? "de" : "en", {
    numeric: true,
    sensitivity: "base",
  });
}

function compareEntityTableEntries(left, right) {
  const direction = entityTableSort.direction === "desc" ? -1 : 1;
  const sortKey = entityTableSort.key === "state"
    ? "sortState"
    : entityTableSort.key === "entity"
      ? "sortEntity"
      : "sortType";
  const primary = compareTextValues(left[sortKey], right[sortKey]);
  if (primary !== 0) return primary * direction;
  const secondaryType = compareTextValues(left.sortType, right.sortType);
  if (secondaryType !== 0) return secondaryType;
  return compareTextValues(left.sortEntity, right.sortEntity);
}

function createEntityTableSortButton(key, label) {
  const button = document.createElement("button");
  const active = entityTableSort.key === key;
  button.type = "button";
  button.className = "atlas-entity-sort-button";
  button.dataset.activeSort = String(active);
  button.dataset.sortIndicator = entityTableSort.direction === "desc" ? "↓" : "↑";
  button.textContent = label;
  button.addEventListener("click", () => {
    entityTableSort = {
      key,
      direction: active && entityTableSort.direction === "asc" ? "desc" : "asc",
    };
    renderEntityList();
  });
  return button;
}

function renderCardEntityOverview() {
  cardEntityOverview.replaceChildren();
  const entityIds = cardPreviewEntityIds();
  if (entityIds.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-selection-state";
    emptyState.textContent = emptyEntitySelectionMessage;
    cardEntityOverview.append(emptyState);
    return;
  }

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  const headerRow = document.createElement("tr");
  table.className = "atlas-entity-table atlas-card-entity-overview-table";
  table.setAttribute("aria-label", t("heading.entitySelection"));
  for (const key of ["table.entity", "table.state", "table.type"]) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = t(key);
    headerRow.append(th);
  }
  thead.append(headerRow);
  table.append(thead, tbody);

  for (const entityId of entityIds) {
    const { label, valueText, detailText } = createEntityTableEntry(entityId);
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const valueCell = document.createElement("td");
    const detailCell = document.createElement("td");
    const name = document.createElement("strong");
    const entityIdText = document.createElement("small");
    const value = document.createElement("span");
    const detail = document.createElement("small");
    row.dataset.primary = String(entityId === currentEntityId());
    nameCell.className = "atlas-entity-name-cell";
    valueCell.className = "atlas-entity-status-cell";
    detailCell.className = "atlas-entity-detail-cell";
    name.textContent = label;
    entityIdText.className = "atlas-entity-id";
    entityIdText.textContent = entityId;
    value.className = "atlas-entity-status";
    value.textContent = valueText;
    detail.className = "atlas-entity-type";
    detail.textContent = detailText;
    nameCell.append(name, entityIdText);
    valueCell.append(value);
    detailCell.append(detail);
    row.append(nameCell, valueCell, detailCell);
    tbody.append(row);
  }
  cardEntityOverview.append(table);
}

function renderEntityList() {
  entityList.replaceChildren();
  reconcileStackEntitySelection();
  renderCardEntityOverview();
  const selectedEntityIds = trackedEntityIds();
  const selectedEntitySet = new Set(selectedEntityIds);
  const useLiveCatalogList = activeTransport !== transport && entitySnapshots.size > 0;
  const catalogEntries = useLiveCatalogList
    ? filterHomeAssistantEntityCatalog(createEntityPickerCatalog(), {
        domain: homeAssistantEntityDomain.value || "all",
        search: homeAssistantEntitySearch.value,
      })
    : selectedEntityIds.map(entityId => ({ entityId }));
  const tableEntries = catalogEntries
    .map(entry => createEntityTableEntry(entry.entityId))
    .sort(compareEntityTableEntries);
  const entityIds = tableEntries.map(entry => entry.entityId);
  if (entityIds.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-selection-state";
    emptyState.textContent = emptyEntitySelectionMessage;
    entityList.append(emptyState);
    renderEntitySummaryText(groupSummary, emptyEntitySelectionMessage);
    renderEntitySummaryText(groupIssues, "");
    renderEntitySummaryText(selectedEntity, emptyEntitySelectionMessage);
    renderStackSelectionSummary();
    renderHaCardPreview();
    renderEmptyStatusPreview();
    return;
  }

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  const headerRow = document.createElement("tr");
  table.className = "atlas-entity-table";
  table.setAttribute("aria-label", t("heading.selectedEntities"));
  for (const column of [
    { key: "entity", label: "table.entity", sortable: true },
    { key: "state", label: "table.state", sortable: true },
    { key: "type", label: "table.type", sortable: true },
    { key: "actions", label: "table.actions", sortable: false },
  ]) {
    const th = document.createElement("th");
    th.scope = "col";
    if (column.sortable) {
      th.setAttribute("aria-sort", entityTableSort.key === column.key
        ? entityTableSort.direction === "desc" ? "descending" : "ascending"
        : "none");
    }
    if (column.sortable) {
      th.append(createEntityTableSortButton(column.key, t(column.label)));
    } else {
      th.textContent = t(column.label);
    }
    headerRow.append(th);
  }
  thead.append(headerRow);
  table.append(thead, tbody);

  let ready = 0;
  let pending = 0;
  let blocked = 0;
  const blockedEntities = [];
  for (const tableEntry of tableEntries) {
    const { entityId, entity, presentation, label, valueText, detailText } = tableEntry;
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const valueCell = document.createElement("td");
    const detailCell = document.createElement("td");
    const actionCell = document.createElement("td");
    const name = document.createElement("strong");
    const value = document.createElement("span");
    const entityIdText = document.createElement("small");
    const detail = document.createElement("small");
    const controls = document.createElement("div");
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute("aria-label", t("aria.showStatusPreview", { entityId }));
    nameCell.className = "atlas-entity-name-cell";
    valueCell.className = "atlas-entity-status-cell";
    detailCell.className = "atlas-entity-detail-cell";
    actionCell.className = "atlas-entity-actions-cell";
    row.dataset.category = presentation?.category ?? "status";
    if (presentation?.category === "battery" && entity?.value) {
      const batteryPercent = Number(entity.value);
      row.dataset.batteryLevel = batteryPercent <= 20 ? "low" : batteryPercent <= 50 ? "medium" : "normal";
    }
    name.textContent = label;
    entityIdText.className = "atlas-entity-id";
    entityIdText.textContent = entityId;
    value.className = "atlas-entity-status";
    value.textContent = valueText;
    detail.className = "atlas-entity-type";
    detail.textContent = detailText;
    if (entity?.state === "on" || entity?.state === "available") ready += 1;
    else if (entity?.state === "off") pending += 1;
    else if (entity) {
      blocked += 1;
      blockedEntities.push(presentation?.label ?? entityId);
    }
    row.addEventListener("click", () => handleEntityCardSelection(entityId));
    row.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleEntityCardSelection(entityId);
      }
    });
    controls.className = "atlas-entity-card-actions";
    nameCell.append(name, entityIdText);
    valueCell.append(value);
    detailCell.append(detail);
    const position = selectedEntityIds.indexOf(entityId);
    if (entityId === currentEntityId()) {
      row.dataset.primary = "true";
    }
    if (usesStackEntitySelection() && stackSelectedEntityIds.has(entityId)) {
      row.dataset.stackSelected = "true";
    }
    const moveUp = document.createElement("button");
    const moveDown = document.createElement("button");
    const remove = document.createElement("button");
    const stackToggle = document.createElement("input");
    moveUp.type = "button";
    moveDown.type = "button";
    remove.type = "button";
    stackToggle.type = "checkbox";
    moveUp.className = "icon-button";
    moveDown.className = "icon-button";
    moveUp.textContent = "↑";
    moveDown.textContent = "↓";
    moveUp.title = t("aria.moveEntityUp", { entityId });
    moveDown.title = t("aria.moveEntityDown", { entityId });
    moveUp.setAttribute("aria-label", t("aria.moveEntityUp", { entityId }));
    moveDown.setAttribute("aria-label", t("aria.moveEntityDown", { entityId }));
    remove.className = "icon-button";
    remove.textContent = "🗑";
    remove.title = t("aria.removeEntity", { entityId });
    remove.setAttribute("aria-label", t("aria.removeEntity", { entityId }));
    stackToggle.className = "stack-checkbox";
    stackToggle.checked = stackSelectedEntityIds.has(entityId);
    stackToggle.title = t("aria.useEntityInStack", { entityId });
    stackToggle.setAttribute("aria-label", t("aria.useEntityInStack", { entityId }));
    stackToggle.addEventListener("click", event => event.stopPropagation());
    stackToggle.addEventListener("change", event => {
      event.stopPropagation();
      setStackEntitySelected(entityId, stackToggle.checked);
    });
    moveUp.addEventListener("click", event => {
      event.stopPropagation();
      moveEntity(entityId, -1);
    });
    moveDown.addEventListener("click", event => {
      event.stopPropagation();
      moveEntity(entityId, 1);
    });
    remove.addEventListener("click", event => {
      event.stopPropagation();
      removeEntity(entityId);
    });
    if (selectedEntitySet.has(entityId)) {
      if (usesStackEntitySelection()) controls.append(stackToggle);
      if (position > 0) controls.append(moveUp);
      if (position >= 0 && position < selectedEntityIds.length - 1) controls.append(moveDown);
      controls.append(remove);
    } else {
      const add = document.createElement("button");
      add.type = "button";
      add.textContent = t("button.addEntity");
      add.addEventListener("click", event => {
        event.stopPropagation();
        addSelectedEntityToTrackedList(entityId);
      });
      controls.append(add);
    }
    if (entity && activeTransport !== transport && (entityId.startsWith("light.") || entityId.startsWith("switch."))) {
      const action = document.createElement("button");
      const service = entity.state === "on" ? "turn_off" : "turn_on";
      action.type = "button";
      action.textContent = service === "turn_on" ? t("button.turnOn") : t("button.turnOff");
      action.addEventListener("click", event => {
        event.stopPropagation();
        requestEntityService(entityId, service);
      });
      controls.append(action);
    }
    actionCell.append(controls);
    row.append(nameCell, valueCell, detailCell, actionCell);
    tbody.append(row);
  }
  entityList.append(table);
  renderEntitySummaryChips(groupSummary, [
    { label: t("text.ready"), value: String(ready), kind: "ready" },
    { label: t("text.pending"), value: String(pending), kind: "pending" },
    { label: t("text.blocked"), value: String(blocked), kind: blocked ? "blocked" : "ready" },
  ]);
  renderEntitySummaryText(groupIssues, blockedEntities.length
    ? t("message.needsAttentionCount", { count: blockedEntities.length })
    : "");
  renderStackSelectionSummary();
  renderHaCardPreview();
}

function moveEntity(entityId, direction) {
  const entityIds = trackedEntityIds();
  const index = entityIds.indexOf(entityId);
  const destination = index + direction;
  if (destination < 0 || destination >= entityIds.length) return;
  [entityIds[index], entityIds[destination]] = [entityIds[destination], entityIds[index]];
  homeAssistantEntity.value = entityIds.join(", ");
  homeAssistantEntity.dispatchEvent(new Event("input"));
}

function selectPrimaryEntity(entityId) {
  const entityIds = trackedEntityIds();
  homeAssistantEntity.value = [entityId, ...entityIds.filter(candidate => candidate !== entityId)].join(", ");
  statusPreviewEntityId = entityId;
  stackSelectedEntityIds.add(entityId);
  homeAssistantEntity.dispatchEvent(new Event("input"));
  statusMessage.textContent = t("message.selectedForHaPreview", { entityId });
}

function handleEntityCardSelection(entityId) {
  if (usesStackEntitySelection()) {
    selectStatusPreviewEntity(entityId);
    return;
  }
  if (activeEditorMode === "expert") {
    applyEntityToSelectedExpertField(entityId);
    return;
  }

  selectPrimaryEntity(entityId);
}

function selectStatusPreviewEntity(entityId) {
  statusPreviewEntityId = entityId;
  bindSelectedEntity(activeTransport ?? transport);
  if (activeTransport === transport) {
    void renderEntityState("on");
  }
  statusMessage.textContent = t("message.selectedForDiagnosticsPreview", { entityId });
}

function addEntityForStatusPreview(entityId) {
  const entityIds = trackedEntityIds();
  if (!entityIds.includes(entityId)) {
    homeAssistantEntity.value = [...entityIds, entityId].join(", ");
  }
  statusPreviewEntityId = entityId;
  homeAssistantEntity.dispatchEvent(new Event("input"));
  statusMessage.textContent = t("message.selectedForDiagnosticsWithStack", { entityId });
}

function addSelectedEntityToTrackedList(entityId) {
  const entityIds = trackedEntityIds();
  if (!entityIds.includes(entityId)) {
    homeAssistantEntity.value = [...entityIds, entityId].join(", ");
  }
  stackSelectedEntityIds.add(entityId);
  homeAssistantEntity.dispatchEvent(new Event("input"));
  statusMessage.textContent = t("message.selectedForHaPreview", { entityId });
}

function setStackEntitySelected(entityId, selected) {
  if (selected) {
    stackSelectedEntityIds.add(entityId);
  } else {
    stackSelectedEntityIds.delete(entityId);
  }
  if (stackSelectedEntityIds.size === 0) {
    stackSelectedEntityIds.add(entityId);
    statusMessage.textContent = t("message.stackNeedsEntity", { entityId });
  } else {
    statusMessage.textContent = selected
      ? t("message.addedToStackPreview", { entityId })
      : t("message.removedFromStackPreview", { entityId });
  }
  persistConfiguration();
  renderEntityList();
}

function removeEntity(entityId) {
  const entityIds = trackedEntityIds().filter(candidate => candidate !== entityId);
  stackSelectedEntityIds.delete(entityId);
  if (statusPreviewEntityId === entityId) {
    statusPreviewEntityId = entityIds[0];
  }
  homeAssistantEntity.value = entityIds.join(", ");
  homeAssistantEntity.dispatchEvent(new Event("input"));
  statusMessage.textContent = entityIds.length
    ? t("message.entityRemoved", { entityId })
    : emptyEntitySelectionMessage;
}

function formatRelativeTime(timestamp) {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return t("message.justNow");
  if (seconds < 3600) return t("message.minutesAgo", { count: Math.floor(seconds / 60) });
  return t("message.hoursAgo", { count: Math.floor(seconds / 3600) });
}

function requestEntityService(entityId, service) {
  const command = createHomeAssistantServiceCommand(entityId, service);
  if (!command || !window.confirm(t("message.sendServiceConfirm", { service, entityId }))) {
    return;
  }

  const result = connection?.getClient()?.callService(command);
  statusMessage.textContent = result?.accepted
    ? t("message.commandSent", { entityId })
    : result?.reason ?? t("message.noActiveConnection");
}

function bindSelectedEntity(nextTransport) {
  if (!registeredPanel || !nextTransport) {
    return;
  }

  panelBinding?.dispose();
  removeEntityListListener?.();
  removeServiceResultListener?.();
  removeEntityStateListListener?.();
  removeLovelaceResourceListener?.();
  removeEntityListListener = undefined;
  removeServiceResultListener = undefined;
  removeEntityStateListListener = undefined;
  removeLovelaceResourceListener = undefined;
  lovelaceResources = [];
  lovelaceResourcesChecked = false;
  window.clearTimeout(lovelaceResourceRequestTimer);
  renderTemporaryHaCardResourceList();
  renderExpertTemplatePalette();
  activeTransport = nextTransport;
  if (trackedEntityIds().length === 0) {
    renderEmptyStatusPreview();
    selectedEntity.textContent = emptyEntitySelectionMessage;
    statusMessage.textContent = emptyEntitySelectionMessage;
    renderEntityPickerOptions();
    renderEntityList();
    return;
  }

  panelBinding = bindHomeAssistantEntityStatusPanel({
    transport: activeTransport,
    panel: registeredPanel,
    entityId: currentEntityId(),
    element: statusRoot,
    tokens,
  });
  removeEntityListListener = activeTransport.subscribe(entity => {
    if (!trackedEntityIds().includes(entity.entityId)) {
      return;
    }

    entitySnapshots.set(entity.entityId, { ...entity, updatedAt: Date.now(), cached: false });
    knownEntityIds.add(entity.entityId);
    if (activeTransport !== transport) {
      cachedHomeAssistantEntityIds.add(entity.entityId);
      saveCachedEntityCatalog();
    }
    invalidateEntityPickerCatalog();
    scheduleEntityPickerOptionsRender();
    renderEntityList();
  });
  const usingLiveTransport = activeTransport !== transport;
  if (usingLiveTransport) {
    removeServiceResultListener = connection?.getClient()?.subscribeServiceResult(result => {
      statusMessage.textContent = result.success
        ? t("message.commandCompleted", { entityId: result.command.entityId })
        : t("message.commandFailed", {
          entityId: result.command.entityId,
          reason: result.reason ?? t("message.unknownError"),
        });
    });
    removeEntityStateListListener = connection?.getClient()?.subscribeEntityStateList(result => {
      if (result.success) {
        const changes = replaceLiveEntitySnapshots(result.entities);
        setEntityCatalogSyncStatus({ state: "done", ...changes });
        renderEntityPickerOptions();
        renderEntityList();
        statusMessage.textContent = t("message.loadedEntitiesWithChanges", changes);
        return;
      }
      setEntityCatalogSyncStatus({
        state: "failed",
        reason: result.reason ?? t("message.unknownError"),
      });
      statusMessage.textContent = t("message.entityListFailed", { reason: result.reason ?? t("message.unknownError") });
    });
    removeLovelaceResourceListener = connection?.getClient()?.subscribeLovelaceResources(result => {
      const command = result.command ?? "lovelace/resources";
      const isActiveResourceResponse = result.requestId === activeLovelaceResourceRequestId;
      if (!result.success && !isActiveResourceResponse) {
        addLovelaceResourceDebugEvent(
          `WS response #${result.requestId} (${command}): ignored stale failure, ${result.reason ?? "unknown error"}`,
        );
        renderTemporaryHaCardResourceList();
        return;
      }
      if (result.success || isActiveResourceResponse) {
        window.clearTimeout(lovelaceResourceRequestTimer);
        activeLovelaceResourceRequestId = undefined;
      }
      lovelaceResources = result.resources ?? [];
      lovelaceResourcesChecked = result.success;
      addLovelaceResourceDebugEvent(result.success
        ? `WS response #${result.requestId} (${command}): success, ${lovelaceResources.length} resources`
        : `WS response #${result.requestId} (${command}): failed, ${result.reason ?? "unknown error"}`);
      const scannedCards = result.success ? refreshScannedExpertPaletteCards() : { total: 0, hacs: 0 };
      renderHaCardPreview();
      renderExpertTemplatePalette();
      renderTemporaryHaCardResourceList(result.success ? "ready" : "failed", result.reason);
      statusMessage.textContent = result.success
        ? t("message.loadedResources", {
          count: result.resources.length,
          total: scannedCards.total,
          hacs: scannedCards.hacs,
        })
        : t("message.lovelaceFailed", { reason: result.reason ?? t("message.unknownError") });
    });
    refreshLiveEntityStates();
  }
  for (const button of buttons) {
    button.disabled = usingLiveTransport;
  }
  selectedEntity.textContent = usingLiveTransport
    ? t("message.liveEntity", { entityId: currentEntityId() })
    : t("message.demoEntityTarget", { entityId: currentEntityId() });
  statusMessage.textContent = usingLiveTransport
    ? t("message.waitingForUpdates", { entityId: currentEntityId() })
    : t("message.demoControlsTarget", { entityId: currentEntityId() });
  renderEntityPickerOptions();
  renderEntityList();
}

async function connectHomeAssistant() {
  if (!adminConnectionToken) {
    await applyStoredAdminConnectionSettings();
  }

  const configuration = createHomeAssistantConnectionConfiguration({ url: homeAssistantUrl.value });
  const readiness = inspectHomeAssistantConnectionReadiness(configuration);
  if (!readiness.ready) {
    renderConnectionLifecycle({ state: "failed", reason: readiness.reason });
    return;
  }

  if (!adminConnectionToken) {
    renderConnectionLifecycle({ state: "failed", reason: t("message.tokenRequired") });
    return;
  }

  const connectionSignature = createConnectionSignature(configuration, adminConnectionToken);
  if (hasMatchingActiveConnectionAttempt(connectionSignature)) {
    return;
  }

  removeLifecycleListener?.();
  clearTimeout(reconnectTimer);
  reconnectTimer = undefined;
  reconnectAttempts = 0;
  reconnectToken = undefined;
  connection?.disconnect();
  connection = createHomeAssistantRuntimeConnection(configuration, createBrowserHomeAssistantWebSocket);
  removeLifecycleListener = connection.subscribeLifecycle(renderConnectionLifecycle);
  activeConnectionSignature = connectionSignature;
  reconnectToken = adminConnectionToken;
  renderConnectionLifecycle({ state: "connecting" });
  connection.connect(reconnectToken);
  persistConfiguration();
}

function disconnectHomeAssistant() {
  reconnectToken = undefined;
  reconnectAttempts = 0;
  activeConnectionSignature = "";
  clearTimeout(reconnectTimer);
  reconnectTimer = undefined;
  connection?.disconnect();
}

applyTranslations();

const registeredPanel = findHomeAssistantStatusPanel(panelRegistry, panel.id);
if (!registeredPanel) {
  statusMessage.textContent = t("message.statusPanelNotRegistered");
} else {
  bindSelectedEntity(transport);
  transport.subscribe(entity => {
    if (entity.entityId !== currentEntityId()) {
      return;
    }

    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button.dataset.entityState === entity.state));
    }
    statusMessage.textContent = t("message.entityStateUpdated", { state: entity.state });
  });
}

document.addEventListener("click", event => {
  if (!(event.target instanceof Element)) return;
  const control = event.target.closest("button, .import-button");
  if (control) {
    triggerControlClickFeedback(control);
  }
});

for (const button of buttons) {
  button.addEventListener("click", () => {
    void renderEntityState(button.dataset.entityState);
  });
}

for (const button of languageButtons) {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.language);
  });
}

for (const button of themeButtons) {
  button.addEventListener("click", () => {
    setThemePreference(button.dataset.themeMode);
  });
}

window.matchMedia?.("(prefers-color-scheme: dark)")?.addEventListener("change", () => {
  if (currentThemePreference === "auto") {
    applyThemePreference();
  }
});

openProblemReport.addEventListener("click", openProblemReportDialog);
closeProblemReport.addEventListener("click", closeProblemReportDialog);
problemReportBackdrop.addEventListener("click", event => {
  if (event.target === problemReportBackdrop) {
    closeProblemReportDialog();
  }
});
copyProblemReport.addEventListener("click", () => {
  void copyProblemReportPreview();
});
openProblemIssue.addEventListener("click", openProblemReportIssue);

homeAssistantUrl.addEventListener("input", () => {
  renderConnectionReadiness();
  persistConfiguration();
});
window.addEventListener("message", receiveAdminConnectionHandoff);
homeAssistantEntity.addEventListener("input", () => {
  if (!applyingImportedSimpleSummary && importedSimpleCodePreview) {
    clearImportedSimplePreviewState();
  }
  persistConfiguration();
  renderEntityPickerOptions();
  bindSelectedEntity(activeTransport ?? transport);
  if (activeTransport === transport) {
    void renderEntityState("on");
  }
  renderHaCardPreview();
});
homeAssistantEntityDomain.addEventListener("change", () => {
  persistConfiguration();
  renderEntityPickerOptions();
});
homeAssistantEntityDomainShortcuts.addEventListener("click", event => {
  const button = event.target.closest("[data-entity-domain]");
  if (!button) return;
  homeAssistantEntityDomain.value = button.dataset.entityDomain;
  persistConfiguration();
  renderEntityPickerOptions();
});
homeAssistantEntitySearch.addEventListener("input", () => {
  persistConfiguration();
  scheduleEntityPickerOptionsRender();
});
clearHomeAssistantEntitySearch.addEventListener("click", () => {
  homeAssistantEntitySearch.value = "";
  persistConfiguration();
  renderEntityPickerOptions();
  homeAssistantEntitySearch.focus();
});
addHomeAssistantEntity.addEventListener("click", addSelectedEntityFromPicker);
homeAssistantEntityPicker.addEventListener("change", addSelectedEntityFromPicker);
refreshHomeAssistantEntities.addEventListener("click", refreshLiveEntityStates);
checkHaCardResources.addEventListener("click", () => checkLiveLovelaceResources());
toggleTemporaryResourceDebug.addEventListener("change", () => {
  syncTemporaryResourceDebugVisibility();
  renderTemporaryHaCardResourceList();
});
homeAssistantGroup.addEventListener("change", () => {
  clearImportedSimplePreviewState();
  const group = panelGroups.find(candidate => candidate.id === homeAssistantGroup.value);
  if (group) {
    homeAssistantEntity.value = group.entityIds.join(", ");
    homeAssistantGroupName.value = group.title;
  }
  homeAssistantEntity.dispatchEvent(new Event("input"));
});
homeAssistantGroupName.addEventListener("input", renderHaCardPreview);
expertCardName.addEventListener("input", () => {
  persistConfiguration();
  renderExpertEditorPreview();
});
diagnosticsPanel.addEventListener("toggle", persistConfiguration);
haCardTarget.addEventListener("change", () => {
  clearImportedSimplePreviewState();
  syncCardLayoutState();
  persistConfiguration();
  renderEntityList();
});
haCardLayout.addEventListener("change", () => {
  persistConfiguration();
  renderEntityList();
});
haCardFormat.addEventListener("change", () => {
  persistConfiguration();
  renderHaCardPreview();
  renderExpertEditorPreview();
});
haCardStyleExport.addEventListener("change", () => {
  persistConfiguration();
  renderExpertEditorPreview();
});
haCardScriptFilename.addEventListener("input", () => {
  persistConfiguration();
  statusMessage.textContent = t("message.scriptFilenameNormalized", { scriptFilename: currentHaCardScriptFilename() });
});
for (const input of cardExportLanguageInputs) {
  input.addEventListener("change", persistConfiguration);
}
cardAutoTranslate.addEventListener("change", persistConfiguration);
for (const button of editorModeButtons) {
  button.addEventListener("click", () => {
    renderEditorMode(button.dataset.editorMode);
    persistConfiguration();
  });
}
expertTemplate.addEventListener("change", () => {
  selectExpertTemplate(expertTemplate.value);
});
expertTarget.addEventListener("change", updateSelectedExpertFieldTarget);
expertBubbleButtonType.addEventListener("change", updateSelectedExpertFieldBubbleType);
for (const control of [expertColumn, expertRow, expertWidth, expertHeight]) {
  control.addEventListener("change", updateSelectedExpertFieldGeometry);
}
for (const control of [expertGridColumnsControl, expertGridRowsControl].filter(Boolean)) {
  control.addEventListener("input", updateExpertEditorGridSize);
  control.addEventListener("change", updateExpertEditorGridSize);
}
expertGridZoomControl?.addEventListener("input", updateExpertEditorZoom);
expertGridZoomControl?.addEventListener("change", updateExpertEditorZoom);
applyExpertTitle.addEventListener("click", () => {
  updateSelectedExpertFieldTitle(expertTitle.value);
});
useEntityNameAsTitle.addEventListener("click", () => {
  const title = currentExpertEntityTitle();
  expertTitle.value = title;
  updateSelectedExpertFieldTitle(title);
  statusMessage.textContent = t("message.titleCopied", { title });
});
addExpertField.addEventListener("click", addExpertEditorField);
editExpertField.addEventListener("click", toggleExpertFieldEditing);
arrangeExpertFields.addEventListener("click", arrangeExpertEditorFields);
resetExpertSurfaceSize.addEventListener("click", resetExpertEditorSurfaceSize);
saveExpertPaletteFavorites.addEventListener("click", saveExpertPaletteFavoriteSelection);
showAllExpertPaletteCards.addEventListener("click", toggleExpertPaletteAllCards);
scanExpertPaletteCards.addEventListener("click", scanExpertPaletteCardsFromHomeAssistant);
resetExpertTemplateSizing.addEventListener("click", resetExpertTemplateSizingSelection);
resetExpertPaletteFavorites.addEventListener("click", resetExpertPaletteFavoriteSelection);
expertPaletteSearch.addEventListener("input", () => {
  expertPaletteSearchQuery = expertPaletteSearch.value;
  renderExpertTemplatePalette();
});
closeTabbedCardSettings.addEventListener("click", closeTabbedCardSettingsDialog);
tabbedCardSettingsBackdrop.addEventListener("click", event => {
  if (event.target === tabbedCardSettingsBackdrop) {
    closeTabbedCardSettingsDialog();
  }
});
addTabbedCardTab.addEventListener("click", handleAddTabbedCardTab);
removeTabbedCardTab.addEventListener("click", removeActiveTabbedCardTab);
moveTabbedCardTabUp.addEventListener("click", () => moveActiveTabbedCardTab(-1));
moveTabbedCardTabDown.addEventListener("click", () => moveActiveTabbedCardTab(1));
applyTabbedCardTab.addEventListener("click", applyActiveTabbedCardTab);
tabbedCardFullWidth.addEventListener("change", applyTabbedCardContainerOptions);
tabbedCardAutoHeight.addEventListener("change", applyTabbedCardContainerOptions);
closeStackCardSettings.addEventListener("click", closeStackCardSettingsDialog);
stackCardSettingsBackdrop.addEventListener("click", event => {
  if (event.target === stackCardSettingsBackdrop) {
    closeStackCardSettingsDialog();
  }
});
stackCardFullWidth.addEventListener("change", applyStackCardContainerOptions);
stackCardAutoHeight.addEventListener("change", applyStackCardContainerOptions);
stackCardColumns.addEventListener("input", renderStackCardColumnsOutput);
stackCardColumns.addEventListener("change", applyStackCardContainerOptions);
applyStackCardSettings.addEventListener("click", applyStackCardContainerOptions);
window.addEventListener("resize", applyExpertEditorSurfaceSize);
resetSimplePreview.addEventListener("click", resetSimplePreviewState);
resetExpertPreview.addEventListener("click", resetExpertPreviewState);
clearExpertFields.addEventListener("click", resetExpertPreviewState);
expertEditorDropzone.addEventListener("dragover", event => {
  event.preventDefault();
  expertEditorDropzone.classList.add("drag-over");
});
expertEditorDropzone.addEventListener("dragleave", event => {
  if (!(event.relatedTarget instanceof Node) || !expertEditorDropzone.contains(event.relatedTarget)) {
    expertEditorDropzone.classList.remove("drag-over");
  }
});
expertEditorDropzone.addEventListener("drop", event => {
  event.preventDefault();
  expertEditorDropzone.classList.remove("drag-over");
  const containerCard = event.dataTransfer?.getData("application/x-atlas-container-card");
  if (containerCard) {
    try {
      moveContainerCardToSurface(JSON.parse(containerCard), calculateExpertDropPlacement(event));
    } catch {
      statusMessage.textContent = t("message.invalidDragPayload");
    }
    expertDragFieldOffset = { column: 0, row: 0 };
    return;
  }
  const fieldIndex = event.dataTransfer?.getData("application/x-atlas-field-index");
  if (fieldIndex) {
    moveExpertEditorField(Number(fieldIndex), calculateExpertDropPlacement(event));
    expertDragFieldOffset = { column: 0, row: 0 };
    return;
  }
  const paletteCardId = event.dataTransfer?.getData("application/x-atlas-palette-card");
  if (paletteCardId) {
    addExpertEditorFieldFromPaletteCard(paletteCardId, calculateExpertDropPlacement(event));
    return;
  }
  const templateId = event.dataTransfer?.getData("application/x-atlas-template")
    || event.dataTransfer?.getData("text/plain")
    || expertTemplate.value;
  addExpertEditorFieldFromTemplate(templateId, calculateExpertDropPlacement(event));
});
saveHomeAssistantGroup.addEventListener("click", () => {
  const title = homeAssistantGroupName.value.trim();
  const entityIds = trackedEntityIds();
  if (!title || entityIds.length === 0) {
    statusMessage.textContent = t("message.groupRequiresNameAndEntity");
    return;
  }
  const id = `group-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  panelGroups = [...panelGroups.filter(group => group.id !== id), createHomeAssistantPanelGroup({ id, title, entityIds })];
  renderGroupOptions(id);
  persistConfiguration();
  statusMessage.textContent = t("message.groupSaved", { title });
});
deleteHomeAssistantGroup.addEventListener("click", () => {
  const id = homeAssistantGroup.value;
  if (!id.startsWith("group-")) {
    statusMessage.textContent = t("message.builtInGroupsCannotDelete");
    return;
  }
  panelGroups = panelGroups.filter(group => group.id !== id);
  renderGroupOptions("custom");
  persistConfiguration();
  statusMessage.textContent = t("message.groupDeleted");
});
duplicateHomeAssistantGroup.addEventListener("click", () => {
  const source = panelGroups.find(group => group.id === homeAssistantGroup.value);
  if (!source) {
    statusMessage.textContent = t("message.selectGroupToDuplicate");
    return;
  }
  const title = `${source.title} copy`;
  const id = `group-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  panelGroups = [...panelGroups, createHomeAssistantPanelGroup({ id, title, entityIds: source.entityIds })];
  homeAssistantGroupName.value = title;
  renderGroupOptions(id);
  persistConfiguration();
  statusMessage.textContent = t("message.groupCreated", { title });
});
exportHomeAssistantConfig.addEventListener("click", () => {
  const payload = JSON.stringify({
    version: 1,
    name: homeAssistantGroup.value === "custom" ? "ATLAS custom panel" : homeAssistantGroup.value,
    createdAt: new Date().toISOString(),
    url: homeAssistantUrl.value,
    entities: homeAssistantEntity.value,
    entityDomain: homeAssistantEntityDomain.value,
    entitySearch: homeAssistantEntitySearch.value,
    selectedGroup: homeAssistantGroup.value,
    cardTarget: haCardTarget.value,
    cardLayout: haCardLayout.value,
    cardFormat: haCardFormat.value,
    cardStyleExport: haCardStyleExport.value,
    cardScriptFilename: haCardScriptFilename.value,
    stackEntityIds: selectedStackEntityIds(),
    expertPaletteFavoriteIds: [...expertPaletteFavoriteIds],
    expertTemplateSizing: serializedExpertTemplateSizing(),
    expertEditorSurfaceSize,
    expertGridCellSize,
    expertEditorFields,
    selectedExpertFieldIndex,
    expertCardName: expertCardName.value,
    diagnosticsOpen: diagnosticsPanel.open,
    editorMode: activeEditorMode,
    groups: panelGroups,
  }, null, 2);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
  const exportName = homeAssistantGroup.value === "custom" ? "atlas-custom-panel" : `atlas-${homeAssistantGroup.value}-panel`;
  link.download = `${exportName.replace(/[^a-z0-9-]+/gi, "-")}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
});
exportHaCardConfig.addEventListener("click", () => {
  if (!canExportHaCard()) {
    statusMessage.textContent = emptyEntitySelectionMessage;
    return;
  }

  openHaCardExportDialog();
});
closeHaCardExport.addEventListener("click", closeHaCardExportDialog);
haCardExportBackdrop.addEventListener("click", event => {
  if (event.target === haCardExportBackdrop) {
    closeHaCardExportDialog();
  }
});
for (const input of haCardExportStyleInputs) {
  input.addEventListener("change", syncHaCardExportStyleSelection);
}
saveHaCardExportAs.addEventListener("click", () => {
  void exportHaCardPayload(true);
});
downloadHaCardExport.addEventListener("click", () => {
  void exportHaCardPayload(false);
});
exportHaCardPackage.addEventListener("click", async () => {
  if (!canExportHaCard()) {
    statusMessage.textContent = emptyEntitySelectionMessage;
    return;
  }

  const cardPackage = await prepareCardExportTranslations(createHaCardExportPackage());
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([JSON.stringify(cardPackage, null, 2)], { type: "application/json" }));
  link.download = `${cardPackage.editorPlan?.scriptFilename?.replace(/\.js$/i, "") ?? cardPackage.manifest.filename.replace(/\.(json|yaml)$/i, "")}.atlas-card.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  statusMessage.textContent = t("message.packageExportedWithLanguages", {
    scriptFilename: cardPackage.editorPlan?.scriptFilename ?? currentHaCardScriptFilename(),
    languages: cardPackage.manifest.languages.join(", "),
  }) + (usesDefaultAtlasExportEntities() ? ` ${defaultAtlasExportMessage()}` : "");
});
exportHaCardScript.addEventListener("click", () => {
  if (!canExportHaCard()) {
    statusMessage.textContent = emptyEntitySelectionMessage;
    return;
  }

  const scriptExport = createHomeAssistantCardEditorScriptExport(createActiveCardEditorPlan({ useExportFallback: true }));
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([scriptExport.source], { type: "text/javascript" }));
  link.download = scriptExport.filename;
  link.click();
  URL.revokeObjectURL(link.href);
  statusMessage.textContent = [
    t("message.scriptExported", { scriptFilename: scriptExport.filename }),
    usesDefaultAtlasExportEntities() ? defaultAtlasExportMessage() : "",
  ].filter(Boolean).join(" ");
});
exportHaCardBundle.addEventListener("click", async () => {
  if (!canExportHaCard()) {
    statusMessage.textContent = emptyEntitySelectionMessage;
    return;
  }

  const cardPackage = await prepareCardExportTranslations(createHaCardExportPackage());
  const bundle = createHomeAssistantCardEditorHacsBundle(cardPackage);
  const archive = createHomeAssistantCardEditorHacsBundleArchive(bundle);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([archive.content], { type: archive.mimeType }));
  link.download = archive.filename;
  link.click();
  URL.revokeObjectURL(link.href);
  statusMessage.textContent = t("message.bundleExportedWithLanguages", {
    count: String(bundle.files.length),
    filename: archive.filename,
    languages: bundle.files
      .filter(file => file.path.startsWith("locales/") && file.path.endsWith(".json"))
      .map(file => file.path.replace(/^locales\/|\.json$/g, ""))
      .join(", "),
  }) + (usesDefaultAtlasExportEntities() ? ` ${defaultAtlasExportMessage()}` : "");
});
copyHaCardConfig.addEventListener("click", async () => {
  if (!canExportHaCard()) {
    statusMessage.textContent = emptyEntitySelectionMessage;
    return;
  }

  try {
    const payload = createHaCardExportPayload();
    await writeClipboardText(payload.content);
    statusMessage.textContent = [
      t("message.haCardCopied", { format: haCardFormat.value.toUpperCase() }),
      usesDefaultAtlasExportEntities() ? defaultAtlasExportMessage() : "",
    ].filter(Boolean).join(" ");
  } catch {
    statusMessage.textContent = t("message.copyPreviewFailed");
  }
});
copyHaCardResources.addEventListener("click", async () => {
  if (!canExportHaCard()) {
    statusMessage.textContent = emptyEntitySelectionMessage;
    return;
  }

  try {
    if (activeEditorMode === "expert") {
      const editorIntegrationPlan = createHomeAssistantCardEditorFrontendIntegrationPlan({
        mode: "server",
        editorPlan: createActiveCardEditorPlan({ useExportFallback: true }),
        resources: lovelaceResources,
      });
      const requiredDependencies = editorIntegrationPlan.editorDependencyPlan.dependencies.filter(dependency => dependency.required);
      await writeClipboardText(serializeHomeAssistantCardEditorFrontendResourceReferences({
        mode: "server",
        editorPlan: createActiveCardEditorPlan({ useExportFallback: true }),
        resources: lovelaceResources,
      }, haCardFormat.value));
      statusMessage.textContent = requiredDependencies.length
        ? t("message.resourcesCopiedWithDependency", {
          dependency: formatDependencyLabels(requiredDependencies),
          format: haCardFormat.value.toUpperCase(),
        })
        : t("message.atlasResourceCopied", { format: haCardFormat.value.toUpperCase() });
      return;
    }

    const card = createActiveHaCardConfig({ useExportFallback: true });
    const dependency = inspectHomeAssistantCardDependency(card);
    await writeClipboardText(serializeHomeAssistantAtlasFrontendResourceReferences({
      mode: "server",
      card,
      resources: lovelaceResources,
    }, haCardFormat.value));
    const resourceMessage = dependency.required
      ? t("message.resourcesCopiedWithDependency", {
        dependency: dependency.label,
        format: haCardFormat.value.toUpperCase(),
      })
      : t("message.atlasResourceCopied", { format: haCardFormat.value.toUpperCase() });
    statusMessage.textContent = [
      resourceMessage,
      usesDefaultAtlasExportEntities() ? defaultAtlasExportMessage() : "",
    ].filter(Boolean).join(" ");
  } catch {
    statusMessage.textContent = t("message.copyDependencyFailed");
  }
});
importHomeAssistantConfig.addEventListener("change", async () => {
  const file = importHomeAssistantConfig.files?.[0];
  if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    if (imported.version !== 1 || typeof imported.url !== "string" || typeof imported.entities !== "string" || !Array.isArray(imported.groups)) throw new Error();
    pendingImport = imported;
    const importedName = typeof imported.name === "string" ? imported.name : t("message.unnamedConfiguration");
    if (!window.confirm(t("message.importConfigurationConfirm", {
      name: importedName,
      groups: imported.groups.length,
      entities: imported.entities.split(",").filter(Boolean).length,
    }))) return;
    homeAssistantUrl.value = pendingImport.url;
    homeAssistantEntity.value = pendingImport.entities;
    if (typeof pendingImport.entityDomain === "string") {
      homeAssistantEntityDomain.value = pendingImport.entityDomain;
    }
    if (typeof pendingImport.entitySearch === "string") {
      homeAssistantEntitySearch.value = pendingImport.entitySearch;
    }
    panelGroups = pendingImport.groups.map(createHomeAssistantPanelGroup);
    if (typeof pendingImport.cardTarget === "string" && cardTargets.some(descriptor => descriptor.target === pendingImport.cardTarget)) {
      haCardTarget.value = pendingImport.cardTarget;
    }
    if (pendingImport.cardLayout === "single" || pendingImport.cardLayout === "horizontal-stack" || pendingImport.cardLayout === "vertical-stack") {
      haCardLayout.value = pendingImport.cardLayout;
    }
    if (pendingImport.cardFormat === "json" || pendingImport.cardFormat === "yaml") {
      haCardFormat.value = pendingImport.cardFormat;
    }
    if (pendingImport.cardStyleExport === "card-mod" || pendingImport.cardStyleExport === "uix-style") {
      haCardStyleExport.value = pendingImport.cardStyleExport;
    }
    if (typeof pendingImport.cardScriptFilename === "string") {
      haCardScriptFilename.value = pendingImport.cardScriptFilename;
    }
    if (pendingImport.expertEditorSurfaceSize && typeof pendingImport.expertEditorSurfaceSize === "object") {
      expertEditorSurfaceSize = {
        columns: clampExpertEditorSurfaceDelta(pendingImport.expertEditorSurfaceSize.columns),
        rows: clampExpertEditorSurfaceDelta(pendingImport.expertEditorSurfaceSize.rows, expertGridMaxExtraRows),
      };
    } else {
      expertEditorSurfaceSize = { columns: 0, rows: 0 };
    }
    expertGridCellSize = clampExpertGridCellSize(pendingImport.expertGridCellSize);
    resetExpertTemplateSizingDefaults();
    if (Array.isArray(pendingImport.expertTemplateSizing)) {
      for (const entry of pendingImport.expertTemplateSizing) {
        if (typeof entry?.templateId === "string" && cardEditorTemplates.some(template => template.id === entry.templateId)) {
          expertTemplateSizing.set(entry.templateId, normalizeExpertTemplateSizing(entry));
        }
      }
    }
    expertEditorFields.length = 0;
    if (Array.isArray(pendingImport.expertEditorFields)) {
      expertEditorFields.push(...createHomeAssistantCardEditorPackagePlan({
        editorMode: "expert",
        fields: pendingImport.expertEditorFields,
      }).fields);
    }
    selectedExpertFieldIndex = Number.isInteger(pendingImport.selectedExpertFieldIndex)
      ? Math.max(-1, Math.min(expertEditorFields.length - 1, pendingImport.selectedExpertFieldIndex))
      : -1;
    expertCardName.value = typeof pendingImport.expertCardName === "string" ? pendingImport.expertCardName : "";
    diagnosticsPanel.open = pendingImport.diagnosticsOpen === true;
    expertFieldEditing = false;
    stackSelectedEntityIds.clear();
    if (Array.isArray(pendingImport.stackEntityIds)) {
      for (const entityId of pendingImport.stackEntityIds) {
        if (typeof entityId === "string" && entityId.trim()) {
          stackSelectedEntityIds.add(entityId.trim());
        }
      }
    }
    syncCardLayoutState();
    renderGroupOptions(typeof pendingImport.selectedGroup === "string" ? pendingImport.selectedGroup : "custom");
    renderEditorMode(pendingImport.editorMode === "expert" ? "expert" : "simple");
    syncExpertInputsFromTemplateSizing(expertTemplate.value);
    renderExpertTemplatePalette();
    persistConfiguration();
    homeAssistantEntity.dispatchEvent(new Event("input"));
    renderConnectionReadiness();
    statusMessage.textContent = t("message.configurationImported", {
      groups: panelGroups.length,
      entities: trackedEntityIds().length,
    });
  } catch {
    statusMessage.textContent = t("message.importConfigurationFailed");
  } finally {
    importHomeAssistantConfig.value = "";
  }
});
importHaCardConfig.addEventListener("change", async () => {
  const file = importHaCardConfig.files?.[0];
  if (!file) return;
  try {
    let text;
    if (isHacsBundleArchiveFile(file)) {
      const packageRead = readHomeAssistantCardEditorHacsBundleArchivePackage(new Uint8Array(await file.arrayBuffer()));
      haCardImportReview.dataset.action = packageRead.importable ? "import" : "reject";
      haCardImportReview.textContent = formatHacsBundlePackageReadReview(packageRead);
      statusMessage.textContent = packageRead.importable
        ? t("message.hacsBundleInspected", {
          count: String(packageRead.inspection.fileCount),
          scriptFilename: packageRead.inspection.scriptFiles[0] ?? "unknown",
        })
        : t("message.hacsBundleRejected", { reason: packageRead.reason });
      if (!packageRead.importable || !packageRead.packageContent) {
        return;
      }
      text = packageRead.packageContent;
      if (packageRead.summary) {
        applyHomeAssistantCardImportSummary(packageRead.summary);
        return;
      }
    } else {
      text = await file.text();
    }

    importHaCardTextIntoEditor(text);
  } catch {
    statusMessage.textContent = t("message.importHaCardFailed");
  } finally {
    importHaCardConfig.value = "";
  }
});
openHaCardPasteImport.addEventListener("click", () => {
  haCardPasteImportBackdrop.hidden = false;
  haCardPasteImportStatus.textContent = "";
  if (!haCardPasteImportText.value.trim()) {
    clearHaCardStyleInspection();
  }
  haCardPasteImportText.focus();
});
closeHaCardPasteImport.addEventListener("click", () => {
  haCardPasteImportBackdrop.hidden = true;
});
haCardPasteImportBackdrop.addEventListener("click", event => {
  if (event.target === haCardPasteImportBackdrop) {
    haCardPasteImportBackdrop.hidden = true;
  }
});
pasteHaCardFromClipboard.addEventListener("click", async () => {
  try {
    updateHaCardPasteImportText(await navigator.clipboard.readText());
  } catch {
    haCardPasteImportStatus.textContent = t("message.clipboardReadFailed");
  }
});
openHaCardFileImport.addEventListener("click", () => {
  haCardFileImport.click();
});
haCardFileImport.addEventListener("change", async () => {
  const file = haCardFileImport.files?.[0];
  if (!file) return;
  try {
    updateHaCardPasteImportText(await file.text());
  } catch {
    haCardPasteImportStatus.textContent = t("message.fileReadFailed");
  } finally {
    haCardFileImport.value = "";
  }
});
clearHaCardPasteImport.addEventListener("click", () => {
  haCardPasteImportText.value = "";
  haCardPasteImportStatus.textContent = "";
  clearHaCardStyleInspection();
  haCardPasteImportText.focus();
});
haCardPasteImportText.addEventListener("input", () => {
  if (haCardPasteImportText.value.trim()) {
    renderHaCardStyleInspection(haCardPasteImportText.value);
  } else {
    clearHaCardStyleInspection();
  }
});

function updateHaCardPasteImportText(text) {
  haCardPasteImportText.value = text;
  renderHaCardStyleInspection(text);
  haCardPasteImportStatus.textContent = text.trim()
    ? renderHaCardImportDecision(text).message
    : t("message.pasteImportEmpty");
  haCardPasteImportText.focus();
}
applyHaCardPasteImport.addEventListener("click", () => {
  const text = haCardPasteImportText.value.trim();
  if (!text) {
    haCardPasteImportStatus.textContent = t("message.pasteImportEmpty");
    return;
  }
  if (importHaCardTextIntoEditor(text)) {
    haCardPasteImportBackdrop.hidden = true;
  } else {
    haCardPasteImportStatus.textContent = haCardImportReview.textContent;
  }
});

function applyHomeAssistantCardImportSummary(summary) {
  const entityIds = [...summary.entityIds];
  const title = summary.title;
  const id = createGroupId(title);
  panelGroups = [...panelGroups, createHomeAssistantPanelGroup({ id, title, entityIds })];
  homeAssistantEntity.value = entityIds.join(", ");
  homeAssistantGroupName.value = title;
  stackSelectedEntityIds.clear();
  for (const entityId of entityIds) {
    stackSelectedEntityIds.add(entityId);
  }
  haCardTarget.value = summary.target;
  haCardLayout.value = summary.layout;
  haCardFormat.value = summary.format;
  importedSimpleCard = summary.card;
  importedSimpleEntityNames = collectImportedSimpleEntityNames(summary.card);
  if (summary.editorPlan?.scriptFilename || summary.script?.filename) {
    haCardScriptFilename.value = summary.editorPlan?.scriptFilename ?? summary.script.filename;
  }
  syncCardLayoutState();
  renderGroupOptions(id);
  if (summary.editorPlan?.editorMode === "expert") {
    expertEditorFields.splice(0, expertEditorFields.length, ...createHomeAssistantCardEditorPackagePlan(summary.editorPlan).fields);
    selectedExpertFieldIndex = expertEditorFields.length ? 0 : -1;
    expertCardName.value = summary.editorPlan.cardName;
    haCardScriptFilename.value = summary.editorPlan.scriptFilename ?? summary.script?.filename ?? "";
    expertFieldEditing = false;
    renderEditorMode("expert");
  } else {
    const importedExpertFields = createExpertFieldsFromImportedCard(summary.card);
    expertEditorFields.splice(0, expertEditorFields.length, ...importedExpertFields);
    selectedExpertFieldIndex = expertEditorFields.length ? 0 : -1;
    expertCardName.value = "";
    expertFieldEditing = false;
    renderEditorMode("simple");
  }
  persistConfiguration();
  applyingImportedSimpleSummary = true;
  try {
    homeAssistantEntity.dispatchEvent(new Event("input"));
  } finally {
    applyingImportedSimpleSummary = false;
  }
  statusMessage.textContent = t("message.haCardImported", {
    type: summary.packaged ? t("message.atlasPackage") : t("message.haCard"),
    format: summary.format.toUpperCase(),
    title,
    entities: entityIds.length,
  });
}
connectButton?.addEventListener("click", connectHomeAssistant);
disconnectButton?.addEventListener("click", disconnectHomeAssistant);

void renderEntityState("on");
renderCardTargetOptions(initialCardTarget);
renderExpertEditorOptions();
renderExpertTemplatePalette();
syncCardLayoutState();
renderGroupOptions(initialGroupSelection);
renderEntityPickerOptions();
renderConnectionReadiness();
bindAdminNavigationLinks();
void applyStoredAdminConnectionSettings();
renderAdminHandoffState();
renderCardTranslationModuleStatus();
renderEditorMode(initialEditorMode);
syncTemporaryResourceDebugVisibility();
renderTemporaryHaCardResourceList();

let adminHandoffRequestAttempts = 0;
const adminHandoffRequestTimer = window.setInterval(() => {
  adminHandoffRequestAttempts += 1;
  requestAdminConnectionHandoff();
  if (adminConnectionToken || adminHandoffRequestAttempts >= 8) {
    window.clearInterval(adminHandoffRequestTimer);
  }
}, 300);
