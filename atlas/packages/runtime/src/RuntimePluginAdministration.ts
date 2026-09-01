import type { RuntimePluginDescriptor } from "./RuntimePluginCatalog";

export type RuntimePluginAdministrationStatus = "available" | "active" | "disabled";

export type RuntimePluginAdministrationAction =
  | "activate"
  | "deactivate"
  | "export-package"
  | "inspect";

export type RuntimePluginAdministrationEntry = RuntimePluginDescriptor & Readonly<{
  status: RuntimePluginAdministrationStatus;
  actions: readonly RuntimePluginAdministrationAction[];
}>;

export type RuntimePluginAdministrationSummary = Readonly<{
  total: number;
  active: number;
  available: number;
  disabled: number;
}>;

export type RuntimePluginAdministrationView = Readonly<{
  plugins: readonly RuntimePluginAdministrationEntry[];
  summary: RuntimePluginAdministrationSummary;
}>;

export type RuntimePluginCatalogLike = Readonly<{
  list(): readonly RuntimePluginDescriptor[];
}>;

export type RuntimePluginAdministrationInput = Readonly<{
  plugins: RuntimePluginCatalogLike | readonly RuntimePluginDescriptor[];
  activePluginIds?: readonly string[];
  disabledPluginIds?: readonly string[];
}>;

export function createRuntimePluginAdministrationView(
  input: RuntimePluginAdministrationInput,
): RuntimePluginAdministrationView {
  const activePluginIds = new Set(input.activePluginIds ?? []);
  const disabledPluginIds = new Set(input.disabledPluginIds ?? []);
  const descriptors: readonly RuntimePluginDescriptor[] = isRuntimePluginCatalogLike(input.plugins)
    ? input.plugins.list()
    : input.plugins;
  const plugins: readonly RuntimePluginAdministrationEntry[] = descriptors.map(plugin => {
    const status = pluginStatus(plugin.id, activePluginIds, disabledPluginIds);

    return {
      ...plugin,
      status,
      actions: pluginActions(status),
    };
  });

  return {
    plugins,
    summary: {
      total: plugins.length,
      active: plugins.filter(plugin => plugin.status === "active").length,
      available: plugins.filter(plugin => plugin.status === "available").length,
      disabled: plugins.filter(plugin => plugin.status === "disabled").length,
    },
  };
}

function pluginStatus(
  pluginId: string,
  activePluginIds: ReadonlySet<string>,
  disabledPluginIds: ReadonlySet<string>,
): RuntimePluginAdministrationStatus {
  if (disabledPluginIds.has(pluginId)) return "disabled";
  if (activePluginIds.has(pluginId)) return "active";

  return "available";
}

function pluginActions(
  status: RuntimePluginAdministrationStatus,
): readonly RuntimePluginAdministrationAction[] {
  if (status === "active") return ["inspect", "deactivate", "export-package"];
  if (status === "disabled") return ["inspect", "activate"];

  return ["inspect", "activate", "export-package"];
}

function isRuntimePluginCatalogLike(
  plugins: RuntimePluginCatalogLike | readonly RuntimePluginDescriptor[],
): plugins is RuntimePluginCatalogLike {
  return typeof (plugins as RuntimePluginCatalogLike).list === "function";
}
