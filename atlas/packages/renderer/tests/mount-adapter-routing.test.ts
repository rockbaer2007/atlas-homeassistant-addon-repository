import { describe, expect, it } from "vitest";

import {
  createDefaultRendererMountAdapterRegistry,
  createRendererAdapterRegistry,
  createRendererOutput,
  createRendererTargetMountIntegrationReadinessCatalog,
  createRendererTargetMountIntegrationStatusHistory,
  createRendererTargetMountBatchDiagnosticCatalog,
  createRendererTarget,
  closeRendererTargetMountBatchDiagnostics,
  consumeRendererTargetMountBatchReports,
  executeRendererTargetMount,
  executeRendererTargetMountBatch,
  executeRendererTargetMountWithReport,
  exportRendererTargetMountBatchDiagnosticCatalog,
  exportRendererTargetMountIntegrationReadinessCatalog,
  exportRendererTargetMountIntegrationStatusHistory,
  findRendererTargetMountBatchFailures,
  findRendererTargetMountIntegrationReadinessHandoffs,
  findRendererTargetMountIntegrationStatusHistoryEntries,
  findLatestRendererDomMountRecord,
  findLatestRendererMemoryMountRecord,
  handoffRendererTargetMountBatchDiagnostics,
  handoffRendererTargetMountIntegrationReadiness,
  appendRendererTargetMountIntegrationStatusHistory,
  RendererDefaultMountAdapterNames,
  resolveRendererTargetMountAdapter,
  reviewRendererTargetMountIntegrationReadiness,
  snapshotRendererTargetMountBatchDiagnosticCatalog,
  snapshotRendererTargetMountBatchDiagnostics,
  snapshotRendererTargetMountIntegrationReadiness,
  snapshotRendererTargetMountIntegrationReadinessCatalog,
  snapshotRendererTargetMountIntegrationStatusHistory,
  summarizeRendererTargetMountIntegrationStatus,
} from "../src";

