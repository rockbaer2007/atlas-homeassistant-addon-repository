import { createRendererDomSurfaceMountAdapterRegistry, createRendererOutput, executeRendererTargetMountWithReport, } from "@atlas/renderer";
import { applyThemeTokens } from "./ThemeTokens";
export function createThemeRendererStatusOutput(status, options = {}) {
    const label = status === "ready"
        ? "Ready"
        : status === "blocked"
            ? "Blocked"
            : "Pending";
    return createRendererOutput({
        kind: "fragment",
        name: `atlas-status-${status}`,
        content: `<section class="atlas-status" data-status="${status}">`
            + `<strong>${escapeHtml(options.title ?? "ATLAS")}</strong>`
            + `<span>${label}</span>${options.detail ? `<small>${escapeHtml(options.detail)}</small>` : ""}</section>`,
    });
}
function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;",
    })[character] ?? character);
}
export async function executeThemedRendererDomSurfaceScenario(scenario) {
    const identifier = scenario.target.identifier ?? "";
    const routing = createRendererDomSurfaceMountAdapterRegistry([{
            identifier,
            element: scenario.element,
        }]);
    const execution = await executeRendererTargetMountWithReport({
        output: scenario.output,
        target: scenario.target,
        registry: routing.registry,
    });
    if (execution.result.mounted) {
        applyThemeTokens(scenario.element, scenario.tokens);
    }
    return execution;
}
