import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";

export function normalizeEditorProject(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.fields) || value.fields.length > 5000
    || !value.fields.every(field => field && typeof field === "object" && !Array.isArray(field))
    || typeof value.name !== "string" || !value.name.trim() || value.name.length > 200) throw new Error("Invalid editor project");
  const project = { name: value.name.trim(), fields: value.fields, surfaceSize: value.surfaceSize,
    gridCellSize: value.gridCellSize, scriptFilename: typeof value.scriptFilename === "string" ? value.scriptFilename.slice(0, 200) : "" };
  const serialized = JSON.stringify(project);
  if (Buffer.byteLength(serialized) > 4 * 1024 * 1024) throw new Error("Editor project exceeds 4 MiB");
  const copy = JSON.parse(serialized);
  function check(node, depth = 0) {
    if (depth > 80) throw new Error("Editor project too deeply nested");
    if (!node || typeof node !== "object") return;
    for (const [key, child] of Object.entries(node)) {
      if (["__proto__", "prototype", "constructor"].includes(key)) throw new Error("Invalid project key");
      check(child, depth + 1);
    }
  }
  check(copy);
  return copy;
}

export function createEditorProjectStore(path) {
  function read() {
    if (!existsSync(path)) return { kind: "atlas.editor.projects", version: 1, projects: [] };
    const data = JSON.parse(readFileSync(path, "utf8"));
    if (data.kind !== "atlas.editor.projects" || data.version !== 1 || !Array.isArray(data.projects)) throw new Error("Invalid saved project store");
    const seen = new Set();
    for (const entry of data.projects) {
      if (!/^[a-zA-Z0-9_-]{1,96}$/.test(entry.id) || seen.has(entry.id) || !Number.isSafeInteger(entry.revision) || entry.revision < 1) throw new Error("Invalid saved project entry");
      seen.add(entry.id); normalizeEditorProject(entry.project);
    }
    return data;
  }
  function inspect({ id, revision, project }) {
    if (!/^[a-zA-Z0-9_-]{1,96}$/.test(id)) throw new Error("Invalid project id");
    const data = read(), previous = data.projects.find(entry => entry.id === id);
    if (revision !== (previous?.revision ?? 0)) return { conflict: true, revision: previous?.revision ?? 0 };
    return { data, previous, project: normalizeEditorProject(project) };
  }
  function save(input) {
    const inspected = inspect(input);
    if (inspected.conflict) return inspected;
    const { data, previous, project } = inspected;
    if (!previous && data.projects.length >= 100) throw new Error("Project store contains 100 projects");
    const entry = { id: input.id, revision: (previous?.revision ?? 0) + 1, updatedAt: new Date().toISOString(), project };
    const next = { ...data, projects: [...data.projects.filter(item => item.id !== input.id), entry] };
    const serialized = JSON.stringify(next, null, 2);
    if (Buffer.byteLength(serialized) > 64 * 1024 * 1024) throw new Error("Project store exceeds 64 MiB");
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    const backups = join(dirname(path), "backups"); mkdirSync(backups, { recursive: true, mode: 0o700 });
    const folder = mkdtempSync(join(backups, `${Date.now()}-`));
    if (existsSync(path)) writeFileSync(join(folder, "projects.json"), readFileSync(path), { mode: 0o600 });
    writeFileSync(join(folder, "incoming-project.json"), JSON.stringify(entry, null, 2), { mode: 0o600 });
    const temporary = `${path}.tmp-${randomUUID()}`;
    try { writeFileSync(temporary, serialized, { flag: "wx", mode: 0o600 }); renameSync(temporary, path); }
    finally { if (existsSync(temporary)) rmSync(temporary); }
    return { entry, backedUp: true };
  }
  function backup(project) {
    const safe = normalizeEditorProject(project), folder = join(dirname(path), "workspaces");
    mkdirSync(folder, { recursive: true, mode: 0o700 });
    writeFileSync(join(folder, `${Date.now()}-${randomUUID()}.json`), JSON.stringify({ kind: "atlas.editor.project.backup", version: 1, project: safe }, null, 2), { mode: 0o600, flag: "wx" });
    return { backedUp: true };
  }
  return { read, inspect, save, backup };
}
