export function createRendererMountPlan(plan) {
    return {
        ...plan,
        qualityGates: [...plan.qualityGates],
    };
}
export function createDefaultRendererMountPlan(request) {
    return createRendererMountPlan({
        name: `${request.output.name}->${request.target.name}`,
        status: "planned",
        strategy: "manual",
        request,
        qualityGates: ["request", "output", "target", "diagnostics"],
    });
}
export function inspectRendererMountPlan(plan) {
    return {
        planned: plan.status === "planned",
        name: plan.name,
        strategy: plan.strategy,
        outputName: plan.request.output.name,
        targetName: plan.request.target.name,
        qualityGates: [...plan.qualityGates],
    };
}
export function isRendererMountPlanReady(plan) {
    return (plan.status === "planned" &&
        plan.qualityGates.includes("request") &&
        plan.qualityGates.includes("output") &&
        plan.qualityGates.includes("target") &&
        plan.qualityGates.includes("diagnostics"));
}
