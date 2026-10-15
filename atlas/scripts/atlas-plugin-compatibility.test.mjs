import assert from "node:assert/strict";
import test from "node:test";
import { checkPluginCompatibility, compatibilityHostContext } from "./atlas-plugin-compatibility.mjs";

const context = { atlas: "0.1.302", hosts: compatibilityHostContext("linux-installer") };
test("runtime requirements use real SemVer including zero-major and prerelease boundaries", () => {
  const check = (range, version = context.atlas) => checkPluginCompatibility({ manifest: { atlas: range } }, { ...context, atlas: version }).status;
  assert.equal(check(">=0.1.30 <0.2.0"), "supported");
  assert.equal(check("^0.1.0 || ^1.0.0"), "supported");
  assert.equal(check("^0.0.3", "0.0.4"), "unsupported");
  assert.equal(check(">=0.1.0", "0.2.0-alpha.1"), "unsupported");
  assert.equal(check(">=0.2.0-alpha.1", "0.2.0-alpha.2"), "supported");
  assert.equal(check("nonsense"), "unsupported");
});
test("all declarations constrain the candidate; missing legacy metadata stays unknown", () => {
  assert.equal(checkPluginCompatibility({}, context).status, "unknown");
  assert.equal(checkPluginCompatibility({ catalog: {}, manifest: { atlas: ">=9" } }, context).status, "unsupported");
  assert.equal(checkPluginCompatibility({ catalog: { atlas: ">=9" }, manifest: { atlas: "*" } }, context).status, "unsupported");
  assert.equal(checkPluginCompatibility({ package: { atlas: 12 } }, context).status, "unsupported");
  assert.equal(checkPluginCompatibility({ manifest: { futureContract: "v2" } }, context).status, "unknown");
});
test("host alternatives, legacy names and unknown HA versions are explicit", () => {
  assert.equal(checkPluginCompatibility({ manifest: { host: ["linux", "docker"] } }, context).status, "supported");
  assert.equal(checkPluginCompatibility({ manifest: { host: "administration-local" } }, context).status, "supported");
  assert.equal(checkPluginCompatibility({ manifest: { host: "homeassistant" } }, context).status, "unsupported");
  assert.equal(checkPluginCompatibility({ manifest: { host: [] } }, context).status, "unsupported");
  assert.equal(checkPluginCompatibility({ manifest: { homeAssistant: ">=2026.8" } }, context).status, "unknown");
  assert.equal(checkPluginCompatibility({ manifest: { homeAssistant: ">=2026.8" } }, { ...context, homeAssistant: "2026.10.1" }).status, "supported");
  assert.equal(checkPluginCompatibility({ manifest: { homeassistant: ">=2027" } }, { ...context, homeAssistant: "2026.10.1" }).status, "unsupported");
});
