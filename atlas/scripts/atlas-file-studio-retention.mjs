import { createHash, randomUUID } from "node:crypto";
import { closeSync, copyFileSync, existsSync, lstatSync, mkdirSync, openSync, readFileSync, readSync, readdirSync, renameSync, rmdirSync, unlinkSync, utimesSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Persistent installation data, never the replaceable application checkout.
// Linux installer/custom storage overrides continue to own their existing paths.
export function prepareFileStudioRetention({ appRoot, pluginRoot, historyRoot, trashRoot }) {
  const base = join(resolve(pluginRoot), ".file-studio");
  const targets = { history: resolve(historyRoot ?? join(base, "history")), trash: resolve(trashRoot ?? join(base, "trash")) };
  const plans = [];
  for (const kind of ["history", "trash"]) {
    const source = join(resolve(appRoot), `.atlas-file-studio-${kind}`), target = targets[kind];
    if (source === target || !existsSync(source)) continue;
    if (!lstatSync(source).isDirectory() || lstatSync(source).isSymbolicLink()) throw new Error("Invalid legacy File Studio retention directory");
    if (inside(source, target) || inside(target, source)) throw new Error("File Studio retention paths must not overlap");
    const key = createHash("sha256").update(JSON.stringify([source, target])).digest("hex");
    const marker = join(base, "migrations", key + ".json");
    if (existsSync(marker)) {
      const saved = JSON.parse(readFileSync(marker, "utf8"));
      if (saved.version !== 1 || saved.source !== source || saved.target !== target) throw new Error("Invalid File Studio retention migration marker");
      continue;
    }
    const files = [], directories = [];
    const walk = (path, suffix = "") => {
      const stats = lstatSync(path);
      if (stats.isSymbolicLink()) throw new Error("File Studio retention migration refuses symbolic links");
      const destination = join(target, suffix);
      if (existsSync(destination)) {
        const current = lstatSync(destination);
        if (current.isSymbolicLink() || current.isDirectory() !== stats.isDirectory() || current.isFile() !== stats.isFile()) throw new Error("File Studio retention migration target conflict");
        if (stats.isFile() && digest(path) !== digest(destination)) throw new Error("File Studio retention migration file conflict");
      }
      if (stats.isDirectory()) {
        directories.push(destination);
        for (const item of readdirSync(path)) walk(join(path, item), join(suffix, item));
      }
      else if (stats.isFile()) files.push({ source: path, destination });
      else throw new Error("Unsupported File Studio retention entry");
    };
    walk(source);
    plans.push({ source, target, marker, files, directories });
  }
  // Validate both stores completely before copying anything; never overwrite.
  let copied = 0;
  for (const plan of plans) {
    for (const directory of plan.directories) mkdirSync(directory, { recursive: true, mode: 0o700 });
    for (const file of plan.files) {
      if (existsSync(file.destination)) continue;
      mkdirSync(dirname(file.destination), { recursive: true, mode: 0o700 });
      const staging = join(dirname(file.destination), ".atlas-retention-" + randomUUID());
      mkdirSync(staging, { mode: 0o700 });
      const temporary = join(staging, "content");
      try {
        copyFileSync(file.source, temporary);
        if (digest(file.source) !== digest(temporary)) throw new Error("File Studio retention copy verification failed");
        const original = lstatSync(file.source);
        utimesSync(temporary, original.atime, original.mtime);
        renameSync(temporary, file.destination);
        copied++;
      } finally {
        if (existsSync(temporary)) unlinkSync(temporary);
        rmdirSync(staging);
      }
    }
    mkdirSync(dirname(plan.marker), { recursive: true, mode: 0o700 });
    const markerTemporary = plan.marker + "." + randomUUID() + ".tmp";
    writeFileSync(markerTemporary, JSON.stringify({ version: 1, source: plan.source, target: plan.target, completedAt: new Date().toISOString() }), { mode: 0o600, flag: "wx" });
    renameSync(markerTemporary, plan.marker);
  }
  return { ...targets, migratedStores: plans.length, copiedFiles: copied };
}

function inside(parent, child) {
  const path = relative(parent, child);
  return path === "" || (!path.startsWith("..") && !isAbsolute(path));
}

function digest(path) {
  const hash = createHash("sha256"), buffer = Buffer.alloc(65536), file = openSync(path, "r");
  try { let size; while ((size = readSync(file, buffer)) > 0) hash.update(buffer.subarray(0, size)); }
  finally { closeSync(file); }
  return hash.digest("hex");
}

// Copy this standalone helper into the OLD container and run immediately before
// replacing it. Freeze File Studio writes until the update; preserve a backup.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = {};
  for (let index = 2; index < process.argv.length; index += 2) {
    const name = { "--app-root": "appRoot", "--plugin-root": "pluginRoot" }[process.argv[index]];
    if (!name || !process.argv[index + 1]) throw new Error("Usage: node atlas-file-studio-retention.mjs --app-root <old-app-directory> --plugin-root <persistent-plugin-directory>");
    options[name] = resolve(process.argv[index + 1]);
  }
  if (!options.appRoot || !options.pluginRoot) throw new Error("Both explicit migration paths are required");
  const result = prepareFileStudioRetention({ ...options, historyRoot: process.env.ATLAS_FILE_STUDIO_HISTORY_ROOT, trashRoot: process.env.ATLAS_FILE_STUDIO_TRASH_ROOT });
  console.log(JSON.stringify({ migratedStores: result.migratedStores, copiedFiles: result.copiedFiles, sourceRetained: true }));
}
