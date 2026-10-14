import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { normalizePluginManagement, mergePluginManagement } from "../examples/admin-demo/plugin-management-model.mjs";

const empty = () => ({ repositories: [], plugins: [], activePluginIds: [] });

export function createPluginManagementStore(path) {
  function read() {
    if (!existsSync(path)) return { initialized: false, revision: 0, state: empty() };
    // Fail closed on corruption. Never replace damaged state with an empty default.
    const data = JSON.parse(readFileSync(path, "utf8"));
    if (data.kind !== "atlas.plugin.management" || data.version !== 1 || !Number.isSafeInteger(data.revision) || data.revision < 1) throw new Error("Invalid saved plugin management state");
    return { initialized: true, revision: data.revision, state: normalizePluginManagement(data.state) };
  }
  function change({ action, revision, state, preference = "server" }) {
    const current = read();
    if (revision !== current.revision) return { conflict: true, ...current };
    const incoming = normalizePluginManagement(state);
    if (!["preview", "merge", "update"].includes(action) || !["server", "local"].includes(preference)) throw new Error("Invalid plugin management action");
    if (action === "update" && !current.initialized) throw new Error("Preview and adopt existing settings first");
    const result = action === "update" ? { state: incoming, conflicts: [] }
      : mergePluginManagement(current.state, incoming, preference);
    if (action === "preview") return { ...current, preview: result.state, conflicts: result.conflicts };
    if (current.initialized && JSON.stringify(result.state) === JSON.stringify(current.state)) return { ...current, conflicts: result.conflicts };
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    const backups = join(dirname(path), "backups");
    mkdirSync(backups, { recursive: true, mode: 0o700 });
    const backup = mkdtempSync(join(backups, `${new Date().toISOString().replace(/[:.]/g, "-")}-`));
    if (existsSync(path)) writeFileSync(join(backup, "state.json"), readFileSync(path), { mode: 0o600 });
    writeFileSync(join(backup, "incoming.json"), JSON.stringify(incoming, null, 2), { mode: 0o600 });
    const next = { kind: "atlas.plugin.management", version: 1, revision: current.revision + 1, state: result.state };
    const temporary = `${path}.tmp-${randomUUID()}`;
    try {
      writeFileSync(temporary, JSON.stringify(next, null, 2), { mode: 0o600, flag: "wx" });
      renameSync(temporary, path);
    } finally {
      if (existsSync(temporary)) rmSync(temporary);
    }
    return { initialized: true, revision: next.revision, state: next.state, conflicts: result.conflicts, backedUp: true };
  }
  return { read, change };
}
