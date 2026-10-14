import { normalizePluginManagement } from "./plugin-management-model.mjs";

const words = {
  de: { title: "Gemeinsame Plugin-Verwaltung", refresh: "Serverstand laden", adopt: "Lokalen Stand übernehmen", export: "Sicherung exportieren", import: "Sicherung prüfen", server: "Bei Konflikten Serverstand behalten", local: "Bei Konflikten lokalen Stand verwenden", apply: "Gesichert übernehmen", cancel: "Abbrechen", ready: "App und Runtime verwenden den gemeinsamen Serverstand.", empty: "Noch kein gemeinsamer Stand. Übernimm zuerst die Einstellungen im bisherigen App-Zugang.", offline: "Gemeinsamer Stand nicht erreichbar. Lokale Daten bleiben erhalten.", conflict: "Der Serverstand wurde zwischenzeitlich geändert. Lade ihn neu und prüfe die Übernahme erneut.", saved: "Übernahme gespeichert. Der vorherige Serverstand und die Übernahmedaten sind gesichert.", preview: "Vorschau: {repos} Repositories, {plugins} Plugin-Einträge, {active} aktive Plugins. {conflicts} Konflikte.", unsaved: "Änderungen noch nicht gemeinsam gespeichert. Lade den Serverstand neu oder prüfe den aktuellen Stand zur Übernahme." },
  en: { title: "Shared plugin management", refresh: "Load server state", adopt: "Adopt local state", export: "Export backup", import: "Inspect backup", server: "Keep server values on conflict", local: "Use local values on conflict", apply: "Back up and adopt", cancel: "Cancel", ready: "App and Runtime use shared server state.", empty: "No shared state yet. Adopt settings from the existing App access first.", offline: "Shared state unavailable. Local data are retained.", conflict: "Server state changed in the meantime. Reload it and preview adoption again.", saved: "Adoption saved. Previous server state and incoming data are backed up.", preview: "Preview: {repos} repositories, {plugins} plugin entries, {active} active plugins. {conflicts} conflicts.", unsaved: "Changes are not saved to the server yet. Reload server state or preview adoption of the current state." },
  fr: { title: "Gestion partagée des plugins", refresh: "Charger l’état serveur", adopt: "Reprendre l’état local", export: "Exporter la sauvegarde", import: "Vérifier une sauvegarde", server: "Conserver le serveur en cas de conflit", local: "Utiliser l’état local en cas de conflit", apply: "Sauvegarder et reprendre", cancel: "Annuler", ready: "L’application et le Runtime utilisent l’état partagé du serveur.", empty: "Aucun état partagé. Reprenez d’abord les paramètres depuis l’accès habituel de l’application.", offline: "État partagé indisponible. Les données locales sont conservées.", conflict: "L’état serveur a changé. Rechargez-le et vérifiez à nouveau la reprise.", saved: "Reprise enregistrée. L’état serveur précédent et les données reçues sont sauvegardés.", preview: "Aperçu : {repos} dépôts, {plugins} plugins, {active} plugins actifs. {conflicts} conflits.", unsaved: "Modifications non enregistrées sur le serveur. Rechargez l’état ou vérifiez la reprise de l’état actuel." },
};

