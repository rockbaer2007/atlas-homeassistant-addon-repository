import { describe, expect, it } from "vitest";

import {
  clearRendererMemoryMountStore,
  executeRendererMemoryMountPlan,
  createRendererMemoryMountAdapter,
  createRendererMemoryMountPlan,
  createRendererMountRequest,
  createRendererOutput,
  createRendererTarget,
  findLatestRendererMemoryMountRecord,
  findRendererMemoryMountRecords,
  inspectRendererMemoryMountResult,
  summarizeRendererMemoryMountStore,
} from "../src";

describe("renderer memory mounting", () => {
  it("mounts Renderer output into a memory target", () => {
    const adapter = createRendererMemoryMountAdapter("memory");
    const output = createRendererOutput({
      kind: "fragment",
      name: "welcome-fragment",
      content: "<h1>Welcome</h1>",
    });
    const target = createRendererTarget({
      kind: "memory",
      name: "preview",
      identifier: "preview-root",
    });

    const result = adapter.mount(createRendererMountRequest({
      output,
      target,
    }));

    expect(result).toEqual({
      mounted: true,
      output,
      target,
    });
    expect(adapter.store.records).toEqual([{
      outputName: "welcome-fragment",
      outputKind: "fragment",
      targetName: "preview",
      targetIdentifier: "preview-root",
      content: "<h1>Welcome</h1>",
    }]);
  });

  it("preserves empty Renderer output content in memory records", () => {
    const adapter = createRendererMemoryMountAdapter("memory");
    const output = createRendererOutput({
      kind: "document",
      name: "empty-document",
    });
    const target = createRendererTarget({
      kind: "memory",
      name: "empty-preview",
    });

    adapter.mount(createRendererMountRequest({
      output,
      target,
    }));

    expect(adapter.store.records[0]).toEqual({
      outputName: "empty-document",
      outputKind: "document",
      targetName: "empty-preview",
      content: "",
    });
  });

  it("rejects non-memory targets without mutating the memory store", () => {
    const adapter = createRendererMemoryMountAdapter("memory");
    const output = createRendererOutput({
      kind: "fragment",
      name: "surface-fragment",
      content: "<p>Surface</p>",
    });
    const target = createRendererTarget({
      kind: "surface",
      name: "surface-preview",
    });

    const result = adapter.mount(createRendererMountRequest({
      output,
      target,
    }));

    expect(result).toEqual({
      mounted: false,
      output,
      target,
      error: "Renderer memory adapter cannot mount to surface targets",
    });
    expect(adapter.store.records).toEqual([]);
  });

  it("copies initial memory store records before mounting", () => {
    const seedRecords = [{
      outputName: "seed",
      outputKind: "fragment" as const,
      targetName: "seed-target",
      content: "seed-content",
    }];
    const adapter = createRendererMemoryMountAdapter("memory", {
      records: seedRecords,
    });

    seedRecords.push({
      outputName: "late",
      outputKind: "document",
      targetName: "late-target",
      content: "late-content",
    });

    expect(adapter.store.records).toEqual([{
      outputName: "seed",
      outputKind: "fragment",
      targetName: "seed-target",
      content: "seed-content",
    }]);
  });

  it("finds memory mount records by output and target metadata", () => {
    const adapter = createRendererMemoryMountAdapter("memory", {
      records: [{
        outputName: "first",
        outputKind: "fragment",
        targetName: "preview",
        targetIdentifier: "preview-root",
        content: "first-content",
      }, {
        outputName: "second",
        outputKind: "document",
        targetName: "preview",
        content: "second-content",
      }],
    });

    expect(findRendererMemoryMountRecords(adapter.store, {
      targetName: "preview",
      targetIdentifier: "preview-root",
    })).toEqual([{
      outputName: "first",
      outputKind: "fragment",
      targetName: "preview",
      targetIdentifier: "preview-root",
      content: "first-content",
    }]);
    expect(findRendererMemoryMountRecords(adapter.store, {
      outputName: "missing",
    })).toEqual([]);
  });

  it("summarizes memory mount store records", () => {
    const adapter = createRendererMemoryMountAdapter("memory", {
      records: [{
        outputName: "first",
        outputKind: "fragment",
        targetName: "preview",
        content: "first-content",
      }, {
        outputName: "second",
        outputKind: "document",
        targetName: "preview",
        content: "",
      }],
    });

    expect(summarizeRendererMemoryMountStore(adapter.store)).toEqual({
      recordCount: 2,
      outputCount: 2,
      targetCount: 1,
      emptyContentCount: 1,
    });
  });

  it("creates adapter-based memory mount plans", () => {
    const output = createRendererOutput({
      kind: "fragment",
      name: "planned-fragment",
      content: "planned-content",
    });
    const target = createRendererTarget({
      kind: "memory",
      name: "planned-target",
    });
    const request = createRendererMountRequest({
      output,
      target,
    });

    expect(createRendererMemoryMountPlan(request)).toEqual({
      name: "memory:planned-fragment->planned-target",
      status: "planned",
      strategy: "adapter",
      request,
      qualityGates: ["request", "output", "target", "diagnostics"],
    });
  });

  it("executes memory mount plans through the renderer plan executor", async () => {
    const adapter = createRendererMemoryMountAdapter("memory");
    const output = createRendererOutput({
      kind: "fragment",
      name: "executed-fragment",
      content: "executed-content",
    });
    const target = createRendererTarget({
      kind: "memory",
      name: "executed-target",
    });
    const plan = createRendererMemoryMountPlan(createRendererMountRequest({
      output,
      target,
    }));

    await expect(executeRendererMemoryMountPlan(plan, adapter)).resolves.toEqual({
      mounted: true,
      output,
      target,
    });
    expect(adapter.store.records).toEqual([{
      outputName: "executed-fragment",
      outputKind: "fragment",
      targetName: "executed-target",
      content: "executed-content",
    }]);
  });

  it("clears memory mount stores in place", () => {
    const adapter = createRendererMemoryMountAdapter("memory", {
      records: [{
        outputName: "first",
        outputKind: "fragment",
        targetName: "preview",
        content: "first-content",
      }],
    });

    expect(clearRendererMemoryMountStore(adapter.store)).toBe(adapter.store);
    expect(adapter.store.records).toEqual([]);
  });

  it("clears memory mount adapters through the adapter API", () => {
    const adapter = createRendererMemoryMountAdapter("memory", {
      records: [{
        outputName: "first",
        outputKind: "fragment",
        targetName: "preview",
        content: "first-content",
      }],
    });

    adapter.clear();

    expect(adapter.store.records).toEqual([]);
  });

  it("finds the latest matching memory mount record", () => {
    const adapter = createRendererMemoryMountAdapter("memory", {
      records: [{
        outputName: "panel",
        outputKind: "fragment",
        targetName: "preview",
        content: "old",
      }, {
        outputName: "panel",
        outputKind: "fragment",
        targetName: "preview",
        content: "new",
      }],
    });

    expect(findLatestRendererMemoryMountRecord(adapter.store, {
      outputName: "panel",
      targetName: "preview",
    })).toEqual({
      outputName: "panel",
      outputKind: "fragment",
      targetName: "preview",
      content: "new",
    });
    expect(findLatestRendererMemoryMountRecord(adapter.store, {
      outputName: "missing",
    })).toBeUndefined();
  });

  it("inspects memory mount results with latest record diagnostics", () => {
    const adapter = createRendererMemoryMountAdapter("memory");
    const output = createRendererOutput({
      kind: "fragment",
      name: "diagnostic-fragment",
      content: "diagnostic-content",
    });
    const target = createRendererTarget({
      kind: "memory",
      name: "diagnostic-target",
    });
    const result = adapter.mount(createRendererMountRequest({
      output,
      target,
    }));

    expect(inspectRendererMemoryMountResult(adapter.store, result)).toEqual({
      mounted: true,
      outputName: "diagnostic-fragment",
      targetName: "diagnostic-target",
      recordCount: 1,
      latestRecord: {
        outputName: "diagnostic-fragment",
        outputKind: "fragment",
        targetName: "diagnostic-target",
        content: "diagnostic-content",
      },
    });
  });

  it("inspects failed memory mount results without latest records", () => {
    const adapter = createRendererMemoryMountAdapter("memory");
    const output = createRendererOutput({
      kind: "fragment",
      name: "failed-fragment",
      content: "failed-content",
    });
    const target = createRendererTarget({
      kind: "surface",
      name: "failed-target",
    });
    const result = adapter.mount(createRendererMountRequest({
      output,
      target,
    }));

    expect(inspectRendererMemoryMountResult(adapter.store, result)).toEqual({
      mounted: false,
      outputName: "failed-fragment",
      targetName: "failed-target",
      recordCount: 0,
      error: "Renderer memory adapter cannot mount to surface targets",
    });
  });

  it("runs a complete memory usage scenario from output to diagnostics", async () => {
    const adapter = createRendererMemoryMountAdapter("memory");
    const output = createRendererOutput({
      kind: "document",
      name: "scenario-document",
      content: "<main>Scenario</main>",
    });
    const target = createRendererTarget({
      kind: "memory",
      name: "scenario-target",
      identifier: "scenario-root",
    });
    const plan = createRendererMemoryMountPlan(createRendererMountRequest({
      output,
      target,
    }));

    const result = await executeRendererMemoryMountPlan(plan, adapter);
    const latestRecord = findLatestRendererMemoryMountRecord(adapter.store, {
      targetIdentifier: "scenario-root",
    });

    expect(result.mounted).toBe(true);
    expect(latestRecord).toEqual({
      outputName: "scenario-document",
      outputKind: "document",
      targetName: "scenario-target",
      targetIdentifier: "scenario-root",
      content: "<main>Scenario</main>",
    });
    expect(summarizeRendererMemoryMountStore(adapter.store)).toEqual({
      recordCount: 1,
      outputCount: 1,
      targetCount: 1,
      emptyContentCount: 0,
    });
    expect(inspectRendererMemoryMountResult(adapter.store, result).latestRecord).toBe(latestRecord);
  });
});
