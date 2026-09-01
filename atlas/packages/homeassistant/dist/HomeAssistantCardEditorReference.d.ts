export type HomeAssistantCardEditorReferenceUsage = "inspiration" | "interop-candidate" | "fork-candidate";
export interface HomeAssistantCardEditorReference {
    readonly name: string;
    readonly repositoryUrl: string;
    readonly license: string;
    readonly usage: readonly HomeAssistantCardEditorReferenceUsage[];
    readonly attributionRequired: boolean;
    readonly cloneRecommended: boolean;
    readonly notes: readonly string[];
}
export type HomeAssistantCardEditorInteropStatus = "supported" | "planned" | "blocked-by-license" | "not-planned";
export interface HomeAssistantCardEditorInteropCapability {
    readonly id: string;
    readonly label: string;
    readonly status: HomeAssistantCardEditorInteropStatus;
    readonly reason: string;
}
export interface HomeAssistantCardEditorInteropPlan {
    readonly reference: HomeAssistantCardEditorReference;
    readonly sourceCodePolicy: "do-not-copy";
    readonly capabilities: readonly HomeAssistantCardEditorInteropCapability[];
    readonly recommendedNextStep: string;
}
export declare function createHomeAssistantCardBuilderReference(): HomeAssistantCardEditorReference;
export declare function createHomeAssistantCardBuilderInteropPlan(): HomeAssistantCardEditorInteropPlan;
