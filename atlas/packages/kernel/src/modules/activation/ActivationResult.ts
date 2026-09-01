import type { ActivationStage } from "./ActivationStages";
export type ActivationResult=Readonly<{stage:ActivationStage;success:boolean;durationMs:number;}>;