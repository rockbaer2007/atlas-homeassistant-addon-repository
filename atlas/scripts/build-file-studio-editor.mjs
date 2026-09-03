import { build } from "esbuild";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const atlasPackageAliases = new Map([
  ["@atlas/core", resolve(root, "packages/core/dist/index.js")],
  ["@atlas/foundation", resolve(root, "packages/foundation/dist/index.js")],
  ["@atlas/kernel", resolve(root, "packages/kernel/dist/index.js")],
  ["@atlas/renderer", resolve(root, "packages/renderer/dist/index.js")],
  ["@atlas/runtime", resolve(root, "packages/runtime/dist/index.js")],
  ["@atlas/theme", resolve(root, "packages/theme/dist/index.js")],
  ["@atlas/file-studio", resolve(root, "packages/file-studio/dist/index.js")],
  ["@atlas/homeassistant", resolve(root, "packages/homeassistant/dist/index.js")],
]);

const atlasPackageAliasPlugin = {
  name: "atlas-package-alias",
  setup(buildContext) {
    buildContext.onResolve({ filter: /^@atlas\// }, args => {
      const alias = atlasPackageAliases.get(args.path);
      return alias ? { path: alias } : undefined;
    });
  },
};

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

await build({
  entryPoints: [resolve(root, "examples/admin-demo/app.js")],
  bundle: true,
  format: "iife",
  outfile: resolve(root, "examples/admin-demo/app.bundle.js"),
  plugins: [atlasPackageAliasPlugin],
  target: ["es2022"],
  sourcemap: false,
  minify: true,
  legalComments: "none",
});

await build({
  entryPoints: [resolve(root, "examples/status-demo/app.js")],
  bundle: true,
  format: "iife",
  outfile: resolve(root, "examples/status-demo/app.bundle.js"),
  plugins: [atlasPackageAliasPlugin],
  target: ["es2022"],
  sourcemap: false,
  minify: true,
  legalComments: "none",
});
