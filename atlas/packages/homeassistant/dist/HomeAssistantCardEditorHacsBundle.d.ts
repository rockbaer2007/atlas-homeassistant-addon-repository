import { type HomeAssistantCardExportPackage, type HomeAssistantCardImportSummary } from "./HomeAssistantCardConfiguration";
export interface HomeAssistantCardEditorHacsBundleFile {
    readonly path: string;
    readonly mimeType: "application/json" | "text/javascript" | "text/markdown";
    readonly content: string;
}
export interface HomeAssistantCardEditorHacsBundle {
    readonly version: 1;
    readonly kind: "atlas.homeassistant.hacs-card-bundle";
    readonly cardName: string;
    readonly scriptFilename: string;
    readonly customElementName: string;
    readonly cardType: `custom:${string}`;
    readonly resourcePath: string;
    readonly files: readonly HomeAssistantCardEditorHacsBundleFile[];
    readonly installSteps: readonly string[];
}
export interface HomeAssistantCardEditorHacsBundleArchive {
    readonly filename: string;
    readonly mimeType: "application/zip";
    readonly content: Uint8Array;
}
export interface HomeAssistantCardEditorHacsBundleArchiveEntry {
    readonly path: string;
    readonly compressionMethod: "store" | "deflate" | "unsupported";
    readonly compressedSize: number;
    readonly uncompressedSize: number;
}
export type HomeAssistantCardEditorHacsBundleArchiveIssueCode = "missing-required-file" | "missing-locale-file" | "unsafe-path" | "duplicate-path";
export interface HomeAssistantCardEditorHacsBundleArchiveIssue {
    readonly code: HomeAssistantCardEditorHacsBundleArchiveIssueCode;
    readonly severity: "error";
    readonly paths: readonly string[];
    readonly message: string;
}
export interface HomeAssistantCardEditorHacsBundleArchiveInspection {
    readonly kind: "atlas.homeassistant.hacs-card-bundle-archive";
    readonly importable: boolean;
    readonly fileCount: number;
    readonly files: readonly HomeAssistantCardEditorHacsBundleArchiveEntry[];
    readonly requiredFiles: readonly string[];
    readonly missingFiles: readonly string[];
    readonly unsafePaths: readonly string[];
    readonly duplicatePaths: readonly string[];
    readonly issues: readonly HomeAssistantCardEditorHacsBundleArchiveIssue[];
    readonly scriptFiles: readonly string[];
    readonly atlasPackageFiles: readonly string[];
    readonly localeFiles: readonly string[];
    readonly missingLocaleFiles: readonly string[];
    readonly reason: string;
}
export interface HomeAssistantCardEditorHacsBundleArchivePackageRead {
    readonly kind: "atlas.homeassistant.hacs-card-bundle-package";
    readonly importable: boolean;
    readonly inspection: HomeAssistantCardEditorHacsBundleArchiveInspection;
    readonly hacsMetadata?: HomeAssistantCardEditorHacsBundleArchiveMetadata;
    readonly localeReadiness?: HomeAssistantCardEditorHacsBundleArchiveLocaleReadiness;
    readonly scriptReadiness?: HomeAssistantCardEditorHacsBundleArchiveScriptReadiness;
    readonly exampleReadiness?: HomeAssistantCardEditorHacsBundleArchiveExampleReadiness;
    readonly readmeReadiness?: HomeAssistantCardEditorHacsBundleArchiveReadmeReadiness;
    readonly packageFile?: string;
    readonly packageContent?: string;
    readonly summary?: HomeAssistantCardImportSummary;
    readonly reason: string;
}
export type HomeAssistantCardEditorHacsBundleReadinessCheckStatus = "pass" | "fail" | "pending";
export type HomeAssistantCardEditorHacsBundleReadinessCheckCode = "zip-readable" | "safe-paths" | "unique-paths" | "has-hacs-manifest" | "has-readme" | "has-example-card" | "has-root-script" | "has-atlas-package" | "has-english-locale" | "hacs-filename-declared" | "hacs-script-in-archive" | "atlas-package-readable" | "declared-locales-present" | "locale-json-readable" | "locale-meta-language-present" | "locale-language-matches-path" | "hacs-name-declared" | "hacs-name-matches-package" | "hacs-filename-matches-package" | "script-custom-element-known" | "script-file-readable" | "script-defines-custom-element" | "example-json-readable" | "example-type-present" | "example-type-matches-package" | "readme-mentions-resource-path" | "readme-mentions-card-type" | "package-contains-entities" | "package-entity-ids-safe" | "package-is-atlas-export" | "bundle-importable" | "archive-file-count-nonzero" | "archive-required-files-present" | "archive-no-issues" | "archive-script-count-one" | "archive-package-count-one" | "archive-locale-directory-present" | "archive-only-forward-slashes" | "archive-no-parent-segments" | "archive-no-absolute-paths" | "archive-no-drive-paths" | "hacs-name-trimmed" | "hacs-filename-trimmed" | "hacs-filename-js-extension" | "hacs-filename-lowercase" | "hacs-filename-root-scoped" | "hacs-filename-safe-characters" | "hacs-render-readme-enabled" | "hacs-filename-resource-aligned" | "hacs-card-type-custom" | "hacs-custom-element-name-safe" | "package-title-present" | "package-format-json" | "package-target-known" | "package-layout-known" | "package-dependency-known" | "package-script-present" | "package-editor-plan-present" | "package-script-filename-present" | "package-script-resource-path-present" | "package-script-card-type-present" | "locale-required-count-positive" | "locale-en-required" | "locale-archive-count-matches-required" | "locale-no-missing-required" | "locale-fallbacks-declared" | "locale-language-codes-normalized" | "locale-paths-normalized" | "locale-files-json-extension" | "locale-files-under-locales" | "locale-invalid-count-zero" | "script-path-matches-manifest" | "script-name-matches-custom-element" | "script-resource-path-matches-filename" | "script-card-type-matches-element" | "script-card-type-custom-prefix" | "script-default-config-present" | "script-default-title-matches-package" | "script-default-config-type-matches-card" | "script-source-nonempty" | "script-source-registers-custom-cards" | "script-source-has-card-size" | "script-source-has-stub-config" | "script-source-has-ha-card" | "script-source-has-shadow-dom" | "example-title-present" | "example-title-matches-package" | "example-entities-present" | "example-entities-nonempty" | "example-first-entity-safe" | "example-replacement-hint-present" | "readme-resource-path-case-sensitive" | "readme-card-type-case-sensitive" | "readme-has-resource-detail" | "readme-has-card-detail" | "import-summary-title-present" | "import-summary-entities-present" | "import-summary-target-supported" | "import-summary-layout-supported" | "import-summary-format-supported" | "import-summary-dependency-present" | "import-summary-safe-for-demo" | "import-review-lines-available" | "import-report-counts-balanced" | "import-report-has-failures-when-rejected" | "import-report-ready-only-when-importable" | "import-report-no-pending-when-ready" | "import-report-terminal-check-present" | "import-report-first-check-readable" | "import-report-last-check-importable" | "import-report-statuses-known" | "import-report-100-checks";
export interface HomeAssistantCardEditorHacsBundleReadinessCheck {
    readonly code: HomeAssistantCardEditorHacsBundleReadinessCheckCode;
    readonly status: HomeAssistantCardEditorHacsBundleReadinessCheckStatus;
    readonly label: string;
    readonly detail: string;
}
export interface HomeAssistantCardEditorHacsBundleReadinessReport {
    readonly status: HomeAssistantCardEditorHacsBundleReadinessStatus;
    readonly ready: boolean;
    readonly passed: number;
    readonly failed: number;
    readonly pending: number;
    readonly checks: readonly HomeAssistantCardEditorHacsBundleReadinessCheck[];
}
export type HomeAssistantCardEditorHacsBundleReadinessGroupId = "archive" | "manifest" | "package" | "locale" | "script" | "example" | "readme" | "import";
export type HomeAssistantCardEditorHacsBundleReadinessStatus = "ready" | "blocked" | "pending";
export type HomeAssistantCardEditorHacsBundleReadinessGroupStatus = HomeAssistantCardEditorHacsBundleReadinessStatus;
export interface HomeAssistantCardEditorHacsBundleReadinessGroup {
    readonly id: HomeAssistantCardEditorHacsBundleReadinessGroupId;
    readonly label: string;
    readonly status: HomeAssistantCardEditorHacsBundleReadinessGroupStatus;
    readonly ready: boolean;
    readonly passed: number;
    readonly failed: number;
    readonly pending: number;
    readonly firstFailedCheck?: HomeAssistantCardEditorHacsBundleReadinessCheck;
    readonly firstPendingCheck?: HomeAssistantCardEditorHacsBundleReadinessCheck;
    readonly checks: readonly HomeAssistantCardEditorHacsBundleReadinessCheck[];
}
export interface HomeAssistantCardEditorHacsBundleReadinessAttentionSummary {
    readonly attentionCount: number;
    readonly blockedCount: number;
    readonly pendingCount: number;
    readonly nextAction: string;
    readonly nextActionCheck?: HomeAssistantCardEditorHacsBundleReadinessCheck;
    readonly attentionLabels: readonly string[];
    readonly blockedLabels: readonly string[];
    readonly pendingLabels: readonly string[];
}
export interface HomeAssistantCardEditorHacsBundleReadinessOverview {
    readonly status: HomeAssistantCardEditorHacsBundleReadinessStatus;
    readonly ready: boolean;
    readonly passed: number;
    readonly failed: number;
    readonly pending: number;
    readonly groupCount: number;
    readonly readyGroups: number;
    readonly blockedGroups: number;
    readonly pendingGroups: number;
    readonly firstFailedCheck?: HomeAssistantCardEditorHacsBundleReadinessCheck;
    readonly firstPendingCheck?: HomeAssistantCardEditorHacsBundleReadinessCheck;
    readonly firstBlockedGroup?: HomeAssistantCardEditorHacsBundleReadinessGroup;
    readonly firstPendingGroup?: HomeAssistantCardEditorHacsBundleReadinessGroup;
    readonly attentionGroups: readonly HomeAssistantCardEditorHacsBundleReadinessGroup[];
    readonly blockedAttentionGroups: readonly HomeAssistantCardEditorHacsBundleReadinessGroup[];
    readonly pendingAttentionGroups: readonly HomeAssistantCardEditorHacsBundleReadinessGroup[];
    readonly attentionSummary: HomeAssistantCardEditorHacsBundleReadinessAttentionSummary;
    readonly groups: readonly HomeAssistantCardEditorHacsBundleReadinessGroup[];
}
export interface HomeAssistantCardEditorHacsBundleArchiveMetadata {
    readonly name?: string;
    readonly filename?: string;
    readonly renderReadme?: boolean;
    readonly nameMatchesPackage: boolean;
    readonly scriptMatchesArchive: boolean;
    readonly scriptMatchesPackage: boolean;
}
export interface HomeAssistantCardEditorHacsBundleArchiveLocaleReadiness {
    readonly manifestLanguages: readonly string[];
    readonly fallbackLanguages: readonly string[];
    readonly archiveLocaleFiles: readonly string[];
    readonly requiredLocaleFiles: readonly string[];
    readonly missingArchiveLocaleFiles: readonly string[];
    readonly invalidArchiveLocaleFiles: readonly string[];
    readonly invalidArchiveLocales: readonly HomeAssistantCardEditorHacsBundleArchiveInvalidLocale[];
}
export interface HomeAssistantCardEditorHacsBundleArchiveInvalidLocale {
    readonly path: string;
    readonly expectedLanguage: string;
    readonly actualLanguage?: string;
    readonly reason: "invalid-json" | "missing-meta-language" | "language-mismatch";
}
export interface HomeAssistantCardEditorHacsBundleArchiveScriptReadiness {
    readonly path?: string;
    readonly expectedCustomElementName?: string;
    readonly definesCustomElement: boolean;
    readonly valid: boolean;
    readonly reason: "ok" | "missing-script" | "missing-custom-element-name" | "custom-element-mismatch";
}
export interface HomeAssistantCardEditorHacsBundleArchiveExampleReadiness {
    readonly path: "examples/lovelace-card.json";
    readonly expectedType?: string;
    readonly actualType?: string;
    readonly valid: boolean;
    readonly reason: "ok" | "invalid-json" | "missing-type" | "type-mismatch";
}
export interface HomeAssistantCardEditorHacsBundleArchiveReadmeReadiness {
    readonly path: "README.md";
    readonly expectedResourcePath?: string;
    readonly expectedCardType?: string;
    readonly mentionsResourcePath: boolean;
    readonly mentionsCardType: boolean;
    readonly valid: boolean;
    readonly reason: "ok" | "missing-resource-path" | "missing-card-type";
}
export declare function createHomeAssistantCardEditorHacsBundle(cardPackage: HomeAssistantCardExportPackage): HomeAssistantCardEditorHacsBundle;
export declare function inspectHomeAssistantCardEditorHacsBundleArchive(content: Uint8Array): HomeAssistantCardEditorHacsBundleArchiveInspection;
export declare function readHomeAssistantCardEditorHacsBundleArchivePackage(content: Uint8Array): HomeAssistantCardEditorHacsBundleArchivePackageRead;
export declare function createHomeAssistantCardEditorHacsBundleArchive(input: HomeAssistantCardEditorHacsBundle | HomeAssistantCardExportPackage): HomeAssistantCardEditorHacsBundleArchive;
export declare function formatHomeAssistantCardEditorHacsBundlePackageReadReviewLines(packageRead: HomeAssistantCardEditorHacsBundleArchivePackageRead): readonly string[];
export declare function formatHomeAssistantCardEditorHacsBundleReadinessOverviewLines(packageRead: HomeAssistantCardEditorHacsBundleArchivePackageRead): readonly string[];
export declare function formatHomeAssistantCardEditorHacsBundleReadinessGroupLines(packageRead: HomeAssistantCardEditorHacsBundleArchivePackageRead): readonly string[];
export declare function formatHomeAssistantCardEditorHacsBundleReadinessAttentionLines(packageRead: HomeAssistantCardEditorHacsBundleArchivePackageRead): readonly string[];
export declare function formatHomeAssistantCardEditorHacsBundlePackageReadinessReviewLines(packageRead: HomeAssistantCardEditorHacsBundleArchivePackageRead): readonly string[];
export declare function createHomeAssistantCardEditorHacsBundleReadinessReport(packageRead: HomeAssistantCardEditorHacsBundleArchivePackageRead): HomeAssistantCardEditorHacsBundleReadinessReport;
export declare function createHomeAssistantCardEditorHacsBundleReadinessOverview(packageRead: HomeAssistantCardEditorHacsBundleArchivePackageRead): HomeAssistantCardEditorHacsBundleReadinessOverview;
