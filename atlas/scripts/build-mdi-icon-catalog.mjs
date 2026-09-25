import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const mdiRoot = resolve(root, "node_modules", "@mdi", "svg");
const mdiPackage = JSON.parse(await readFile(resolve(mdiRoot, "package.json"), "utf8"));
const metadata = JSON.parse(await readFile(resolve(mdiRoot, "meta.json"), "utf8"));
const license = await readFile(resolve(mdiRoot, "LICENSE"), "utf8");
const outputDirectory = resolve(root, "examples", "admin-demo");

const icons = [];
for (const item of metadata) {
  const svg = await readFile(resolve(mdiRoot, "svg", `${item.name}.svg`), "utf8");
  const pathData = [...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"[^>]*\/?\s*>/g)]
    .map(match => match[1]);
  if (pathData.length === 0) continue;
  icons.push({
    name: item.name,
    aliases: item.aliases ?? [],
    tags: item.tags ?? [],
    path: pathData.join(" "),
    author: item.author ?? "Pictogrammers",
  });
}

await mkdir(outputDirectory, { recursive: true });
await writeFile(
  resolve(outputDirectory, "mdi-icons.json"),
  `${JSON.stringify({ source: "@mdi/svg", version: mdiPackage.version, license, icons })}\n`,
);
await copyFile(resolve(mdiRoot, "LICENSE"), resolve(outputDirectory, "mdi-icons.LICENSE"));
console.log(`Built local MDI icon catalog (${icons.length} icons).`);
