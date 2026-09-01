import type { HomeAssistantCardEditorSurfaceField } from "./HomeAssistantCardEditorPlan";
export type HomeAssistantCardArtifactKind = "atlas-card-package" | "home-assistant-card" | "external-card-builder-artifact" | "unknown";
export interface HomeAssistantCardArtifactInspection {
    readonly kind: HomeAssistantCardArtifactKind;
    readonly format: "json" | "yaml" | "unknown";
    readonly importable: boolean;
    readonly requiresReview: boolean;
    readonly reason: string;
}
export type HomeAssistantCardArtifactImportAction = "import" | "review" | "reject";
export interface HomeAssistantCardArtifactImportDecision {
    readonly action: HomeAssistantCardArtifactImportAction;
    readonly inspection: HomeAssistantCardArtifactInspection;
    readonly message: string;
}
export type HomeAssistantCardArtifactReviewSeverity = "info" | "warning" | "blocked";
export interface HomeAssistantCardArtifactReviewItem {
    readonly id: string;
    readonly label: string;
    readonly severity: HomeAssistantCardArtifactReviewSeverity;
    readonly detail: string;
}
export interface HomeAssistantCardArtifactReview {
    readonly inspection: HomeAssistantCardArtifactInspection;
    readonly items: readonly HomeAssistantCardArtifactReviewItem[];
    readonly recommendedAction: "map-schema" | "reject";
}
export interface HomeAssistantCardArtifactBlockMapping {
    readonly sourceId: string;
    readonly sourceType: string;
    readonly templateId: "entity-list" | "entity-card" | "state-button" | "switch-button" | "button-card" | "grid" | "sensor-card" | "thermostat-card" | "link-card" | "webpage-card" | "tabbed-card-v2" | "vertical-stack" | "horizontal-stack";
    readonly confidence: "high" | "medium" | "low";
    readonly reason: string;
}
export interface HomeAssistantCardArtifactMappingPreview {
    readonly inspection: HomeAssistantCardArtifactInspection;
    readonly mappings: readonly HomeAssistantCardArtifactBlockMapping[];
    readonly unmappedBlocks: readonly string[];
}
export interface HomeAssistantCardArtifactFieldPreview {
    readonly inspection: HomeAssistantCardArtifactInspection;
    readonly fields: readonly HomeAssistantCardEditorSurfaceField[];
    readonly unmappedBlocks: readonly string[];
    readonly requiresReview: true;
}
export declare function inspectHomeAssistantCardArtifact(text: string): HomeAssistantCardArtifactInspection;
export declare function decideHomeAssistantCardArtifactImport(text: string): HomeAssistantCardArtifactImportDecision;
export declare function createHomeAssistantCardArtifactReview(text: string): HomeAssistantCardArtifactReview;
export declare function previewHomeAssistantCardArtifactMapping(text: string): HomeAssistantCardArtifactMappingPreview;
export declare function previewHomeAssistantCardArtifactFields(text: string): HomeAssistantCardArtifactFieldPreview;
export declare function formatHomeAssistantCardArtifactReviewLines(text: string): readonly string[];
