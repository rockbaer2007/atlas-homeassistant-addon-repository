import { createHash, randomUUID } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { valid, compare } from "semver";

const digest = value => createHash("sha256").update(value).digest("hex");
const idPattern = /^atlas\.plugin\.[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const backupPattern = /^[0-9a-f-]{36}$/;
const maxBytes = 20_000_000;
const conflict = () => Object.assign(new Error("Plugin or shared state changed. Preview again."), { statusCode: 409 });
export const pluginCandidateDigest = (plugin, files, catalogCompatibility) => digest(JSON.stringify({ plugin,
  files: files.map(file => [file.path, digest(file.content)]).sort((a, b) => a[0].localeCompare(b[0])), catalogCompatibility }));

export function createPluginRecovery({ pluginRoot, bundledRoot, managementStore, managementPath, removedPath }) {
  // Inside the existing persistent mount; the server refuses hidden asset paths.
  const recoveryRoot = join(pluginRoot, ".recovery");
  function slugFor(id) {
    if (!idPattern.test(id) || id === "atlas.plugin.homeassistant-card-editor") throw new Error("Plugin cannot be replaced");
    return id.split(".").at(-1);
  }
  function filesIn(directory) {
    const files = []; let total = 0;
    function visit(path, prefix = "") {
      if (lstatSync(path).isSymbolicLink()) throw new Error("Linked plugin files cannot be backed up safely");
      for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        if (!/^[A-Za-z0-9._-]+$/.test(entry.name) || [".", ".."].includes(entry.name)) throw new Error("Unsupported plugin backup path");
        const relative = prefix + entry.name, target = join(path, entry.name);
        if (entry.isDirectory()) visit(target, relative + "/");
        else {
          const stat = lstatSync(target);
          if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("Unsupported plugin backup file");
          total += stat.size;
          if (total > maxBytes || files.length >= 300) throw new Error("Plugin exceeds recovery backup limits");
          files.push({ path: relative, content: readFileSync(target) });
        }
      }
    }
    visit(directory); return files;
  }
  function inspect(id) {
    const slug = slugFor(id), destination = join(pluginRoot, slug);
    const directory = existsSync(destination) ? destination : join(bundledRoot, slug);
    const state = managementStore.read();
    if (!existsSync(directory)) return { slug, destination, state, fingerprint: digest(JSON.stringify({ id, state, files: null })) };
    const files = filesIn(directory), manifestFile = files.find(file => file.path === "atlas-plugin.json");
    if (!manifestFile) throw new Error("Existing plugin manifest missing");
    const manifest = JSON.parse(manifestFile.content.toString("utf8"));
    if (manifest.id !== id || typeof manifest.version !== "string") throw Object.assign(new Error("Existing plugin identity mismatch"), { statusCode: 409 });
    return { slug, destination, state, manifest, files, fingerprint: digest(JSON.stringify({ id, state,
      files: files.map(file => [file.path, digest(file.content)]) })) };
  }
  function preview(current, target, candidateDigest) {
    const from = current.manifest?.version;
    const direction = !from ? "install" : from === target.version ? "replace"
      : valid(from) && valid(target.version) ? (compare(target.version, from) > 0 ? "upgrade" : "downgrade") : "replace";
    return { currentVersion: from ?? null, targetVersion: target.version, direction,
      expected: { fingerprint: current.fingerprint, candidateDigest }, backupRequired: Boolean(current.manifest) };
  }
  function read(id, backupId) {
    const slug = slugFor(id);
    if (!backupPattern.test(backupId)) throw new Error("Invalid backup id");
    const directory = join(recoveryRoot, slug, backupId), path = join(directory, "backup.json");
    if (lstatSync(directory).isSymbolicLink() || !lstatSync(path).isFile() || lstatSync(path).isSymbolicLink()
      || lstatSync(path).size > 28_000_000) throw new Error("Invalid plugin backup");
    const data = JSON.parse(readFileSync(path, "utf8"));
    if (data.kind !== "atlas.plugin.recovery" || data.version !== 1 || data.pluginId !== id
      || data.backupId !== backupId || data.sha256 !== digest(JSON.stringify(data.payload))
      || data.payload?.installPackage?.kind !== "atlas.runtime.plugin.install-package"
      || data.payload.installPackage.plugin?.id !== id
      || (data.payload.previousMetadata && data.payload.previousMetadata.id !== id)) throw new Error("Damaged plugin backup");
    return data;
  }
  function list(id) {
    const directory = join(recoveryRoot, slugFor(id));
    if (!existsSync(directory)) return [];
    return readdirSync(directory).filter(name => backupPattern.test(name)).map(name => {
      const data = read(id, name);
      return { backupId: name, version: data.payload.installPackage.plugin.version, createdAt: data.createdAt };
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  function retain(current) {
    if (!current.manifest) return undefined;
    const parent = join(recoveryRoot, current.slug);
    mkdirSync(parent, { recursive: true, mode: 0o700 });
    let total = 0;
    function countBytes(path) {
      const stat = lstatSync(path);
      if (stat.isSymbolicLink()) throw new Error("Linked recovery storage is not supported");
      if (stat.isDirectory()) { for (const entry of readdirSync(path)) countBytes(join(path, entry)); }
      else if (stat.isFile()) total += stat.size;
      else throw new Error("Unsupported recovery storage");
    }
    countBytes(parent);
    const saved = current.state.state.plugins.find(plugin => plugin.id === current.manifest.id);
    const payload = { installPackage: { kind: "atlas.runtime.plugin.install-package",
      plugin: { id: current.manifest.id, name: current.manifest.name || current.manifest.id, version: current.manifest.version,
        nameI18n: current.manifest.nameI18n, description: current.manifest.description, descriptionI18n: current.manifest.descriptionI18n,
        provides: current.manifest.capabilities ?? current.manifest.provides ?? [], compatibility: current.manifest.compatibility },
      files: current.files.map(file => ({ path: file.path, content: file.content.toString("base64"), contentEncoding: "base64" })) },
      catalogCompatibility: saved?.compatibility, previousMetadata: saved ?? null };
    const backupId = randomUUID(), directory = join(parent, backupId);
    const data = { kind: "atlas.plugin.recovery", version: 1, pluginId: current.manifest.id, backupId,
      createdAt: new Date().toISOString(), payload, sha256: digest(JSON.stringify(payload)) };
    const serialized = JSON.stringify(data);
    if (total + Buffer.byteLength(serialized) > 256 * 1024 * 1024 || readdirSync(parent).length >= 200) throw new Error("Recovery storage full; preserve backups before maintenance");
    mkdirSync(directory, { mode: 0o700 });
    try {
      writeFileSync(join(directory, "backup.json"), serialized, { flag: "wx", mode: 0o600 });
      read(current.manifest.id, backupId);
    } catch (error) {
      // Only this new, incomplete snapshot is disposable; installed files are untouched.
      rmSync(directory, { recursive: true, force: true }); throw error;
    }
    return { directory, backupId };
  }
  function restoreFile(path, previous) {
    if (previous === undefined) { if (existsSync(path)) rmSync(path); return; }
    const temporary = `${path}.recovery-${randomUUID()}`;
    writeFileSync(temporary, previous, { mode: 0o600, flag: "wx" }); renameSync(temporary, path);
  }
  function commit({ id, plugin, manifest, current, stagingDirectory, expected, candidateDigest, catalogCompatibility, restoreMetadata }) {
    const fresh = inspect(id);
    if (fresh.fingerprint !== current.fingerprint || (expected && (expected.fingerprint !== fresh.fingerprint
      || expected.candidateDigest !== candidateDigest))) throw conflict();
    const backup = retain(fresh);
    const stateBytes = existsSync(managementPath) ? readFileSync(managementPath) : undefined;
    const removedBytes = existsSync(removedPath) ? readFileSync(removedPath) : undefined;
    let previous, installed = false;
    try {
      if (existsSync(fresh.destination)) {
        previous = join(backup.directory, "previous"); renameSync(fresh.destination, previous);
      }
      renameSync(stagingDirectory, fresh.destination); installed = true;
      const stored = fresh.state.state.plugins.find(item => item.id === id);
      if (fresh.state.initialized && stored) {
        const next = { ...fresh.state.state, plugins: fresh.state.state.plugins.map(item => item.id === id ? {
          ...item, ...restoreMetadata, version: plugin.version, name: plugin.name, nameI18n: plugin.nameI18n ?? item.nameI18n,
          description: plugin.description ?? item.description, descriptionI18n: plugin.descriptionI18n ?? item.descriptionI18n,
          capabilities: manifest.capabilities ?? manifest.provides ?? plugin.provides ?? [], provides: manifest.capabilities ?? manifest.provides ?? plugin.provides ?? [],
          compatibility: catalogCompatibility ?? manifest.compatibility ?? plugin.compatibility ?? item.compatibility,
        } : item) };
        const result = managementStore.change({ action: "update", revision: fresh.state.revision, state: next });
        if (result.conflict) throw conflict();
      }
      const removed = removedBytes ? JSON.parse(removedBytes.toString("utf8")) : [];
      if (!Array.isArray(removed)) throw new Error("Invalid removed-plugin state");
      restoreFile(removedPath, Buffer.from(JSON.stringify(removed.filter(slug => slug !== fresh.slug).sort(), null, 2)));
    } catch (error) {
      try {
        if (installed && existsSync(fresh.destination)) rmSync(fresh.destination, { recursive: true, force: true });
        if (previous && existsSync(previous)) renameSync(previous, fresh.destination);
        restoreFile(managementPath, stateBytes); restoreFile(removedPath, removedBytes);
      } catch { throw new Error("Recovery needs attention; retained backup is available. Reload before continuing."); }
      throw error;
    }
    // Package backup is retained; temporary rename copy is no longer needed.
    if (previous) { try { rmSync(previous, { recursive: true, force: true }); } catch { /* Keep recovery material. */ } }
    return { backupId: backup?.backupId ?? null };
  }
  return { inspect, preview, read, list, commit, recoveryRoot };
}
