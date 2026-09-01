import { describe, expect, it } from "vitest";

import {
  analyzeHomeAssistantCardEditorSurface,
  arrangeHomeAssistantCardEditorSurfaceFields,
  createAtlasFrontendResource,
  clampSurfaceFieldPlacement,
  createHomeAssistantCardBuilderInteropPlan,
  createHomeAssistantCardBuilderReference,
  createHomeAssistantCardConfiguration,
  createHomeAssistantCardEditorConfiguration,
  createHomeAssistantCardEditorDependencyPlan,
  createHomeAssistantCardEditorFieldFromTemplate,
  createHomeAssistantCardEditorHacsBundle,
  createHomeAssistantCardEditorHacsBundleArchive,
  createHomeAssistantCardEditorHacsBundleReadinessOverview,
  createHomeAssistantCardEditorHacsBundleReadinessReport,
  createHomeAssistantCardEditorPackagePlan,
  createHomeAssistantCardEditorScriptExport,
  createHomeAssistantCardEditorFrontendIntegrationPlan,
  createHomeAssistantCardExportPackage,
  createHomeAssistantAtlasFrontendResourceReferences,
  createHomeAssistantAtlasFrontendIntegrationPlan,
  findHomeAssistantCardEditorTemplate,
  formatHomeAssistantCardEditorHacsBundlePackageReadReviewLines,
  formatHomeAssistantCardEditorHacsBundlePackageReadinessReviewLines,
  formatHomeAssistantCardEditorHacsBundleReadinessAttentionLines,
  formatHomeAssistantCardEditorHacsBundleReadinessGroupLines,
  formatHomeAssistantCardEditorHacsBundleReadinessOverviewLines,
  inspectHomeAssistantCardEditorHacsBundleArchive,
  listHomeAssistantCardEditorTemplates,
  normalizeHomeAssistantCustomElementName,
  normalizeHomeAssistantCardEditorScriptFilename,
  readHomeAssistantCardEditorHacsBundleArchivePackage,
  inspectAtlasFrontendResourceAvailability,
  serializeHomeAssistantCardEditorFrontendResourceReferences,
  serializeHomeAssistantAtlasFrontendResourceReferences,
} from "../src";