export function createSharedPluginManagement({ root, url, getState, applyState, language }) {
  let initialized = false, revision = 0, busy = false, dirty = false, ready = false, timer, pending, original;
  const recoveryKey = "atlas.administration.pendingPluginManagement";
  const tr = key => (words[language()] || words.en)[key];
  const controls = {};
  const status = document.createElement("output"); status.setAttribute("aria-live", "polite");
  const showStatus = key => { status.dataset.key = key; status.textContent = tr(key); };
  const summary = document.createElement("summary");
  const tools = document.createElement("div"); tools.className = "shared-plugin-tools";
  const preview = document.createElement("section"); preview.hidden = true;
  const description = document.createElement("p"), conflicts = document.createElement("ul");
  const preference = document.createElement("select");
  for (const value of ["server", "local"]) { const option = document.createElement("option"); option.value = value; preference.append(option); }
  function button(key, parent, handler) {
    const element = document.createElement("button"); element.type = "button";
    element.addEventListener("click", () => void handler()); parent.append(element); controls[key] = element;
  }
  button("refresh", tools, () => refresh(true));
  button("adopt", tools, () => inspect(dirty ? getState() : original));
  button("export", tools, exportBackup);
  const file = document.createElement("input"); file.type = "file"; file.accept = ".json,application/json"; file.hidden = true;
  button("import", tools, () => file.click());
  file.addEventListener("change", async () => {
    try {
      const selected = file.files?.[0];
      if (!selected || selected.size > 1024 * 1024) throw new Error("Invalid backup size");
      const data = JSON.parse(await selected.text());
      if (!["atlas.plugin.management.backup", "atlas.plugin.management"].includes(data.kind) || data.version !== 1) throw new Error("Invalid backup format");
      await inspect(data.current ?? data.local ?? data.state ?? data.server?.state);
    } catch { showStatus("offline"); }
    finally { file.value = ""; }
  });
  preview.append(description, conflicts, preference);
  const actions = document.createElement("div"); actions.className = "shared-plugin-tools";
  button("apply", actions, adopt);
  button("cancel", actions, () => { pending = undefined; preview.hidden = true; });
  preview.append(actions); root.append(summary, tools, file, status, preview);

  function labels() {
    summary.textContent = tr("title");
    for (const [key, element] of Object.entries(controls)) element.textContent = tr(key);
    preference.setAttribute("aria-label", tr("title"));
    for (const option of preference.options) option.textContent = tr(option.value);
    if (status.dataset.key) showStatus(status.dataset.key);
    if (pending?.counts) describePreview(pending.counts);
  }
  function describePreview(counts) {
    description.textContent = tr("preview").replace("{repos}", counts.repos).replace("{plugins}", counts.plugins)
      .replace("{active}", counts.active).replace("{conflicts}", counts.conflicts);
  }
  function exportBackup() {
    const data = { kind: "atlas.plugin.management.backup", version: 1, exportedAt: new Date().toISOString(),
      local: original, current: normalizePluginManagement(getState()), revision };
    const target = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = target; link.download = `atlas-plugin-management-${Date.now()}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(target), 1000);
  }
  async function request(body) {
    const response = await fetch(url, { cache: "no-store", ...(body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : {}) });
    const data = await response.json();
    if (!response.ok) { const error = new Error(data.error || "Shared state unavailable"); error.conflict = response.status === 409; throw error; }
    return data;
  }
  function accept(data) {
    revision = data.revision; initialized = data.initialized;
    if (initialized) applyState(data.state);
    showStatus(initialized ? "ready" : "empty");
  }
  async function refresh(explicit = false) {
    if (busy || (dirty && !explicit)) return;
    busy = true;
    try {
      const data = await request();
      if (explicit || data.revision !== revision || !ready) {
        if (dirty) original = normalizePluginManagement(getState());
        dirty = false; pending = undefined; preview.hidden = true; accept(data);
      }
      ready = true;
    } catch { showStatus("offline"); }
    finally { busy = false; }
  }
  async function inspect(value) {
    try {
      const incoming = normalizePluginManagement(value);
      const data = await request({ action: "preview", revision, state: incoming });
      pending = { revision, state: incoming, counts: { repos: data.preview.repositories.length,
        plugins: data.preview.plugins.length, active: data.preview.activePluginIds.length, conflicts: data.conflicts.length } };
      preference.value = "server"; describePreview(pending.counts);
      conflicts.replaceChildren();
      for (const conflict of data.conflicts) { const item = document.createElement("li"); item.textContent = conflict.id; conflicts.append(item); }
      preview.hidden = false; root.open = true;
    } catch (error) { showStatus(error.conflict ? "conflict" : "offline"); }
  }
  async function adopt() {
    if (!pending || busy) return;
    busy = true; controls.apply.disabled = true;
    try {
      exportBackup();
      const data = await request({ action: "merge", revision: pending.revision, state: pending.state, preference: preference.value });
      try { localStorage.removeItem(recoveryKey); } catch { /* Browser storage is optional. */ }
      dirty = false; accept(data); pending = undefined; preview.hidden = true; ready = true; showStatus("saved");
    } catch (error) { showStatus(error.conflict ? "conflict" : "offline"); }
    finally { busy = false; controls.apply.disabled = false; }
  }
  function changed() {
    if (!initialized || !ready) return;
    try { localStorage.setItem(recoveryKey, JSON.stringify(normalizePluginManagement(getState()))); } catch { /* Keep in-memory changes usable. */ }
    showStatus("unsaved");
    dirty = true; clearTimeout(timer);
    timer = setTimeout(async () => {
      if (busy) { changed(); return; }
      busy = true;
      try {
        const state = normalizePluginManagement(getState());
        const data = await request({ action: "update", revision, state }); revision = data.revision;
        dirty = JSON.stringify(state) !== JSON.stringify(normalizePluginManagement(getState()));
        if (!dirty) { try { localStorage.removeItem(recoveryKey); } catch { /* Optional local recovery. */ } }
        showStatus(dirty ? "unsaved" : "ready");
        if (dirty) changed();
      } catch (error) { showStatus(error.conflict ? "conflict" : "unsaved"); }
      finally { busy = false; }
    }, 200);
  }
  return { get initialized() { return initialized; }, changed, labels,
    async start() {
      labels();
      try { original = normalizePluginManagement(getState()); }
      catch { showStatus("offline"); return; }
      try {
        const recovered = localStorage.getItem(recoveryKey);
        if (recovered) original = normalizePluginManagement(JSON.parse(recovered));
      } catch { /* Do not delete damaged browser recovery data. */ }
      await refresh();
      setInterval(() => { if (!document.hidden && !pending) void refresh(); }, 15000);
      window.addEventListener("focus", () => { if (!pending) void refresh(); });
    },
  };
}
