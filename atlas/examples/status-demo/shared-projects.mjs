import { draftOverview } from "./draft-overview.mjs";

const words = {
  de: { title: "Gemeinsame Editor-Projekte", fresh: "Neues Serverprojekt", refresh: "Projektliste laden", save: "Prüfen und speichern", open: "Öffnen prüfen", confirm: "Gesichert übernehmen", cancel: "Abbrechen", ready: "App und Runtime nutzen dieselben Serverprojekte. Änderungen ausdrücklich speichern.", error: "Projekt nicht gespeichert/geöffnet. Prüfe Verbindung und Projektdaten. Der bisherige Stand bleibt erhalten.", conflict: "Serverprojekt geändert. Liste neu laden und erneut prüfen oder als neues Projekt speichern.", preview: "{name}: {fields} Felder. Vorheriger Serverstand: {previous}. Die aktuelle Arbeitsfläche wird gesichert.", none: "neu", saved: "Serverprojekt gespeichert; vorheriger Stand gesichert.", opened: "Serverprojekt geöffnet. Ursprüngliches lokales Projekt bleibt erhalten." },
  en: { title: "Shared editor projects", fresh: "New server project", refresh: "Load project list", save: "Preview and save", open: "Preview opening", confirm: "Back up and apply", cancel: "Cancel", ready: "App and Runtime use the same server projects. Save edits explicitly.", error: "Project not saved/opened. Check connection and project data. Previous state is retained.", conflict: "Server project changed. Reload the list and preview again or save a new project.", preview: "{name}: {fields} fields. Previous server state: {previous}. Current workspace will be backed up.", none: "new", saved: "Server project saved; previous state backed up.", opened: "Server project opened. Original local project retained." },
  fr: { title: "Projets Editor partagés", fresh: "Nouveau projet serveur", refresh: "Charger les projets", save: "Vérifier et enregistrer", open: "Vérifier l’ouverture", confirm: "Sauvegarder et reprendre", cancel: "Annuler", ready: "Application et Runtime utilisent les mêmes projets serveur. Enregistrez explicitement les modifications.", error: "Projet non enregistré/ouvert. Vérifiez connexion et données. L’état précédent est conservé.", conflict: "Projet serveur modifié. Rechargez et vérifiez à nouveau ou créez un nouveau projet.", preview: "{name} : {fields} champs. État serveur précédent : {previous}. L’espace de travail sera sauvegardé.", none: "nouveau", saved: "Projet serveur enregistré ; état précédent sauvegardé.", opened: "Projet serveur ouvert. Projet local d’origine conservé." },
};
export function createSharedProjects({ root, url, capture, apply, onShared, language, readDraft, listDrafts, preferredDraftId, recoveryDraft }) {
  let entries = [], pending, busy = false, statusKey = "ready", draftNoticeKey;
  // getRandomValues also works on plain HTTP LAN origins; randomUUID does not.
  const newId = () => [...crypto.getRandomValues(new Uint8Array(16))].map(byte => byte.toString(16).padStart(2, "0")).join("");
  const extra = { restore: {de:"Sicherung prüfen",en:"Inspect backup",fr:"Vérifier une sauvegarde"}, draft: {de:"Lokalen Entwurf prüfen",en:"Inspect local draft",fr:"Vérifier le brouillon local"}, workspaceConflict: {de:"Arbeitsfläche seit der Vorschau geändert. Bitte erneut prüfen.",en:"Workspace changed since preview. Preview again.",fr:"Espace de travail modifié depuis l’aperçu. Vérifiez à nouveau."} };
  Object.assign(extra, {
    drafts: {de:"Lokale Entwürfe",en:"Local drafts",fr:"Brouillons locaux"},
    chooseDraft: {de:"Entwurf auswählen",en:"Select a draft",fr:"Choisir un brouillon"},
    thisTab: {de:"dieser Tab",en:"this tab",fr:"cet onglet"},
    otherTab: {de:"anderer oder früherer Tab",en:"other or previous tab",fr:"autre onglet ou onglet précédent"},
    unknownTime: {de:"Zeit unbekannt",en:"time unknown",fr:"date inconnue"},
    noScript: {de:"keine Scriptdatei",en:"no script filename",fr:"aucun fichier de script"},
    draftSearch: {de:"Entwürfe suchen",en:"Search drafts",fr:"Rechercher des brouillons"},
    searchDrafts: {de:"Suchen",en:"Search",fr:"Rechercher"},
    draftSearchHint: {de:"Projekt, Script, Quelle oder Datum",en:"Project, script, source or date",fr:"Projet, script, source ou date"},
    clearDraftSearch: {de:"Suche leeren",en:"Clear search",fr:"Effacer la recherche"},
    draftCount: {de:"{shown} von {total} Quellen · Suche ändert keine Entwürfe.",en:"{shown} of {total} sources · Search does not change drafts.",fr:"{shown} sources sur {total} · La recherche ne modifie aucun brouillon."},
    noDraftMatches: {de:"Keine passenden Entwürfe. Suche leeren, um alle Quellen zu sehen.",en:"No matching drafts. Clear search to show all sources.",fr:"Aucun brouillon correspondant. Effacez la recherche pour voir toutes les sources."},
    noDraftSources: {de:"0 lokale Quellen. Zuerst ein Serverprojekt öffnen oder eine Editor-Konfiguration importieren. Die Suche durchsucht nur lokale Entwürfe.",en:"0 local sources. First open a server project or import an Editor configuration. Search only covers local drafts.",fr:"0 source locale. Ouvrez d’abord un projet serveur ou importez une configuration Editor. La recherche concerne uniquement les brouillons locaux."},
    draftProject: {de:"Projekt",en:"Project",fr:"Projet"},
    draftScript: {de:"Scriptdatei",en:"Script filename",fr:"Fichier de script"},
    draftTime: {de:"Gespeichert",en:"Saved",fr:"Enregistré"},
    draftTab: {de:"Tab-Zuordnung",en:"Tab association",fr:"Association à l’onglet"},
    draftSource: {de:"Quelle",en:"Source",fr:"Source"},
    legacy: {de:"bisheriger Entwurf",en:"previous legacy draft",fr:"ancien brouillon"},
    recovery: {de:"Nach einer unterbrochenen Sicherung ist ein neuerer Entwurf dieses Tabs vorhanden: {name}. Vor der Wiederherstellung prüfen; die aktuelle Arbeitsfläche bleibt bis zur Übernahme unverändert.",en:"A newer draft from this tab is available after an interrupted save: {name}. Inspect it before recovery; the current workspace stays unchanged until you apply it.",fr:"Un brouillon plus récent de cet onglet est disponible après une sauvegarde interrompue : {name}. Vérifiez-le avant la reprise ; l’espace actuel reste inchangé jusqu’à confirmation."},
    recoverDraft: {de:"Neueren Entwurf prüfen",en:"Inspect newer draft",fr:"Vérifier le brouillon plus récent"},
    draftError: {de:"Entwurf konnte nicht lokal gesichert werden. Bitte vor Neuladen oder Schließen exportieren.",en:"Draft could not be saved locally. Export before reloading or closing.",fr:"Le brouillon n’a pas pu être sauvegardé localement. Exportez avant de recharger ou fermer."},
    draftSessionWarning: {de:"Entwurf lokal gespeichert. Seine Tab-Wiederherstellung konnte wegen einer vollen oder gesperrten Sitzungsablage nicht bestätigt werden. Bitte vor Neuladen oder Schließen exportieren; danach den passenden Stand unter Lokale Entwürfe auswählen.",en:"Draft saved locally. Its tab recovery could not be confirmed because session storage is full or blocked. Export before reloading or closing; afterwards select the matching version under Local drafts.",fr:"Brouillon enregistré localement. Sa reprise par onglet n’a pas pu être confirmée car le stockage de session est plein ou bloqué. Exportez avant de recharger ou fermer ; ensuite, sélectionnez la bonne version dans Brouillons locaux."},
  });
  const tr = key => extra[key] ? extra[key][language()] || extra[key].en : (words[language()] || words.en)[key];
  const summary = document.createElement("summary"), select = document.createElement("select"), status = document.createElement("output");
  status.setAttribute("aria-live", "polite");
  const tools = document.createElement("div"), actions = document.createElement("div"); tools.className = actions.className = "shared-project-tools";
  const preview = document.createElement("section"), description = document.createElement("p"); preview.hidden = true;
  const buttons = {};
  function button(key, parent, action) { const node = document.createElement("button"); node.type = "button"; node.addEventListener("click", () => void action()); buttons[key] = node; parent.append(node); }
  tools.append(select); button("refresh", tools, refresh); button("save", tools, () => inspect("save")); button("open", tools, () => inspect("open"));
  const file = document.createElement("input"); file.type = "file"; file.hidden = true; file.accept = ".json,application/json"; root.append(file);
  button("restore", tools, () => file.click());
  const draftSelect = document.createElement("select"), draftNotice = document.createElement("output");
  draftSelect.id = "shared-editor-drafts";
  draftNotice.id = "shared-editor-draft-notice";
  draftNotice.style.display = "block";
  draftNotice.setAttribute("role", "status");
  draftNotice.setAttribute("aria-live", "polite");
  const draftPanel = document.createElement("section"), draftLabel = document.createElement("h3");
  draftPanel.className = "shared-draft-overview";
  const searchRow = document.createElement("div"), searchLabel = document.createElement("label"), search = document.createElement("input"), searchActions = document.createElement("div");
  searchRow.className = "shared-draft-search"; searchActions.className = "shared-draft-search-actions";
  search.id = "shared-editor-draft-search"; search.type = "search"; search.autocomplete = "off"; search.enterKeyHint = "search";
  searchLabel.htmlFor = search.id;
  searchRow.append(search, searchActions);
  button("searchDrafts", searchActions, () => refreshDrafts());
  button("clearDraftSearch", searchActions, () => { search.value = ""; refreshDrafts(); search.focus(); });
  const count = document.createElement("output"), details = document.createElement("dl");
  count.id = "shared-editor-draft-count"; count.setAttribute("role", "status");
  details.id = "shared-editor-draft-details";
  draftSelect.size = 6;
  draftPanel.append(draftLabel, searchLabel, searchRow, count, draftSelect, details);
  button("draft", draftPanel, () => inspectDraft());
  let selectedDraftId = "", overview = [];
  search.addEventListener("input", () => refreshDrafts());
  search.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.isComposing) { event.preventDefault(); refreshDrafts(); }
  });
  draftSelect.addEventListener("change", () => { selectedDraftId = draftSelect.value; renderDraftDetails(); });
  async function inspectDraft() {
    if (busy) return;
    if (!draftSelect.value) { if (!draftNoticeKey) { draftNoticeKey = "chooseDraft"; renderDraftNotice(); } return; }
    busy = true;
    try { const checked = await request({ action: "preview", id: newId(), revision: 0, project: readDraft(draftSelect.value) });
      pending = { action: "restore", project: checked.project }; describe(); preview.hidden = false; root.open = true;
    } catch { show("error"); } finally { busy = false; }
  }
  const recoveryPanel = document.createElement("section"), recoveryText = document.createElement("p");
  recoveryPanel.id = "shared-editor-recovery"; recoveryPanel.hidden = true;
  recoveryText.setAttribute("aria-live", "polite"); recoveryPanel.append(recoveryText);
  button("recoverDraft", recoveryPanel, async () => {
    const candidate = recoveryDraft?.(); if (!candidate) { refreshDrafts(); return; }
    search.value = ""; selectedDraftId = candidate.id; refreshDrafts(); draftSelect.value = candidate.id; renderDraftDetails(); await inspectDraft();
  });
  file.addEventListener("change", async () => {
    try {
      const selected = file.files?.[0]; if (!selected || selected.size > 5 * 1024 * 1024) throw new Error("Invalid backup size");
      const data = JSON.parse(await selected.text()); if (data.kind !== "atlas.editor.project.backup" || data.version !== 1) throw new Error("Invalid backup");
      const checked = await request({ action: "preview", id: newId(), revision: 0, project: data.project });
      pending = { action: "restore", project: checked.project }; describe(); preview.hidden = false; root.open = true;
    } catch { show("error"); } finally { file.value = ""; }
  });
  button("confirm", actions, commit); button("cancel", actions, () => { pending = undefined; preview.hidden = true; });
  preview.append(description, actions); root.append(summary, tools, status, draftPanel, draftNotice, recoveryPanel, preview);
  function show(key) { statusKey = key; status.textContent = tr(key); }
  function describe() { if (pending) description.textContent = tr("preview").replace("{name}", pending.project.name).replace("{fields}", pending.project.fields.length).replace("{previous}", pending.previous ? `${pending.previous.name} (${pending.previous.fields})` : tr("none")); }
  function refreshDrafts(preferCurrent = false) {
    try {
      const records = listDrafts?.() || [], preferred = preferredDraftId?.();
      const exists = id => records.some(record => record.id === id);
      selectedDraftId = preferCurrent && exists(preferred) ? preferred : exists(selectedDraftId) ? selectedDraftId : exists(preferred) ? preferred : "";
      overview = draftOverview(records, search.value, language(), Object.fromEntries(["thisTab", "otherTab", "legacy", "unknownTime", "noScript"].map(key => [key, tr(key)])));
      const matches = overview.filter(record => record.matches);
      draftSelect.replaceChildren();
      const empty = document.createElement("option"); empty.value = ""; empty.textContent = tr(records.length && !matches.length ? "noDraftMatches" : "chooseDraft"); draftSelect.append(empty);
      for (const record of matches) {
        const option = document.createElement("option"); option.value = record.id;
        option.textContent = record.text;
        draftSelect.append(option);
      }
      draftSelect.value = matches.some(record => record.id === selectedDraftId) ? selectedDraftId : "";
      draftSelect.setAttribute("aria-label", tr("drafts"));
      draftLabel.textContent = tr("drafts"); searchLabel.textContent = tr("draftSearch"); search.setAttribute("aria-label", tr("draftSearch")); search.placeholder = tr("draftSearchHint");
      count.textContent = records.length ? tr("draftCount").replace("{shown}", matches.length).replace("{total}", records.length) : tr("noDraftSources");
      buttons.clearDraftSearch.disabled = !search.value;
      renderDraftDetails();
      const candidate = recoveryDraft?.(); recoveryPanel.hidden = !candidate;
      recoveryText.textContent = candidate ? tr("recovery").replace("{name}", candidate.name) : "";
      if (candidate) root.open = true;
      if (preferCurrent) draftNoticeKey = undefined;
      renderDraftNotice();
    } catch { showDraftError(); }
  }
  function renderDraftDetails() {
    details.replaceChildren();
    const record = overview.find(item => item.id === draftSelect.value && item.matches);
    buttons.draft.disabled = !record;
    if (!record) return;
    for (const [label, value] of [["draftProject", record.project.name], ["draftScript", record.script], ["draftTime", record.date], ["draftTab", record.association], ["draftSource", record.id]]) {
      const term = document.createElement("dt"), content = document.createElement("dd");
      term.textContent = tr(label); content.textContent = value; details.append(term, content);
    }
  }
  function renderDraftNotice() {
    draftNotice.textContent = draftNoticeKey ? tr(draftNoticeKey) : "";
    draftNotice.dataset.state = draftNoticeKey === "draftSessionWarning" ? "session-unavailable" : draftNoticeKey === "draftError" ? "local-error" : "";
  }
  function showDraftError() { draftNoticeKey = "draftError"; renderDraftNotice(); root.open = true; }
  function showDraftSessionWarning() { draftNoticeKey = "draftSessionWarning"; renderDraftNotice(); root.open = true; }
  function labels() { summary.textContent = tr("title"); select.setAttribute("aria-label", tr("title")); for (const [key, node] of Object.entries(buttons)) node.textContent = tr(key); if (select.options[0]) select.options[0].textContent = tr("fresh"); refreshDrafts(); show(statusKey); describe(); }
  async function request(body, id) {
    const target = new URL(url, location.href); if (id) target.searchParams.set("id", id);
    const response = await fetch(target, { cache: "no-store", ...(body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : {}) });
    const result = await response.json(); if (!response.ok) { const error = new Error(result.error || "Project unavailable"); error.conflict = response.status === 409; throw error; } return result;
  }
  async function refresh() {
    try { const selected = select.value, data = await request(); entries = data.projects; select.replaceChildren(); const fresh = document.createElement("option"); fresh.value = ""; fresh.textContent = tr("fresh"); select.append(fresh);
      for (const entry of entries) { const option = document.createElement("option"); option.value = entry.id; option.textContent = entry.name; select.append(option); }
      select.value = entries.some(entry => entry.id === selected) ? selected : ""; show("ready");
    } catch { show("error"); }
  }
  async function inspect(action) {
    if (busy) return; busy = true;
    try { const entry = entries.find(item => item.id === select.value);
      if (action === "open") { if (!entry) throw new Error("Select project"); const loaded = (await request(undefined, entry.id)).entry; pending = { action, ...loaded, previous: entry }; }
      else { const id = entry?.id ?? newId(), revision = entry?.revision ?? 0;
        const project = capture(), checked = await request({ action: "preview", id, revision, project }); pending = { action, id, revision, project: checked.project, previous: checked.previous, signature: JSON.stringify(project) }; }
      describe(); preview.hidden = false; root.open = true;
    } catch (error) { show(error.conflict ? "conflict" : "error"); } finally { busy = false; }
  }
  function backup() {
    const target = URL.createObjectURL(new Blob([JSON.stringify({ kind: "atlas.editor.project.backup", version: 1, project: capture() }, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = target; link.download = `atlas-editor-project-${Date.now()}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(target), 1000);
  }
  async function commit() {
    if (!pending || busy) return; busy = true; buttons.confirm.disabled = true;
    try {
      if (pending.action === "save" && pending.signature !== JSON.stringify(capture())) { show("workspaceConflict"); return; }
      if (pending.action === "open") { const latest = (await request(undefined, pending.id)).entry;
        if (latest.revision !== pending.revision) { show("conflict"); return; } }
      await request({ action: "backup", project: capture() }); backup();
      if (pending.action !== "save") { apply(pending.project); onShared(); }
      else { await request({ action: "save", id: pending.id, revision: pending.revision, project: pending.project }); onShared(); }
      const id = pending.id || "", action = pending.action; pending = undefined; preview.hidden = true; await refresh(); select.value = id; show(action === "save" ? "saved" : "opened");
    } catch (error) { show(error.conflict ? "conflict" : "error"); } finally { busy = false; buttons.confirm.disabled = false; }
  }
  labels(); void refresh(); return { labels, refreshDrafts, showDraftError, showDraftSessionWarning };
}
