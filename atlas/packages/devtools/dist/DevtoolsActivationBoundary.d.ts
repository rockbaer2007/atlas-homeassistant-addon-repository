export type DevtoolsActivationLayer = "foundation" | "kernel" | "runtime" | "core";
export type DevtoolsActivationStatus = "planned";
export type DevtoolsPublicApiState = "closed";
export interface DevtoolsActivationBoundary {
    readonly packageName: "@atlas/devtools";
    readonly domain: "devtools";
    readonly status: DevtoolsActivationStatus;
    readonly requiredLayers: readonly DevtoolsActivationLayer[];
    readonly publicApi: {
        readonly state: DevtoolsPublicApiState;
        readonly reason: string;
    };
    readonly diagnosticsBoundary: {
        readonly inspectionOnly: true;
        readonly mutationEnabled: false;
    };
}
export declare function createDevtoolsActivationBoundary(): DevtoolsActivationBoundary;
export declare function isDevtoolsPublicApiClosed(boundary: DevtoolsActivationBoundary): boolean;
