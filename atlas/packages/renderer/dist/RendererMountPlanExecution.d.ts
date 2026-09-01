import type { RendererAdapterConflictResolution } from "./RendererAdapterConflict";
import { type RendererMountResult } from "./RendererMount";
import type { RendererMountPlan } from "./RendererMountPlan";
import type { RendererPlatformAdapterConflictResolution } from "./RendererPlatformAdapterConflict";
export type RendererMountPlanExecution = Readonly<{
    plan: RendererMountPlan;
    adapterResolution?: RendererAdapterConflictResolution;
    platformAdapterResolution?: RendererPlatformAdapterConflictResolution;
}>;
export declare function executeRendererMountPlan(execution: RendererMountPlanExecution): Promise<RendererMountResult>;
