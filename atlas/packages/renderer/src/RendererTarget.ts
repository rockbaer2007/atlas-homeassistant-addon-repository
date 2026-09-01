export type RendererTargetKind = "memory" | "surface";

export type RendererTarget = Readonly<{
  kind: RendererTargetKind;
  name: string;
  identifier?: string;
}>;

export function createRendererTarget(
  target: RendererTarget,
): RendererTarget {
  return {
    ...target,
  };
}
