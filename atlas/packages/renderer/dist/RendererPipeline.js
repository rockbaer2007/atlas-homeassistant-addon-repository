export function createRendererPipeline(stages) {
    return [...stages];
}
export async function executeRendererPipeline(context, pipeline) {
    const stages = [];
    for (const stage of pipeline) {
        stages.push(await stage.run(context));
    }
    return {
        completed: stages.every(stage => stage.completed),
        stages,
    };
}
