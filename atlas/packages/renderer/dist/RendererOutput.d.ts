export type RendererOutputKind = "fragment" | "document";
export type RendererOutput = Readonly<{
    kind: RendererOutputKind;
    name: string;
    content?: string;
}>;
export declare function createRendererOutput(output: RendererOutput): RendererOutput;
