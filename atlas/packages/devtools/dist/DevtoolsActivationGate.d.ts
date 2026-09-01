import type { DevtoolsActivationBoundary, DevtoolsActivationLayer } from "./DevtoolsActivationBoundary";
export interface DevtoolsActivationGate {
    readonly active: false;
    readonly missingLayers: readonly DevtoolsActivationLayer[];
    readonly publicApiClosed: boolean;
    readonly reason: string;
}
export declare function inspectDevtoolsActivationGate(boundary: DevtoolsActivationBoundary): DevtoolsActivationGate;
