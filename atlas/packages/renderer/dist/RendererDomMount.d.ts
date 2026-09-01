import type { RendererAdapter } from "./RendererAdapter";
import type { RendererMountRequest, RendererMountResult } from "./RendererMount";
import { type RendererMountPlan } from "./RendererMountPlan";
import type { RendererOutput } from "./RendererOutput";
export type RendererDomMountRecord = Readonly<{
    outputName: string;
    outputKind: RendererOutput["kind"];
    targetName: string;
    elementId: string;
    html: string;
}>;
export type RendererDomMountStore = Readonly<{
    records: readonly RendererDomMountRecord[];
}>;
export type RendererDomMountLookupRequest = Readonly<{
    outputName?: string;
    targetName?: string;
    elementId?: string;
}>;
export type RendererDomMountSummary = Readonly<{
    recordCount: number;
    outputCount: number;
    elementCount: number;
    emptyHtmlCount: number;
}>;
export type RendererDomMountDiagnostic = Readonly<{
    mounted: boolean;
    outputName: string;
    targetName: string;
    recordCount: number;
    latestRecord?: RendererDomMountRecord;
    error?: string;
}>;
export type RendererDomMountAdapter = RendererAdapter & Readonly<{
    store: RendererDomMountStore;
    clear(): void;
}>;
export declare function createRendererDomMountStore(): RendererDomMountStore;
export declare function createRendererDomMountRecord(request: RendererMountRequest): RendererDomMountRecord;
export declare function findRendererDomMountRecords(store: RendererDomMountStore, request: RendererDomMountLookupRequest): readonly RendererDomMountRecord[];
export declare function findLatestRendererDomMountRecord(store: RendererDomMountStore, request: RendererDomMountLookupRequest): RendererDomMountRecord | undefined;
export declare function clearRendererDomMountStore(store: RendererDomMountStore): RendererDomMountStore;
export declare function summarizeRendererDomMountStore(store: RendererDomMountStore): RendererDomMountSummary;
export declare function inspectRendererDomMountResult(store: RendererDomMountStore, result: RendererMountResult): RendererDomMountDiagnostic;
export declare function createRendererDomMountPlan(request: RendererMountRequest): RendererMountPlan;
export declare function executeRendererDomMountPlan(plan: RendererMountPlan, adapter?: RendererDomMountAdapter): Promise<RendererMountResult>;
export declare function createRendererDomMountAdapter(name: string, store?: RendererDomMountStore): RendererDomMountAdapter;
