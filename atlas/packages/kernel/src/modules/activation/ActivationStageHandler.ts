import type { ActivationContext } from "./ActivationContext";
export interface ActivationStageHandler{execute(context:ActivationContext):Promise<void>;}