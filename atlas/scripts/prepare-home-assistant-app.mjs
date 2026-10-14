import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
  { from: "custom_components/atlas_frontend", to: "custom_components/atlas_frontend" },
];

// All published copies use this inventory; local build output and dependencies
// must never replace the sources installed by the package Dockerfile.
const excludedDirectories = new Set(["node_modules", "dist", "build", "coverage", ".git", "output", "tmp", "__pycache__"]);

export async function collectPackageFiles() {
  const files = await collectFiles(sourceApp, "");
  for (const entry of sourceEntries) {
    const source = resolve(root, entry.from);
    if ((await stat(source)).isFile()) {
      files.push({ source, destination: entry.to });
    } else {
      files.push(...await collectFiles(source, entry.to));
    }
  }
  return files;
}

async function collectFiles(directory, prefix) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const source = resolve(directory, entry.name);
    const destination = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory() && !excludedDirectories.has(entry.name)) {
      files.push(...await collectFiles(source, destination));
    } else if (entry.isFile() && !entry.name.endsWith(".tsbuildinfo") && !entry.name.endsWith(".log")) {
      files.push({ source, destination });
    }
  }
  return files;
}

export async function copyPackageFiles(target) {
  for (const file of await collectPackageFiles()) {
    const destination = resolve(target, file.destination);
    await mkdir(dirname(destination), { recursive: true });
    await cp(file.source, destination);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await resetOutputDirectory();
  await copyPackageFiles(outputApp);
  console.log(`Prepared Home Assistant app package at ${relative(root, outputApp)}`);
  console.log("Copy that atlas folder into a Home Assistant /addons directory for local testing.");
}

async function resetOutputDirectory() {
  if (!outputApp.startsWith(outputRoot)) {
    throw new Error(`Refusing to delete unexpected path: ${outputApp}`);
  }

  await rm(outputApp, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
}
