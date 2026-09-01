import { ActivationStages } from "./ActivationStages";
export class DefaultActivationPipeline {
    stages;
    constructor(stages) {
        this.stages = stages;
    }
    async activate(_) { for (const s of this.stages) {
        await s.execute(_);
    } return { stage: ActivationStages.Healthy, success: true, durationMs: 0 }; }
}
