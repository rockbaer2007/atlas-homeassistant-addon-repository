import type { RendererAdapter } from "./RendererAdapter";
import type {
  RendererAdapterLookupRequest,
  RendererAdapterLookupResult,
} from "./RendererAdapterLookup";
import { createRendererAdapterLookupResult } from "./RendererAdapterLookup";

export type RendererAdapterRegistry = Readonly<{
  adapters: readonly RendererAdapter[];
}>;

export function createRendererAdapterRegistry(
  adapters: readonly RendererAdapter[],
): RendererAdapterRegistry {
  return {
    adapters: [...adapters],
  };
}

export function findRendererAdapter(
  registry: RendererAdapterRegistry,
  request: RendererAdapterLookupRequest,
): RendererAdapterLookupResult {
  const adapter = registry.adapters.find(candidate => candidate.name === request.name);

  return createRendererAdapterLookupResult({
    name: request.name,
    ...(adapter ? { adapter } : {}),
  });
}
