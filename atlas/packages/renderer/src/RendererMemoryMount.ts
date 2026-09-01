import type { RendererAdapter } from "./RendererAdapter";
import {
  createRendererAdapterConflict,
  createRendererAdapterConflictResolution,
} from "./RendererAdapterConflict";
import type {
  RendererMountRequest,
  RendererMountResult,
} from "./RendererMount";
import {
  createRendererMountPlan,
  type RendererMountPlan,
} from "./RendererMountPlan";
import { executeRendererMountPlan } from "./RendererMountPlanExecution";
import type { RendererOutput } from "./RendererOutput";
import type { RendererTarget } from "./RendererTarget";

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

export function createRendererMemoryMountStore(): RendererMemoryMountStore {
  return {
    records: [],
  };
}

export function createRendererMemoryMountRecord(
  request: RendererMountRequest,
): RendererMemoryMountRecord {
  return {
    outputName: request.output.name,
    outputKind: request.output.kind,
    targetName: request.target.name,
    ...(request.target.identifier !== undefined
      ? { targetIdentifier: request.target.identifier }
      : {}),
    content: request.output.content ?? "",
  };
}

export function findRendererMemoryMountRecords(
  store: RendererMemoryMountStore,
  request: RendererMemoryMountLookupRequest,
): readonly RendererMemoryMountRecord[] {
  return store.records.filter(record => (
    (request.outputName === undefined || record.outputName === request.outputName) &&
    (request.targetName === undefined || record.targetName === request.targetName) &&
    (
      request.targetIdentifier === undefined ||
      record.targetIdentifier === request.targetIdentifier
    )
  ));
}

export function findLatestRendererMemoryMountRecord(
  store: RendererMemoryMountStore,
  request: RendererMemoryMountLookupRequest,
): RendererMemoryMountRecord | undefined {
  return findRendererMemoryMountRecords(store, request).at(-1);
}

export function clearRendererMemoryMountStore(
  store: RendererMemoryMountStore,
): RendererMemoryMountStore {
  const records = store.records as RendererMemoryMountRecord[];
  records.splice(0, records.length);

  return store;
}

export function summarizeRendererMemoryMountStore(
  store: RendererMemoryMountStore,
): RendererMemoryMountSummary {
  return {
    recordCount: store.records.length,
    outputCount: new Set(store.records.map(record => record.outputName)).size,
    targetCount: new Set(store.records.map(record => record.targetName)).size,
    emptyContentCount: store.records.filter(record => record.content === "").length,
  };
}

export function inspectRendererMemoryMountResult(
  store: RendererMemoryMountStore,
  result: RendererMountResult,
): RendererMemoryMountDiagnostic {
  const latestRecord = findLatestRendererMemoryMountRecord(store, {
    outputName: result.output.name,
    targetName: result.target.name,
    ...(result.target.identifier !== undefined
      ? { targetIdentifier: result.target.identifier }
      : {}),
  });

  return {
    mounted: result.mounted,
    outputName: result.output.name,
    targetName: result.target.name,
    recordCount: store.records.length,
    ...(latestRecord ? { latestRecord } : {}),
    ...(result.error ? { error: result.error } : {}),
  };
}

export function createRendererMemoryMountPlan(
  request: RendererMountRequest,
): RendererMountPlan {
  return createRendererMountPlan({
    name: `memory:${request.output.name}->${request.target.name}`,
    status: "planned",
    strategy: "adapter",
    request,
    qualityGates: ["request", "output", "target", "diagnostics"],
  });
}

export async function executeRendererMemoryMountPlan(
  plan: RendererMountPlan,
  adapter: RendererMemoryMountAdapter = createRendererMemoryMountAdapter("memory"),
): Promise<RendererMountResult> {
  return executeRendererMountPlan({
    plan,
    adapterResolution: createRendererAdapterConflictResolution({
      conflict: createRendererAdapterConflict({
        name: adapter.name,
        adapters: [adapter],
      }),
      resolved: true,
      adapter,
    }),
  });
}

export function createRendererMemoryMountAdapter(
  name: string,
  store: RendererMemoryMountStore = createRendererMemoryMountStore(),
): RendererMemoryMountAdapter {
  const records: RendererMemoryMountRecord[] = [...store.records];
  const mountedStore: RendererMemoryMountStore = {
    records,
  };

  return {
    name,
    store: mountedStore,
    clear(): void {
      clearRendererMemoryMountStore(mountedStore);
    },
    mount(request: RendererMountRequest): RendererMountResult {
      if (request.target.kind !== "memory") {
        return {
          mounted: false,
          output: request.output,
          target: request.target,
          error: `Renderer memory adapter cannot mount to ${request.target.kind} targets`,
        };
      }

      records.push(createRendererMemoryMountRecord(request));

      return {
        mounted: true,
        output: request.output,
        target: request.target,
      };
    },
  };
}
