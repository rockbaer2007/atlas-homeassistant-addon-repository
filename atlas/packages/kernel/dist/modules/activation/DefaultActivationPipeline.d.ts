import type { ActivationPipeline } from "./ActivationPipeline";
export declare class DefaultActivationPipeline implements ActivationPipeline {
    private readonly stages;
    constructor(stages: any[]);
    activate(_: any): Promise<{
        stage: "healthy";
        success: boolean;
        durationMs: number;
    }>;
}
