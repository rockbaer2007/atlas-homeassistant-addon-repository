export const legacyDraftKey = "atlas.homeassistant.sharedProjectDraft";
export const draftPrefix = `${legacyDraftKey}.v2.`;
const tabPointerKey = `${legacyDraftKey}.tab`;

function copyProject(value) {
  if (!value || typeof value.name !== "string" || !value.name.trim()
    || !Array.isArray(value.fields) || value.fields.length > 5000
    || !value.fields.every(field => field && typeof field === "object" && !Array.isArray(field))) {
    throw new Error("Invalid draft project");
  }
  // Deliberately exclude Administration connection values and credentials.
  const text = JSON.stringify({ name: value.name, fields: value.fields,
    surfaceSize: value.surfaceSize, gridCellSize: value.gridCellSize,
    scriptFilename: typeof value.scriptFilename === "string" ? value.scriptFilename : "" });
  if (new TextEncoder().encode(text).length > 4 * 1024 * 1024) throw new Error("Draft exceeds 4 MiB");
  return JSON.parse(text);
}

export function createEditorDraftStore({ storage, session, now = Date.now,
  createId = () => [...crypto.getRandomValues(new Uint8Array(16))].map(x => x.toString(16).padStart(2, "0")).join("") }) {
  let ownId;
  let previousId;
  const summaries = new Map();
  try { previousId = session.getItem(tabPointerKey); } catch { /* Manual selection still works. */ }
  const validId = id => typeof id === "string" && /^[a-f0-9]{32}$/.test(id);
  if (!validId(previousId)) previousId = undefined;

  function read(id) {
    if (id === "legacy") {
      const source = JSON.parse(storage.getItem(legacyDraftKey) || "null");
      if (!source) throw new Error("No legacy draft");
      return { id, legacy: true, project: copyProject({ name: source.expertCardName || "ATLAS Expert card",
        fields: source.expertEditorFields, surfaceSize: source.expertEditorSurfaceSize,
        gridCellSize: source.expertGridCellSize, scriptFilename: source.cardScriptFilename }) };
    }
    if (!validId(id)) throw new Error("Select a draft");
    const record = JSON.parse(storage.getItem(draftPrefix + id) || "null");
    if (record?.kind !== "atlas.editor.local-draft" || record.version !== 1 || record.id !== id
      || !Number.isFinite(Date.parse(record.updatedAt))) throw new Error("Invalid draft record");
    return { id, updatedAt: record.updatedAt, project: copyProject(record.project),
      current: id === ownId || (!ownId && id === previousId) };
  }

  function list() {
    const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index));
    const records = [];
    for (const key of keys) {
      if (key !== legacyDraftKey && !key?.startsWith(draftPrefix)) continue;
      try {
        const id = key === legacyDraftKey ? "legacy" : key.slice(draftPrefix.length), raw = storage.getItem(key);
        let cached = summaries.get(key);
        if (!cached || cached.raw !== raw) {
          const record = read(id);
          cached = { raw, value: { id, legacy: record.legacy, updatedAt: record.updatedAt, project: { name: record.project.name } } };
          summaries.set(key, cached);
        }
        records.push({ ...cached.value, current: id === ownId || (!ownId && id === previousId) });
      }
      catch { /* Keep unreadable/legacy bytes intact; other drafts remain available. */ }
    }
    return records.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "") || a.id.localeCompare(b.id));
  }

  function save(project) {
    const safe = copyProject(project);
    if (!ownId) {
      for (let attempt = 0; attempt < 5; attempt++) {
        const candidate = createId();
        if (validId(candidate) && storage.getItem(draftPrefix + candidate) === null) { ownId = candidate; break; }
      }
      if (!ownId) throw new Error("Unable to allocate independent draft");
    }
    const record = { kind: "atlas.editor.local-draft", version: 1, id: ownId,
      updatedAt: new Date(now()).toISOString(), project: safe };
    const raw = JSON.stringify(record), key = draftPrefix + ownId;
    storage.setItem(key, raw);
    summaries.set(key, { raw, value: { id: ownId, updatedAt: record.updatedAt, project: { name: safe.name } } });
    try { session.setItem(tabPointerKey, ownId); } catch { /* Persistent list still permits recovery. */ }
    return read(ownId);
  }

  return { save, read, list, preferredId: () => ownId || previousId || (list().some(x => x.legacy) ? "legacy" : undefined) };
}
