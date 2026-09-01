import { ATLAS_PLANNED_INTEGRATION_CLOSURES, ATLAS_WORKSPACE_QUALITY_GATES, } from "./FrameworkReadiness";
export const ATLAS_NEXT_FRAMEWORK_CAPABILITY_DIRECTION = {
    id: "homeassistant-status-panel",
    phase: "0.6-homeassistant",
    status: "selected",
    goal: "Provide a themed Home Assistant status panel on the active Renderer surface path without transport coupling.",
    ownerPackages: ["@atlas/theme", "@atlas/homeassistant"],
    protectedIntegrationClosures: ATLAS_PLANNED_INTEGRATION_CLOSURES.map((closure) => ({ ...closure })),
    requiredQualityGates: [...ATLAS_WORKSPACE_QUALITY_GATES],
    risks: [
        "integration-api-drift",
        "renderer-side-effects",
        "homeassistant-transport-coupling",
    ],
};
export function createAtlasFrameworkCapabilityDirection() {
    return {
        ...ATLAS_NEXT_FRAMEWORK_CAPABILITY_DIRECTION,
        ownerPackages: [...ATLAS_NEXT_FRAMEWORK_CAPABILITY_DIRECTION.ownerPackages],
        protectedIntegrationClosures: ATLAS_NEXT_FRAMEWORK_CAPABILITY_DIRECTION.protectedIntegrationClosures.map((closure) => ({ ...closure })),
        requiredQualityGates: [
            ...ATLAS_NEXT_FRAMEWORK_CAPABILITY_DIRECTION.requiredQualityGates,
        ],
        risks: [...ATLAS_NEXT_FRAMEWORK_CAPABILITY_DIRECTION.risks],
    };
}
export function inspectAtlasFrameworkCapabilityDirection(direction = createAtlasFrameworkCapabilityDirection()) {
    return {
        selected: direction.status === "selected" &&
            direction.ownerPackages.length > 0 &&
            direction.protectedIntegrationClosures.every((closure) => closure.publicApi === "closed"),
        id: direction.id,
        ownerPackages: [...direction.ownerPackages],
        protectedIntegrations: direction.protectedIntegrationClosures.map((closure) => closure.name),
        requiredQualityGates: [...direction.requiredQualityGates],
        risks: [...direction.risks],
    };
}
export function assertAtlasFrameworkCapabilityDirection(direction = createAtlasFrameworkCapabilityDirection()) {
    const report = inspectAtlasFrameworkCapabilityDirection(direction);
    if (!report.selected) {
        throw new Error("Atlas framework capability direction is not selected.");
    }
    return direction;
}
