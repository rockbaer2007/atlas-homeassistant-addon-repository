import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { discoverHomeAssistantVersion, normalizeHomeAssistantVersion } from "./atlas-homeassistant-version.mjs";
import { checkPluginCompatibility } from "./atlas-plugin-compatibility.mjs";

test("HA versions retain stable, beta, rc and development boundaries", () => {
  for (const [raw, expected] of [["2026.10.1", "2026.10.1"], ["2026.10.0b2", "2026.10.0-beta.2"],
    ["2026.10.0rc1", "2026.10.0-rc.1"], ["2026.11.0.dev20261015", "2026.11.0-dev.20261015"],
    ["2026.10.0-beta.2", "2026.10.0-beta.2"], ["2026.10", undefined], ["not a version", undefined],
    [42, undefined], ["2026.10.01", undefined]]) {
    assert.equal(normalizeHomeAssistantVersion(raw), expected, String(raw));
  }
  assert.equal(checkPluginCompatibility({ manifest: { homeAssistant: ">=2026.10" } }, {
    homeAssistant: normalizeHomeAssistantVersion("2026.10.0b2"),
  }).status, "unsupported");
});

test("discovery uses only configured credentials and exposes only verified version metadata", async () => {
  const token = "private-fixture-token";
  const result = await discoverHomeAssistantVersion({ url: "http://example.invalid:80/dashboard?query=private#hash", token }, {
    fetchImpl: async (url, options) => {
      assert.equal(url.href, "http://example.invalid/api/config");
      assert.equal(options.headers.authorization, `Bearer ${token}`);
      assert.equal(options.redirect, "error");
      assert.ok(options.signal instanceof AbortSignal);
      return Response.json({ version: "2026.10.0b2", location_name: "private location", token });
    },
  });
  assert.deepEqual(result, { status: "available", source: "admin-rest", version: "2026.10.0-beta.2", rawVersion: "2026.10.0b2" });
  assert.ok(!JSON.stringify(result).includes(token));
});

test("unconfigured, invalid, unauthorized and failed requests remain unknown without leaking payloads", async () => {
  for (const settings of [undefined, {}, { url: "http://example.invalid" }, { token: "private" },
    { url: "file:///etc/passwd", token: "private" }, { url: "http://user:private@example.invalid", token: "private" }]) {
    const result = await discoverHomeAssistantVersion(settings, { fetchImpl: () => { throw new Error("must not fetch"); } });
    assert.equal(result.status, "unavailable");
    assert.equal(result.version, undefined);
  }
  for (const fetchImpl of [
    async () => new Response("private remote error", { status: 401 }),
    async () => new Response("private remote error", { status: 503 }),
    async () => new Response("private invalid JSON"),
    async () => Response.json({ version: "private invalid version" }),
    async () => Response.json({ version: "2026.10.1", extra: "x".repeat(256 * 1024) }),
    async () => { throw new Error("private network error"); },
  ]) {
    const result = await discoverHomeAssistantVersion({ url: "http://example.invalid", token: "private" }, { fetchImpl });
    assert.equal(result.status, "unavailable");
    assert.equal(result.version, undefined);
    assert.ok(!JSON.stringify(result).includes("private"));
  }
});

async function listen(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return server.address().port;
}

test("real Administration fetches fresh authenticated HA versions and forgets failures and changed connections", { timeout: 20000 }, async () => {
  let mode = "2026.10.1";
  let requests = 0;
  const token = "fixture-secret-".repeat(8);
  const ha = createServer((req, res) => {
    requests++;
    assert.equal(req.url, "/api/config");
    assert.equal(req.headers.authorization, `Bearer ${token}`);
    if (mode === "timeout") return;
    if (mode === "redirect") { res.writeHead(302, { location: "/private-redirect" }); res.end(); return; }
    if (mode === "unauthorized") { res.writeHead(401); res.end("private refusal"); return; }
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ version: mode, latitude: 99, location_name: "private location" }));
  });
  let child;
  try {
    const haPort = await listen(ha);
    const reservation = createServer();
    const port = await listen(reservation);
    await new Promise(done => reservation.close(done));
    const base = `http://127.0.0.1:${port}`;
    let output = "";
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("ATLAS_") && key !== "SUPERVISOR_TOKEN"));
    child = spawn(process.execPath, [fileURLToPath(new URL("../examples/admin-demo/server.mjs", import.meta.url))], {
      env: { ...env, ATLAS_ADMIN_HOST: "127.0.0.1", ATLAS_ADMIN_PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.on("data", chunk => { output += chunk; });
    child.stderr.on("data", chunk => { output += chunk; });
    const deadline = Date.now() + 8000;
    while (true) {
      if (await fetch(`${base}/api/homeassistant/version`).then(r => r.ok).catch(() => false)) break;
      if (child.exitCode !== null || Date.now() > deadline) throw new Error(`Admin readiness failed: ${output}`);
      await new Promise(done => setTimeout(done, 30));
    }
    const version = () => fetch(`${base}/api/homeassistant/version`).then(r => r.json());
    const configure = settings => fetch(`${base}/api/admin-connection`, {
      method: "PUT", body: JSON.stringify(settings), headers: { "content-type": "application/json" },
    });
    assert.deepEqual(await version(), { status: "unavailable", reason: "not-configured" });
    assert.equal(requests, 0);
    assert.equal((await configure({ url: `http://127.0.0.1:${haPort}`, token })).status, 200);
    assert.equal((await version()).version, "2026.10.1");
    mode = "2027.1.0";
    assert.equal((await version()).version, "2027.1.0");
    mode = "unauthorized";
    assert.deepEqual(await version(), { status: "unavailable", reason: "unauthorized" });
    mode = "redirect";
    const beforeRedirect = requests;
    assert.deepEqual(await version(), { status: "unavailable", reason: "request-failed" });
    assert.equal(requests, beforeRedirect + 1);
    mode = "timeout";
    assert.deepEqual(await version(), { status: "unavailable", reason: "timeout" });
    await configure({ url: "http://other.invalid", token: "" });
    assert.deepEqual(await version(), { status: "unavailable", reason: "not-configured" });
    assert.ok(!output.includes(token));
    assert.ok(!output.includes("private location"));
  } finally {
    if (child && child.exitCode === null) { const stopped = once(child, "exit"); child.kill(); await stopped; }
    ha.closeAllConnections();
    await new Promise(done => ha.close(done));
  }
});
