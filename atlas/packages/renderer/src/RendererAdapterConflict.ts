import type { RendererAdapter } from "./RendererAdapter";
import type { RendererAdapterRegistry } from "./RendererAdapterRegistry";
import {
  createRendererMountResult,
  type RendererMountRequest,
  type RendererMountResult,
} from "./RendererMount";
import {
  createRendererAdapterSelectionRequest,
  selectFirstRendererAdapterCandidate,
} from "./RendererAdapterSelection";

export type RendererAdapterConflict = Readonly<{
  name: string;
  adapters: readonly RendererAdapter[];
}>;

export type RendererAdapterConflictResolution = Readonly<{
  conflict: RendererAdapterConflict;
  resolved: boolean;
  adapter?: RendererAdapter;
}>;

export function createRendererAdapterConflict(
  conflict: RendererAdapterConflict,
): RendererAdapterConflict {
  return {
    ...conflict,
    adapters: [...conflict.adapters],
  };
}

export function createRendererAdapterConflictResolution(
  resolution: RendererAdapterConflictResolution,
): RendererAdapterConflictResolution {
  return {
    ...resolution,
    conflict: createRendererAdapterConflict(resolution.conflict),
  };
}

export function findRendererAdapterConflicts(
  registry: RendererAdapterRegistry,
): readonly RendererAdapterConflict[] {
  const adaptersByName = new Map<string, RendererAdapter[]>();

  for (const adapter of registry.adapters) {
    const adapters = adaptersByName.get(adapter.name) ?? [];
    adapters.push(adapter);
    adaptersByName.set(adapter.name, adapters);
  }

  return [...adaptersByName.entries()]
    .filter(([, adapters]) => adapters.length > 1)
    .map(([name, adapters]) => createRendererAdapterConflict({
      name,
      adapters,
    }));
}

export function resolveRendererAdapterConflictWithFirstCandidate(
  conflict: RendererAdapterConflict,
): RendererAdapterConflictResolution {
  const selection = selectFirstRendererAdapterCandidate(
    createRendererAdapterSelectionRequest({
      name: conflict.name,
      candidates: conflict.adapters,
    }),
  );

  return createRendererAdapterConflictResolution({
    conflict,
    resolved: Boolean(selection.adapter),
    ...(selection.adapter ? { adapter: selection.adapter } : {}),
  });
}

export function resolveRendererAdapterRegistryConflictsWithFirstCandidate(
  registry: RendererAdapterRegistry,
): readonly RendererAdapterConflictResolution[] {
  return findRendererAdapterConflicts(registry)
    .map(resolveRendererAdapterConflictWithFirstCandidate);
}

export async function mountResolvedRendererAdapter(
  resolution: RendererAdapterConflictResolution,
  request: RendererMountRequest,
): Promise<RendererMountResult> {
  if (!resolution.resolved || !resolution.adapter) {
    return createRendererMountResult({
      mounted: false,
      output: request.output,
      target: request.target,
    });
  }

  try {
    return await resolution.adapter.mount(request);
  } catch (error) {
    return createRendererMountResult({
      mounted: false,
      output: request.output,
      target: request.target,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
