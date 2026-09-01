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

export function createRendererDomMountStore(): RendererDomMountStore {
  return {
    records: [],
  };
}

export function createRendererDomMountRecord(
  request: RendererMountRequest,
): RendererDomMountRecord {
  return {
    outputName: request.output.name,
    outputKind: request.output.kind,
    targetName: request.target.name,
    elementId: request.target.identifier ?? "",
    html: request.output.content ?? "",
  };
}

export function findRendererDomMountRecords(
  store: RendererDomMountStore,
  request: RendererDomMountLookupRequest,
): readonly RendererDomMountRecord[] {
  return store.records.filter(record => (
    (request.outputName === undefined || record.outputName === request.outputName) &&
    (request.targetName === undefined || record.targetName === request.targetName) &&
    (request.elementId === undefined || record.elementId === request.elementId)
  ));
}

export function findLatestRendererDomMountRecord(
  store: RendererDomMountStore,
  request: RendererDomMountLookupRequest,
): RendererDomMountRecord | undefined {
  return findRendererDomMountRecords(store, request).at(-1);
}

export function clearRendererDomMountStore(
  store: RendererDomMountStore,
): RendererDomMountStore {
  const records = store.records as RendererDomMountRecord[];
  records.splice(0, records.length);

  return store;
}

export function summarizeRendererDomMountStore(
  store: RendererDomMountStore,
): RendererDomMountSummary {
  return {
    recordCount: store.records.length,
    outputCount: new Set(store.records.map(record => record.outputName)).size,
    elementCount: new Set(store.records.map(record => record.elementId)).size,
    emptyHtmlCount: store.records.filter(record => record.html === "").length,
  };
}

export function inspectRendererDomMountResult(
  store: RendererDomMountStore,
  result: RendererMountResult,
): RendererDomMountDiagnostic {
  const latestRecord = findLatestRendererDomMountRecord(store, {
    outputName: result.output.name,
    targetName: result.target.name,
    ...(result.target.identifier !== undefined
      ? { elementId: result.target.identifier }
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

export function createRendererDomMountPlan(
  request: RendererMountRequest,
): RendererMountPlan {
  return createRendererMountPlan({
    name: `dom:${request.output.name}->${request.target.name}`,
    status: "planned",
    strategy: "adapter",
    request,
    qualityGates: ["request", "output", "target", "diagnostics"],
  });
}

export async function executeRendererDomMountPlan(
  plan: RendererMountPlan,
  adapter: RendererDomMountAdapter = createRendererDomMountAdapter("dom"),
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

export function createRendererDomMountAdapter(
  name: string,
  store: RendererDomMountStore = createRendererDomMountStore(),
): RendererDomMountAdapter {
  const records: RendererDomMountRecord[] = [...store.records];
  const mountedStore: RendererDomMountStore = {
    records,
  };

  return {
    name,
    store: mountedStore,
    clear(): void {
      clearRendererDomMountStore(mountedStore);
    },
    mount(request: RendererMountRequest): RendererMountResult {
      if (request.target.kind !== "surface") {
        return {
          mounted: false,
          output: request.output,
          target: request.target,
          error: `Renderer DOM adapter cannot mount to ${request.target.kind} targets`,
        };
      }

      if (!request.target.identifier) {
        return {
          mounted: false,
          output: request.output,
          target: request.target,
          error: "Renderer DOM adapter requires a target identifier.",
        };
      }

      records.push(createRendererDomMountRecord(request));

      return {
        mounted: true,
        output: request.output,
        target: request.target,
      };
    },
  };
}

