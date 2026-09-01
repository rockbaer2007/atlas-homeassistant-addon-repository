import { build } from "esbuild";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

await build({
  entryPoints: [resolve(root, "atlas-plugins/file-studio/editor-source.js")],
  bundle: true,
  format: "iife",
  globalName: "AtlasFileStudioEditorBundle",
  outfile: resolve(root, "atlas-plugins/file-studio/editor.bundle.js"),
  target: ["es2022"],
  sourcemap: false,
  minify: true,
  legalComments: "none",
});
