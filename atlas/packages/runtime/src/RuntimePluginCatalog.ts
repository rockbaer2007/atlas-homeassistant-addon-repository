import type { ModuleDependency } from "@atlas/kernel";

import {
  createRuntimeModuleFromPlugin,
  type RuntimePlugin,
} from "./RuntimePlugin";
import type { RuntimeModule } from "./RuntimeModule";

export type RuntimePluginDescriptor = Readonly<{
  id: string;
  name: string;
  nameI18n?: Readonly<Record<string, string>>;
  version: string;
  description?: string;
  descriptionI18n?: Readonly<Record<string, string>>;
  icon?: string;
  logo?: string;
  preview?: string;
  dependencies: readonly ModuleDependency[];
  extensionPoints: readonly string[];
  provides: readonly string[];
}>;

type RuntimePluginCatalogEntry = Readonly<{
  plugin: RuntimePlugin;
  descriptor: RuntimePluginDescriptor;
}>;

export class RuntimePluginCatalog {
  private readonly entries = new Map<string, RuntimePluginCatalogEntry>();

  public register(plugin: RuntimePlugin): void {
    const descriptor = describeRuntimePlugin(plugin);

    if (this.entries.has(descriptor.id)) {
      throw new Error(`Runtime plugin already registered: ${descriptor.id}`);
    }

    this.entries.set(descriptor.id, {
      plugin,
      descriptor,
    });
  }

  public list(): readonly RuntimePluginDescriptor[] {
    return [...this.entries.values()].map(entry => entry.descriptor);
  }

  public findByExtensionPoint(extensionPoint: string): readonly RuntimePluginDescriptor[] {
    return this.list().filter(plugin =>
      plugin.extensionPoints.includes(extensionPoint),
    );
  }

  public findProviding(capability: string): readonly RuntimePluginDescriptor[] {
    return this.list().filter(plugin =>
      plugin.provides.includes(capability),
    );
  }

  public toRuntimeModules(): readonly RuntimeModule[] {
    return [...this.entries.values()].map(entry =>
      createRuntimeModuleFromPlugin(entry.plugin),
    );
  }
}

export function describeRuntimePlugin(plugin: RuntimePlugin): RuntimePluginDescriptor {
  const manifest = plugin.manifest;

  assertNonEmptyString(manifest.id, "Runtime plugin id is required.");
  assertNonEmptyString(manifest.name, `Runtime plugin name is required: ${manifest.id}`);
  assertNonEmptyString(manifest.version, `Runtime plugin version is required: ${manifest.id}`);

  return {
    id: manifest.id,
    name: manifest.name,
    nameI18n: manifest.nameI18n,
    version: manifest.version,
    description: manifest.description,
    descriptionI18n: manifest.descriptionI18n,
    icon: manifest.icon,
    logo: manifest.logo,
    preview: manifest.preview,
    dependencies: [...(manifest.dependencies ?? [])],
    extensionPoints: [...(manifest.extensionPoints ?? [])],
    provides: [...(manifest.provides ?? [])],
  };
}

function assertNonEmptyString(value: string, message: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(message);
  }
}
