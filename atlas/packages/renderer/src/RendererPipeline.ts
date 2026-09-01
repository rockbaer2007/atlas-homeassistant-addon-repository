import type { RendererHostContext } from "./RendererHostContext";

export type RendererPipelineStageResult = Readonly<{
  stage: string;
  completed: boolean;
}>;

export type RendererPipelineStage = Readonly<{
  name: string;
  run(
    context: RendererHostContext,
  ): RendererPipelineStageResult | Promise<RendererPipelineStageResult>;
}>;

export type RendererPipeline = readonly RendererPipelineStage[];

export type RendererPipelineExecutionResult = Readonly<{
  completed: boolean;
  stages: readonly RendererPipelineStageResult[];
}>;

export function createRendererPipeline(
  stages: readonly RendererPipelineStage[],
): RendererPipeline {
  return [...stages];
}

export async function executeRendererPipeline(
  context: RendererHostContext,
  pipeline: RendererPipeline,
): Promise<RendererPipelineExecutionResult> {
  const stages: RendererPipelineStageResult[] = [];

  for (const stage of pipeline) {
    stages.push(await stage.run(context));
  }

  return {
    completed: stages.every(stage => stage.completed),
    stages,
  };
}
