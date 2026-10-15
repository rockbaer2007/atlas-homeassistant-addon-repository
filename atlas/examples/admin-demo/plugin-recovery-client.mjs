const words = {
  de: { restore: "Wiederherstellen", title: "Plugin sicher ersetzen oder wiederherstellen", cancel: "Abbrechen", apply: "Sichern und übernehmen", backup: "Sicherung auswählen", none: "Noch keine Plugin-Rücksicherung vorhanden.", loading: "Vorschau wird geprüft …", keep: "Vor der Übernahme wird die bisherige Plugin-Version serverseitig gesichert. Aktivierung, Repositories, Zugangsdaten und Editor-Projekte bleiben erhalten. Browserdaten und Datenformate des Plugins werden nicht zurückgesetzt oder migriert.", unknown: "Ungeklärte Kompatibilität geprüft und bewusst akzeptiert", unsupported: "Inkompatibel – Übernahme gesperrt.", upgrade: "Aktualisierung", downgrade: "Rückkehr zu einer älteren Version", replace: "Ersetzen derselben oder einer nicht vergleichbaren Version", install: "Installation", capabilities: "Deklarierte Fähigkeiten", saved: "Plugin übernommen; Rücksicherung gespeichert.", dirty: "Übernimm zuerst die offenen Änderungen der gemeinsamen Plugin-Verwaltung oder lade den Serverstand neu.", stale: "Vorschau nicht mehr gültig. Schließe den Dialog und prüfe erneut." },
  en: { restore: "Restore", title: "Safely replace or restore plugin", cancel: "Cancel", apply: "Back up and apply", backup: "Select backup", none: "No plugin recovery backup yet.", loading: "Checking preview …", keep: "The previous plugin version is backed up on the server before applying. Activation, repositories, credentials and editor projects are preserved. Browser data and plugin data formats are not reset or migrated.", unknown: "I reviewed and accept the unknown compatibility", unsupported: "Incompatible – applying is blocked.", upgrade: "Upgrade", downgrade: "Return to an older version", replace: "Replace same or incomparable version", install: "Installation", capabilities: "Declared capabilities", saved: "Plugin applied; recovery backup retained.", dirty: "First adopt pending shared plugin-management changes or reload server state.", stale: "Preview is no longer valid. Close the dialog and preview again." },
  fr: { restore: "Restaurer", title: "Remplacer ou restaurer un plugin en sécurité", cancel: "Annuler", apply: "Sauvegarder et appliquer", backup: "Choisir une sauvegarde", none: "Aucune sauvegarde de restauration du plugin.", loading: "Vérification de l’aperçu …", keep: "La version précédente du plugin est sauvegardée sur le serveur avant l’application. Activation, dépôts, identifiants et projets de l’éditeur sont conservés. Les données du navigateur et les formats de données du plugin ne sont ni réinitialisés ni migrés.", unknown: "J’ai vérifié et j’accepte la compatibilité inconnue", unsupported: "Incompatible – application bloquée.", upgrade: "Mise à jour", downgrade: "Retour à une version antérieure", replace: "Remplacement de version identique ou non comparable", install: "Installation", capabilities: "Capacités déclarées", saved: "Plugin appliqué ; sauvegarde de restauration conservée.", dirty: "Reprenez d’abord les modifications de gestion partagée ou rechargez l’état serveur.", stale: "L’aperçu n’est plus valide. Fermez la boîte de dialogue et vérifiez à nouveau." },
};

