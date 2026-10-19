import {
  HACS_IMPORT_LIMITS,
  readHomeAssistantCardEditorHacsBundleArchivePackage,
  createHomeAssistantCardEditorHacsBundleReadinessReport,
  formatHomeAssistantCardEditorHacsBundlePackageReadinessReviewLines,
} from "@atlas/homeassistant";

self.onmessage = async ({ data }) => {
  try {
    const file = data.file;
    if (!Number.isSafeInteger(file.size) || file.size > HACS_IMPORT_LIMITS.archiveBytes || file.size < 0) throw Error("archive-limit");
    self.postMessage({ phase: "reading" });
    const content = new Uint8Array(await file.arrayBuffer());
    self.postMessage({ phase: "checking" });
    const packageRead = readHomeAssistantCardEditorHacsBundleArchivePackage(content);
    const readiness = createHomeAssistantCardEditorHacsBundleReadinessReport(packageRead);
    self.postMessage({ result: { packageRead, ready: readiness.ready,
      review: formatHomeAssistantCardEditorHacsBundlePackageReadinessReviewLines(packageRead).join("\n") } });
  } catch {
    self.postMessage({ error: "worker-failed" });
  }
};