describe("renderer mount adapter routing", () => {
  it("creates a default Memory and DOM mount adapter registry", () => {
    const routing = createDefaultRendererMountAdapterRegistry();

    expect(routing.registry.adapters.map(adapter => adapter.name)).toEqual([
      RendererDefaultMountAdapterNames.Memory,
      RendererDefaultMountAdapterNames.Dom,
    ]);
    expect(routing.memoryAdapter.store.records).toEqual([]);
    expect(routing.domAdapter.store.records).toEqual([]);
  });

  it("resolves memory targets to the Memory mount adapter", () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const target = createRendererTarget({
      kind: "memory",
      name: "preview-cache",
    });

    const resolution = resolveRendererTargetMountAdapter(routing.registry, target);

    expect(resolution).toEqual({
      target,
      adapterName: RendererDefaultMountAdapterNames.Memory,
      adapter: routing.memoryAdapter,
    });
  });

  it("resolves surface targets to the DOM mount adapter", () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const target = createRendererTarget({
      kind: "surface",
      name: "preview-surface",
      identifier: "atlas-preview",
    });

    const resolution = resolveRendererTargetMountAdapter(routing.registry, target);

    expect(resolution).toEqual({
      target,
      adapterName: RendererDefaultMountAdapterNames.Dom,
      adapter: routing.domAdapter,
    });
  });

  it("reports missing target adapters before mounting", () => {
    const registry = createRendererAdapterRegistry([]);
    const target = createRendererTarget({
      kind: "memory",
      name: "preview-cache",
    });

    const resolution = resolveRendererTargetMountAdapter(registry, target);

    expect(resolution).toEqual({
      target,
      adapterName: RendererDefaultMountAdapterNames.Memory,
      error: "Renderer mount adapter renderer.memory was not found.",
    });
  });

  it("mounts memory targets through the unified target mount flow", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const output = createRendererOutput({
      kind: "fragment",
      name: "preview-fragment",
      content: "<p>Atlas preview</p>",
    });
    const target = createRendererTarget({
      kind: "memory",
      name: "preview-cache",
    });

    const result = await executeRendererTargetMount({
      output,
      target,
      registry: routing.registry,
    });

    expect(result).toEqual({
      mounted: true,
      output,
      target,
    });
    expect(findLatestRendererMemoryMountRecord(routing.memoryAdapter.store, {
      outputName: output.name,
      targetName: target.name,
    })).toEqual({
      outputName: output.name,
      outputKind: output.kind,
      targetName: target.name,
      content: output.content,
    });
    expect(routing.domAdapter.store.records).toEqual([]);
  });

  it("mounts surface targets through the unified target mount flow", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const output = createRendererOutput({
      kind: "document",
      name: "preview-document",
      content: "<main>Atlas surface</main>",
    });
    const target = createRendererTarget({
      kind: "surface",
      name: "preview-surface",
      identifier: "atlas-root",
    });

    const result = await executeRendererTargetMount({
      output,
      target,
      registry: routing.registry,
    });

    expect(result).toEqual({
      mounted: true,
      output,
      target,
    });
    expect(findLatestRendererDomMountRecord(routing.domAdapter.store, {
      outputName: output.name,
      targetName: target.name,
      elementId: target.identifier,
    })).toEqual({
      outputName: output.name,
      outputKind: output.kind,
      targetName: target.name,
      elementId: target.identifier,
      html: output.content,
    });
    expect(routing.memoryAdapter.store.records).toEqual([]);
  });

  it("returns mount failures when unified routing cannot find an adapter", async () => {
    const output = createRendererOutput({
      kind: "fragment",
      name: "orphan-fragment",
    });
    const target = createRendererTarget({
      kind: "memory",
      name: "orphan-cache",
    });

    const result = await executeRendererTargetMount({
      output,
      target,
      registry: createRendererAdapterRegistry([]),
    });

    expect(result).toEqual({
      mounted: false,
      output,
      target,
      error: "Renderer mount adapter renderer.memory was not found.",
    });
  });

  it("returns mount failures for surface targets without identifiers", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const output = createRendererOutput({
      kind: "fragment",
      name: "invalid-surface-fragment",
    });
    const target = createRendererTarget({
      kind: "surface",
      name: "invalid-surface",
    });

    const result = await executeRendererTargetMount({
      output,
      target,
      registry: routing.registry,
    });

    expect(result).toEqual({
      mounted: false,
      output,
      target,
      error: "Renderer surface targets require identifiers before adapter routing.",
    });
    expect(routing.memoryAdapter.store.records).toEqual([]);
    expect(routing.domAdapter.store.records).toEqual([]);
  });

  it("reports successful memory mounts through lifecycle records", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const output = createRendererOutput({
      kind: "fragment",
      name: "reported-memory-fragment",
      content: "reported content",
    });
    const target = createRendererTarget({
      kind: "memory",
      name: "reported-memory-cache",
    });

    const execution = await executeRendererTargetMountWithReport({
      output,
      target,
      registry: routing.registry,
    });

    expect(execution.result.mounted).toBe(true);
    expect(execution.lifecycleRecord.state).toBe("reported");
    expect(execution.lifecycleRecord.result).toBe(execution.result);
    expect(execution.lifecycleRecord.report).toBe(execution.diagnosticReport);
    expect(execution.diagnosticReport).toEqual({
      context: {
        component: "renderer.mount",
      },
      result: {
        ok: true,
        issues: [],
      },
    });
    expect(execution.report).toEqual({
      state: "reported",
      planName: "target:reported-memory-fragment->reported-memory-cache",
      strategy: "adapter",
      outputName: output.name,
      targetName: target.name,
      qualityGates: ["request", "output", "target", "diagnostics"],
      planned: false,
      executed: false,
      reported: true,
      issueCount: 0,
      issues: [],
      mounted: true,
      diagnosticsOk: true,
    });
  });

  it("reports successful DOM mounts through lifecycle records", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const output = createRendererOutput({
      kind: "document",
      name: "reported-dom-document",
      content: "<section>Reported DOM</section>",
    });
    const target = createRendererTarget({
      kind: "surface",
      name: "reported-dom-surface",
      identifier: "reported-dom-root",
    });

    const execution = await executeRendererTargetMountWithReport({
      output,
      target,
      registry: routing.registry,
    });

    expect(execution.result).toEqual({
      mounted: true,
      output,
      target,
    });
    expect(execution.report.mounted).toBe(true);
    expect(execution.report.diagnosticsOk).toBe(true);
    expect(execution.report.planName).toBe(
      "target:reported-dom-document->reported-dom-surface",
    );
    expect(findLatestRendererDomMountRecord(routing.domAdapter.store, {
      outputName: output.name,
      targetName: target.name,
      elementId: target.identifier,
    })?.html).toBe(output.content);
  });

  it("reports missing adapter failures through diagnostics", async () => {
    const output = createRendererOutput({
      kind: "fragment",
      name: "missing-adapter-fragment",
    });
    const target = createRendererTarget({
      kind: "memory",
      name: "missing-adapter-cache",
    });

    const execution = await executeRendererTargetMountWithReport({
      output,
      target,
      registry: createRendererAdapterRegistry([]),
    });

    expect(execution.result.mounted).toBe(false);
    expect(execution.diagnosticReport.result).toEqual({
      ok: false,
      issues: [{
        code: "renderer.mount.failed",
        message: "Renderer mount adapter renderer.memory was not found.",
        severity: "error",
      }],
    });
    expect(execution.report).toMatchObject({
      state: "reported",
      mounted: false,
      diagnosticsOk: false,
      issueCount: 1,
    });
  });

  it("reports invalid surface targets through diagnostics without store mutation", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const output = createRendererOutput({
      kind: "fragment",
      name: "reported-invalid-surface-fragment",
    });
    const target = createRendererTarget({
      kind: "surface",
      name: "reported-invalid-surface",
    });

    const execution = await executeRendererTargetMountWithReport({
      output,
      target,
      registry: routing.registry,
    });

    expect(execution.result.error).toBe(
      "Renderer surface targets require identifiers before adapter routing.",
    );
    expect(execution.report).toMatchObject({
      state: "reported",
      mounted: false,
      diagnosticsOk: false,
      issueCount: 1,
    });
    expect(routing.memoryAdapter.store.records).toEqual([]);
    expect(routing.domAdapter.store.records).toEqual([]);
  });

  it("executes empty target mount batches with an empty summary", async () => {
    const execution = await executeRendererTargetMountBatch({
      requests: [],
    });

    expect(execution).toEqual({
      executions: [],
      lifecycleRecords: [],
      reports: [],
      summary: {
        total: 0,
        planned: 0,
        executed: 0,
        reported: 0,
        mounted: 0,
        diagnosticsOk: 0,
        failed: 0,
        issueCount: 0,
      },
    });
  });

  it("executes mixed Memory and DOM target mount batches through one registry", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const memoryOutput = createRendererOutput({
      kind: "fragment",
      name: "batch-memory-fragment",
      content: "batch memory",
    });
    const domOutput = createRendererOutput({
      kind: "document",
      name: "batch-dom-document",
      content: "<article>batch dom</article>",
    });
    const memoryTarget = createRendererTarget({
      kind: "memory",
      name: "batch-memory-cache",
    });
    const domTarget = createRendererTarget({
      kind: "surface",
      name: "batch-dom-surface",
      identifier: "batch-dom-root",
    });

    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: memoryOutput,
        target: memoryTarget,
      }, {
        output: domOutput,
        target: domTarget,
      }],
    });

    expect(execution.summary).toEqual({
      total: 2,
      planned: 0,
      executed: 0,
      reported: 2,
      mounted: 2,
      diagnosticsOk: 2,
      failed: 0,
      issueCount: 0,
    });
    expect(routing.memoryAdapter.store.records).toHaveLength(1);
    expect(routing.domAdapter.store.records).toHaveLength(1);
  });

  it("keeps target mount batch execution order stable", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const first = createRendererOutput({
      kind: "fragment",
      name: "batch-first",
    });
    const second = createRendererOutput({
      kind: "fragment",
      name: "batch-second",
    });
    const target = createRendererTarget({
      kind: "memory",
      name: "ordered-cache",
    });

    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: first,
        target,
      }, {
        output: second,
        target,
      }],
    });

    expect(execution.reports.map(report => report.outputName)).toEqual([
      "batch-first",
      "batch-second",
    ]);
    expect(routing.memoryAdapter.store.records.map(record => record.outputName)).toEqual([
      "batch-first",
      "batch-second",
    ]);
  });

  it("continues target mount batches after routable failure results", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const invalidSurfaceOutput = createRendererOutput({
      kind: "fragment",
      name: "batch-invalid-surface",
    });
    const validMemoryOutput = createRendererOutput({
      kind: "fragment",
      name: "batch-valid-memory",
      content: "still mounted",
    });

    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: invalidSurfaceOutput,
        target: createRendererTarget({
          kind: "surface",
          name: "batch-invalid-surface-target",
        }),
      }, {
        output: validMemoryOutput,
        target: createRendererTarget({
          kind: "memory",
          name: "batch-valid-memory-target",
        }),
      }],
    });

    expect(execution.summary).toEqual({
      total: 2,
      planned: 0,
      executed: 0,
      reported: 2,
      mounted: 1,
      diagnosticsOk: 1,
      failed: 1,
      issueCount: 1,
    });
    expect(execution.executions.map(item => item.result.mounted)).toEqual([false, true]);
    expect(routing.memoryAdapter.store.records).toHaveLength(1);
    expect(routing.domAdapter.store.records).toEqual([]);
  });

  it("allows target mount batch entries to override the batch registry", async () => {
    const batchRouting = createDefaultRendererMountAdapterRegistry();
    const entryRouting = createDefaultRendererMountAdapterRegistry();
    const output = createRendererOutput({
      kind: "fragment",
      name: "batch-override-memory",
      content: "override",
    });
    const target = createRendererTarget({
      kind: "memory",
      name: "batch-override-target",
    });

    const execution = await executeRendererTargetMountBatch({
      registry: batchRouting.registry,
      requests: [{
        output,
        target,
        registry: entryRouting.registry,
      }],
    });

    expect(execution.summary.mounted).toBe(1);
    expect(batchRouting.memoryAdapter.store.records).toEqual([]);
    expect(entryRouting.memoryAdapter.store.records).toHaveLength(1);
  });

  it("consumes all reports from target mount batches", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "consume-all-memory",
        }),
        target: createRendererTarget({
          kind: "memory",
          name: "consume-all-cache",
        }),
      }],
    });

    const consumption = consumeRendererTargetMountBatchReports({
      execution,
    });

    expect(consumption.reports).toEqual(execution.reports);
    expect(consumption.summary).toEqual(execution.summary);
  });

  it("filters mounted reports from target mount batches", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "consume-mounted-success",
        }),
        target: createRendererTarget({
          kind: "memory",
          name: "consume-mounted-cache",
        }),
      }, {
        output: createRendererOutput({
          kind: "fragment",
          name: "consume-mounted-failure",
        }),
        target: createRendererTarget({
          kind: "surface",
          name: "consume-mounted-invalid-surface",
        }),
      }],
    });

    const consumption = consumeRendererTargetMountBatchReports({
      execution,
      filter: {
        mounted: true,
      },
    });

    expect(consumption.reports.map(report => report.outputName)).toEqual([
      "consume-mounted-success",
    ]);
    expect(consumption.summary).toEqual({
      total: 1,
      planned: 0,
      executed: 0,
      reported: 1,
      mounted: 1,
      diagnosticsOk: 1,
      failed: 0,
      issueCount: 0,
    });
  });

  it("filters failed diagnostics from target mount batches", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "consume-failed-success",
        }),
        target: createRendererTarget({
          kind: "memory",
          name: "consume-failed-cache",
        }),
      }, {
        output: createRendererOutput({
          kind: "fragment",
          name: "consume-failed-invalid",
        }),
        target: createRendererTarget({
          kind: "surface",
          name: "consume-failed-surface",
        }),
      }],
    });

    const consumption = consumeRendererTargetMountBatchReports({
      execution,
      filter: {
        diagnosticsOk: false,
      },
    });

    expect(consumption.reports.map(report => report.outputName)).toEqual([
      "consume-failed-invalid",
    ]);
    expect(consumption.summary.failed).toBe(1);
    expect(consumption.summary.issueCount).toBe(1);
  });

  it("finds failed target mount batch executions by reference", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "find-failure-invalid",
        }),
        target: createRendererTarget({
          kind: "surface",
          name: "find-failure-surface",
        }),
      }, {
        output: createRendererOutput({
          kind: "fragment",
          name: "find-failure-valid",
        }),
        target: createRendererTarget({
          kind: "memory",
          name: "find-failure-cache",
        }),
      }],
    });

    const failures = findRendererTargetMountBatchFailures(execution);

    expect(failures).toEqual([execution.executions[0]]);
    expect(failures[0]?.report.outputName).toBe("find-failure-invalid");
  });

  it("reports no failed target mount batch executions for successful batches", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "no-failure-memory",
        }),
        target: createRendererTarget({
          kind: "memory",
          name: "no-failure-cache",
        }),
      }],
    });

    expect(findRendererTargetMountBatchFailures(execution)).toEqual([]);
  });

  it("closes successful target mount batch diagnostics as ready", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "closure-ready-memory",
        }),
        target: createRendererTarget({
          kind: "memory",
          name: "closure-ready-cache",
        }),
      }, {
        output: createRendererOutput({
          kind: "document",
          name: "closure-ready-dom",
        }),
        target: createRendererTarget({
          kind: "surface",
          name: "closure-ready-surface",
          identifier: "closure-ready-root",
        }),
      }],
    });

    const closure = closeRendererTargetMountBatchDiagnostics(execution);

    expect(closure).toEqual({
      execution,
      summary: execution.summary,
      failures: [],
      ready: true,
      blocked: false,
      totalCount: 2,
      mountedCount: 2,
      failureCount: 0,
      issueCount: 0,
    });
  });

  it("closes mixed target mount batch diagnostics as blocked", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "closure-blocked-invalid",
        }),
        target: createRendererTarget({
          kind: "surface",
          name: "closure-blocked-surface",
        }),
      }, {
        output: createRendererOutput({
          kind: "fragment",
          name: "closure-blocked-valid",
        }),
        target: createRendererTarget({
          kind: "memory",
          name: "closure-blocked-cache",
        }),
      }],
    });

    const closure = closeRendererTargetMountBatchDiagnostics(execution);

    expect(closure.ready).toBe(false);
    expect(closure.blocked).toBe(true);
    expect(closure.totalCount).toBe(2);
    expect(closure.mountedCount).toBe(1);
    expect(closure.failureCount).toBe(1);
    expect(closure.issueCount).toBe(1);
    expect(closure.failures).toEqual([execution.executions[0]]);
  });

  it("closes empty target mount batch diagnostics as blocked", async () => {
    const execution = await executeRendererTargetMountBatch({
      requests: [],
    });

    const closure = closeRendererTargetMountBatchDiagnostics(execution);

    expect(closure).toEqual({
      execution,
      summary: execution.summary,
      failures: [],
      ready: false,
      blocked: true,
      totalCount: 0,
      mountedCount: 0,
      failureCount: 0,
      issueCount: 0,
    });
  });

  it("snapshots ready target mount batch diagnostics without failure names", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "snapshot-ready-memory",
        }),
        target: createRendererTarget({
          kind: "memory",
          name: "snapshot-ready-cache",
        }),
      }],
    });
    const closure = closeRendererTargetMountBatchDiagnostics(execution);

    expect(snapshotRendererTargetMountBatchDiagnostics(closure)).toEqual({
      ready: true,
      blocked: false,
      totalCount: 1,
      mountedCount: 1,
      failureCount: 0,
      issueCount: 0,
      failedOutputNames: [],
      failedTargetNames: [],
    });
  });

  it("snapshots blocked target mount batch diagnostics with failure names", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "snapshot-blocked-invalid",
        }),
        target: createRendererTarget({
          kind: "surface",
          name: "snapshot-blocked-surface",
        }),
      }, {
        output: createRendererOutput({
          kind: "fragment",
          name: "snapshot-blocked-valid",
        }),
        target: createRendererTarget({
          kind: "memory",
          name: "snapshot-blocked-cache",
        }),
      }],
    });
    const closure = closeRendererTargetMountBatchDiagnostics(execution);

    expect(snapshotRendererTargetMountBatchDiagnostics(closure)).toEqual({
      ready: false,
      blocked: true,
      totalCount: 2,
      mountedCount: 1,
      failureCount: 1,
      issueCount: 1,
      failedOutputNames: ["snapshot-blocked-invalid"],
      failedTargetNames: ["snapshot-blocked-surface"],
    });
  });

  it("snapshots empty target mount batch diagnostics as blocked", async () => {
    const execution = await executeRendererTargetMountBatch({
      requests: [],
    });
    const closure = closeRendererTargetMountBatchDiagnostics(execution);

    expect(snapshotRendererTargetMountBatchDiagnostics(closure)).toEqual({
      ready: false,
      blocked: true,
      totalCount: 0,
      mountedCount: 0,
      failureCount: 0,
      issueCount: 0,
      failedOutputNames: [],
      failedTargetNames: [],
    });
  });

  it("hands off ready target mount batch diagnostics as transferable", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "handoff-ready-memory",
        }),
        target: createRendererTarget({
          kind: "memory",
          name: "handoff-ready-cache",
        }),
      }],
    });
    const closure = closeRendererTargetMountBatchDiagnostics(execution);

    const handoff = handoffRendererTargetMountBatchDiagnostics(closure);

    expect(handoff.closure).toBe(closure);
    expect(handoff.ready).toBe(true);
    expect(handoff.blocked).toBe(false);
    expect(handoff.transferable).toBe(true);
    expect(handoff.snapshot.ready).toBe(true);
  });

  it("hands off blocked target mount batch diagnostics as not transferable", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "handoff-blocked-invalid",
        }),
        target: createRendererTarget({
          kind: "surface",
          name: "handoff-blocked-surface",
        }),
      }],
    });
    const closure = closeRendererTargetMountBatchDiagnostics(execution);

    const handoff = handoffRendererTargetMountBatchDiagnostics(closure);

    expect(handoff.closure).toBe(closure);
    expect(handoff.ready).toBe(false);
    expect(handoff.blocked).toBe(true);
    expect(handoff.transferable).toBe(false);
    expect(handoff.snapshot.failedOutputNames).toEqual(["handoff-blocked-invalid"]);
  });

  it("creates empty target mount batch diagnostic catalogs", () => {
    expect(createRendererTargetMountBatchDiagnosticCatalog([])).toEqual({
      handoffs: [],
      summary: {
        handoffCount: 0,
        readyCount: 0,
        blockedCount: 0,
        transferableCount: 0,
      },
    });
  });

  it("summarizes mixed target mount batch diagnostic catalogs", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const readyExecution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "catalog-ready-memory",
        }),
        target: createRendererTarget({
          kind: "memory",
          name: "catalog-ready-cache",
        }),
      }],
    });
    const blockedExecution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "catalog-blocked-invalid",
        }),
        target: createRendererTarget({
          kind: "surface",
          name: "catalog-blocked-surface",
        }),
      }],
    });
    const readyHandoff = handoffRendererTargetMountBatchDiagnostics(
      closeRendererTargetMountBatchDiagnostics(readyExecution),
    );
    const blockedHandoff = handoffRendererTargetMountBatchDiagnostics(
      closeRendererTargetMountBatchDiagnostics(blockedExecution),
    );

    const catalog = createRendererTargetMountBatchDiagnosticCatalog([
      readyHandoff,
      blockedHandoff,
    ]);

    expect(catalog.summary).toEqual({
      handoffCount: 2,
      readyCount: 1,
      blockedCount: 1,
      transferableCount: 1,
    });
    expect(catalog.handoffs).toEqual([readyHandoff, blockedHandoff]);
  });

  it("keeps target mount batch diagnostic catalog handoff references", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "catalog-reference-memory",
        }),
        target: createRendererTarget({
          kind: "memory",
          name: "catalog-reference-cache",
        }),
      }],
    });
    const handoff = handoffRendererTargetMountBatchDiagnostics(
      closeRendererTargetMountBatchDiagnostics(execution),
    );

    const catalog = createRendererTargetMountBatchDiagnosticCatalog([handoff]);

    expect(catalog.handoffs[0]).toBe(handoff);
  });

  it("keeps target mount batch diagnostic catalogs independent from source arrays", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const readyExecution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "catalog-copy-ready",
        }),
        target: createRendererTarget({
          kind: "memory",
          name: "catalog-copy-cache",
        }),
      }],
    });
    const blockedExecution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "catalog-copy-blocked",
        }),
        target: createRendererTarget({
          kind: "surface",
          name: "catalog-copy-surface",
        }),
      }],
    });
    const readyHandoff = handoffRendererTargetMountBatchDiagnostics(
      closeRendererTargetMountBatchDiagnostics(readyExecution),
    );
    const blockedHandoff = handoffRendererTargetMountBatchDiagnostics(
      closeRendererTargetMountBatchDiagnostics(blockedExecution),
    );
    const handoffs = [readyHandoff];

    const catalog = createRendererTargetMountBatchDiagnosticCatalog(handoffs);
    handoffs.push(blockedHandoff);

    expect(catalog.handoffs).toEqual([readyHandoff]);
    expect(catalog.summary).toEqual({
      handoffCount: 1,
      readyCount: 1,
      blockedCount: 0,
      transferableCount: 1,
    });
  });

  it("snapshots ready target mount batch diagnostic catalogs", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "catalog-snapshot-ready",
        }),
        target: createRendererTarget({
          kind: "memory",
          name: "catalog-snapshot-cache",
        }),
      }],
    });
    const handoff = handoffRendererTargetMountBatchDiagnostics(
      closeRendererTargetMountBatchDiagnostics(execution),
    );
    const catalog = createRendererTargetMountBatchDiagnosticCatalog([handoff]);

    expect(snapshotRendererTargetMountBatchDiagnosticCatalog(catalog)).toEqual({
      handoffCount: 1,
      readyCount: 1,
      blockedCount: 0,
      transferableCount: 1,
      ready: true,
      blocked: false,
    });
  });

  it("snapshots blocked target mount batch diagnostic catalogs", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "catalog-snapshot-blocked",
        }),
        target: createRendererTarget({
          kind: "surface",
          name: "catalog-snapshot-surface",
        }),
      }],
    });
    const handoff = handoffRendererTargetMountBatchDiagnostics(
      closeRendererTargetMountBatchDiagnostics(execution),
    );
    const catalog = createRendererTargetMountBatchDiagnosticCatalog([handoff]);

    expect(snapshotRendererTargetMountBatchDiagnosticCatalog(catalog)).toEqual({
      handoffCount: 1,
      readyCount: 0,
      blockedCount: 1,
      transferableCount: 0,
      ready: false,
      blocked: true,
    });
  });

  it("snapshots empty target mount batch diagnostic catalogs as blocked", () => {
    const catalog = createRendererTargetMountBatchDiagnosticCatalog([]);

    expect(snapshotRendererTargetMountBatchDiagnosticCatalog(catalog)).toEqual({
      handoffCount: 0,
      readyCount: 0,
      blockedCount: 0,
      transferableCount: 0,
      ready: false,
      blocked: true,
    });
  });

  it("exports ready target mount batch diagnostic catalogs", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "catalog-export-ready",
        }),
        target: createRendererTarget({
          kind: "memory",
          name: "catalog-export-cache",
        }),
      }],
    });
    const catalog = createRendererTargetMountBatchDiagnosticCatalog([
      handoffRendererTargetMountBatchDiagnostics(
        closeRendererTargetMountBatchDiagnostics(execution),
      ),
    ]);

    const exported = exportRendererTargetMountBatchDiagnosticCatalog(catalog);

    expect(exported.catalog).toBe(catalog);
    expect(exported.ready).toBe(true);
    expect(exported.exportable).toBe(true);
    expect(exported.snapshot.ready).toBe(true);
  });

  it("exports blocked target mount batch diagnostic catalogs as not exportable", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "catalog-export-blocked",
        }),
        target: createRendererTarget({
          kind: "surface",
          name: "catalog-export-surface",
        }),
      }],
    });
    const catalog = createRendererTargetMountBatchDiagnosticCatalog([
      handoffRendererTargetMountBatchDiagnostics(
        closeRendererTargetMountBatchDiagnostics(execution),
      ),
    ]);

    const exported = exportRendererTargetMountBatchDiagnosticCatalog(catalog);

    expect(exported.catalog).toBe(catalog);
    expect(exported.ready).toBe(false);
    expect(exported.exportable).toBe(false);
    expect(exported.snapshot.blocked).toBe(true);
  });

  it("reviews ready target mount integration exports as ready", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "readiness-ready-memory",
        }),
        target: createRendererTarget({
          kind: "memory",
          name: "readiness-ready-cache",
        }),
      }],
    });
    const catalog = createRendererTargetMountBatchDiagnosticCatalog([
      handoffRendererTargetMountBatchDiagnostics(
        closeRendererTargetMountBatchDiagnostics(execution),
      ),
    ]);

    const readiness = reviewRendererTargetMountIntegrationReadiness(
      exportRendererTargetMountBatchDiagnosticCatalog(catalog),
    );

    expect(readiness).toEqual({
      export: expect.any(Object),
      ready: true,
      blocked: false,
      exportable: true,
      handoffCount: 1,
      readyCount: 1,
      blockedCount: 0,
      transferableCount: 1,
      issues: [],
    });
  });

  it("reviews blocked target mount integration exports as blocked", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "readiness-blocked-invalid",
        }),
        target: createRendererTarget({
          kind: "surface",
          name: "readiness-blocked-surface",
        }),
      }],
    });
    const catalog = createRendererTargetMountBatchDiagnosticCatalog([
      handoffRendererTargetMountBatchDiagnostics(
        closeRendererTargetMountBatchDiagnostics(execution),
      ),
    ]);

    const readiness = reviewRendererTargetMountIntegrationReadiness(
      exportRendererTargetMountBatchDiagnosticCatalog(catalog),
    );

    expect(readiness.ready).toBe(false);
    expect(readiness.blocked).toBe(true);
    expect(readiness.exportable).toBe(false);
    expect(readiness.blockedCount).toBe(1);
    expect(readiness.issues).toEqual([{
      code: "renderer.target.mount.integration.blocked",
      message: "Renderer target mount integration has blocked diagnostic handoffs.",
      severity: "error",
    }, {
      code: "renderer.target.mount.integration.not_exportable",
      message: "Renderer target mount integration export is not exportable.",
      severity: "error",
    }]);
  });

  it("reviews empty target mount integration exports as blocked", () => {
    const catalog = createRendererTargetMountBatchDiagnosticCatalog([]);

    const readiness = reviewRendererTargetMountIntegrationReadiness(
      exportRendererTargetMountBatchDiagnosticCatalog(catalog),
    );

    expect(readiness).toEqual({
      export: expect.any(Object),
      ready: false,
      blocked: true,
      exportable: false,
      handoffCount: 0,
      readyCount: 0,
      blockedCount: 0,
      transferableCount: 0,
      issues: [{
        code: "renderer.target.mount.integration.empty",
        message: "Renderer target mount integration has no diagnostic handoffs.",
        severity: "error",
      }, {
        code: "renderer.target.mount.integration.not_exportable",
        message: "Renderer target mount integration export is not exportable.",
        severity: "error",
      }],
    });
  });

  it("snapshots ready target mount integration readiness", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "readiness-snapshot-ready",
        }),
        target: createRendererTarget({
          kind: "memory",
          name: "readiness-snapshot-cache",
        }),
      }],
    });
    const readiness = reviewRendererTargetMountIntegrationReadiness(
      exportRendererTargetMountBatchDiagnosticCatalog(
        createRendererTargetMountBatchDiagnosticCatalog([
          handoffRendererTargetMountBatchDiagnostics(
            closeRendererTargetMountBatchDiagnostics(execution),
          ),
        ]),
      ),
    );

    expect(snapshotRendererTargetMountIntegrationReadiness(readiness)).toEqual({
      ready: true,
      blocked: false,
      exportable: true,
      handoffCount: 1,
      readyCount: 1,
      blockedCount: 0,
      transferableCount: 1,
      issueCount: 0,
      issueCodes: [],
    });
  });

  it("snapshots blocked target mount integration readiness with issue codes", () => {
    const readiness = reviewRendererTargetMountIntegrationReadiness(
      exportRendererTargetMountBatchDiagnosticCatalog(
        createRendererTargetMountBatchDiagnosticCatalog([]),
      ),
    );

    expect(snapshotRendererTargetMountIntegrationReadiness(readiness)).toEqual({
      ready: false,
      blocked: true,
      exportable: false,
      handoffCount: 0,
      readyCount: 0,
      blockedCount: 0,
      transferableCount: 0,
      issueCount: 2,
      issueCodes: [
        "renderer.target.mount.integration.empty",
        "renderer.target.mount.integration.not_exportable",
      ],
    });
  });

  it("hands off ready target mount integration readiness as transferable", async () => {
    const routing = createDefaultRendererMountAdapterRegistry();
    const execution = await executeRendererTargetMountBatch({
      registry: routing.registry,
      requests: [{
        output: createRendererOutput({
          kind: "fragment",
          name: "readiness-handoff-ready",
        }),
        target: createRendererTarget({
          kind: "memory",
          name: "readiness-handoff-cache",
        }),
      }],
    });
    const readiness = reviewRendererTargetMountIntegrationReadiness(
      exportRendererTargetMountBatchDiagnosticCatalog(
        createRendererTargetMountBatchDiagnosticCatalog([
          handoffRendererTargetMountBatchDiagnostics(
            closeRendererTargetMountBatchDiagnostics(execution),
          ),
        ]),
      ),
    );

    const handoff = handoffRendererTargetMountIntegrationReadiness(readiness);

    expect(handoff.readiness).toBe(readiness);
    expect(handoff.ready).toBe(true);
    expect(handoff.blocked).toBe(false);
    expect(handoff.transferable).toBe(true);
    expect(handoff.snapshot.ready).toBe(true);
  });

  it("hands off blocked target mount integration readiness as not transferable", () => {
    const readiness = reviewRendererTargetMountIntegrationReadiness(
      exportRendererTargetMountBatchDiagnosticCatalog(
        createRendererTargetMountBatchDiagnosticCatalog([]),
      ),
    );

    const handoff = handoffRendererTargetMountIntegrationReadiness(readiness);

    expect(handoff.readiness).toBe(readiness);
    expect(handoff.ready).toBe(false);
    expect(handoff.blocked).toBe(true);
    expect(handoff.transferable).toBe(false);
    expect(handoff.snapshot.issueCount).toBe(2);
  });

  it("catalogs target mount integration readiness handoffs", () => {
    const blocked = handoffRendererTargetMountIntegrationReadiness(
      reviewRendererTargetMountIntegrationReadiness(
        exportRendererTargetMountBatchDiagnosticCatalog(
          createRendererTargetMountBatchDiagnosticCatalog([]),
        ),
      ),
    );
    const ready = {
      ...blocked,
      snapshot: { ...blocked.snapshot, ready: true, blocked: false, issueCount: 0, issueCodes: [] },
      ready: true,
      blocked: false,
      transferable: true,
    };
    const handoffs = [ready, blocked];
    const catalog = createRendererTargetMountIntegrationReadinessCatalog(handoffs);

    handoffs.pop();

    expect(catalog.handoffs).toEqual([ready, blocked]);
    expect(catalog.handoffs[0]).toBe(ready);
    expect(catalog.summary).toEqual({
      handoffCount: 2,
      readyCount: 1,
      blockedCount: 1,
      transferableCount: 1,
      issueCount: 2,
    });
  });

  it("snapshots and exports target mount integration readiness catalogs", () => {
    const catalog = createRendererTargetMountIntegrationReadinessCatalog([]);

    expect(snapshotRendererTargetMountIntegrationReadinessCatalog(catalog)).toEqual({
      handoffCount: 0,
      readyCount: 0,
      blockedCount: 0,
      transferableCount: 0,
      issueCount: 0,
      ready: false,
      blocked: true,
    });

    const exported = exportRendererTargetMountIntegrationReadinessCatalog(catalog);

    expect(exported.catalog).toBe(catalog);
    expect(exported.exportable).toBe(false);
    expect(exported.snapshot.blocked).toBe(true);
  });

  it("filters target mount integration readiness handoffs", () => {
    const blocked = handoffRendererTargetMountIntegrationReadiness(
      reviewRendererTargetMountIntegrationReadiness(
        exportRendererTargetMountBatchDiagnosticCatalog(
          createRendererTargetMountBatchDiagnosticCatalog([]),
        ),
      ),
    );
    const catalog = createRendererTargetMountIntegrationReadinessCatalog([blocked]);

    expect(findRendererTargetMountIntegrationReadinessHandoffs(catalog, {
      blocked: true,
      issueCode: "renderer.target.mount.integration.empty",
    })).toEqual([blocked]);
    expect(findRendererTargetMountIntegrationReadinessHandoffs(catalog, {
      ready: true,
    })).toEqual([]);
  });

  it("summarizes target mount integration readiness for dashboard status", () => {
    const emptyCatalog = createRendererTargetMountIntegrationReadinessCatalog([]);

    expect(summarizeRendererTargetMountIntegrationStatus(
      exportRendererTargetMountIntegrationReadinessCatalog(emptyCatalog),
    )).toEqual({
      state: "empty",
      handoffCount: 0,
      readyCount: 0,
      blockedCount: 0,
      transferableCount: 0,
      issueCount: 0,
      ready: false,
      blocked: true,
      exportable: false,
    });
  });

  it("records target mount integration status histories without mutating source arrays", () => {
    const entries = [{
      state: "empty" as const,
      handoffCount: 0,
      readyCount: 0,
      blockedCount: 0,
      transferableCount: 0,
      issueCount: 0,
      ready: false,
      blocked: true,
      exportable: false,
    }];
    const history = createRendererTargetMountIntegrationStatusHistory(entries);

    expect(history.entries[0]).toBe(entries[0]);

    entries.pop();

    expect(history.entries).toHaveLength(1);
  });

  it("appends target mount integration statuses persistently", () => {
    const history = createRendererTargetMountIntegrationStatusHistory();
    const entry = {
      state: "ready" as const,
      handoffCount: 1,
      readyCount: 1,
      blockedCount: 0,
      transferableCount: 1,
      issueCount: 0,
      ready: true,
      blocked: false,
      exportable: true,
    };

    const nextHistory = appendRendererTargetMountIntegrationStatusHistory(history, entry);

    expect(history.entries).toEqual([]);
    expect(nextHistory.entries).toEqual([entry]);
    expect(nextHistory.entries[0]).toBe(entry);
  });

  it("snapshots and exports target mount integration status histories", () => {
    const history = createRendererTargetMountIntegrationStatusHistory([{
      state: "blocked",
      handoffCount: 1,
      readyCount: 0,
      blockedCount: 1,
      transferableCount: 0,
      issueCount: 2,
      ready: false,
      blocked: true,
      exportable: false,
    }]);

    expect(snapshotRendererTargetMountIntegrationStatusHistory(history)).toEqual({
      entryCount: 1,
      readyCount: 0,
      blockedCount: 1,
      emptyCount: 0,
      latestState: "blocked",
    });
    expect(exportRendererTargetMountIntegrationStatusHistory(history)).toEqual({
      history,
      snapshot: expect.any(Object),
      exportable: true,
    });
  });

  it("filters target mount integration status history entries by state", () => {
    const ready = {
      state: "ready" as const,
      handoffCount: 1,
      readyCount: 1,
      blockedCount: 0,
      transferableCount: 1,
      issueCount: 0,
      ready: true,
      blocked: false,
      exportable: true,
    };
    const history = createRendererTargetMountIntegrationStatusHistory([ready]);

    expect(findRendererTargetMountIntegrationStatusHistoryEntries(history, "ready")).toEqual([ready]);
    expect(findRendererTargetMountIntegrationStatusHistoryEntries(history, "blocked")).toEqual([]);
  });
});