export function createPluginRecoveryClient({ api, language, dirty, refreshed, notify }) {
  const tr = key => (words[language()] || words.en)[key];
  const failed = () => ({ de: "Die Übernahme wurde nicht bestätigt. Prüfe Serverstand und Rücksicherungen und lade die Vorschau erneut.",
    en: "Applying was not confirmed. Check server state and recovery backups, then preview again.",
    fr: "L’application n’est pas confirmée. Vérifiez l’état serveur et les sauvegardes, puis rechargez l’aperçu." }[language()] || "Recovery unavailable");
  const statusWord = value => ({ de: { supported: "passend", unknown: "ungeklärt", unsupported: "nicht passend" },
    en: { supported: "supported", unknown: "unknown", unsupported: "unsupported" },
    fr: { supported: "compatible", unknown: "à vérifier", unsupported: "incompatible" } }[language()] || {})[value] || value;
  let dialog, generation = 0, busy = false;
  async function request(path, body) {
    const [pathname, query = ""] = path.split("?");
    const target = new URL(api(pathname), location.href); target.search = query;
    const response = await fetch(target, { cache: "no-store", ...(body ? { method: "POST",
      headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : {}) });
    const data = await response.json();
    if (!response.ok) throw new Error(response.status === 409 ? tr("stale") : data.compatibility
      ? `${tr("unsupported")}\n${data.compatibility.checks.map(check => `${check.field}: ${JSON.stringify(check.required)} / ${check.actual ?? "?"}`).join("\n")}` : failed());
    return data;
  }
  async function open({ pluginId, installPackage, catalogCompatibility }) {
    if (busy) return;
    if (dirty()) { notify(tr("dirty")); return; }
    if (dialog?.open) dialog.close();
    dialog?.remove();
    const turn = ++generation;
    dialog = document.createElement("dialog"); dialog.className = "plugin-recovery-dialog";
    dialog.style.width = "min(680px,calc(100vw - 32px))";
    dialog.setAttribute("aria-label", tr("title"));
    const panel = document.createElement("div"); panel.className = "dialog-panel";
    panel.style.cssText = "width:100%;box-sizing:border-box;max-height:85vh;overflow:auto";
    const title = document.createElement("h2"); title.textContent = tr("title");
    const note = document.createElement("p"); note.textContent = tr("keep");
    const label = document.createElement("label"); label.textContent = tr("backup");
    const select = document.createElement("select"); select.setAttribute("aria-label", tr("backup")); select.style.maxWidth = "100%";
    label.append(select); label.hidden = Boolean(installPackage);
    const status = document.createElement("p"); status.setAttribute("role", "status"); status.textContent = tr("loading"); status.style.overflowWrap = "anywhere";
    const details = document.createElement("pre"); details.style.cssText = "white-space:pre-wrap;overflow-wrap:anywhere";
    const reviewLabel = document.createElement("label"), review = document.createElement("input"); review.type = "checkbox";
    reviewLabel.style.cssText = "display:none;align-items:flex-start;gap:8px;font-weight:normal";
    review.style.cssText = "width:18px;height:18px;min-height:18px;flex:0 0 18px;padding:0;margin:3px 0 0";
    reviewLabel.append(review, document.createTextNode(tr("unknown"))); reviewLabel.hidden = true;
    const actions = document.createElement("div"); actions.className = "dialog-actions";
    const apply = document.createElement("button"), cancel = document.createElement("button");
    for (const button of [apply, cancel]) { button.type = "button"; button.style.cssText = "flex:1;min-height:40px"; }
    apply.textContent = tr("apply"); apply.disabled = true; cancel.textContent = tr("cancel");
    actions.append(apply, cancel); panel.append(title, note, label, status, details, reviewLabel, actions); dialog.append(panel);
    document.body.append(dialog); dialog.showModal();
    let pending, previewGeneration = 0;
    const active = () => generation === turn && dialog.open;
    function allowed() { apply.disabled = busy || !pending || pending.compatibility.status === "unsupported"
      || (pending.compatibility.status === "unknown" && !review.checked); }
    async function inspect() {
      const revision = ++previewGeneration;
      pending = undefined; review.checked = false; reviewLabel.hidden = true; reviewLabel.style.display = "none"; apply.disabled = true; details.textContent = "";
      status.textContent = tr("loading");
      try {
        const data = installPackage
          ? await request("api/plugins/check-compatibility", { installPackage, catalogCompatibility })
          : await request("api/plugins/recovery", { action: "preview", pluginId, backupId: select.value });
        if (!active() || revision !== previewGeneration) return;
        pending = data;
        status.textContent = `${data.pluginId}: ${data.replacement.currentVersion ?? "—"} → ${data.replacement.targetVersion} (${tr(data.replacement.direction)})`;
        details.textContent = `${tr("capabilities")}: ${(data.capabilities || []).join(", ") || "—"}\n`
          + data.compatibility.checks.map(check => `${check.field}: ${JSON.stringify(check.required ?? "—")} / ${check.actual ?? "?"} (${statusWord(check.status)})`).join("\n");
        if (data.compatibility.status === "unsupported") details.textContent += `\n${tr("unsupported")}`;
        reviewLabel.hidden = data.compatibility.status !== "unknown"; reviewLabel.style.display = reviewLabel.hidden ? "none" : "flex"; allowed();
      } catch (error) { if (active() && revision === previewGeneration) status.textContent = error.message; }
    }
    review.addEventListener("change", allowed);
    select.addEventListener("change", () => void inspect());
    cancel.addEventListener("click", () => dialog.close());
    dialog.addEventListener("cancel", event => { if (busy) event.preventDefault(); });
    apply.addEventListener("click", async () => {
      if (!pending || apply.disabled || dirty()) { if (dirty()) status.textContent = tr("dirty"); return; }
      const expected = pending.replacement.expected;
      busy = true; apply.disabled = true; cancel.disabled = true; select.disabled = true; review.disabled = true;
      try {
        const result = installPackage
          ? await request("api/plugins/install", { installPackage, catalogCompatibility, expected, allowUnknown: review.checked })
          : await request("api/plugins/recovery", { action: "restore", pluginId, backupId: select.value, expected, allowUnknown: review.checked });
        await refreshed(result, installPackage);
        notify(tr("saved")); dialog.close();
      } catch (error) {
        status.textContent = error.message; pending = undefined;
      } finally { busy = false; cancel.disabled = false; select.disabled = false; review.disabled = false; allowed(); }
    });
    if (installPackage) { await inspect(); return; }
    try {
      const { backups } = await request(`api/plugins/recovery?pluginId=${encodeURIComponent(pluginId)}`);
      if (!active()) return;
      for (const backup of backups) {
        const option = document.createElement("option"); option.value = backup.backupId;
        option.textContent = `${backup.version} – ${new Date(backup.createdAt).toLocaleString(language())}`; select.append(option);
      }
      if (backups.length) await inspect(); else status.textContent = tr("none");
    } catch (error) { if (active()) status.textContent = error.message; }
  }
  return { label: () => tr("restore"), replace: (installPackage, catalogCompatibility) => open({ pluginId: installPackage.plugin.id, installPackage, catalogCompatibility }),
    restore: pluginId => open({ pluginId }) };
}
