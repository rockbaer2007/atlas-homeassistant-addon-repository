export type RendererOutputKind = "fragment" | "document";

export type RendererOutput = Readonly<{
  kind: RendererOutputKind;
  name: string;
  content?: string;
}>;

export function createRendererOutput(
  output: RendererOutput,
): RendererOutput {
  return {
    ...output,
  };
}
