import type { ModuleManifest } from "./ModuleManifest";

export type ModuleDescriptor = Readonly<{
  manifest: ModuleManifest;
  loaded: boolean;
}>;
