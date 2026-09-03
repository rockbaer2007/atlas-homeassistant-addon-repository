const state = {
  sourceName: "",
  automations: [],
  selectedIds: new Set(),
  exports: [],
  activeId: "",
};

const elements = {
  loadSystem: document.querySelector("#load-system"),
  upload: document.querySelector("#yaml-upload"),
  sourceStatus: document.querySelector("#source-status"),
  exportFolder: document.querySelector("#export-folder"),
  search: document.querySelector("#search"),
  filterWarnings: document.querySelector("#filter-warnings"),
  selectAll: document.querySelector("#select-all"),
  selectNone: document.querySelector("#select-none"),
  exportSelected: document.querySelector("#export-selected"),
  copyReturnPlan: document.querySelector("#copy-return-plan"),
  writeBackSelected: document.querySelector("#write-back-selected"),
  previewConflicts: document.querySelector("#preview-conflicts"),
  clearHistory: document.querySelector("#clear-history"),
  list: document.querySelector("#automation-list"),
  details: document.querySelector("#details"),
  history: document.querySelector("#export-history"),
  selectionCount: document.querySelector("#selection-count"),
  countAutomations: document.querySelector("#count-automations"),
  countEntities: document.querySelector("#count-entities"),
  countServices: document.querySelector("#count-services"),
  countWarnings: document.querySelector("#count-warnings"),
};

let currentLanguage = readLanguageFromLocation();
let currentThemePreference = readThemePreferenceFromLocation() ?? "auto";

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
    return language === "de" || language === "en" ? language : "de";
  } catch {
    return "de";
  }
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

