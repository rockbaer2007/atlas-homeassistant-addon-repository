import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ATLAS_PLANNED_INTEGRATION_CLOSURES,
  ATLAS_WORKSPACE_PACKAGE_INVENTORY,
  ATLAS_WORKSPACE_QUALITY_GATES,
  assertAtlasFrameworkReadiness,
  createAtlasFrameworkReadiness,
  inspectAtlasFrameworkReadiness,
} from "../src";

interface PackageJson {
  readonly name: string;
  readonly dependencies?: Record<string, string>;
}

interface AtlasManifestJson {
  readonly framework: {
    readonly name: string;
    readonly version: string;
    readonly channel: string;
  };
  readonly packages: readonly string[];
}

interface AtlasPackagesJson {
  readonly packages: readonly {
    readonly name: string;
    readonly layer: number;
  }[];
}

interface AtlasDependenciesJson {
  readonly rules: readonly {
    readonly package: string;
    readonly allowed: readonly string[];
  }[];
}

interface AtlasQualityJson {
  readonly qualityGates: Record<string, boolean>;
}

const repositoryRoot = join(import.meta.dirname, "..", "..", "..");

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(join(repositoryRoot, path), "utf8")) as T;
}

function readPackageJson(packageDirectory: string): PackageJson {
  return readJson<PackageJson>(join("packages", packageDirectory, "package.json"));
}

describe("Atlas framework readiness", () => {
  it("describes the active framework package inventory in layer order", () => {
    expect(ATLAS_WORKSPACE_PACKAGE_INVENTORY.map((workspacePackage) => workspacePackage.name)).toEqual([
      "@atlas/workspace",
      "@atlas/foundation",
      "@atlas/kernel",
      "@atlas/notifyarchive",
      "@atlas/runtime",
      "@atlas/core",
      "@atlas/renderer",
      "@atlas/theme",
      "@atlas/homeassistant",
      "@atlas/file-studio",
      "@atlas/devtools",
    ]);

    expect(ATLAS_WORKSPACE_PACKAGE_INVENTORY.map((workspacePackage) => workspacePackage.layer)).toEqual([
      0,
      0,
      1,
      1,
      2,
      3,
      4,
      5,
      6,
      6,
      6,
    ]);
  });

  it("keeps the readiness model independent from exported source constants", () => {
    const readiness = createAtlasFrameworkReadiness();

    expect(readiness.packages).toEqual(ATLAS_WORKSPACE_PACKAGE_INVENTORY);
    expect(readiness.packages).not.toBe(ATLAS_WORKSPACE_PACKAGE_INVENTORY);
    expect(readiness.requiredQualityGates).toEqual(ATLAS_WORKSPACE_QUALITY_GATES);
    expect(readiness.requiredQualityGates).not.toBe(ATLAS_WORKSPACE_QUALITY_GATES);
    expect(readiness.plannedIntegrationClosures).toEqual(
      ATLAS_PLANNED_INTEGRATION_CLOSURES,
    );
    expect(readiness.plannedIntegrationClosures).not.toBe(
      ATLAS_PLANNED_INTEGRATION_CLOSURES,
    );
  });

  it("reports Atlas as ready when all active packages and closed integrations are present", () => {
    expect(inspectAtlasFrameworkReadiness()).toEqual({
      ready: true,
      activePackages: ATLAS_WORKSPACE_PACKAGE_INVENTORY.map(
        (workspacePackage) => workspacePackage.name,
      ),
      closedIntegrations: ["@atlas/devtools"],
      requiredQualityGates: [
        "check",
        "build",
        "tests",
        "documentation",
        "architectureReview",
      ],
    });
  });

  it("rejects incomplete readiness reports", () => {
    const readiness = createAtlasFrameworkReadiness();
    const incompleteReadiness = {
      ...readiness,
      plannedIntegrationClosures: [
        {
          ...readiness.plannedIntegrationClosures[0],
          publicApi: "open",
        },
      ],
    };

    expect(() => assertAtlasFrameworkReadiness(incompleteReadiness)).toThrow(
      "Atlas framework readiness is incomplete.",
    );
  });

  it("keeps root manifests aligned with the active workspace packages", () => {
    const manifest = readJson<AtlasManifestJson>("atlas.manifest.json");
    const packages = readJson<AtlasPackagesJson>("atlas.packages.json");
    const activeDirectories = ATLAS_WORKSPACE_PACKAGE_INVENTORY.map(
      (workspacePackage) => workspacePackage.directory,
    );

    expect(manifest.framework).toEqual({
      name: "Atlas",
      version: "0.2.0-alpha.28",
      channel: "alpha",
    });
    expect(manifest.packages).toEqual(activeDirectories);
    expect(packages.packages.map((workspacePackage) => workspacePackage.name)).toEqual(
      ATLAS_WORKSPACE_PACKAGE_INVENTORY.map((workspacePackage) => workspacePackage.name),
    );
    expect(packages.packages.map((workspacePackage) => workspacePackage.layer)).toEqual(
      ATLAS_WORKSPACE_PACKAGE_INVENTORY.map((workspacePackage) => workspacePackage.layer),
    );
  });

  it("keeps package directories and package names aligned with the readiness inventory", () => {
    const packageDirectories = readdirSync(join(repositoryRoot, "packages"), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    const inventoryDirectories = ATLAS_WORKSPACE_PACKAGE_INVENTORY.map(
      (workspacePackage) => workspacePackage.directory,
    ).sort();

    expect(packageDirectories).toEqual(inventoryDirectories);

    for (const workspacePackage of ATLAS_WORKSPACE_PACKAGE_INVENTORY) {
      expect(existsSync(join(repositoryRoot, "packages", workspacePackage.directory))).toBe(
        true,
      );
      expect(readPackageJson(workspacePackage.directory).name).toBe(workspacePackage.name);
    }
  });

  it("keeps dependency rules aligned with actual package dependencies", () => {
    const dependencies = readJson<AtlasDependenciesJson>("atlas.dependencies.json");

    expect(dependencies.rules.map((rule) => rule.package)).toEqual(
      ATLAS_WORKSPACE_PACKAGE_INVENTORY.map((workspacePackage) => workspacePackage.directory),
    );

    for (const workspacePackage of ATLAS_WORKSPACE_PACKAGE_INVENTORY) {
      const packageJson = readPackageJson(workspacePackage.directory);
      const atlasDependencies = Object.keys(packageJson.dependencies ?? {})
        .filter((dependency) => dependency.startsWith("@atlas/"))
        .map((dependency) => dependency.replace("@atlas/", ""))
        .sort();
      const rule = dependencies.rules.find(
        (dependencyRule) => dependencyRule.package === workspacePackage.directory,
      );

      expect(rule?.allowed.slice().sort()).toEqual(
        workspacePackage.allowedDependencies.slice().sort(),
      );
      expect(atlasDependencies.every((dependency) => rule?.allowed.includes(dependency))).toBe(
        true,
      );
    }
  });

  it("keeps required quality gates aligned with root quality configuration", () => {
    const quality = readJson<AtlasQualityJson>("atlas.quality.json");

    expect(
      ATLAS_WORKSPACE_QUALITY_GATES.every((qualityGate) => quality.qualityGates[qualityGate]),
    ).toBe(true);
  });
});
