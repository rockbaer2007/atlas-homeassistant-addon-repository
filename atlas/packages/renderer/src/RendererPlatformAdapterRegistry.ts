import type { RendererPlatformAdapter } from "./RendererPlatformAdapter";
import type {
  RendererPlatformAdapterLookupRequest,
  RendererPlatformAdapterLookupResult,
} from "./RendererPlatformAdapterLookup";
import { createRendererPlatformAdapterLookupResult } from "./RendererPlatformAdapterLookup";

export type RendererPlatformAdapterRegistry = Readonly<{
  platformAdapters: readonly RendererPlatformAdapter[];
}>;

export function createRendererPlatformAdapterRegistry(
  platformAdapters: readonly RendererPlatformAdapter[],
): RendererPlatformAdapterRegistry {
  return {
    platformAdapters: [...platformAdapters],
  };
}

export function findRendererPlatformAdapter(
  registry: RendererPlatformAdapterRegistry,
  request: RendererPlatformAdapterLookupRequest,
): RendererPlatformAdapterLookupResult {
  const platformAdapter = registry.platformAdapters.find(
    candidate => candidate.platform === request.platform,
  );

  return createRendererPlatformAdapterLookupResult({
    platform: request.platform,
    ...(platformAdapter ? { platformAdapter } : {}),
  });
}
