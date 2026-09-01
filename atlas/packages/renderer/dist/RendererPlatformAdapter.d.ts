import type { RendererAdapter } from "./RendererAdapter";
export type RendererPlatformAdapter = Readonly<{
    platform: string;
    adapter: RendererAdapter;
    capabilities: readonly string[];
}>;
export declare function createRendererPlatformAdapter(platformAdapter: RendererPlatformAdapter): RendererPlatformAdapter;
