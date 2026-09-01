import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  createHomeAssistantCardExportManifest,
  createHomeAssistantCardExportPackage,
  createHomeAssistantCardExportPayload,
  createHomeAssistantCardConfiguration,
  createHomeAssistantEntitiesCardConfiguration,
  createHomeAssistantLovelaceResourceReferences,
  createHomeAssistantCardArtifactReview,
  createHomeAssistantCardEditorPackagePlan,
  createHomeAssistantCardEditorScriptExport,
  createHomeAssistantCardLocaleFiles,
  convertHomeAssistantCardModStylesToUixStyle,
  decideHomeAssistantCardArtifactImport,
  findHomeAssistantCardTargetDescriptor,
  formatHomeAssistantCardArtifactReviewLines,
  inspectHomeAssistantCardArtifact,
  inspectHomeAssistantCardDependency,
  inspectHomeAssistantCardDependencyAvailability,
  inspectHomeAssistantCardStyleBlocks,
  listHomeAssistantBubbleButtonTypes,
  listHomeAssistantCardTargets,
  normalizeHomeAssistantCardExportLanguages,
  parseHomeAssistantEntitiesCardConfiguration,
  previewHomeAssistantCardArtifactFields,
  previewHomeAssistantCardArtifactMapping,
  serializeHomeAssistantLovelaceResourceReferences,
  serializeHomeAssistantEntitiesCardConfiguration,
  summarizeHomeAssistantCardImport,
} from "../src";

