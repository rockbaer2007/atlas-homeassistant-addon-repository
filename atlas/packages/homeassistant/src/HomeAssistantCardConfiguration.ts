import type {
  HomeAssistantCardEditorPackagePlan,
  HomeAssistantCardEditorScriptExport,
} from "./HomeAssistantCardEditorPlan";

export interface HomeAssistantEntitiesCardEntity {
  readonly entity: string;
  readonly name?: string;
  readonly icon?: string;
  readonly show_last_changed?: boolean;
}

export type HomeAssistantCardTarget =
  | "entities"
  | "glance"
  | "custom-card"
  | "entity"
  | "button"
  | "sensor"
  | "thermostat"
  | "link"
  | "webpage"
  | "mushroom-template"
  | "bubble"
  | "tabbed-card-v2";
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

export type HomeAssistantSingleCardConfiguration =
  | HomeAssistantEntitiesCardConfiguration
  | HomeAssistantGlanceCardConfiguration
  | HomeAssistantEntityCardConfiguration
  | HomeAssistantButtonCardConfiguration
  | HomeAssistantSensorCardConfiguration
  | HomeAssistantThermostatCardConfiguration
  | HomeAssistantWebpageCardConfiguration
  | HomeAssistantMushroomTemplateCardConfiguration
  | HomeAssistantBubbleCardConfiguration
  | HomeAssistantTabbedCardV2Configuration
  | HomeAssistantRawCustomCardConfiguration
  | HomeAssistantGridCardConfiguration
  | HomeAssistantConditionalCardConfiguration;

export type HomeAssistantCustomCardConfiguration =
  | HomeAssistantMushroomTemplateCardConfiguration
  | HomeAssistantBubbleCardConfiguration
  | HomeAssistantTabbedCardV2Configuration
  | HomeAssistantRawCustomCardConfiguration;

export type HomeAssistantCardConfiguration =
  | HomeAssistantSingleCardConfiguration
  | HomeAssistantStackCardConfiguration;

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

export interface HomeAssistantCardExportPayloadInput extends HomeAssistantCardExportManifestInput {}

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

