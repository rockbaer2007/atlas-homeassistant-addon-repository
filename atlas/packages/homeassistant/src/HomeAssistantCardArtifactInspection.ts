import type { HomeAssistantCardEditorSurfaceField } from "./HomeAssistantCardEditorPlan";
import { createHomeAssistantCardEditorFieldFromTemplate } from "./HomeAssistantCardEditorPlan";

export type HomeAssistantCardArtifactKind =
  | "atlas-card-package"
  | "home-assistant-card"
  | "external-card-builder-artifact"
  | "unknown";

export interface HomeAssistantCardArtifactInspection {
  readonly kind: HomeAssistantCardArtifactKind;
  readonly format: "json" | "yaml" | "unknown";
  readonly importable: boolean;
  readonly requiresReview: boolean;
  readonly reason: string;
}

export type HomeAssistantCardArtifactImportAction =
  | "import"
  | "review"
  | "reject";

export interface HomeAssistantCardArtifactImportDecision {
  readonly action: HomeAssistantCardArtifactImportAction;
  readonly inspection: HomeAssistantCardArtifactInspection;
  readonly message: string;
}

export type HomeAssistantCardArtifactReviewSeverity = "info" | "warning" | "blocked";

export interface HomeAssistantCardArtifactReviewItem {
  readonly id: string;
  readonly label: string;
  readonly severity: HomeAssistantCardArtifactReviewSeverity;
  readonly detail: string;
}

export interface HomeAssistantCardArtifactReview {
  readonly inspection: HomeAssistantCardArtifactInspection;
  readonly items: readonly HomeAssistantCardArtifactReviewItem[];
  readonly recommendedAction: "map-schema" | "reject";
}

export interface HomeAssistantCardArtifactBlockMapping {
  readonly sourceId: string;
  readonly sourceType: string;
  readonly templateId:
    | "entity-list"
    | "entity-card"
    | "state-button"
    | "switch-button"
    | "button-card"
    | "grid"
    | "sensor-card"
    | "thermostat-card"
    | "link-card"
    | "webpage-card"
    | "tabbed-card-v2"
    | "vertical-stack"
    | "horizontal-stack";
  readonly confidence: "high" | "medium" | "low";
  readonly reason: string;
}

export interface HomeAssistantCardArtifactMappingPreview {
  readonly inspection: HomeAssistantCardArtifactInspection;
  readonly mappings: readonly HomeAssistantCardArtifactBlockMapping[];
  readonly unmappedBlocks: readonly string[];
}

export interface HomeAssistantCardArtifactFieldPreview {
  readonly inspection: HomeAssistantCardArtifactInspection;
  readonly fields: readonly HomeAssistantCardEditorSurfaceField[];
  readonly unmappedBlocks: readonly string[];
  readonly requiresReview: true;
}

export function inspectHomeAssistantCardArtifact(text: string): HomeAssistantCardArtifactInspection {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      kind: "unknown",
      format: "unknown",
      importable: false,
      requiresReview: true,
      reason: "The artifact is empty.",
    };
  }

  const json = parseJsonRecord(trimmed);
  if (json) {
    return inspectJsonCardArtifact(json);
  }

  if (looksLikeHomeAssistantCardYaml(trimmed)) {
    return {
      kind: "home-assistant-card",
      format: "yaml",
      importable: true,
      requiresReview: false,
      reason: "The artifact looks like a supported Home Assistant card YAML snippet.",
    };
  }

  return {
    kind: "unknown",
    format: "unknown",
    importable: false,
    requiresReview: true,
    reason: "The artifact does not match a supported ATLAS, Home Assistant or known external card-builder shape.",
  };
}

export function decideHomeAssistantCardArtifactImport(
  text: string,
): HomeAssistantCardArtifactImportDecision {
  const inspection = inspectHomeAssistantCardArtifact(text);

  if (inspection.importable && !inspection.requiresReview) {
    return {
      action: "import",
      inspection,
      message: "Import can continue with the supported ATLAS or Home Assistant card artifact.",
    };
  }

  if (inspection.kind === "external-card-builder-artifact") {
    return {
      action: "review",
      inspection,
      message: "Show a compatibility review before importing this external card-builder artifact.",
    };
  }

  return {
    action: "reject",
    inspection,
    message: "Reject this artifact because ATLAS cannot identify a safe import path.",
  };
}

