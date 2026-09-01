export type HomeAssistantCardEditorReferenceUsage =
  | "inspiration"
  | "interop-candidate"
  | "fork-candidate";

export interface HomeAssistantCardEditorReference {
  readonly name: string;
  readonly repositoryUrl: string;
  readonly license: string;
  readonly usage: readonly HomeAssistantCardEditorReferenceUsage[];
  readonly attributionRequired: boolean;
  readonly cloneRecommended: boolean;
  readonly notes: readonly string[];
}

export type HomeAssistantCardEditorInteropStatus =
  | "supported"
  | "planned"
  | "blocked-by-license"
  | "not-planned";

export interface HomeAssistantCardEditorInteropCapability {
  readonly id: string;
  readonly label: string;
  readonly status: HomeAssistantCardEditorInteropStatus;
  readonly reason: string;
}

export interface HomeAssistantCardEditorInteropPlan {
  readonly reference: HomeAssistantCardEditorReference;
  readonly sourceCodePolicy: "do-not-copy";
  readonly capabilities: readonly HomeAssistantCardEditorInteropCapability[];
  readonly recommendedNextStep: string;
}

export function createHomeAssistantCardBuilderReference(): HomeAssistantCardEditorReference {
  return {
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
  };
}

export function createHomeAssistantCardBuilderInteropPlan(): HomeAssistantCardEditorInteropPlan {
  return {
    reference: createHomeAssistantCardBuilderReference(),
    sourceCodePolicy: "do-not-copy",
    capabilities: [
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
    ],
    recommendedNextStep: "Keep ATLAS independent, then add import/export compatibility only through documented schemas and explicit attribution.",
  };
}
