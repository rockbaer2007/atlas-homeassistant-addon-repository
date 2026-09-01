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

export function createDevtoolsActivationBoundary(): DevtoolsActivationBoundary {
  return {
    packageName: "@atlas/devtools",
    domain: "devtools",
    status: "planned",
    requiredLayers: ["foundation", "kernel", "runtime", "core"],
    publicApi: {
      state: "closed",
      reason: "Devtools activation waits for stable framework diagnostic inspection points.",
    },
    diagnosticsBoundary: {
      inspectionOnly: true,
      mutationEnabled: false,
    },
  };
}

export function isDevtoolsPublicApiClosed(
  boundary: DevtoolsActivationBoundary,
): boolean {
  return boundary.publicApi.state === "closed";
}
