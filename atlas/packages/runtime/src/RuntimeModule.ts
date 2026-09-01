import type { Module, ModuleManifest } from "@atlas/kernel";

export type RuntimeModule = Readonly<{
  manifest: ModuleManifest;
  module: Module;
}>;
