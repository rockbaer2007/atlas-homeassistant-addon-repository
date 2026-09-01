import type { HomeAssistantEntityState } from "./HomeAssistantEntityState";
export declare const defaultHomeAssistantEntityDomains: readonly ["sensor", "binary_sensor", "switch", "light"];
export type HomeAssistantEntityCatalogEntry = Readonly<{
    entityId: string;
    domain: string;
    label: string;
    searchText: string;
}>;
export type HomeAssistantEntityCatalogInput = Readonly<{
    entityIds: readonly string[];
    entities?: readonly HomeAssistantEntityState[];
}>;
export type HomeAssistantEntityCatalogFilter = Readonly<{
    domain?: string;
    search?: string;
}>;
export declare function getHomeAssistantEntityDomain(entityId: string): string;
export declare function createHomeAssistantEntityCatalog(input: HomeAssistantEntityCatalogInput): readonly HomeAssistantEntityCatalogEntry[];
export declare function listHomeAssistantEntityCatalogDomains(catalog: readonly HomeAssistantEntityCatalogEntry[]): readonly string[];
export declare function listHomeAssistantEntityDomainShortcuts(domains: readonly string[], preferredDomains?: readonly string[]): readonly string[];
export declare function filterHomeAssistantEntityCatalog(catalog: readonly HomeAssistantEntityCatalogEntry[], filter: HomeAssistantEntityCatalogFilter): readonly HomeAssistantEntityCatalogEntry[];
