import {
  createRuntimePluginInstallPackage,
  describeRuntimePlugin,
  type RuntimePlugin,
  type RuntimePluginInstallPackage,
} from "@atlas/runtime";

import {
  listHomeAssistantBubbleButtonTypes,
  listHomeAssistantCardTargets,
} from "./HomeAssistantCardConfiguration";
import { listHomeAssistantCardEditorTemplates } from "./HomeAssistantCardEditorPlan";

export const HomeAssistantCardEditorPluginId = "atlas.plugin.homeassistant-card-editor";

export const HomeAssistantCardEditorExtensionPoints = {
  cardEditor: "homeassistant.card-editor",
  cardTarget: "homeassistant.card-target",
  entityPicker: "homeassistant.entity-picker",
  exporter: "homeassistant.exporter",
  packageBuilder: "atlas.plugin.package-builder",
} as const;

export type HomeAssistantCardEditorExtensionPoint =
  typeof HomeAssistantCardEditorExtensionPoints[keyof typeof HomeAssistantCardEditorExtensionPoints];

export const HomeAssistantCardEditorPluginCapabilities = [
  "homeassistant.simple-editor",
  "homeassistant.expert-editor",
  "homeassistant.entity-picker",
  "homeassistant.card-export",
  "homeassistant.hacs-package-export",
] as const;

export type HomeAssistantCardEditorPluginCapability =
  typeof HomeAssistantCardEditorPluginCapabilities[number];

export type HomeAssistantCardEditorPluginService = Readonly<{
  pluginId: typeof HomeAssistantCardEditorPluginId;
  extensionPoints: readonly HomeAssistantCardEditorExtensionPoint[];
  capabilities: readonly HomeAssistantCardEditorPluginCapability[];
  cardTargets: ReturnType<typeof listHomeAssistantCardTargets>;
  templates: ReturnType<typeof listHomeAssistantCardEditorTemplates>;
  bubbleButtonTypes: ReturnType<typeof listHomeAssistantBubbleButtonTypes>;
}>;

export const HomeAssistantCardEditorPluginServiceKey =
  Symbol("@atlas/homeassistant/card-editor-plugin");

export function createHomeAssistantCardEditorPluginService(): HomeAssistantCardEditorPluginService {
  return {
    pluginId: HomeAssistantCardEditorPluginId,
    extensionPoints: Object.values(HomeAssistantCardEditorExtensionPoints),
    capabilities: HomeAssistantCardEditorPluginCapabilities,
    cardTargets: listHomeAssistantCardTargets(),
    templates: listHomeAssistantCardEditorTemplates(),
    bubbleButtonTypes: listHomeAssistantBubbleButtonTypes(),
  };
}

export function createHomeAssistantCardEditorPlugin(): RuntimePlugin {
  return {
    manifest: {
      id: HomeAssistantCardEditorPluginId,
      name: "ATLAS Home Assistant Card Editor",
      nameI18n: {
        de: "ATLAS Home Assistant Karten-Editor",
        en: "ATLAS Home Assistant Card Editor",
      },
      version: "0.2.0-alpha.28",
      description: "Reference plugin for Home Assistant card editing, entity selection and HACS-oriented exports.",
      descriptionI18n: {
        de: "Referenz-Plugin fuer Home-Assistant-Kartenbearbeitung, Entitaetsauswahl und HACS-orientierte Exporte.",
        en: "Reference plugin for Home Assistant card editing, entity selection and HACS-oriented exports.",
      },
      icon: "icon.svg",
      logo: "logo.svg",
      preview: "preview.svg",
      extensionPoints: Object.values(HomeAssistantCardEditorExtensionPoints),
      provides: HomeAssistantCardEditorPluginCapabilities,
    },
    async activate(context) {
      context.services.add({
        key: HomeAssistantCardEditorPluginServiceKey,
        lifetime: "singleton",
        instance: createHomeAssistantCardEditorPluginService(),
      });
    },
  };
}

export function createHomeAssistantCardEditorPluginInstallPackage(): RuntimePluginInstallPackage {
  const plugin = createHomeAssistantCardEditorPlugin();

  return createRuntimePluginInstallPackage({
    plugin: describeRuntimePlugin(plugin),
    readme: [
      "# ATLAS Home Assistant Card Editor",
      "",
      "This package describes the first official ATLAS reference plugin.",
      "",
      "It provides Simple and Expert Home Assistant card editing, entity picker",
      "integration, card export and HACS-oriented package export capabilities.",
      "",
    ].join("\n"),
    files: [{
      path: "examples/homeassistant-card-editor.yaml",
      mediaType: "application/yaml",
      content: [
        "type: custom:atlas-homeassistant-card-editor",
        "entities:",
        "  - binary_sensor.atlas_status",
        "  - sensor.atlas_temperature",
        "",
      ].join("\n"),
    }],
  });
}
