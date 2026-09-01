import type { RendererAdapter } from "./RendererAdapter";

export type RendererPlatformAdapter = Readonly<{
  platform: string;
  adapter: RendererAdapter;
  capabilities: readonly string[];
}>;

export function createRendererPlatformAdapter(
  platformAdapter: RendererPlatformAdapter,
): RendererPlatformAdapter {
  return {
    ...platformAdapter,
    capabilities: [...platformAdapter.capabilities],
  };
}
