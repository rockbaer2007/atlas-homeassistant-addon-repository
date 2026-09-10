import { createHomeAssistantEntityPresentation } from "./HomeAssistantEntityPresentation";
export const defaultHomeAssistantEntityDomains = ["sensor", "binary_sensor", "switch", "light"];
export function getHomeAssistantEntityDomain(entityId) {
    const separator = entityId.indexOf(".");
    return separator > 0 ? entityId.slice(0, separator) : "other";
}
export function createHomeAssistantEntityCatalog(input) {
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
export function listHomeAssistantEntityCatalogDomains(catalog) {
    return [...new Set(catalog.map(entry => entry.domain))]
        .sort((left, right) => left.localeCompare(right));
}
export function listHomeAssistantEntityDomainShortcuts(domains, preferredDomains = defaultHomeAssistantEntityDomains) {
    return ["all", ...preferredDomains, ...domains]
        .filter((domain, index, list) => list.indexOf(domain) === index)
        .filter(domain => domain === "all" || domains.includes(domain));
}
export function filterHomeAssistantEntityCatalog(catalog, filter) {
    const selectedDomain = filter.domain?.trim() || "all";
    const search = filter.search?.trim().toLowerCase() ?? "";
    return catalog
        .filter(entry => selectedDomain === "all" || entry.domain === selectedDomain)
        .filter(entry => !search || entry.searchText.includes(search));
}
function dedupeEntityIds(entityIds) {
    return [...new Set(entityIds.map(entityId => entityId.trim()).filter(Boolean))];
}
