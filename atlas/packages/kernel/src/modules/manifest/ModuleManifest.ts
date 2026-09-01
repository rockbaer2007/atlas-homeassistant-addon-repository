import type { ModuleDependency } from "./ModuleDependency";

export type ModuleManifest = Readonly<{
  id:string;
  name:string;
  version:string;
  description?:string;
  dependencies: readonly ModuleDependency[];
}>;
