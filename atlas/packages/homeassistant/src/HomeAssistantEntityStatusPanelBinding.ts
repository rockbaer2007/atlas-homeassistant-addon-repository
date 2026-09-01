import type { ThemeRendererSurfaceElement, ThemeTokens } from "@atlas/theme";

import type { HomeAssistantEntityStateTransport } from "./HomeAssistantEntityStateTransport";
import type { HomeAssistantStatusPanel } from "./HomeAssistantStatusPanel";
import { renderHomeAssistantEntityStatusPanel } from "./HomeAssistantStatusPanel";

export type HomeAssistantEntityStatusPanelBinding = Readonly<{
  dispose(): void;
}>;

export type HomeAssistantEntityStatusPanelBindingRequest = Readonly<{
  transport: HomeAssistantEntityStateTransport;
  panel: HomeAssistantStatusPanel;
  entityId: string;
  element: ThemeRendererSurfaceElement;
  tokens: ThemeTokens;
}>;

export function bindHomeAssistantEntityStatusPanel(
  request: HomeAssistantEntityStatusPanelBindingRequest,
): HomeAssistantEntityStatusPanelBinding {
  const dispose = request.transport.subscribe(async entity => {
    if (entity.entityId !== request.entityId) {
      return;
    }

    await renderHomeAssistantEntityStatusPanel({
      panel: request.panel,
      entity,
      element: request.element,
      tokens: request.tokens,
    });
  });

  return { dispose };
}
