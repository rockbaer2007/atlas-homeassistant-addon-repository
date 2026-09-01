import { describe, expect, it } from "vitest";
import {
  ATLAS_NEXT_FRAMEWORK_CAPABILITY_DIRECTION,
  ATLAS_PLANNED_INTEGRATION_CLOSURES,
  ATLAS_WORKSPACE_QUALITY_GATES,
  assertAtlasFrameworkCapabilityDirection,
  createAtlasFrameworkCapabilityDirection,
  inspectAtlasFrameworkCapabilityDirection,
} from "../src";

describe("Atlas framework capability direction", () => {
  it("selects the Home Assistant status panel as the next capability", () => {
    expect(ATLAS_NEXT_FRAMEWORK_CAPABILITY_DIRECTION).toMatchObject({
      id: "homeassistant-status-panel",
      phase: "0.6-homeassistant",
      status: "selected",
      ownerPackages: ["@atlas/theme", "@atlas/homeassistant"],
    });
  });

  it("keeps the capability direction independent from exported source constants", () => {
    const direction = createAtlasFrameworkCapabilityDirection();

    expect(direction).toEqual(ATLAS_NEXT_FRAMEWORK_CAPABILITY_DIRECTION);
    expect(direction.ownerPackages).not.toBe(
      ATLAS_NEXT_FRAMEWORK_CAPABILITY_DIRECTION.ownerPackages,
    );
    expect(direction.protectedIntegrationClosures).toEqual(
      ATLAS_PLANNED_INTEGRATION_CLOSURES,
    );
    expect(direction.protectedIntegrationClosures).not.toBe(
      ATLAS_PLANNED_INTEGRATION_CLOSURES,
    );
    expect(direction.requiredQualityGates).toEqual(ATLAS_WORKSPACE_QUALITY_GATES);
    expect(direction.requiredQualityGates).not.toBe(ATLAS_WORKSPACE_QUALITY_GATES);
  });

  it("reports selected capability direction details", () => {
    expect(inspectAtlasFrameworkCapabilityDirection()).toEqual({
      selected: true,
      id: "homeassistant-status-panel",
      ownerPackages: ["@atlas/theme", "@atlas/homeassistant"],
      protectedIntegrations: ["@atlas/devtools"],
      requiredQualityGates: [
        "check",
        "build",
        "tests",
        "documentation",
        "architectureReview",
      ],
      risks: [
        "integration-api-drift",
        "renderer-side-effects",
        "homeassistant-transport-coupling",
      ],
    });
  });

  it("keeps planned integrations closed while selecting the capability", () => {
    const direction = createAtlasFrameworkCapabilityDirection();

    expect(
      direction.protectedIntegrationClosures.every(
        (closure) => closure.publicApi === "closed",
      ),
    ).toBe(true);
  });

  it("rejects unselected capability directions", () => {
    const direction = createAtlasFrameworkCapabilityDirection();
    const unselectedDirection = {
      ...direction,
      ownerPackages: [],
    };

    expect(() => assertAtlasFrameworkCapabilityDirection(unselectedDirection)).toThrow(
      "Atlas framework capability direction is not selected.",
    );
  });

  it("rejects capability directions that open planned integrations", () => {
    const direction = createAtlasFrameworkCapabilityDirection();
    const openedIntegrationDirection = {
      ...direction,
      protectedIntegrationClosures: [
        {
          ...direction.protectedIntegrationClosures[0],
          publicApi: "open",
        },
      ],
    };

    expect(() =>
      assertAtlasFrameworkCapabilityDirection(openedIntegrationDirection),
    ).toThrow("Atlas framework capability direction is not selected.");
  });

  it("copies capability direction report arrays away from source direction arrays", () => {
    const direction = createAtlasFrameworkCapabilityDirection();
    const report = inspectAtlasFrameworkCapabilityDirection(direction);

    expect(report.ownerPackages).toEqual(direction.ownerPackages);
    expect(report.ownerPackages).not.toBe(direction.ownerPackages);
    expect(report.requiredQualityGates).toEqual(direction.requiredQualityGates);
    expect(report.requiredQualityGates).not.toBe(direction.requiredQualityGates);
    expect(report.risks).toEqual(direction.risks);
    expect(report.risks).not.toBe(direction.risks);
  });

  it("keeps capability direction reports independent from later direction mutations", () => {
    const direction = createAtlasFrameworkCapabilityDirection();
    const mutableDirection = {
      ...direction,
      ownerPackages: [...direction.ownerPackages],
      requiredQualityGates: [...direction.requiredQualityGates],
      risks: [...direction.risks],
    };
    const report = inspectAtlasFrameworkCapabilityDirection(mutableDirection);

    mutableDirection.ownerPackages.push("@atlas/devtools");
    mutableDirection.requiredQualityGates.push("check");
    mutableDirection.risks.push("renderer-side-effects");

    expect(report.ownerPackages).toEqual(["@atlas/theme", "@atlas/homeassistant"]);
    expect(report.requiredQualityGates).toEqual([
      "check",
      "build",
      "tests",
      "documentation",
      "architectureReview",
    ]);
    expect(report.risks).toEqual([
      "integration-api-drift",
      "renderer-side-effects",
      "homeassistant-transport-coupling",
    ]);
  });
});