export function createHomeAssistantCardArtifactReview(text: string): HomeAssistantCardArtifactReview {
  const inspection = inspectHomeAssistantCardArtifact(text);
  if (inspection.kind !== "external-card-builder-artifact") {
    return {
      inspection,
      items: [
        {
          id: "unsupported-review",
          label: "No compatibility review available",
          severity: "blocked",
          detail: "Only external card-builder-shaped artifacts have a compatibility review path.",
        },
      ],
      recommendedAction: "reject",
    };
  }

  const json = parseJsonRecord(text.trim());
  return {
    inspection,
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
        detail: `${countArrayValue(json, "blocks")} possible visual blocks detected.`,
      },
      {
        id: "entity-slots",
        label: "Entity slots",
        severity: "info",
        detail: `${countFirstArrayValue(json, ["entity_slots", "entitySlots"])} possible entity slots detected.`,
      },
      {
        id: "next-step",
        label: "Next step",
        severity: "info",
        detail: "Map the external artifact into ATLAS template fields before enabling import.",
      },
    ],
    recommendedAction: "map-schema",
  };
}

export function previewHomeAssistantCardArtifactMapping(
  text: string,
): HomeAssistantCardArtifactMappingPreview {
  const inspection = inspectHomeAssistantCardArtifact(text);
  if (inspection.kind !== "external-card-builder-artifact") {
    return {
      inspection,
      mappings: [],
      unmappedBlocks: [],
    };
  }

  const json = parseJsonRecord(text.trim());
  const blocks = readExternalBlocks(json);
  const mappings = blocks
    .map(mapExternalBlock)
    .filter((mapping): mapping is HomeAssistantCardArtifactBlockMapping => mapping !== undefined);
  const mappedIds = new Set(mappings.map(mapping => mapping.sourceId));

  return {
    inspection,
    mappings,
    unmappedBlocks: blocks
      .filter(block => !mappedIds.has(block.id))
      .map(block => block.id),
  };
}

export function previewHomeAssistantCardArtifactFields(
  text: string,
): HomeAssistantCardArtifactFieldPreview {
  const mappingPreview = previewHomeAssistantCardArtifactMapping(text);

  return {
    inspection: mappingPreview.inspection,
    fields: mappingPreview.mappings.map((mapping, index) => createHomeAssistantCardEditorFieldFromTemplate({
      template: mapping.templateId,
      id: mapping.sourceId,
      entityId: "",
      column: (index % 2) * 6,
      row: Math.floor(index / 2) * 2,
    })),
    unmappedBlocks: mappingPreview.unmappedBlocks,
    requiresReview: true,
  };
}

export function formatHomeAssistantCardArtifactReviewLines(text: string): readonly string[] {
  const decision = decideHomeAssistantCardArtifactImport(text);
  if (decision.action !== "review") {
    return [
      decision.message,
    ];
  }

  const review = createHomeAssistantCardArtifactReview(text);
  const fieldPreview = previewHomeAssistantCardArtifactFields(text);
  return [
    decision.message,
    ...review.items.map(item => `${item.label}: ${item.detail}`),
    `Mapped fields: ${fieldPreview.fields.length}.`,
    `Unmapped blocks: ${fieldPreview.unmappedBlocks.length ? fieldPreview.unmappedBlocks.join(", ") : "none"}.`,
  ];
}

function inspectJsonCardArtifact(json: Record<string, unknown>): HomeAssistantCardArtifactInspection {
  if (json.version === 1 && json.kind === "atlas.homeassistant.card" && typeof json.content === "string") {
    return {
      kind: "atlas-card-package",
      format: "json",
      importable: true,
      requiresReview: false,
      reason: "The artifact is an ATLAS Home Assistant card package.",
    };
  }

  if (isHomeAssistantCardRecord(json)) {
    return {
      kind: "home-assistant-card",
      format: "json",
      importable: true,
      requiresReview: false,
      reason: "The artifact is a supported raw Home Assistant card JSON object.",
    };
  }

  if (looksLikeExternalCardBuilderArtifact(json)) {
    return {
      kind: "external-card-builder-artifact",
      format: "json",
      importable: false,
      requiresReview: true,
      reason: "The artifact resembles an external card-builder export and needs explicit compatibility mapping before import.",
    };
  }

  return {
    kind: "unknown",
    format: "json",
    importable: false,
    requiresReview: true,
    reason: "The JSON artifact is not a supported ATLAS package or Home Assistant card.",
  };
}

