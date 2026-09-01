export declare const HomeAssistantCardEditorProblemReportType = "atlas.card-editor.problem-report.v1";
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
export declare function createHomeAssistantCardEditorProblemReport(data: Record<string, unknown>, generatedAt?: Date): HomeAssistantCardEditorProblemReport;
export declare function createHomeAssistantCardEditorProblemReportPreviewText(report: HomeAssistantCardEditorProblemReport): string;
export declare function createHomeAssistantCardEditorProblemReportIssueUrl(request: HomeAssistantCardEditorProblemReportIssueRequest): string;
export declare function redactHomeAssistantCardEditorDebugText(text: string): string;
export declare function sanitizeHomeAssistantCardEditorDebugValue(value: unknown, key?: string): unknown;
export declare function sanitizeHomeAssistantCardEditorDebugUrl(value: string): string;
