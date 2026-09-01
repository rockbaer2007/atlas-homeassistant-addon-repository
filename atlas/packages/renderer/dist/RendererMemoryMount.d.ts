import type { RendererAdapter } from "./RendererAdapter";
import type { RendererMountRequest, RendererMountResult } from "./RendererMount";
import { type RendererMountPlan } from "./RendererMountPlan";
import type { RendererOutput } from "./RendererOutput";
export type RendererMemoryMountRecord = Readonly<{
    outputName: string;
    outputKind: RendererOutput["kind"];
    targetName: string;
    targetIdentifier?: string;
    content: string;
}>;
export type RendererMemoryMountStore = Readonly<{
    records: readonly RendererMemoryMountRecord[];
}>;
export type RendererMemoryMountLookupRequest = Readonly<{
    outputName?: string;
    targetName?: string;
    targetIdentifier?: string;
}>;
export type RendererMemoryMountSummary = Readonly<{
    recordCount: number;
    outputCount: number;
    targetCount: number;
    emptyContentCount: number;
}>;
export type RendererMemoryMountDiagnostic = Readonly<{
    mounted: boolean;
    outputName: string;
    targetName: string;
    recordCount: number;
    latestRecord?: RendererMemoryMountRecord;
    error?: string;
}>;
export type RendererMemoryMountAdapter = RendererAdapter & Readonly<{
    store: RendererMemoryMountStore;
    clear(): void;
}>;
export declare function createRendererMemoryMountStore(): RendererMemoryMountStore;
export declare function createRendererMemoryMountRecord(request: RendererMountRequest): RendererMemoryMountRecord;
export declare function findRendererMemoryMountRecords(store: RendererMemoryMountStore, request: RendererMemoryMountLookupRequest): readonly RendererMemoryMountRecord[];
export declare function findLatestRendererMemoryMountRecord(store: RendererMemoryMountStore, request: RendererMemoryMountLookupRequest): RendererMemoryMountRecord | undefined;
export declare function clearRendererMemoryMountStore(store: RendererMemoryMountStore): RendererMemoryMountStore;
export declare function summarizeRendererMemoryMountStore(store: RendererMemoryMountStore): RendererMemoryMountSummary;
export declare function inspectRendererMemoryMountResult(store: RendererMemoryMountStore, result: RendererMountResult): RendererMemoryMountDiagnostic;
export declare function createRendererMemoryMountPlan(request: RendererMountRequest): RendererMountPlan;
export declare function executeRendererMemoryMountPlan(plan: RendererMountPlan, adapter?: RendererMemoryMountAdapter): Promise<RendererMountResult>;
export declare function createRendererMemoryMountAdapter(name: string, store?: RendererMemoryMountStore): RendererMemoryMountAdapter;
