import type { RendererMountRequest } from "./RendererMount";

export type RendererMountPlanStrategy =
  | "manual"
  | "adapter"
  | "platform-adapter";

export type RendererMountPlanStatus = "planned";

export type RendererMountPlanQualityGate =
  | "request"
  | "target"
  | "output"
  | "diagnostics";

export type RendererMountPlan = Readonly<{
  name: string;
  status: RendererMountPlanStatus;
  strategy: RendererMountPlanStrategy;
  request: RendererMountRequest;
  qualityGates: readonly RendererMountPlanQualityGate[];
}>;

export type RendererMountPlanReport = Readonly<{
  planned: boolean;
  name: string;
  strategy: RendererMountPlanStrategy;
  outputName: string;
  targetName: string;
  qualityGates: readonly RendererMountPlanQualityGate[];
}>;

export function createRendererMountPlan(
  plan: RendererMountPlan,
): RendererMountPlan {
  return {
    ...plan,
    qualityGates: [...plan.qualityGates],
  };
}

export function createDefaultRendererMountPlan(
  request: RendererMountRequest,
): RendererMountPlan {
  return createRendererMountPlan({
    name: `${request.output.name}->${request.target.name}`,
    status: "planned",
    strategy: "manual",
    request,
    qualityGates: ["request", "output", "target", "diagnostics"],
  });
}

export function inspectRendererMountPlan(
  plan: RendererMountPlan,
): RendererMountPlanReport {
  return {
    planned: plan.status === "planned",
    name: plan.name,
    strategy: plan.strategy,
    outputName: plan.request.output.name,
    targetName: plan.request.target.name,
    qualityGates: [...plan.qualityGates],
  };
}

export function isRendererMountPlanReady(
  plan: RendererMountPlan,
): boolean {
  return (
    plan.status === "planned" &&
    plan.qualityGates.includes("request") &&
    plan.qualityGates.includes("output") &&
    plan.qualityGates.includes("target") &&
    plan.qualityGates.includes("diagnostics")
  );
}
