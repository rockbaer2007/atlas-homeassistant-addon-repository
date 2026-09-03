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

function bindHubLinks() {
  for (const link of document.querySelectorAll("[data-open-hub]")) {
    const url = new URL(createAppUrl("hub"), window.location.href);
    const theme = new URL(window.location.href).searchParams.get("theme");
    if (theme) {
      url.searchParams.set("theme", theme);
    }
    link.href = url.toString();
  }
}

const demoYaml = `- id: atlas_demo_light
  alias: Licht Kueche Abend
  trigger:
    - platform: state
      entity_id: binary_sensor.kueche_bewegung
      to: "on"
  action:
    - service: light.turn_on
      target:
        entity_id: light.kueche

- id: atlas_demo_heating
  alias: Heizung Eco Nacht
  trigger:
    - platform: time
      at: "22:30:00"
  action:
    - service: climate.set_preset_mode
      target:
        entity_id: climate.wohnzimmer
      data:
        preset_mode: eco
`;

elements.loadSystem.addEventListener("click", loadSystemAutomations);
elements.upload.addEventListener("change", handleUpload);
elements.search.addEventListener("input", render);
elements.filterWarnings.addEventListener("change", render);
elements.selectAll.addEventListener("click", selectVisible);
elements.selectNone.addEventListener("click", () => {
  state.selectedIds.clear();
  render();
});
elements.exportSelected.addEventListener("click", exportSelected);
elements.clearHistory.addEventListener("click", () => {
  state.exports = [];
  renderHistory();
});

bindHubLinks();
analyzeSource("Beispiel", demoYaml);

async function loadSystemAutomations() {
  setStatus("Lese /config/automations.yaml ...");
  const candidates = ["/automations.yaml", "/config/automations.yaml"];
  for (const path of candidates) {
    try {
      const response = await fetch(`/api/file-studio/file?path=${encodeURIComponent(path)}`);
      if (!response.ok) {
        continue;
      }
      const payload = await response.json();
      const content = typeof payload.content === "string" ? payload.content : "";
      if (content.trim()) {
        analyzeSource("/config/automations.yaml", content);
        return;
      }
    } catch {
      // Try the next candidate, then fall back to the visible message below.
    }
  }
  setStatus("Systemdatei nicht lesbar. Bitte ueber File Studio /config freigeben oder YAML hochladen.");
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
  return block.replace(/^\s*-\s*/, "").replace(/^\s*id:\s*.*\n?/m, "").trimStart() + "\n";
}

function uniqueMatches(text, regex) {
  const values = new Set();
  for (const match of text.matchAll(regex)) {
    values.add(match[1]);
  }
  return Array.from(values).sort((a, b) => a.localeCompare(b));
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
  meta.textContent = `#${automation.sourceIndex} · ID ${automation.id || "-"} · ${automation.triggerCount} Trigger · ${automation.conditionCount} Conditions · ${automation.actionCount} Actions`;
  const tags = document.createElement("div");
  tags.className = "tag-list";
  for (const value of [...automation.warnings.map(warning => `Hinweis: ${warning}`), ...automation.entities.slice(0, 4), ...automation.services.slice(0, 3)]) {
    const tag = document.createElement("span");
    tag.className = "tag";
    if (value.startsWith("Hinweis: ")) tag.classList.add("warning");
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
  checkbox.setAttribute("aria-label", `${automation.alias} auswaehlen`);
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
    elements.details.textContent = "Waehle eine Automation aus.";
    return;
  }
  const title = document.createElement("strong");
  title.textContent = automation.alias;
  const meta = document.createElement("p");
  meta.className = "muted";
  meta.textContent = `${automation.triggerCount} Trigger, ${automation.conditionCount} Conditions, ${automation.actionCount} Actions, ${automation.entities.length} Entitaeten, ${automation.services.length} Services`;
  const pre = document.createElement("pre");
  pre.className = "yaml-preview";
  pre.innerHTML = highlightYaml(automation.yaml);
  elements.details.append(title, meta, createTagBlock("Hinweise", automation.warnings, "warning"), createTagBlock("Entitaeten", automation.entities), createTagBlock("Services", automation.services), pre);
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
  elements.selectionCount.textContent = `${state.selectedIds.size} ausgewaehlt`;
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
    name.innerHTML = `<strong>${escapeHtml(item.filename)}</strong><div class="automation-meta">${escapeHtml(item.folder)} · ${escapeHtml(item.sourceName)}</div>`;
    const open = document.createElement("a");
    open.className = "ghost-link";
    open.href = "/plugin-assets/file-studio/index.html";
    open.textContent = "In File Studio bearbeiten";
    row.append(name, open);
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

function exportSelected() {
  const selected = state.automations.filter(item => state.selectedIds.has(item.localId));
  if (selected.length === 0) {
    setStatus("Keine Automation fuer den Export ausgewaehlt.");
    return;
  }
  const timestamp = createTimestamp(new Date());
  const folder = elements.exportFolder.value.trim() || "/config/atlas_exports/automations";
  for (const automation of selected) {
    const filename = `${slugify(automation.alias)}_${timestamp}.yaml`;
    downloadText(filename, automation.yaml);
    state.exports.unshift({ filename, folder, sourceName: state.sourceName });
  }
  state.exports = state.exports.slice(0, 50);
  setStatus(`${selected.length} Automation(en) als YAML vorbereitet.`);
  renderHistory();
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

function createTimestamp(date) {
  const two = value => String(value).padStart(2, "0");
  return `${two(date.getDate())}_${two(date.getMonth() + 1)}_${String(date.getFullYear()).slice(-2)}-${two(date.getHours())}_${two(date.getMinutes())}_${two(date.getSeconds())}`;
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
