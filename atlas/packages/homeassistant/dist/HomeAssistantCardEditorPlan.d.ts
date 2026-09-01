import type { HomeAssistantBubbleButtonType, HomeAssistantCardConfiguration, HomeAssistantCardDependency, HomeAssistantCardLayout, HomeAssistantCardStyleBlock, HomeAssistantCardTarget } from "./HomeAssistantCardConfiguration";
export type HomeAssistantCardEditorMode = "simple" | "expert";
export type HomeAssistantCardEditorSurfaceFieldLayout = "card" | "grid" | "horizontal-stack" | "vertical-stack";
export type HomeAssistantCardEditorTemplateId = "entity-list" | "glance-card" | "entity-card" | "state-button" | "switch-button" | "button-card" | "grid" | "sensor-card" | "thermostat-card" | "link-card" | "webpage-card" | "tabbed-card-v2" | "vertical-stack" | "horizontal-stack";
export interface HomeAssistantCardEditorGridBounds {
    readonly columns: number;
    readonly rows: number;
}
export interface HomeAssistantCardEditorTemplate {
    readonly id: HomeAssistantCardEditorTemplateId;
    readonly label: string;
    readonly layout: HomeAssistantCardEditorSurfaceFieldLayout;
    readonly target: HomeAssistantCardTarget;
    readonly defaultWidth: number;
    readonly defaultHeight: number;
    readonly defaultEntityDomain?: string;
    readonly preview: readonly string[];
}
export interface HomeAssistantCardEditorTemplatePlacementInput {
    readonly template: HomeAssistantCardEditorTemplate | HomeAssistantCardEditorTemplateId;
    readonly target?: HomeAssistantCardTarget;
    readonly bubbleButtonType?: HomeAssistantBubbleButtonType;
    readonly entityId?: string;
    readonly id?: string;
    readonly column: number;
    readonly row: number;
    readonly width?: number;
    readonly height?: number;
    readonly bounds?: HomeAssistantCardEditorGridBounds;
}
export interface HomeAssistantCardEditorSurfaceFieldEntry {
    readonly id: string;
    readonly target?: HomeAssistantCardTarget;
    readonly bubbleButtonType?: HomeAssistantBubbleButtonType;
    readonly entityId?: string;
    readonly icon?: string;
    readonly show_last_changed?: boolean;
    readonly styleBlocks?: readonly HomeAssistantCardStyleBlock[];
    readonly cards?: readonly HomeAssistantCardEditorSurfaceFieldEntry[];
}
export interface HomeAssistantCardEditorSurfaceField {
    readonly id: string;
    readonly target: HomeAssistantCardTarget;
    readonly bubbleButtonType?: HomeAssistantBubbleButtonType;
    readonly entityId: string;
    readonly layout?: HomeAssistantCardEditorSurfaceFieldLayout;
    readonly entries?: readonly HomeAssistantCardEditorSurfaceFieldEntry[];
    readonly activeTabIndex?: number;
    readonly columns?: "full" | number;
    readonly rows?: "auto";
    readonly column: number;
    readonly row: number;
    readonly width: number;
    readonly height: number;
}
export interface HomeAssistantCardEditorPackagePlanInput {
    readonly cardName?: string;
    readonly scriptFilename?: string;
    readonly editorMode?: HomeAssistantCardEditorMode;
    readonly simpleTarget?: HomeAssistantCardTarget;
    readonly defaultEntityIds?: readonly string[];
    readonly supportedLayouts?: readonly HomeAssistantCardLayout[];
    readonly supportedFieldTargets?: readonly HomeAssistantCardTarget[];
    readonly fields?: readonly HomeAssistantCardEditorSurfaceField[];
}
export interface HomeAssistantCardEditorPackagePlan {
    readonly cardName: string;
    readonly scriptFilename: string;
    readonly resourcePath: string;
    readonly editorMode: HomeAssistantCardEditorMode;
    readonly simpleTarget: HomeAssistantCardTarget;
    readonly defaultEntityIds: readonly string[];
    readonly supportedLayouts: readonly HomeAssistantCardLayout[];
    readonly supportedFieldTargets: readonly HomeAssistantCardTarget[];
    readonly fields: readonly HomeAssistantCardEditorSurfaceField[];
    readonly layoutMode: "drag-and-drop";
    readonly replacementHint: string;
}
export interface HomeAssistantCardEditorDependencyPlan {
    readonly editorPlan: HomeAssistantCardEditorPackagePlan;
    readonly usedTargets: readonly HomeAssistantCardTarget[];
    readonly dependencies: readonly HomeAssistantCardDependency[];
    readonly requiredResourcePaths: readonly string[];
    readonly installSteps: readonly string[];
}
export interface HomeAssistantCardEditorScriptExport {
    readonly filename: string;
    readonly customElementName: string;
    readonly cardType: `custom:${string}`;
    readonly resourcePath: string;
    readonly defaultConfig: {
        readonly type: `custom:${string}`;
        readonly title: string;
        readonly entities: readonly string[];
        readonly replacement_hint: string;
    };
    readonly source: string;
}
export interface HomeAssistantCardEditorSurfaceOverlap {
    readonly firstFieldId: string;
    readonly secondFieldId: string;
}
export interface HomeAssistantCardEditorSurfaceAnalysis {
    readonly fieldCount: number;
    readonly populatedFieldCount: number;
    readonly emptyFieldCount: number;
    readonly overlapCount: number;
    readonly rowCount: number;
    readonly usedColumns: number;
    readonly usedRows: number;
    readonly usedTargets: readonly HomeAssistantCardTarget[];
    readonly layouts: readonly HomeAssistantCardEditorSurfaceFieldLayout[];
    readonly emptyFieldIds: readonly string[];
    readonly overlappingFieldIds: readonly string[];
    readonly overlaps: readonly HomeAssistantCardEditorSurfaceOverlap[];
}
export declare const defaultHomeAssistantCardEditorEntityIds: readonly ["binary_sensor.atlas_status", "sensor.atlas_temperature"];
export declare function listHomeAssistantCardEditorTemplates(): readonly HomeAssistantCardEditorTemplate[];
export declare function findHomeAssistantCardEditorTemplate(templateId: HomeAssistantCardEditorTemplateId): HomeAssistantCardEditorTemplate | undefined;
export declare function createHomeAssistantCardEditorFieldFromTemplate(input: HomeAssistantCardEditorTemplatePlacementInput): HomeAssistantCardEditorSurfaceField;
export declare function createHomeAssistantCardEditorPackagePlan(input?: HomeAssistantCardEditorPackagePlanInput): HomeAssistantCardEditorPackagePlan;
export declare function createHomeAssistantCardEditorDependencyPlan(input?: HomeAssistantCardEditorPackagePlanInput): HomeAssistantCardEditorDependencyPlan;
export declare function createHomeAssistantCardEditorScriptExport(input?: HomeAssistantCardEditorPackagePlan | HomeAssistantCardEditorPackagePlanInput): HomeAssistantCardEditorScriptExport;
export declare function analyzeHomeAssistantCardEditorSurface(fields?: readonly HomeAssistantCardEditorSurfaceField[]): HomeAssistantCardEditorSurfaceAnalysis;
export declare function arrangeHomeAssistantCardEditorSurfaceFields(fields?: readonly HomeAssistantCardEditorSurfaceField[], bounds?: HomeAssistantCardEditorGridBounds): HomeAssistantCardEditorSurfaceField[];
export declare function createHomeAssistantCardEditorConfiguration(input?: HomeAssistantCardEditorPackagePlanInput): HomeAssistantCardConfiguration;
export declare function normalizeHomeAssistantCardEditorScriptFilename(name: string): string;
export declare function normalizeHomeAssistantCustomElementName(scriptFilename: string): string;
export declare function clampSurfaceFieldPlacement(placement: Pick<HomeAssistantCardEditorSurfaceField, "column" | "row" | "width" | "height">, bounds?: HomeAssistantCardEditorGridBounds): Pick<HomeAssistantCardEditorSurfaceField, "column" | "row" | "width" | "height">;
