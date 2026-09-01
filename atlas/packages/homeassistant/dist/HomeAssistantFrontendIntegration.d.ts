import type { HomeAssistantCardConfiguration, HomeAssistantCardDependencyAvailability, HomeAssistantCardExportFormat, HomeAssistantCardTarget, HomeAssistantLovelaceResource, HomeAssistantLovelaceResourceReference } from "./HomeAssistantCardConfiguration";
import type { HomeAssistantCardEditorDependencyPlan, HomeAssistantCardEditorPackagePlanInput } from "./HomeAssistantCardEditorPlan";
export type HomeAssistantAtlasInstallationMode = "server" | "hacs";
export interface HomeAssistantAtlasFrontendResource {
    readonly id: "atlas-server" | "atlas-hacs";
    readonly label: string;
    readonly required: boolean;
    readonly resourcePaths: readonly string[];
    readonly installSteps: readonly string[];
}
export interface HomeAssistantAtlasFrontendResourceAvailability {
    readonly resource: HomeAssistantAtlasFrontendResource;
    readonly status: "not-required" | "installed" | "missing";
    readonly matchedResourcePaths: readonly string[];
    readonly missingResourcePaths: readonly string[];
}
export interface HomeAssistantAtlasFrontendIntegrationPlanInput {
    readonly mode: HomeAssistantAtlasInstallationMode;
    readonly cardTarget?: HomeAssistantCardTarget;
    readonly card?: HomeAssistantCardConfiguration;
    readonly serverResourcePath?: string;
    readonly resources?: readonly (HomeAssistantLovelaceResource | string)[];
}
export interface HomeAssistantAtlasFrontendIntegrationPlan {
    readonly mode: HomeAssistantAtlasInstallationMode;
    readonly atlasResource: HomeAssistantAtlasFrontendResource;
    readonly atlasAvailability: HomeAssistantAtlasFrontendResourceAvailability;
    readonly cardAvailability: HomeAssistantCardDependencyAvailability;
    readonly requiredResourcePaths: readonly string[];
    readonly installSteps: readonly string[];
    readonly ready: boolean;
}
export interface HomeAssistantCardEditorFrontendIntegrationPlanInput {
    readonly mode: HomeAssistantAtlasInstallationMode;
    readonly editorPlan?: HomeAssistantCardEditorPackagePlanInput;
    readonly serverResourcePath?: string;
    readonly resources?: readonly (HomeAssistantLovelaceResource | string)[];
}
export interface HomeAssistantCardEditorFrontendIntegrationPlan {
    readonly mode: HomeAssistantAtlasInstallationMode;
    readonly atlasResource: HomeAssistantAtlasFrontendResource;
    readonly atlasAvailability: HomeAssistantAtlasFrontendResourceAvailability;
    readonly editorDependencyPlan: HomeAssistantCardEditorDependencyPlan;
    readonly matchedCardResourcePaths: readonly string[];
    readonly missingCardResourcePaths: readonly string[];
    readonly requiredResourcePaths: readonly string[];
    readonly installSteps: readonly string[];
    readonly ready: boolean;
}
export declare function createHomeAssistantAtlasFrontendIntegrationPlan(input: HomeAssistantAtlasFrontendIntegrationPlanInput): HomeAssistantAtlasFrontendIntegrationPlan;
export declare function createAtlasFrontendResource(mode: HomeAssistantAtlasInstallationMode, serverResourcePath?: string): HomeAssistantAtlasFrontendResource;
export declare function inspectAtlasFrontendResourceAvailability(resource: HomeAssistantAtlasFrontendResource, resources: readonly (HomeAssistantLovelaceResource | string)[]): HomeAssistantAtlasFrontendResourceAvailability;
export declare function createHomeAssistantAtlasFrontendResourceReferences(input: HomeAssistantAtlasFrontendIntegrationPlanInput): readonly HomeAssistantLovelaceResourceReference[];
export declare function serializeHomeAssistantAtlasFrontendResourceReferences(input: HomeAssistantAtlasFrontendIntegrationPlanInput, format: HomeAssistantCardExportFormat): string;
export declare function createHomeAssistantCardEditorFrontendIntegrationPlan(input: HomeAssistantCardEditorFrontendIntegrationPlanInput): HomeAssistantCardEditorFrontendIntegrationPlan;
export declare function createHomeAssistantCardEditorFrontendResourceReferences(input: HomeAssistantCardEditorFrontendIntegrationPlanInput): readonly HomeAssistantLovelaceResourceReference[];
export declare function serializeHomeAssistantCardEditorFrontendResourceReferences(input: HomeAssistantCardEditorFrontendIntegrationPlanInput, format: HomeAssistantCardExportFormat): string;
