import type { HomeAssistantEntityState } from "./HomeAssistantEntityState";
import { createHomeAssistantEntityPresentation } from "./HomeAssistantEntityPresentation";

export const defaultHomeAssistantEntityDomains = ["sensor", "binary_sensor", "switch", "light"] as const;

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

export function getHomeAssistantEntityDomain(entityId: string): string {
  const separator = entityId.indexOf(".");
  return separator > 0 ? entityId.slice(0, separator) : "other";
}

export function createHomeAssistantEntityCatalog(
  input: HomeAssistantEntityCatalogInput,
): readonly HomeAssistantEntityCatalogEntry[] {
  const entitiesById = new Map((input.entities ?? []).map(entity => [entity.entityId, entity]));
  const entityIds = dedupeEntityIds([
    ...input.entityIds,
    ...entitiesById.keys(),
  ]);

  return entityIds
    .map(entityId => {
      const entity = entitiesById.get(entityId);
      const presentation = entity ? createHomeAssistantEntityPresentation(entity) : undefined;
      const label = presentation?.label ?? entity?.name ?? entityId;

      return {
        entityId,
        domain: getHomeAssistantEntityDomain(entityId),
        label,
        searchText: [entityId, label, entity?.name].filter(Boolean).join(" ").toLowerCase(),
      };
    })
    .sort((left, right) => left.entityId.localeCompare(right.entityId));
}

export function listHomeAssistantEntityCatalogDomains(
  catalog: readonly HomeAssistantEntityCatalogEntry[],
): readonly string[] {
  return [...new Set(catalog.map(entry => entry.domain))]
    .sort((left, right) => left.localeCompare(right));
}

export function listHomeAssistantEntityDomainShortcuts(
  domains: readonly string[],
  preferredDomains: readonly string[] = defaultHomeAssistantEntityDomains,
): readonly string[] {
  return ["all", ...preferredDomains, ...domains]
    .filter((domain, index, list) => list.indexOf(domain) === index)
    .filter(domain => domain === "all" || domains.includes(domain));
}

export function filterHomeAssistantEntityCatalog(
  catalog: readonly HomeAssistantEntityCatalogEntry[],
  filter: HomeAssistantEntityCatalogFilter,
): readonly HomeAssistantEntityCatalogEntry[] {
  const selectedDomain = filter.domain?.trim() || "all";
  const search = filter.search?.trim().toLowerCase() ?? "";

  return catalog
    .filter(entry => selectedDomain === "all" || entry.domain === selectedDomain)
    .filter(entry => !search || entry.searchText.includes(search));
}

function dedupeEntityIds(entityIds: readonly string[]): string[] {
  return [...new Set(entityIds.map(entityId => entityId.trim()).filter(Boolean))];
}
