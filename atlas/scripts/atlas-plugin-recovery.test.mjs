import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, truncateSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createHash } from "node:crypto";
import { createPluginRecovery, pluginCandidateDigest } from "./atlas-plugin-recovery.mjs";
import { createPluginManagementStore } from "./atlas-plugin-management-store.mjs";
const id = "atlas.plugin.recoverable", slug = "recoverable";
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "atlas-recovery-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const pluginRoot = join(root, "plugins"), bundledRoot = join(root, "bundled"), managementPath = join(pluginRoot, ".management", "state.json"), removedPath = join(pluginRoot, ".removed-plugins.json");
  mkdirSync(join(pluginRoot, slug), { recursive: true }); mkdirSync(bundledRoot);
  const manifest = { id, name: "Original", version: "1.0.0", capabilities: ["original.read"], entry: `/plugin-assets/${slug}/index.html` };
  writeFileSync(join(pluginRoot, slug, "atlas-plugin.json"), JSON.stringify(manifest));
  writeFileSync(join(pluginRoot, slug, "index.html"), "original\r\n");
  writeFileSync(join(pluginRoot, slug, "asset.png"), Buffer.from([0, 1, 254, 255])); writeFileSync(removedPath, '[]');
  const managementStore = createPluginManagementStore(managementPath);
  managementStore.change({ action: "merge", revision: 0, state: { repositories: [{ id: "own", url: "https://example.org/Repo.json" }],
    plugins: [{ id, name: "Original", version: "1.0.0", source: "repository", compatibility: { homeAssistant: ">=2026.10" } }], activePluginIds: [] } });
  const options = { pluginRoot, bundledRoot, managementPath, removedPath, managementStore };
  return { root, ...options, recovery: createPluginRecovery(options), manifest };
}
function candidate(f, version = "2.0.0") {
  const manifest = { ...f.manifest, name: "Updated", version, capabilities: ["new.read"] };
  const plugin = { id, name: manifest.name, version, provides: manifest.capabilities };
  const files = [{ path: "atlas-plugin.json", content: Buffer.from(JSON.stringify(manifest)) }, { path: "index.html", content: Buffer.from("new") }];
  const current = f.recovery.inspect(id), candidateDigest = pluginCandidateDigest(plugin, files);
  const stagingDirectory = mkdtempSync(join(f.pluginRoot, ".install-test-"));
  for (const file of files) writeFileSync(join(stagingDirectory, file.path), file.content);
  return { id, manifest, plugin, current, stagingDirectory, candidateDigest, expected: f.recovery.preview(current, plugin, candidateDigest).expected };
}
test("retains exact binary package and keeps activation/repositories while updating shared version", t => {
  const f = fixture(t), before = f.managementStore.read(), result = f.recovery.commit(candidate(f));
  const after = f.managementStore.read(); assert.equal(after.state.plugins[0].version, "2.0.0");
  assert.deepEqual(after.state.activePluginIds, before.state.activePluginIds); assert.deepEqual(after.state.repositories, before.state.repositories);
  assert.deepEqual(after.state.plugins[0].compatibility, { homeAssistant: ">=2026.10" });
  const files = f.recovery.read(id, result.backupId).payload.installPackage.files;
  assert.equal(Buffer.from(files.find(x => x.path === "index.html").content, "base64").toString(), "original\r\n");
  assert.deepEqual(Buffer.from(files.find(x => x.path === "asset.png").content, "base64"), Buffer.from([0, 1, 254, 255]));
  assert.equal(f.recovery.list(id)[0].version, "1.0.0");
  assert.equal(existsSync(join(f.recovery.recoveryRoot, slug, result.backupId, "previous")), false);
});
test("metadata failure restores exact original files and state; recovery material is retained", t => {
  const f = fixture(t), before = readFileSync(f.managementPath);
  const broken = { read: f.managementStore.read, change() { writeFileSync(f.managementPath, "partial"); throw new Error("fixture metadata failure"); } };
  f.recovery = createPluginRecovery({ ...f, managementStore: broken });
  assert.throws(() => f.recovery.commit(candidate(f)), /fixture metadata failure/);
  assert.deepEqual(readFileSync(f.managementPath), before);
  assert.equal(readFileSync(join(f.pluginRoot, slug, "index.html"), "utf8"), "original\r\n");
  assert.deepEqual(readFileSync(join(f.pluginRoot, slug, "asset.png")), Buffer.from([0, 1, 254, 255])); assert.equal(f.recovery.list(id).length, 1);
});
test("stale shared state and altered candidate reject before replacement or backup", t => {
  const f = fixture(t), c = candidate(f), state = f.managementStore.read();
  f.managementStore.change({ action: "update", revision: state.revision, state: { ...state.state, activePluginIds: [id] } });
  assert.throws(() => f.recovery.commit(c), error => error.statusCode === 409); assert.equal(f.recovery.list(id).length, 0);
  const next = candidate(f); next.expected.candidateDigest = "forged";
  assert.throws(() => f.recovery.commit(next), error => error.statusCode === 409);
  assert.equal(readFileSync(join(f.pluginRoot, slug, "index.html"), "utf8"), "original\r\n");
});
test("corrupt backups, foreign ids and invalid paths fail closed", t => {
  const f = fixture(t), result = f.recovery.commit(candidate(f));
  assert.throws(() => f.recovery.read(id, "../state")); assert.throws(() => f.recovery.read("atlas.plugin.other", result.backupId));
  assert.throws(() => f.recovery.inspect("atlas.plugin.homeassistant-card-editor"));
  const path = join(f.recovery.recoveryRoot, slug, result.backupId, "backup.json");
  const data = JSON.parse(readFileSync(path, "utf8")); data.payload.installPackage.files[0].content = "tampered"; writeFileSync(path, JSON.stringify(data));
  assert.throws(() => f.recovery.read(id, result.backupId), /Damaged/); assert.equal(readFileSync(join(f.pluginRoot, slug, "index.html"), "utf8"), "new");
  data.payload.installPackage.plugin.id = "atlas.plugin.foreign";
  data.sha256 = createHash("sha256").update(JSON.stringify(data.payload)).digest("hex"); writeFileSync(path, JSON.stringify(data));
  assert.throws(() => f.recovery.read(id, result.backupId), /Damaged/);
});
test("SemVer version direction distinguishes downgrade and same-version replacement", t => {
  const f = fixture(t), c = candidate(f, "0.9.0");
  assert.equal(f.recovery.preview(c.current, c.plugin, c.candidateDigest).direction, "downgrade");
  assert.equal(f.recovery.preview(c.current, { ...c.plugin, version: "1.0.0" }, c.candidateDigest).direction, "replace");
  assert.equal(f.recovery.preview(c.current, { ...c.plugin, version: "1.10.0" }, c.candidateDigest).direction, "upgrade");
  assert.equal(f.recovery.preview(f.recovery.inspect("atlas.plugin.new"), c.plugin, c.candidateDigest).backupRequired, false);
});
test("full recovery storage or linked plugin files block without changing original assets/state", t => {
  const f = fixture(t), before = readFileSync(f.managementPath), c = candidate(f);
  const directory = join(f.recovery.recoveryRoot, slug, "00000000-0000-0000-0000-000000000000");
  mkdirSync(directory, { recursive: true }); const path = join(directory, "backup.json");
  writeFileSync(path, ""); truncateSync(path, 256 * 1024 * 1024);
  assert.throws(() => f.recovery.commit(c), /storage full/);
  assert.deepEqual(readFileSync(f.managementPath), before);
  assert.equal(readFileSync(join(f.pluginRoot, slug, "index.html"), "utf8"), "original\r\n");
  mkdirSync(join(f.root, "outside"));
  symlinkSync(join(f.root, "outside"), join(f.pluginRoot, slug, "linked"), process.platform === "win32" ? "junction" : "dir");
  assert.throws(() => f.recovery.inspect(id), /Unsupported|Linked/);
});
