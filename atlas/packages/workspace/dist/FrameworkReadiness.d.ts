export type AtlasWorkspacePackageName = "@atlas/workspace" | "@atlas/foundation" | "@atlas/kernel" | "@atlas/notifyarchive" | "@atlas/runtime" | "@atlas/core" | "@atlas/renderer" | "@atlas/theme" | "@atlas/homeassistant" | "@atlas/devtools";
export type AtlasWorkspacePackageDirectory = "workspace" | "foundation" | "kernel" | "notifyarchive" | "runtime" | "core" | "renderer" | "theme" | "homeassistant" | "devtools";
export type AtlasWorkspacePackageStatus = "active";
export type AtlasIntegrationClosureStatus = "planned";
export type AtlasIntegrationPublicApiState = "closed";
export type AtlasWorkspaceQualityGate = "check" | "build" | "tests" | "documentation" | "architectureReview";
export interface AtlasWorkspacePackageDescriptor {
    readonly name: AtlasWorkspacePackageName;
    readonly directory: AtlasWorkspacePackageDirectory;
    readonly layer: number;
    readonly status: AtlasWorkspacePackageStatus;
    readonly publicApi: "open" | "closed";
    readonly allowedDependencies: readonly AtlasWorkspacePackageDirectory[];
}
export interface AtlasPlannedIntegrationClosure {
    readonly name: Extract<AtlasWorkspacePackageName, "@atlas/devtools">;
    readonly directory: Extract<AtlasWorkspacePackageDirectory, "devtools">;
    readonly status: AtlasIntegrationClosureStatus;
    readonly publicApi: AtlasIntegrationPublicApiState;
    readonly reason: string;
}
export interface AtlasFrameworkReadiness {
    readonly framework: {
        readonly name: "Atlas";
        readonly version: "0.2.0-alpha.9";
        readonly channel: "alpha";
    };
    readonly packages: readonly AtlasWorkspacePackageDescriptor[];
    readonly requiredQualityGates: readonly AtlasWorkspaceQualityGate[];
    readonly plannedIntegrationClosures: readonly AtlasPlannedIntegrationClosure[];
}
export interface AtlasFrameworkReadinessReport {
    readonly ready: boolean;
    readonly activePackages: readonly AtlasWorkspacePackageName[];
    readonly closedIntegrations: readonly AtlasWorkspacePackageName[];
    readonly requiredQualityGates: readonly AtlasWorkspaceQualityGate[];
}
export declare const ATLAS_WORKSPACE_PACKAGE_INVENTORY: readonly AtlasWorkspacePackageDescriptor[];
export declare const ATLAS_WORKSPACE_QUALITY_GATES: readonly AtlasWorkspaceQualityGate[];
export declare const ATLAS_PLANNED_INTEGRATION_CLOSURES: readonly AtlasPlannedIntegrationClosure[];
export declare function createAtlasFrameworkReadiness(): AtlasFrameworkReadiness;
export declare function inspectAtlasFrameworkReadiness(readiness?: AtlasFrameworkReadiness): AtlasFrameworkReadinessReport;
export declare function assertAtlasFrameworkReadiness(readiness?: AtlasFrameworkReadiness): AtlasFrameworkReadiness;
