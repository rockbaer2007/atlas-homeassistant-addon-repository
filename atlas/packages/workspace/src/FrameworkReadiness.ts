export type AtlasWorkspacePackageName =
  | "@atlas/workspace"
  | "@atlas/foundation"
  | "@atlas/kernel"
  | "@atlas/notifyarchive"
  | "@atlas/runtime"
  | "@atlas/core"
  | "@atlas/renderer"
  | "@atlas/theme"
  | "@atlas/homeassistant"
  | "@atlas/file-studio"
  | "@atlas/devtools";

export type AtlasWorkspacePackageDirectory =
  | "workspace"
  | "foundation"
  | "kernel"
  | "notifyarchive"
  | "runtime"
  | "core"
  | "renderer"
  | "theme"
  | "homeassistant"
  | "file-studio"
  | "devtools";

export type AtlasWorkspacePackageStatus = "active";

export type AtlasIntegrationClosureStatus = "planned";

export type AtlasIntegrationPublicApiState = "closed";

export type AtlasWorkspaceQualityGate =
  | "check"
  | "build"
  | "tests"
  | "documentation"
  | "architectureReview";

export interface AtlasWorkspacePackageDescriptor {
  readonly name: AtlasWorkspacePackageName;
  readonly directory: AtlasWorkspacePackageDirectory;
  readonly layer: number;
  readonly status: AtlasWorkspacePackageStatus;
  readonly publicApi: "open" | "closed";
  readonly allowedDependencies: readonly AtlasWorkspacePackageDirectory[];
}

export interface AtlasPlannedIntegrationClosure {
  readonly name: Extract<
    AtlasWorkspacePackageName,
    "@atlas/devtools"
  >;
  readonly directory: Extract<
    AtlasWorkspacePackageDirectory,
    "devtools"
  >;
  readonly status: AtlasIntegrationClosureStatus;
  readonly publicApi: AtlasIntegrationPublicApiState;
  readonly reason: string;
}

export interface AtlasFrameworkReadiness {
  readonly framework: {
    readonly name: "Atlas";
    readonly version: "0.2.0-alpha.24";
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

export const ATLAS_WORKSPACE_PACKAGE_INVENTORY: readonly AtlasWorkspacePackageDescriptor[] =
  [
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
      name: "@atlas/file-studio",
      directory: "file-studio",
      layer: 6,
      status: "active",
      publicApi: "open",
      allowedDependencies: ["runtime"],
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

export const ATLAS_WORKSPACE_QUALITY_GATES: readonly AtlasWorkspaceQualityGate[] =
  ["check", "build", "tests", "documentation", "architectureReview"];

export const ATLAS_PLANNED_INTEGRATION_CLOSURES: readonly AtlasPlannedIntegrationClosure[] =
  [
    {
      name: "@atlas/devtools",
      directory: "devtools",
      status: "planned",
      publicApi: "closed",
      reason:
        "Devtools activation waits for stable framework diagnostic inspection points.",
    },
  ];

export function createAtlasFrameworkReadiness(): AtlasFrameworkReadiness {
  return {
    framework: {
      name: "Atlas",
      version: "0.2.0-alpha.24",
      channel: "alpha",
    },
    packages: ATLAS_WORKSPACE_PACKAGE_INVENTORY.map((workspacePackage) => ({
      ...workspacePackage,
      allowedDependencies: [...workspacePackage.allowedDependencies],
    })),
    requiredQualityGates: [...ATLAS_WORKSPACE_QUALITY_GATES],
    plannedIntegrationClosures: ATLAS_PLANNED_INTEGRATION_CLOSURES.map(
      (closure) => ({ ...closure }),
    ),
  };
}

export function inspectAtlasFrameworkReadiness(
  readiness: AtlasFrameworkReadiness = createAtlasFrameworkReadiness(),
): AtlasFrameworkReadinessReport {
  return {
    ready:
      readiness.packages.every((workspacePackage) => workspacePackage.status === "active") &&
      readiness.plannedIntegrationClosures.every(
        (closure) => closure.publicApi === "closed",
      ) &&
      readiness.requiredQualityGates.length === ATLAS_WORKSPACE_QUALITY_GATES.length,
    activePackages: readiness.packages.map((workspacePackage) => workspacePackage.name),
    closedIntegrations: readiness.plannedIntegrationClosures.map(
      (closure) => closure.name,
    ),
    requiredQualityGates: [...readiness.requiredQualityGates],
  };
}

export function assertAtlasFrameworkReadiness(
  readiness: AtlasFrameworkReadiness = createAtlasFrameworkReadiness(),
): AtlasFrameworkReadiness {
  const report = inspectAtlasFrameworkReadiness(readiness);

  if (!report.ready) {
    throw new Error("Atlas framework readiness is incomplete.");
  }

  return readiness;
}
