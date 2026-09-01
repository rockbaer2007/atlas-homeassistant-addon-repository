import type { RendererHostContext } from "./RendererHostContext";
export type RendererPipelineStageResult = Readonly<{
    stage: string;
    completed: boolean;
}>;
export type RendererPipelineStage = Readonly<{
    name: string;
    run(context: RendererHostContext): RendererPipelineStageResult | Promise<RendererPipelineStageResult>;
}>;
export type RendererPipeline = readonly RendererPipelineStage[];
export type RendererPipelineExecutionResult = Readonly<{
    completed: boolean;
    stages: readonly RendererPipelineStageResult[];
}>;
export declare function createRendererPipeline(stages: readonly RendererPipelineStage[]): RendererPipeline;
export declare function executeRendererPipeline(context: RendererHostContext, pipeline: RendererPipeline): Promise<RendererPipelineExecutionResult>;
