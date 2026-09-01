import type { RendererAdapter } from "./RendererAdapter";
import type { RendererAdapterRegistry } from "./RendererAdapterRegistry";
import { type RendererMountRequest, type RendererMountResult } from "./RendererMount";
export type RendererAdapterConflict = Readonly<{
    name: string;
    adapters: readonly RendererAdapter[];
}>;
export type RendererAdapterConflictResolution = Readonly<{
    conflict: RendererAdapterConflict;
    resolved: boolean;
    adapter?: RendererAdapter;
}>;
export declare function createRendererAdapterConflict(conflict: RendererAdapterConflict): RendererAdapterConflict;
export declare function createRendererAdapterConflictResolution(resolution: RendererAdapterConflictResolution): RendererAdapterConflictResolution;
export declare function findRendererAdapterConflicts(registry: RendererAdapterRegistry): readonly RendererAdapterConflict[];
export declare function resolveRendererAdapterConflictWithFirstCandidate(conflict: RendererAdapterConflict): RendererAdapterConflictResolution;
export declare function resolveRendererAdapterRegistryConflictsWithFirstCandidate(registry: RendererAdapterRegistry): readonly RendererAdapterConflictResolution[];
export declare function mountResolvedRendererAdapter(resolution: RendererAdapterConflictResolution, request: RendererMountRequest): Promise<RendererMountResult>;
