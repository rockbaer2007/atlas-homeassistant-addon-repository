import type { HomeAssistantCardEditorPackagePlan, HomeAssistantCardEditorScriptExport } from "./HomeAssistantCardEditorPlan";
export interface HomeAssistantEntitiesCardEntity {
    readonly entity: string;
    readonly name?: string;
    readonly icon?: string;
    readonly show_last_changed?: boolean;
}
export type HomeAssistantCardTarget = "entities" | "glance" | "custom-card" | "entity" | "button" | "sensor" | "thermostat" | "link" | "webpage" | "mushroom-template" | "bubble" | "tabbed-card-v2";
export type HomeAssistantCardLayout = "single" | "horizontal-stack" | "vertical-stack";
export type HomeAssistantBubbleButtonType = "name" | "slider" | "state" | "switch";
export interface HomeAssistantEntitiesCardConfiguration {
    readonly type: "entities";
    readonly title: string;
    readonly entities: readonly HomeAssistantEntitiesCardEntity[];
}
export interface HomeAssistantGlanceCardConfiguration {
    readonly type: "glance";
    readonly title?: string;
    readonly show_name?: boolean;
    readonly show_icon?: boolean;
    readonly show_state?: boolean;
    readonly columns?: number;
    readonly state_color?: boolean;
    readonly entities: readonly HomeAssistantEntitiesCardEntity[];
}
export interface HomeAssistantEntityCardConfiguration {
    readonly type: "entity";
    readonly name: string;
    readonly entity: string;
}
export interface HomeAssistantButtonCardTapAction {
    readonly action: "toggle" | "more-info" | "navigate" | "url";
    readonly navigation_path?: string;
    readonly url_path?: string;
}
export interface HomeAssistantButtonCardConfiguration {
    readonly type: "button";
    readonly name: string;
    readonly entity?: string;
    readonly icon?: string;
    readonly tap_action?: HomeAssistantButtonCardTapAction;
}
export interface HomeAssistantSensorCardConfiguration {
    readonly type: "sensor";
    readonly name: string;
    readonly entity: string;
}
export interface HomeAssistantThermostatCardConfiguration {
    readonly type: "thermostat";
    readonly name: string;
    readonly entity: string;
}
export interface HomeAssistantWebpageCardConfiguration {
    readonly type: "iframe";
    readonly title: string;
    readonly url: string;
    readonly aspect_ratio: string;
}
export interface HomeAssistantMushroomTemplateCardConfiguration {
    readonly type: "custom:mushroom-template-card";
    readonly primary: string;
    readonly secondary: string;
    readonly entity: string;
}
export interface HomeAssistantBubbleCardConfiguration {
    readonly type: "custom:bubble-card";
    readonly card_type: "button" | "empty-column" | "separator";
    readonly button_type?: HomeAssistantBubbleButtonType;
    readonly name: string;
    readonly entity?: string;
    readonly show_state?: true;
}
export interface HomeAssistantRawCustomCardConfiguration {
    readonly type: `custom:${string}`;
    readonly [key: string]: unknown;
}
export interface HomeAssistantTabbedCardV2TabAttributes {
    readonly label: string;
    readonly icon?: string;
}
export interface HomeAssistantTabbedCardV2Tab {
    readonly attributes: HomeAssistantTabbedCardV2TabAttributes;
    readonly card: HomeAssistantCardConfiguration;
}
export interface HomeAssistantTabbedCardV2Configuration {
    readonly type: "custom:tabbed-card-v2";
    readonly options: {
        readonly defaultTabIndex: number;
    };
    readonly columns?: "full";
    readonly rows?: "auto";
    readonly tabs: readonly HomeAssistantTabbedCardV2Tab[];
}
export interface HomeAssistantGridCardConfiguration {
    readonly type: "grid";
    readonly columns?: number;
    readonly square?: boolean;
    readonly cards: readonly HomeAssistantCardConfiguration[];
}
export interface HomeAssistantConditionalCardCondition {
    readonly condition: string;
    readonly entity?: string;
    readonly state?: string;
}
export interface HomeAssistantConditionalCardConfiguration {
    readonly type: "conditional";
    readonly conditions: readonly HomeAssistantConditionalCardCondition[];
    readonly card: HomeAssistantCardConfiguration;
}
export interface HomeAssistantStackCardConfiguration {
    readonly type: "horizontal-stack" | "vertical-stack";
    readonly columns?: "full" | number;
    readonly rows?: "auto";
    readonly cards: readonly HomeAssistantCardConfiguration[];
}
export type HomeAssistantSingleCardConfiguration = HomeAssistantEntitiesCardConfiguration | HomeAssistantGlanceCardConfiguration | HomeAssistantEntityCardConfiguration | HomeAssistantButtonCardConfiguration | HomeAssistantSensorCardConfiguration | HomeAssistantThermostatCardConfiguration | HomeAssistantWebpageCardConfiguration | HomeAssistantMushroomTemplateCardConfiguration | HomeAssistantBubbleCardConfiguration | HomeAssistantTabbedCardV2Configuration | HomeAssistantRawCustomCardConfiguration | HomeAssistantGridCardConfiguration | HomeAssistantConditionalCardConfiguration;
export type HomeAssistantCustomCardConfiguration = HomeAssistantMushroomTemplateCardConfiguration | HomeAssistantBubbleCardConfiguration | HomeAssistantTabbedCardV2Configuration | HomeAssistantRawCustomCardConfiguration;
export type HomeAssistantCardConfiguration = HomeAssistantSingleCardConfiguration | HomeAssistantStackCardConfiguration;
export interface HomeAssistantEntitiesCardParseResult {
    readonly card: HomeAssistantCardConfiguration;
    readonly format: "json" | "yaml";
    readonly target: HomeAssistantCardTarget;
    readonly layout: HomeAssistantCardLayout;
}
export type HomeAssistantCardExportFormat = "json" | "yaml";
export interface HomeAssistantEntitiesCardInput {
    readonly target?: HomeAssistantCardTarget;
    readonly layout?: HomeAssistantCardLayout;
    readonly bubbleButtonType?: HomeAssistantBubbleButtonType;
    readonly title?: string;
    readonly entityIds: readonly string[];
}
export interface HomeAssistantCardDependency {
    readonly id: "home-assistant" | "mushroom" | "bubble-card" | "tabbed-card-v2";
    readonly label: string;
    readonly required: boolean;
    readonly resourcePaths: readonly string[];
    readonly installPaths: readonly string[];
}
export interface HomeAssistantLovelaceResource {
    readonly url: string;
}
export type HomeAssistantLovelaceResourceType = "module";
export interface HomeAssistantLovelaceResourceReference {
    readonly url: string;
    readonly type: HomeAssistantLovelaceResourceType;
}
export interface HomeAssistantCardDependencyAvailability {
    readonly dependency: HomeAssistantCardDependency;
    readonly status: "not-required" | "installed" | "missing";
    readonly matchedResourcePaths: readonly string[];
    readonly missingResourcePaths: readonly string[];
}
export interface HomeAssistantCardTargetDescriptor {
    readonly target: HomeAssistantCardTarget;
    readonly label: string;
    readonly type: HomeAssistantSingleCardConfiguration["type"];
    readonly dependency: HomeAssistantCardDependency;
}
export interface HomeAssistantCardExportManifestInput {
    readonly card: HomeAssistantCardConfiguration;
    readonly format: HomeAssistantCardExportFormat;
    readonly name?: string;
    readonly editorPlan?: HomeAssistantCardEditorPackagePlan;
    readonly languages?: readonly string[];
}
export interface HomeAssistantCardExportManifest {
    readonly name: string;
    readonly filename: string;
    readonly format: HomeAssistantCardExportFormat;
    readonly mimeType: "application/json" | "text/yaml";
    readonly target: HomeAssistantCardTarget;
    readonly layout: HomeAssistantCardLayout;
    readonly dependency: HomeAssistantCardDependency;
    readonly languages: readonly string[];
    readonly fallbackLanguages: readonly string[];
}
export interface HomeAssistantCardExportPayloadInput extends HomeAssistantCardExportManifestInput {
}
export interface HomeAssistantCardExportPackageInput extends HomeAssistantCardExportPayloadInput {
    readonly script?: HomeAssistantCardEditorScriptExport;
}
export interface HomeAssistantCardExportPayload {
    readonly manifest: HomeAssistantCardExportManifest;
    readonly content: string;
}
export interface HomeAssistantCardExportPackage {
    readonly version: 1;
    readonly kind: "atlas.homeassistant.card";
    readonly manifest: HomeAssistantCardExportManifest;
    readonly content: string;
    readonly locales: readonly HomeAssistantCardLocaleFile[];
    readonly editorPlan?: HomeAssistantCardEditorPackagePlan;
    readonly script?: HomeAssistantCardEditorScriptExport;
}
export type HomeAssistantCardLocaleStatus = "manual" | "fallback" | "machine";
export interface HomeAssistantCardLocaleFile {
    readonly language: string;
    readonly path: `locales/${string}.json`;
    readonly status: HomeAssistantCardLocaleStatus;
    readonly content: HomeAssistantCardLocaleContent;
}
export interface HomeAssistantCardLocaleContent {
    readonly _meta: {
        readonly language: string;
        readonly status: HomeAssistantCardLocaleStatus;
        readonly sourceLanguage: "en";
        readonly provider?: string;
        readonly model?: string;
        readonly note?: string;
    };
    readonly card: {
        readonly title: string;
        readonly unavailable: string;
        readonly replaceDemoEntities: string;
    };
}
export interface HomeAssistantCardImportSummary {
    readonly card: HomeAssistantCardConfiguration;
    readonly title: string;
    readonly entityIds: readonly string[];
    readonly format: HomeAssistantCardExportFormat;
    readonly target: HomeAssistantCardTarget;
    readonly layout: HomeAssistantCardLayout;
    readonly dependency: HomeAssistantCardDependency;
    readonly packaged: boolean;
    readonly editorPlan?: HomeAssistantCardEditorPackagePlan;
    readonly script?: HomeAssistantCardEditorScriptExport;
}
export interface HomeAssistantCardStyleBlock {
    readonly scope: "global" | "card" | "layout";
    readonly label: string;
    readonly key: string;
    readonly code: string;
}
export interface HomeAssistantCardStyleInspection {
    readonly hasStyles: boolean;
    readonly globalStyles: readonly HomeAssistantCardStyleBlock[];
    readonly cardStyles: readonly HomeAssistantCardStyleBlock[];
    readonly layoutOptions: readonly HomeAssistantCardStyleBlock[];
}
export declare function listHomeAssistantCardTargets(): readonly HomeAssistantCardTargetDescriptor[];
export declare function listHomeAssistantBubbleButtonTypes(): readonly HomeAssistantBubbleButtonType[];
export declare function findHomeAssistantCardTargetDescriptor(target: HomeAssistantCardTarget): HomeAssistantCardTargetDescriptor | undefined;
export declare function createHomeAssistantCardConfiguration(input: HomeAssistantEntitiesCardInput): HomeAssistantCardConfiguration;
export declare function createHomeAssistantEntitiesCardConfiguration(input: HomeAssistantEntitiesCardInput): HomeAssistantEntitiesCardConfiguration;
export declare function serializeHomeAssistantEntitiesCardConfiguration(card: HomeAssistantCardConfiguration, format: HomeAssistantCardExportFormat): string;
export declare function createHomeAssistantCardExportManifest(input: HomeAssistantCardExportManifestInput): HomeAssistantCardExportManifest;
export declare function createHomeAssistantCardExportPayload(input: HomeAssistantCardExportPayloadInput): HomeAssistantCardExportPayload;
export declare function createHomeAssistantCardExportPackage(input: HomeAssistantCardExportPackageInput): HomeAssistantCardExportPackage;
export declare function normalizeHomeAssistantCardExportLanguages(languages?: readonly string[]): readonly string[];
export declare function createHomeAssistantCardLocaleFiles(input: {
    readonly title: string;
    readonly languages: readonly string[];
}): readonly HomeAssistantCardLocaleFile[];
export declare function parseHomeAssistantEntitiesCardConfiguration(text: string): HomeAssistantEntitiesCardParseResult;
export declare function summarizeHomeAssistantCardImport(text: string): HomeAssistantCardImportSummary;
export declare function inspectHomeAssistantCardStyleBlocks(text: string): HomeAssistantCardStyleInspection;
export declare function convertHomeAssistantCardModStylesToUixStyle(text: string): string;
export declare function inspectHomeAssistantCardDependency(cardOrTarget: HomeAssistantCardConfiguration | HomeAssistantCardTarget): HomeAssistantCardDependency;
export declare function inspectHomeAssistantCardDependencyAvailability(cardOrTarget: HomeAssistantCardConfiguration | HomeAssistantCardTarget, resources: readonly (HomeAssistantLovelaceResource | string)[]): HomeAssistantCardDependencyAvailability;
export declare function createHomeAssistantLovelaceResourceReferences(cardOrTarget: HomeAssistantCardConfiguration | HomeAssistantCardTarget): readonly HomeAssistantLovelaceResourceReference[];
export declare function serializeHomeAssistantLovelaceResourceReferences(cardOrTarget: HomeAssistantCardConfiguration | HomeAssistantCardTarget, format: HomeAssistantCardExportFormat): string;
export declare function getHomeAssistantCardTarget(card: HomeAssistantCardConfiguration): HomeAssistantCardTarget;
export declare function getHomeAssistantCardEntityIds(card: HomeAssistantCardConfiguration): readonly string[];
export declare function getHomeAssistantCardTitle(card: HomeAssistantCardConfiguration): string;
