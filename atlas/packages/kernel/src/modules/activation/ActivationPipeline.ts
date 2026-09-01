import type { ActivationContext } from "./ActivationContext";
import type { ActivationResult } from "./ActivationResult";
export interface ActivationPipeline{activate(context:ActivationContext):Promise<ActivationResult>;}