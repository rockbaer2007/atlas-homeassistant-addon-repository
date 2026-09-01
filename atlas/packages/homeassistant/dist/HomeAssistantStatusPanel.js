import { createThemeRendererStatusOutput, executeThemedRendererDomSurfaceScenario, } from "@atlas/theme";
import { mapHomeAssistantEntityStateToStatus, } from "./HomeAssistantEntityState";
export function createHomeAssistantStatusPanel(panel) {
    return { ...panel };
}
export async function renderHomeAssistantStatusPanel(scenario) {
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
export async function renderHomeAssistantEntityStatusPanel(scenario) {
    return renderHomeAssistantStatusPanel({
        panel: scenario.panel,
        status: mapHomeAssistantEntityStateToStatus(scenario.entity),
        element: scenario.element,
        tokens: scenario.tokens,
        title: scenario.entity.name ?? scenario.entity.entityId,
        detail: formatHomeAssistantEntityDetail(scenario.entity),
    });
}
function formatHomeAssistantEntityDetail(entity) {
    if (!entity.value) {
        return undefined;
    }
    return entity.unit ? `${entity.value} ${entity.unit}` : entity.value;
}
export function mapHomeAssistantConnectionLifecycleToStatus(lifecycle) {
    return lifecycle.state === "connected"
        ? "ready"
        : lifecycle.state === "connecting" || lifecycle.state === "authenticating"
            ? "pending"
            : "blocked";
}