describe("Home Assistant frontend integration planning", () => {
  it("creates a self-hosted ATLAS frontend resource with a normalized resource path", () => {
    expect(createAtlasFrontendResource("server", "https://atlas.local/local/atlas/panel.js?v=1")).toEqual({
      id: "atlas-server",
      label: "ATLAS self-hosted frontend",
      required: true,
      resourcePaths: ["/local/atlas/panel.js"],
      installSteps: [
        "Serve the ATLAS Home Assistant panel from the ATLAS server",
        "/local/atlas/panel.js",
      ],
    });
  });

  it("creates the planned HACS ATLAS frontend resource", () => {
    expect(createAtlasFrontendResource("hacs")).toEqual({
      id: "atlas-hacs",
      label: "ATLAS HACS frontend integration",
      required: true,
      resourcePaths: ["/hacsfiles/atlas/atlas-homeassistant-panel.js"],
      installSteps: [
        "HACS > Custom repositories > ATLAS",
        "HACS > Frontend > ATLAS",
        "/hacsfiles/atlas/atlas-homeassistant-panel.js",
      ],
    });
  });

  it("checks whether the ATLAS frontend resource is registered in Lovelace", () => {
    const resource = createAtlasFrontendResource("server", "/local/atlas/panel.js");

    expect(inspectAtlasFrontendResourceAvailability(resource, [
      "https://homeassistant.local/local/atlas/panel.js?v=2026.8",
    ])).toMatchObject({
      status: "installed",
      matchedResourcePaths: ["/local/atlas/panel.js"],
      missingResourcePaths: [],
    });

    expect(inspectAtlasFrontendResourceAvailability(resource, [
      "/local/atlas/other-panel.js",
    ])).toMatchObject({
      status: "missing",
      matchedResourcePaths: [],
      missingResourcePaths: ["/local/atlas/panel.js"],
    });
  });

  it("combines ATLAS and card dependency readiness in one integration plan", () => {
    const plan = createHomeAssistantAtlasFrontendIntegrationPlan({
      mode: "hacs",
      cardTarget: "bubble",
      resources: [
        "/hacsfiles/atlas/atlas-homeassistant-panel.js",
        "/hacsfiles/Bubble-Card/bubble-card.js",
      ],
    });

    expect(plan.ready).toBe(true);
    expect(plan.requiredResourcePaths).toEqual([
      "/hacsfiles/atlas/atlas-homeassistant-panel.js",
      "/hacsfiles/Bubble-Card/bubble-card.js",
    ]);
    expect(plan.installSteps).toContain("HACS > Frontend > ATLAS");
    expect(plan.installSteps).toContain("HACS > Frontend > Bubble Card");
  });

  it("keeps ATLAS and HACS frontend resource path matching case-sensitive", () => {
    const plan = createHomeAssistantAtlasFrontendIntegrationPlan({
      mode: "hacs",
      cardTarget: "bubble",
      resources: [
        "/hacsfiles/Atlas/atlas-homeassistant-panel.js",
        "/hacsfiles/bubble-card/bubble-card.js",
      ],
    });

    expect(plan.ready).toBe(false);
    expect(plan.atlasAvailability).toMatchObject({
      status: "missing",
      matchedResourcePaths: [],
      missingResourcePaths: ["/hacsfiles/atlas/atlas-homeassistant-panel.js"],
    });
    expect(plan.cardAvailability).toMatchObject({
      status: "missing",
      matchedResourcePaths: [],
      missingResourcePaths: ["/hacsfiles/Bubble-Card/bubble-card.js"],
    });
  });

  it("reports missing custom card resources even when ATLAS itself is installed", () => {
    const plan = createHomeAssistantAtlasFrontendIntegrationPlan({
      mode: "server",
      serverResourcePath: "/local/atlas/panel.js",
      cardTarget: "mushroom-template",
      resources: ["/local/atlas/panel.js"],
    });

    expect(plan.ready).toBe(false);
    expect(plan.atlasAvailability.status).toBe("installed");
    expect(plan.cardAvailability).toMatchObject({
      status: "missing",
      missingResourcePaths: ["/hacsfiles/lovelace-mushroom/mushroom.js"],
    });
  });

  it("creates copy-ready Lovelace resources for ATLAS and the selected card dependency", () => {
    const input = {
      mode: "server" as const,
      serverResourcePath: "/local/atlas/panel.js",
      cardTarget: "bubble" as const,
    };

    expect(createHomeAssistantAtlasFrontendResourceReferences(input)).toEqual([
      {
        url: "/local/atlas/panel.js",
        type: "module",
      },
      {
        url: "/hacsfiles/Bubble-Card/bubble-card.js",
        type: "module",
      },
    ]);
    expect(serializeHomeAssistantAtlasFrontendResourceReferences(input, "yaml")).toBe([
      "- url: \"/local/atlas/panel.js\"",
      "  type: \"module\"",
      "- url: \"/hacsfiles/Bubble-Card/bubble-card.js\"",
      "  type: \"module\"",
    ].join("\n"));
    expect(serializeHomeAssistantAtlasFrontendResourceReferences({
      mode: "hacs",
      cardTarget: "entities",
    }, "json")).toBe(JSON.stringify([
      {
        url: "/hacsfiles/atlas/atlas-homeassistant-panel.js",
        type: "module",
      },
    ], null, 2));
  });

  it("plans a HACS card editor package with demo entities and a custom script filename", () => {
    expect(createHomeAssistantCardEditorPackagePlan({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
    })).toEqual({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      resourcePath: "/hacsfiles/atlas/energy-kitchen.js",
      editorMode: "simple",
      simpleTarget: "entities",
      defaultEntityIds: [
        "binary_sensor.atlas_status",
        "sensor.atlas_temperature",
      ],
      supportedLayouts: [
        "single",
        "horizontal-stack",
        "vertical-stack",
      ],
      supportedFieldTargets: [
        "entities",
        "glance",
        "entity",
        "button",
        "sensor",
        "thermostat",
        "link",
        "webpage",
        "bubble",
        "mushroom-template",
        "tabbed-card-v2",
      ],
      fields: [],
      layoutMode: "drag-and-drop",
      replacementHint: "Replace the demo entities with your own Home Assistant entities.",
    });
  });

  it("plans expert card editor fields with per-field card targets", () => {
    expect(createHomeAssistantCardEditorPackagePlan({
      cardName: "Kitchen Panel",
      editorMode: "expert",
      fields: [
        {
          id: " main light ",
          target: "bubble",
          entityId: " light.kitchen ",
          column: 1.8,
          row: -1,
          width: 2.2,
          height: 0,
        },
        {
          id: "",
          target: "mushroom-template",
          entityId: "sensor.kitchen_temperature",
          column: 3,
          row: 1,
          width: 1,
          height: 1,
        },
      ],
    }).fields).toEqual([
      {
        id: "main light",
        target: "bubble",
        bubbleButtonType: "state",
        entityId: "light.kitchen",
        layout: "card",
        entries: [],
        column: 1,
        row: 0,
        width: 2,
        height: 1,
      },
      {
        id: "mushroom-template-sensor.kitchen_temperature",
        target: "mushroom-template",
        entityId: "sensor.kitchen_temperature",
        layout: "card",
        entries: [],
        column: 3,
        row: 1,
        width: 1,
        height: 1,
      },
    ]);
  });

  it("lists visual sidebar templates for expert card placement", () => {
    expect(listHomeAssistantCardEditorTemplates().map(template => template.id)).toEqual([
      "entity-list",
      "glance-card",
      "entity-card",
      "button-card",
      "grid",
      "sensor-card",
      "thermostat-card",
      "link-card",
      "webpage-card",
      "tabbed-card-v2",
      "state-button",
      "switch-button",
      "vertical-stack",
      "horizontal-stack",
    ]);
    expect(listHomeAssistantCardEditorTemplates().map(template => [template.id, template.defaultWidth, template.defaultHeight])).toEqual([
      ["entity-list", 4, 2],
      ["glance-card", 8, 3],
      ["entity-card", 4, 2],
      ["button-card", 4, 2],
      ["grid", 6, 3],
      ["sensor-card", 4, 2],
      ["thermostat-card", 4, 3],
      ["link-card", 4, 2],
      ["webpage-card", 8, 4],
      ["tabbed-card-v2", 8, 3],
      ["state-button", 4, 2],
      ["switch-button", 4, 2],
      ["vertical-stack", 4, 2],
      ["horizontal-stack", 4, 2],
    ]);
    expect(findHomeAssistantCardEditorTemplate("switch-button")).toMatchObject({
      label: "Switch button",
      target: "bubble",
      defaultEntityDomain: "switch",
      preview: ["Switch", "On/off"],
    });
  });

  it("creates bounded expert fields from sidebar templates and selected card families", () => {
    expect(createHomeAssistantCardEditorFieldFromTemplate({
      template: "state-button",
      target: "mushroom-template",
      entityId: "sensor.office_temperature",
      id: "Office temperature",
      column: 11,
      row: 11,
      width: 4,
      height: 3,
      bounds: {
        columns: 12,
        rows: 12,
      },
    })).toEqual({
      id: "Office temperature",
      target: "mushroom-template",
      entityId: "sensor.office_temperature",
      layout: "card",
      entries: [],
      column: 8,
      row: 9,
      width: 4,
      height: 3,
    });
  });

  it("creates stack fields from sidebar templates", () => {
    expect(createHomeAssistantCardEditorFieldFromTemplate({
      template: "vertical-stack",
      target: "bubble",
      entityId: "switch.office_fan",
      column: 2,
      row: 1,
    })).toMatchObject({
      id: "Vertical stack",
      target: "bubble",
      entityId: "",
      layout: "vertical-stack",
      entries: [],
      column: 2,
      row: 1,
      width: 4,
      height: 2,
    });
  });

  it("analyzes expert editor surface occupancy and empty fields", () => {
    expect(analyzeHomeAssistantCardEditorSurface([
      {
        id: "Kitchen light",
        target: "bubble",
        bubbleButtonType: "switch",
        entityId: "switch.kitchen_light",
        layout: "card",
        entries: [],
        column: 0,
        row: 0,
        width: 4,
        height: 2,
      },
      {
        id: "Climate links",
        target: "entities",
        entityId: "",
        layout: "horizontal-stack",
        entries: [
          {
            id: "Temperature",
            target: "mushroom-template",
            entityId: "sensor.kitchen_temperature",
          },
          {
            id: "Placeholder",
            target: "bubble",
            bubbleButtonType: "name",
            entityId: "",
          },
        ],
        column: 4,
        row: 0,
        width: 8,
        height: 2,
      },
      {
        id: "Empty field",
        target: "entities",
        entityId: "",
        layout: "card",
        entries: [],
        column: 0,
        row: 3,
        width: 4,
        height: 2,
      },
    ])).toEqual({
      fieldCount: 3,
      populatedFieldCount: 2,
      emptyFieldCount: 1,
      overlapCount: 0,
      rowCount: 2,
      usedColumns: 12,
      usedRows: 5,
      usedTargets: ["bubble", "mushroom-template", "entities"],
      layouts: ["card", "horizontal-stack"],
      emptyFieldIds: ["Empty field"],
      overlappingFieldIds: [],
      overlaps: [],
    });
  });

  it("detects overlapping expert editor surface fields", () => {
    expect(analyzeHomeAssistantCardEditorSurface([
      {
        id: "Top left",
        target: "entities",
        entityId: "sensor.top_left",
        column: 0,
        row: 0,
        width: 4,
        height: 2,
      },
      {
        id: "Touching edge",
        target: "entities",
        entityId: "sensor.touching_edge",
        column: 4,
        row: 0,
        width: 2,
        height: 2,
      },
      {
        id: "Overlapping",
        target: "button",
        entityId: "light.overlapping",
        column: 3,
        row: 1,
        width: 3,
        height: 2,
      },
    ])).toMatchObject({
      overlapCount: 2,
      overlappingFieldIds: ["Top left", "Overlapping", "Touching edge"],
      overlaps: [
        {
          firstFieldId: "Top left",
          secondFieldId: "Overlapping",
        },
        {
          firstFieldId: "Touching edge",
          secondFieldId: "Overlapping",
        },
      ],
    });
  });

  it("does not count nested card containers as overlap conflicts", () => {
    expect(analyzeHomeAssistantCardEditorSurface([
      {
        id: "Room tabs",
        target: "tabbed-card-v2",
        entityId: "light.room",
        column: 0,
        row: 0,
        width: 8,
        height: 3,
      },
      {
        id: "Dropped card",
        target: "entity",
        entityId: "sensor.room",
        column: 2,
        row: 1,
        width: 3,
        height: 2,
      },
      {
        id: "Vertical stack",
        target: "entities",
        entityId: "",
        layout: "vertical-stack",
        entries: [
          {
            id: "Stack card",
            target: "entity",
            entityId: "sensor.stack",
          },
        ],
        column: 1,
        row: 1,
        width: 4,
        height: 2,
      },
      {
        id: "Horizontal stack",
        target: "entities",
        entityId: "",
        layout: "horizontal-stack",
        entries: [
          {
            id: "Row card",
            target: "entity",
            entityId: "sensor.row",
          },
        ],
        column: 2,
        row: 2,
        width: 4,
        height: 2,
      },
    ])).toMatchObject({
      overlapCount: 0,
      overlappingFieldIds: [],
      overlaps: [],
    });
  });

  it("arranges expert editor fields into free grid positions", () => {
    const arrangedFields = arrangeHomeAssistantCardEditorSurfaceFields([
      {
        id: "Second",
        target: "entities",
        entityId: "sensor.second",
        column: 0,
        row: 0,
        width: 3,
        height: 2,
      },
      {
        id: "First",
        target: "entities",
        entityId: "sensor.first",
        column: 0,
        row: 0,
        width: 4,
        height: 2,
      },
      {
        id: "Third",
        target: "button",
        entityId: "light.third",
        column: 2,
        row: 1,
        width: 3,
        height: 2,
      },
    ], {
      columns: 8,
      rows: 4,
    });

    expect(arrangedFields.map(field => [field.id, field.column, field.row, field.width, field.height])).toEqual([
      ["First", 0, 0, 4, 2],
      ["Second", 4, 0, 3, 2],
      ["Third", 0, 2, 3, 2],
    ]);
    expect(analyzeHomeAssistantCardEditorSurface(arrangedFields).overlapCount).toBe(0);
  });

  it("uses custom titles for stack field entries", () => {
    expect(createHomeAssistantCardEditorFieldFromTemplate({
      template: "horizontal-stack",
      target: "mushroom-template",
      entityId: "sensor.office_temperature",
      id: "Office temperature",
      column: 0,
      row: 0,
    }).entries).toEqual([]);
  });

  it("clamps surface placement inside the editor grid", () => {
    expect(clampSurfaceFieldPlacement({
      column: 8.8,
      row: -1,
      width: 8,
      height: 0,
    }, {
      columns: 10,
      rows: 6,
    })).toEqual({
      column: 2,
      row: 0,
      width: 8,
      height: 1,
    });
  });

  it("tracks card builder as an attributed external reference instead of a copied dependency", () => {
    expect(createHomeAssistantCardBuilderReference()).toEqual({
      name: "studiobts/home-assistant-card-builder",
      repositoryUrl: "https://github.com/studiobts/home-assistant-card-builder",
      license: "AGPL-3.0",
      usage: ["inspiration", "interop-candidate", "fork-candidate"],
      attributionRequired: true,
      cloneRecommended: false,
      notes: [
        "Use as an external product and architecture reference for the ATLAS Home Assistant editor.",
        "Do not copy source code into ATLAS without explicitly accepting AGPL-3.0 obligations.",
        "If ATLAS ever becomes a fork or derivative, keep original copyright notices and publish source according to AGPL-3.0.",
        "Prefer independent ATLAS contracts, import/export compatibility and clear documentation references.",
      ],
    });
  });

  it("plans card builder interoperability without source copying", () => {
    const interopPlan = createHomeAssistantCardBuilderInteropPlan();

    expect(interopPlan.sourceCodePolicy).toBe("do-not-copy");
    expect(interopPlan.recommendedNextStep).toBe(
      "Keep ATLAS independent, then add import/export compatibility only through documented schemas and explicit attribution.",
    );
    expect(interopPlan.capabilities).toEqual([
      {
        id: "product-reference",
        label: "Use product concepts as an external reference",
        status: "supported",
        reason: "Public behavior, documentation and product ideas can inform independent ATLAS contracts.",
      },
      {
        id: "atlas-importer",
        label: "Evaluate import of exported card artifacts",
        status: "planned",
        reason: "Import compatibility can be designed around documented artifacts without copying implementation code.",
      },
      {
        id: "atlas-exporter",
        label: "Evaluate export toward compatible Home Assistant card artifacts",
        status: "planned",
        reason: "ATLAS can expose its own export model and later map it to compatible formats when license boundaries are clear.",
      },
      {
        id: "source-clone",
        label: "Copy source code directly into ATLAS",
        status: "blocked-by-license",
        reason: "The reference project is AGPL-3.0; copying source would require an explicit derivative-work decision and license compliance.",
      },
      {
        id: "silent-fork",
        label: "Create an unattributed fork",
        status: "not-planned",
        reason: "ATLAS must keep original attribution and license notices if a fork is ever intentionally created.",
      },
    ]);
  });

  it("tracks the selected simple editor card target dependency", () => {
    expect(createHomeAssistantCardEditorDependencyPlan({
      editorMode: "simple",
      simpleTarget: "bubble",
    })).toMatchObject({
      usedTargets: ["bubble"],
      requiredResourcePaths: ["/hacsfiles/Bubble-Card/bubble-card.js"],
      installSteps: ["HACS > Frontend > Bubble Card", "/hacsfiles/Bubble-Card/bubble-card.js"],
    });
  });

  it("combines dependencies from mixed expert editor fields", () => {
    const dependencyPlan = createHomeAssistantCardEditorDependencyPlan({
      editorMode: "expert",
      fields: [
        {
          id: "status",
          target: "entities",
          entityId: "binary_sensor.atlas_status",
          column: 0,
          row: 0,
          width: 1,
          height: 1,
        },
        {
          id: "temperature",
          target: "mushroom-template",
          entityId: "sensor.atlas_temperature",
          column: 1,
          row: 0,
          width: 1,
          height: 1,
        },
        {
          id: "door",
          target: "bubble",
          entityId: "binary_sensor.atlas_door",
          layout: "vertical-stack",
          entries: [
            {
              id: "temperature",
              target: "mushroom-template",
              entityId: "sensor.atlas_temperature",
            },
            {
              id: "status",
              target: "entities",
              entityId: "binary_sensor.atlas_status",
            },
            {
              id: "door",
              target: "bubble",
              entityId: "binary_sensor.atlas_door",
            },
          ],
          column: 0,
          row: 1,
          width: 2,
          height: 1,
        },
      ],
    });

    expect(dependencyPlan.usedTargets).toEqual(["entities", "mushroom-template", "bubble"]);
    expect(dependencyPlan.requiredResourcePaths).toEqual([
      "/hacsfiles/lovelace-mushroom/mushroom.js",
      "/hacsfiles/Bubble-Card/bubble-card.js",
    ]);
    expect(dependencyPlan.installSteps).toContain("HACS > Frontend > Mushroom");
    expect(dependencyPlan.installSteps).toContain("HACS > Frontend > Bubble Card");
  });

  it("creates frontend resource references for mixed expert editor dependencies", () => {
    const editorPlan = {
      editorMode: "expert" as const,
      fields: [
        {
          id: "temperature",
          target: "mushroom-template" as const,
          entityId: "sensor.atlas_temperature",
          column: 0,
          row: 0,
          width: 2,
          height: 1,
        },
        {
          id: "door",
          target: "bubble" as const,
          entityId: "binary_sensor.atlas_door",
          column: 2,
          row: 0,
          width: 2,
          height: 1,
        },
      ],
    };

    const integrationPlan = createHomeAssistantCardEditorFrontendIntegrationPlan({
      mode: "server",
      editorPlan,
      resources: [
        "/local/atlas/atlas-homeassistant-panel.js",
        "/hacsfiles/lovelace-mushroom/mushroom.js",
      ],
    });

    expect(integrationPlan).toMatchObject({
      requiredResourcePaths: [
        "/local/atlas/atlas-homeassistant-panel.js",
        "/hacsfiles/lovelace-mushroom/mushroom.js",
        "/hacsfiles/Bubble-Card/bubble-card.js",
      ],
      matchedCardResourcePaths: ["/hacsfiles/lovelace-mushroom/mushroom.js"],
      missingCardResourcePaths: ["/hacsfiles/Bubble-Card/bubble-card.js"],
      ready: false,
    });
    expect(serializeHomeAssistantCardEditorFrontendResourceReferences({
      mode: "server",
      editorPlan,
    }, "yaml")).toBe([
      "- url: \"/local/atlas/atlas-homeassistant-panel.js\"",
      "  type: \"module\"",
      "- url: \"/hacsfiles/lovelace-mushroom/mushroom.js\"",
      "  type: \"module\"",
      "- url: \"/hacsfiles/Bubble-Card/bubble-card.js\"",
      "  type: \"module\"",
    ].join("\n"));
  });

  it("creates a simple editor card configuration from the selected target and demo entities", () => {
    expect(createHomeAssistantCardEditorConfiguration({
      cardName: "Demo Status",
      editorMode: "simple",
      simpleTarget: "entities",
    })).toEqual({
      type: "entities",
      title: "Demo Status",
      entities: [
        { entity: "binary_sensor.atlas_status" },
        { entity: "sensor.atlas_temperature" },
      ],
    });
  });

  it("creates an ordered stack card configuration from expert editor fields", () => {
    expect(createHomeAssistantCardEditorConfiguration({
      editorMode: "expert",
      fields: [
        {
          id: "Door",
          target: "bubble",
          entityId: "binary_sensor.atlas_door",
          column: 1,
          row: 1,
          width: 1,
          height: 1,
        },
        {
          id: "Temperature",
          target: "mushroom-template",
          entityId: "sensor.atlas_temperature",
          column: 0,
          row: 0,
          width: 1,
          height: 1,
        },
      ],
    })).toEqual({
      type: "vertical-stack",
      cards: [
        {
          type: "custom:mushroom-template-card",
          primary: "Temperature",
          secondary: "sensor.atlas_temperature",
          entity: "sensor.atlas_temperature",
        },
        {
          type: "custom:bubble-card",
          card_type: "button",
          button_type: "state",
          name: "Door",
          entity: "binary_sensor.atlas_door",
          show_state: true,
        },
      ],
    });
  });

  it("creates Tabbed Card V2 containers with stacked cards inside tabs", () => {
    expect(createHomeAssistantCardEditorConfiguration({
      editorMode: "expert",
      fields: [
        {
          id: "Room tabs",
          target: "tabbed-card-v2",
          entityId: "light.living_room",
          layout: "vertical-stack",
          activeTabIndex: 1,
          entries: [
            {
              id: "Light",
              target: "entity",
              entityId: "light.living_room",
              icon: "mdi:lightbulb",
              cards: [
                {
                  id: "Living light",
                  target: "entity",
                  entityId: "light.living_room",
                },
                {
                  id: "Living switch",
                  target: "bubble",
                  bubbleButtonType: "switch",
                  entityId: "switch.living_room",
                },
              ],
            },
            {
              id: "Climate",
              target: "sensor",
              entityId: "sensor.living_room_temperature",
              icon: "mdi:thermometer",
            },
          ],
          column: 0,
          row: 0,
          width: 8,
          height: 3,
        },
      ],
    })).toEqual({
      type: "custom:tabbed-card-v2",
      options: {
        defaultTabIndex: 1,
      },
      tabs: [
        {
          attributes: {
            label: "Light",
            icon: "mdi:lightbulb",
          },
          card: {
            type: "vertical-stack",
            cards: [
              {
                type: "entity",
                name: "Living light",
                entity: "light.living_room",
              },
              {
                type: "custom:bubble-card",
                card_type: "button",
                button_type: "switch",
                name: "Living switch",
                entity: "switch.living_room",
                show_state: true,
              },
            ],
          },
        },
        {
          attributes: {
            label: "Climate",
            icon: "mdi:thermometer",
          },
          card: {
            type: "sensor",
            name: "Climate",
            entity: "sensor.living_room_temperature",
          },
        },
      ],
    });
  });

  it("creates Tabbed Card V2 tabs as labels for nested cards", () => {
    expect(createHomeAssistantCardEditorConfiguration({
      editorMode: "expert",
      fields: [
        {
          id: "Room tabs",
          target: "tabbed-card-v2",
          entityId: "",
          layout: "vertical-stack",
          activeTabIndex: 0,
          columns: "full",
          rows: "auto",
          entries: [
            {
              id: "Light",
              icon: "mdi:lightbulb",
              cards: [
                {
                  id: "Living light",
                  target: "entity",
                  entityId: "light.living_room",
                },
              ],
            },
            {
              id: "Empty",
              icon: "mdi:tab",
              cards: [],
            },
          ],
          column: 0,
          row: 0,
          width: 8,
          height: 3,
        },
      ],
    })).toEqual({
      type: "custom:tabbed-card-v2",
      options: {
        defaultTabIndex: 0,
      },
      columns: "full",
      rows: "auto",
      tabs: [
        {
          attributes: {
            label: "Light",
            icon: "mdi:lightbulb",
          },
          card: {
            type: "entity",
            name: "Living light",
            entity: "light.living_room",
          },
        },
      ],
    });
  });

  it("creates nested horizontal and vertical stacks from an arbitrary expert surface", () => {
    expect(createHomeAssistantCardEditorConfiguration({
      editorMode: "expert",
      fields: [
        {
          id: "Top left",
          target: "bubble",
          entityId: "light.top_left",
          column: 0,
          row: 0,
          width: 2,
          height: 1,
        },
        {
          id: "Top right",
          target: "mushroom-template",
          entityId: "sensor.top_right",
          column: 2,
          row: 0,
          width: 2,
          height: 1,
        },
        {
          id: "Middle row",
          target: "entities",
          entityId: "binary_sensor.middle",
          column: 0,
          row: 1,
          width: 4,
          height: 1,
        },
        {
          id: "Bottom stack",
          target: "entities",
          entityId: "",
          layout: "vertical-stack",
          entries: [
            {
              id: "First",
              target: "bubble",
              entityId: "switch.first",
            },
            {
              id: "Second",
              target: "mushroom-template",
              entityId: "sensor.second",
            },
          ],
          column: 0,
          row: 2,
          width: 2,
          height: 2,
        },
        {
          id: "Bottom right",
          target: "bubble",
          entityId: "light.bottom_right",
          column: 2,
          row: 2,
          width: 2,
          height: 2,
        },
      ],
    })).toEqual({
      type: "vertical-stack",
      cards: [
        {
          type: "horizontal-stack",
          cards: [
            {
              type: "custom:bubble-card",
              card_type: "button",
              button_type: "state",
              name: "Top left",
              entity: "light.top_left",
              show_state: true,
            },
            {
              type: "custom:mushroom-template-card",
              primary: "Top right",
              secondary: "sensor.top_right",
              entity: "sensor.top_right",
            },
          ],
        },
        {
          type: "entities",
          title: "Middle row",
          entities: [
            { entity: "binary_sensor.middle" },
          ],
        },
        {
          type: "horizontal-stack",
          cards: [
            {
              type: "vertical-stack",
              cards: [
                {
                  type: "custom:bubble-card",
                  card_type: "button",
                  button_type: "state",
                  name: "First",
                  entity: "switch.first",
                  show_state: true,
                },
                {
                  type: "custom:mushroom-template-card",
                  primary: "Second",
                  secondary: "sensor.second",
                  entity: "sensor.second",
                },
              ],
            },
            {
              type: "custom:bubble-card",
              card_type: "button",
              button_type: "state",
              name: "Bottom right",
              entity: "light.bottom_right",
              show_state: true,
            },
          ],
        },
      ],
    });
  });

  it("falls back to demo entities when an expert editor plan has no populated fields", () => {
    expect(createHomeAssistantCardEditorConfiguration({
      cardName: "Empty Expert",
      editorMode: "expert",
      fields: [],
    })).toEqual({
      type: "entities",
      title: "Empty Expert",
      entities: [
        { entity: "binary_sensor.atlas_status" },
        { entity: "sensor.atlas_temperature" },
      ],
    });
  });

  it("normalizes user-defined card editor script filenames", () => {
    expect(normalizeHomeAssistantCardEditorScriptFilename("My Fancy Card")).toBe("my-fancy-card.js");
    expect(normalizeHomeAssistantCardEditorScriptFilename("already-ready.js")).toBe("already-ready.js");
    expect(normalizeHomeAssistantCardEditorScriptFilename("")).toBe("atlas-card.js");
  });

  it("creates an installable custom card script export with demo entity defaults", () => {
    const scriptExport = createHomeAssistantCardEditorScriptExport({
      cardName: "Energy Kitchen",
      scriptFilename: "Energy Kitchen.js",
      defaultEntityIds: ["sensor.energy_today", "binary_sensor.energy_ready"],
    });

    expect(scriptExport).toMatchObject({
      filename: "energy-kitchen.js",
      customElementName: "energy-kitchen",
      cardType: "custom:energy-kitchen",
      resourcePath: "/hacsfiles/atlas/energy-kitchen.js",
      defaultConfig: {
        type: "custom:energy-kitchen",
        title: "Energy Kitchen",
        entities: ["sensor.energy_today", "binary_sensor.energy_ready"],
        replacement_hint: "Replace the demo entities with your own Home Assistant entities.",
      },
    });
    expect(scriptExport.source).toContain("class EnergyKitchenCard extends HTMLElement");
    expect(scriptExport.source).toContain("static getStubConfig()");
    expect(scriptExport.source).toContain("customElements.define(\"energy-kitchen\"");
    expect(normalizeHomeAssistantCustomElementName("Kitchen")).toBe("kitchen-card");
    expect(normalizeHomeAssistantCustomElementName("123 Kitchen")).toBe("atlas-123-kitchen");
  });

  it("creates a zip-ready HACS card bundle file list from an ATLAS card package", () => {
    const editorPlan = createHomeAssistantCardEditorPackagePlan({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      defaultEntityIds: ["sensor.energy_today"],
    });
    const cardPackage = createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardConfiguration({
        target: "entities",
        title: "Energy Kitchen",
        entityIds: ["sensor.energy_today"],
      }),
      format: "json",
      name: "Energy Kitchen",
      languages: ["de", "fr"],
      editorPlan,
    });
    const bundle = createHomeAssistantCardEditorHacsBundle(cardPackage);

    expect(bundle).toMatchObject({
      version: 1,
      kind: "atlas.homeassistant.hacs-card-bundle",
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      customElementName: "energy-kitchen",
      cardType: "custom:energy-kitchen",
      resourcePath: "/hacsfiles/atlas/energy-kitchen.js",
      installSteps: [
        "Create a HACS frontend repository with these files.",
        "Install the generated script as energy-kitchen.js.",
        "Register the Lovelace resource /hacsfiles/atlas/energy-kitchen.js as a JavaScript module.",
        "Add custom:energy-kitchen to a dashboard view.",
        "Replace the demo entities with your own Home Assistant entities.",
      ],
    });
    expect(bundle.files.map(file => file.path)).toEqual([
      "hacs.json",
      "energy-kitchen.js",
      "README.md",
      "examples/lovelace-card.json",
      "atlas/energy-kitchen.atlas-card.json",
      "locales/en.json",
      "locales/de.json",
      "locales/fr.json",
    ]);
    expect(JSON.parse(bundle.files.find(file => file.path === "hacs.json")?.content ?? "{}")).toEqual({
      name: "Energy Kitchen",
      render_readme: true,
      filename: "energy-kitchen.js",
    });
    expect(bundle.files.find(file => file.path === "energy-kitchen.js")?.content).toContain("customElements.define(\"energy-kitchen\"");
    expect(bundle.files.find(file => file.path === "README.md")?.content).toContain("/hacsfiles/atlas/energy-kitchen.js");
    expect(bundle.files.find(file => file.path === "README.md")?.content).toContain("Fallback language files: de, fr.");
    expect(JSON.parse(bundle.files.find(file => file.path === "locales/de.json")?.content ?? "{}")._meta).toMatchObject({
      language: "de",
      status: "fallback",
    });
  });

  it("materializes a HACS card bundle as a downloadable zip archive", () => {
    const editorPlan = createHomeAssistantCardEditorPackagePlan({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      defaultEntityIds: ["sensor.energy_today"],
    });
    const cardPackage = createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardConfiguration({
        target: "entities",
        title: "Energy Kitchen",
        entityIds: ["sensor.energy_today"],
      }),
      format: "json",
      name: "Energy Kitchen",
      editorPlan,
    });
    const archive = createHomeAssistantCardEditorHacsBundleArchive(cardPackage);
    const archiveText = Buffer.from(archive.content).toString("latin1");

    expect(archive).toMatchObject({
      filename: "energy-kitchen.hacs.zip",
      mimeType: "application/zip",
    });
    expect(Array.from(archive.content.slice(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);
    expect(Array.from(archive.content.slice(-22, -18))).toEqual([0x50, 0x4b, 0x05, 0x06]);
    expect(archiveText).toContain("hacs.json");
    expect(archiveText).toContain("energy-kitchen.js");
    expect(archiveText).toContain("examples/lovelace-card.json");
    expect(archiveText).toContain("locales/en.json");
    expect(archive.content.length).toBeGreaterThan(1000);
  });

  it("inspects generated HACS card zip archives before import", () => {
    const editorPlan = createHomeAssistantCardEditorPackagePlan({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      defaultEntityIds: ["sensor.energy_today"],
    });
    const archive = createHomeAssistantCardEditorHacsBundleArchive(createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardConfiguration({
        target: "entities",
        title: "Energy Kitchen",
        entityIds: ["sensor.energy_today"],
      }),
      format: "json",
      name: "Energy Kitchen",
      editorPlan,
    }));

    expect(inspectHomeAssistantCardEditorHacsBundleArchive(archive.content)).toMatchObject({
      kind: "atlas.homeassistant.hacs-card-bundle-archive",
      importable: true,
      fileCount: 6,
      missingFiles: [],
      unsafePaths: [],
      duplicatePaths: [],
      issues: [],
      scriptFiles: ["energy-kitchen.js"],
      atlasPackageFiles: ["atlas/energy-kitchen.atlas-card.json"],
      localeFiles: ["locales/en.json"],
      missingLocaleFiles: [],
    });
    expect(inspectHomeAssistantCardEditorHacsBundleArchive(new Uint8Array([1, 2, 3]))).toMatchObject({
      importable: false,
      fileCount: 0,
      reason: "The archive is not a readable ZIP file.",
    });
  });

  it("reports missing HACS card zip archive files as structured issues", () => {
    const archive = createHomeAssistantCardEditorHacsBundleArchive({
      version: 1,
      kind: "atlas.homeassistant.hacs-card-bundle",
      cardName: "Incomplete Card",
      scriptFilename: "incomplete-card.js",
      customElementName: "incomplete-card",
      cardType: "custom:incomplete-card",
      resourcePath: "/hacsfiles/atlas/incomplete-card.js",
      files: [
        {
          path: "hacs.json",
          mimeType: "application/json",
          content: JSON.stringify({
            name: "Incomplete Card",
            render_readme: true,
            filename: "incomplete-card.js",
          }, null, 2),
        },
      ],
      installSteps: [],
    });

    expect(inspectHomeAssistantCardEditorHacsBundleArchive(archive.content)).toMatchObject({
      importable: false,
      missingFiles: ["README.md", "examples/lovelace-card.json", "*.js", "atlas/*.atlas-card.json"],
      missingLocaleFiles: ["locales/en.json"],
      unsafePaths: [],
      duplicatePaths: [],
      issues: [
        {
          code: "missing-required-file",
          severity: "error",
          paths: ["README.md", "examples/lovelace-card.json", "*.js", "atlas/*.atlas-card.json"],
          message: "missing required files: README.md, examples/lovelace-card.json, *.js, atlas/*.atlas-card.json",
        },
        {
          code: "missing-locale-file",
          severity: "error",
          paths: ["locales/en.json"],
          message: "missing required locale files: locales/en.json",
        },
      ],
      reason: "The archive is not a safe ATLAS HACS card bundle: missing required files: README.md, examples/lovelace-card.json, *.js, atlas/*.atlas-card.json; missing required locale files: locales/en.json.",
    });
  });

  it("rejects HACS card zip archives with unsafe or duplicate paths", () => {
    const editorPlan = createHomeAssistantCardEditorPackagePlan({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      defaultEntityIds: ["sensor.energy_today"],
    });
    const bundle = createHomeAssistantCardEditorHacsBundle(createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardConfiguration({
        target: "entities",
        title: "Energy Kitchen",
        entityIds: ["sensor.energy_today"],
      }),
      format: "json",
      name: "Energy Kitchen",
      editorPlan,
    }));
    const archive = createHomeAssistantCardEditorHacsBundleArchive({
      ...bundle,
      files: [
        ...bundle.files,
        {
          path: "../energy-kitchen.js",
          mimeType: "text/javascript",
          content: "export {};",
        },
        {
          path: "locales\\en.json",
          mimeType: "application/json",
          content: "{}",
        },
        {
          path: "README.md",
          mimeType: "text/markdown",
          content: "# Duplicate README\n",
        },
      ],
    });

    expect(inspectHomeAssistantCardEditorHacsBundleArchive(archive.content)).toMatchObject({
      importable: false,
      unsafePaths: ["../energy-kitchen.js", "locales\\en.json"],
      duplicatePaths: ["README.md"],
      missingFiles: [],
      issues: [
        {
          code: "unsafe-path",
          severity: "error",
          paths: ["../energy-kitchen.js", "locales\\en.json"],
          message: "unsafe archive paths: ../energy-kitchen.js, locales\\en.json",
        },
        {
          code: "duplicate-path",
          severity: "error",
          paths: ["README.md"],
          message: "duplicate archive paths: README.md",
        },
      ],
      reason: "The archive is not a safe ATLAS HACS card bundle: unsafe archive paths: ../energy-kitchen.js, locales\\en.json; duplicate archive paths: README.md.",
    });
    expect(readHomeAssistantCardEditorHacsBundleArchivePackage(archive.content)).toMatchObject({
      importable: false,
      reason: "The archive is not a safe ATLAS HACS card bundle: unsafe archive paths: ../energy-kitchen.js, locales\\en.json; duplicate archive paths: README.md.",
    });
  });

  it("reads the embedded ATLAS card package from generated HACS card zip archives", () => {
    const editorPlan = createHomeAssistantCardEditorPackagePlan({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      defaultEntityIds: ["sensor.energy_today"],
    });
    const archive = createHomeAssistantCardEditorHacsBundleArchive(createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardConfiguration({
        target: "entities",
        title: "Energy Kitchen",
        entityIds: ["sensor.energy_today"],
      }),
      format: "json",
      name: "Energy Kitchen",
      editorPlan,
    }));

    const packageRead = readHomeAssistantCardEditorHacsBundleArchivePackage(archive.content);
    const embeddedPackage = JSON.parse(packageRead.packageContent ?? "{}");

    expect(packageRead).toMatchObject({
      kind: "atlas.homeassistant.hacs-card-bundle-package",
      importable: true,
      packageFile: "atlas/energy-kitchen.atlas-card.json",
      hacsMetadata: {
        name: "Energy Kitchen",
        filename: "energy-kitchen.js",
        nameMatchesPackage: true,
        scriptMatchesArchive: true,
        scriptMatchesPackage: true,
      },
      localeReadiness: {
        manifestLanguages: ["en"],
        fallbackLanguages: [],
        archiveLocaleFiles: ["locales/en.json"],
        requiredLocaleFiles: ["locales/en.json"],
        missingArchiveLocaleFiles: [],
        invalidArchiveLocaleFiles: [],
        invalidArchiveLocales: [],
      },
      scriptReadiness: {
        path: "energy-kitchen.js",
        expectedCustomElementName: "energy-kitchen",
        definesCustomElement: true,
        valid: true,
        reason: "ok",
      },
      exampleReadiness: {
        path: "examples/lovelace-card.json",
        expectedType: "custom:energy-kitchen",
        actualType: "custom:energy-kitchen",
        valid: true,
        reason: "ok",
      },
      readmeReadiness: {
        path: "README.md",
        expectedResourcePath: "/hacsfiles/atlas/energy-kitchen.js",
        expectedCardType: "custom:energy-kitchen",
        mentionsResourcePath: true,
        mentionsCardType: true,
        valid: true,
        reason: "ok",
      },
      summary: {
        title: "Energy Kitchen",
        entityIds: ["sensor.energy_today"],
        format: "json",
        target: "entities",
        layout: "single",
        packaged: true,
        editorPlan: {
          cardName: "Energy Kitchen",
          scriptFilename: "energy-kitchen.js",
        },
      },
      reason: "The archive contains a readable ATLAS card package file.",
    });
    expect(embeddedPackage).toMatchObject({
      version: 1,
      kind: "atlas.homeassistant.card",
      manifest: {
        name: "Energy Kitchen",
      },
      editorPlan: {
        cardName: "Energy Kitchen",
        scriptFilename: "energy-kitchen.js",
      },
    });
  });

  it("creates a 100-plus-check HACS bundle readiness report for importable archives", () => {
    const editorPlan = createHomeAssistantCardEditorPackagePlan({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      defaultEntityIds: ["sensor.energy_today"],
    });
    const archive = createHomeAssistantCardEditorHacsBundleArchive(createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardConfiguration({
        target: "entities",
        title: "Energy Kitchen",
        entityIds: ["sensor.energy_today"],
      }),
      format: "json",
      name: "Energy Kitchen",
      editorPlan,
    }));

    const packageRead = readHomeAssistantCardEditorHacsBundleArchivePackage(archive.content);
    const report = createHomeAssistantCardEditorHacsBundleReadinessReport(packageRead);

    expect(report).toMatchObject({
      status: "ready",
      ready: true,
      passed: 112,
      failed: 0,
      pending: 0,
    });
    expect(report.checks).toHaveLength(112);
    expect(report.checks.map(check => check.code).slice(0, 30)).toEqual([
      "zip-readable",
      "safe-paths",
      "unique-paths",
      "has-hacs-manifest",
      "has-readme",
      "has-example-card",
      "has-root-script",
      "has-atlas-package",
      "has-english-locale",
      "hacs-filename-declared",
      "hacs-script-in-archive",
      "atlas-package-readable",
      "declared-locales-present",
      "locale-json-readable",
      "locale-meta-language-present",
      "locale-language-matches-path",
      "hacs-name-declared",
      "hacs-name-matches-package",
      "hacs-filename-matches-package",
      "script-custom-element-known",
      "script-file-readable",
      "script-defines-custom-element",
      "example-json-readable",
      "example-type-present",
      "example-type-matches-package",
      "readme-mentions-resource-path",
      "readme-mentions-card-type",
      "package-contains-entities",
      "package-entity-ids-safe",
      "package-is-atlas-export",
    ]);
    expect(report.checks.map(check => check.code).slice(-5)).toEqual([
      "import-report-terminal-check-present",
      "import-report-first-check-readable",
      "import-report-last-check-importable",
      "import-report-statuses-known",
      "import-report-100-checks",
    ]);
    expect(report.checks.every(check => check.status === "pass")).toBe(true);
  });

  it("marks failed and pending HACS readiness checks for rejected archives", () => {
    const archive = createHomeAssistantCardEditorHacsBundleArchive({
      version: 1,
      kind: "atlas.homeassistant.hacs-card-bundle",
      cardName: "Incomplete Card",
      scriptFilename: "incomplete-card.js",
      customElementName: "incomplete-card",
      cardType: "custom:incomplete-card",
      resourcePath: "/hacsfiles/atlas/incomplete-card.js",
      files: [
        {
          path: "hacs.json",
          mimeType: "application/json",
          content: JSON.stringify({
            name: "Incomplete Card",
            render_readme: true,
            filename: "incomplete-card.js",
          }, null, 2),
        },
      ],
      installSteps: [],
    });

    const packageRead = readHomeAssistantCardEditorHacsBundleArchivePackage(archive.content);
    const report = createHomeAssistantCardEditorHacsBundleReadinessReport(packageRead);

    expect(report).toMatchObject({
      status: "blocked",
      ready: false,
      passed: 17,
      failed: 12,
      pending: 83,
    });
    expect(Object.fromEntries(report.checks.map(check => [check.code, check.status]))).toMatchObject({
      "zip-readable": "pass",
      "has-hacs-manifest": "pass",
      "has-readme": "fail",
      "has-root-script": "fail",
      "has-atlas-package": "fail",
      "hacs-filename-declared": "pending",
      "atlas-package-readable": "pending",
      "bundle-importable": "fail",
    });
  });

  it("blocks HACS readiness when embedded package entity IDs are unsafe", () => {
    const editorPlan = createHomeAssistantCardEditorPackagePlan({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      defaultEntityIds: ["sensor.energy_today"],
    });
    const archive = createHomeAssistantCardEditorHacsBundleArchive(createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardConfiguration({
        target: "entities",
        title: "Energy Kitchen",
        entityIds: ["sensor.Energy Today"],
      }),
      format: "json",
      name: "Energy Kitchen",
      editorPlan,
    }));

    const packageRead = readHomeAssistantCardEditorHacsBundleArchivePackage(archive.content);
    const report = createHomeAssistantCardEditorHacsBundleReadinessReport(packageRead);

    expect(Object.fromEntries(report.checks.map(check => [check.code, check.status]))).toMatchObject({
      "package-contains-entities": "pass",
      "package-entity-ids-safe": "fail",
      "import-summary-safe-for-demo": "fail",
    });
    expect(createHomeAssistantCardEditorHacsBundleReadinessOverview(packageRead).firstBlockedGroup).toMatchObject({
      id: "package",
      firstFailedCheck: {
        code: "package-entity-ids-safe",
      },
    });
  });

  it("groups HACS bundle readiness checks by import area", () => {
    const editorPlan = createHomeAssistantCardEditorPackagePlan({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      defaultEntityIds: ["sensor.energy_today"],
    });
    const archive = createHomeAssistantCardEditorHacsBundleArchive(createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardConfiguration({
        target: "entities",
        title: "Energy Kitchen",
        entityIds: ["sensor.energy_today"],
      }),
      format: "json",
      name: "Energy Kitchen",
      editorPlan,
    }));

    const packageRead = readHomeAssistantCardEditorHacsBundleArchivePackage(archive.content);
    const overview = createHomeAssistantCardEditorHacsBundleReadinessOverview(packageRead);

    expect(overview).toMatchObject({
      status: "ready",
      ready: true,
      groupCount: 8,
      readyGroups: 8,
      blockedGroups: 0,
      pendingGroups: 0,
      passed: 112,
      failed: 0,
      pending: 0,
    });
    expect(overview.groups.map(group => group.id)).toEqual([
      "archive",
      "manifest",
      "package",
      "locale",
      "script",
      "example",
      "readme",
      "import",
    ]);
    expect(overview.groups.map(group => group.status)).toEqual([
      "ready",
      "ready",
      "ready",
      "ready",
      "ready",
      "ready",
      "ready",
      "ready",
    ]);
    expect(overview.groups.every(group => group.ready && group.checks.length > 0)).toBe(true);
    expect(overview.firstFailedCheck).toBeUndefined();
    expect(overview.firstPendingCheck).toBeUndefined();
    expect(overview.firstBlockedGroup).toBeUndefined();
    expect(overview.firstPendingGroup).toBeUndefined();
    expect(overview.attentionGroups).toEqual([]);
    expect(overview.blockedAttentionGroups).toEqual([]);
    expect(overview.pendingAttentionGroups).toEqual([]);
    expect(overview.attentionSummary).toEqual({
      attentionCount: 0,
      blockedCount: 0,
      pendingCount: 0,
      nextAction: "Ready to import HACS card bundle",
      attentionLabels: [],
      blockedLabels: [],
      pendingLabels: [],
    });
    expect(overview.attentionSummary.nextActionCheck).toBeUndefined();
  });

  it("formats HACS readiness overview lines for ready archives", () => {
    const editorPlan = createHomeAssistantCardEditorPackagePlan({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      defaultEntityIds: ["sensor.energy_today"],
    });
    const archive = createHomeAssistantCardEditorHacsBundleArchive(createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardConfiguration({
        target: "entities",
        title: "Energy Kitchen",
        entityIds: ["sensor.energy_today"],
      }),
      format: "json",
      name: "Energy Kitchen",
      editorPlan,
    }));

    const packageRead = readHomeAssistantCardEditorHacsBundleArchivePackage(archive.content);

    expect(formatHomeAssistantCardEditorHacsBundleReadinessOverviewLines(packageRead)).toEqual([
      "Readiness status: ready",
      "Readiness: 112/112 passed, 0 failed, 0 pending",
      "Readiness groups: 8/8 ready, 0 blocked, 0 pending",
      "First blocked group: none",
      "First pending group: none",
    ]);
    expect(formatHomeAssistantCardEditorHacsBundleReadinessAttentionLines(packageRead)).toEqual([
      "Attention summary: 0 attention, 0 blocked, 0 pending",
      "Next action: Ready to import HACS card bundle",
      "Attention groups: none",
      "Blocked attention groups: none",
      "Pending attention groups: none",
    ]);
    expect(formatHomeAssistantCardEditorHacsBundleReadinessGroupLines(packageRead)).toHaveLength(8);
    expect(formatHomeAssistantCardEditorHacsBundleReadinessGroupLines(packageRead).every(line => line.includes(": ready "))).toBe(true);
  });

  it("formats a combined HACS readiness review for package reads", () => {
    const editorPlan = createHomeAssistantCardEditorPackagePlan({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      defaultEntityIds: ["sensor.energy_today"],
    });
    const archive = createHomeAssistantCardEditorHacsBundleArchive(createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardConfiguration({
        target: "entities",
        title: "Energy Kitchen",
        entityIds: ["sensor.energy_today"],
      }),
      format: "json",
      name: "Energy Kitchen",
      editorPlan,
    }));

    const packageRead = readHomeAssistantCardEditorHacsBundleArchivePackage(archive.content);
    const lines = formatHomeAssistantCardEditorHacsBundlePackageReadinessReviewLines(packageRead);

    expect(lines.slice(0, 5)).toEqual(formatHomeAssistantCardEditorHacsBundleReadinessOverviewLines(packageRead));
    expect(lines.slice(5, 10)).toEqual(formatHomeAssistantCardEditorHacsBundleReadinessAttentionLines(packageRead));
    expect(lines.slice(10, 18)).toEqual(formatHomeAssistantCardEditorHacsBundleReadinessGroupLines(packageRead));
    expect(lines).toContain("The archive contains a readable ATLAS card package file.");
    expect(lines).toContain("HACS script: energy-kitchen.js");
  });

  it("shows blocked and pending HACS readiness groups for rejected archives", () => {
    const archive = createHomeAssistantCardEditorHacsBundleArchive({
      version: 1,
      kind: "atlas.homeassistant.hacs-card-bundle",
      cardName: "Incomplete Card",
      scriptFilename: "incomplete-card.js",
      customElementName: "incomplete-card",
      cardType: "custom:incomplete-card",
      resourcePath: "/hacsfiles/atlas/incomplete-card.js",
      files: [
        {
          path: "hacs.json",
          mimeType: "application/json",
          content: JSON.stringify({
            name: "Incomplete Card",
            render_readme: true,
            filename: "incomplete-card.js",
          }, null, 2),
        },
      ],
      installSteps: [],
    });

    const packageRead = readHomeAssistantCardEditorHacsBundleArchivePackage(archive.content);
    const overview = createHomeAssistantCardEditorHacsBundleReadinessOverview(packageRead);
    const groupsById = Object.fromEntries(overview.groups.map(group => [group.id, group]));

    expect(overview).toMatchObject({
      status: "blocked",
      ready: false,
      groupCount: 8,
      readyGroups: 0,
      blockedGroups: 2,
      pendingGroups: 7,
      firstFailedCheck: {
        code: "has-readme",
        status: "fail",
      },
      firstPendingCheck: {
        code: "hacs-filename-declared",
        status: "pending",
      },
      firstBlockedGroup: {
        id: "archive",
        label: "Archive",
        firstFailedCheck: {
          code: "has-readme",
          status: "fail",
        },
      },
      firstPendingGroup: {
        id: "manifest",
        label: "HACS manifest",
        firstPendingCheck: {
          code: "hacs-filename-declared",
          status: "pending",
        },
      },
    });
    expect(overview.attentionGroups.map(group => group.id)).toEqual([
      "archive",
      "manifest",
      "package",
      "locale",
      "script",
      "example",
      "readme",
      "import",
    ]);
    expect(overview.blockedAttentionGroups.map(group => group.id)).toEqual(["archive", "import"]);
    expect(overview.pendingAttentionGroups.map(group => group.id)).toEqual([
      "manifest",
      "package",
      "locale",
      "script",
      "example",
      "readme",
      "import",
    ]);
    expect(overview.attentionSummary).toEqual({
      attentionCount: 8,
      blockedCount: 2,
      pendingCount: 7,
      nextAction: "Fix Archive (has-readme)",
      nextActionCheck: {
        code: "has-readme",
        status: "fail",
        label: "README present",
        detail: "README.md is missing.",
      },
      attentionLabels: ["Archive", "HACS manifest", "ATLAS package", "Locales", "Script", "Example card", "README", "Import"],
      blockedLabels: ["Archive", "Import"],
      pendingLabels: ["HACS manifest", "ATLAS package", "Locales", "Script", "Example card", "README", "Import"],
    });
    expect(groupsById.archive).toMatchObject({ failed: 10 });
    expect(groupsById.manifest).toMatchObject({ pending: 15 });
    expect(groupsById.package).toMatchObject({ pending: 14 });
    expect(groupsById.import).toMatchObject({ failed: 2, pending: 8 });
    expect(overview.groups.map(group => [group.id, group.status])).toEqual([
      ["archive", "blocked"],
      ["manifest", "pending"],
      ["package", "pending"],
      ["locale", "pending"],
      ["script", "pending"],
      ["example", "pending"],
      ["readme", "pending"],
      ["import", "blocked"],
    ]);
    expect(formatHomeAssistantCardEditorHacsBundleReadinessOverviewLines(packageRead)).toEqual([
      "Readiness status: blocked",
      "Readiness: 17/112 passed, 12 failed, 83 pending",
      "Readiness groups: 0/8 ready, 2 blocked, 7 pending",
      "First blocked group: Archive (has-readme)",
      "First pending group: HACS manifest (hacs-filename-declared)",
    ]);
    expect(formatHomeAssistantCardEditorHacsBundleReadinessAttentionLines(packageRead)).toEqual([
      "Attention summary: 8 attention, 2 blocked, 7 pending",
      "Next action: Fix Archive (has-readme)",
      "Attention groups: Archive, HACS manifest, ATLAS package, Locales, Script, Example card, README, Import",
      "Blocked attention groups: Archive, Import",
      "Pending attention groups: HACS manifest, ATLAS package, Locales, Script, Example card, README, Import",
    ]);
    expect(formatHomeAssistantCardEditorHacsBundleReadinessGroupLines(packageRead)).toEqual([
      "Archive: blocked (9 passed, 10 failed, 0 pending) - first failure has-readme",
      "HACS manifest: pending (0 passed, 0 failed, 15 pending) - first pending hacs-filename-declared",
      "ATLAS package: pending (0 passed, 0 failed, 14 pending) - first pending atlas-package-readable",
      "Locales: pending (0 passed, 0 failed, 14 pending) - first pending declared-locales-present",
      "Script: pending (0 passed, 0 failed, 17 pending) - first pending script-custom-element-known",
      "Example card: pending (0 passed, 0 failed, 9 pending) - first pending example-json-readable",
      "README: pending (0 passed, 0 failed, 6 pending) - first pending readme-mentions-resource-path",
      "Import: blocked (8 passed, 2 failed, 8 pending) - first failure bundle-importable",
    ]);
    expect(formatHomeAssistantCardEditorHacsBundlePackageReadinessReviewLines(packageRead).slice(0, 18)).toEqual([
      ...formatHomeAssistantCardEditorHacsBundleReadinessOverviewLines(packageRead),
      ...formatHomeAssistantCardEditorHacsBundleReadinessAttentionLines(packageRead),
      ...formatHomeAssistantCardEditorHacsBundleReadinessGroupLines(packageRead),
    ]);
  });

  it("rejects HACS card zip archives whose README omits the generated resource path", () => {
    const editorPlan = createHomeAssistantCardEditorPackagePlan({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      defaultEntityIds: ["sensor.energy_today"],
    });
    const bundle = createHomeAssistantCardEditorHacsBundle(createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardConfiguration({
        target: "entities",
        title: "Energy Kitchen",
        entityIds: ["sensor.energy_today"],
      }),
      format: "json",
      name: "Energy Kitchen",
      editorPlan,
    }));
    const archive = createHomeAssistantCardEditorHacsBundleArchive({
      ...bundle,
      files: bundle.files.map(file => file.path === "README.md"
        ? {
            ...file,
            content: [
              "# Energy Kitchen",
              "",
              "Generated by ATLAS Home Assistant Card Editor.",
              "",
              "Add custom:energy-kitchen to a dashboard view.",
              "",
            ].join("\n"),
          }
        : file),
    });

    const packageRead = readHomeAssistantCardEditorHacsBundleArchivePackage(archive.content);

    expect(packageRead).toMatchObject({
      kind: "atlas.homeassistant.hacs-card-bundle-package",
      importable: false,
      readmeReadiness: {
        path: "README.md",
        expectedResourcePath: "/hacsfiles/atlas/energy-kitchen.js",
        expectedCardType: "custom:energy-kitchen",
        mentionsResourcePath: false,
        mentionsCardType: true,
        valid: false,
        reason: "missing-resource-path",
      },
      reason: "The README does not document the embedded ATLAS card package correctly: missing-resource-path.",
    });
    expect(formatHomeAssistantCardEditorHacsBundlePackageReadReviewLines(packageRead)).toContain(
      "Invalid README README.md: missing /hacsfiles/atlas/energy-kitchen.js (missing-resource-path)",
    );
  });

  it("rejects HACS card zip archives whose manifest name does not match the embedded package", () => {
    const editorPlan = createHomeAssistantCardEditorPackagePlan({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      defaultEntityIds: ["sensor.energy_today"],
    });
    const bundle = createHomeAssistantCardEditorHacsBundle(createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardConfiguration({
        target: "entities",
        title: "Energy Kitchen",
        entityIds: ["sensor.energy_today"],
      }),
      format: "json",
      name: "Energy Kitchen",
      editorPlan,
    }));
    const archive = createHomeAssistantCardEditorHacsBundleArchive({
      ...bundle,
      files: bundle.files.map(file => file.path === "hacs.json"
        ? {
            ...file,
            content: JSON.stringify({
              name: "Kitchen Energy Copy",
              render_readme: true,
              filename: "energy-kitchen.js",
            }, null, 2),
          }
        : file),
    });

    const packageRead = readHomeAssistantCardEditorHacsBundleArchivePackage(archive.content);

    expect(packageRead).toMatchObject({
      kind: "atlas.homeassistant.hacs-card-bundle-package",
      importable: false,
      hacsMetadata: {
        name: "Kitchen Energy Copy",
        filename: "energy-kitchen.js",
        nameMatchesPackage: false,
        scriptMatchesArchive: true,
        scriptMatchesPackage: true,
      },
      packageFile: "atlas/energy-kitchen.atlas-card.json",
      reason: "The HACS manifest name Kitchen Energy Copy does not match the embedded ATLAS card package name Energy Kitchen.",
    });
    expect(formatHomeAssistantCardEditorHacsBundlePackageReadReviewLines(packageRead)).toContain(
      "HACS name: Kitchen Energy Copy",
    );
  });

  it("rejects HACS card zip archives whose script does not define the embedded custom element", () => {
    const editorPlan = createHomeAssistantCardEditorPackagePlan({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      defaultEntityIds: ["sensor.energy_today"],
    });
    const bundle = createHomeAssistantCardEditorHacsBundle(createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardConfiguration({
        target: "entities",
        title: "Energy Kitchen",
        entityIds: ["sensor.energy_today"],
      }),
      format: "json",
      name: "Energy Kitchen",
      editorPlan,
    }));
    const archive = createHomeAssistantCardEditorHacsBundleArchive({
      ...bundle,
      files: bundle.files.map(file => file.path === "energy-kitchen.js"
        ? {
            ...file,
            content: file.content.replace(
              "customElements.define(\"energy-kitchen\"",
              "customElements.define(\"other-card\"",
            ),
          }
        : file),
    });

    const packageRead = readHomeAssistantCardEditorHacsBundleArchivePackage(archive.content);

    expect(packageRead).toMatchObject({
      kind: "atlas.homeassistant.hacs-card-bundle-package",
      importable: false,
      scriptReadiness: {
        path: "energy-kitchen.js",
        expectedCustomElementName: "energy-kitchen",
        definesCustomElement: false,
        valid: false,
        reason: "custom-element-mismatch",
      },
      reason: "The generated script does not define the embedded ATLAS custom element: custom-element-mismatch.",
    });
    expect(formatHomeAssistantCardEditorHacsBundlePackageReadReviewLines(packageRead)).toContain(
      "Invalid script energy-kitchen.js: expected energy-kitchen (custom-element-mismatch)",
    );
  });

  it("rejects HACS card zip archives whose Lovelace example type does not match the embedded package", () => {
    const editorPlan = createHomeAssistantCardEditorPackagePlan({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      defaultEntityIds: ["sensor.energy_today"],
    });
    const bundle = createHomeAssistantCardEditorHacsBundle(createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardConfiguration({
        target: "entities",
        title: "Energy Kitchen",
        entityIds: ["sensor.energy_today"],
      }),
      format: "json",
      name: "Energy Kitchen",
      editorPlan,
    }));
    const archive = createHomeAssistantCardEditorHacsBundleArchive({
      ...bundle,
      files: bundle.files.map(file => file.path === "examples/lovelace-card.json"
        ? {
            ...file,
            content: JSON.stringify({
              type: "custom:other-card",
              title: "Energy Kitchen",
            }),
          }
        : file),
    });

    const packageRead = readHomeAssistantCardEditorHacsBundleArchivePackage(archive.content);

    expect(packageRead).toMatchObject({
      kind: "atlas.homeassistant.hacs-card-bundle-package",
      importable: false,
      exampleReadiness: {
        path: "examples/lovelace-card.json",
        expectedType: "custom:energy-kitchen",
        actualType: "custom:other-card",
        valid: false,
        reason: "type-mismatch",
      },
      reason: "The Lovelace example card does not match the embedded ATLAS card package: type-mismatch.",
    });
    expect(formatHomeAssistantCardEditorHacsBundlePackageReadReviewLines(packageRead)).toContain(
      "Invalid example card examples/lovelace-card.json: expected custom:energy-kitchen, actual custom:other-card (type-mismatch)",
    );
  });

  it("rejects HACS card zip archives missing locales declared by the embedded package", () => {
    const editorPlan = createHomeAssistantCardEditorPackagePlan({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      defaultEntityIds: ["sensor.energy_today"],
    });
    const bundle = createHomeAssistantCardEditorHacsBundle(createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardConfiguration({
        target: "entities",
        title: "Energy Kitchen",
        entityIds: ["sensor.energy_today"],
      }),
      format: "json",
      name: "Energy Kitchen",
      languages: ["de"],
      editorPlan,
    }));
    const archive = createHomeAssistantCardEditorHacsBundleArchive({
      ...bundle,
      files: bundle.files.filter(file => file.path !== "locales/de.json"),
    });

    const packageRead = readHomeAssistantCardEditorHacsBundleArchivePackage(archive.content);

    expect(packageRead).toMatchObject({
      kind: "atlas.homeassistant.hacs-card-bundle-package",
      importable: false,
      localeReadiness: {
        manifestLanguages: ["en", "de"],
        fallbackLanguages: ["de"],
        archiveLocaleFiles: ["locales/en.json"],
        requiredLocaleFiles: ["locales/en.json", "locales/de.json"],
        missingArchiveLocaleFiles: ["locales/de.json"],
        invalidArchiveLocaleFiles: [],
        invalidArchiveLocales: [],
      },
      packageFile: "atlas/energy-kitchen.atlas-card.json",
      reason: "The archive is missing locale files declared by the embedded ATLAS card package: locales/de.json.",
    });
    expect(formatHomeAssistantCardEditorHacsBundlePackageReadReviewLines(packageRead)).toEqual([
      "The archive is missing locale files declared by the embedded ATLAS card package: locales/de.json.",
      "HACS name: Energy Kitchen",
      "HACS script: energy-kitchen.js",
      "Required locales: locales/en.json, locales/de.json",
      "Archive locales: locales/en.json",
      "Missing locales: locales/de.json",
    ]);
  });

  it("rejects HACS card zip archives with locale files whose metadata language does not match the path", () => {
    const editorPlan = createHomeAssistantCardEditorPackagePlan({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      defaultEntityIds: ["sensor.energy_today"],
    });
    const bundle = createHomeAssistantCardEditorHacsBundle(createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardConfiguration({
        target: "entities",
        title: "Energy Kitchen",
        entityIds: ["sensor.energy_today"],
      }),
      format: "json",
      name: "Energy Kitchen",
      languages: ["de"],
      editorPlan,
    }));
    const archive = createHomeAssistantCardEditorHacsBundleArchive({
      ...bundle,
      files: bundle.files.map(file => file.path === "locales/de.json"
        ? {
            ...file,
            content: JSON.stringify({
              _meta: {
                language: "fr",
                status: "fallback",
                sourceLanguage: "en",
              },
              card: {},
            }),
          }
        : file),
    });

    const packageRead = readHomeAssistantCardEditorHacsBundleArchivePackage(archive.content);

    expect(packageRead).toMatchObject({
      kind: "atlas.homeassistant.hacs-card-bundle-package",
      importable: false,
      localeReadiness: {
        manifestLanguages: ["en", "de"],
        fallbackLanguages: ["de"],
        requiredLocaleFiles: ["locales/en.json", "locales/de.json"],
        missingArchiveLocaleFiles: [],
        invalidArchiveLocaleFiles: ["locales/de.json"],
        invalidArchiveLocales: [
          {
            path: "locales/de.json",
            expectedLanguage: "de",
            actualLanguage: "fr",
            reason: "language-mismatch",
          },
        ],
      },
      reason: "The archive contains invalid locale files declared by the embedded ATLAS card package: locales/de.json.",
    });
    expect(formatHomeAssistantCardEditorHacsBundlePackageReadReviewLines(packageRead)).toContain(
      "Invalid locale locales/de.json: expected de, actual fr (language-mismatch)",
    );
  });

  it("reports invalid JSON and missing metadata in declared HACS locale files", () => {
    const editorPlan = createHomeAssistantCardEditorPackagePlan({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      defaultEntityIds: ["sensor.energy_today"],
    });
    const bundle = createHomeAssistantCardEditorHacsBundle(createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardConfiguration({
        target: "entities",
        title: "Energy Kitchen",
        entityIds: ["sensor.energy_today"],
      }),
      format: "json",
      name: "Energy Kitchen",
      languages: ["de", "fr"],
      editorPlan,
    }));
    const archive = createHomeAssistantCardEditorHacsBundleArchive({
      ...bundle,
      files: bundle.files.map(file => {
        if (file.path === "locales/de.json") {
          return {
            ...file,
            content: "{not-json",
          };
        }
        if (file.path === "locales/fr.json") {
          return {
            ...file,
            content: JSON.stringify({
              _meta: {
                status: "fallback",
                sourceLanguage: "en",
              },
              card: {},
            }),
          };
        }
        return file;
      }),
    });

    const packageRead = readHomeAssistantCardEditorHacsBundleArchivePackage(archive.content);

    expect(packageRead).toMatchObject({
      kind: "atlas.homeassistant.hacs-card-bundle-package",
      importable: false,
      localeReadiness: {
        manifestLanguages: ["en", "de", "fr"],
        fallbackLanguages: ["de", "fr"],
        invalidArchiveLocaleFiles: ["locales/de.json", "locales/fr.json"],
        invalidArchiveLocales: [
          {
            path: "locales/de.json",
            expectedLanguage: "de",
            reason: "invalid-json",
          },
          {
            path: "locales/fr.json",
            expectedLanguage: "fr",
            reason: "missing-meta-language",
          },
        ],
      },
      reason: "The archive contains invalid locale files declared by the embedded ATLAS card package: locales/de.json, locales/fr.json.",
    });
    expect(formatHomeAssistantCardEditorHacsBundlePackageReadReviewLines(packageRead)).toEqual([
      "The archive contains invalid locale files declared by the embedded ATLAS card package: locales/de.json, locales/fr.json.",
      "HACS name: Energy Kitchen",
      "HACS script: energy-kitchen.js",
      "Required locales: locales/en.json, locales/de.json, locales/fr.json",
      "Archive locales: locales/en.json, locales/de.json, locales/fr.json",
      "Invalid locale locales/de.json: expected de (invalid-json)",
      "Invalid locale locales/fr.json: expected fr (missing-meta-language)",
    ]);
  });

  it("rejects HACS card zip archives with unreadable embedded ATLAS packages", () => {
    const archive = createHomeAssistantCardEditorHacsBundleArchive({
      version: 1,
      kind: "atlas.homeassistant.hacs-card-bundle",
      cardName: "Broken Card",
      scriptFilename: "broken-card.js",
      customElementName: "broken-card",
      cardType: "custom:broken-card",
      resourcePath: "/hacsfiles/atlas/broken-card.js",
      files: [
        {
          path: "hacs.json",
          mimeType: "application/json",
          content: JSON.stringify({
            name: "Broken Card",
            render_readme: true,
            filename: "broken-card.js",
          }, null, 2),
        },
        {
          path: "broken-card.js",
          mimeType: "text/javascript",
          content: "customElements.define('broken-card', class extends HTMLElement {});",
        },
        {
          path: "README.md",
          mimeType: "text/markdown",
          content: "# Broken Card\n",
        },
        {
          path: "examples/lovelace-card.json",
          mimeType: "application/json",
          content: "{}",
        },
        {
          path: "atlas/broken-card.atlas-card.json",
          mimeType: "application/json",
          content: "{\"version\":1,\"kind\":\"atlas.homeassistant.card\",\"manifest\":{},\"content\":\"type: markdown\\ncontent: unsupported\"}",
        },
        {
          path: "locales/en.json",
          mimeType: "application/json",
          content: "{}",
        },
      ],
      installSteps: [],
    });

    expect(readHomeAssistantCardEditorHacsBundleArchivePackage(archive.content)).toMatchObject({
      kind: "atlas.homeassistant.hacs-card-bundle-package",
      importable: false,
      reason: "The ATLAS card package file could not be read from the archive.",
    });
  });

  it("rejects HACS card zip archives whose manifest filename does not match the embedded package", () => {
    const editorPlan = createHomeAssistantCardEditorPackagePlan({
      cardName: "Energy Kitchen",
      scriptFilename: "energy-kitchen.js",
      defaultEntityIds: ["sensor.energy_today"],
    });
    const bundle = createHomeAssistantCardEditorHacsBundle(createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardConfiguration({
        target: "entities",
        title: "Energy Kitchen",
        entityIds: ["sensor.energy_today"],
      }),
      format: "json",
      name: "Energy Kitchen",
      editorPlan,
    }));
    const archive = createHomeAssistantCardEditorHacsBundleArchive({
      ...bundle,
      files: bundle.files.map(file => file.path === "hacs.json"
        ? {
            ...file,
            content: JSON.stringify({
              name: "Energy Kitchen",
              render_readme: true,
              filename: "Energy-Kitchen.js",
            }, null, 2),
          }
        : file),
    });

    expect(readHomeAssistantCardEditorHacsBundleArchivePackage(archive.content)).toMatchObject({
      kind: "atlas.homeassistant.hacs-card-bundle-package",
      importable: false,
      hacsMetadata: {
        name: "Energy Kitchen",
        filename: "Energy-Kitchen.js",
        scriptMatchesArchive: false,
        scriptMatchesPackage: false,
      },
      packageFile: "atlas/energy-kitchen.atlas-card.json",
      reason: "The HACS manifest filename Energy-Kitchen.js does not match a root script file in the archive.",
    });
  });
});
