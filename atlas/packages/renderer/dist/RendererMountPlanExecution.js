import { mountResolvedRendererAdapter } from "./RendererAdapterConflict";
import { createRendererMountResult, } from "./RendererMount";
import { isRendererMountPlanReady } from "./RendererMountPlan";
import { mountResolvedRendererPlatformAdapter } from "./RendererPlatformAdapterConflict";
export async function executeRendererMountPlan(execution) {
    const { plan } = execution;
    const { request } = plan;
    if (!isRendererMountPlanReady(plan)) {
        return createRendererMountResult({
            mounted: false,
            output: request.output,
            target: request.target,
            error: "Renderer mount plan is not ready.",
        });
    }
    if (plan.strategy === "adapter") {
        if (!execution.adapterResolution) {
            return createRendererMountResult({
                mounted: false,
                output: request.output,
                target: request.target,
                error: "Renderer mount plan adapter resolution is missing.",
            });
        }
        return mountResolvedRendererAdapter(execution.adapterResolution, request);
    }
    if (plan.strategy === "platform-adapter") {
        if (!execution.platformAdapterResolution) {
            return createRendererMountResult({
                mounted: false,
                output: request.output,
                target: request.target,
                error: "Renderer mount plan platform adapter resolution is missing.",
            });
        }
        return mountResolvedRendererPlatformAdapter(execution.platformAdapterResolution, request);
    }
    return createRendererMountResult({
        mounted: false,
        output: request.output,
        target: request.target,
    });
}
