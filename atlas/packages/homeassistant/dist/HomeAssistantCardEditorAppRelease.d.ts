export type HomeAssistantCardEditorAppReleaseStatus = "ready" | "in-progress" | "planned";
export type HomeAssistantCardEditorAppReleaseEntrypoint = Readonly<{
    id: "administration" | "card-editor";
    label: string;
    url: string;
    port: number;
}>;
export type HomeAssistantCardEditorAppReleaseCheck = Readonly<{
    id: string;
    label: string;
    status: HomeAssistantCardEditorAppReleaseStatus;
    reason: string;
}>;
export type HomeAssistantCardEditorAppReleaseTarget = Readonly<{
    id: "standalone-docker" | "home-assistant-app" | "linux-installer" | "home-assistant-hacs" | "atlas-plugin";
    label: string;
    status: HomeAssistantCardEditorAppReleaseStatus;
    reason: string;
}>;
export type HomeAssistantCardEditorAppReleaseReadiness = Readonly<{
    kind: "atlas.homeassistant.card-editor.app-release-readiness";
    appId: "atlas.homeassistant.card-editor";
    name: "ATLAS Home Assistant Card Editor";
    version: string;
    releaseChannel: "local-preview";
    summary: Readonly<{
        ready: number;
        inProgress: number;
        planned: number;
    }>;
    entrypoints: readonly HomeAssistantCardEditorAppReleaseEntrypoint[];
    checks: readonly HomeAssistantCardEditorAppReleaseCheck[];
    targets: readonly HomeAssistantCardEditorAppReleaseTarget[];
    recommendedNextStep: string;
}>;
export declare function createHomeAssistantCardEditorAppReleaseReadiness(): HomeAssistantCardEditorAppReleaseReadiness;
