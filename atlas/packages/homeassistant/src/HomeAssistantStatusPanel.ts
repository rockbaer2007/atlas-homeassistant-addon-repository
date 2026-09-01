import {
  createThemeRendererStatusOutput,
  executeThemedRendererDomSurfaceScenario,
  type ThemeRendererStatus,
  type ThemeRendererSurfaceElement,
  type ThemeTokens,
} from "@atlas/theme";
import {
  mapHomeAssistantEntityStateToStatus,
  type HomeAssistantEntityState,
} from "./HomeAssistantEntityState";
import type { HomeAssistantWebSocketLifecycle } from "./HomeAssistantWebSocketProtocol";

export type HomeAssistantStatusPanel = Readonly<{
  id: string;
  title: string;
  targetIdentifier: string;
}>;

export type HomeAssistantStatusPanelScenario = Readonly<{
  panel: HomeAssistantStatusPanel;
  status: ThemeRendererStatus;
  element: ThemeRendererSurfaceElement;
  tokens: ThemeTokens;
  title?: string;
  detail?: string;
}>;

export type HomeAssistantEntityStatusPanelScenario = Readonly<{
  panel: HomeAssistantStatusPanel;
  entity: HomeAssistantEntityState;
  element: ThemeRendererSurfaceElement;
  tokens: ThemeTokens;
}>;

export function createHomeAssistantStatusPanel(
  panel: HomeAssistantStatusPanel,
): HomeAssistantStatusPanel {
  return { ...panel };
}

export async function renderHomeAssistantStatusPanel(
  scenario: HomeAssistantStatusPanelScenario,
): ReturnType<typeof executeThemedRendererDomSurfaceScenario> {
  return executeThemedRendererDomSurfaceScenario({
    output: createThemeRendererStatusOutput(scenario.status, {
      title: scenario.title,
      detail: scenario.detail,
    }),
    target: {
      kind: "surface",
      name: scenario.panel.id,
      identifier: scenario.panel.targetIdentifier,
    },
    element: scenario.element,
    tokens: scenario.tokens,
  });
}

export async function renderHomeAssistantEntityStatusPanel(
  scenario: HomeAssistantEntityStatusPanelScenario,
): ReturnType<typeof renderHomeAssistantStatusPanel> {
  return renderHomeAssistantStatusPanel({
    panel: scenario.panel,
    status: mapHomeAssistantEntityStateToStatus(scenario.entity),
    element: scenario.element,
    tokens: scenario.tokens,
    title: scenario.entity.name ?? scenario.entity.entityId,
    detail: formatHomeAssistantEntityDetail(scenario.entity),
  });
}

function formatHomeAssistantEntityDetail(entity: HomeAssistantEntityState): string | undefined {
  if (!entity.value) {
    return undefined;
  }

  return entity.unit ? `${entity.value} ${entity.unit}` : entity.value;
}

export function mapHomeAssistantConnectionLifecycleToStatus(
  lifecycle: HomeAssistantWebSocketLifecycle,
): ThemeRendererStatus {
  return lifecycle.state === "connected"
    ? "ready"
    : lifecycle.state === "connecting" || lifecycle.state === "authenticating"
      ? "pending"
      : "blocked";
}
