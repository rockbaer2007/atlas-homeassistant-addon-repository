import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createPluginManagementStore } from "./atlas-plugin-management-store.mjs";
import { normalizePluginManagement } from "../examples/admin-demo/plugin-management-model.mjs";

const plugin = { id: "atlas.plugin.keep", name: "Keep", version: "1.0.0", source: "repository", repositoryUrl: "https://example.org/Repo.json" };
const state = (active = true) => ({ repositories: [{ id: "keep", url: "https://example.org/Repo.json", name: "Keep", type: "plugin" }],
  plugins: [plugin], activePluginIds: active ? [plugin.id] : [] });

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "atlas-shared-management-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const path = join(root, "state.json");
  return { root, path, store: createPluginManagementStore(path) };
}

test("preview is read-only; first adoption and restart retain settings with backups", t => {
  const { store, path, root } = fixture(t);
  assert.equal(store.read().initialized, false);
  const preview = store.change({ action: "preview", revision: 0, state: state() });
  assert.equal(preview.preview.plugins.length, 1);
  assert.equal(store.read().initialized, false);
  const saved = store.change({ action: "merge", revision: 0, state: state() });
  assert.equal(saved.revision, 1);
  assert.deepEqual(createPluginManagementStore(path).read().state, saved.state);
  assert.equal(readdirSync(join(root, "backups")).length, 1);
  const original = readFileSync(path);
  assert.equal(store.change({ action: "update", revision: 0, state: state(false) }).conflict, true);
  assert.deepEqual(readFileSync(path), original);
});

test("merge retains server-only entries; conflicts default to existing activation", t => {
  const { store, root, path } = fixture(t);
  store.change({ action: "merge", revision: 0, state: state(false) });
  const incoming = state(); incoming.plugins[0] = { ...plugin, version: "2.0.0" };
  incoming.repositories.push({ id: "another", url: "https://example.org/Another.json" });
  const preview = store.change({ action: "preview", revision: 1, state: incoming });
  assert.equal(preview.conflicts.length, 2);
  const saved = store.change({ action: "merge", revision: 1, state: incoming });
  assert.deepEqual(saved.state.activePluginIds, []);
  assert.equal(saved.state.plugins[0].version, "1.0.0");
  assert.equal(saved.state.repositories.length, 2);
  const before = readFileSync(path);
  const local = store.change({ action: "merge", revision: 2, state: incoming, preference: "local" });
  assert.deepEqual(local.state.activePluginIds, [plugin.id]);
  const backups = readdirSync(join(root, "backups")).sort();
  assert.deepEqual(readFileSync(join(root, "backups", backups.at(-1), "state.json")), before);
  const empty = { repositories: [], plugins: [], activePluginIds: [] };
  assert.deepEqual(store.change({ action: "merge", revision: 3, state: empty }).state, local.state);
});

test("corrupt state cannot be silently replaced", t => {
  const { store, path } = fixture(t);
  writeFileSync(path, "broken user state");
  assert.throws(() => store.change({ action: "merge", revision: 0, state: state() }));
  assert.equal(readFileSync(path, "utf8"), "broken user state");
});

test("metadata excludes credentials, files, browser assets and retains case-sensitive URLs", () => {
  const incoming = state();
  incoming.token = "secret"; incoming.repositories[0].apiKey = "secret";
  incoming.plugins[0] = { ...plugin, files: [{ content: "secret" }], token: "secret", iconUrl: "http://host/api/hassio_ingress/private-session/logo.svg" };
  incoming.repositories.push({ id: "lower", url: "https://example.org/repo.json" });
  const clean = normalizePluginManagement(incoming);
  assert.equal(clean.repositories.length, 2);
  assert.equal(JSON.stringify(clean).includes("secret"), false);
  assert.equal(JSON.stringify(clean).includes("hassio_ingress"), false);
  for (const url of ["https://user:secret@example.org/", "https://example.org/?token=secret", "javascript:alert(1)", "http://ha/api/hassio_ingress/session/"]) {
    assert.throws(() => normalizePluginManagement({ ...state(), repositories: [{ url }] }));
  }
});
