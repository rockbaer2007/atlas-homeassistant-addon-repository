import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createAdminConnectionStore } from "./atlas-admin-connection-store.mjs";

test("encrypted store authenticates installation and payload; failed reads preserve bytes", t => {
  const dir = mkdtempSync(join(tmpdir(), "atlas-connection-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const path = join(dir, "connection.json");
  const value = { url: "http://fixture.invalid", token: "private-fixture-token", translationApiKeys: { chatgpt: "private-key" } };
  const store = createAdminConnectionStore(path, "installation-a");
  assert.equal(store.load(), undefined);
  store.save(value);
  assert.deepEqual(createAdminConnectionStore(path, "installation-a").load(), value);
  const bytes = readFileSync(path);
  assert.ok(!bytes.includes(Buffer.from(value.token)));
  assert.ok(!bytes.includes(Buffer.from("private-key")));
  if (process.platform !== "win32") {
    assert.equal(statSync(path).mode & 0o777, 0o600);
    assert.equal(statSync(path + ".key").mode & 0o777, 0o600);
  }
  assert.throws(() => createAdminConnectionStore(path, "installation-b").load());
  assert.deepEqual(readFileSync(path), bytes);
  const envelope = JSON.parse(bytes);envelope.data = Buffer.alloc(24).toString("base64");
  writeFileSync(path, JSON.stringify(envelope));assert.throws(() => store.load());
});

test("real Linux Administration restores credentials after process restart and honors forgetting", { timeout: 25000 }, async t => {
  const dir = mkdtempSync(join(tmpdir(), "atlas-admin-restart-"));
  let child;
  t.after(async () => { if (child && child.exitCode === null) { child.kill(); await once(child, "exit"); } rmSync(dir, { recursive: true, force: true }); });
  const reservation = createServer();reservation.listen(0, "127.0.0.1");await once(reservation, "listening");
  const port = reservation.address().port;await new Promise(resolve => reservation.close(resolve));
  const base = `http://127.0.0.1:${port}`;
  let output = "";
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("ATLAS_") && key !== "SUPERVISOR_TOKEN"));
  async function start() {
    child = spawn(process.execPath, [fileURLToPath(new URL("../examples/admin-demo/server.mjs", import.meta.url))], {
      env: { ...env, ATLAS_ADMIN_HOST: "127.0.0.1", ATLAS_ADMIN_PORT: String(port),
        ATLAS_DISTRIBUTION_TARGET: "linux-installer", ATLAS_ADMIN_DEVICE_FILE: join(dir, "admin-device.json"), ATLAS_INSTANCE_ID: "fixture-instance" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.on("data", chunk => { output += chunk; });child.stderr.on("data", chunk => { output += chunk; });
    for(let i = 0; i < 100; i++) {
      if (await fetch(base + "/api/admin-device").then(r => r.ok).catch(() => false)) return;
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    throw new Error("Administration not ready");
  }
  async function restart() { child.kill();await once(child, "exit");await start(); }
  const settings = { url: "http://fixture-ha.invalid:8123", token: "private-restart-fixture", rememberToken: true, autoConnectEditor: true,
    translationProvider: "chatgpt", translationApiKeys: { chatgpt: "private-provider-fixture" }, fileStudioAccess: { allowWwwPath: true } };
  const put = value => fetch(base + "/api/admin-connection", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(value) });
  const get = () => fetch(base + "/api/admin-connection?includeSecrets=1").then(r => r.json());
  await start();assert.equal((await put(settings)).status, 200);await restart();
  let restored = await get();
  for(const field of ["url", "token", "rememberToken", "autoConnectEditor"]) assert.equal(restored[field], settings[field]);
  assert.equal(restored.translationApiKeys.chatgpt, settings.translationApiKeys.chatgpt);
  assert.equal(restored.fileStudioAccess.allowWwwPath, true);
  assert.equal((await put({ ...settings, token: "", rememberToken: false, autoConnectEditor: false })).status, 200);
  await restart();restored = await get();assert.equal(restored.token, "");assert.equal(restored.rememberToken, false);
  const path = join(dir, "admin-connection.enc.json");writeFileSync(path, "invalid retained ciphertext");
  await restart();assert.equal((await put(settings)).status, 503);assert.equal(readFileSync(path, "utf8"), "invalid retained ciphertext");
  assert.ok(!output.includes(settings.token));assert.ok(!output.includes(settings.translationApiKeys.chatgpt));
});
