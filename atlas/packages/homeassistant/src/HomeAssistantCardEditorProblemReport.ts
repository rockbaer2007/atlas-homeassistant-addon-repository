export const HomeAssistantCardEditorProblemReportType = "atlas.card-editor.problem-report.v1";

export type HomeAssistantCardEditorProblemReportPrivacy = Readonly<{
  homeAssistantTokenIncluded: false;
  providerApiKeysIncluded: false;
  cookiesIncluded: false;
  localStorageIncluded: false;
}>;

export type HomeAssistantCardEditorProblemReport = Readonly<Record<string, unknown>> & Readonly<{
  schema: 1;
  type: typeof HomeAssistantCardEditorProblemReportType;
  generatedAt: string;
  privacy: HomeAssistantCardEditorProblemReportPrivacy;
}>;

export type HomeAssistantCardEditorProblemReportIssueRequest = Readonly<{
  baseUrl?: string;
  title?: string;
  body: string;
}>;

const defaultIssueUrl = "https://github.com/rockbaer2007/atlas/issues/new";
const defaultIssueTitle = "Home Assistant Card Editor problem report";
const sensitiveKeyPattern = /token|secret|password|api[_-]?key|authorization|cookie|localstorage|signature|credential|jwt|(?:^|[_-])auth(?:$|[_-])/i;

export function createHomeAssistantCardEditorProblemReport(
  data: Record<string, unknown>,
  generatedAt = new Date(),
  sensitiveValues: readonly string[] = [],
): HomeAssistantCardEditorProblemReport {
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

  return sanitizeHomeAssistantCardEditorDebugValue(report, "", sensitiveValues) as HomeAssistantCardEditorProblemReport;
}

export function createHomeAssistantCardEditorProblemReportPreviewText(
  report: HomeAssistantCardEditorProblemReport,
): string {
  return [
    "## ATLAS Home Assistant Card Editor problem report",
    "",
    "I reviewed this opt-in debug report before sharing it.",
    "",
    "Home Assistant access and Ingress tokens, provider API keys, cookies and localStorage are not included.",
    "",
    "```json",
    JSON.stringify(report, null, 2),
    "```",
  ].join("\n");
}

export function createHomeAssistantCardEditorProblemReportIssueUrl(
  request: HomeAssistantCardEditorProblemReportIssueRequest,
): string {
  const url = new URL(request.baseUrl ?? defaultIssueUrl);
  url.searchParams.set("title", request.title ?? defaultIssueTitle);
  url.searchParams.set("body", request.body);
  return url.toString();
}

export function redactHomeAssistantCardEditorDebugText(text: string): string {
  return String(text)
    .replace(/\b(?:https?|wss?):\/\/[^\s<>"'`]+/gi, candidate => {
      try { return sanitizeParsedDebugUrl(new URL(candidate)); } catch { return candidate; }
    })
    .replace(/(authorization:\s*(?:bearer|basic)\s+)[^\s"'`]+/gi, "$1[redacted]")
    .replace(/((?:set-)?cookie:\s*)[^\r\n]*/gi, "$1[redacted]")
    .replace(/(["']?[\w.-]*(?:token|api[_-]?key|secret|password|credential|signature|jwt|auth|cookie|localstorage)[\w.-]*["']?\s*[:=]\s*)(?:\[redacted\]|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^\s"'`&,}\]]+)/gi, (match, prefix) => {
      // The preceding header rule already removed the credential; keep its scheme.
      if (/^authorization:\s*$/i.test(prefix) && /:\s*(?:bearer|basic)\b/i.test(match)) return match;
      return `${prefix}[redacted]`;
    })
    .replace(/(\/api\/hassio_ingress\/)[^/?#\s"'`]+/gi, "$1[redacted]");
}

export function sanitizeHomeAssistantCardEditorDebugValue(value: unknown, key = "", sensitiveValues: readonly string[] = []): unknown {
  if (/configured/i.test(key) && sensitiveKeyPattern.test(key)) {
    if (isRecord(value)) {
      return Object.fromEntries(
        Object.entries(value).map(([entryKey, entryValue]) => [
          entryKey,
          typeof entryValue === "boolean" ? entryValue : "[redacted]",
        ]),
      );
    }
    return typeof value === "boolean" ? value : "[redacted]";
  }

  if (sensitiveKeyPattern.test(key)) {
    if (typeof value === "boolean") return value;
    return value ? "[redacted]" : value;
  }

  if (typeof value === "string") {
    let sanitized = redactHomeAssistantCardEditorDebugText(value);
    for (const secret of sensitiveValues.filter(value => typeof value === "string" && value.length > 0)) {
      // Exact replacement avoids interpreting credentials as regular expressions.
      sanitized = sanitized.split(secret).join("[redacted]");
      sanitized = sanitized.split(encodeURIComponent(secret)).join("[redacted]");
    }
    return sanitized;
  }

  if (Array.isArray(value)) {
    return value.map(item => sanitizeHomeAssistantCardEditorDebugValue(item, "", sensitiveValues));
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        sanitizeHomeAssistantCardEditorDebugValue(entryValue, entryKey, sensitiveValues),
      ]),
    );
  }

  return value;
}

export function sanitizeHomeAssistantCardEditorDebugUrl(value: string): string {
  if (!value.trim()) {
    return "";
  }

  try {
    return sanitizeParsedDebugUrl(new URL(value.trim()));
  } catch {
    return redactHomeAssistantCardEditorDebugText(value);
  }
}

function sanitizeParsedDebugUrl(url: URL): string {
    url.username = "";
    url.password = "";
    for (const key of [...url.searchParams.keys()]) {
      if (sensitiveKeyPattern.test(key)) {
        url.searchParams.set(key, "[redacted]");
      }
    }
    url.pathname = url.pathname.replace(/(\/api\/hassio_ingress\/)[^/]+/i, "$1[redacted]");
    if (url.hash) {
      // Fragments are not sent to servers, but can still contain browser tokens.
      let fragment = url.hash.slice(1);
      try { fragment = decodeURIComponent(fragment); } catch { /* Keep malformed fragments inspectable. */ }
      if (sensitiveKeyPattern.test(fragment)) url.hash = "[redacted]";
    }
    return url.toString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
