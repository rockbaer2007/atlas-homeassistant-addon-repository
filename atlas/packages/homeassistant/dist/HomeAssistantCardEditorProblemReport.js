export const HomeAssistantCardEditorProblemReportType = "atlas.card-editor.problem-report.v1";
const defaultIssueUrl = "https://github.com/rockbaer2007/atlas/issues/new";
const defaultIssueTitle = "Home Assistant Card Editor problem report";
const sensitiveKeyPattern = /token|secret|password|api[_-]?key|authorization|cookie|localstorage/i;
export function createHomeAssistantCardEditorProblemReport(data, generatedAt = new Date()) {
    const report = {
        ...data,
        schema: 1,
        type: HomeAssistantCardEditorProblemReportType,
        generatedAt: generatedAt.toISOString(),
        privacy: {
            homeAssistantTokenIncluded: false,
            providerApiKeysIncluded: false,
            cookiesIncluded: false,
            localStorageIncluded: false,
        },
    };
    return sanitizeHomeAssistantCardEditorDebugValue(report);
}
export function createHomeAssistantCardEditorProblemReportPreviewText(report) {
    return [
        "## ATLAS Home Assistant Card Editor problem report",
        "",
        "I reviewed this opt-in debug report before sharing it.",
        "",
        "Home Assistant tokens, provider API keys, cookies and localStorage are not included.",
        "",
        "```json",
        JSON.stringify(report, null, 2),
        "```",
    ].join("\n");
}
export function createHomeAssistantCardEditorProblemReportIssueUrl(request) {
    const url = new URL(request.baseUrl ?? defaultIssueUrl);
    url.searchParams.set("title", request.title ?? defaultIssueTitle);
    url.searchParams.set("body", request.body);
    return url.toString();
}
export function redactHomeAssistantCardEditorDebugText(text) {
    return String(text)
        .replace(/(authorization:\s*bearer\s+)[^\s"'`]+/gi, "$1[redacted]")
        .replace(/((?:access_)?token\s*[:=]\s*)[^\s"'`]+/gi, "$1[redacted]")
        .replace(/((?:api[_-]?key|secret|password)\s*[:=]\s*)[^\s"'`]+/gi, "$1[redacted]");
}
export function sanitizeHomeAssistantCardEditorDebugValue(value, key = "") {
    if (/configured/i.test(key)) {
        if (Array.isArray(value)) {
            return value.map(item => sanitizeHomeAssistantCardEditorDebugValue(item));
        }
        if (isRecord(value)) {
            return Object.fromEntries(Object.entries(value).map(([entryKey, entryValue]) => [
                entryKey,
                typeof entryValue === "boolean"
                    ? entryValue
                    : sanitizeHomeAssistantCardEditorDebugValue(entryValue, entryKey),
            ]));
        }
        return typeof value === "boolean" ? value : sanitizeHomeAssistantCardEditorDebugValue(value);
    }
    if (sensitiveKeyPattern.test(key)) {
        if (typeof value === "boolean")
            return value;
        return value ? "[redacted]" : value;
    }
    if (typeof value === "string") {
        return redactHomeAssistantCardEditorDebugText(value);
    }
    if (Array.isArray(value)) {
        return value.map(item => sanitizeHomeAssistantCardEditorDebugValue(item));
    }
    if (isRecord(value)) {
        return Object.fromEntries(Object.entries(value).map(([entryKey, entryValue]) => [
            entryKey,
            sanitizeHomeAssistantCardEditorDebugValue(entryValue, entryKey),
        ]));
    }
    return value;
}
export function sanitizeHomeAssistantCardEditorDebugUrl(value) {
    if (!value.trim()) {
        return "";
    }
    try {
        const url = new URL(value.trim());
        url.username = "";
        url.password = "";
        for (const key of [...url.searchParams.keys()]) {
            if (sensitiveKeyPattern.test(key)) {
                url.searchParams.set(key, "[redacted]");
            }
        }
        return url.toString();
    }
    catch {
        return redactHomeAssistantCardEditorDebugText(value);
    }
}
function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
