import type { AtlasPlannedIntegrationClosure, AtlasWorkspacePackageName, AtlasWorkspaceQualityGate } from "./FrameworkReadiness";
export type AtlasFrameworkCapabilityId = "homeassistant-status-panel";
export type AtlasFrameworkCapabilityPhase = "0.6-homeassistant";
export type AtlasFrameworkCapabilityStatus = "selected";
export type AtlasFrameworkCapabilityRisk = "integration-api-drift" | "renderer-side-effects" | "homeassistant-transport-coupling";
export interface AtlasFrameworkCapabilityDirection {
    readonly id: AtlasFrameworkCapabilityId;
    readonly phase: AtlasFrameworkCapabilityPhase;
    readonly status: AtlasFrameworkCapabilityStatus;
    readonly goal: string;
    readonly ownerPackages: readonly Extract<AtlasWorkspacePackageName, "@atlas/theme" | "@atlas/homeassistant">[];
    readonly protectedIntegrationClosures: readonly AtlasPlannedIntegrationClosure[];
    readonly requiredQualityGates: readonly AtlasWorkspaceQualityGate[];
    readonly risks: readonly AtlasFrameworkCapabilityRisk[];
}
export interface AtlasFrameworkCapabilityDirectionReport {
    readonly selected: boolean;
    readonly id: AtlasFrameworkCapabilityId;
    readonly ownerPackages: readonly AtlasWorkspacePackageName[];
    readonly protectedIntegrations: readonly AtlasWorkspacePackageName[];
    readonly requiredQualityGates: readonly AtlasWorkspaceQualityGate[];
    readonly risks: readonly AtlasFrameworkCapabilityRisk[];
}
export declare const ATLAS_NEXT_FRAMEWORK_CAPABILITY_DIRECTION: AtlasFrameworkCapabilityDirection;
export declare function createAtlasFrameworkCapabilityDirection(): AtlasFrameworkCapabilityDirection;
export declare function inspectAtlasFrameworkCapabilityDirection(direction?: AtlasFrameworkCapabilityDirection): AtlasFrameworkCapabilityDirectionReport;
export declare function assertAtlasFrameworkCapabilityDirection(direction?: AtlasFrameworkCapabilityDirection): AtlasFrameworkCapabilityDirection;
