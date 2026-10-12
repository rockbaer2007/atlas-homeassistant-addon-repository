import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { collectPackageFiles, copyPackageFiles } from "./prepare-home-assistant-app.mjs";

test("source package preserves destination data and excludes local build artifacts", async () => {
  const target = await mkdtemp(resolve(tmpdir(), "atlas-package-test-"));
  try {
    await writeFile(resolve(target, "existing-user-data.json"), "preserve me");
    const files = await collectPackageFiles();
    assert.ok(files.some((file) => file.destination === "config.yaml"));
    assert.ok(files.some((file) => file.destination === "atlas-plugins/homeassistant-card-editor/atlas-plugin.json"));
    assert.ok(files.some((file) => file.destination === "scripts/atlas-app-server.mjs"));
    assert.ok(files.every((file) => !/(^|\/)(node_modules|dist|\.git|coverage)(\/|$)/.test(file.destination)));
    await copyPackageFiles(target);
    assert.equal(await readFile(resolve(target, "existing-user-data.json"), "utf8"), "preserve me");
    for (const file of files) {
      assert.deepEqual(await readFile(resolve(target, file.destination)), await readFile(file.source));
    }
  } finally {
    // mkdtemp returns a new test-owned directory; no user path is accepted here.
    await rm(target, { recursive: true, force: true });
  }
});

test("check rejects an incomplete repository without modifying it", async () => {
  const repository = await mkdtemp(resolve(tmpdir(), "atlas-package-check-"));
  try {
    await writeFile(resolve(repository, "repository.yaml"), "name: test");
    const result = spawnSync(process.execPath, [
      resolve(import.meta.dirname, "sync-home-assistant-app.mjs"),
      "--check", "--repository", repository,
    ], { encoding: "utf8" });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Package differs from canonical sources/);
    await assert.rejects(readFile(resolve(repository, "atlas/config.yaml")), { code: "ENOENT" });
  } finally {
    await rm(repository, { recursive: true, force: true });
  }
});
