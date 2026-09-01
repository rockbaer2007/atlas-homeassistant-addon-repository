import { cp, mkdir, rm } from "node:fs/promises";
import { relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const sourceApp = resolve(root, "packaging", "home-assistant-app", "atlas");
const outputRoot = resolve(root, "output", "home-assistant-app");
const outputApp = resolve(outputRoot, "atlas");
const sourceEntries = [
  { from: "package.json", to: "package.json" },
  { from: "pnpm-lock.yaml", to: "pnpm-lock.yaml" },
  { from: "pnpm-workspace.yaml", to: "pnpm-workspace.yaml" },
  { from: "tsconfig.base.json", to: "tsconfig.base.json" },
  { from: "packages", to: "packages" },
  { from: "atlas-plugins", to: "atlas-plugins" },
  { from: "examples/admin-demo", to: "examples/admin-demo" },
  { from: "examples/plugin-hub", to: "examples/plugin-hub" },
  { from: "examples/status-demo", to: "examples/status-demo" },
  { from: "scripts", to: "scripts" },
];

await resetOutputDirectory();
await cp(sourceApp, outputApp, { recursive: true });

for (const entry of sourceEntries) {
  await cp(resolve(root, entry.from), resolve(outputApp, entry.to), { recursive: true });
}

console.log(`Prepared Home Assistant app package at ${relative(root, outputApp)}`);
console.log("Copy that atlas folder into a Home Assistant /addons directory for local testing.");

async function resetOutputDirectory() {
  if (!outputApp.startsWith(outputRoot)) {
    throw new Error(`Refusing to delete unexpected path: ${outputApp}`);
  }

  await rm(outputApp, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
}
