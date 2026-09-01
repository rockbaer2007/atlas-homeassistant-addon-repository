import { describe, expect, it } from "vitest";
import {
  createHomeAssistantCardEditorProblemReport,
  createHomeAssistantCardEditorProblemReportIssueUrl,
  createHomeAssistantCardEditorProblemReportPreviewText,
  redactHomeAssistantCardEditorDebugText,
  sanitizeHomeAssistantCardEditorDebugUrl,
  sanitizeHomeAssistantCardEditorDebugValue,
} from "../src";

describe("Home Assistant card editor problem reports", () => {
  it("redacts tokens, authorization headers and provider keys in nested debug data", () => {
    const sanitized = sanitizeHomeAssistantCardEditorDebugValue({
      connection: {
        token: "ha-token-123",
        authorization: "Bearer ha-long-lived-token",
        tokenConfigured: true,
      },
      translation: {
        apiKey: "sk-provider-secret",
        apiKeyConfigured: true,
        apiKeyConfiguredByProvider: {
          chatgpt: true,
          gemini: false,
        },
      },
      events: [
        "authorization: bearer abc123",
        "api_key=secret-value",
        "plain diagnostic",
      ],
    });

    expect(sanitized).toEqual({
      connection: {
        token: "[redacted]",
        authorization: "[redacted]",
        tokenConfigured: true,
      },
      translation: {
        apiKey: "[redacted]",
        apiKeyConfigured: true,
        apiKeyConfiguredByProvider: {
          chatgpt: true,
          gemini: false,
        },
      },
      events: [
        "authorization: bearer [redacted]",
        "api_key=[redacted]",
        "plain diagnostic",
      ],
    });
  });

  it("creates a sanitized opt-in preview without cookies, localStorage or raw secrets", () => {
    const report = createHomeAssistantCardEditorProblemReport({
      app: {
        demoUrl: "http://127.0.0.1:4174/?token=raw-url-token",
        editorMode: "expert",
      },
      connection: {
        homeAssistantToken: "raw-home-assistant-token",
      },
      browser: {
        cookie: "atlas_session=secret",
        localStorage: "secret-storage",
      },
      translation: {
        apiKey: "raw-provider-key",
        apiKeyConfigured: true,
      },
    }, new Date("2026-09-01T06:15:00.000Z"));
    const preview = createHomeAssistantCardEditorProblemReportPreviewText(report);

    expect(report).toMatchObject({
      schema: 1,
      type: "atlas.card-editor.problem-report.v1",
      generatedAt: "2026-09-01T06:15:00.000Z",
      privacy: {
        homeAssistantTokenIncluded: false,
        providerApiKeysIncluded: false,
        cookiesIncluded: false,
        localStorageIncluded: false,
      },
    });
    expect(preview).toContain("I reviewed this opt-in debug report before sharing it.");
    expect(preview).toContain("\"homeAssistantToken\": \"[redacted]\"");
    expect(preview).toContain("\"apiKey\": \"[redacted]\"");
    expect(preview).not.toContain("raw-home-assistant-token");
    expect(preview).not.toContain("raw-provider-key");
    expect(preview).not.toContain("secret-storage");
  });

  it("builds a GitHub issue link with a prefilled reviewed report body", () => {
    const url = createHomeAssistantCardEditorProblemReportIssueUrl({
      baseUrl: "https://github.com/example/project/issues/new",
      title: "Test report",
      body: "reviewed report body",
    });
    const parsed = new URL(url);

    expect(parsed.origin).toBe("https://github.com");
    expect(parsed.pathname).toBe("/example/project/issues/new");
    expect(parsed.searchParams.get("title")).toBe("Test report");
    expect(parsed.searchParams.get("body")).toBe("reviewed report body");
  });

  it("sanitizes debug URLs and free text without dropping safe configuration flags", () => {
    expect(sanitizeHomeAssistantCardEditorDebugUrl("https://user:pass@example.test/path?token=abc&view=main"))
      .toBe("https://example.test/path?token=%5Bredacted%5D&view=main");
    expect(redactHomeAssistantCardEditorDebugText("password=secret api-key: abc"))
      .toBe("password=[redacted] api-key: [redacted]");
  });
});