function parseJsonRecord(text: string): Record<string, unknown> | undefined {
  try {
    const parsed: unknown = JSON.parse(text);
    return isRecord(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function looksLikeHomeAssistantCardYaml(text: string): boolean {
  return /^type:\s*(entities|glance|entity|button|sensor|thermostat|iframe|grid|horizontal-stack|vertical-stack|custom:[A-Za-z0-9_-]+)\b/m.test(text);
}

function isHomeAssistantCardRecord(value: Record<string, unknown>): boolean {
  return value.type === "entities"
    || value.type === "glance"
    || value.type === "horizontal-stack"
    || value.type === "vertical-stack"
    || value.type === "custom:mushroom-template-card"
    || value.type === "custom:bubble-card"
    || value.type === "custom:tabbed-card-v2"
    || (typeof value.type === "string" && /^custom:[A-Za-z0-9_-]+$/.test(value.type));
}

function looksLikeExternalCardBuilderArtifact(value: Record<string, unknown>): boolean {
  const candidateText = JSON.stringify(value).toLowerCase();
  return candidateText.includes("card-builder")
    || candidateText.includes("card_builder")
    || candidateText.includes("blocks")
    || candidateText.includes("entityslots")
    || candidateText.includes("entity_slots")
    || candidateText.includes("stylebindings")
    || candidateText.includes("style_bindings");
}

function countArrayValue(value: Record<string, unknown> | undefined, key: string): number {
  const candidate = value?.[key];
  return Array.isArray(candidate) ? candidate.length : 0;
}

function countFirstArrayValue(value: Record<string, unknown> | undefined, keys: readonly string[]): number {
  for (const key of keys) {
    const count = countArrayValue(value, key);
    if (count > 0) return count;
  }
  return 0;
}

function readExternalBlocks(value: Record<string, unknown> | undefined): Array<{ readonly id: string; readonly type: string }> {
  const blocks = value?.blocks;
  if (!Array.isArray(blocks)) return [];

  return blocks
    .filter(isRecord)
    .map((block, index) => ({
      id: typeof block.id === "string" && block.id.trim() ? block.id.trim() : `block-${index + 1}`,
      type: typeof block.type === "string" ? block.type.trim().toLowerCase() : "unknown",
    }));
}

function mapExternalBlock(
  block: { readonly id: string; readonly type: string },
): HomeAssistantCardArtifactBlockMapping | undefined {
  if (block.type.includes("switch")) {
    return {
      sourceId: block.id,
      sourceType: block.type,
      templateId: "switch-button",
      confidence: "high",
      reason: "Switch-like blocks map to the ATLAS switch button template.",
    };
  }

  if (block.type.includes("sensor")) {
    return {
      sourceId: block.id,
      sourceType: block.type,
      templateId: "sensor-card",
      confidence: "high",
      reason: "Sensor-like blocks map to the ATLAS sensor card template.",
    };
  }

  if (block.type.includes("thermostat") || block.type.includes("climate")) {
    return {
      sourceId: block.id,
      sourceType: block.type,
      templateId: "thermostat-card",
      confidence: "high",
      reason: "Thermostat-like blocks map to the ATLAS thermostat card template.",
    };
  }

  if (block.type.includes("button")) {
    return {
      sourceId: block.id,
      sourceType: block.type,
      templateId: "button-card",
      confidence: "high",
      reason: "Button-like blocks map to the ATLAS button card template.",
    };
  }

  if (block.type.includes("link")) {
    return {
      sourceId: block.id,
      sourceType: block.type,
      templateId: "link-card",
      confidence: "medium",
      reason: "Link-like blocks map to the ATLAS link card template.",
    };
  }

  if (block.type.includes("webpage") || block.type.includes("iframe")) {
    return {
      sourceId: block.id,
      sourceType: block.type,
      templateId: "webpage-card",
      confidence: "medium",
      reason: "Webpage-like blocks map to the ATLAS webpage card template.",
    };
  }

  if (block.type.includes("grid") || block.type.includes("raster")) {
    return {
      sourceId: block.id,
      sourceType: block.type,
      templateId: "grid",
      confidence: "medium",
      reason: "Grid-like blocks map to the ATLAS grid template.",
    };
  }

  if (block.type.includes("tab")) {
    return {
      sourceId: block.id,
      sourceType: block.type,
      templateId: "tabbed-card-v2",
      confidence: "medium",
      reason: "Tabbed layout blocks can map to the ATLAS Tabbed Card V2 template.",
    };
  }

  if (block.type.includes("state")) {
    return {
      sourceId: block.id,
      sourceType: block.type,
      templateId: "state-button",
      confidence: "high",
      reason: "State-like blocks map to the ATLAS state button template.",
    };
  }

  if (block.type.includes("entity")) {
    return {
      sourceId: block.id,
      sourceType: block.type,
      templateId: "entity-card",
      confidence: "medium",
      reason: "Entity-like blocks can map to an ATLAS entity card template.",
    };
  }

  if (block.type.includes("vertical")) {
    return {
      sourceId: block.id,
      sourceType: block.type,
      templateId: "vertical-stack",
      confidence: "medium",
      reason: "Vertical layout blocks can map to an ATLAS vertical stack template.",
    };
  }

  if (block.type.includes("horizontal")) {
    return {
      sourceId: block.id,
      sourceType: block.type,
      templateId: "horizontal-stack",
      confidence: "medium",
      reason: "Horizontal layout blocks can map to an ATLAS horizontal stack template.",
    };
  }

  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
