import type { RuntimePluginDescriptor } from "./RuntimePluginCatalog";
export type RuntimePluginAdministrationStatus = "available" | "active" | "disabled";
export type RuntimePluginAdministrationAction = "activate" | "deactivate" | "export-package" | "inspect";
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
export declare function createRuntimePluginAdministrationView(input: RuntimePluginAdministrationInput): RuntimePluginAdministrationView;