const cardTargetDescriptors: readonly HomeAssistantCardTargetDescriptor[] = [
  {
    target: "entities",
    label: "Entities",
    type: "entities",
    dependency: { id: "home-assistant", label: "Home Assistant built-in", required: false, resourcePaths: [], installPaths: [] },
  },
  {
    target: "glance",
    label: "Glance",
    type: "glance",
    dependency: { id: "home-assistant", label: "Home Assistant built-in", required: false, resourcePaths: [], installPaths: [] },
  },
  {
    target: "custom-card",
    label: "Custom HACS card",
    type: "custom:atlas-raw-card",
    dependency: { id: "home-assistant", label: "Home Assistant built-in", required: false, resourcePaths: [], installPaths: [] },
  },
  {
    target: "entity",
    label: "Entity",
    type: "entity",
    dependency: { id: "home-assistant", label: "Home Assistant built-in", required: false, resourcePaths: [], installPaths: [] },
  },
  {
    target: "button",
    label: "Button",
    type: "button",
    dependency: { id: "home-assistant", label: "Home Assistant built-in", required: false, resourcePaths: [], installPaths: [] },
  },
  {
    target: "sensor",
    label: "Sensor",
    type: "sensor",
    dependency: { id: "home-assistant", label: "Home Assistant built-in", required: false, resourcePaths: [], installPaths: [] },
  },
  {
    target: "thermostat",
    label: "Thermostat",
    type: "thermostat",
    dependency: { id: "home-assistant", label: "Home Assistant built-in", required: false, resourcePaths: [], installPaths: [] },
  },
  {
    target: "link",
    label: "Link",
    type: "button",
    dependency: { id: "home-assistant", label: "Home Assistant built-in", required: false, resourcePaths: [], installPaths: [] },
  },
  {
    target: "webpage",
    label: "Webpage",
    type: "iframe",
    dependency: { id: "home-assistant", label: "Home Assistant built-in", required: false, resourcePaths: [], installPaths: [] },
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
];

export function listHomeAssistantCardTargets(): readonly HomeAssistantCardTargetDescriptor[] {
  return cardTargetDescriptors;
}

export function listHomeAssistantBubbleButtonTypes(): readonly HomeAssistantBubbleButtonType[] {
  return ["state", "switch", "slider", "name"];
}

export function findHomeAssistantCardTargetDescriptor(
  target: HomeAssistantCardTarget,
): HomeAssistantCardTargetDescriptor | undefined {
  return cardTargetDescriptors.find(descriptor => descriptor.target === target);
}

export function createHomeAssistantCardConfiguration(
  input: HomeAssistantEntitiesCardInput,
): HomeAssistantCardConfiguration {
  const entityIds = dedupeEntityIds(input.entityIds);
  const target = input.target ?? "entities";
  const layout = input.layout ?? "single";
  const title = input.title?.trim() || "ATLAS panel";

  if (target !== "entities" && layout !== "single" && entityIds.length > 1) {
    return {
      type: layout,
      cards: entityIds.map(entityId => createHomeAssistantSingleCardConfiguration({
        target,
        title: entityId,
        bubbleButtonType: input.bubbleButtonType,
        entityIds: [entityId],
      })),
    };
  }

  return createHomeAssistantSingleCardConfiguration({
    target,
    title,
    bubbleButtonType: input.bubbleButtonType,
    entityIds,
  });
}

function createHomeAssistantSingleCardConfiguration(
  input: Required<Pick<HomeAssistantEntitiesCardInput, "target" | "title" | "entityIds">>
    & Pick<HomeAssistantEntitiesCardInput, "bubbleButtonType">,
): HomeAssistantSingleCardConfiguration {
  const entityIds = dedupeEntityIds(input.entityIds);
  const title = input.title;
  const primaryEntity = entityIds[0] ?? "";

  if (input.target === "mushroom-template") {
    return {
      type: "custom:mushroom-template-card",
      primary: title,
      secondary: primaryEntity,
      entity: primaryEntity,
    };
  }

  if (input.target === "bubble") {
    return {
      type: "custom:bubble-card",
      card_type: "button",
      button_type: input.bubbleButtonType ?? "state",
      name: title,
      entity: primaryEntity,
      show_state: true,
    };
  }

  if (input.target === "tabbed-card-v2") {
    const tabEntityIds = entityIds.length > 0 ? entityIds : [primaryEntity];
    return {
      type: "custom:tabbed-card-v2",
      options: {
        defaultTabIndex: 0,
      },
      tabs: tabEntityIds.map((entityId, index) => ({
        attributes: {
          label: tabEntityIds.length === 1 ? title : entityId,
          icon: index === 0 ? "mdi:tab" : "mdi:tab-plus",
        },
        card: createHomeAssistantSingleCardConfiguration({
          target: "entity",
          title: tabEntityIds.length === 1 ? title : entityId,
          entityIds: [entityId],
        }),
      })),
    };
  }

  if (input.target === "glance") {
    return {
      type: "glance",
      title,
      show_name: true,
      show_icon: true,
      show_state: true,
      entities: entityIds.map(entity => ({ entity })),
    };
  }

  if (input.target === "custom-card") {
    return {
      type: "custom:atlas-raw-card",
      name: title,
      ...(primaryEntity ? { entity: primaryEntity } : {}),
    };
  }

  if (input.target === "entity") {
    return {
      type: "entity",
      name: title,
      entity: primaryEntity,
    };
  }

  if (input.target === "button") {
    return {
      type: "button",
      name: title,
      entity: primaryEntity,
      tap_action: { action: "toggle" },
    };
  }

  if (input.target === "sensor") {
    return {
      type: "sensor",
      name: title,
      entity: primaryEntity,
    };
  }

  if (input.target === "thermostat") {
    return {
      type: "thermostat",
      name: title,
      entity: primaryEntity,
    };
  }

  if (input.target === "link") {
    const navigationPath = primaryEntity.startsWith("/") ? primaryEntity : "/lovelace";
    return {
      type: "button",
      name: title,
      icon: "mdi:link",
      tap_action: {
        action: "navigate",
        navigation_path: navigationPath,
      },
    };
  }

  if (input.target === "webpage") {
    const url = /^https?:\/\//i.test(primaryEntity) ? primaryEntity : "https://www.home-assistant.io";
    return {
      type: "iframe",
      title,
      url,
      aspect_ratio: "50%",
    };
  }

  return createHomeAssistantEntitiesCardConfiguration({ title, entityIds });
}

export function createHomeAssistantEntitiesCardConfiguration(
  input: HomeAssistantEntitiesCardInput,
): HomeAssistantEntitiesCardConfiguration {
  return {
    type: "entities",
    title: input.title?.trim() || "ATLAS panel",
    entities: dedupeEntityIds(input.entityIds).map(entity => ({ entity })),
  };
}

export function serializeHomeAssistantEntitiesCardConfiguration(
  card: HomeAssistantCardConfiguration,
  format: HomeAssistantCardExportFormat,
): string {
  if (format === "json") {
    return JSON.stringify(card, null, 2);
  }

  if (card.type === "entities") {
    return serializeHomeAssistantEntitiesCardYaml(card);
  }

  if (card.type === "glance") {
    return serializeHomeAssistantGlanceCardYaml(card);
  }

  if (isHomeAssistantRawCustomCardConfiguration(card)) {
    return serializeHomeAssistantYamlObject({ ...card }).join("\n");
  }

  if (isHomeAssistantStackCardConfiguration(card)) {
    return serializeHomeAssistantStackCardYaml(card);
  }

  if (isHomeAssistantGridCardConfiguration(card)) {
    return serializeHomeAssistantGridCardYaml(card);
  }

  if (isHomeAssistantConditionalCardConfiguration(card)) {
    return serializeHomeAssistantConditionalCardYaml(card);
  }

  if (isHomeAssistantCustomCardConfiguration(card)) {
    return serializeHomeAssistantCustomCardYaml(card);
  }

  if (isHomeAssistantCoreSingleCardConfiguration(card)) {
    return serializeHomeAssistantCoreCardYaml(card);
  }

  throw new Error("Unsupported Home Assistant card.");
}

export function createHomeAssistantCardExportManifest(
  input: HomeAssistantCardExportManifestInput,
): HomeAssistantCardExportManifest {
  const name = input.name?.trim() || "ATLAS Home Assistant card";
  const target = getHomeAssistantCardTarget(input.card);
  const layout = isHomeAssistantStackCardConfiguration(input.card) ? input.card.type : "single";
  const slug = slugifyHomeAssistantExportName(`${name}-${target}-${layout}`);
  const languages = normalizeHomeAssistantCardExportLanguages(input.languages);

  return {
    name,
    filename: `${slug}.${input.format === "yaml" ? "yaml" : "json"}`,
    format: input.format,
    mimeType: input.format === "yaml" ? "text/yaml" : "application/json",
    target,
    layout,
    dependency: inspectHomeAssistantCardDependency(input.card),
    languages,
    fallbackLanguages: languages.filter(language => language !== "en"),
  };
}

export function createHomeAssistantCardExportPayload(
  input: HomeAssistantCardExportPayloadInput,
): HomeAssistantCardExportPayload {
  return {
    manifest: createHomeAssistantCardExportManifest(input),
    content: serializeHomeAssistantEntitiesCardConfiguration(input.card, input.format),
  };
}

export function createHomeAssistantCardExportPackage(
  input: HomeAssistantCardExportPackageInput,
): HomeAssistantCardExportPackage {
  const payload = createHomeAssistantCardExportPayload(input);
  return {
    version: 1,
    kind: "atlas.homeassistant.card",
    ...payload,
    locales: createHomeAssistantCardLocaleFiles({
      title: payload.manifest.name,
      languages: payload.manifest.languages,
    }),
    ...(input.editorPlan ? { editorPlan: input.editorPlan } : {}),
    ...(input.script ? { script: input.script } : {}),
  };
}

export function normalizeHomeAssistantCardExportLanguages(
  languages: readonly string[] = ["en"],
): readonly string[] {
  const normalized = languages
    .map(language => language.trim().toLowerCase())
    .filter(language => /^[a-z]{2}$/.test(language));
  return [...new Set(["en", ...normalized])].sort((left, right) => {
    if (left === "en") return -1;
    if (right === "en") return 1;
    return left.localeCompare(right);
  });
}

export function createHomeAssistantCardLocaleFiles(input: {
  readonly title: string;
  readonly languages: readonly string[];
}): readonly HomeAssistantCardLocaleFile[] {
  return normalizeHomeAssistantCardExportLanguages(input.languages).map(language => {
    const status: HomeAssistantCardLocaleStatus = language === "en" ? "manual" : "fallback";
    return {
      language,
      path: `locales/${language}.json`,
      status,
      content: {
        _meta: {
          language,
          status,
          sourceLanguage: "en",
          ...(status === "fallback"
            ? {
                note: "This language file contains English fallback text. Please translate and review it before publishing.",
              }
            : {}),
        },
        card: {
          title: input.title,
          unavailable: "Unavailable",
          replaceDemoEntities: "Replace the demo entities with your own Home Assistant entities before publishing.",
        },
      },
    };
  });
}

export function parseHomeAssistantEntitiesCardConfiguration(
  text: string,
): HomeAssistantEntitiesCardParseResult {
  try {
    return {
      ...normalizeHomeAssistantCardConfiguration(JSON.parse(text)),
      format: "json",
    };
  } catch {
    return {
      ...normalizeHomeAssistantCardConfiguration(parseHomeAssistantCardYaml(text)),
      format: "yaml",
    };
  }
}

export function summarizeHomeAssistantCardImport(text: string): HomeAssistantCardImportSummary {
  const packageCandidate = parseHomeAssistantCardExportPackage(text);
  const parsed = packageCandidate
    ? parseHomeAssistantEntitiesCardConfiguration(packageCandidate.content)
    : parseHomeAssistantEntitiesCardConfiguration(text);
  return {
    ...parsed,
    title: getHomeAssistantCardTitle(parsed.card),
    entityIds: getHomeAssistantCardEntityIds(parsed.card),
    dependency: inspectHomeAssistantCardDependency(parsed.card),
    packaged: packageCandidate !== undefined,
    ...(packageCandidate?.editorPlan ? { editorPlan: packageCandidate.editorPlan } : {}),
    ...(packageCandidate?.script ? { script: packageCandidate.script } : {}),
  };
}

export function inspectHomeAssistantCardStyleBlocks(text: string): HomeAssistantCardStyleInspection {
  const blocks = inspectHomeAssistantCardStyleBlocksFromText(text);
  return {
    hasStyles: blocks.length > 0,
    globalStyles: blocks.filter(block => block.scope === "global"),
    cardStyles: blocks.filter(block => block.scope === "card"),
    layoutOptions: blocks.filter(block => block.scope === "layout"),
  };
}

export function convertHomeAssistantCardModStylesToUixStyle(text: string): string {
  return text.replace(/^(\s*)card_mod:(.*)$/gm, (_match, indent: string, suffix: string) =>
    `${indent}uix:${suffix}`,
  );
}

export function inspectHomeAssistantCardDependency(
  cardOrTarget: HomeAssistantCardConfiguration | HomeAssistantCardTarget,
): HomeAssistantCardDependency {
  const target = typeof cardOrTarget === "string" ? cardOrTarget : getHomeAssistantCardTarget(cardOrTarget);
  return findHomeAssistantCardTargetDescriptor(target)?.dependency
    ?? { id: "home-assistant", label: "Home Assistant built-in", required: false, resourcePaths: [], installPaths: [] };
}

export function inspectHomeAssistantCardDependencyAvailability(
  cardOrTarget: HomeAssistantCardConfiguration | HomeAssistantCardTarget,
  resources: readonly (HomeAssistantLovelaceResource | string)[],
): HomeAssistantCardDependencyAvailability {
  const dependency = inspectHomeAssistantCardDependency(cardOrTarget);
  if (!dependency.required) {
    return {
      dependency,
      status: "not-required",
      matchedResourcePaths: [],
      missingResourcePaths: [],
    };
  }

  const resourcePaths = resources
    .map(resource => typeof resource === "string" ? resource : resource.url)
    .map(normalizeHomeAssistantResourcePath)
    .filter((resource): resource is string => resource !== undefined);
  const matchedResourcePaths = dependency.resourcePaths.filter(path => resourcePaths.includes(path));
  const missingResourcePaths = dependency.resourcePaths.filter(path => !matchedResourcePaths.includes(path));

  return {
    dependency,
    status: missingResourcePaths.length === 0 ? "installed" : "missing",
    matchedResourcePaths,
    missingResourcePaths,
  };
}

export function createHomeAssistantLovelaceResourceReferences(
  cardOrTarget: HomeAssistantCardConfiguration | HomeAssistantCardTarget,
): readonly HomeAssistantLovelaceResourceReference[] {
  return inspectHomeAssistantCardDependency(cardOrTarget).resourcePaths.map(url => ({
    url,
    type: "module",
  }));
}

export function serializeHomeAssistantLovelaceResourceReferences(
  cardOrTarget: HomeAssistantCardConfiguration | HomeAssistantCardTarget,
  format: HomeAssistantCardExportFormat,
): string {
  const resources = createHomeAssistantLovelaceResourceReferences(cardOrTarget);
  if (format === "json") {
    return JSON.stringify(resources, null, 2);
  }

  if (resources.length === 0) {
    return "[]";
  }

  return resources.map(resource => [
    `- url: ${serializeYamlScalar(resource.url)}`,
    `  type: ${serializeYamlScalar(resource.type)}`,
  ].join("\n")).join("\n");
}

export function getHomeAssistantCardTarget(card: HomeAssistantCardConfiguration): HomeAssistantCardTarget {
  if (isHomeAssistantStackCardConfiguration(card)) {
    return card.cards[0] ? getHomeAssistantCardTarget(card.cards[0]) : "entities";
  }
  if (isHomeAssistantGridCardConfiguration(card)) {
    return card.cards[0] ? getHomeAssistantCardTarget(card.cards[0]) : "entities";
  }
  if (isHomeAssistantConditionalCardConfiguration(card)) {
    return getHomeAssistantCardTarget(card.card);
  }
  if (card.type === "custom:mushroom-template-card") return "mushroom-template";
  if (card.type === "custom:bubble-card") return "bubble";
  if (card.type === "custom:tabbed-card-v2") return "tabbed-card-v2";
  if (isHomeAssistantRawCustomCardConfiguration(card)) return "custom-card";
  if (card.type === "glance") return "glance";
  if (card.type === "entity") return "entity";
  if (card.type === "sensor") return "sensor";
  if (card.type === "thermostat") return "thermostat";
  if (card.type === "iframe") return "webpage";
  if (card.type === "button" && card.tap_action?.action === "navigate") return "link";
  if (card.type === "button") return "button";
  return "entities";
}

export function getHomeAssistantCardEntityIds(card: HomeAssistantCardConfiguration): readonly string[] {
  if (isHomeAssistantStackCardConfiguration(card)) {
    return dedupeEntityIds(card.cards.flatMap(getHomeAssistantCardEntityIds));
  }
  if (isHomeAssistantGridCardConfiguration(card)) {
    return dedupeEntityIds(card.cards.flatMap(getHomeAssistantCardEntityIds));
  }
  if (isHomeAssistantConditionalCardConfiguration(card)) {
    return dedupeEntityIds([
      ...card.conditions.map(condition => condition.entity ?? ""),
      ...getHomeAssistantCardEntityIds(card.card),
    ]);
  }
  if (isHomeAssistantTabbedCardV2Configuration(card)) {
    return dedupeEntityIds(card.tabs.flatMap(tab => getHomeAssistantCardEntityIds(tab.card)));
  }

  if (card.type === "entities" || card.type === "glance") {
    return dedupeEntityIds(card.entities.map(entity => entity.entity));
  }

  if (isHomeAssistantRawCustomCardConfiguration(card)) {
    return collectHomeAssistantEntityIdsFromUnknown(card);
  }

  return "entity" in card && card.entity ? [card.entity] : [];
}

export function getHomeAssistantCardTitle(card: HomeAssistantCardConfiguration): string {
  if (isHomeAssistantStackCardConfiguration(card)) {
    return card.cards[0] ? getHomeAssistantCardTitle(card.cards[0]) : "Imported HA card";
  }
  if (isHomeAssistantGridCardConfiguration(card)) {
    return card.cards[0] ? getHomeAssistantCardTitle(card.cards[0]) : "Imported grid card";
  }
  if (isHomeAssistantConditionalCardConfiguration(card)) {
    return getHomeAssistantCardTitle(card.card);
  }

  if (card.type === "entities") {
    return card.title;
  }

  if (card.type === "glance") {
    return card.title ?? "Imported glance card";
  }

  if (card.type === "custom:bubble-card") {
    return (card as HomeAssistantBubbleCardConfiguration).name;
  }

  if (card.type === "custom:mushroom-template-card") {
    return (card as HomeAssistantMushroomTemplateCardConfiguration).primary;
  }

  if (card.type === "custom:tabbed-card-v2") {
    return (card as HomeAssistantTabbedCardV2Configuration).tabs[0]?.attributes.label ?? "Tabbed Card V2";
  }

  if (isHomeAssistantRawCustomCardConfiguration(card)) {
    return typeof card.title === "string" && card.title.trim()
      ? card.title.trim()
      : typeof card.name === "string" && card.name.trim()
        ? card.name.trim()
        : card.type.replace(/^custom:/, "");
  }

  if (card.type === "iframe") {
    return card.title;
  }

  return "name" in card && typeof card.name === "string" ? card.name : "Imported HA card";
}

function normalizeHomeAssistantCardConfiguration(
  card: unknown,
): { readonly card: HomeAssistantCardConfiguration; readonly target: HomeAssistantCardTarget; readonly layout: HomeAssistantCardLayout } {
  if (!isRecord(card)) {
    throw new Error("Unsupported Home Assistant card.");
  }

  if ((card.type === "horizontal-stack" || card.type === "vertical-stack") && Array.isArray(card.cards)) {
    const normalizedCards = card.cards.map(candidate => normalizeHomeAssistantCardConfiguration(candidate).card);
    if (normalizedCards.length === 0) {
      throw new Error("Home Assistant stack card has no supported cards.");
    }
    const normalizedCard = {
      type: card.type,
      ...(card.columns === "full" || typeof card.columns === "number" ? { columns: card.columns } : {}),
      ...(card.rows === "auto" ? { rows: "auto" as const } : {}),
      cards: normalizedCards,
    } satisfies HomeAssistantStackCardConfiguration;
    return {
      card: normalizedCard,
      target: getHomeAssistantCardTarget(normalizedCard),
      layout: card.type,
    };
  }

  if (card.type === "grid" && Array.isArray(card.cards)) {
    const normalizedCards = card.cards.map(candidate => normalizeHomeAssistantCardConfiguration(candidate).card);
    if (normalizedCards.length === 0) {
      throw new Error("Home Assistant grid card has no supported cards.");
    }
    const normalizedCard = {
      type: "grid",
      columns: typeof card.columns === "number" ? card.columns : undefined,
      square: typeof card.square === "boolean" ? card.square : undefined,
      cards: normalizedCards,
    } satisfies HomeAssistantGridCardConfiguration;
    return {
      card: normalizedCard,
      target: getHomeAssistantCardTarget(normalizedCard),
      layout: "single",
    };
  }

  if (card.type === "conditional" && Array.isArray(card.conditions) && isRecord(card.card)) {
    const normalizedChild = normalizeHomeAssistantCardConfiguration(card.card).card;
    const normalizedCard = {
      type: "conditional",
      conditions: card.conditions
        .filter(isRecord)
        .map(condition => ({
          condition: typeof condition.condition === "string" ? condition.condition : "state",
          entity: typeof condition.entity === "string" ? condition.entity.trim() : undefined,
          state: typeof condition.state === "string" ? condition.state : undefined,
        })),
      card: normalizedChild,
    } satisfies HomeAssistantConditionalCardConfiguration;
    return {
      card: normalizedCard,
      target: getHomeAssistantCardTarget(normalizedCard),
      layout: "single",
    };
  }

  if (card.type === "custom:mushroom-template-card") {
    const entity = typeof card.entity === "string" ? card.entity.trim() : "";
    if (!entity) throw new Error("Mushroom card has no entity.");
    return {
      card: {
        type: "custom:mushroom-template-card",
        primary: typeof card.primary === "string" && card.primary.trim() ? card.primary.trim() : "Imported Mushroom card",
        secondary: typeof card.secondary === "string" ? card.secondary : entity,
        entity,
      },
      target: "mushroom-template",
      layout: "single",
    };
  }

  if (card.type === "custom:bubble-card") {
    const entity = typeof card.entity === "string" ? card.entity.trim() : "";
    const cardType = card.card_type === "separator" || card.card_type === "empty-column" ? card.card_type : "button";
    const buttonType = card.button_type === "name"
      || card.button_type === "slider"
      || card.button_type === "state"
      || card.button_type === "switch"
      ? card.button_type
      : undefined;
    return {
      card: {
        type: "custom:bubble-card",
        card_type: cardType,
        ...(cardType !== "separator" ? { button_type: buttonType ?? "state" } : {}),
        name: typeof card.name === "string" && card.name.trim() ? card.name.trim() : "Imported Bubble card",
        ...(entity ? { entity } : {}),
        ...(card.show_state === true || entity ? { show_state: true as const } : {}),
      },
      target: "bubble",
      layout: "single",
    };
  }

  if (card.type === "custom:tabbed-card-v2" && Array.isArray(card.tabs)) {
    const tabs = card.tabs
      .filter(isRecord)
      .map((tab, index) => {
        const attributes = isRecord(tab.attributes) ? tab.attributes : {};
        const child = isRecord(tab.card)
          ? normalizeHomeAssistantCardConfiguration(tab.card).card
          : createHomeAssistantCardConfiguration({
              target: "entity",
              title: `Tab ${index + 1}`,
              entityIds: [""],
            });
        return {
          attributes: {
            label: typeof attributes.label === "string" && attributes.label.trim() ? attributes.label.trim() : `Tab ${index + 1}`,
            ...(typeof attributes.icon === "string" && attributes.icon.trim() ? { icon: attributes.icon.trim() } : {}),
          },
          card: child,
        };
      });
    if (tabs.length === 0) {
      throw new Error("Tabbed Card V2 has no supported tabs.");
    }
    return {
      card: {
        type: "custom:tabbed-card-v2",
        options: {
          defaultTabIndex: isRecord(card.options) && typeof card.options.defaultTabIndex === "number"
            ? Math.max(0, Math.floor(card.options.defaultTabIndex))
            : 0,
        },
        ...(card.columns === "full" || (isRecord(card.options) && card.options.fullWidth === true) ? { columns: "full" as const } : {}),
        ...(card.rows === "auto" || (isRecord(card.options) && card.options.autoHeight === true) ? { rows: "auto" as const } : {}),
        tabs,
      },
      target: "tabbed-card-v2",
      layout: "single",
    };
  }

  if (typeof card.type === "string" && /^custom:[A-Za-z0-9_-]+$/.test(card.type)) {
    return {
      card: { ...card, type: card.type as `custom:${string}` },
      target: "custom-card",
      layout: "single",
    };
  }

  if (card.type === "entity" || card.type === "sensor" || card.type === "thermostat") {
    const entity = typeof card.entity === "string" ? card.entity.trim() : "";
    if (!entity) throw new Error("Home Assistant core card has no entity.");
    const normalizedCard = {
      type: card.type,
      name: typeof card.name === "string" && card.name.trim() ? card.name.trim() : `Imported ${card.type} card`,
      entity,
    } satisfies HomeAssistantEntityCardConfiguration | HomeAssistantSensorCardConfiguration | HomeAssistantThermostatCardConfiguration;
    return {
      card: normalizedCard,
      target: getHomeAssistantCardTarget(normalizedCard),
      layout: "single",
    };
  }

  if (card.type === "button") {
    const entity = typeof card.entity === "string" ? card.entity.trim() : "";
    const tapAction = isRecord(card.tap_action) && card.tap_action.action === "navigate"
      ? {
        action: "navigate" as const,
        navigation_path: typeof card.tap_action.navigation_path === "string" ? card.tap_action.navigation_path : "/lovelace",
      }
      : undefined;
    const normalizedCard = {
      type: "button",
      name: typeof card.name === "string" && card.name.trim() ? card.name.trim() : "Imported button card",
      ...(entity ? { entity } : {}),
      ...(typeof card.icon === "string" ? { icon: card.icon } : {}),
      ...(tapAction ? { tap_action: tapAction } : {}),
    } satisfies HomeAssistantButtonCardConfiguration;
    return {
      card: normalizedCard,
      target: getHomeAssistantCardTarget(normalizedCard),
      layout: "single",
    };
  }

  if (card.type === "iframe") {
    const url = typeof card.url === "string" && card.url.trim() ? card.url.trim() : "https://www.home-assistant.io";
    const normalizedCard = {
      type: "iframe",
      title: typeof card.title === "string" && card.title.trim() ? card.title.trim() : "Imported webpage card",
      url,
      aspect_ratio: typeof card.aspect_ratio === "string" && card.aspect_ratio.trim() ? card.aspect_ratio.trim() : "50%",
    } satisfies HomeAssistantWebpageCardConfiguration;
    return {
      card: normalizedCard,
      target: "webpage",
      layout: "single",
    };
  }

  if ((card.type === "entities" || card.type === "glance") && Array.isArray(card.entities)) {
    const entities = readHomeAssistantEntityItems(card.entities);
    if (entities.length === 0) {
      throw new Error("Home Assistant card has no entities.");
    }

    if (card.type === "glance") {
      return {
        card: {
          type: "glance",
          ...(typeof card.title === "string" && card.title.trim() ? { title: card.title.trim() } : {}),
          ...(typeof card.show_name === "boolean" ? { show_name: card.show_name } : {}),
          ...(typeof card.show_icon === "boolean" ? { show_icon: card.show_icon } : {}),
          ...(typeof card.show_state === "boolean" ? { show_state: card.show_state } : {}),
          ...(typeof card.columns === "number" ? { columns: card.columns } : {}),
          ...(typeof card.state_color === "boolean" ? { state_color: card.state_color } : {}),
          entities,
        },
        target: "glance",
        layout: "single",
      };
    }

    return {
      card: {
        type: "entities",
        title: typeof card.title === "string" ? card.title : "Imported HA card",
        entities,
      },
      target: "entities",
      layout: "single",
    };
  }

  throw new Error("Unsupported Home Assistant card.");
}

function serializeHomeAssistantEntitiesCardYaml(card: HomeAssistantEntitiesCardConfiguration): string {
  const lines = [
    "type: entities",
    `title: ${JSON.stringify(card.title)}`,
    "entities:",
  ];
  for (const item of card.entities) {
    lines.push(`  - entity: ${JSON.stringify(item.entity)}`);
    if (item.name) lines.push(`    name: ${JSON.stringify(item.name)}`);
    if (item.icon) lines.push(`    icon: ${JSON.stringify(item.icon)}`);
    if (item.show_last_changed !== undefined) lines.push(`    show_last_changed: ${serializeYamlScalar(item.show_last_changed)}`);
  }
  return lines.join("\n");
}

function serializeHomeAssistantGlanceCardYaml(card: HomeAssistantGlanceCardConfiguration): string {
  const lines = [
    "type: glance",
  ];
  if (card.title) lines.push(`title: ${JSON.stringify(card.title)}`);
  if (card.show_name !== undefined) lines.push(`show_name: ${serializeYamlScalar(card.show_name)}`);
  if (card.show_icon !== undefined) lines.push(`show_icon: ${serializeYamlScalar(card.show_icon)}`);
  if (card.show_state !== undefined) lines.push(`show_state: ${serializeYamlScalar(card.show_state)}`);
  if (card.columns !== undefined) lines.push(`columns: ${serializeYamlScalar(card.columns)}`);
  if (card.state_color !== undefined) lines.push(`state_color: ${serializeYamlScalar(card.state_color)}`);
  lines.push("entities:");
  for (const item of card.entities) {
    lines.push(`  - entity: ${JSON.stringify(item.entity)}`);
    if (item.name) lines.push(`    name: ${JSON.stringify(item.name)}`);
    if (item.icon) lines.push(`    icon: ${JSON.stringify(item.icon)}`);
    if (item.show_last_changed !== undefined) lines.push(`    show_last_changed: ${serializeYamlScalar(item.show_last_changed)}`);
  }
  return lines.join("\n");
}

function serializeHomeAssistantCustomCardYaml(
  card: HomeAssistantCustomCardConfiguration,
): string {
  if (isHomeAssistantTabbedCardV2Configuration(card)) {
    return serializeHomeAssistantTabbedCardV2Yaml(card);
  }

  return Object.entries(card)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${serializeYamlScalar(value)}`)
    .join("\n");
}

function serializeHomeAssistantTabbedCardV2Yaml(card: HomeAssistantTabbedCardV2Configuration): string {
  const lines = [
    "type: \"custom:tabbed-card-v2\"",
    "options:",
    `  defaultTabIndex: ${serializeYamlScalar(card.options.defaultTabIndex)}`,
  ];
  if (card.columns === "full") lines.push("columns: full");
  if (card.rows === "auto") lines.push("rows: auto");
  lines.push("tabs:");
  for (const tab of card.tabs) {
    lines.push("  - attributes:");
    lines.push(`      label: ${serializeYamlScalar(tab.attributes.label)}`);
    if (tab.attributes.icon) lines.push(`      icon: ${serializeYamlScalar(tab.attributes.icon)}`);
    lines.push("    card:");
    const childLines = serializeHomeAssistantEntitiesCardConfiguration(tab.card, "yaml").split("\n");
    childLines.forEach(line => {
      lines.push(`      ${line}`);
    });
  }
  return lines.join("\n");
}

function serializeHomeAssistantCoreCardYaml(
  card: Exclude<HomeAssistantSingleCardConfiguration, HomeAssistantEntitiesCardConfiguration | HomeAssistantCustomCardConfiguration | HomeAssistantGridCardConfiguration | HomeAssistantConditionalCardConfiguration>,
): string {
  return serializeHomeAssistantYamlObject({ ...card }).join("\n");
}

function serializeHomeAssistantYamlObject(value: Record<string, unknown>, indent = 0): string[] {
  const padding = " ".repeat(indent);
  const lines: string[] = [];
  for (const [key, item] of Object.entries(value)) {
    if (item === undefined) continue;
    if (Array.isArray(item)) {
      lines.push(`${padding}${key}:`);
      for (const entry of item) {
        if (isRecord(entry)) {
          const [firstLine, ...restLines] = serializeHomeAssistantYamlObject(entry, indent + 2);
          if (firstLine) lines.push(`${padding}  - ${firstLine.trimStart()}`);
          restLines.forEach(line => lines.push(line));
        } else {
          lines.push(`${padding}  - ${serializeYamlScalar(entry)}`);
        }
      }
      continue;
    }
    if (isRecord(item)) {
      lines.push(`${padding}${key}:`);
      lines.push(...serializeHomeAssistantYamlObject(item, indent + 2));
      continue;
    }
    lines.push(`${padding}${key}: ${serializeYamlScalar(item)}`);
  }
  return lines;
}

function serializeHomeAssistantStackCardYaml(card: HomeAssistantStackCardConfiguration): string {
  const lines = [
    `type: ${card.type}`,
  ];
  if (card.columns !== undefined) lines.push(`columns: ${serializeYamlScalar(card.columns)}`);
  if (card.rows === "auto") lines.push("rows: auto");
  lines.push("cards:");
  for (const child of card.cards) {
    const childLines = serializeHomeAssistantEntitiesCardConfiguration(child, "yaml").split("\n");
    childLines.forEach((line, index) => {
      lines.push(index === 0 ? `  - ${line}` : `    ${line}`);
    });
  }
  return lines.join("\n");
}

function serializeHomeAssistantGridCardYaml(card: HomeAssistantGridCardConfiguration): string {
  const lines = [
    "type: grid",
  ];
  if (card.columns !== undefined) lines.push(`columns: ${serializeYamlScalar(card.columns)}`);
  if (card.square !== undefined) lines.push(`square: ${serializeYamlScalar(card.square)}`);
  lines.push("cards:");
  for (const child of card.cards) {
    const childLines = serializeHomeAssistantEntitiesCardConfiguration(child, "yaml").split("\n");
    childLines.forEach((line, index) => {
      lines.push(index === 0 ? `  - ${line}` : `    ${line}`);
    });
  }
  return lines.join("\n");
}

function serializeHomeAssistantConditionalCardYaml(card: HomeAssistantConditionalCardConfiguration): string {
  const lines = [
    "type: conditional",
    "conditions:",
  ];
  for (const condition of card.conditions) {
    lines.push(`  - condition: ${serializeYamlScalar(condition.condition)}`);
    if (condition.entity) lines.push(`    entity: ${serializeYamlScalar(condition.entity)}`);
    if (condition.state) lines.push(`    state: ${serializeYamlScalar(condition.state)}`);
  }
  lines.push("card:");
  const childLines = serializeHomeAssistantEntitiesCardConfiguration(card.card, "yaml").split("\n");
  childLines.forEach(line => {
    lines.push(`  ${line}`);
  });
  return lines.join("\n");
}

function slugifyHomeAssistantExportName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "atlas-home-assistant-card";
}

function parseHomeAssistantCardExportPackage(text: string): HomeAssistantCardExportPackage | undefined {
  try {
    const parsed: unknown = JSON.parse(text);
    if (!isRecord(parsed) || parsed.version !== 1 || parsed.kind !== "atlas.homeassistant.card") {
      return undefined;
    }

    if (!isRecord(parsed.manifest) || typeof parsed.content !== "string") {
      return undefined;
    }

    return {
      version: 1,
      kind: "atlas.homeassistant.card",
      manifest: parsed.manifest as unknown as HomeAssistantCardExportManifest,
      content: parsed.content,
      locales: Array.isArray(parsed.locales)
        ? parsed.locales as unknown as readonly HomeAssistantCardLocaleFile[]
        : createHomeAssistantCardLocaleFiles({
            title: typeof parsed.manifest.name === "string" ? parsed.manifest.name : "ATLAS Home Assistant card",
            languages: Array.isArray(parsed.manifest.languages) ? parsed.manifest.languages.filter(language => typeof language === "string") : ["en"],
          }),
      ...(isRecord(parsed.editorPlan) ? { editorPlan: parsed.editorPlan as unknown as HomeAssistantCardEditorPackagePlan } : {}),
      ...(isRecord(parsed.script) ? { script: parsed.script as unknown as HomeAssistantCardEditorScriptExport } : {}),
    };
  } catch {
    return undefined;
  }
}

function normalizeHomeAssistantResourcePath(resourcePath: string): string | undefined {
  const trimmed = resourcePath.trim();
  if (!trimmed) return undefined;

  try {
    return new URL(trimmed, "http://homeassistant.local").pathname;
  } catch {
    const [withoutHash] = trimmed.split("#", 1);
    const [withoutQuery] = withoutHash.split("?", 1);
    return withoutQuery || undefined;
  }
}

interface ParsedYamlLine {
  readonly indent: number;
  readonly text: string;
}

function parseHomeAssistantCardYaml(text: string): unknown {
  const lines = text
    .split(/\r?\n/)
    .map(line => ({
      indent: line.match(/^ */)?.[0].length ?? 0,
      text: line.trim(),
    }))
    .filter(line => line.text && !line.text.startsWith("#"));
  const cursor = { index: 0 };
  return parseYamlMap(lines, cursor, lines[0]?.indent ?? 0);
}

function parseYamlMap(
  lines: readonly ParsedYamlLine[],
  cursor: { index: number },
  indent: number,
): Record<string, unknown> {
  const value: Record<string, unknown> = {};

  while (cursor.index < lines.length) {
    const line = lines[cursor.index]!;
    if (line.indent < indent || line.text.startsWith("- ")) break;
    if (line.indent > indent) {
      cursor.index += 1;
      continue;
    }

    const parsed = parseYamlKeyValue(line.text);
    if (!parsed) {
      cursor.index += 1;
      continue;
    }

    cursor.index += 1;
    if (parsed.value === "") {
      const next = lines[cursor.index];
      if (next && next.indent > line.indent) {
        value[parsed.key] = next.text.startsWith("- ")
          ? parseYamlList(lines, cursor, next.indent)
          : parseYamlMap(lines, cursor, next.indent);
      } else {
        value[parsed.key] = "";
      }
      continue;
    }

    if (isYamlBlockScalar(parsed.value)) {
      value[parsed.key] = parseYamlBlockScalar(lines, cursor, line.indent, parsed.value);
      continue;
    }

    value[parsed.key] = parseYamlScalar(parsed.value);
  }

  return value;
}

function parseYamlList(
  lines: readonly ParsedYamlLine[],
  cursor: { index: number },
  indent: number,
): unknown[] {
  const values: unknown[] = [];

  while (cursor.index < lines.length) {
    const line = lines[cursor.index]!;
    if (line.indent < indent || !line.text.startsWith("- ")) break;
    if (line.indent > indent) {
      cursor.index += 1;
      continue;
    }

    const itemText = line.text.slice(2).trim();
    cursor.index += 1;
    if (!itemText) {
      const next = lines[cursor.index];
      values.push(next && next.text.startsWith("- ")
        ? parseYamlList(lines, cursor, next.indent)
        : parseYamlMap(lines, cursor, next?.indent ?? indent + 2));
      continue;
    }

    const parsed = parseYamlKeyValue(itemText);
    if (!parsed) {
      values.push(parseYamlScalar(itemText));
      continue;
    }

    const item: Record<string, unknown> = {};
    if (parsed.value === "" || isYamlBlockScalar(parsed.value)) {
      item[parsed.key] = isYamlBlockScalar(parsed.value)
        ? parseYamlBlockScalar(lines, cursor, line.indent, parsed.value)
        : parseYamlNestedValue(lines, cursor, line.indent);
    } else {
      item[parsed.key] = parseYamlScalar(parsed.value);
    }
    const next = lines[cursor.index];
    if (next && next.indent > line.indent) {
      Object.assign(item, parseYamlMap(lines, cursor, next.indent));
    }
    values.push(item);
  }

  return values;
}

function parseYamlNestedValue(
  lines: readonly ParsedYamlLine[],
  cursor: { index: number },
  parentIndent: number,
): unknown {
  const next = lines[cursor.index];
  if (!next || next.indent <= parentIndent) return {};
  return next.text.startsWith("- ")
    ? parseYamlList(lines, cursor, next.indent)
    : parseYamlMap(lines, cursor, next.indent);
}

function parseYamlKeyValue(text: string): { readonly key: string; readonly value: string } | undefined {
  if (!text.includes(":")) return undefined;
  const separator = text.indexOf(":");
  return {
    key: text.slice(0, separator).trim(),
    value: text.slice(separator + 1).trim(),
  };
}

function isYamlBlockScalar(value: string): boolean {
  return value === "|" || value === "|-" || value === "|+" || value === ">" || value === ">-" || value === ">+";
}

function parseYamlBlockScalar(
  lines: readonly ParsedYamlLine[],
  cursor: { index: number },
  parentIndent: number,
  marker: string,
): string {
  const values: string[] = [];
  while (cursor.index < lines.length && lines[cursor.index]!.indent > parentIndent) {
    values.push(lines[cursor.index]!.text);
    cursor.index += 1;
  }
  return marker.startsWith(">")
    ? values.join(" ").trim()
    : values.join("\n");
}

function serializeYamlScalar(value: unknown): string {
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
  if (value === null) return "null";
  return JSON.stringify(String(value));
}

function parseYamlScalar(value: string): unknown {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null" || value === "~") return null;
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  if (value.startsWith("\"") && value.endsWith("\"")) {
    try {
      return JSON.parse(value);
    } catch {
      return value.slice(1, -1);
    }
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'");
  }
  return value;
}

function inspectHomeAssistantCardStyleBlocksFromText(text: string): HomeAssistantCardStyleBlock[] {
  const lines = text.split(/\r?\n/);
  const blocks: HomeAssistantCardStyleBlock[] = [];
  let currentCardLabel = "Card";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const trimmed = line.trim();
    const entityMatch = trimmed.match(/^-\s+entity:\s*(.+)$/);
    if (entityMatch) {
      currentCardLabel = cleanYamlPreviewScalar(entityMatch[1] ?? "Card");
    }

    const keyMatch = trimmed.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (!keyMatch) continue;
    const key = keyMatch[1] ?? "";
    if (!isStyleInspectionKey(key)) continue;

    const indent = line.match(/^ */)?.[0].length ?? 0;
    if ((key === "style" || key === "styles") && isNestedInStyleInspectionContainer(lines, index, indent)) {
      continue;
    }
    const scope = key === "grid_options"
      ? "layout"
      : indent === 0 && !trimmed.startsWith("- ")
        ? "global"
        : "card";
    const label = scope === "global"
      ? "Global card style"
      : scope === "layout"
        ? "Grid/layout options"
        : currentCardLabel;
    blocks.push({
      scope,
      label,
      key,
      code: collectStyleInspectionBlock(lines, index),
    });
  }

  return dedupeStyleInspectionBlocks(blocks);
}

function isNestedInStyleInspectionContainer(lines: readonly string[], index: number, indent: number): boolean {
  for (let parentIndex = index - 1; parentIndex >= 0; parentIndex -= 1) {
    const line = lines[parentIndex] ?? "";
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parentIndent = line.match(/^ */)?.[0].length ?? 0;
    if (parentIndent >= indent) continue;
    return /^(card_mod|uix|uix_style):/.test(trimmed);
  }
  return false;
}

function isStyleInspectionKey(key: string): boolean {
  return key === "card_mod"
    || key === "style"
    || key === "styles"
    || key === "uix"
    || key === "uix_style"
    || key === "grid_options";
}

function collectStyleInspectionBlock(lines: readonly string[], startIndex: number): string {
  const start = lines[startIndex] ?? "";
  const startIndent = start.match(/^ */)?.[0].length ?? 0;
  const values = [start.trimEnd()];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const trimmed = line.trim();
    if (!trimmed) {
      values.push(line);
      continue;
    }
    const indent = line.match(/^ */)?.[0].length ?? 0;
    if (trimmed.startsWith("- ") && indent <= startIndent) break;
    if (indent <= startIndent && /^[A-Za-z0-9_-]+:/.test(trimmed)) break;
    values.push(line.trimEnd());
  }
  return values.join("\n").trim();
}

function cleanYamlPreviewScalar(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "");
}

function collectHomeAssistantEntityIdsFromUnknown(value: unknown, key = ""): string[] {
  if (typeof value === "string") {
    return /^entity\d*$/i.test(key) && looksLikeHomeAssistantEntityId(value) ? [value.trim()] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(item => collectHomeAssistantEntityIdsFromUnknown(item));
  }

  if (!isRecord(value)) {
    return [];
  }

  return dedupeEntityIds(Object.entries(value).flatMap(([entryKey, entryValue]) =>
    collectHomeAssistantEntityIdsFromUnknown(entryValue, entryKey),
  ));
}

function readHomeAssistantEntityItems(values: readonly unknown[]): HomeAssistantEntitiesCardEntity[] {
  const seen = new Set<string>();
  const entities: HomeAssistantEntitiesCardEntity[] = [];
  for (const value of values) {
    const entity = typeof value === "string"
      ? value.trim()
      : isRecord(value) && typeof value.entity === "string"
        ? value.entity.trim()
        : "";
    if (!entity || seen.has(entity)) continue;
    seen.add(entity);
    const name = isRecord(value) && typeof value.name === "string" && value.name.trim()
      ? value.name.trim()
      : undefined;
    const icon = isRecord(value) && typeof value.icon === "string" && value.icon.trim()
      ? value.icon.trim()
      : undefined;
    const showLastChanged = isRecord(value) && typeof value.show_last_changed === "boolean"
      ? value.show_last_changed
      : undefined;
    entities.push({
      entity,
      ...(name ? { name } : {}),
      ...(icon ? { icon } : {}),
      ...(showLastChanged !== undefined ? { show_last_changed: showLastChanged } : {}),
    });
  }
  return entities;
}

function looksLikeHomeAssistantEntityId(value: string): boolean {
  return /^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/i.test(value.trim());
}

function dedupeStyleInspectionBlocks(blocks: readonly HomeAssistantCardStyleBlock[]): HomeAssistantCardStyleBlock[] {
  const seen = new Set<string>();
  return blocks.filter(block => {
    const key = `${block.scope}:${block.label}:${block.key}:${block.code}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeEntityIds(entityIds: readonly string[]): string[] {
  return [...new Set(entityIds.map(entityId => entityId.trim()).filter(Boolean))];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isHomeAssistantStackCardConfiguration(
  card: HomeAssistantCardConfiguration,
): card is HomeAssistantStackCardConfiguration {
  return card.type === "horizontal-stack" || card.type === "vertical-stack";
}

function isHomeAssistantGridCardConfiguration(
  card: HomeAssistantCardConfiguration,
): card is HomeAssistantGridCardConfiguration {
  return card.type === "grid";
}

function isHomeAssistantConditionalCardConfiguration(
  card: HomeAssistantCardConfiguration,
): card is HomeAssistantConditionalCardConfiguration {
  return card.type === "conditional";
}

function isHomeAssistantCustomCardConfiguration(
  card: HomeAssistantCardConfiguration,
): card is HomeAssistantCustomCardConfiguration {
  return card.type === "custom:mushroom-template-card"
    || card.type === "custom:bubble-card"
    || card.type === "custom:tabbed-card-v2"
    || isHomeAssistantRawCustomCardConfiguration(card);
}

function isHomeAssistantTabbedCardV2Configuration(
  card: HomeAssistantCardConfiguration,
): card is HomeAssistantTabbedCardV2Configuration {
  return card.type === "custom:tabbed-card-v2";
}

function isHomeAssistantRawCustomCardConfiguration(
  card: HomeAssistantCardConfiguration,
): card is HomeAssistantRawCustomCardConfiguration {
  return typeof card.type === "string"
    && card.type.startsWith("custom:")
    && card.type !== "custom:mushroom-template-card"
    && card.type !== "custom:bubble-card"
    && card.type !== "custom:tabbed-card-v2";
}

function isHomeAssistantCoreSingleCardConfiguration(
  card: HomeAssistantCardConfiguration,
): card is Exclude<HomeAssistantSingleCardConfiguration, HomeAssistantEntitiesCardConfiguration | HomeAssistantGlanceCardConfiguration | HomeAssistantCustomCardConfiguration | HomeAssistantRawCustomCardConfiguration | HomeAssistantGridCardConfiguration | HomeAssistantConditionalCardConfiguration> {
  return card.type === "entity"
    || card.type === "button"
    || card.type === "sensor"
    || card.type === "thermostat"
    || card.type === "iframe";
}
