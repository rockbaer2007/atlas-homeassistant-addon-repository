import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createEditorProjectStore, normalizeEditorProject } from "./atlas-editor-project-store.mjs";
const project = { name: "Original", fields: [{ id: "keep", target: "button", column: 2, row: 3, rawCardConfiguration: { type: "custom:button-card", styles: { card: ["color: red"] } } }], surfaceSize: { columns: 2, rows: 4 }, gridCellSize: 52, scriptFilename: "" };
function fixture(t) { const root = mkdtempSync(join(tmpdir(), "atlas-projects-")); t.after(() => rmSync(root, { recursive: true, force: true })); const path = join(root, "projects.json"); return { root, path, store: createEditorProjectStore(path) }; }
test("preview does not write; save and restart preserve nested card data", t => {
  const { store, path } = fixture(t); const input = { id: "original", revision: 0, project };
  assert.equal(store.inspect(input).project.fields[0].rawCardConfiguration.type, "custom:button-card");
  assert.equal(store.read().projects.length, 0); store.save(input);
  assert.deepEqual(createEditorProjectStore(path).read().projects[0].project, project);
  const before = readFileSync(path); assert.equal(store.save({ ...input, project: { ...project, fields: [] } }).conflict, true); assert.deepEqual(readFileSync(path), before);
});
test("updates back up the previous file; independent projects remain intact", t => {
  const { store, path, root } = fixture(t); store.save({ id: "first", revision: 0, project });
  store.save({ id: "second", revision: 0, project: { ...project, name: "Other" } }); const before = readFileSync(path);
  store.save({ id: "first", revision: 1, project: { ...project, name: "Changed" } });
  assert.equal(store.read().projects.find(entry => entry.id === "second").project.name, "Other");
  const backups = readdirSync(join(root, "backups")).sort(); assert.deepEqual(readFileSync(join(root, "backups", backups.at(-1), "projects.json")), before);
  store.backup(project); const backup = JSON.parse(readFileSync(join(root, "workspaces", readdirSync(join(root, "workspaces"))[0]), "utf8")); assert.deepEqual(backup.project, project);
});
test("invalid and corrupt data do not overwrite projects; Admin secrets excluded", t => {
  const { store, path } = fixture(t); writeFileSync(path, "damaged"); assert.throws(() => store.save({ id: "new", revision: 0, project })); assert.equal(readFileSync(path, "utf8"), "damaged");
  assert.equal(JSON.stringify(normalizeEditorProject({ ...project, token: "secret", url: "private-admin" })).includes("secret"), false);
  assert.throws(() => normalizeEditorProject({ ...project, fields: [null] }));
  assert.throws(() => normalizeEditorProject(JSON.parse('{"name":"X","fields":[{"__proto__":{}}]}')));
});
