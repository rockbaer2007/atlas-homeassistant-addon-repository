import { build } from "esbuild";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
await build({
  entryPoints: [resolve(root, "atlas-plugins/terminal/app.js")],
  bundle: true,
  format: "iife",
  outfile: resolve(root, "atlas-plugins/terminal/app.bundle.js"),
  target: ["es2022"],
  sourcemap: false,
  minify: true,
  legalComments: "none",
});
