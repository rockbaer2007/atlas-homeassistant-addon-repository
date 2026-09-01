import type { ActivationPipeline } from "./ActivationPipeline";
import { ActivationStages } from "./ActivationStages";
export class DefaultActivationPipeline implements ActivationPipeline{constructor(private readonly stages:any[]){} async activate(_:any){for(const s of this.stages){await s.execute(_);} return {stage:ActivationStages.Healthy,success:true,durationMs:0};}}