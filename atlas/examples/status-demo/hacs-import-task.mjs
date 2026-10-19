export class HacsImportTaskError extends Error {
  constructor(code) { super(code); this.code = code; }
}

/** One disposable worker per selection. Termination interrupts synchronous CRC/JSON too. */
export function createHacsImportTask({ workerUrl, archiveBytes, onPhase = () => {},
  WorkerClass = globalThis.Worker, timeoutMs = 15000 }) {
  let current;
  const cancel = () => current?.finish(new HacsImportTaskError("cancelled"));
  return {
    cancel,
    start(file) {
      cancel();
      if (!Number.isSafeInteger(file.size) || file.size > archiveBytes || file.size < 0) {
        return Promise.reject(new HacsImportTaskError("archive-limit"));
      }
      return new Promise((resolve, reject) => {
        const job = { worker: undefined, timer: undefined, finish(error, value) {
          if (current !== job) return;
          current = undefined;
          clearTimeout(job.timer);
          job.worker?.terminate();
          if (error) reject(error); else resolve(value);
        } };
        current = job;
        try {
          job.worker = new WorkerClass(workerUrl);
          job.timer = setTimeout(() => job.finish(new HacsImportTaskError("timeout")), timeoutMs);
          job.worker.onmessage = ({ data }) => {
            if (current !== job) return;
            if (data?.phase === "reading" || data?.phase === "checking") onPhase(data.phase);
            else if (data?.result) job.finish(undefined, data.result);
            else job.finish(new HacsImportTaskError("worker-failed"));
          };
          job.worker.onerror = () => job.finish(new HacsImportTaskError("worker-failed"));
          job.worker.onmessageerror = job.worker.onerror;
          onPhase("reading");
          // A File is cloned, not read on the main thread; no credentials are sent.
          job.worker.postMessage({ file });
        } catch {
          job.finish(new HacsImportTaskError("worker-failed"));
        }
      });
    },
  };
}
