import assert from "node:assert/strict";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { prepareFileStudioRetention } from "./atlas-file-studio-retention.mjs";

function fixture(t, cleanup = true) {
  const root = mkdtempSync(join(tmpdir(), "atlas-retention-"));
  if (cleanup) t.after(() => rmSync(root, { recursive: true, force: true }));
  return { root, appRoot: join(root, "old-app"), pluginRoot: join(root, "persistent", "plugins") };
}
function put(path, bytes) { mkdirSync(resolve(path, ".."), { recursive: true }); writeFileSync(path, bytes); }

test("legacy retention copies once, preserves empty folders and never resurrects restored trash", t => {
  const options = fixture(t), source = join(options.appRoot, ".atlas-file-studio-trash", "entry");
  put(join(source, "entry.json"), '{"id":"entry"}');
  mkdirSync(join(source, "content"), { recursive: true });
  put(join(options.appRoot, ".atlas-file-studio-history", "config_file", "version.bak"), Buffer.from([0, 1, 255]));
  const historyFile = join(options.appRoot, ".atlas-file-studio-history", "config_file", "version.bak");
  utimesSync(historyFile, new Date("2025-01-02T00:00:00Z"), new Date("2025-01-02T00:00:00Z"));
  const result = prepareFileStudioRetention(options);
  assert.equal(result.copiedFiles, 2); assert.equal(result.migratedStores, 2);
  assert.ok(existsSync(join(result.trash, "entry", "content")));
  assert.deepEqual(readFileSync(join(result.history, "config_file", "version.bak")), Buffer.from([0, 1, 255]));
  assert.equal(statSync(join(result.history, "config_file", "version.bak")).mtimeMs, statSync(historyFile).mtimeMs);
  assert.equal(readFileSync(join(source, "entry.json"), "utf8"), '{"id":"entry"}');
  rmSync(join(result.trash, "entry"), { recursive: true });
  assert.equal(prepareFileStudioRetention(options).migratedStores, 0);
  assert.equal(existsSync(join(result.trash, "entry")), false);
});

test("conflicts block both stores before writes; identical partial copies resume safely", t => {
  const options = fixture(t);
  put(join(options.appRoot, ".atlas-file-studio-history", "key", "v.bak"), "history");
  put(join(options.appRoot, ".atlas-file-studio-trash", "entry", "entry.json"), "old");
  const dest = join(options.pluginRoot, ".file-studio", "trash", "entry", "entry.json");
  put(dest, "new");
  assert.throws(() => prepareFileStudioRetention(options), /conflict/);
  assert.equal(existsSync(join(options.pluginRoot, ".file-studio", "history")), false);
  assert.equal(readFileSync(dest, "utf8"), "new");
  writeFileSync(dest, "old");
  assert.equal(prepareFileStudioRetention(options).copiedFiles, 1);
  assert.equal(readFileSync(dest, "utf8"), "old");
});

test("explicit Linux/custom roots remain in use and overlapping roots are refused", t => {
  const options = fixture(t), historyRoot = join(options.root, "file-history"), trashRoot = join(options.root, "file-trash");
  put(join(historyRoot, "keep.bak"), "keep");
  const result = prepareFileStudioRetention({ ...options, historyRoot, trashRoot });
  assert.equal(result.history, historyRoot); assert.equal(result.trash, trashRoot);
  assert.equal(readFileSync(join(historyRoot, "keep.bak"), "utf8"), "keep");
  mkdirSync(join(options.appRoot, ".atlas-file-studio-history"), { recursive: true });
  assert.throws(() => prepareFileStudioRetention({ ...options, historyRoot: join(options.appRoot, ".atlas-file-studio-history", "nested") }), /overlap/);
});

test("real backend retains and restores trash/history after restart using only persistent plugin data", { timeout: 30000 }, async t => {
  const options = fixture(t, false), config = join(options.root, "config");
  put(join(config, "history.yaml"), "original: true\n"); put(join(config, "trash.txt"), "restore me");
  const surfaces = [createServer((req, res) => res.end("admin")), createServer((req, res) => res.end("editor"))];
  async function listen(server) { server.listen(0, "127.0.0.1"); await once(server, "listening"); return server.address().port; }
  const [adminPort, editorPort] = await Promise.all(surfaces.map(listen));
  const reservation = createServer(), port = await listen(reservation); await new Promise(done => reservation.close(done));
  const base = `http://127.0.0.1:${port}`;
  const env = { ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("ATLAS_"))),
    ATLAS_APP_HOST: "127.0.0.1", ATLAS_HOST: "127.0.0.1", ATLAS_APP_PORT: String(port),
    ATLAS_ADMIN_PORT: String(adminPort), ATLAS_DEMO_PORT: String(editorPort),
    ATLAS_PLUGIN_DATA_ROOT: options.pluginRoot, ATLAS_FILE_STUDIO_CONFIG_ROOT: config };
  let child, output = "";
  const stop = async () => { const current = child; child = undefined; if (current && current.exitCode === null && current.signalCode === null) { const exited = once(current, "exit"); current.kill(); await exited; } };
  t.after(async () => { await stop(); for (const server of surfaces) { server.closeAllConnections(); await new Promise(done => server.close(done)); } rmSync(options.root, { recursive: true, force: true }); });
  const start = async () => {
    child = spawn(process.execPath, [resolve(import.meta.dirname, "atlas-app-server.mjs")], { cwd: options.root, env, stdio: ["ignore", "pipe", "pipe"] });
    child.stdout.on("data", bytes => output += bytes); child.stderr.on("data", bytes => output += bytes);
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline) { if (child.exitCode !== null) throw Error(output); if (await fetch(base + "/health").then(r => r.ok).catch(() => false)) return; await new Promise(done => setTimeout(done, 50)); }
    throw Error("Retention fixture readiness failed: " + output);
  };
  const api = async (path, body) => { const response = await fetch(base + "/api/file-studio/" + path, { method: body ? "POST" : "GET", headers: { Origin: base, "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) }); assert.equal(response.status, 200); return response.json(); };
  await start();
  await api("upload", { parentPath: "/config", name: "history.yaml", overwrite: true, contentBase64: Buffer.from("edited: true\n").toString("base64") });
  const history = await api("history?path=/config/history.yaml"); assert.equal(history.versions.length, 1);
  await api("delete", { path: "/config/trash.txt" }); const trash = await api("trash"); assert.equal(trash.entries.length, 1);
  await stop(); await start();
  assert.deepEqual(await api("history?path=/config/history.yaml"), history); assert.deepEqual(await api("trash"), trash);
  await api("trash/restore", { id: trash.entries[0].id }); assert.equal(readFileSync(join(config, "trash.txt"), "utf8"), "restore me");
  await api("history/restore", { path: "/config/history.yaml", backupName: history.versions[0].name });
  assert.equal(readFileSync(join(config, "history.yaml"), "utf8"), "original: true\n");
  assert.equal((await api("history?path=/config/history.yaml")).versions.length, 2);
});
