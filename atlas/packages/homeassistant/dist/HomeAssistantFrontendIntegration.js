import { inspectHomeAssistantCardDependencyAvailability, } from "./HomeAssistantCardConfiguration";
import { createHomeAssistantCardEditorDependencyPlan, } from "./HomeAssistantCardEditorPlan";
const defaultAtlasServerResourcePath = "/local/atlas/atlas-homeassistant-panel.js";
const atlasHacsResourcePath = "/hacsfiles/atlas/atlas-homeassistant-panel.js";
export function createHomeAssistantAtlasFrontendIntegrationPlan(input) {
    const resources = input.resources ?? [];
    const atlasResource = createAtlasFrontendResource(input.mode, input.serverResourcePath);
    const atlasAvailability = inspectAtlasFrontendResourceAvailability(atlasResource, resources);
    const cardAvailability = inspectHomeAssistantCardDependencyAvailability(input.card ?? input.cardTarget ?? "entities", resources);
    const requiredResourcePaths = dedupeResourcePaths([
        ...atlasResource.resourcePaths,
        ...cardAvailability.dependency.resourcePaths,
    ]);
    return {
        mode: input.mode,
        atlasResource,
        atlasAvailability,
        cardAvailability,
        requiredResourcePaths,
        installSteps: [
            ...atlasResource.installSteps,
            ...cardAvailability.dependency.installPaths,
        ],
        ready: atlasAvailability.status !== "missing" && cardAvailability.status !== "missing",
    };
}
export function createAtlasFrontendResource(mode, serverResourcePath = defaultAtlasServerResourcePath) {
    if (mode === "hacs") {
        return {
            id: "atlas-hacs",
            label: "ATLAS HACS frontend integration",
            required: true,
            resourcePaths: [atlasHacsResourcePath],
            installSteps: [
                "HACS > Custom repositories > ATLAS",
                "HACS > Frontend > ATLAS",
                atlasHacsResourcePath,
            ],
        };
    }
    const normalizedPath = normalizeHomeAssistantResourcePath(serverResourcePath) ?? defaultAtlasServerResourcePath;
    return {
        id: "atlas-server",
        label: "ATLAS self-hosted frontend",
        required: true,
        resourcePaths: [normalizedPath],
        installSteps: [
            "Serve the ATLAS Home Assistant panel from the ATLAS server",
            normalizedPath,
        ],
    };
}
export function inspectAtlasFrontendResourceAvailability(resource, resources) {
    if (!resource.required) {
        return {
            resource,
            status: "not-required",
            matchedResourcePaths: [],
            missingResourcePaths: [],
        };
    }
    const registeredPaths = resources
        .map(candidate => typeof candidate === "string" ? candidate : candidate.url)
        .map(normalizeHomeAssistantResourcePath)
        .filter((candidate) => candidate !== undefined);
    const matchedResourcePaths = resource.resourcePaths.filter(path => registeredPaths.includes(path));
    const missingResourcePaths = resource.resourcePaths.filter(path => !matchedResourcePaths.includes(path));
    return {
        resource,
        status: missingResourcePaths.length === 0 ? "installed" : "missing",
        matchedResourcePaths,
        missingResourcePaths,
    };
}
export function createHomeAssistantAtlasFrontendResourceReferences(input) {
    return createHomeAssistantAtlasFrontendIntegrationPlan(input).requiredResourcePaths.map(url => ({
        url,
        type: "module",
    }));
}
export function serializeHomeAssistantAtlasFrontendResourceReferences(input, format) {
    const resources = createHomeAssistantAtlasFrontendResourceReferences(input);
    if (format === "json") {
        return JSON.stringify(resources, null, 2);
    }
    return resources.map(resource => [
        `- url: ${serializeYamlScalar(resource.url)}`,
        `  type: ${serializeYamlScalar(resource.type)}`,
    ].join("\n")).join("\n");
}
export function createHomeAssistantCardEditorFrontendIntegrationPlan(input) {
    const resources = input.resources ?? [];
    const atlasResource = createAtlasFrontendResource(input.mode, input.serverResourcePath);
    const atlasAvailability = inspectAtlasFrontendResourceAvailability(atlasResource, resources);
    const editorDependencyPlan = createHomeAssistantCardEditorDependencyPlan(input.editorPlan ?? {});
    const registeredPaths = resources
        .map(candidate => typeof candidate === "string" ? candidate : candidate.url)
        .map(normalizeHomeAssistantResourcePath)
        .filter((candidate) => candidate !== undefined);
    const matchedCardResourcePaths = editorDependencyPlan.requiredResourcePaths.filter(path => registeredPaths.includes(path));
    const missingCardResourcePaths = editorDependencyPlan.requiredResourcePaths.filter(path => !matchedCardResourcePaths.includes(path));
    const requiredResourcePaths = dedupeResourcePaths([
        ...atlasResource.resourcePaths,
        ...editorDependencyPlan.requiredResourcePaths,
    ]);
    return {
        mode: input.mode,
        atlasResource,
        atlasAvailability,
        editorDependencyPlan,
        matchedCardResourcePaths,
        missingCardResourcePaths,
        requiredResourcePaths,
        installSteps: [
            ...atlasResource.installSteps,
            ...editorDependencyPlan.installSteps,
        ],
        ready: atlasAvailability.status !== "missing" && missingCardResourcePaths.length === 0,
    };
}
export function createHomeAssistantCardEditorFrontendResourceReferences(input) {
    return createHomeAssistantCardEditorFrontendIntegrationPlan(input).requiredResourcePaths.map(url => ({
        url,
        type: "module",
    }));
}
export function serializeHomeAssistantCardEditorFrontendResourceReferences(input, format) {
    const resources = createHomeAssistantCardEditorFrontendResourceReferences(input);
    if (format === "json") {
        return JSON.stringify(resources, null, 2);
    }
    return resources.map(resource => [
        `- url: ${serializeYamlScalar(resource.url)}`,
        `  type: ${serializeYamlScalar(resource.type)}`,
    ].join("\n")).join("\n");
}
function dedupeResourcePaths(paths) {
    return [...new Set(paths.map(path => path.trim()).filter(Boolean))];
}
function serializeYamlScalar(value) {
    if (typeof value === "boolean")
        return String(value);
    if (typeof value === "number")
        return String(value);
    return JSON.stringify(String(value));
}
function normalizeHomeAssistantResourcePath(resourcePath) {
    const trimmed = resourcePath.trim();
    if (!trimmed)
        return undefined;
    try {
        return new URL(trimmed, "http://homeassistant.local").pathname;
    }
    catch {
        const [withoutHash] = trimmed.split("#", 1);
        const [withoutQuery] = withoutHash.split("?", 1);
        return withoutQuery || undefined;
    }
}
