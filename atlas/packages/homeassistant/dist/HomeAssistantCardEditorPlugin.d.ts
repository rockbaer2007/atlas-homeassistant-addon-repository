import { type RuntimePlugin, type RuntimePluginInstallPackage } from "@atlas/runtime";
import { listHomeAssistantBubbleButtonTypes, listHomeAssistantCardTargets } from "./HomeAssistantCardConfiguration";
import { listHomeAssistantCardEditorTemplates } from "./HomeAssistantCardEditorPlan";
export declare const HomeAssistantCardEditorPluginId = "atlas.plugin.homeassistant-card-editor";
export declare const HomeAssistantCardEditorExtensionPoints: {
    readonly cardEditor: "homeassistant.card-editor";
    readonly cardTarget: "homeassistant.card-target";
    readonly entityPicker: "homeassistant.entity-picker";
    readonly exporter: "homeassistant.exporter";
    readonly packageBuilder: "atlas.plugin.package-builder";
};
export type HomeAssistantCardEditorExtensionPoint = typeof HomeAssistantCardEditorExtensionPoints[keyof typeof HomeAssistantCardEditorExtensionPoints];
export declare const HomeAssistantCardEditorPluginCapabilities: readonly ["homeassistant.simple-editor", "homeassistant.expert-editor", "homeassistant.entity-picker", "homeassistant.card-export", "homeassistant.hacs-package-export"];
export type HomeAssistantCardEditorPluginCapability = typeof HomeAssistantCardEditorPluginCapabilities[number];
export type HomeAssistantCardEditorPluginService = Readonly<{
    pluginId: typeof HomeAssistantCardEditorPluginId;
    extensionPoints: readonly HomeAssistantCardEditorExtensionPoint[];
    capabilities: readonly HomeAssistantCardEditorPluginCapability[];
    cardTargets: ReturnType<typeof listHomeAssistantCardTargets>;
    templates: ReturnType<typeof listHomeAssistantCardEditorTemplates>;
    bubbleButtonTypes: ReturnType<typeof listHomeAssistantBubbleButtonTypes>;
}>;
export declare const HomeAssistantCardEditorPluginServiceKey: unique symbol;
export declare function createHomeAssistantCardEditorPluginService(): HomeAssistantCardEditorPluginService;
export declare function createHomeAssistantCardEditorPlugin(): RuntimePlugin;
export declare function createHomeAssistantCardEditorPluginInstallPackage(): RuntimePluginInstallPackage;
