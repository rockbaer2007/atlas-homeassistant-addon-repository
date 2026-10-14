import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

// Pure target construction is also used by the real Web Component.
globalThis.HTMLElement = class {};
globalThis.customElements = { get: () => true };
const { runtimeTarget, AtlasRuntimePanel } = await import("../custom_components/atlas_frontend/frontend/atlas-homeassistant-panel.js");

test("runtime routes retain reverse-proxy prefix, explicit port 80 and locale", () => {
  assert.deepEqual(runtimeTarget("http://atlas.local:80/proxy/atlas/", "editor", "fr", "dark", "http://ha.local/atlas-runtime"), {
    url: "http://atlas.local/proxy/atlas/editor?language=fr&theme=dark", mixed: false,
  });
  assert.equal(runtimeTarget("http://[::1]:4176", "admin", "xx", "auto", "http://ha.local/").url, "http://[::1]:4176/admin?language=en&theme=light");
});

test("reject credentials, embedded HA root, unsafe schemes and path traversal", () => {
  for (const value of ["javascript:alert(1)", "//atlas.local", "http://user:secret@atlas.local", "http://atlas.local/?token=secret", "http://atlas.local/#secret", "http://atlas.local/a/../", "http://atlas.local/a\\b", "http://atlas.local/%2e%2e/", "http://ha.local/"]) {
    assert.throws(() => runtimeTarget(value, "hub", "de", "dark", "http://ha.local/atlas-runtime"));
  }
  assert.throws(() => runtimeTarget("http://atlas.local/", "../api", "en", "light", "http://ha.local/"));
});

test("HTTPS HA detects mixed content but keeps a credential-free external link", () => {
  const target = runtimeTarget("http://atlas.local:4176/", "hub", "de", "light", "https://ha.local/");
  assert.equal(target.mixed, true);
  assert.equal(target.url, "http://atlas.local:4176/hub?language=de&theme=light");
});

test("HA state updates do not reload the ATLAS frame or retain HA credentials", () => {
  const panel = Object.create(AtlasRuntimePanel.prototype);
  panel._language = "de";
  panel._theme = "dark";
  let refreshes = 0;
  panel._refresh = () => refreshes++;
  for (let index = 0; index < 100; index++) panel.hass = { language: "de", themes: { darkMode: true }, auth: { accessToken: "never-forward" }, states: { index } };
  assert.equal(refreshes, 0);
  assert.equal(Object.hasOwn(panel, "_hass"), false);
  panel.hass = { language: "fr", themes: { darkMode: true } };
  assert.equal(refreshes, 1);
});

test("menu event crosses the panel shadow root without HA credentials", () => {
  const panel = Object.create(AtlasRuntimePanel.prototype);
  let event;
  panel.dispatchEvent = value => { event = value; };
  let stopped = false;
  panel._toggleMenu({ stopPropagation: () => { stopped = true; } });
  assert.equal(event.type, "hass-toggle-menu");
  assert.equal(event.bubbles, true);
  assert.equal(event.composed, true);
  assert.deepEqual(event.detail, { open: true });
  assert.equal(stopped, true);
});

test("combined runtime navigation retains mapped ports and reverse-proxy paths", () => {
  for (const [file, name] of [["examples/status-demo/app.js", "isHomeAssistantAppSurface"], ["examples/admin-demo/app.js", "isAppRouteSurface"]]) {
    const source = readFileSync(new URL("../" + file, import.meta.url), "utf8");
    const detection = source.match(new RegExp("function " + name + "\\(\\) \\{[\\s\\S]*?\\n\\}"))[0];
    const navigation = source.match(/function createAppRouteNavigationUrl\([^]*?\n\}/)[0];
    for (const url of ["http://atlas.local:4195/editor", "https://atlas.local/proxy/atlas/admin/", "http://atlas.local:80/hub", "https://ha.local/api/hassio_ingress/own-test/editor"]) {
      const context = { URL, window: { location: { href: url } } };
      assert.equal(runInNewContext(detection + ";" + name + "()", context), true);
      const target = new URL(runInNewContext(navigation + ';createAppRouteNavigationUrl("/admin")', context));
      assert.equal(target.origin, new URL(url).origin);
      assert.ok(target.pathname.endsWith("/admin"));
      assert.equal(target.pathname.replace(/admin$/, ""), new URL(url).pathname.replace(/(?:editor|admin|hub)\/?$/, ""));
    }
    assert.equal(runInNewContext(detection + ";" + name + "()", { URL, window: { location: { href: "http://localhost:4174/" } } }), false);
  }
});
