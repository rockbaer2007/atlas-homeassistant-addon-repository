import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { collectPackageFiles, copyPackageFiles } from "./prepare-home-assistant-app.mjs";

const root = resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const check = args.includes("--check");
const repositoryIndex = args.indexOf("--repository");
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === "--check") continue;
  if (args[index] === "--repository" && args[index + 1] && !args[index + 1].startsWith("--")) {
    index += 1;
    continue;
  }
  throw new Error("Usage: node scripts/sync-home-assistant-app.mjs [--check] [--repository <add-on-repository>]");
}
const targets = [resolve(root, "atlas")];
if (repositoryIndex >= 0) {
  const repository = resolve(args[repositoryIndex + 1]);
  await stat(resolve(repository, "repository.yaml"));
  targets.push(resolve(repository, "atlas"));
}
const files = await collectPackageFiles();
for (const target of targets) {
  if (!check) await copyPackageFiles(target);
  const differences = [];
  for (const file of files) {
    const expected = await readFile(file.source);
    const actual = await readFile(resolve(target, file.destination)).catch((error) => {
      if (error.code === "ENOENT") return null;
      throw error;
    });
    if (!actual || !expected.equals(actual)) differences.push(file.destination);
  }
  if (differences.length) {
    throw new Error(`Package differs from canonical sources at ${target}: ${differences.join(", ")}`);
  }
  console.log(`${check ? "Verified" : "Synchronized"} ${files.length} package files at ${target}`);
}
