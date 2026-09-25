import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

export function readAddonPackages(options) {
  const packages = options?.packages ?? [];
  if (!Array.isArray(packages)) {
    throw new TypeError("Add-on option 'packages' must be a list of package names.");
  }

  const normalized = packages.map((value) => String(value).trim()).filter(Boolean);
  const invalid = normalized.filter((name) => !/^[A-Za-z0-9][A-Za-z0-9+_.@-]*$/.test(name));
  if (invalid.length > 0) {
    throw new Error(`Invalid Alpine package name(s): ${invalid.join(", ")}`);
  }
  return [...new Set(normalized)];
}

const optionsPath = process.argv[2];
if (optionsPath) {
  const options = JSON.parse(readFileSync(optionsPath, "utf8"));
  const packages = readAddonPackages(options);
  if (packages.length > 0) {
    const result = spawnSync("apk", ["add", "--no-cache", ...packages], { stdio: "inherit" });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  }
}