function applyLanguage(language = currentLanguage) {
  currentLanguage = language === "en" ? "en" : "de";
  document.documentElement.lang = currentLanguage;
  updateChromeControls();
  updateLocationState();
  bindHubLinks();
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
elements.filterWarnings.addEventListener("change", render);
elements.selectAll.addEventListener("click", selectVisible);
elements.selectNone.addEventListener("click", () => {
  state.selectedIds.clear();
  render();
});
elements.exportSelected.addEventListener("click", () => void exportSelected());
elements.copyReturnPlan.addEventListener("click", () => void copyReturnPlan());
elements.writeBackSelected.addEventListener("click", () => void writeBackSelected());
elements.previewConflicts.addEventListener("click", previewConflicts);
elements.clearHistory.addEventListener("click", () => {
  state.exports = [];
  renderHistory();
});

for (const button of document.querySelectorAll("[data-theme-mode]")) {
  button.addEventListener("click", () => applyThemePreference(button.dataset.themeMode));
}
for (const button of document.querySelectorAll("[data-language]")) {
  button.addEventListener("click", () => applyLanguage(button.dataset.language));
}
window.matchMedia?.("(prefers-color-scheme: dark)")?.addEventListener("change", () => {
  if (currentThemePreference === "auto") {
    applyThemePreference("auto");
  }
});

applyLanguage(currentLanguage);
applyThemePreference(currentThemePreference);
setStatus("Bereit. Lade die echte /config/automations.yaml oder lade eine fremde YAML hoch.");

async function loadSystemAutomations() {
  setStatus("Lese /config/automations.yaml ...");
  try {
    const url = new URL(createAppUrl("api/file-studio/file"), window.location.href);
    url.searchParams.set("path", "/config/automations.yaml");
    const response = await fetch(url.toString(), { cache: "no-store" });
    if (!response.ok) {
      setStatus("/config/automations.yaml ist nicht lesbar. Bitte /config freigeben oder YAML hochladen.");
      return;
    }
    const payload = await response.json();
    const content = typeof payload.content === "string" ? payload.content : "";
    if (!content.trim()) {
      setStatus("/config/automations.yaml ist leer.");
      return;
    }
    analyzeSource(payload.path || "/config/automations.yaml", content);
  } catch {
    setStatus("/config/automations.yaml konnte nicht geladen werden. Bitte File-Studio-Zugriff prüfen oder YAML hochladen.");
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
  state.selectedIds = new Set(state.automations.map(item => item.localId));
  state.activeId = state.automations[0]?.localId ?? "";
  const warningCount = countWarnings(state.automations);
  const warningText = warningCount > 0 ? `, ${warningCount} Hinweis(e)` : ", keine Hinweise";
  setStatus(`${sourceName}: ${state.automations.length} Automationen erkannt${warningText}.`);
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
  const blocks = [];
  let current = [];
  for (const line of lines) {
    if (/^-\s+(id|alias|trigger|triggers|condition|conditions|action|actions)\s*:/.test(line) && current.length > 0) {
      blocks.push(current.join("\n").trimEnd());
      current = [line];
      continue;
    }
    current.push(line);
  }
  if (current.join("\n").trim()) {
    blocks.push(current.join("\n").trimEnd());
  }
  return blocks.filter(block => /(^|\n)\s*-?\s*(alias|trigger|triggers|action|actions)\s*:/.test(block));
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
    if (!automation.id) warnings.push("Keine ID gefunden");
    if (!automation.alias || /^automation-\d+$/.test(automation.alias)) warnings.push("Kein Alias gefunden");
    if (automation.id && idCounts.get(automation.id) > 1) warnings.push("Doppelte ID");
    if (automation.alias && aliasCounts.get(automation.alias.toLowerCase()) > 1) warnings.push("Doppelter Alias");
    if (automation.triggerCount === 0) warnings.push("Kein Trigger erkannt");
    if (automation.actionCount === 0) warnings.push("Keine Action erkannt");
    if (automation.disabled) warnings.push("Deaktiviert");
    return { ...automation, warnings };
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
  return lines
    .map((line, index) => index === 0 ? line : line.replace(/^\s{2}/, ""))
    .join("\n")
    .trimStart() + "\n";
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
  const visible = getVisibleAutomations();
  elements.list.classList.toggle("empty-state", visible.length === 0);
  elements.list.innerHTML = "";
  if (visible.length === 0) {
    elements.list.textContent = "Keine passende Automation gefunden.";
  } else {
    for (const automation of visible) {
      elements.list.append(createAutomationRow(automation));
    }
  }
  renderDetails();
  renderSummary();
}

function createAutomationRow(automation) {
  const row = document.createElement("article");
  row.className = "automation-row";
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
    `${automation.triggerCount} Trigger`,
    `${automation.conditionCount} Conditions`,
    `${automation.actionCount} Actions`,
    `Domain ${automation.domains.slice(0, 3).join(", ") || "-"}`,
  ].join(" · ");
  const tags = document.createElement("div");
  tags.className = "tag-list";
  for (const value of [
    ...automation.warnings.map(warning => `Hinweis: ${warning}`),
    ...automation.domains.slice(0, 3).map(domain => `Domain: ${domain}`),
    ...automation.areas.slice(0, 2).map(area => `Bereich: ${area}`),
    ...automation.devices.slice(0, 2).map(device => `Gerät: ${device}`),
    ...automation.entities.slice(0, 4),
    ...automation.services.slice(0, 3),
  ]) {
    const tag = document.createElement("span");
    tag.className = "tag";
    if (value.startsWith("Hinweis: ")) tag.classList.add("warning");
    if (value.startsWith("Domain: ") || value.startsWith("Bereich: ") || value.startsWith("Gerät: ")) tag.classList.add("group");
    tag.textContent = value;
    tags.append(tag);
  }
  main.append(title, meta, tags);

  const actions = document.createElement("div");
  actions.className = "automation-actions";
  const details = document.createElement("button");
  details.type = "button";
  details.textContent = "Details";
  details.addEventListener("click", () => {
    state.activeId = automation.localId;
    renderDetails();
  });
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = state.selectedIds.has(automation.localId);
  checkbox.setAttribute("aria-label", `${automation.alias} auswählen`);
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
    elements.details.textContent = "Wähle eine Automation aus.";
    return;
  }
  const title = document.createElement("strong");
  title.textContent = automation.alias;
  const meta = document.createElement("p");
  meta.className = "muted";
  meta.textContent = `${automation.triggerCount} Trigger, ${automation.conditionCount} Conditions, ${automation.actionCount} Actions, ${automation.entities.length} Entitäten, ${automation.services.length} Services`;
  const pre = document.createElement("pre");
  pre.className = "yaml-preview";
  pre.innerHTML = highlightYaml(automation.yaml);
  elements.details.append(
    title,
    meta,
    createTagBlock("Hinweise", automation.warnings, "warning"),
    createTagBlock("Domains", automation.domains),
    createTagBlock("Bereiche", automation.areas),
    createTagBlock("Geräte", automation.devices),
    createTagBlock("Entitäten", automation.entities),
    createTagBlock("Services", automation.services),
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
  elements.countWarnings.textContent = String(countWarnings(state.automations));
  elements.selectionCount.textContent = `${state.selectedIds.size} ausgewählt`;
}

function renderHistory() {
  elements.history.classList.toggle("empty-state", state.exports.length === 0);
  elements.history.innerHTML = "";
  if (state.exports.length === 0) {
    elements.history.textContent = "Noch keine Exporte in dieser Sitzung.";
    return;
  }
  for (const item of state.exports) {
    const row = document.createElement("div");
    row.className = "export-row";
    const name = document.createElement("div");
    const groups = [
      item.domains?.length ? `Domains: ${item.domains.join(", ")}` : "",
      item.areas?.length ? `Bereiche: ${item.areas.join(", ")}` : "",
      item.devices?.length ? `Geräte: ${item.devices.join(", ")}` : "",
    ].filter(Boolean).join(" · ");
    name.innerHTML = `<strong>${escapeHtml(item.filename)}</strong><div class="automation-meta">${escapeHtml(item.status ?? "gespeichert")} · ${escapeHtml(item.path ?? item.folder)} · ${escapeHtml(item.sourceName)}</div>${groups ? `<div class="automation-meta">${escapeHtml(groups)}</div>` : ""}`;
    const actions = document.createElement("div");
    actions.className = "export-actions";
    const open = document.createElement("a");
    open.className = "ghost-link";
    open.href = createFileStudioFileUrl(item.path);
    open.textContent = "In File Studio bearbeiten";
    const copy = document.createElement("button");
    copy.type = "button";
    copy.textContent = "YAML kopieren";
    copy.addEventListener("click", () => void copyText(item.yaml, `${item.filename}: YAML kopiert.`));
    actions.append(open, copy);
    row.append(name, actions);
    elements.history.append(row);
  }
}

function getVisibleAutomations() {
  const query = elements.search.value.trim().toLowerCase();
  const warningOnly = elements.filterWarnings.checked;
  return state.automations.filter(item => {
    if (warningOnly && item.warnings.length === 0) {
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
    setStatus("Keine Automation für den Export ausgewählt.");
    return;
  }
  const runFolderName = createExportRunFolderName(new Date());
  const folder = normalizeExportFolder(elements.exportFolder.value);
  const runFolder = `${folder}/${runFolderName}`;
  elements.exportSelected.disabled = true;
  setStatus(`Exportiere ${selected.length} Automation(en) nach ${runFolder} ...`);
  try {
    await ensureExportFolder(runFolder);
    const usedFilenames = new Set();
    const exported = [];
    for (const automation of selected) {
      const filename = createExportFilename(automation.alias, usedFilenames);
      const result = await writeExportFile(runFolder, filename, automation.yaml);
      exported.push({
        filename,
        path: result.path || `${runFolder}/${filename}`,
        folder: runFolder,
        sourceName: state.sourceName,
        status: "gespeichert",
        yaml: automation.yaml,
        id: automation.id,
        alias: automation.alias,
        domains: automation.domains,
        areas: automation.areas,
        devices: automation.devices,
      });
    }
    state.exports.unshift(...exported);
    state.exports = state.exports.slice(0, 50);
    setStatus(`${exported.length} Automation(en) in ${runFolder} gespeichert.`);
    renderHistory();
  } catch (error) {
    setStatus(`Export fehlgeschlagen: ${describeExportError(error)} Browser-Download wird als Rückfall genutzt.`);
    const usedFilenames = new Set();
    for (const automation of selected) {
      const filename = createExportFilename(automation.alias, usedFilenames);
      downloadText(filename, automation.yaml);
      state.exports.unshift({
        filename,
        path: filename,
        folder: "Browser-Download",
        sourceName: state.sourceName,
        status: "download",
        yaml: automation.yaml,
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

async function copyReturnPlan() {
  const selected = state.automations.filter(item => state.selectedIds.has(item.localId));
  if (!selected.length) {
    setStatus("Keine Automation für die Rückführungs-Vorschau ausgewählt.");
    return;
  }
  const conflicts = findConflicts(selected);
  const yaml = [
    "# ATLAS Rückführungs-Vorschau",
    "# In File Studio prüfen und erst danach in automations.yaml übernehmen.",
    conflicts.length
      ? `# Achtung: ${conflicts.length} mögliche Konflikte bei ID oder Alias.`
      : "# Keine ID-/Alias-Konflikte innerhalb der aktuellen Auswahl erkannt.",
    "",
    ...selected.map(automation => automation.yaml.trimEnd().split("\n").map((line, index) => index === 0 ? `- ${line}` : `  ${line}`).join("\n")),
    "",
  ].join("\n");
  await copyText(yaml, `${selected.length} Automation(en) als Rückführungs-YAML kopiert.`);
}

async function writeBackSelected() {
  const selected = state.automations.filter(item => state.selectedIds.has(item.localId));
  if (!selected.length) {
    setStatus("Keine Automation für die Rückschreibung ausgewählt.");
    return;
  }
  const confirmed = window.confirm([
    `${selected.length} Automation(en) nach /config/automations.yaml zurückschreiben?`,
    "",
    "ATLAS erstellt vorher automatisch ein Backup unter /config/atlas_backups/automations.",
  ].join("\n"));
  if (!confirmed) {
    setStatus("Rückschreibung abgebrochen.");
    return;
  }

  const timestamp = createTimestamp(new Date());
  elements.writeBackSelected.disabled = true;
  setStatus("Lese /config/automations.yaml für Rückschreibung ...");
  try {
    const current = await readFileContent("/config/automations.yaml");
    await ensureExportFolder("/config/atlas_backups/automations");
    const backupName = `automations_${timestamp}.yaml`;
    await writeFile("/config/atlas_backups/automations", backupName, current.content, false);

    const merged = mergeAutomationYaml(current.content, selected);
    await writeFile("/config", "automations.yaml", merged.content, true);
    setStatus(`${selected.length} Automation(en) zurückgeschrieben. Backup: /config/atlas_backups/automations/${backupName}. Ersetzt: ${merged.replaced}, neu: ${merged.added}.`);
  } catch (error) {
    setStatus(`Rückschreibung fehlgeschlagen: ${describeExportError(error)}`);
  } finally {
    elements.writeBackSelected.disabled = false;
  }
}

function previewConflicts() {
  const selected = state.automations.filter(item => state.selectedIds.has(item.localId));
  if (!selected.length) {
    setStatus("Keine Automation für die Konfliktprüfung ausgewählt.");
    return;
  }
  const conflicts = findConflicts(selected);
  if (!conflicts.length) {
    setStatus(`Konfliktprüfung: ${selected.length} Automation(en), keine doppelten IDs oder Aliase in der Auswahl.`);
    return;
  }
  const summary = conflicts.slice(0, 5).map(conflict => `${conflict.kind} "${conflict.value}" (${conflict.count}x)`).join("; ");
  setStatus(`Konfliktprüfung: ${conflicts.length} mögliche Konflikte. ${summary}`);
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

function mergeAutomationYaml(currentContent, selectedAutomations) {
  const existingBlocks = splitAutomationBlocks(currentContent);
  const entries = existingBlocks.map(block => ({
    block: normalizeAutomationYaml(block).trimEnd(),
    id: readYamlValue(block, "id"),
    alias: readYamlValue(block, "alias").toLowerCase(),
    replaced: false,
  }));
  let replaced = 0;
  let added = 0;

  for (const automation of selectedAutomations) {
    const nextBlock = automation.yaml.trimEnd();
    const matchIndex = entries.findIndex(entry => {
      if (automation.id && entry.id === automation.id) return true;
      return Boolean(automation.alias && entry.alias === automation.alias.toLowerCase());
    });
    if (matchIndex >= 0) {
      entries[matchIndex] = {
        block: nextBlock,
        id: automation.id,
        alias: automation.alias.toLowerCase(),
        replaced: true,
      };
      replaced += 1;
    } else {
      entries.push({
        block: nextBlock,
        id: automation.id,
        alias: automation.alias.toLowerCase(),
        replaced: false,
      });
      added += 1;
    }
  }

  return {
    content: `${entries.map(entry => formatAutomationListItem(entry.block)).join("\n\n")}\n`,
    replaced,
    added,
  };
}

function formatAutomationListItem(block) {
  const lines = block.trimEnd().split("\n");
  return lines.map((line, index) => index === 0 ? `- ${line}` : `  ${line}`).join("\n");
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
  if (/outside configured root/i.test(message)) return "Pfad liegt außerhalb der freigegebenen Bereiche.";
  if (/not found|parent directory/i.test(message)) return "Zielordner wurde nicht gefunden oder konnte nicht erstellt werden.";
  if (/already exists/i.test(message)) return "Eine Zieldatei existiert bereits.";
  if (/path separators|relative path/i.test(message)) return "Exportordner oder Dateiname ist ungültig.";
  return message;
}

function createTimestamp(date) {
  const two = value => String(value).padStart(2, "0");
  return `${two(date.getDate())}_${two(date.getMonth() + 1)}_${String(date.getFullYear()).slice(-2)}-${two(date.getHours())}_${two(date.getMinutes())}_${two(date.getSeconds())}`;
}

function createExportRunFolderName(date) {
  const two = value => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}_${two(date.getHours())}-${two(date.getMinutes())}-${two(date.getSeconds())}`;
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
