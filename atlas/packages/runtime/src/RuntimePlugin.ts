import type {
  Module,
  ModuleContext,
  ModuleDependency,
  ModuleManifest,
} from "@atlas/kernel";

import type { RuntimeModule } from "./RuntimeModule";

export type RuntimePluginManifest = Readonly<{
  id: string;
  name: string;
  nameI18n?: Readonly<Record<string, string>>;
  version: string;
  description?: string;
  descriptionI18n?: Readonly<Record<string, string>>;
  icon?: string;
  logo?: string;
  preview?: string;
  dependencies?: readonly ModuleDependency[];
  extensionPoints?: readonly string[];
  provides?: readonly string[];
}>;

export type RuntimePluginActivationContext = ModuleContext & Readonly<{
  plugin: RuntimePluginManifest;
}>;

export interface RuntimePlugin {
  readonly manifest: RuntimePluginManifest;
  activate(context: RuntimePluginActivationContext): Promise<void>;
  deactivate?(): Promise<void>;
  dispose?(): Promise<void>;
}

export function createRuntimeModuleFromPlugin(plugin: RuntimePlugin): RuntimeModule {
  const manifest = toModuleManifest(plugin.manifest);
  const module: Module & {
    stop?(): Promise<void>;
    dispose?(): Promise<void>;
  } = {
    async initialize(context) {
      await plugin.activate({
        ...context,
        plugin: plugin.manifest,
      });
    },
  };

  if (plugin.deactivate) {
    module.stop = () => plugin.deactivate!();
  }

  if (plugin.dispose) {
    module.dispose = () => plugin.dispose!();
  }

  return {
    manifest,
    module,
  };
}

function toModuleManifest(manifest: RuntimePluginManifest): ModuleManifest {
  return {
    id: manifest.id,
    name: manifest.name,
    version: manifest.version,
    description: manifest.description,
    dependencies: manifest.dependencies ?? [],
  };
}
