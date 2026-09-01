import type { RendererPlatformAdapter } from "./RendererPlatformAdapter";
import type { RendererPlatformAdapterRegistry } from "./RendererPlatformAdapterRegistry";
import {
  createRendererMountResult,
  type RendererMountRequest,
  type RendererMountResult,
} from "./RendererMount";
import {
  createRendererPlatformAdapterSelectionRequest,
  selectFirstRendererPlatformAdapterCandidate,
} from "./RendererPlatformAdapterSelection";

export type RendererPlatformAdapterConflict = Readonly<{
  platform: string;
  platformAdapters: readonly RendererPlatformAdapter[];
}>;

export type RendererPlatformAdapterConflictResolution = Readonly<{
  conflict: RendererPlatformAdapterConflict;
  resolved: boolean;
  platformAdapter?: RendererPlatformAdapter;
}>;

export function createRendererPlatformAdapterConflict(
  conflict: RendererPlatformAdapterConflict,
): RendererPlatformAdapterConflict {
  return {
    ...conflict,
    platformAdapters: [...conflict.platformAdapters],
  };
}

export function createRendererPlatformAdapterConflictResolution(
  resolution: RendererPlatformAdapterConflictResolution,
): RendererPlatformAdapterConflictResolution {
  return {
    ...resolution,
    conflict: createRendererPlatformAdapterConflict(resolution.conflict),
  };
}

export function findRendererPlatformAdapterConflicts(
  registry: RendererPlatformAdapterRegistry,
): readonly RendererPlatformAdapterConflict[] {
  const platformAdaptersByPlatform = new Map<string, RendererPlatformAdapter[]>();

  for (const platformAdapter of registry.platformAdapters) {
    const platformAdapters = platformAdaptersByPlatform.get(platformAdapter.platform) ?? [];
    platformAdapters.push(platformAdapter);
    platformAdaptersByPlatform.set(platformAdapter.platform, platformAdapters);
  }

  return [...platformAdaptersByPlatform.entries()]
    .filter(([, platformAdapters]) => platformAdapters.length > 1)
    .map(([platform, platformAdapters]) => createRendererPlatformAdapterConflict({
      platform,
      platformAdapters,
    }));
}

export function resolveRendererPlatformAdapterConflictWithFirstCandidate(
  conflict: RendererPlatformAdapterConflict,
): RendererPlatformAdapterConflictResolution {
  const selection = selectFirstRendererPlatformAdapterCandidate(
    createRendererPlatformAdapterSelectionRequest({
      platform: conflict.platform,
      candidates: conflict.platformAdapters,
    }),
  );

  return createRendererPlatformAdapterConflictResolution({
    conflict,
    resolved: Boolean(selection.platformAdapter),
    ...(selection.platformAdapter ? { platformAdapter: selection.platformAdapter } : {}),
  });
}

export function resolveRendererPlatformAdapterRegistryConflictsWithFirstCandidate(
  registry: RendererPlatformAdapterRegistry,
): readonly RendererPlatformAdapterConflictResolution[] {
  return findRendererPlatformAdapterConflicts(registry)
    .map(resolveRendererPlatformAdapterConflictWithFirstCandidate);
}

export async function mountResolvedRendererPlatformAdapter(
  resolution: RendererPlatformAdapterConflictResolution,
  request: RendererMountRequest,
): Promise<RendererMountResult> {
  if (!resolution.resolved || !resolution.platformAdapter) {
    return createRendererMountResult({
      mounted: false,
      output: request.output,
      target: request.target,
    });
  }

  try {
    return await resolution.platformAdapter.adapter.mount(request);
  } catch (error) {
    return createRendererMountResult({
      mounted: false,
      output: request.output,
      target: request.target,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
