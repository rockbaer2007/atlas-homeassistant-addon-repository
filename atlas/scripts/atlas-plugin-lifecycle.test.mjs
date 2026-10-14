import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import test from "node:test";

const pluginId = "atlas.plugin.a5-lifecycle-fixture";
const slug = "a5-lifecycle-fixture";

function installPackage(version) {
  const plugin = { id: pluginId, name: "A5 isolated fixture", version };
  return {
    kind: "atlas.runtime.plugin.install-package",
    plugin,
    files: [
      { path: "atlas-plugin.json", content: JSON.stringify({
        ...plugin, status: "active", entry: `/plugin-assets/${slug}/index.html`,
      }) },
      { path: "index.html", content: `<h1>fixture ${version}</h1>` },
    ],
  };
}

function statusCookie(status, version = "1.0.0") {
  return `atlas_plugin_catalog=${encodeURIComponent(JSON.stringify({
    plugins: [{ id: pluginId, slug, name: "A5 isolated fixture", version, status }],
  }))}`;
}

async function listen(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return server.address().port;
}

test("isolated app-server plugin lifecycle preserves projects and rejected updates", { timeout: 45000 }, async t => {
  const dataRoot = await mkdtemp(join(tmpdir(), "atlas-a5-lifecycle-"));
  // These readiness stubs keep the app server from starting child surfaces.
  // No installed Admin process, real Home Assistant or user data is involved.
  const surfaces = [createServer((req, res) => res.end("fixture admin")),
    createServer((req, res) => res.end("fixture editor"))];
  let child;
  let base;
  let output = "";
  try {
    const [adminPort, editorPort] = await Promise.all(surfaces.map(listen));
    const reservation = createServer();
    const appPort = await listen(reservation);
    await new Promise(done => reservation.close(done));
    base = `http://127.0.0.1:${appPort}`;
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("ATLAS_")));
    Object.assign(env, {
      ATLAS_APP_HOST: "127.0.0.1", ATLAS_APP_PORT: String(appPort),
      ATLAS_ADMIN_PORT: String(adminPort), ATLAS_DEMO_PORT: String(editorPort),
      ATLAS_PLUGIN_DATA_ROOT: join(dataRoot, "plugins"),
      ATLAS_FILE_STUDIO_CONFIG_ROOT: join(dataRoot, "config"),
      ATLAS_ADMIN_DEVICE_FILE: join(dataRoot, "admin-device.json"),
      ATLAS_INSTANCE_ID: "a5-isolated-lifecycle",
    });
    const projectPath = join(dataRoot, "original-project.json");
    const settingsPath = join(dataRoot, "original-settings.json");
    await writeFile(projectPath, '{"fields":[{"id":"existing","title":"Keep me"}]}');
    await writeFile(settingsPath, '{"language":"fr","theme":"dark"}');
    const projectBefore = await readFile(projectPath);
    const settingsBefore = await readFile(settingsPath);
    const start = async () => {
      output = "";
      child = spawn(process.execPath, [resolve(import.meta.dirname, "atlas-app-server.mjs")], {
        cwd: resolve(import.meta.dirname, ".."), env, stdio: ["ignore", "pipe", "pipe"],
      });
      child.stdout.on("data", chunk => { output += chunk; });
      child.stderr.on("data", chunk => { output += chunk; });
      const deadline = Date.now() + 10000;
      while (Date.now() < deadline) {
        if (child.exitCode !== null) throw new Error(`Fixture server exited: ${output}`);
        const ready = await fetch(`${base}/health`).then(r => r.ok).catch(() => false);
        if (ready) return;
        await new Promise(done => setTimeout(done, 50));
      }
      throw new Error(`Fixture server did not start: ${output}`);
    };
    const stop = async () => {
      if (!child || child.exitCode !== null) return;
      const exited = once(child, "exit");
      child.kill();
      await exited;
      child = undefined;
    };
    const request = (path, body, cookie) => fetch(`${base}${path}`, {
      method: body ? "POST" : "GET", redirect: "manual",
      headers: { origin: base, ...(body ? { "content-type": "application/json" } : {}),
        ...(cookie ? { cookie } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    await start();
    const catalogBefore = await request("/api/plugins").then(r => r.json());

    await t.test("install and launch the fixture through the real backend", async () => {
      const hub = await request("/hub");
      assert.equal(hub.status, 200);
      assert.match(await hub.text(), /Plugin Hub/);
      assert.equal((await request("/api/plugins/install", { installPackage: installPackage("1.0.0") })).status, 200);
      const launch = await request(`/launch/${pluginId}`);
      assert.equal(launch.status, 302);
      assert.equal(await fetch(launch.headers.get("location")).then(r => r.text()), "<h1>fixture 1.0.0</h1>");
      const localized = await request(`/launch/${slug}?theme=dark&language=fr`);
      assert.equal(localized.status, 302);
      assert.equal(new URL(localized.headers.get("location")).searchParams.get("theme"), "dark");
      assert.equal(new URL(localized.headers.get("location")).searchParams.get("language"), "fr");
    });

    await t.test("disabled and available plugins cannot launch through the direct route", async () => {
      for (const status of ["disabled", "available"]) {
        const cookie = statusCookie(status);
        const catalog = await request("/api/plugins", undefined, cookie).then(r => r.json());
        assert.equal(catalog.plugins.find(p => p.id === pluginId).status, status);
        assert.equal((await request(`/launch/${pluginId}`, undefined, cookie)).status, 404);
        assert.equal((await request(`/launch/${slug}`, undefined, cookie)).status, 404);
      }
      assert.equal((await request(`/launch/${pluginId}`, undefined, statusCookie("active"))).status, 302);
    });

    await t.test("rejected updates preserve the previously installed files", async () => {
      const invalid = installPackage("2.0.0");
      invalid.files.push({ path: "index.html", content: "conflicting duplicate" });
      assert.equal((await request("/api/plugins/install", { installPackage: invalid })).status, 400);
      assert.equal(await readFile(join(dataRoot, "plugins", slug, "index.html"), "utf8"), "<h1>fixture 1.0.0</h1>");
      assert.equal((await readdir(join(dataRoot, "plugins"))).some(p => p.startsWith(".install-")), false);
    });

    await t.test("updates and app restarts retain installed assets and status", async () => {
      assert.equal((await request("/api/plugins/install", { installPackage: installPackage("2.0.0") })).status, 200);
      await stop();
      await start();
      assert.equal(await request(`/plugin-assets/${slug}/index.html`).then(r => r.text()), "<h1>fixture 2.0.0</h1>");
      assert.equal((await request(`/launch/${pluginId}`, undefined, statusCookie("disabled", "2.0.0"))).status, 404);
    });

    await t.test("uninstall and package restore affect only the disposable fixture", async () => {
      assert.equal((await request("/api/plugins/uninstall", { pluginId })).status, 200);
      assert.equal((await request(`/launch/${pluginId}`)).status, 404);
      assert.equal((await request("/api/plugins/install", { installPackage: installPackage("1.0.0") })).status, 200);
      assert.equal((await request(`/launch/${pluginId}`)).status, 302);
      const catalogAfter = await request("/api/plugins").then(r => r.json());
      assert.deepEqual(catalogAfter.plugins.filter(p => p.id !== pluginId), catalogBefore.plugins);
      assert.deepEqual(await readFile(projectPath), projectBefore);
      assert.deepEqual(await readFile(settingsPath), settingsBefore);
    });
    await stop();
  } finally {
    if (child && child.exitCode === null && child.signalCode === null) {
      const exited = once(child, "exit");
      child.kill();
      await exited;
    }
    await Promise.all(surfaces.map(server => new Promise(done => {
      server.close(done);
      server.closeAllConnections();
    })));
    // Only the absolute, mkdtemp-created fixture directory is eligible for cleanup.
    assert.equal(resolve(dataRoot).startsWith(resolve(tmpdir()) + sep), true);
    await rm(dataRoot, { recursive: true, force: true });
  }
});
