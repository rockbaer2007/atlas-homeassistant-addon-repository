import { describe, expect, it } from "vitest";
import type { DiagnosticReport } from "@atlas/foundation";
import { summarizeDiagnostics } from "../src";
import { inspectDevtoolsDependencyBoundary } from "../src/DevtoolsDependencyBoundary";

const report = (
  component: string,
  ok: boolean,
  issues: DiagnosticReport["result"]["issues"],
): DiagnosticReport => ({
  context: { component },
  result: { ok, issues },
});

describe("@atlas/devtools diagnostic summary", () => {
  it("reports unavailable when no diagnostic reports were supplied", () => {
    expect(summarizeDiagnostics([])).toEqual({
      status: "unavailable",
      reportCount: 0,
      issueCount: 0,
      bySeverity: { info: 0, warning: 0, error: 0 },
    });
  });

  it("summarizes healthy reports and informational issues", () => {
    const reports = [report("runtime", true, [
      { code: "runtime.ready", message: "Runtime is ready.", severity: "info" },
    ])];

    expect(summarizeDiagnostics(reports)).toEqual({
      status: "healthy",
      reportCount: 1,
      issueCount: 1,
      bySeverity: { info: 1, warning: 0, error: 0 },
    });
  });

  it("counts issue severities across reports without modifying inputs", () => {
    const reports = [
      report("runtime", false, [
        { code: "runtime.warning", message: "Runtime is degraded.", severity: "warning" },
        { code: "runtime.error", message: "A module failed.", severity: "error" },
      ]),
      report("plugin", false, [
        { code: "plugin.error", message: "Plugin failed.", severity: "error" },
      ]),
    ];
    const summary = summarizeDiagnostics(reports);

    expect(summary).toEqual({
      status: "issues",
      reportCount: 2,
      issueCount: 3,
      bySeverity: { info: 0, warning: 1, error: 2 },
    });
    expect(reports[0].result.issues).toHaveLength(2);
  });

  it("exposes the summary from the package root", () => {
    expect(summarizeDiagnostics).toBeTypeOf("function");
  });

  it("keeps developer tooling decoupled from frontend and build-server packages", () => {
    expect(inspectDevtoolsDependencyBoundary([
      "@atlas/foundation",
    ])).toEqual({ ok: true, forbiddenDependencies: [] });
    expect(inspectDevtoolsDependencyBoundary([
      "@atlas/renderer",
      "vite",
    ])).toEqual({ ok: false, forbiddenDependencies: ["@atlas/renderer", "vite"] });
  });
});
