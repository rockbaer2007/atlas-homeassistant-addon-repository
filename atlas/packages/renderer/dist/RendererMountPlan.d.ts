import type { RendererMountRequest } from "./RendererMount";
export type RendererMountPlanStrategy = "manual" | "adapter" | "platform-adapter";
export type RendererMountPlanStatus = "planned";
export type RendererMountPlanQualityGate = "request" | "target" | "output" | "diagnostics";
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
export declare function createRendererMountPlan(plan: RendererMountPlan): RendererMountPlan;
export declare function createDefaultRendererMountPlan(request: RendererMountRequest): RendererMountPlan;
export declare function inspectRendererMountPlan(plan: RendererMountPlan): RendererMountPlanReport;
export declare function isRendererMountPlanReady(plan: RendererMountPlan): boolean;
