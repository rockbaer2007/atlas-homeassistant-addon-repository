import { afterEach, describe, expect, it, vi } from "vitest";
import { Worker as NodeWorker } from "node:worker_threads";
import { createHacsImportTask } from "../../../examples/status-demo/hacs-import-task.mjs";

class WorkerMock {
  static all: WorkerMock[] = [];
  onmessage: any; onerror: any; onmessageerror: any;
  terminated = false; sent: any;
  constructor(public url: string) { WorkerMock.all.push(this); }
  terminate() { this.terminated = true; }
  postMessage(value: any) { this.sent = value; }
  emit(data: any) { this.onmessage({ data }); }
}
const file = (size = 1) => ({ size, arrayBuffer() { throw Error("Never read on UI thread"); } });
const task = (onPhase = (_: string) => {}) => createHacsImportTask({ workerUrl: "/worker.js", archiveBytes: 32,
  WorkerClass: WorkerMock, onPhase, timeoutMs: 15000 });
afterEach(() => { WorkerMock.all = []; vi.useRealTimers(); });
describe("Disposable HACS worker lifecycle", () => {
  it("rejects oversize before reading or constructing a worker; accepts exact boundary", async () => {
    const t = task(); await expect(t.start(file(33))).rejects.toHaveProperty("code", "archive-limit");
    expect(WorkerMock.all).toHaveLength(0);
    const p = t.start(file(32)); WorkerMock.all[0]!.emit({ result: { ready: true } });
    await expect(p).resolves.toEqual({ ready: true }); expect(WorkerMock.all[0]!.terminated).toBe(true);
  });
  it("terminates a reading/checking worker and ignores a late result", async () => {
    const phases: string[] = [], t = task(p => phases.push(p)), p = t.start(file());
    const worker = WorkerMock.all[0]!; worker.emit({ phase: "checking" }); t.cancel();
    worker.emit({ result: { ready: true } });
    await expect(p).rejects.toHaveProperty("code", "cancelled"); expect(worker.terminated).toBe(true);
    expect(phases).toEqual(["reading", "checking"]);
  });
  it("cancels old work before replacement and ignores the old worker's errors/results", async () => {
    const t = task(), first = t.start(file()); const old = WorkerMock.all[0]!;
    const second = t.start(file()); old.emit({ result: { wrong: true } }); old.onerror();
    await expect(first).rejects.toHaveProperty("code", "cancelled");
    WorkerMock.all[1]!.emit({ result: { correct: true } }); await expect(second).resolves.toEqual({ correct: true });
  });
  it("times out a non-responsive worker, terminates it and permits retry", async () => {
    vi.useFakeTimers(); const t = task(), p = t.start(file());
    const rejected = expect(p).rejects.toHaveProperty("code", "timeout");
    await vi.advanceTimersByTimeAsync(15000); await rejected; expect(WorkerMock.all[0]!.terminated).toBe(true);
    const retry = t.start(file()); WorkerMock.all[1]!.emit({ result: { ok: true } }); await expect(retry).resolves.toEqual({ ok: true });
  });
  it("fails closed on worker load failure, clone failure or malformed messages", async () => {
    const t = task(), p = t.start(file()); WorkerMock.all[0]!.onerror();
    await expect(p).rejects.toHaveProperty("code", "worker-failed");
    const q = t.start(file()); WorkerMock.all[1]!.emit({}); await expect(q).rejects.toHaveProperty("code", "worker-failed");
    const broken = createHacsImportTask({ workerUrl: "/worker.js", archiveBytes: 32,
      WorkerClass: class extends WorkerMock { postMessage() { throw Error("clone failed"); } } });
    await expect(broken.start(file())).rejects.toHaveProperty("code", "worker-failed");
    expect(WorkerMock.all.at(-1)!.terminated).toBe(true);
  });
  it("can terminate an actual busy worker rather than waiting for its event loop", async () => {
    let exited: Promise<number>;
    let phaseStarted!: () => void;
    const started = new Promise<void>(resolve => { phaseStarted = resolve; });
    class BusyWorker {
      onmessage: any; onerror: any;
      thread = new NodeWorker("const { parentPort } = require('node:worker_threads'); parentPort.on('message', () => { parentPort.postMessage({phase:'checking'}); while(true){} });", { eval: true });
      constructor() {
        exited = new Promise(resolve => this.thread.on("exit", resolve));
        this.thread.on("message", data => this.onmessage?.({ data }));
        this.thread.on("error", error => this.onerror?.(error));
      }
      postMessage() { this.thread.postMessage({}); }
      terminate() { void this.thread.terminate(); }
    }
    const t = createHacsImportTask({ workerUrl: "/worker.js", archiveBytes: 32,
      WorkerClass: BusyWorker, onPhase: (p: string) => { if (p === "checking") phaseStarted(); } });
    const pending = t.start(file());
    const rejected = expect(pending).rejects.toHaveProperty("code", "cancelled");
    try { await started; t.cancel(); await rejected; expect(await exited!).not.toBe(0); }
    finally { t.cancel(); }
  });
});
