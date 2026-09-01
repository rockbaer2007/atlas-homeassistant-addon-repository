export const ATLAS_WORKSPACE_PACKAGE_INVENTORY = [
    {
        name: "@atlas/workspace",
        directory: "workspace",
        layer: 0,
        status: "active",
        publicApi: "open",
        allowedDependencies: [],
    },
    {
        name: "@atlas/foundation",
        directory: "foundation",
        layer: 0,
        status: "active",
        publicApi: "open",
        allowedDependencies: [],
    },
    {
        name: "@atlas/kernel",
        directory: "kernel",
        layer: 1,
        status: "active",
        publicApi: "open",
        allowedDependencies: ["foundation"],
    },
    {
        name: "@atlas/notifyarchive",
        directory: "notifyarchive",
        layer: 1,
        status: "active",
        publicApi: "open",
        allowedDependencies: [],
    },
    {
        name: "@atlas/runtime",
        directory: "runtime",
        layer: 2,
        status: "active",
        publicApi: "open",
        allowedDependencies: ["kernel", "foundation"],
    },
    {
        name: "@atlas/core",
        directory: "core",
        layer: 3,
        status: "active",
        publicApi: "open",
        allowedDependencies: ["runtime"],
    },
    {
        name: "@atlas/renderer",
        directory: "renderer",
        layer: 4,
        status: "active",
        publicApi: "open",
        allowedDependencies: ["core"],
    },
    {
        name: "@atlas/theme",
        directory: "theme",
        layer: 5,
        status: "active",
        publicApi: "open",
        allowedDependencies: ["renderer"],
    },
    {
        name: "@atlas/homeassistant",
        directory: "homeassistant",
        layer: 6,
        status: "active",
        publicApi: "open",
        allowedDependencies: ["runtime", "theme"],
    },
    {
        name: "@atlas/devtools",
        directory: "devtools",
        layer: 6,
        status: "active",
        publicApi: "closed",
        allowedDependencies: [],
    },
];
export const ATLAS_WORKSPACE_QUALITY_GATES = ["check", "build", "tests", "documentation", "architectureReview"];
export const ATLAS_PLANNED_INTEGRATION_CLOSURES = [
    {
        name: "@atlas/devtools",
        directory: "devtools",
        status: "planned",
        publicApi: "closed",
        reason: "Devtools activation waits for stable framework diagnostic inspection points.",
    },
];
export function createAtlasFrameworkReadiness() {
    return {
        framework: {
            name: "Atlas",
            version: "0.2.0-alpha.11",
            channel: "alpha",
        },
        packages: ATLAS_WORKSPACE_PACKAGE_INVENTORY.map((workspacePackage) => ({
            ...workspacePackage,
            allowedDependencies: [...workspacePackage.allowedDependencies],
        })),
        requiredQualityGates: [...ATLAS_WORKSPACE_QUALITY_GATES],
        plannedIntegrationClosures: ATLAS_PLANNED_INTEGRATION_CLOSURES.map((closure) => ({ ...closure })),
    };
}
export function inspectAtlasFrameworkReadiness(readiness = createAtlasFrameworkReadiness()) {
    return {
        ready: readiness.packages.every((workspacePackage) => workspacePackage.status === "active") &&
            readiness.plannedIntegrationClosures.every((closure) => closure.publicApi === "closed") &&
            readiness.requiredQualityGates.length === ATLAS_WORKSPACE_QUALITY_GATES.length,
        activePackages: readiness.packages.map((workspacePackage) => workspacePackage.name),
        closedIntegrations: readiness.plannedIntegrationClosures.map((closure) => closure.name),
        requiredQualityGates: [...readiness.requiredQualityGates],
    };
}
export function assertAtlasFrameworkReadiness(readiness = createAtlasFrameworkReadiness()) {
    const report = inspectAtlasFrameworkReadiness(readiness);
    if (!report.ready) {
        throw new Error("Atlas framework readiness is incomplete.");
    }
    return readiness;
}