describe("Home Assistant entities card configuration", () => {
  const importedGlanceCardFixture = readFileSync(
    new URL("./fixtures/imported-glance-card.yaml", import.meta.url),
    "utf8",
  );

  it("creates and serializes Home Assistant entities cards", () => {
    const card = createHomeAssistantEntitiesCardConfiguration({
      title: "Office",
      entityIds: ["sensor.office_temperature", " light.office ", "sensor.office_temperature", ""],
    });

    expect(card).toEqual({
      type: "entities",
      title: "Office",
      entities: [
        { entity: "sensor.office_temperature" },
        { entity: "light.office" },
      ],
    });
    expect(serializeHomeAssistantEntitiesCardConfiguration(card, "json")).toContain("\"type\": \"entities\"");
    expect(serializeHomeAssistantEntitiesCardConfiguration(card, "yaml")).toBe([
      "type: entities",
      "title: \"Office\"",
      "entities:",
      "  - entity: \"sensor.office_temperature\"",
      "  - entity: \"light.office\"",
    ].join("\n"));
  });

  it("parses JSON entities cards", () => {
    const parsed = parseHomeAssistantEntitiesCardConfiguration(JSON.stringify({
      type: "entities",
      title: "Energy",
      entities: ["sensor.power", { entity: "sensor.energy" }],
    }));

    expect(parsed.format).toBe("json");
    expect(parsed.target).toBe("entities");
    expect(parsed.layout).toBe("single");
    expect(parsed.card).toEqual({
      type: "entities",
      title: "Energy",
      entities: [
        { entity: "sensor.power" },
        { entity: "sensor.energy" },
      ],
    });
  });

  it("parses YAML entities cards", () => {
    const parsed = parseHomeAssistantEntitiesCardConfiguration([
      "type: entities",
      "title: Workshop",
      "entities:",
      "  - entity: sensor.workshop_temperature",
      "  - light.workshop",
    ].join("\n"));

    expect(parsed.format).toBe("yaml");
    expect(parsed.target).toBe("entities");
    expect(parsed.layout).toBe("single");
    expect(parsed.card).toEqual({
      type: "entities",
      title: "Workshop",
      entities: [
        { entity: "sensor.workshop_temperature" },
        { entity: "light.workshop" },
      ],
    });
  });

  it("round-trips quoted YAML card values", () => {
    const card = createHomeAssistantEntitiesCardConfiguration({
      title: "Owner's Office",
      entityIds: ["sensor.owner_office_temperature", "sensor.owner_office_power"],
    });
    const parsed = parseHomeAssistantEntitiesCardConfiguration(
      serializeHomeAssistantEntitiesCardConfiguration(card, "yaml"),
    );

    expect(parsed).toEqual({
      format: "yaml",
      card,
      target: "entities",
      layout: "single",
    });
  });

  it("creates Mushroom, Bubble and Tabbed Card V2 targets", () => {
    const mushroom = createHomeAssistantCardConfiguration({
      target: "mushroom-template",
      title: "Office climate",
      entityIds: ["sensor.office_temperature"],
    });
    const bubble = createHomeAssistantCardConfiguration({
      target: "bubble",
      title: "Office light",
      entityIds: ["light.office"],
    });
    const tabbed = createHomeAssistantCardConfiguration({
      target: "tabbed-card-v2",
      title: "Office tabs",
      entityIds: ["light.office", "sensor.office_temperature"],
    });

    expect(mushroom).toEqual({
      type: "custom:mushroom-template-card",
      primary: "Office climate",
      secondary: "sensor.office_temperature",
      entity: "sensor.office_temperature",
    });
    expect(bubble).toEqual({
      type: "custom:bubble-card",
      card_type: "button",
      button_type: "state",
      name: "Office light",
      entity: "light.office",
      show_state: true,
    });
    expect(tabbed).toEqual({
      type: "custom:tabbed-card-v2",
      options: {
        defaultTabIndex: 0,
      },
      tabs: [
        {
          attributes: {
            label: "light.office",
            icon: "mdi:tab",
          },
          card: {
            type: "entity",
            name: "light.office",
            entity: "light.office",
          },
        },
        {
          attributes: {
            label: "sensor.office_temperature",
            icon: "mdi:tab-plus",
          },
          card: {
            type: "entity",
            name: "sensor.office_temperature",
            entity: "sensor.office_temperature",
          },
        },
      ],
    });
    expect(inspectHomeAssistantCardDependency(mushroom)).toEqual({
      id: "mushroom",
      label: "Mushroom",
      required: true,
      resourcePaths: ["/hacsfiles/lovelace-mushroom/mushroom.js"],
      installPaths: ["HACS > Frontend > Mushroom", "/hacsfiles/lovelace-mushroom/mushroom.js"],
    });
    expect(inspectHomeAssistantCardDependency(bubble)).toEqual({
      id: "bubble-card",
      label: "Bubble Card",
      required: true,
      resourcePaths: ["/hacsfiles/Bubble-Card/bubble-card.js"],
      installPaths: ["HACS > Frontend > Bubble Card", "/hacsfiles/Bubble-Card/bubble-card.js"],
    });
    expect(inspectHomeAssistantCardDependency(tabbed)).toEqual({
      id: "tabbed-card-v2",
      label: "Tabbed Card V2",
      required: true,
      resourcePaths: ["/hacsfiles/tabbed-card-v2/tabbed-card-v2.js"],
      installPaths: [
        "HACS > Custom repositories > https://github.com/rockbaer2007/tabbed-card-v2 > Lovelace",
        "/hacsfiles/tabbed-card-v2/tabbed-card-v2.js",
      ],
    });
  });

  it("creates Bubble cards with a selected button type", () => {
    expect(createHomeAssistantCardConfiguration({
      target: "bubble",
      bubbleButtonType: "slider",
      title: "Dimmer",
      entityIds: ["light.office"],
    })).toEqual({
      type: "custom:bubble-card",
      card_type: "button",
      button_type: "slider",
      name: "Dimmer",
      entity: "light.office",
      show_state: true,
    });
  });

  it("creates and serializes built-in core card targets", () => {
    expect(serializeHomeAssistantEntitiesCardConfiguration(createHomeAssistantCardConfiguration({
      target: "button",
      title: "Office light",
      entityIds: ["light.office"],
    }), "yaml")).toBe([
      "type: \"button\"",
      "name: \"Office light\"",
      "entity: \"light.office\"",
      "tap_action:",
      "  action: \"toggle\"",
    ].join("\n"));
    expect(createHomeAssistantCardConfiguration({
      target: "thermostat",
      title: "Office climate",
      entityIds: ["climate.office"],
    })).toEqual({
      type: "thermostat",
      name: "Office climate",
      entity: "climate.office",
    });
    expect(serializeHomeAssistantEntitiesCardConfiguration(createHomeAssistantCardConfiguration({
      target: "webpage",
      title: "Docs",
      entityIds: ["https://www.home-assistant.io"],
    }), "yaml")).toBe([
      "type: \"iframe\"",
      "title: \"Docs\"",
      "url: \"https://www.home-assistant.io\"",
      "aspect_ratio: \"50%\"",
    ].join("\n"));
  });

  it("creates card export locale files with English fallback metadata", () => {
    expect(normalizeHomeAssistantCardExportLanguages(["de", "en", "sv", "ru", "de", "bad-code"])).toEqual([
      "en",
      "de",
      "ru",
      "sv",
    ]);

    const locales = createHomeAssistantCardLocaleFiles({
      title: "UV Index",
      languages: ["de", "fr"],
    });

    expect(locales.map(locale => locale.path)).toEqual([
      "locales/en.json",
      "locales/de.json",
      "locales/fr.json",
    ]);
    expect(locales[0]?.content._meta).toEqual({
      language: "en",
      status: "manual",
      sourceLanguage: "en",
    });
    expect(locales[1]?.content._meta).toMatchObject({
      language: "de",
      status: "fallback",
      sourceLanguage: "en",
      note: "This language file contains English fallback text. Please translate and review it before publishing.",
    });
  });

  it("lists supported Bubble button types", () => {
    expect(listHomeAssistantBubbleButtonTypes()).toEqual(["state", "switch", "slider", "name"]);
  });

  it("creates stacked Bubble and Mushroom card targets for multiple entities", () => {
    const bubble = createHomeAssistantCardConfiguration({
      target: "bubble",
      layout: "horizontal-stack",
      title: "Office",
      entityIds: ["light.office", "switch.office_fan"],
    });
    const mushroom = createHomeAssistantCardConfiguration({
      target: "mushroom-template",
      layout: "vertical-stack",
      title: "Climate",
      entityIds: ["sensor.office_temperature", "sensor.office_humidity"],
    });

    expect(bubble).toEqual({
      type: "horizontal-stack",
      cards: [
        {
          type: "custom:bubble-card",
          card_type: "button",
          button_type: "state",
          name: "light.office",
          entity: "light.office",
          show_state: true,
        },
        {
          type: "custom:bubble-card",
          card_type: "button",
          button_type: "state",
          name: "switch.office_fan",
          entity: "switch.office_fan",
          show_state: true,
        },
      ],
    });
    expect(mushroom).toEqual({
      type: "vertical-stack",
      cards: [
        {
          type: "custom:mushroom-template-card",
          primary: "sensor.office_temperature",
          secondary: "sensor.office_temperature",
          entity: "sensor.office_temperature",
        },
        {
          type: "custom:mushroom-template-card",
          primary: "sensor.office_humidity",
          secondary: "sensor.office_humidity",
          entity: "sensor.office_humidity",
        },
      ],
    });
    expect(serializeHomeAssistantEntitiesCardConfiguration(bubble, "yaml")).toBe([
      "type: horizontal-stack",
      "cards:",
      "  - type: \"custom:bubble-card\"",
      "    card_type: \"button\"",
      "    button_type: \"state\"",
      "    name: \"light.office\"",
      "    entity: \"light.office\"",
      "    show_state: true",
      "  - type: \"custom:bubble-card\"",
      "    card_type: \"button\"",
      "    button_type: \"state\"",
      "    name: \"switch.office_fan\"",
      "    entity: \"switch.office_fan\"",
      "    show_state: true",
    ].join("\n"));
    expect(parseHomeAssistantEntitiesCardConfiguration(JSON.stringify(mushroom))).toEqual({
      format: "json",
      target: "mushroom-template",
      layout: "vertical-stack",
      card: mushroom,
    });
    expect(parseHomeAssistantEntitiesCardConfiguration(serializeHomeAssistantEntitiesCardConfiguration(bubble, "yaml"))).toEqual({
      format: "yaml",
      target: "bubble",
      layout: "horizontal-stack",
      card: bubble,
    });
  });

  it("serializes stack card layout hints", () => {
    expect(serializeHomeAssistantEntitiesCardConfiguration({
      type: "horizontal-stack",
      columns: 8,
      rows: "auto",
      cards: [
        {
          type: "entity",
          name: "Status",
          entity: "binary_sensor.status",
        },
      ],
    }, "yaml")).toBe([
      "type: horizontal-stack",
      "columns: 8",
      "rows: auto",
      "cards:",
      "  - type: \"entity\"",
      "    name: \"Status\"",
      "    entity: \"binary_sensor.status\"",
    ].join("\n"));

    expect(parseHomeAssistantEntitiesCardConfiguration([
      "type: vertical-stack",
      "columns: full",
      "rows: auto",
      "cards:",
      "  - type: entity",
      "    name: Status",
      "    entity: binary_sensor.status",
    ].join("\n")).card).toEqual({
      type: "vertical-stack",
      columns: "full",
      rows: "auto",
      cards: [
        {
          type: "entity",
          name: "Status",
          entity: "binary_sensor.status",
        },
      ],
    });
  });

  it("lists supported card targets with dependency metadata", () => {
    const builtInDependency = { id: "home-assistant", label: "Home Assistant built-in", required: false, resourcePaths: [], installPaths: [] };
    expect(listHomeAssistantCardTargets()).toEqual([
      {
        target: "entities",
        label: "Entities",
        type: "entities",
        dependency: builtInDependency,
      },
      {
        target: "glance",
        label: "Glance",
        type: "glance",
        dependency: builtInDependency,
      },
      {
        target: "custom-card",
        label: "Custom HACS card",
        type: "custom:atlas-raw-card",
        dependency: builtInDependency,
      },
      {
        target: "entity",
        label: "Entity",
        type: "entity",
        dependency: builtInDependency,
      },
      {
        target: "button",
        label: "Button",
        type: "button",
        dependency: builtInDependency,
      },
      {
        target: "sensor",
        label: "Sensor",
        type: "sensor",
        dependency: builtInDependency,
      },
      {
        target: "thermostat",
        label: "Thermostat",
        type: "thermostat",
        dependency: builtInDependency,
      },
      {
        target: "link",
        label: "Link",
        type: "button",
        dependency: builtInDependency,
      },
      {
        target: "webpage",
        label: "Webpage",
        type: "iframe",
        dependency: builtInDependency,
      },
      {
        target: "mushroom-template",
        label: "Mushroom template",
        type: "custom:mushroom-template-card",
        dependency: {
          id: "mushroom",
          label: "Mushroom",
          required: true,
          resourcePaths: ["/hacsfiles/lovelace-mushroom/mushroom.js"],
          installPaths: ["HACS > Frontend > Mushroom", "/hacsfiles/lovelace-mushroom/mushroom.js"],
        },
      },
      {
        target: "bubble",
        label: "Bubble button",
        type: "custom:bubble-card",
        dependency: {
          id: "bubble-card",
          label: "Bubble Card",
          required: true,
          resourcePaths: ["/hacsfiles/Bubble-Card/bubble-card.js"],
          installPaths: ["HACS > Frontend > Bubble Card", "/hacsfiles/Bubble-Card/bubble-card.js"],
        },
      },
      {
        target: "tabbed-card-v2",
        label: "Tabbed Card V2",
        type: "custom:tabbed-card-v2",
        dependency: {
          id: "tabbed-card-v2",
          label: "Tabbed Card V2",
          required: true,
          resourcePaths: ["/hacsfiles/tabbed-card-v2/tabbed-card-v2.js"],
          installPaths: [
            "HACS > Custom repositories > https://github.com/rockbaer2007/tabbed-card-v2 > Lovelace",
            "/hacsfiles/tabbed-card-v2/tabbed-card-v2.js",
          ],
        },
      },
    ]);
    expect(findHomeAssistantCardTargetDescriptor("bubble")?.label).toBe("Bubble button");
    expect(findHomeAssistantCardTargetDescriptor("tabbed-card-v2")?.label).toBe("Tabbed Card V2");
  });

  it("inspects custom card dependency availability from Lovelace resources", () => {
    expect(inspectHomeAssistantCardDependencyAvailability("entities", [])).toMatchObject({
      status: "not-required",
      matchedResourcePaths: [],
      missingResourcePaths: [],
    });
    expect(inspectHomeAssistantCardDependencyAvailability("bubble", [
      "/hacsfiles/Bubble-Card/bubble-card.js?v=2.4.0",
      { url: "https://atlas.local/hacsfiles/lovelace-mushroom/mushroom.js" },
    ])).toMatchObject({
      status: "installed",
      matchedResourcePaths: ["/hacsfiles/Bubble-Card/bubble-card.js"],
      missingResourcePaths: [],
    });
    expect(inspectHomeAssistantCardDependencyAvailability("bubble", [
      "/hacsfiles/bubble-card/bubble-card.js",
    ])).toMatchObject({
      status: "missing",
      matchedResourcePaths: [],
      missingResourcePaths: ["/hacsfiles/Bubble-Card/bubble-card.js"],
    });
    expect(inspectHomeAssistantCardDependencyAvailability("mushroom-template", [
      "/hacsfiles/lovelace-mushroom/mushroom.js",
    ])).toMatchObject({
      status: "installed",
      matchedResourcePaths: ["/hacsfiles/lovelace-mushroom/mushroom.js"],
      missingResourcePaths: [],
    });
    expect(inspectHomeAssistantCardDependencyAvailability("mushroom-template", [
      "/hacsfiles/Lovelace-Mushroom/mushroom.js",
    ])).toMatchObject({
      status: "missing",
      matchedResourcePaths: [],
      missingResourcePaths: ["/hacsfiles/lovelace-mushroom/mushroom.js"],
    });
    expect(inspectHomeAssistantCardDependencyAvailability("tabbed-card-v2", [
      "/hacsfiles/tabbed-card-v2/tabbed-card-v2.js?v=0.1.7",
    ])).toMatchObject({
      status: "installed",
      matchedResourcePaths: ["/hacsfiles/tabbed-card-v2/tabbed-card-v2.js"],
      missingResourcePaths: [],
    });
  });

  it("creates copy-ready Lovelace resource references for custom card targets", () => {
    expect(createHomeAssistantLovelaceResourceReferences("entities")).toEqual([]);
    expect(createHomeAssistantLovelaceResourceReferences("bubble")).toEqual([
      {
        url: "/hacsfiles/Bubble-Card/bubble-card.js",
        type: "module",
      },
    ]);
    expect(serializeHomeAssistantLovelaceResourceReferences("bubble", "yaml")).toBe([
      "- url: \"/hacsfiles/Bubble-Card/bubble-card.js\"",
      "  type: \"module\"",
    ].join("\n"));
    expect(serializeHomeAssistantLovelaceResourceReferences("mushroom-template", "json")).toBe(JSON.stringify([
      {
        url: "/hacsfiles/lovelace-mushroom/mushroom.js",
        type: "module",
      },
    ], null, 2));
    expect(createHomeAssistantLovelaceResourceReferences("tabbed-card-v2")).toEqual([
      {
        url: "/hacsfiles/tabbed-card-v2/tabbed-card-v2.js",
        type: "module",
      },
    ]);
  });

  it("creates export manifests with stable filenames and dependency metadata", () => {
    const card = createHomeAssistantCardConfiguration({
      target: "bubble",
      layout: "vertical-stack",
      title: "Office controls",
      entityIds: ["light.office", "switch.office_fan"],
    });

    expect(createHomeAssistantCardExportManifest({
      card,
      format: "yaml",
      name: "Office Controls",
    })).toEqual({
      name: "Office Controls",
      filename: "office-controls-bubble-vertical-stack.yaml",
      format: "yaml",
      mimeType: "text/yaml",
      target: "bubble",
      layout: "vertical-stack",
      dependency: {
        id: "bubble-card",
        label: "Bubble Card",
        required: true,
        resourcePaths: ["/hacsfiles/Bubble-Card/bubble-card.js"],
        installPaths: ["HACS > Frontend > Bubble Card", "/hacsfiles/Bubble-Card/bubble-card.js"],
      },
      languages: ["en"],
      fallbackLanguages: [],
    });

    expect(createHomeAssistantCardExportManifest({
      card: createHomeAssistantEntitiesCardConfiguration({ title: "Overview", entityIds: ["sensor.office"] }),
      format: "json",
    })).toMatchObject({
      name: "ATLAS Home Assistant card",
      filename: "atlas-home-assistant-card-entities-single.json",
      mimeType: "application/json",
      target: "entities",
      layout: "single",
    });
  });

  it("creates export payloads with serialized content and manifest metadata", () => {
    const card = createHomeAssistantCardConfiguration({
      target: "mushroom-template",
      title: "Office climate",
      entityIds: ["sensor.office_temperature"],
    });
    const payload = createHomeAssistantCardExportPayload({
      card,
      format: "json",
      name: "Office Climate",
    });

    expect(payload.manifest).toMatchObject({
      filename: "office-climate-mushroom-template-single.json",
      mimeType: "application/json",
      target: "mushroom-template",
      layout: "single",
    });
    expect(JSON.parse(payload.content)).toEqual(card);
  });

  it("creates and imports ATLAS Home Assistant card packages", () => {
    const card = createHomeAssistantCardConfiguration({
      target: "bubble",
      title: "Office light",
      entityIds: ["light.office"],
    });
    const editorPlan = createHomeAssistantCardEditorPackagePlan({
      cardName: "Office Light",
      scriptFilename: "Office Light Panel",
      editorMode: "expert",
      simpleTarget: "bubble",
      fields: [{
        id: "Office light",
        target: "bubble",
        bubbleButtonType: "switch",
        entityId: "light.office",
        column: 1,
        row: 2,
        width: 3,
        height: 2,
      }],
    });
    const cardPackage = createHomeAssistantCardExportPackage({
      card,
      format: "yaml",
      name: "Office Light",
      languages: ["de", "sv"],
      editorPlan,
      script: createHomeAssistantCardEditorScriptExport(editorPlan),
    });

    expect(cardPackage).toMatchObject({
      version: 1,
      kind: "atlas.homeassistant.card",
      manifest: {
        filename: "office-light-bubble-single.yaml",
        format: "yaml",
        target: "bubble",
        layout: "single",
        languages: ["en", "de", "sv"],
        fallbackLanguages: ["de", "sv"],
      },
      editorPlan: {
        scriptFilename: "office-light-panel.js",
        editorMode: "expert",
        fields: [{
          id: "Office light",
          target: "bubble",
          bubbleButtonType: "switch",
          entityId: "light.office",
          column: 1,
          row: 2,
          width: 3,
          height: 2,
        }],
      },
      script: {
        filename: "office-light-panel.js",
        customElementName: "office-light-panel",
        cardType: "custom:office-light-panel",
        resourcePath: "/hacsfiles/atlas/office-light-panel.js",
      },
    });
    expect(cardPackage.content).toContain("type: \"custom:bubble-card\"");
    expect(cardPackage.locales.map(locale => locale.path)).toEqual([
      "locales/en.json",
      "locales/de.json",
      "locales/sv.json",
    ]);
    expect(cardPackage.locales.find(locale => locale.language === "de")?.content._meta.status).toBe("fallback");

    expect(summarizeHomeAssistantCardImport(JSON.stringify(cardPackage))).toMatchObject({
      title: "Office light",
      entityIds: ["light.office"],
      format: "yaml",
      target: "bubble",
      layout: "single",
      packaged: true,
      editorPlan: {
        scriptFilename: "office-light-panel.js",
        editorMode: "expert",
        fields: [{
          id: "Office light",
          target: "bubble",
          bubbleButtonType: "switch",
          entityId: "light.office",
          column: 1,
          row: 2,
          width: 3,
          height: 2,
        }],
      },
      script: {
        filename: "office-light-panel.js",
        customElementName: "office-light-panel",
      },
    });
    expect(summarizeHomeAssistantCardImport(cardPackage.content)).toMatchObject({
      packaged: false,
    });
  });

  it("inspects import artifacts before parsing them", () => {
    const cardPackage = createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardConfiguration({
        target: "bubble",
        title: "Door",
        entityIds: ["binary_sensor.door"],
      }),
      format: "json",
      name: "Door",
    });

    expect(inspectHomeAssistantCardArtifact(JSON.stringify(cardPackage))).toEqual({
      kind: "atlas-card-package",
      format: "json",
      importable: true,
      requiresReview: false,
      reason: "The artifact is an ATLAS Home Assistant card package.",
    });
    expect(inspectHomeAssistantCardArtifact(JSON.stringify({
      type: "custom:bubble-card",
      entity: "light.office",
    }))).toMatchObject({
      kind: "home-assistant-card",
      format: "json",
      importable: true,
      requiresReview: false,
    });
    expect(inspectHomeAssistantCardArtifact("type: entities\nentities:\n  - light.office")).toMatchObject({
      kind: "home-assistant-card",
      format: "yaml",
      importable: true,
      requiresReview: false,
    });
  });

  it("flags external card-builder shaped artifacts for explicit review", () => {
    expect(inspectHomeAssistantCardArtifact(JSON.stringify({
      name: "Imported Builder Card",
      blocks: [
        {
          id: "state",
          type: "entity-state",
        },
      ],
      entity_slots: [
        "main",
      ],
    }))).toEqual({
      kind: "external-card-builder-artifact",
      format: "json",
      importable: false,
      requiresReview: true,
      reason: "The artifact resembles an external card-builder export and needs explicit compatibility mapping before import.",
    });
    expect(inspectHomeAssistantCardArtifact("hello")).toEqual({
      kind: "unknown",
      format: "unknown",
      importable: false,
      requiresReview: true,
      reason: "The artifact does not match a supported ATLAS, Home Assistant or known external card-builder shape.",
    });
  });

  it("decides whether inspected artifacts can import, require review or must be rejected", () => {
    expect(decideHomeAssistantCardArtifactImport(JSON.stringify({
      type: "entities",
      title: "Office",
      entities: [
        "sensor.office",
      ],
    }))).toMatchObject({
      action: "import",
      message: "Import can continue with the supported ATLAS or Home Assistant card artifact.",
      inspection: {
        kind: "home-assistant-card",
        importable: true,
      },
    });
    expect(decideHomeAssistantCardArtifactImport(JSON.stringify({
      card_builder_version: "2.6.0",
      blocks: [],
    }))).toMatchObject({
      action: "review",
      message: "Show a compatibility review before importing this external card-builder artifact.",
      inspection: {
        kind: "external-card-builder-artifact",
        requiresReview: true,
      },
    });
    expect(decideHomeAssistantCardArtifactImport("not a card")).toMatchObject({
      action: "reject",
      message: "Reject this artifact because ATLAS cannot identify a safe import path.",
      inspection: {
        kind: "unknown",
        importable: false,
      },
    });
  });

  it("creates a compatibility review for external card-builder artifacts", () => {
    expect(createHomeAssistantCardArtifactReview(JSON.stringify({
      card_builder_version: "2.6.0",
      blocks: [
        { id: "title" },
        { id: "state" },
      ],
      entitySlots: [
        "main",
      ],
    }))).toEqual({
      inspection: {
        kind: "external-card-builder-artifact",
        format: "json",
        importable: false,
        requiresReview: true,
        reason: "The artifact resembles an external card-builder export and needs explicit compatibility mapping before import.",
      },
      items: [
        {
          id: "license",
          label: "License boundary",
          severity: "warning",
          detail: "External card-builder artifacts require explicit compatibility mapping and attribution review before import.",
        },
        {
          id: "blocks",
          label: "Block model",
          severity: "info",
          detail: "2 possible visual blocks detected.",
        },
        {
          id: "entity-slots",
          label: "Entity slots",
          severity: "info",
          detail: "1 possible entity slots detected.",
        },
        {
          id: "next-step",
          label: "Next step",
          severity: "info",
          detail: "Map the external artifact into ATLAS template fields before enabling import.",
        },
      ],
      recommendedAction: "map-schema",
    });
  });

  it("rejects compatibility review for unsupported artifacts", () => {
    expect(createHomeAssistantCardArtifactReview("type: entities\nentities:\n  - sensor.office")).toMatchObject({
      inspection: {
        kind: "home-assistant-card",
      },
      items: [
        {
          id: "unsupported-review",
          severity: "blocked",
        },
      ],
      recommendedAction: "reject",
    });
  });

  it("previews schema mappings from external blocks to ATLAS templates", () => {
    expect(previewHomeAssistantCardArtifactMapping(JSON.stringify({
      card_builder_version: "2.6.0",
      blocks: [
        { id: "main", type: "entity-state" },
        { id: "fan", type: "switch-control" },
        { id: "row", type: "horizontal-layout" },
        { id: "custom", type: "chart" },
      ],
    }))).toEqual({
      inspection: {
        kind: "external-card-builder-artifact",
        format: "json",
        importable: false,
        requiresReview: true,
        reason: "The artifact resembles an external card-builder export and needs explicit compatibility mapping before import.",
      },
      mappings: [
        {
          sourceId: "main",
          sourceType: "entity-state",
          templateId: "state-button",
          confidence: "high",
          reason: "State-like blocks map to the ATLAS state button template.",
        },
        {
          sourceId: "fan",
          sourceType: "switch-control",
          templateId: "switch-button",
          confidence: "high",
          reason: "Switch-like blocks map to the ATLAS switch button template.",
        },
        {
          sourceId: "row",
          sourceType: "horizontal-layout",
          templateId: "horizontal-stack",
          confidence: "medium",
          reason: "Horizontal layout blocks can map to an ATLAS horizontal stack template.",
        },
      ],
      unmappedBlocks: ["custom"],
    });
  });

  it("does not preview mappings for already supported Home Assistant cards", () => {
    expect(previewHomeAssistantCardArtifactMapping(JSON.stringify({
      type: "entities",
      entities: ["sensor.office"],
    }))).toMatchObject({
      inspection: {
        kind: "home-assistant-card",
      },
      mappings: [],
      unmappedBlocks: [],
    });
  });

  it("previews ATLAS editor fields from mapped external blocks", () => {
    expect(previewHomeAssistantCardArtifactFields(JSON.stringify({
      card_builder_version: "2.6.0",
      blocks: [
        { id: "main", type: "entity-state" },
        { id: "fan", type: "switch-control" },
        { id: "unknown", type: "chart" },
      ],
    }))).toMatchObject({
      inspection: {
        kind: "external-card-builder-artifact",
      },
      fields: [
        {
          id: "main",
          target: "bubble",
          layout: "card",
          column: 0,
          row: 0,
          width: 4,
          height: 2,
        },
        {
          id: "fan",
          target: "bubble",
          layout: "card",
          column: 6,
          row: 0,
          width: 4,
          height: 2,
        },
      ],
      unmappedBlocks: ["unknown"],
      requiresReview: true,
    });
  });

  it("formats review lines for host UI output", () => {
    expect(formatHomeAssistantCardArtifactReviewLines(JSON.stringify({
      card_builder_version: "2.6.0",
      blocks: [
        { id: "main", type: "entity-state" },
      ],
      entity_slots: [],
    }))).toEqual([
      "Show a compatibility review before importing this external card-builder artifact.",
      "License boundary: External card-builder artifacts require explicit compatibility mapping and attribution review before import.",
      "Block model: 1 possible visual blocks detected.",
      "Entity slots: 0 possible entity slots detected.",
      "Next step: Map the external artifact into ATLAS template fields before enabling import.",
      "Mapped fields: 1.",
      "Unmapped blocks: none.",
    ]);
    expect(formatHomeAssistantCardArtifactReviewLines("not a card")).toEqual([
      "Reject this artifact because ATLAS cannot identify a safe import path.",
    ]);
  });

  it("serializes nested Home Assistant stack cards recursively", () => {
    expect(serializeHomeAssistantEntitiesCardConfiguration({
      type: "vertical-stack",
      cards: [
        {
          type: "horizontal-stack",
          cards: [
            {
              type: "custom:bubble-card",
              card_type: "button",
              button_type: "state",
              name: "Door",
              entity: "binary_sensor.door",
              show_state: true,
            },
            {
              type: "entities",
              title: "Status",
              entities: [
                { entity: "sensor.status" },
              ],
            },
          ],
        },
      ],
    }, "yaml")).toBe([
      "type: vertical-stack",
      "cards:",
      "  - type: horizontal-stack",
      "    cards:",
      "      - type: \"custom:bubble-card\"",
      "        card_type: \"button\"",
      "        button_type: \"state\"",
      "        name: \"Door\"",
      "        entity: \"binary_sensor.door\"",
      "        show_state: true",
      "      - type: entities",
      "        title: \"Status\"",
      "        entities:",
      "          - entity: \"sensor.status\"",
    ].join("\n"));
  });

  it("parses nested stack cards from Home Assistant YAML examples", () => {
    expect(parseHomeAssistantEntitiesCardConfiguration([
      "type: vertical-stack",
      "cards:",
      "  - type: horizontal-stack",
      "    cards:",
      "      - type: custom:bubble-card",
      "        card_type: button",
      "        button_type: state",
      "        entity: sensor.shellypro3em_512_leistung",
      "        name: Einlieger / Garten",
      "        icon: mdi:flash",
      "        show_name: true",
      "        show_state: true",
      "        modules:",
      "          - liquid_glass_2",
      "        styles: |",
      "          .bubble-icon { color: green; }",
      "      - type: custom:bubble-card",
      "        card_type: button",
      "        button_type: state",
      "        entity: sensor.shellypro3em_500_leistung",
      "        name: Haus",
      "  - type: custom:bubble-card",
      "    card_type: button",
      "    button_type: state",
      "    entity: sensor.shellypro3em_frequency",
      "    name: Netzfrequenz",
    ].join("\n"))).toEqual({
      format: "yaml",
      target: "bubble",
      layout: "vertical-stack",
      card: {
        type: "vertical-stack",
        cards: [
          {
            type: "horizontal-stack",
            cards: [
              {
                type: "custom:bubble-card",
                card_type: "button",
                button_type: "state",
                name: "Einlieger / Garten",
                entity: "sensor.shellypro3em_512_leistung",
                show_state: true,
              },
              {
                type: "custom:bubble-card",
                card_type: "button",
                button_type: "state",
                name: "Haus",
                entity: "sensor.shellypro3em_500_leistung",
                show_state: true,
              },
            ],
          },
          {
            type: "custom:bubble-card",
            card_type: "button",
            button_type: "state",
            name: "Netzfrequenz",
            entity: "sensor.shellypro3em_frequency",
            show_state: true,
          },
        ],
      },
    });
  });

  it("parses nested stack cards from JSON imports", () => {
    const card = {
      type: "vertical-stack",
      cards: [
        {
          type: "horizontal-stack",
          cards: [
            {
              type: "custom:bubble-card",
              entity: "sensor.left_power",
              name: "Left power",
            },
            {
              type: "custom:bubble-card",
              entity: "sensor.right_power",
              name: "Right power",
            },
          ],
        },
        {
          type: "entities",
          title: "Grid",
          entities: ["sensor.grid_frequency"],
        },
      ],
    };

    expect(parseHomeAssistantEntitiesCardConfiguration(JSON.stringify(card))).toEqual({
      format: "json",
      target: "bubble",
      layout: "vertical-stack",
      card: {
        type: "vertical-stack",
        cards: [
          {
            type: "horizontal-stack",
            cards: [
              {
                type: "custom:bubble-card",
                card_type: "button",
                button_type: "state",
                name: "Left power",
                entity: "sensor.left_power",
                show_state: true,
              },
              {
                type: "custom:bubble-card",
                card_type: "button",
                button_type: "state",
                name: "Right power",
                entity: "sensor.right_power",
                show_state: true,
              },
            ],
          },
          {
            type: "entities",
            title: "Grid",
            entities: [
              { entity: "sensor.grid_frequency" },
            ],
          },
        ],
      },
    });
  });

  it("parses grid and conditional cards from Home Assistant YAML examples", () => {
    const parsed = parseHomeAssistantEntitiesCardConfiguration([
      "type: vertical-stack",
      "cards:",
      "  - type: custom:bubble-card",
      "    card_type: button",
      "    button_type: name",
      "    name: NINA",
      "    icon: mdi:alert",
      "    show_name: true",
      "  - type: grid",
      "    columns: 2",
      "    square: false",
      "    cards:",
      "      - type: conditional",
      "        conditions:",
      "          - condition: state",
      "            entity: >-",
      "              binary_sensor.nina_warning_1",
      "            state: \"on\"",
      "        card:",
      "          type: vertical-stack",
      "          cards:",
      "            - type: custom:bubble-card",
      "              card_type: separator",
      "              name: NINA Warnung 1",
      "            - type: custom:bubble-card",
      "              card_type: button",
      "              button_type: state",
      "              entity: >-",
      "                sensor.nina_absender_1",
      "              name: Absender",
    ].join("\n"));

    expect(parsed.format).toBe("yaml");
    expect(parsed.target).toBe("bubble");
    expect(parsed.layout).toBe("vertical-stack");
    expect(parsed.card).toEqual({
      type: "vertical-stack",
      cards: [
        {
          type: "custom:bubble-card",
          card_type: "button",
          button_type: "name",
          name: "NINA",
        },
        {
          type: "grid",
          columns: 2,
          square: false,
          cards: [
            {
              type: "conditional",
              conditions: [
                {
                  condition: "state",
                  entity: "binary_sensor.nina_warning_1",
                  state: "on",
                },
              ],
              card: {
                type: "vertical-stack",
                cards: [
                  {
                    type: "custom:bubble-card",
                    card_type: "separator",
                    name: "NINA Warnung 1",
                  },
                  {
                    type: "custom:bubble-card",
                    card_type: "button",
                    button_type: "state",
                    name: "Absender",
                    entity: "sensor.nina_absender_1",
                    show_state: true,
                  },
                ],
              },
            },
          ],
        },
      ],
    });
    expect(summarizeHomeAssistantCardImport(serializeHomeAssistantEntitiesCardConfiguration(parsed.card, "json")).entityIds).toEqual([
      "binary_sensor.nina_warning_1",
      "sensor.nina_absender_1",
    ]);
  });

  it("parses hand-built Bubble switch columns from Home Assistant YAML", () => {
    const parsed = parseHomeAssistantEntitiesCardConfiguration([
      "type: horizontal-stack",
      "cards:",
      "  - type: vertical-stack",
      "    cards:",
      "      - type: custom:bubble-card",
      "        card_type: button",
      "        button_type: switch",
      "        entity: switch.lampe_gross",
      "        name: Groß",
      "        tap_action:",
      "          action: toggle",
      "      - type: custom:bubble-card",
      "        card_type: empty-column",
      "        button_type: switch",
      "        entity: switch.licht_werkbank",
      "        name: Werkbank",
      "  - type: vertical-stack",
      "    cards:",
      "      - type: custom:bubble-card",
      "        card_type: button",
      "        button_type: switch",
      "        entity: switch.sitzplatz_kugel",
      "        name: Sitzplatz",
      "title: Garten",
    ].join("\n"));

    expect(parsed).toEqual({
      format: "yaml",
      target: "bubble",
      layout: "horizontal-stack",
      card: {
        type: "horizontal-stack",
        cards: [
          {
            type: "vertical-stack",
            cards: [
              {
                type: "custom:bubble-card",
                card_type: "button",
                button_type: "switch",
                name: "Groß",
                entity: "switch.lampe_gross",
                show_state: true,
              },
              {
                type: "custom:bubble-card",
                card_type: "empty-column",
                button_type: "switch",
                name: "Werkbank",
                entity: "switch.licht_werkbank",
                show_state: true,
              },
            ],
          },
          {
            type: "vertical-stack",
            cards: [
              {
                type: "custom:bubble-card",
                card_type: "button",
                button_type: "switch",
                name: "Sitzplatz",
                entity: "switch.sitzplatz_kugel",
                show_state: true,
              },
            ],
          },
        ],
      },
    });
    expect(summarizeHomeAssistantCardImport(serializeHomeAssistantEntitiesCardConfiguration(parsed.card, "json")).entityIds).toEqual([
      "switch.lampe_gross",
      "switch.licht_werkbank",
      "switch.sitzplatz_kugel",
    ]);
  });

  it("parses Mushroom, Bubble and Tabbed Card V2 cards", () => {
    expect(parseHomeAssistantEntitiesCardConfiguration([
      "type: custom:mushroom-template-card",
      "primary: Office climate",
      "secondary: sensor.office_temperature",
      "entity: sensor.office_temperature",
    ].join("\n"))).toEqual({
      format: "yaml",
      target: "mushroom-template",
      layout: "single",
      card: {
        type: "custom:mushroom-template-card",
        primary: "Office climate",
        secondary: "sensor.office_temperature",
        entity: "sensor.office_temperature",
      },
    });
    expect(parseHomeAssistantEntitiesCardConfiguration(JSON.stringify({
      type: "custom:bubble-card",
      card_type: "button",
      button_type: "state",
      name: "Office light",
      entity: "light.office",
    }))).toEqual({
      format: "json",
      target: "bubble",
      layout: "single",
      card: {
        type: "custom:bubble-card",
        card_type: "button",
        button_type: "state",
        name: "Office light",
        entity: "light.office",
        show_state: true,
      },
    });
    expect(parseHomeAssistantEntitiesCardConfiguration([
      "type: custom:tabbed-card-v2",
      "options:",
      "  defaultTabIndex: 1",
      "columns: full",
      "rows: auto",
      "tabs:",
      "  - attributes:",
      "      label: Light",
      "      icon: mdi:lightbulb",
      "    card:",
      "      type: entity",
      "      name: Office light",
      "      entity: light.office",
      "  - attributes:",
      "      label: Climate",
      "    card:",
      "      type: sensor",
      "      name: Office temperature",
      "      entity: sensor.office_temperature",
    ].join("\n"))).toEqual({
      format: "yaml",
      target: "tabbed-card-v2",
      layout: "single",
      card: {
        type: "custom:tabbed-card-v2",
        options: {
          defaultTabIndex: 1,
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
              name: "Office light",
              entity: "light.office",
            },
          },
          {
            attributes: {
              label: "Climate",
            },
            card: {
              type: "sensor",
              name: "Office temperature",
              entity: "sensor.office_temperature",
            },
          },
        ],
      },
    });
  });

  it("summarizes imported cards for host editors", () => {
    const summary = summarizeHomeAssistantCardImport([
      "type: horizontal-stack",
      "cards:",
      "  - type: \"custom:bubble-card\"",
      "    card_type: \"button\"",
      "    button_type: \"state\"",
      "    name: \"Office light\"",
      "    entity: \"light.office\"",
      "    show_state: true",
      "  - type: \"custom:bubble-card\"",
      "    card_type: \"button\"",
      "    button_type: \"state\"",
      "    name: \"Office fan\"",
      "    entity: \"switch.office_fan\"",
      "    show_state: true",
    ].join("\n"));

    expect(summary).toMatchObject({
      title: "Office light",
      entityIds: ["light.office", "switch.office_fan"],
      format: "yaml",
      target: "bubble",
      layout: "horizontal-stack",
      packaged: false,
      dependency: {
        id: "bubble-card",
        label: "Bubble Card",
        required: true,
        resourcePaths: ["/hacsfiles/Bubble-Card/bubble-card.js"],
        installPaths: ["HACS > Frontend > Bubble Card", "/hacsfiles/Bubble-Card/bubble-card.js"],
      },
    });
  });

  it("inspects card_mod and layout style blocks from pasted YAML", () => {
    const inspection = inspectHomeAssistantCardStyleBlocks([
      "show_name: true",
      "show_icon: true",
      "show_state: true",
      "type: glance",
      "entities:",
      "- entity: sensor.hyper_2000_eg_1_solar_input_power",
      "  name: Leistung",
      "  card_mod:",
      "  style: |",
      "    :host {",
      "      --card-mod-icon-color: lightblue;",
      "      --mdc-icon-size: 48px;",
      "    }",
      "- entity: sensor.hyper_2000_eg_1_output_home_power",
      "  name: ins Haus",
      "  icon: mdi:home",
      "  card_mod:",
      "  style: |",
      "    :host {",
      "      --card-mod-icon-color: yellow;",
      "    }",
      "grid_options:",
      "  rows: auto",
      "  columns: 18",
      "card_mod:",
      "style: |",
      "  ha-card {",
      "    border: 0.2px solid var(--primary-color);",
      "  }",
    ].join("\n"));

    expect(inspection.hasStyles).toBe(true);
    expect(inspection.cardStyles.map(block => block.label)).toContain("sensor.hyper_2000_eg_1_solar_input_power");
    expect(inspection.cardStyles.map(block => block.label)).toContain("sensor.hyper_2000_eg_1_output_home_power");
    expect(inspection.layoutOptions[0]).toMatchObject({
      scope: "layout",
      key: "grid_options",
    });
    expect(inspection.globalStyles.some(block => block.code.includes("ha-card"))).toBe(true);
  });

  it("converts card_mod style containers to uix while preserving YAML content", () => {
    const converted = convertHomeAssistantCardModStylesToUixStyle([
      "type: glance",
      "entities:",
      "  - entity: sensor.power",
      "    card_mod:",
      "      style: |",
      "        :host {",
      "          --mdc-icon-size: 48px;",
      "        }",
      "card_mod:",
      "  style: |",
      "    ha-card {",
      "      border-radius: 12px",
      "    }",
    ].join("\n"));

    expect(converted).not.toContain("card_mod:");
    expect(converted).toContain("    uix:");
    expect(converted).toContain("uix:");
    expect(converted).toContain("      style: |");
    expect(converted).toContain("          --mdc-icon-size: 48px;");
    expect(converted).toContain("      border-radius: 12px");
  });

  it("imports glance cards with style blocks as supported Home Assistant cards", () => {
    const text = importedGlanceCardFixture;

    expect(decideHomeAssistantCardArtifactImport(text)).toMatchObject({
      action: "import",
      inspection: {
        kind: "home-assistant-card",
        importable: true,
      },
    });
    const summary = summarizeHomeAssistantCardImport(text);
    expect(summary).toMatchObject({
      target: "glance",
      entityIds: [
        "sensor.hyper_2000_eg_1_solar_input_power",
        "sensor.hyper_2000_eg_1_output_home_power",
        "sensor.hyper_2000_eg_1_pack_input_power",
        "sensor.hyper_2000_eg_1_output_pack_power",
        "sensor.ab2000x_16609_soc_level",
        "sensor.ab2000x_20030_soc_level",
        "binary_sensor.hyper_2000_eg_1_hems_state",
        "binary_sensor.hyper_2000_eg_1_heat_state",
      ],
      card: {
        type: "glance",
        title: "hyper 2000 EG 1",
        show_name: true,
        show_icon: true,
        show_state: true,
        columns: 8,
        state_color: true,
      },
    });
    expect(summary.card.type === "glance" ? summary.card.entities : []).toHaveLength(8);
    expect(summary.card.type === "glance" ? summary.card.entities : []).toContainEqual({
      entity: "sensor.hyper_2000_eg_1_solar_input_power",
      name: "Leistung",
      show_last_changed: false,
    });
    expect(summary.card.type === "glance" ? summary.card.entities : []).toContainEqual({
      entity: "sensor.hyper_2000_eg_1_output_home_power",
      name: "ins Haus",
      icon: "mdi:home",
    });
    const styleInspection = inspectHomeAssistantCardStyleBlocks(text);
    expect(styleInspection.globalStyles).toHaveLength(1);
    expect(styleInspection.cardStyles).toHaveLength(6);
    expect(styleInspection.layoutOptions).toHaveLength(1);
  });

  it("imports raw custom HACS cards and extracts nested entity references", () => {
    const text = [
      "type: custom:gauge-card-pro",
      "segments:",
      "  - from: 0",
      "    color: red",
      "  - from: 4000",
      "    color: '#086f56'",
      "needle: true",
      "gradient: true",
      "titles:",
      "  primary:",
      "    value: '{{ state_attr(entity, ''friendly_name'') }}'",
      "entity: sensor.gesamtleistung",
      "entity2: input_number.gesamtleistung_max",
      "inner:",
      "  min: 0",
      "  max: 5000",
      "card_mod:",
      "  style: |",
      "    ha-card {",
      "      border: 0.5px solid var(--primary-color);",
      "      border-radius: 12px",
      "    }",
    ].join("\n");

    expect(decideHomeAssistantCardArtifactImport(text)).toMatchObject({
      action: "import",
      inspection: {
        kind: "home-assistant-card",
        importable: true,
      },
    });
    const summary = summarizeHomeAssistantCardImport(text);
    const styleInspection = inspectHomeAssistantCardStyleBlocks(text);
    expect(summary).toMatchObject({
      target: "custom-card",
      title: "gauge-card-pro",
      entityIds: [
        "sensor.gesamtleistung",
        "input_number.gesamtleistung_max",
      ],
      card: {
        type: "custom:gauge-card-pro",
        needle: true,
        gradient: true,
      },
    });
    expect(styleInspection.globalStyles).toHaveLength(1);
    expect(styleInspection.cardStyles).toHaveLength(0);
    expect(serializeHomeAssistantEntitiesCardConfiguration(summary.card, "yaml")).toContain("type: \"custom:gauge-card-pro\"");
  });

  it("rejects cards without supported entities", () => {
    expect(() => parseHomeAssistantEntitiesCardConfiguration("type: markdown\ncontent: test")).toThrow();
    expect(() => parseHomeAssistantEntitiesCardConfiguration("{\"type\":\"entities\",\"entities\":[]}")).toThrow();
  });
});
