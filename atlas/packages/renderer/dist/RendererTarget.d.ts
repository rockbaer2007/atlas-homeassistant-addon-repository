export type RendererTargetKind = "memory" | "surface";
export type RendererTarget = Readonly<{
    kind: RendererTargetKind;
    name: string;
    identifier?: string;
}>;
export declare function createRendererTarget(target: RendererTarget): RendererTarget;
