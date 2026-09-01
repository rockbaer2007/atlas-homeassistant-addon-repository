import { describe, expect, it } from "vitest";

import {
  clearRendererDomMountStore,
  createRendererDomMountAdapter,
  createRendererDomMountPlan,
  createRendererMountRequest,
  createRendererOutput,
  createRendererTarget,
  executeRendererDomMountPlan,
  findLatestRendererDomMountRecord,
  findRendererDomMountRecords,
  inspectRendererDomMountResult,
  summarizeRendererDomMountStore,
} from "../src";

describe("renderer DOM mounting", () => {
  it("mounts Renderer output into a surface target identifier", () => {
    const adapter = createRendererDomMountAdapter("dom");
    const output = createRendererOutput({
      kind: "fragment",
      name: "panel-fragment",
      content: "<section>Panel</section>",
    });
    const target = createRendererTarget({
      kind: "surface",
      name: "panel",
      identifier: "panel-root",
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
      outputName: "panel-fragment",
      outputKind: "fragment",
      targetName: "panel",
      elementId: "panel-root",
      html: "<section>Panel</section>",
    }]);
  });

  it("preserves empty Renderer output content as empty DOM HTML", () => {
    const adapter = createRendererDomMountAdapter("dom");
    const output = createRendererOutput({
      kind: "document",
      name: "empty-document",
    });
    const target = createRendererTarget({
      kind: "surface",
      name: "empty-panel",
      identifier: "empty-root",
    });

    adapter.mount(createRendererMountRequest({
      output,
      target,
    }));

    expect(adapter.store.records[0]).toEqual({
      outputName: "empty-document",
      outputKind: "document",
      targetName: "empty-panel",
      elementId: "empty-root",
      html: "",
    });
  });

  it("rejects memory targets without mutating the DOM store", () => {
    const adapter = createRendererDomMountAdapter("dom");
    const output = createRendererOutput({
      kind: "fragment",
      name: "memory-fragment",
      content: "<p>Memory</p>",
    });
    const target = createRendererTarget({
      kind: "memory",
      name: "memory-target",
    });

    const result = adapter.mount(createRendererMountRequest({
      output,
      target,
    }));

    expect(result).toEqual({
      mounted: false,
      output,
      target,
      error: "Renderer DOM adapter cannot mount to memory targets",
    });
    expect(adapter.store.records).toEqual([]);
  });

  it("rejects surface targets without identifiers", () => {
    const adapter = createRendererDomMountAdapter("dom");
    const output = createRendererOutput({
      kind: "fragment",
      name: "missing-identifier-fragment",
      content: "<p>Missing</p>",
    });
    const target = createRendererTarget({
      kind: "surface",
      name: "missing-identifier-target",
    });

    const result = adapter.mount(createRendererMountRequest({
      output,
      target,
    }));

    expect(result).toEqual({
      mounted: false,
      output,
      target,
      error: "Renderer DOM adapter requires a target identifier.",
    });
    expect(adapter.store.records).toEqual([]);
  });

  it("copies initial DOM store records before mounting", () => {
    const seedRecords = [{
      outputName: "seed",
      outputKind: "fragment" as const,
      targetName: "seed-target",
      elementId: "seed-root",
      html: "seed-html",
    }];
    const adapter = createRendererDomMountAdapter("dom", {
      records: seedRecords,
    });

    seedRecords.push({
      outputName: "late",
      outputKind: "document",
      targetName: "late-target",
      elementId: "late-root",
      html: "late-html",
    });

    expect(adapter.store.records).toEqual([{
      outputName: "seed",
      outputKind: "fragment",
      targetName: "seed-target",
      elementId: "seed-root",
      html: "seed-html",
    }]);
  });

  it("finds DOM mount records by output and element metadata", () => {
    const adapter = createRendererDomMountAdapter("dom", {
      records: [{
        outputName: "first",
        outputKind: "fragment",
        targetName: "panel",
        elementId: "panel-root",
        html: "first-html",
      }, {
        outputName: "second",
        outputKind: "document",
        targetName: "panel",
        elementId: "panel-root",
        html: "second-html",
      }],
    });

    expect(findRendererDomMountRecords(adapter.store, {
      elementId: "panel-root",
      outputName: "first",
    })).toEqual([{
      outputName: "first",
      outputKind: "fragment",
      targetName: "panel",
      elementId: "panel-root",
      html: "first-html",
    }]);
    expect(findRendererDomMountRecords(adapter.store, {
      elementId: "missing",
    })).toEqual([]);
  });

  it("summarizes DOM mount store records", () => {
    const adapter = createRendererDomMountAdapter("dom", {
      records: [{
        outputName: "first",
        outputKind: "fragment",
        targetName: "panel",
        elementId: "panel-root",
        html: "first-html",
      }, {
        outputName: "second",
        outputKind: "document",
        targetName: "modal",
        elementId: "modal-root",
        html: "",
      }],
    });

    expect(summarizeRendererDomMountStore(adapter.store)).toEqual({
      recordCount: 2,
      outputCount: 2,
      elementCount: 2,
      emptyHtmlCount: 1,
    });
  });

  it("clears DOM mount stores and adapters in place", () => {
    const adapter = createRendererDomMountAdapter("dom", {
      records: [{
        outputName: "first",
        outputKind: "fragment",
        targetName: "panel",
        elementId: "panel-root",
        html: "first-html",
      }],
    });

    expect(clearRendererDomMountStore(adapter.store)).toBe(adapter.store);
    expect(adapter.store.records).toEqual([]);

    adapter.mount(createRendererMountRequest({
      output: createRendererOutput({
        kind: "fragment",
        name: "second",
        content: "second-html",
      }),
      target: createRendererTarget({
        kind: "surface",
        name: "panel",
        identifier: "panel-root",
      }),
    }));
    adapter.clear();

    expect(adapter.store.records).toEqual([]);
  });

  it("finds latest DOM mount records", () => {
    const adapter = createRendererDomMountAdapter("dom", {
      records: [{
        outputName: "panel",
        outputKind: "fragment",
        targetName: "panel",
        elementId: "panel-root",
        html: "old",
      }, {
        outputName: "panel",
        outputKind: "fragment",
        targetName: "panel",
        elementId: "panel-root",
        html: "new",
      }],
    });

    expect(findLatestRendererDomMountRecord(adapter.store, {
      elementId: "panel-root",
    })).toEqual({
      outputName: "panel",
      outputKind: "fragment",
      targetName: "panel",
      elementId: "panel-root",
      html: "new",
    });
  });

  it("creates and executes DOM mount plans through the renderer plan executor", async () => {
    const adapter = createRendererDomMountAdapter("dom");
    const output = createRendererOutput({
      kind: "fragment",
      name: "planned-panel",
      content: "<article>Planned</article>",
    });
    const target = createRendererTarget({
      kind: "surface",
      name: "planned-surface",
      identifier: "planned-root",
    });
    const request = createRendererMountRequest({
      output,
      target,
    });
    const plan = createRendererDomMountPlan(request);

    expect(plan).toEqual({
      name: "dom:planned-panel->planned-surface",
      status: "planned",
      strategy: "adapter",
      request,
      qualityGates: ["request", "output", "target", "diagnostics"],
    });
    await expect(executeRendererDomMountPlan(plan, adapter)).resolves.toEqual({
      mounted: true,
      output,
      target,
    });
    expect(adapter.store.records).toEqual([{
      outputName: "planned-panel",
      outputKind: "fragment",
      targetName: "planned-surface",
      elementId: "planned-root",
      html: "<article>Planned</article>",
    }]);
  });

  it("inspects DOM mount results with latest record diagnostics", async () => {
    const adapter = createRendererDomMountAdapter("dom");
    const output = createRendererOutput({
      kind: "document",
      name: "diagnostic-document",
      content: "<main>Diagnostic</main>",
    });
    const target = createRendererTarget({
      kind: "surface",
      name: "diagnostic-surface",
      identifier: "diagnostic-root",
    });

    const result = await executeRendererDomMountPlan(
      createRendererDomMountPlan(createRendererMountRequest({
        output,
        target,
      })),
      adapter,
    );

    expect(inspectRendererDomMountResult(adapter.store, result)).toEqual({
      mounted: true,
      outputName: "diagnostic-document",
      targetName: "diagnostic-surface",
      recordCount: 1,
      latestRecord: {
        outputName: "diagnostic-document",
        outputKind: "document",
        targetName: "diagnostic-surface",
        elementId: "diagnostic-root",
        html: "<main>Diagnostic</main>",
      },
    });
  });
});

