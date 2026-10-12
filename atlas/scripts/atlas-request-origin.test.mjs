import test from "node:test";
import assert from "node:assert/strict";
import { isTrustedAtlasOrigin } from "./atlas-request-origin.mjs";

const ports = { adminPort: 4175, editorPort: 4174 };

test("accepts same-origin and local Atlas surfaces", () => {
  assert.equal(isTrustedAtlasOrigin({
    headers: { origin: "http://ha.local:8123", host: "ha.local:8123" },
  }, ports), true);
  assert.equal(isTrustedAtlasOrigin({
    headers: { origin: "http://ha.local:4175", host: "ha.local:4176" },
  }, ports), true);
});

test("accepts Home Assistant Ingress when forwarded origin matches", () => {
  assert.equal(isTrustedAtlasOrigin({
    socket: { remoteAddress: "::ffff:172.30.32.1" },
    headers: {
      origin: "http://192.168.178.197:8123",
      host: "172.30.32.1:4176",
      "x-ingress-path": "/api/hassio_ingress/opaque-token",
      "x-hass-source": "core.ingress",
      "x-forwarded-host": "192.168.178.197:8123",
      "x-forwarded-proto": "http",
    },
  }, ports), true);
});

test("rejects forged, malformed, or mismatched ingress metadata", () => {
  const headers = {
    origin: "http://192.168.178.197:8123",
    host: "172.30.32.1:4176",
    "x-ingress-path": "/api/hassio_ingress/opaque-token",
    "x-hass-source": "core.ingress",
    "x-forwarded-host": "attacker.example",
    "x-forwarded-proto": "http",
  };
  const socket = { remoteAddress: "172.30.32.1" };
  assert.equal(isTrustedAtlasOrigin({ socket, headers }, ports), false);
  assert.equal(isTrustedAtlasOrigin({ socket, headers: { ...headers, "x-hass-source": "external" } }, ports), false);
  assert.equal(isTrustedAtlasOrigin({ socket, headers: { ...headers, "x-ingress-path": "/elsewhere" } }, ports), false);
  assert.equal(isTrustedAtlasOrigin({ socket: { remoteAddress: "172.30.32.2" }, headers: {
    ...headers,
    "x-forwarded-host": "192.168.178.197:8123",
  } }, ports), false);
  assert.equal(isTrustedAtlasOrigin({ socket: { remoteAddress: "192.168.178.20" }, headers: {
    ...headers,
    "x-forwarded-host": "192.168.178.197:8123",
  } }, ports), false);
});
