import type { RendererPlatformAdapter } from "./RendererPlatformAdapter";
import type { RendererPlatformAdapterRegistry } from "./RendererPlatformAdapterRegistry";
import { type RendererMountRequest, type RendererMountResult } from "./RendererMount";
export type RendererPlatformAdapterConflict = Readonly<{
    platform: string;
    platformAdapters: readonly RendererPlatformAdapter[];
}>;
export type RendererPlatformAdapterConflictResolution = Readonly<{
    conflict: RendererPlatformAdapterConflict;
    resolved: boolean;
    platformAdapter?: RendererPlatformAdapter;
}>;
export declare function createRendererPlatformAdapterConflict(conflict: RendererPlatformAdapterConflict): RendererPlatformAdapterConflict;
export declare function createRendererPlatformAdapterConflictResolution(resolution: RendererPlatformAdapterConflictResolution): RendererPlatformAdapterConflictResolution;
export declare function findRendererPlatformAdapterConflicts(registry: RendererPlatformAdapterRegistry): readonly RendererPlatformAdapterConflict[];
export declare function resolveRendererPlatformAdapterConflictWithFirstCandidate(conflict: RendererPlatformAdapterConflict): RendererPlatformAdapterConflictResolution;
export declare function resolveRendererPlatformAdapterRegistryConflictsWithFirstCandidate(registry: RendererPlatformAdapterRegistry): readonly RendererPlatformAdapterConflictResolution[];
export declare function mountResolvedRendererPlatformAdapter(resolution: RendererPlatformAdapterConflictResolution, request: RendererMountRequest): Promise<RendererMountResult>;
