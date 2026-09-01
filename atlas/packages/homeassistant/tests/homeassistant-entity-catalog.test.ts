import { describe, expect, it } from "vitest";

import {
  createHomeAssistantEntityCatalog,
  createHomeAssistantEntityState,
  defaultHomeAssistantEntityDomains,
  filterHomeAssistantEntityCatalog,
  getHomeAssistantEntityDomain,
  listHomeAssistantEntityCatalogDomains,
  listHomeAssistantEntityDomainShortcuts,
} from "../src";

describe("Home Assistant entity catalog", () => {
  it("extracts Home Assistant entity domains", () => {
    expect(getHomeAssistantEntityDomain("sensor.office_temperature")).toBe("sensor");
    expect(getHomeAssistantEntityDomain("binary_sensor.atlas_door")).toBe("binary_sensor");
    expect(getHomeAssistantEntityDomain("atlas_status")).toBe("other");
  });

  it("creates a sorted deduplicated catalog with live entity labels", () => {
    const catalog = createHomeAssistantEntityCatalog({
      entityIds: [" switch.office_fan ", "sensor.office_temperature", "switch.office_fan"],
      entities: [
        createHomeAssistantEntityState({
          entityId: "light.office",
          state: "on",
          name: "Office light",
        }),
        createHomeAssistantEntityState({
          entityId: "sensor.office_temperature",
          state: "available",
          name: "Office temperature",
          unit: "°C",
        }),
      ],
    });

    expect(catalog.map(entry => entry.entityId)).toEqual([
      "light.office",
      "sensor.office_temperature",
      "switch.office_fan",
    ]);
    expect(catalog.find(entry => entry.entityId === "sensor.office_temperature")).toMatchObject({
      domain: "sensor",
      label: "Office temperature",
    });
  });

  it("lists domains and stable preferred shortcuts", () => {
    const catalog = createHomeAssistantEntityCatalog({
      entityIds: ["switch.office_fan", "sensor.office_temperature", "cover.garage"],
    });
    const domains = listHomeAssistantEntityCatalogDomains(catalog);

    expect(defaultHomeAssistantEntityDomains).toEqual(["sensor", "binary_sensor", "switch", "light"]);
    expect(domains).toEqual(["cover", "sensor", "switch"]);
    expect(listHomeAssistantEntityDomainShortcuts(domains)).toEqual([
      "all",
      "sensor",
      "switch",
      "cover",
    ]);
  });

  it("filters entities by domain and partial entity or label search", () => {
    const catalog = createHomeAssistantEntityCatalog({
      entityIds: ["switch.office_fan", "sensor.office_temperature"],
      entities: [
        createHomeAssistantEntityState({
          entityId: "binary_sensor.hyperion_ready",
          state: "on",
          name: "Hyperion ready",
        }),
      ],
    });

    expect(filterHomeAssistantEntityCatalog(catalog, { domain: "sensor" }).map(entry => entry.entityId)).toEqual([
      "sensor.office_temperature",
    ]);
    expect(filterHomeAssistantEntityCatalog(catalog, { search: "hyper" }).map(entry => entry.entityId)).toEqual([
      "binary_sensor.hyperion_ready",
    ]);
    expect(filterHomeAssistantEntityCatalog(catalog, { domain: "switch", search: "office" }).map(entry => entry.entityId)).toEqual([
      "switch.office_fan",
    ]);
  });
});
