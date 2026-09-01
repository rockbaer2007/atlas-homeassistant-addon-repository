import type { RuntimePluginDescriptor } from "./RuntimePluginCatalog";

export type RuntimePluginInstallPackageFile = Readonly<{
  path: string;
  mediaType: string;
  content: string;
}>;

export type RuntimePluginInstallPackage = Readonly<{
  kind: "atlas.runtime.plugin.install-package";
  filename: string;
  plugin: RuntimePluginDescriptor;
  files: readonly RuntimePluginInstallPackageFile[];
}>;

export type RuntimePluginInstallPackageInput = Readonly<{
  plugin: RuntimePluginDescriptor;
  readme?: string;
  files?: readonly RuntimePluginInstallPackageFile[];
}>;

export function createRuntimePluginInstallPackage(
  input: RuntimePluginInstallPackageInput,
): RuntimePluginInstallPackage {
  return {
    kind: "atlas.runtime.plugin.install-package",
    filename: `${normalizeRuntimePluginPackageName(input.plugin.id)}.atlas-plugin.json`,
    plugin: input.plugin,
    files: [
      {
        path: "atlas-plugin.json",
        mediaType: "application/json",
        content: serializeRuntimePluginInstallManifest(input.plugin),
      },
      {
        path: "README.md",
        mediaType: "text/markdown",
        content: input.readme ?? defaultRuntimePluginReadme(input.plugin),
      },
      ...(input.files ?? []),
    ],
  };
}

export function serializeRuntimePluginInstallManifest(
  plugin: RuntimePluginDescriptor,
): string {
  return `${JSON.stringify({
    id: plugin.id,
    name: plugin.name,
    nameI18n: plugin.nameI18n,
    version: plugin.version,
    description: plugin.description,
    descriptionI18n: plugin.descriptionI18n,
    icon: plugin.icon,
    logo: plugin.logo,
    preview: plugin.preview,
    dependencies: plugin.dependencies,
    extensionPoints: plugin.extensionPoints,
    provides: plugin.provides,
  }, null, 2)}\n`;
}

export function parseRuntimePluginInstallPackage(value: string | unknown): RuntimePluginInstallPackage {
  const packageValue = typeof value === "string" ? parseJson(value) : value;

  if (!isRecord(packageValue)) {
    throw new Error("Runtime plugin install package must be an object.");
  }

  if (packageValue.kind !== "atlas.runtime.plugin.install-package") {
    throw new Error("Runtime plugin install package kind is invalid.");
  }

  return {
    kind: "atlas.runtime.plugin.install-package",
    filename: readOptionalString(packageValue.filename) ?? "atlas-plugin.atlas-plugin.json",
    plugin: readRuntimePluginDescriptor(packageValue.plugin),
    files: readInstallPackageFiles(packageValue.files),
  };
}

export function normalizeRuntimePluginPackageName(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "atlas-plugin";
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error("Runtime plugin install package JSON is invalid.");
  }
}

function readRuntimePluginDescriptor(value: unknown): RuntimePluginDescriptor {
  if (!isRecord(value)) {
    throw new Error("Runtime plugin install package plugin descriptor is invalid.");
  }

  return {
    id: readRequiredString(value.id, "Runtime plugin id is required."),
    name: readRequiredString(value.name, "Runtime plugin name is required."),
    nameI18n: readOptionalLocalizedText(value.nameI18n),
    version: readRequiredString(value.version, "Runtime plugin version is required."),
    description: readOptionalString(value.description),
    descriptionI18n: readOptionalLocalizedText(value.descriptionI18n),
    icon: readOptionalString(value.icon),
    logo: readOptionalString(value.logo),
    preview: readOptionalString(value.preview),
    dependencies: readDependencies(value.dependencies),
    extensionPoints: readStringList(value.extensionPoints),
    provides: readStringList(value.provides),
  };
}

function readInstallPackageFiles(value: unknown): readonly RuntimePluginInstallPackageFile[] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error("Runtime plugin install package files must be an array.");
  }

  return value.map(file => {
    if (!isRecord(file)) {
      throw new Error("Runtime plugin install package file is invalid.");
    }

    return {
      path: readRequiredString(file.path, "Runtime plugin package file path is required."),
      mediaType: readRequiredString(file.mediaType, "Runtime plugin package file media type is required."),
      content: readRequiredString(file.content, "Runtime plugin package file content is required."),
    };
  });
}

function readDependencies(value: unknown): RuntimePluginDescriptor["dependencies"] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error("Runtime plugin dependencies must be an array.");
  }

  return value.map(dependency => {
    if (!isRecord(dependency)) {
      throw new Error("Runtime plugin dependency is invalid.");
    }

    return {
      id: readRequiredString(dependency.id, "Runtime plugin dependency id is required."),
      version: readRequiredString(dependency.version, "Runtime plugin dependency version is required."),
      optional: typeof dependency.optional === "boolean" ? dependency.optional : undefined,
    };
  });
}

function readStringList(value: unknown): readonly string[] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error("Runtime plugin descriptor lists must be arrays.");
  }

  return value.map(entry =>
    readRequiredString(entry, "Runtime plugin descriptor list entries must be strings."),
  );
}

function readRequiredString(value: unknown, message: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(message);
  }

  return value.trim();
}

function readOptionalString(value: unknown): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error("Runtime plugin optional text fields must be strings.");
  }

  return value.trim() || undefined;
}

function readOptionalLocalizedText(value: unknown): Readonly<Record<string, string>> | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    throw new Error("Runtime plugin localized text fields must be objects.");
  }

  const entries: [string, string][] = [];
  for (const [locale, text] of Object.entries(value)) {
    if (locale.trim() && typeof text === "string" && text.trim()) {
      entries.push([locale.trim().toLowerCase(), text.trim()]);
    }
  }

  return entries.length ? Object.fromEntries(entries) : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function defaultRuntimePluginReadme(plugin: RuntimePluginDescriptor): string {
  return [
    `# ${plugin.name}`,
    "",
    `Plugin ID: \`${plugin.id}\``,
    `Version: \`${plugin.version}\``,
    "",
    "This package was generated from an ATLAS plugin descriptor.",
    "",
  ].join("\n");
}
