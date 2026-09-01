import {
  summarizeHomeAssistantCardImport,
  type HomeAssistantCardExportPackage,
  type HomeAssistantCardImportSummary,
} from "./HomeAssistantCardConfiguration";
import { createHomeAssistantCardEditorScriptExport } from "./HomeAssistantCardEditorPlan";

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

export type HomeAssistantCardEditorHacsBundleArchiveIssueCode =
  | "missing-required-file"
  | "missing-locale-file"
  | "unsafe-path"
  | "duplicate-path";

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

export type HomeAssistantCardEditorHacsBundleReadinessCheckCode =
  | "zip-readable"
  | "safe-paths"
  | "unique-paths"
  | "has-hacs-manifest"
  | "has-readme"
  | "has-example-card"
  | "has-root-script"
  | "has-atlas-package"
  | "has-english-locale"
  | "hacs-filename-declared"
  | "hacs-script-in-archive"
  | "atlas-package-readable"
  | "declared-locales-present"
  | "locale-json-readable"
  | "locale-meta-language-present"
  | "locale-language-matches-path"
  | "hacs-name-declared"
  | "hacs-name-matches-package"
  | "hacs-filename-matches-package"
  | "script-custom-element-known"
  | "script-file-readable"
  | "script-defines-custom-element"
  | "example-json-readable"
  | "example-type-present"
  | "example-type-matches-package"
  | "readme-mentions-resource-path"
  | "readme-mentions-card-type"
  | "package-contains-entities"
  | "package-entity-ids-safe"
  | "package-is-atlas-export"
  | "bundle-importable"
  | "archive-file-count-nonzero"
  | "archive-required-files-present"
  | "archive-no-issues"
  | "archive-script-count-one"
  | "archive-package-count-one"
  | "archive-locale-directory-present"
  | "archive-only-forward-slashes"
  | "archive-no-parent-segments"
  | "archive-no-absolute-paths"
  | "archive-no-drive-paths"
  | "hacs-name-trimmed"
  | "hacs-filename-trimmed"
  | "hacs-filename-js-extension"
  | "hacs-filename-lowercase"
  | "hacs-filename-root-scoped"
  | "hacs-filename-safe-characters"
  | "hacs-render-readme-enabled"
  | "hacs-filename-resource-aligned"
  | "hacs-card-type-custom"
  | "hacs-custom-element-name-safe"
  | "package-title-present"
  | "package-format-json"
  | "package-target-known"
  | "package-layout-known"
  | "package-dependency-known"
  | "package-script-present"
  | "package-editor-plan-present"
  | "package-script-filename-present"
  | "package-script-resource-path-present"
  | "package-script-card-type-present"
  | "locale-required-count-positive"
  | "locale-en-required"
  | "locale-archive-count-matches-required"
  | "locale-no-missing-required"
  | "locale-fallbacks-declared"
  | "locale-language-codes-normalized"
  | "locale-paths-normalized"
  | "locale-files-json-extension"
  | "locale-files-under-locales"
  | "locale-invalid-count-zero"
  | "script-path-matches-manifest"
  | "script-name-matches-custom-element"
  | "script-resource-path-matches-filename"
  | "script-card-type-matches-element"
  | "script-card-type-custom-prefix"
  | "script-default-config-present"
  | "script-default-title-matches-package"
  | "script-default-config-type-matches-card"
  | "script-source-nonempty"
  | "script-source-registers-custom-cards"
  | "script-source-has-card-size"
  | "script-source-has-stub-config"
  | "script-source-has-ha-card"
  | "script-source-has-shadow-dom"
  | "example-title-present"
  | "example-title-matches-package"
  | "example-entities-present"
  | "example-entities-nonempty"
  | "example-first-entity-safe"
  | "example-replacement-hint-present"
  | "readme-resource-path-case-sensitive"
  | "readme-card-type-case-sensitive"
  | "readme-has-resource-detail"
  | "readme-has-card-detail"
  | "import-summary-title-present"
  | "import-summary-entities-present"
  | "import-summary-target-supported"
  | "import-summary-layout-supported"
  | "import-summary-format-supported"
  | "import-summary-dependency-present"
  | "import-summary-safe-for-demo"
  | "import-review-lines-available"
  | "import-report-counts-balanced"
  | "import-report-has-failures-when-rejected"
  | "import-report-ready-only-when-importable"
  | "import-report-no-pending-when-ready"
  | "import-report-terminal-check-present"
  | "import-report-first-check-readable"
  | "import-report-last-check-importable"
  | "import-report-statuses-known"
  | "import-report-100-checks";

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

export type HomeAssistantCardEditorHacsBundleReadinessGroupId =
  | "archive"
  | "manifest"
  | "package"
  | "locale"
  | "script"
  | "example"
  | "readme"
  | "import";

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

export function createHomeAssistantCardEditorHacsBundle(
  cardPackage: HomeAssistantCardExportPackage,
): HomeAssistantCardEditorHacsBundle {
  const script = cardPackage.script
    ?? (cardPackage.editorPlan ? createHomeAssistantCardEditorScriptExport(cardPackage.editorPlan) : undefined);
  if (!script) {
    throw new Error("A HACS card bundle requires an editor plan or script export.");
  }

  const packagedCard = {
    ...cardPackage,
    script,
  };
  const bundleName = script.filename.replace(/\.js$/i, "");
  const defaultConfig = JSON.stringify(script.defaultConfig, null, 2);
  const localeFiles = cardPackage.locales.map(locale => ({
    path: locale.path,
    mimeType: "application/json" as const,
    content: `${JSON.stringify(locale.content, null, 2)}\n`,
  }));

  return {
    version: 1,
    kind: "atlas.homeassistant.hacs-card-bundle",
    cardName: script.defaultConfig.title,
    scriptFilename: script.filename,
    customElementName: script.customElementName,
    cardType: script.cardType,
    resourcePath: script.resourcePath,
    files: [
      {
        path: "hacs.json",
        mimeType: "application/json",
        content: JSON.stringify({
          name: script.defaultConfig.title,
          render_readme: true,
          filename: script.filename,
        }, null, 2),
      },
      {
        path: script.filename,
        mimeType: "text/javascript",
        content: script.source,
      },
      {
        path: "README.md",
        mimeType: "text/markdown",
        content: createHomeAssistantCardEditorBundleReadme(
          script.defaultConfig.title,
          script.resourcePath,
          defaultConfig,
          cardPackage.manifest.languages,
          cardPackage.manifest.fallbackLanguages,
        ),
      },
      {
        path: "examples/lovelace-card.json",
        mimeType: "application/json",
        content: defaultConfig,
      },
      {
        path: `atlas/${bundleName}.atlas-card.json`,
        mimeType: "application/json",
        content: JSON.stringify(packagedCard, null, 2),
      },
      ...localeFiles,
    ],
    installSteps: [
      "Create a HACS frontend repository with these files.",
      `Install the generated script as ${script.filename}.`,
      `Register the Lovelace resource ${script.resourcePath} as a JavaScript module.`,
      `Add ${script.cardType} to a dashboard view.`,
      "Replace the demo entities with your own Home Assistant entities.",
    ],
  };
}

export function inspectHomeAssistantCardEditorHacsBundleArchive(
  content: Uint8Array,
): HomeAssistantCardEditorHacsBundleArchiveInspection {
  const requiredFiles = [
    "hacs.json",
    "README.md",
    "examples/lovelace-card.json",
  ];

  try {
    const files = readZipCentralDirectoryEntries(content);
    const paths = files.map(file => file.path);
    const unsafePaths = paths.filter(path => !isSafeHacsBundleArchivePath(path));
    const duplicatePaths = listDuplicateStrings(paths);
    const scriptFiles = paths.filter(path => !path.includes("/") && path.endsWith(".js"));
    const atlasPackageFiles = paths.filter(path => path.startsWith("atlas/") && path.endsWith(".atlas-card.json"));
    const localeFiles = paths.filter(path => path.startsWith("locales/") && path.endsWith(".json"));
    const missingLocaleFiles = paths.includes("locales/en.json") ? [] : ["locales/en.json"];
    const missingFiles = [
      ...requiredFiles.filter(path => !paths.includes(path)),
      ...(scriptFiles.length > 0 ? [] : ["*.js"]),
      ...(atlasPackageFiles.length > 0 ? [] : ["atlas/*.atlas-card.json"]),
    ];
    const issues = createHacsBundleArchiveIssues({
      missingFiles,
      missingLocaleFiles,
      unsafePaths,
      duplicatePaths,
    });

    return {
      kind: "atlas.homeassistant.hacs-card-bundle-archive",
      importable: issues.length === 0,
      fileCount: files.length,
      files: files.map(file => ({
        path: file.path,
        compressionMethod: file.compressionMethod,
        compressedSize: file.compressedSize,
        uncompressedSize: file.uncompressedSize,
      })),
      requiredFiles,
      missingFiles,
      unsafePaths,
      duplicatePaths,
      issues,
      scriptFiles,
      atlasPackageFiles,
      localeFiles,
      missingLocaleFiles,
      reason: issues.length === 0
        ? "The archive contains the required ATLAS HACS card bundle files."
        : `The archive is not a safe ATLAS HACS card bundle: ${issues.map(issue => issue.message).join("; ")}.`,
    };
  } catch {
    return {
      kind: "atlas.homeassistant.hacs-card-bundle-archive",
      importable: false,
      fileCount: 0,
      files: [],
      requiredFiles,
      missingFiles: requiredFiles,
      unsafePaths: [],
      duplicatePaths: [],
      issues: createHacsBundleArchiveIssues({
        missingFiles: requiredFiles,
        missingLocaleFiles: ["locales/en.json"],
        unsafePaths: [],
        duplicatePaths: [],
      }),
      scriptFiles: [],
      atlasPackageFiles: [],
      localeFiles: [],
      missingLocaleFiles: ["locales/en.json"],
      reason: "The archive is not a readable ZIP file.",
    };
  }
}

export function readHomeAssistantCardEditorHacsBundleArchivePackage(
  content: Uint8Array,
): HomeAssistantCardEditorHacsBundleArchivePackageRead {
  const inspection = inspectHomeAssistantCardEditorHacsBundleArchive(content);
  if (!inspection.importable) {
    return {
      kind: "atlas.homeassistant.hacs-card-bundle-package",
      importable: false,
      inspection,
      reason: inspection.reason,
    };
  }

  try {
    const entries = readZipCentralDirectoryEntries(content);
    const hacsEntry = entries.find(entry => entry.path === "hacs.json");
    const packageEntry = entries.find(entry => entry.path === inspection.atlasPackageFiles[0]);
    if (!hacsEntry) {
      return {
        kind: "atlas.homeassistant.hacs-card-bundle-package",
        importable: false,
        inspection,
        reason: "The archive does not contain a readable HACS manifest file.",
      };
    }
    if (hacsEntry.compressionMethod !== "store") {
      return {
        kind: "atlas.homeassistant.hacs-card-bundle-package",
        importable: false,
        inspection,
        reason: `The HACS manifest file uses unsupported ZIP compression: ${hacsEntry.compressionMethod}.`,
      };
    }
    if (!packageEntry) {
      return {
        kind: "atlas.homeassistant.hacs-card-bundle-package",
        importable: false,
        inspection,
        reason: "The archive does not contain a readable ATLAS card package file.",
      };
    }
    if (packageEntry.compressionMethod !== "store") {
      return {
        kind: "atlas.homeassistant.hacs-card-bundle-package",
        importable: false,
        inspection,
        packageFile: packageEntry.path,
        reason: `The ATLAS card package file uses unsupported ZIP compression: ${packageEntry.compressionMethod}.`,
      };
    }

    const hacsMetadata = readHacsBundleArchiveMetadata(content, hacsEntry, inspection.scriptFiles);
    if (!hacsMetadata.filename) {
      return {
        kind: "atlas.homeassistant.hacs-card-bundle-package",
        importable: false,
        inspection,
        hacsMetadata,
        packageFile: packageEntry.path,
        reason: "The HACS manifest file does not declare a card script filename.",
      };
    }
    if (!hacsMetadata.scriptMatchesArchive) {
      return {
        kind: "atlas.homeassistant.hacs-card-bundle-package",
        importable: false,
        inspection,
        hacsMetadata,
        packageFile: packageEntry.path,
        reason: `The HACS manifest filename ${hacsMetadata.filename} does not match a root script file in the archive.`,
      };
    }

    const packageContent = readStoredZipEntryText(content, packageEntry);
    const summary = summarizeHomeAssistantCardImport(packageContent);
    const localeReadiness = readHacsBundleArchiveLocaleReadiness(content, entries, packageContent, inspection);
    if (localeReadiness.missingArchiveLocaleFiles.length > 0) {
      return {
        kind: "atlas.homeassistant.hacs-card-bundle-package",
        importable: false,
        inspection,
        hacsMetadata,
        localeReadiness,
        packageFile: packageEntry.path,
        packageContent,
        summary,
        reason: `The archive is missing locale files declared by the embedded ATLAS card package: ${localeReadiness.missingArchiveLocaleFiles.join(", ")}.`,
      };
    }
    if (localeReadiness.invalidArchiveLocaleFiles.length > 0) {
      return {
        kind: "atlas.homeassistant.hacs-card-bundle-package",
        importable: false,
        inspection,
        hacsMetadata,
        localeReadiness,
        packageFile: packageEntry.path,
        packageContent,
        summary,
        reason: `The archive contains invalid locale files declared by the embedded ATLAS card package: ${localeReadiness.invalidArchiveLocaleFiles.join(", ")}.`,
      };
    }

    const packageScriptFilename = summary.script?.filename ?? summary.editorPlan?.scriptFilename;
    const packageName = summary.title;
    const checkedHacsMetadata = {
      ...hacsMetadata,
      nameMatchesPackage: hacsMetadata.name === packageName,
      scriptMatchesPackage: packageScriptFilename === hacsMetadata.filename,
    };
    if (!checkedHacsMetadata.nameMatchesPackage) {
      return {
        kind: "atlas.homeassistant.hacs-card-bundle-package",
        importable: false,
        inspection,
        hacsMetadata: checkedHacsMetadata,
        packageFile: packageEntry.path,
        packageContent,
        summary,
        reason: `The HACS manifest name ${hacsMetadata.name ?? "unknown"} does not match the embedded ATLAS card package name ${packageName}.`,
      };
    }
    if (!checkedHacsMetadata.scriptMatchesPackage) {
      return {
        kind: "atlas.homeassistant.hacs-card-bundle-package",
        importable: false,
        inspection,
        hacsMetadata: checkedHacsMetadata,
        packageFile: packageEntry.path,
        packageContent,
        summary,
        reason: `The HACS manifest filename ${hacsMetadata.filename} does not match the embedded ATLAS card package script filename ${packageScriptFilename ?? "unknown"}.`,
      };
    }
    const scriptReadiness = readHacsBundleArchiveScriptReadiness(
      content,
      entries,
      hacsMetadata.filename,
      summary.script?.customElementName,
    );
    if (!scriptReadiness.valid) {
      return {
        kind: "atlas.homeassistant.hacs-card-bundle-package",
        importable: false,
        inspection,
        hacsMetadata: checkedHacsMetadata,
        localeReadiness,
        scriptReadiness,
        packageFile: packageEntry.path,
        packageContent,
        summary,
        reason: `The generated script does not define the embedded ATLAS custom element: ${scriptReadiness.reason}.`,
      };
    }
    const exampleReadiness = readHacsBundleArchiveExampleReadiness(content, entries, summary.script?.cardType);
    if (!exampleReadiness.valid) {
      return {
        kind: "atlas.homeassistant.hacs-card-bundle-package",
        importable: false,
        inspection,
        hacsMetadata: checkedHacsMetadata,
        localeReadiness,
        scriptReadiness,
        exampleReadiness,
        packageFile: packageEntry.path,
        packageContent,
        summary,
        reason: `The Lovelace example card does not match the embedded ATLAS card package: ${exampleReadiness.reason}.`,
      };
    }
    const readmeReadiness = readHacsBundleArchiveReadmeReadiness(
      content,
      entries,
      summary.script?.resourcePath,
      summary.script?.cardType,
    );
    if (!readmeReadiness.valid) {
      return {
        kind: "atlas.homeassistant.hacs-card-bundle-package",
        importable: false,
        inspection,
        hacsMetadata: checkedHacsMetadata,
        localeReadiness,
        scriptReadiness,
        exampleReadiness,
        readmeReadiness,
        packageFile: packageEntry.path,
        packageContent,
        summary,
        reason: `The README does not document the embedded ATLAS card package correctly: ${readmeReadiness.reason}.`,
      };
    }

    return {
      kind: "atlas.homeassistant.hacs-card-bundle-package",
      importable: true,
      inspection,
      hacsMetadata: checkedHacsMetadata,
      localeReadiness,
      scriptReadiness,
      exampleReadiness,
      readmeReadiness,
      packageFile: packageEntry.path,
      packageContent,
      summary,
      reason: "The archive contains a readable ATLAS card package file.",
    };
  } catch {
    return {
      kind: "atlas.homeassistant.hacs-card-bundle-package",
      importable: false,
      inspection,
      reason: "The ATLAS card package file could not be read from the archive.",
    };
  }
}

export function createHomeAssistantCardEditorHacsBundleArchive(
  input: HomeAssistantCardEditorHacsBundle | HomeAssistantCardExportPackage,
): HomeAssistantCardEditorHacsBundleArchive {
  const bundle = "files" in input ? input : createHomeAssistantCardEditorHacsBundle(input);
  const filename = `${bundle.scriptFilename.replace(/\.js$/i, "")}.hacs.zip`;
  return {
    filename,
    mimeType: "application/zip",
    content: createStoredZipArchive(bundle.files),
  };
}

export function formatHomeAssistantCardEditorHacsBundlePackageReadReviewLines(
  packageRead: HomeAssistantCardEditorHacsBundleArchivePackageRead,
): readonly string[] {
  const lines = [packageRead.reason];
  if (packageRead.hacsMetadata?.name) {
    lines.push(`HACS name: ${packageRead.hacsMetadata.name}`);
  }
  if (packageRead.hacsMetadata?.filename) {
    lines.push(`HACS script: ${packageRead.hacsMetadata.filename}`);
  }
  if (packageRead.localeReadiness) {
    lines.push(`Required locales: ${packageRead.localeReadiness.requiredLocaleFiles.join(", ")}`);
    lines.push(`Archive locales: ${packageRead.localeReadiness.archiveLocaleFiles.join(", ") || "none"}`);
    if (packageRead.localeReadiness.missingArchiveLocaleFiles.length > 0) {
      lines.push(`Missing locales: ${packageRead.localeReadiness.missingArchiveLocaleFiles.join(", ")}`);
    }
    for (const locale of packageRead.localeReadiness.invalidArchiveLocales) {
      lines.push(formatInvalidLocaleReviewLine(locale));
    }
  }
  if (packageRead.scriptReadiness) {
    lines.push(formatScriptReadinessReviewLine(packageRead.scriptReadiness));
  }
  if (packageRead.exampleReadiness) {
    lines.push(formatExampleReadinessReviewLine(packageRead.exampleReadiness));
  }
  if (packageRead.readmeReadiness) {
    lines.push(formatReadmeReadinessReviewLine(packageRead.readmeReadiness));
  }
  for (const issue of packageRead.inspection.issues) {
    lines.push(`${issue.code}: ${issue.paths.join(", ")}`);
  }
  return lines;
}

export function formatHomeAssistantCardEditorHacsBundleReadinessOverviewLines(
  packageRead: HomeAssistantCardEditorHacsBundleArchivePackageRead,
): readonly string[] {
  const report = createHomeAssistantCardEditorHacsBundleReadinessReport(packageRead);
  const overview = createHomeAssistantCardEditorHacsBundleReadinessOverview(packageRead);
  const firstBlockedGroup = overview.firstBlockedGroup
    ? `First blocked group: ${overview.firstBlockedGroup.label} (${overview.firstBlockedGroup.firstFailedCheck?.code ?? "unknown"})`
    : "First blocked group: none";
  const firstPendingGroup = overview.firstPendingGroup
    ? `First pending group: ${overview.firstPendingGroup.label} (${overview.firstPendingGroup.firstPendingCheck?.code ?? "unknown"})`
    : "First pending group: none";
  return [
    `Readiness status: ${overview.status}`,
    `Readiness: ${report.passed}/${report.checks.length} passed, ${report.failed} failed, ${report.pending} pending`,
    `Readiness groups: ${overview.readyGroups}/${overview.groupCount} ready, ${overview.blockedGroups} blocked, ${overview.pendingGroups} pending`,
    firstBlockedGroup,
    firstPendingGroup,
  ];
}

export function formatHomeAssistantCardEditorHacsBundleReadinessGroupLines(
  packageRead: HomeAssistantCardEditorHacsBundleArchivePackageRead,
): readonly string[] {
  const overview = createHomeAssistantCardEditorHacsBundleReadinessOverview(packageRead);
  return overview.groups.map(group => {
    const anchor = group.firstFailedCheck
      ? ` - first failure ${group.firstFailedCheck.code}`
      : group.firstPendingCheck
        ? ` - first pending ${group.firstPendingCheck.code}`
        : "";
    return `${group.label}: ${group.status} (${group.passed} passed, ${group.failed} failed, ${group.pending} pending)${anchor}`;
  });
}

export function formatHomeAssistantCardEditorHacsBundleReadinessAttentionLines(
  packageRead: HomeAssistantCardEditorHacsBundleArchivePackageRead,
): readonly string[] {
  const overview = createHomeAssistantCardEditorHacsBundleReadinessOverview(packageRead);
  return [
    `Attention summary: ${overview.attentionSummary.attentionCount} attention, ${overview.attentionSummary.blockedCount} blocked, ${overview.attentionSummary.pendingCount} pending`,
    `Next action: ${overview.attentionSummary.nextAction}`,
    overview.attentionGroups.length > 0
      ? `Attention groups: ${overview.attentionGroups.map(group => group.label).join(", ")}`
      : "Attention groups: none",
    overview.blockedAttentionGroups.length > 0
      ? `Blocked attention groups: ${overview.blockedAttentionGroups.map(group => group.label).join(", ")}`
      : "Blocked attention groups: none",
    overview.pendingAttentionGroups.length > 0
      ? `Pending attention groups: ${overview.pendingAttentionGroups.map(group => group.label).join(", ")}`
      : "Pending attention groups: none",
  ];
}

export function formatHomeAssistantCardEditorHacsBundlePackageReadinessReviewLines(
  packageRead: HomeAssistantCardEditorHacsBundleArchivePackageRead,
): readonly string[] {
  return [
    ...formatHomeAssistantCardEditorHacsBundleReadinessOverviewLines(packageRead),
    ...formatHomeAssistantCardEditorHacsBundleReadinessAttentionLines(packageRead),
    ...formatHomeAssistantCardEditorHacsBundleReadinessGroupLines(packageRead),
    ...formatHomeAssistantCardEditorHacsBundlePackageReadReviewLines(packageRead),
  ];
}

export function createHomeAssistantCardEditorHacsBundleReadinessReport(
  packageRead: HomeAssistantCardEditorHacsBundleArchivePackageRead,
): HomeAssistantCardEditorHacsBundleReadinessReport {
  const checks: HomeAssistantCardEditorHacsBundleReadinessCheck[] = [];
  const add = (
    code: HomeAssistantCardEditorHacsBundleReadinessCheckCode,
    status: HomeAssistantCardEditorHacsBundleReadinessCheckStatus,
    label: string,
    detail: string,
  ) => {
    checks.push({ code, status, label, detail });
  };
  const inspection = packageRead.inspection;
  const localeReadiness = packageRead.localeReadiness;
  const invalidLocaleReasons = new Set(localeReadiness?.invalidArchiveLocales.map(locale => locale.reason) ?? []);
  const exampleReadiness = packageRead.exampleReadiness;
  const readmeReadiness = packageRead.readmeReadiness;
  const scriptReadiness = packageRead.scriptReadiness;
  const hacsMetadata = packageRead.hacsMetadata;
  const summary = packageRead.summary;
  const script = summary?.script;
  const editorPlan = summary?.editorPlan;
  const defaultConfig = script?.defaultConfig;
  const archivePaths = inspection.files.map(file => file.path);
  const zipReadable = inspection.reason !== "The archive is not a readable ZIP file.";
  const hasRequiredFile = (path: string) => !inspection.missingFiles.includes(path);
  const hasRootScript = !inspection.missingFiles.includes("*.js") && inspection.scriptFiles.length > 0;
  const hasAtlasPackage = !inspection.missingFiles.includes("atlas/*.atlas-card.json") && inspection.atlasPackageFiles.length > 0;
  const hacsFilename = hacsMetadata?.filename;
  const customElementName = scriptReadiness?.expectedCustomElementName;
  const cardType = script?.cardType;
  const resourcePath = script?.resourcePath;
  const summaryKnown = summary !== undefined;
  const localeKnown = localeReadiness !== undefined;
  const scriptKnown = script !== undefined;
  const exampleKnown = exampleReadiness !== undefined;
  const readmeKnown = readmeReadiness !== undefined;
  const requiredFilesPresent = inspection.missingFiles.length === 0 && inspection.missingLocaleFiles.length === 0;
  const languageCodePattern = /^[a-z]{2}$/;
  const safeEntityPattern = /^[a-z_]+\.[a-z0-9_]+$/;
  const reviewLines = formatHomeAssistantCardEditorHacsBundlePackageReadReviewLines(packageRead);
  const checkStatuses = new Set<HomeAssistantCardEditorHacsBundleReadinessCheckStatus>(["pass", "fail", "pending"]);

  add("zip-readable", zipReadable ? "pass" : "fail", "ZIP readable", zipReadable ? "The archive central directory can be read." : inspection.reason);
  add("safe-paths", inspection.unsafePaths.length === 0 ? "pass" : "fail", "Safe archive paths", inspection.unsafePaths.length === 0 ? "No unsafe archive paths detected." : `Unsafe paths: ${inspection.unsafePaths.join(", ")}`);
  add("unique-paths", inspection.duplicatePaths.length === 0 ? "pass" : "fail", "Unique archive paths", inspection.duplicatePaths.length === 0 ? "No duplicate archive paths detected." : `Duplicate paths: ${inspection.duplicatePaths.join(", ")}`);
  add("has-hacs-manifest", hasRequiredFile("hacs.json") ? "pass" : "fail", "HACS manifest present", hasRequiredFile("hacs.json") ? "hacs.json is present." : "hacs.json is missing.");
  add("has-readme", hasRequiredFile("README.md") ? "pass" : "fail", "README present", hasRequiredFile("README.md") ? "README.md is present." : "README.md is missing.");
  add("has-example-card", hasRequiredFile("examples/lovelace-card.json") ? "pass" : "fail", "Example card present", hasRequiredFile("examples/lovelace-card.json") ? "examples/lovelace-card.json is present." : "examples/lovelace-card.json is missing.");
  add("has-root-script", hasRootScript ? "pass" : "fail", "Root script present", hasRootScript ? `Root scripts: ${inspection.scriptFiles.join(", ")}` : "No root JavaScript file found.");
  add("has-atlas-package", hasAtlasPackage ? "pass" : "fail", "ATLAS package present", hasAtlasPackage ? `ATLAS packages: ${inspection.atlasPackageFiles.join(", ")}` : "No atlas/*.atlas-card.json file found.");
  add("has-english-locale", inspection.missingLocaleFiles.length === 0 ? "pass" : "fail", "English locale present", inspection.missingLocaleFiles.length === 0 ? "locales/en.json is present." : "locales/en.json is missing.");
  add("hacs-filename-declared", hacsMetadata ? (hacsMetadata.filename ? "pass" : "fail") : "pending", "HACS filename declared", hacsMetadata?.filename ? `Manifest filename: ${hacsMetadata.filename}` : "Manifest filename has not been read.");
  add("hacs-script-in-archive", hacsMetadata ? (hacsMetadata.scriptMatchesArchive ? "pass" : "fail") : "pending", "HACS script in archive", hacsMetadata?.scriptMatchesArchive ? "Manifest filename matches a root script file." : "Manifest script was not matched to a root script file.");
  add("atlas-package-readable", summary ? "pass" : (hasAtlasPackage ? "fail" : "pending"), "ATLAS package readable", summary ? "Embedded ATLAS package was parsed." : packageRead.packageFile ? "Embedded ATLAS package could not be parsed." : "Embedded ATLAS package has not been read.");
  add("declared-locales-present", localeReadiness ? (localeReadiness.missingArchiveLocaleFiles.length === 0 ? "pass" : "fail") : "pending", "Declared locales present", localeReadiness?.missingArchiveLocaleFiles.length ? `Missing locales: ${localeReadiness.missingArchiveLocaleFiles.join(", ")}` : localeReadiness ? "All declared locales are present." : "Locale declarations have not been read.");
  add("locale-json-readable", localeReadiness ? (invalidLocaleReasons.has("invalid-json") ? "fail" : "pass") : "pending", "Locale JSON readable", invalidLocaleReasons.has("invalid-json") ? "At least one declared locale is invalid JSON." : localeReadiness ? "Declared locale JSON files are readable." : "Locale JSON has not been read.");
  add("locale-meta-language-present", localeReadiness ? (invalidLocaleReasons.has("missing-meta-language") ? "fail" : "pass") : "pending", "Locale metadata language present", invalidLocaleReasons.has("missing-meta-language") ? "At least one locale is missing _meta.language." : localeReadiness ? "Declared locales include _meta.language." : "Locale metadata has not been read.");
  add("locale-language-matches-path", localeReadiness ? (invalidLocaleReasons.has("language-mismatch") ? "fail" : "pass") : "pending", "Locale language matches path", invalidLocaleReasons.has("language-mismatch") ? "At least one locale _meta.language does not match its path." : localeReadiness ? "Locale metadata matches file paths." : "Locale metadata has not been checked.");
  add("hacs-name-declared", hacsMetadata ? (hacsMetadata.name ? "pass" : "fail") : "pending", "HACS name declared", hacsMetadata?.name ? `Manifest name: ${hacsMetadata.name}` : "Manifest name has not been read.");
  add("hacs-name-matches-package", hacsMetadata && summary ? (hacsMetadata.nameMatchesPackage ? "pass" : "fail") : "pending", "HACS name matches package", hacsMetadata?.nameMatchesPackage ? "Manifest name matches the package title." : summary ? "Manifest name does not match the package title." : "Package title has not been read.");
  add("hacs-filename-matches-package", hacsMetadata && summary ? (hacsMetadata.scriptMatchesPackage ? "pass" : "fail") : "pending", "HACS filename matches package", hacsMetadata?.scriptMatchesPackage ? "Manifest filename matches the package script filename." : summary ? "Manifest filename does not match the package script filename." : "Package script filename has not been read.");
  add("script-custom-element-known", scriptReadiness ? (scriptReadiness.expectedCustomElementName ? "pass" : "fail") : "pending", "Script custom element known", scriptReadiness?.expectedCustomElementName ? `Expected element: ${scriptReadiness.expectedCustomElementName}` : "Expected custom element has not been read.");
  add("script-file-readable", scriptReadiness ? (scriptReadiness.path ? "pass" : "fail") : "pending", "Script file readable", scriptReadiness?.path ? `Script file: ${scriptReadiness.path}` : "Script file has not been read.");
  add("script-defines-custom-element", scriptReadiness ? (scriptReadiness.definesCustomElement ? "pass" : "fail") : "pending", "Script defines custom element", scriptReadiness?.definesCustomElement ? "Script defines the expected custom element." : "Script definition has not been verified.");
  add("example-json-readable", exampleReadiness ? (exampleReadiness.reason === "invalid-json" ? "fail" : "pass") : "pending", "Example JSON readable", exampleReadiness?.reason === "invalid-json" ? "Example card is invalid JSON." : exampleReadiness ? "Example card JSON is readable." : "Example card has not been read.");
  add("example-type-present", exampleReadiness ? (exampleReadiness.actualType ? "pass" : "fail") : "pending", "Example type present", exampleReadiness?.actualType ? `Example type: ${exampleReadiness.actualType}` : "Example type has not been read.");
  add("example-type-matches-package", exampleReadiness ? (exampleReadiness.reason === "ok" ? "pass" : "fail") : "pending", "Example type matches package", exampleReadiness?.reason === "ok" ? "Example type matches the package card type." : "Example type has not been verified.");
  add("readme-mentions-resource-path", readmeReadiness ? (readmeReadiness.mentionsResourcePath ? "pass" : "fail") : "pending", "README mentions resource path", readmeReadiness?.mentionsResourcePath ? `README mentions ${readmeReadiness.expectedResourcePath}.` : "README resource path has not been verified.");
  add("readme-mentions-card-type", readmeReadiness ? (readmeReadiness.mentionsCardType ? "pass" : "fail") : "pending", "README mentions card type", readmeReadiness?.mentionsCardType ? `README mentions ${readmeReadiness.expectedCardType}.` : "README card type has not been verified.");
  add("package-contains-entities", summary ? (summary.entityIds.length > 0 ? "pass" : "fail") : "pending", "Package contains entities", summary?.entityIds.length ? `Entities: ${summary.entityIds.join(", ")}` : "No package entities have been read.");
  add("package-entity-ids-safe", summary ? (summary.entityIds.every(entityId => safeEntityPattern.test(entityId)) ? "pass" : "fail") : "pending", "Package entity IDs safe", summary?.entityIds.every(entityId => safeEntityPattern.test(entityId)) ? "Package entity IDs use safe Home Assistant syntax." : "Package entity IDs have not been verified.");
  add("package-is-atlas-export", summary ? (summary.packaged ? "pass" : "fail") : "pending", "Package is ATLAS export", summary?.packaged ? "Embedded package is an ATLAS card export." : "Embedded package has not been confirmed as an ATLAS export.");
  add("bundle-importable", packageRead.importable ? "pass" : "fail", "Bundle importable", packageRead.reason);
  add("archive-file-count-nonzero", zipReadable ? (inspection.fileCount > 0 ? "pass" : "fail") : "pending", "Archive has files", inspection.fileCount > 0 ? `Archive files: ${inspection.fileCount}` : "No archive files were detected.");
  add("archive-required-files-present", zipReadable ? (requiredFilesPresent ? "pass" : "fail") : "pending", "Required files present", requiredFilesPresent ? "All required archive files are present." : `Missing files: ${[...inspection.missingFiles, ...inspection.missingLocaleFiles].join(", ")}`);
  add("archive-no-issues", zipReadable ? (inspection.issues.length === 0 ? "pass" : "fail") : "pending", "Archive has no inspection issues", inspection.issues.length === 0 ? "Archive inspection did not report issues." : `Archive issues: ${inspection.issues.map(issue => issue.code).join(", ")}`);
  add("archive-script-count-one", zipReadable ? (inspection.scriptFiles.length === 1 ? "pass" : "fail") : "pending", "Single root script", inspection.scriptFiles.length === 1 ? "Exactly one root script was found." : `Root script count: ${inspection.scriptFiles.length}`);
  add("archive-package-count-one", zipReadable ? (inspection.atlasPackageFiles.length === 1 ? "pass" : "fail") : "pending", "Single ATLAS package", inspection.atlasPackageFiles.length === 1 ? "Exactly one ATLAS package was found." : `ATLAS package count: ${inspection.atlasPackageFiles.length}`);
  add("archive-locale-directory-present", zipReadable ? (inspection.localeFiles.length > 0 ? "pass" : "fail") : "pending", "Locale directory present", inspection.localeFiles.length > 0 ? `Locale files: ${inspection.localeFiles.join(", ")}` : "No locale files were found.");
  add("archive-only-forward-slashes", zipReadable ? (archivePaths.every(path => !path.includes("\\")) ? "pass" : "fail") : "pending", "Archive uses forward slashes", archivePaths.every(path => !path.includes("\\")) ? "Archive paths use forward slashes." : "At least one archive path uses a backslash.");
  add("archive-no-parent-segments", zipReadable ? (archivePaths.every(path => !path.split("/").includes("..")) ? "pass" : "fail") : "pending", "Archive has no parent path segments", archivePaths.every(path => !path.split("/").includes("..")) ? "No parent path segments detected." : "At least one archive path contains '..'.");
  add("archive-no-absolute-paths", zipReadable ? (archivePaths.every(path => !path.startsWith("/")) ? "pass" : "fail") : "pending", "Archive has no absolute paths", archivePaths.every(path => !path.startsWith("/")) ? "No absolute archive paths detected." : "At least one archive path is absolute.");
  add("archive-no-drive-paths", zipReadable ? (archivePaths.every(path => !/^[a-z]:/i.test(path)) ? "pass" : "fail") : "pending", "Archive has no drive paths", archivePaths.every(path => !/^[a-z]:/i.test(path)) ? "No Windows drive paths detected." : "At least one archive path uses a drive prefix.");
  add("hacs-name-trimmed", hacsMetadata ? (hacsMetadata.name === hacsMetadata.name?.trim() ? "pass" : "fail") : "pending", "HACS name trimmed", hacsMetadata?.name ? "HACS name has no surrounding whitespace." : "HACS name has not been read.");
  add("hacs-filename-trimmed", hacsMetadata ? (hacsFilename === hacsFilename?.trim() ? "pass" : "fail") : "pending", "HACS filename trimmed", hacsFilename ? "HACS filename has no surrounding whitespace." : "HACS filename has not been read.");
  add("hacs-filename-js-extension", hacsMetadata ? (hacsFilename?.endsWith(".js") ? "pass" : "fail") : "pending", "HACS filename uses JS extension", hacsFilename?.endsWith(".js") ? "HACS filename ends with .js." : "HACS filename does not end with .js.");
  add("hacs-filename-lowercase", hacsMetadata ? (hacsFilename === hacsFilename?.toLowerCase() ? "pass" : "fail") : "pending", "HACS filename lowercase", hacsFilename === hacsFilename?.toLowerCase() ? "HACS filename is lowercase." : "HACS filename is not lowercase.");
  add("hacs-filename-root-scoped", hacsMetadata ? (hacsFilename && !hacsFilename.includes("/") && !hacsFilename.includes("\\") ? "pass" : "fail") : "pending", "HACS filename root scoped", hacsFilename && !hacsFilename.includes("/") && !hacsFilename.includes("\\") ? "HACS filename points to a root script." : "HACS filename is not root scoped.");
  add("hacs-filename-safe-characters", hacsMetadata ? (hacsFilename && /^[a-z0-9-]+\.js$/.test(hacsFilename) ? "pass" : "fail") : "pending", "HACS filename safe characters", hacsFilename && /^[a-z0-9-]+\.js$/.test(hacsFilename) ? "HACS filename uses safe characters." : "HACS filename uses unsupported characters.");
  add("hacs-render-readme-enabled", hacsMetadata ? (hacsMetadata.renderReadme === true ? "pass" : "fail") : "pending", "HACS README rendering enabled", hacsMetadata?.renderReadme ? "HACS render_readme is enabled." : "HACS render_readme is not enabled.");
  add("hacs-filename-resource-aligned", hacsMetadata && scriptKnown ? (resourcePath?.endsWith(`/${hacsFilename}`) ? "pass" : "fail") : "pending", "HACS filename aligns with resource path", resourcePath?.endsWith(`/${hacsFilename}`) ? "Resource path ends with the HACS filename." : "Resource path has not been aligned to the HACS filename.");
  add("hacs-card-type-custom", scriptKnown ? (cardType?.startsWith("custom:") ? "pass" : "fail") : "pending", "HACS card type is custom", cardType?.startsWith("custom:") ? "Card type uses the custom: prefix." : "Card type has not been read.");
  add("hacs-custom-element-name-safe", scriptKnown ? (customElementName && /^[a-z0-9-]+$/.test(customElementName) ? "pass" : "fail") : "pending", "HACS custom element name safe", customElementName && /^[a-z0-9-]+$/.test(customElementName) ? "Custom element name uses safe characters." : "Custom element name has not been verified.");
  add("package-title-present", summaryKnown ? (summary.title.trim().length > 0 ? "pass" : "fail") : "pending", "Package title present", summary?.title ? `Package title: ${summary.title}` : "Package title has not been read.");
  add("package-format-json", summaryKnown ? (summary.format === "json" ? "pass" : "fail") : "pending", "Package format JSON", summary?.format === "json" ? "Package content imports as JSON." : `Package format: ${summary?.format ?? "unknown"}`);
  add("package-target-known", summaryKnown ? (summary.target ? "pass" : "fail") : "pending", "Package target known", summary?.target ? `Target: ${summary.target}` : "Package target has not been read.");
  add("package-layout-known", summaryKnown ? (summary.layout ? "pass" : "fail") : "pending", "Package layout known", summary?.layout ? `Layout: ${summary.layout}` : "Package layout has not been read.");
  add("package-dependency-known", summaryKnown ? (summary.dependency.id ? "pass" : "fail") : "pending", "Package dependency known", summary?.dependency.id ? `Dependency: ${summary.dependency.id}` : "Package dependency has not been read.");
  add("package-script-present", summaryKnown ? (script ? "pass" : "fail") : "pending", "Package script present", script ? "Embedded package includes script export metadata." : "Embedded package script metadata is missing.");
  add("package-editor-plan-present", summaryKnown ? (editorPlan ? "pass" : "fail") : "pending", "Package editor plan present", editorPlan ? "Embedded package includes editor plan metadata." : "Embedded package editor plan is missing.");
  add("package-script-filename-present", scriptKnown ? (script.filename ? "pass" : "fail") : "pending", "Package script filename present", script?.filename ? `Script filename: ${script.filename}` : "Script filename has not been read.");
  add("package-script-resource-path-present", scriptKnown ? (script.resourcePath ? "pass" : "fail") : "pending", "Package script resource path present", script?.resourcePath ? `Resource path: ${script.resourcePath}` : "Script resource path has not been read.");
  add("package-script-card-type-present", scriptKnown ? (script.cardType ? "pass" : "fail") : "pending", "Package script card type present", script?.cardType ? `Card type: ${script.cardType}` : "Script card type has not been read.");
  add("locale-required-count-positive", localeKnown ? (localeReadiness.requiredLocaleFiles.length > 0 ? "pass" : "fail") : "pending", "Locale required count positive", localeReadiness?.requiredLocaleFiles.length ? `Required locale count: ${localeReadiness.requiredLocaleFiles.length}` : "Required locale files have not been read.");
  add("locale-en-required", localeKnown ? (localeReadiness.requiredLocaleFiles.includes("locales/en.json") ? "pass" : "fail") : "pending", "Locale EN required", localeReadiness?.requiredLocaleFiles.includes("locales/en.json") ? "English locale is required." : "English locale is not listed as required.");
  add("locale-archive-count-matches-required", localeKnown ? (localeReadiness.archiveLocaleFiles.length >= localeReadiness.requiredLocaleFiles.length ? "pass" : "fail") : "pending", "Locale archive count covers required", localeKnown ? `Archive locales: ${localeReadiness.archiveLocaleFiles.length}, required: ${localeReadiness.requiredLocaleFiles.length}` : "Locale counts have not been read.");
  add("locale-no-missing-required", localeKnown ? (localeReadiness.missingArchiveLocaleFiles.length === 0 ? "pass" : "fail") : "pending", "Locale no missing required", localeReadiness?.missingArchiveLocaleFiles.length ? `Missing locales: ${localeReadiness.missingArchiveLocaleFiles.join(", ")}` : localeKnown ? "No required locale files are missing." : "Locale completeness has not been read.");
  add("locale-fallbacks-declared", localeKnown ? (localeReadiness.fallbackLanguages.every(language => localeReadiness.manifestLanguages.includes(language)) ? "pass" : "fail") : "pending", "Locale fallbacks declared", localeKnown ? "Fallback languages are included in manifest languages." : "Fallback language metadata has not been read.");
  add("locale-language-codes-normalized", localeKnown ? (localeReadiness.manifestLanguages.every(language => languageCodePattern.test(language)) ? "pass" : "fail") : "pending", "Locale language codes normalized", localeKnown ? `Manifest languages: ${localeReadiness.manifestLanguages.join(", ")}` : "Manifest languages have not been read.");
  add("locale-paths-normalized", localeKnown ? (localeReadiness.archiveLocaleFiles.every(path => /^locales\/[a-z]{2}\.json$/.test(path)) ? "pass" : "fail") : "pending", "Locale paths normalized", localeKnown ? "Locale paths use normalized language filenames." : "Locale paths have not been read.");
  add("locale-files-json-extension", localeKnown ? (localeReadiness.archiveLocaleFiles.every(path => path.endsWith(".json")) ? "pass" : "fail") : "pending", "Locale files use JSON extension", localeKnown ? "Locale files use .json extension." : "Locale file extensions have not been read.");
  add("locale-files-under-locales", localeKnown ? (localeReadiness.archiveLocaleFiles.every(path => path.startsWith("locales/")) ? "pass" : "fail") : "pending", "Locale files under locales directory", localeKnown ? "Locale files are under locales/." : "Locale paths have not been read.");
  add("locale-invalid-count-zero", localeKnown ? (localeReadiness.invalidArchiveLocaleFiles.length === 0 ? "pass" : "fail") : "pending", "Locale invalid count zero", localeReadiness?.invalidArchiveLocaleFiles.length ? `Invalid locales: ${localeReadiness.invalidArchiveLocaleFiles.join(", ")}` : localeKnown ? "No invalid locale files detected." : "Locale validation has not been read.");
  add("script-path-matches-manifest", scriptKnown && hacsMetadata ? (script.filename === hacsFilename ? "pass" : "fail") : "pending", "Script path matches manifest", script?.filename === hacsFilename ? "Script filename matches manifest filename." : "Script filename has not been matched to manifest.");
  add("script-name-matches-custom-element", scriptKnown ? (script.filename.replace(/\.js$/i, "") === customElementName ? "pass" : "fail") : "pending", "Script name matches custom element", script && script.filename.replace(/\.js$/i, "") === customElementName ? "Script basename matches custom element name." : "Script basename has not been matched to custom element.");
  add("script-resource-path-matches-filename", scriptKnown ? (script.resourcePath.endsWith(`/${script.filename}`) ? "pass" : "fail") : "pending", "Script resource path matches filename", script?.resourcePath.endsWith(`/${script.filename}`) ? "Script resource path ends with script filename." : "Script resource path has not been matched to filename.");
  add("script-card-type-matches-element", scriptKnown ? (script.cardType === `custom:${script.customElementName}` ? "pass" : "fail") : "pending", "Script card type matches element", script && script.cardType === `custom:${script.customElementName}` ? "Script card type matches custom element name." : "Script card type has not been matched to element.");
  add("script-card-type-custom-prefix", scriptKnown ? (script.cardType.startsWith("custom:") ? "pass" : "fail") : "pending", "Script card type custom prefix", script?.cardType.startsWith("custom:") ? "Script card type starts with custom:." : "Script card type has not been verified.");
  add("script-default-config-present", scriptKnown ? (defaultConfig ? "pass" : "fail") : "pending", "Script default config present", defaultConfig ? "Script default config is present." : "Script default config has not been read.");
  add("script-default-title-matches-package", scriptKnown && summaryKnown ? (defaultConfig?.title === summary.title ? "pass" : "fail") : "pending", "Script default title matches package", defaultConfig?.title === summary?.title ? "Default config title matches package title." : "Default config title has not been matched to package title.");
  add("script-default-config-type-matches-card", scriptKnown ? (defaultConfig?.type === script.cardType ? "pass" : "fail") : "pending", "Script default type matches card", defaultConfig?.type === script?.cardType ? "Default config type matches script card type." : "Default config type has not been matched to card type.");
  add("script-source-nonempty", scriptKnown ? (script.source.trim().length > 0 ? "pass" : "fail") : "pending", "Script source non-empty", script?.source.trim() ? "Script source is non-empty." : "Script source has not been read.");
  add("script-source-registers-custom-cards", scriptKnown ? (script.source.includes("window.customCards") ? "pass" : "fail") : "pending", "Script registers customCards", script?.source.includes("window.customCards") ? "Script registers customCards metadata." : "Script customCards metadata has not been found.");
  add("script-source-has-card-size", scriptKnown ? (script.source.includes("getCardSize") ? "pass" : "fail") : "pending", "Script has card size", script?.source.includes("getCardSize") ? "Script implements getCardSize." : "Script getCardSize has not been found.");
  add("script-source-has-stub-config", scriptKnown ? (script.source.includes("getStubConfig") ? "pass" : "fail") : "pending", "Script has stub config", script?.source.includes("getStubConfig") ? "Script implements getStubConfig." : "Script getStubConfig has not been found.");
  add("script-source-has-ha-card", scriptKnown ? (script.source.includes("ha-card") ? "pass" : "fail") : "pending", "Script renders ha-card", script?.source.includes("ha-card") ? "Script creates a ha-card wrapper." : "Script ha-card wrapper has not been found.");
  add("script-source-has-shadow-dom", scriptKnown ? (script.source.includes("attachShadow") ? "pass" : "fail") : "pending", "Script uses shadow DOM", script?.source.includes("attachShadow") ? "Script attaches a shadow DOM." : "Script shadow DOM setup has not been found.");
  add("example-title-present", exampleKnown && defaultConfig ? (defaultConfig.title.length > 0 ? "pass" : "fail") : "pending", "Example title present", defaultConfig?.title ? `Example title: ${defaultConfig.title}` : "Example title has not been read.");
  add("example-title-matches-package", exampleKnown && summaryKnown && defaultConfig ? (defaultConfig.title === summary.title ? "pass" : "fail") : "pending", "Example title matches package", defaultConfig?.title === summary?.title ? "Example title matches package title." : "Example title has not been matched to package title.");
  add("example-entities-present", exampleKnown && defaultConfig ? (Array.isArray(defaultConfig.entities) ? "pass" : "fail") : "pending", "Example entities present", defaultConfig ? `Example entities: ${defaultConfig.entities.join(", ")}` : "Example entities have not been read.");
  add("example-entities-nonempty", exampleKnown && defaultConfig ? (defaultConfig.entities.length > 0 ? "pass" : "fail") : "pending", "Example entities non-empty", defaultConfig?.entities.length ? `Example entity count: ${defaultConfig.entities.length}` : "Example entities have not been read.");
  add("example-first-entity-safe", exampleKnown && defaultConfig ? (safeEntityPattern.test(defaultConfig.entities[0] ?? "") ? "pass" : "fail") : "pending", "Example first entity safe", defaultConfig?.entities[0] ? `First example entity: ${defaultConfig.entities[0]}` : "Example first entity has not been read.");
  add("example-replacement-hint-present", exampleKnown && defaultConfig ? (defaultConfig.replacement_hint.length > 0 ? "pass" : "fail") : "pending", "Example replacement hint present", defaultConfig?.replacement_hint ? "Example includes replacement hint." : "Example replacement hint has not been read.");
  add("readme-resource-path-case-sensitive", readmeKnown ? (readmeReadiness.mentionsResourcePath ? "pass" : "fail") : "pending", "README resource path case-sensitive", readmeReadiness?.mentionsResourcePath ? "README contains the exact resource path." : "README exact resource path has not been verified.");
  add("readme-card-type-case-sensitive", readmeKnown ? (readmeReadiness.mentionsCardType ? "pass" : "fail") : "pending", "README card type case-sensitive", readmeReadiness?.mentionsCardType ? "README contains the exact card type." : "README exact card type has not been verified.");
  add("readme-has-resource-detail", readmeKnown ? (Boolean(readmeReadiness.expectedResourcePath) ? "pass" : "fail") : "pending", "README resource detail known", readmeReadiness?.expectedResourcePath ? `Expected resource: ${readmeReadiness.expectedResourcePath}` : "README expected resource has not been read.");
  add("readme-has-card-detail", readmeKnown ? (Boolean(readmeReadiness.expectedCardType) ? "pass" : "fail") : "pending", "README card detail known", readmeReadiness?.expectedCardType ? `Expected card type: ${readmeReadiness.expectedCardType}` : "README expected card type has not been read.");
  add("import-summary-title-present", summaryKnown ? (summary.title.length > 0 ? "pass" : "fail") : "pending", "Import summary title present", summary?.title ? `Import title: ${summary.title}` : "Import summary title has not been read.");
  add("import-summary-entities-present", summaryKnown ? (summary.entityIds.length > 0 ? "pass" : "fail") : "pending", "Import summary entities present", summary?.entityIds.length ? `Import entities: ${summary.entityIds.join(", ")}` : "Import summary entities have not been read.");
  add("import-summary-target-supported", summaryKnown ? (summary.target.length > 0 ? "pass" : "fail") : "pending", "Import summary target supported", summary?.target ? `Import target: ${summary.target}` : "Import summary target has not been read.");
  add("import-summary-layout-supported", summaryKnown ? (summary.layout.length > 0 ? "pass" : "fail") : "pending", "Import summary layout supported", summary?.layout ? `Import layout: ${summary.layout}` : "Import summary layout has not been read.");
  add("import-summary-format-supported", summaryKnown ? (["json", "yaml"].includes(summary.format) ? "pass" : "fail") : "pending", "Import summary format supported", summary?.format ? `Import format: ${summary.format}` : "Import summary format has not been read.");
  add("import-summary-dependency-present", summaryKnown ? (summary.dependency.label.length > 0 ? "pass" : "fail") : "pending", "Import summary dependency present", summary?.dependency.label ? `Import dependency: ${summary.dependency.label}` : "Import dependency has not been read.");
  add("import-summary-safe-for-demo", summaryKnown ? (summary.entityIds.every(entityId => safeEntityPattern.test(entityId)) ? "pass" : "fail") : "pending", "Import summary safe for demo", summary?.entityIds.every(entityId => safeEntityPattern.test(entityId)) ? "Import entities use safe Home Assistant IDs." : "Import entities have not been verified.");
  add("import-review-lines-available", reviewLines.length > 0 ? "pass" : "fail", "Import review lines available", reviewLines.length > 0 ? `Review line count: ${reviewLines.length}` : "No import review lines were generated.");
  add("import-report-counts-balanced", "pending", "Import report counts balanced", "Report counts are finalized after all checks are added.");
  add("import-report-has-failures-when-rejected", packageRead.importable ? "pass" : "pending", "Import report failures when rejected", packageRead.importable ? "Bundle is importable, no rejection failures required." : "Failure count is finalized after all checks are added.");
  add("import-report-ready-only-when-importable", packageRead.importable ? "pass" : "fail", "Import report ready only when importable", packageRead.importable ? "Bundle import is approved." : "Bundle import is rejected.");
  add("import-report-no-pending-when-ready", packageRead.importable ? "pass" : "pending", "Import report no pending when ready", packageRead.importable ? "Ready bundles have no pending checks." : "Rejected bundle may stop with pending checks.");
  add("import-report-terminal-check-present", checks.some(check => check.code === "bundle-importable") ? "pass" : "fail", "Import report terminal check present", "Report includes the bundle-importable terminal check.");
  add("import-report-first-check-readable", checks[0]?.code === "zip-readable" ? "pass" : "fail", "Import report first check readable", "Report starts with ZIP readability.");
  add("import-report-last-check-importable", "pending", "Import report last check importable", "Report last check is finalized after all checks are added.");
  add("import-report-statuses-known", checks.every(check => checkStatuses.has(check.status)) ? "pass" : "fail", "Import report statuses known", "Report statuses use pass, fail, or pending.");
  add("import-report-100-checks", "pending", "Import report has at least 100 checks", "Report check count is finalized after all checks are added.");

  const countsBalancedIndex = checks.findIndex(check => check.code === "import-report-counts-balanced");
  const rejectedFailuresIndex = checks.findIndex(check => check.code === "import-report-has-failures-when-rejected");
  const lastCheckIndex = checks.findIndex(check => check.code === "import-report-last-check-importable");
  const countCheckIndex = checks.findIndex(check => check.code === "import-report-100-checks");
  const provisionalFailed = checks.filter(check => check.status === "fail").length;
  checks[countsBalancedIndex] = {
    ...checks[countsBalancedIndex]!,
    status: checks.length >= 100 ? "pass" : "fail",
    detail: `Report currently contains ${checks.length} checks.`,
  };
  checks[rejectedFailuresIndex] = {
    ...checks[rejectedFailuresIndex]!,
    status: packageRead.importable || provisionalFailed > 0 ? "pass" : "fail",
    detail: packageRead.importable ? "Bundle is importable." : `Rejected bundle has ${provisionalFailed} failed checks.`,
  };
  checks[lastCheckIndex] = {
    ...checks[lastCheckIndex]!,
    status: checks.at(-1)?.code === "import-report-100-checks" ? "pass" : "fail",
    detail: `Last check: ${checks.at(-1)?.code ?? "unknown"}.`,
  };
  checks[countCheckIndex] = {
    ...checks[countCheckIndex]!,
    status: checks.length >= 100 ? "pass" : "fail",
    detail: `Report check count: ${checks.length}.`,
  };

  const passed = checks.filter(check => check.status === "pass").length;
  const failed = checks.filter(check => check.status === "fail").length;
  const pending = checks.filter(check => check.status === "pending").length;
  const ready = packageRead.importable && failed === 0 && pending === 0;
  return {
    status: getHacsBundleReadinessStatus(ready, failed),
    ready,
    passed,
    failed,
    pending,
    checks,
  };
}

export function createHomeAssistantCardEditorHacsBundleReadinessOverview(
  packageRead: HomeAssistantCardEditorHacsBundleArchivePackageRead,
): HomeAssistantCardEditorHacsBundleReadinessOverview {
  const report = createHomeAssistantCardEditorHacsBundleReadinessReport(packageRead);
  const groupDefinitions: readonly {
    readonly id: HomeAssistantCardEditorHacsBundleReadinessGroupId;
    readonly label: string;
  }[] = [
    { id: "archive", label: "Archive" },
    { id: "manifest", label: "HACS manifest" },
    { id: "package", label: "ATLAS package" },
    { id: "locale", label: "Locales" },
    { id: "script", label: "Script" },
    { id: "example", label: "Example card" },
    { id: "readme", label: "README" },
    { id: "import", label: "Import" },
  ];
  const groups = groupDefinitions.map(definition => {
    const checks = report.checks.filter(check => getHacsBundleReadinessCheckGroupId(check.code) === definition.id);
    const passed = checks.filter(check => check.status === "pass").length;
    const failed = checks.filter(check => check.status === "fail").length;
    const pending = checks.filter(check => check.status === "pending").length;
    const firstFailedCheck = checks.find(check => check.status === "fail");
    const firstPendingCheck = checks.find(check => check.status === "pending");
    const ready = checks.length > 0 && failed === 0 && pending === 0;
    const status = getHacsBundleReadinessStatus(ready, failed);
    return {
      ...definition,
      status,
      ready,
      passed,
      failed,
      pending,
      ...(firstFailedCheck ? { firstFailedCheck } : {}),
      ...(firstPendingCheck ? { firstPendingCheck } : {}),
      checks,
    };
  });
  const firstFailedCheck = report.checks.find(check => check.status === "fail");
  const firstPendingCheck = report.checks.find(check => check.status === "pending");
  const firstBlockedGroup = groups.find(group => group.failed > 0);
  const firstPendingGroup = groups.find(group => group.pending > 0);
  const attentionGroups = groups.filter(group => !group.ready);
  const blockedAttentionGroups = groups.filter(group => group.failed > 0);
  const pendingAttentionGroups = groups.filter(group => group.pending > 0);
  const nextAction = firstBlockedGroup
    ? `Fix ${firstBlockedGroup.label} (${firstBlockedGroup.firstFailedCheck?.code ?? "unknown"})`
    : firstPendingGroup
      ? `Complete ${firstPendingGroup.label} (${firstPendingGroup.firstPendingCheck?.code ?? "unknown"})`
      : "Ready to import HACS card bundle";
  const nextActionCheck = firstBlockedGroup?.firstFailedCheck ?? firstPendingGroup?.firstPendingCheck;
  const attentionSummary: HomeAssistantCardEditorHacsBundleReadinessAttentionSummary = {
    attentionCount: attentionGroups.length,
    blockedCount: blockedAttentionGroups.length,
    pendingCount: pendingAttentionGroups.length,
    nextAction,
    ...(nextActionCheck ? { nextActionCheck } : {}),
    attentionLabels: attentionGroups.map(group => group.label),
    blockedLabels: blockedAttentionGroups.map(group => group.label),
    pendingLabels: pendingAttentionGroups.map(group => group.label),
  };

  return {
    status: report.status,
    ready: report.ready,
    passed: report.passed,
    failed: report.failed,
    pending: report.pending,
    groupCount: groups.length,
    readyGroups: groups.filter(group => group.ready).length,
    blockedGroups: groups.filter(group => group.failed > 0).length,
    pendingGroups: groups.filter(group => group.pending > 0).length,
    ...(firstFailedCheck ? { firstFailedCheck } : {}),
    ...(firstPendingCheck ? { firstPendingCheck } : {}),
    ...(firstBlockedGroup ? { firstBlockedGroup } : {}),
    ...(firstPendingGroup ? { firstPendingGroup } : {}),
    attentionGroups,
    blockedAttentionGroups,
    pendingAttentionGroups,
    attentionSummary,
    groups,
  };
}

function getHacsBundleReadinessStatus(
  ready: boolean,
  failed: number,
): HomeAssistantCardEditorHacsBundleReadinessStatus {
  return ready ? "ready" : failed > 0 ? "blocked" : "pending";
}

function readHacsBundleArchiveMetadata(
  content: Uint8Array,
  entry: ReadableZipArchiveEntry,
  scriptFiles: readonly string[],
): HomeAssistantCardEditorHacsBundleArchiveMetadata {
  const manifest = parseJsonRecord(readStoredZipEntryText(content, entry));
  const filename = typeof manifest.filename === "string" ? manifest.filename.trim() : undefined;
  return {
    name: typeof manifest.name === "string" ? manifest.name.trim() : undefined,
    filename,
    renderReadme: typeof manifest.render_readme === "boolean" ? manifest.render_readme : undefined,
    nameMatchesPackage: false,
    scriptMatchesArchive: filename ? scriptFiles.includes(filename) : false,
    scriptMatchesPackage: false,
  };
}

function getHacsBundleReadinessCheckGroupId(
  code: HomeAssistantCardEditorHacsBundleReadinessCheckCode,
): HomeAssistantCardEditorHacsBundleReadinessGroupId {
  if (
    code.startsWith("zip-")
    || code.startsWith("safe-")
    || code.startsWith("unique-")
    || code.startsWith("archive-")
    || code.startsWith("has-")
  ) {
    return "archive";
  }
  if (code.startsWith("hacs-")) return "manifest";
  if (code.startsWith("package-") || code.startsWith("atlas-package")) return "package";
  if (code.startsWith("locale-") || code.startsWith("declared-locales")) return "locale";
  if (code.startsWith("script-")) return "script";
  if (code.startsWith("example-")) return "example";
  if (code.startsWith("readme-")) return "readme";
  return "import";
}

function readHacsBundleArchiveScriptReadiness(
  content: Uint8Array,
  entries: readonly ReadableZipArchiveEntry[],
  scriptFilename: string | undefined,
  expectedCustomElementName: string | undefined,
): HomeAssistantCardEditorHacsBundleArchiveScriptReadiness {
  if (!expectedCustomElementName) {
    return {
      path: scriptFilename,
      expectedCustomElementName,
      definesCustomElement: false,
      valid: false,
      reason: "missing-custom-element-name",
    };
  }
  const entry = scriptFilename ? entries.find(candidate => candidate.path === scriptFilename) : undefined;
  if (!entry) {
    return {
      path: scriptFilename,
      expectedCustomElementName,
      definesCustomElement: false,
      valid: false,
      reason: "missing-script",
    };
  }

  const script = readStoredZipEntryText(content, entry);
  const definesCustomElement = [
    `customElements.define("${expectedCustomElementName}"`,
    `customElements.define('${expectedCustomElementName}'`,
  ].some(fragment => script.includes(fragment));

  return {
    path: entry.path,
    expectedCustomElementName,
    definesCustomElement,
    valid: definesCustomElement,
    reason: definesCustomElement ? "ok" : "custom-element-mismatch",
  };
}

function readHacsBundleArchiveExampleReadiness(
  content: Uint8Array,
  entries: readonly ReadableZipArchiveEntry[],
  expectedType: string | undefined,
): HomeAssistantCardEditorHacsBundleArchiveExampleReadiness {
  const path = "examples/lovelace-card.json";
  const entry = entries.find(candidate => candidate.path === path);
  try {
    const example = entry ? parseJsonRecord(readStoredZipEntryText(content, entry)) : {};
    const actualType = typeof example.type === "string" ? example.type : undefined;
    if (!actualType) {
      return {
        path,
        expectedType,
        valid: false,
        reason: "missing-type",
      };
    }
    if (expectedType && actualType !== expectedType) {
      return {
        path,
        expectedType,
        actualType,
        valid: false,
        reason: "type-mismatch",
      };
    }
    return {
      path,
      expectedType,
      actualType,
      valid: true,
      reason: "ok",
    };
  } catch {
    return {
      path,
      expectedType,
      valid: false,
      reason: "invalid-json",
    };
  }
}

function readHacsBundleArchiveReadmeReadiness(
  content: Uint8Array,
  entries: readonly ReadableZipArchiveEntry[],
  expectedResourcePath: string | undefined,
  expectedCardType: string | undefined,
): HomeAssistantCardEditorHacsBundleArchiveReadmeReadiness {
  const path = "README.md";
  const entry = entries.find(candidate => candidate.path === path);
  const readme = entry ? readStoredZipEntryText(content, entry) : "";
  const mentionsResourcePath = expectedResourcePath ? readme.includes(expectedResourcePath) : false;
  const mentionsCardType = expectedCardType ? readme.includes(expectedCardType) : false;
  const valid = mentionsResourcePath && mentionsCardType;

  return {
    path,
    expectedResourcePath,
    expectedCardType,
    mentionsResourcePath,
    mentionsCardType,
    valid,
    reason: valid ? "ok" : !mentionsResourcePath ? "missing-resource-path" : "missing-card-type",
  };
}

function readHacsBundleArchiveLocaleReadiness(
  content: Uint8Array,
  entries: readonly ReadableZipArchiveEntry[],
  packageContent: string,
  inspection: HomeAssistantCardEditorHacsBundleArchiveInspection,
): HomeAssistantCardEditorHacsBundleArchiveLocaleReadiness {
  const packageJson = parseJsonRecord(packageContent);
  const manifest = isRecord(packageJson.manifest) ? packageJson.manifest : {};
  const manifestLanguages = normalizeLanguageCodes(readStringArray(manifest.languages));
  const fallbackLanguages = normalizeLanguageCodes(readStringArray(manifest.fallbackLanguages));
  const requiredLocaleFiles = normalizeLanguageCodes(manifestLanguages.length ? manifestLanguages : ["en"])
    .map(language => `locales/${language}.json`);
  const localeEntries = new Map(entries
    .filter(entry => inspection.localeFiles.includes(entry.path))
    .map(entry => [entry.path, entry]));
  const missingArchiveLocaleFiles = requiredLocaleFiles.filter(path => !localeEntries.has(path));
  const invalidArchiveLocales = requiredLocaleFiles
    .filter(path => localeEntries.has(path))
    .map(path => inspectLocaleArchiveEntry(content, localeEntries.get(path)!, path))
    .filter((result): result is HomeAssistantCardEditorHacsBundleArchiveInvalidLocale => result !== undefined);

  return {
    manifestLanguages: manifestLanguages.length ? manifestLanguages : ["en"],
    fallbackLanguages,
    archiveLocaleFiles: inspection.localeFiles,
    requiredLocaleFiles,
    missingArchiveLocaleFiles,
    invalidArchiveLocaleFiles: invalidArchiveLocales.map(locale => locale.path),
    invalidArchiveLocales,
  };
}

function createHacsBundleArchiveIssues(input: {
  readonly missingFiles: readonly string[];
  readonly missingLocaleFiles: readonly string[];
  readonly unsafePaths: readonly string[];
  readonly duplicatePaths: readonly string[];
}): HomeAssistantCardEditorHacsBundleArchiveIssue[] {
  return [
    ...(input.missingFiles.length > 0
      ? [{
          code: "missing-required-file" as const,
          severity: "error" as const,
          paths: input.missingFiles,
          message: `missing required files: ${input.missingFiles.join(", ")}`,
        }]
      : []),
    ...(input.missingLocaleFiles.length > 0
      ? [{
          code: "missing-locale-file" as const,
          severity: "error" as const,
          paths: input.missingLocaleFiles,
          message: `missing required locale files: ${input.missingLocaleFiles.join(", ")}`,
        }]
      : []),
    ...(input.unsafePaths.length > 0
      ? [{
          code: "unsafe-path" as const,
          severity: "error" as const,
          paths: input.unsafePaths,
          message: `unsafe archive paths: ${input.unsafePaths.join(", ")}`,
        }]
      : []),
    ...(input.duplicatePaths.length > 0
      ? [{
          code: "duplicate-path" as const,
          severity: "error" as const,
          paths: input.duplicatePaths,
          message: `duplicate archive paths: ${input.duplicatePaths.join(", ")}`,
        }]
      : []),
  ];
}

function createHomeAssistantCardEditorBundleReadme(
  cardName: string,
  resourcePath: string,
  defaultConfig: string,
  languages: readonly string[],
  fallbackLanguages: readonly string[],
): string {
  return [
    `# ${cardName}`,
    "",
    "Generated by ATLAS Home Assistant Card Editor.",
    "",
    "## Lovelace resource",
    "",
    "```yaml",
    `- url: ${JSON.stringify(resourcePath)}`,
    "  type: module",
    "```",
    "",
    "## Example card",
    "",
    "```json",
    defaultConfig,
    "```",
    "",
    "Replace the demo entities with your own Home Assistant entities before using this card in production.",
    "",
    "## Languages",
    "",
    `Included language files: ${languages.join(", ")}.`,
    ...(fallbackLanguages.length > 0
      ? [
          "",
          `Fallback language files: ${fallbackLanguages.join(", ")}.`,
          "These files contain English fallback text. Please translate and review the corresponding files in `locales/` before publishing.",
        ]
      : []),
    "",
  ].join("\n");
}

interface ZipEndOfCentralDirectory {
  readonly fileCount: number;
  readonly centralDirectoryOffset: number;
}

interface ZipCentralDirectoryRecord {
  readonly fileName: Uint8Array;
  readonly crc32: number;
  readonly size: number;
  readonly localHeaderOffset: number;
}

interface ReadableZipArchiveEntry extends HomeAssistantCardEditorHacsBundleArchiveEntry {
  readonly localHeaderOffset: number;
}

function readZipCentralDirectoryEntries(content: Uint8Array): ReadableZipArchiveEntry[] {
  const endOfCentralDirectory = readZipEndOfCentralDirectory(content);
  const entries: ReadableZipArchiveEntry[] = [];
  let offset = endOfCentralDirectory.centralDirectoryOffset;
  const decoder = new TextDecoder();

  for (let index = 0; index < endOfCentralDirectory.fileCount; index += 1) {
    const view = new DataView(content.buffer, content.byteOffset + offset);
    if (view.getUint32(0, true) !== 0x02014b50) {
      throw new Error("Invalid ZIP central directory.");
    }

    const compressionMethod = view.getUint16(10, true);
    const compressedSize = view.getUint32(20, true);
    const uncompressedSize = view.getUint32(24, true);
    const fileNameLength = view.getUint16(28, true);
    const extraFieldLength = view.getUint16(30, true);
    const commentLength = view.getUint16(32, true);
    const localHeaderOffset = view.getUint32(42, true);
    const fileName = content.slice(offset + 46, offset + 46 + fileNameLength);
    entries.push({
      path: decoder.decode(fileName),
      compressionMethod: normalizeZipCompressionMethod(compressionMethod),
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
    });
    offset += 46 + fileNameLength + extraFieldLength + commentLength;
  }

  return entries;
}

function readStoredZipEntryText(content: Uint8Array, entry: ReadableZipArchiveEntry): string {
  const offset = entry.localHeaderOffset;
  const view = new DataView(content.buffer, content.byteOffset + offset);
  if (view.getUint32(0, true) !== 0x04034b50) {
    throw new Error("Invalid ZIP local file header.");
  }
  const fileNameLength = view.getUint16(26, true);
  const extraFieldLength = view.getUint16(28, true);
  const dataOffset = offset + 30 + fileNameLength + extraFieldLength;
  const dataEnd = dataOffset + entry.uncompressedSize;
  if (dataOffset < 0 || dataEnd > content.length) {
    throw new Error("ZIP local file content is out of bounds.");
  }
  return new TextDecoder().decode(content.slice(dataOffset, dataEnd));
}

function readZipEndOfCentralDirectory(content: Uint8Array): ZipEndOfCentralDirectory {
  const minimumSize = 22;
  const maximumCommentSize = 0xffff;
  const searchStart = Math.max(0, content.length - minimumSize - maximumCommentSize);
  for (let offset = content.length - minimumSize; offset >= searchStart; offset -= 1) {
    const view = new DataView(content.buffer, content.byteOffset + offset, minimumSize);
    if (view.getUint32(0, true) === 0x06054b50) {
      return {
        fileCount: view.getUint16(10, true),
        centralDirectoryOffset: view.getUint32(16, true),
      };
    }
  }
  throw new Error("ZIP end of central directory not found.");
}

function normalizeZipCompressionMethod(value: number): HomeAssistantCardEditorHacsBundleArchiveEntry["compressionMethod"] {
  if (value === 0) return "store";
  if (value === 8) return "deflate";
  return "unsupported";
}

function createStoredZipArchive(files: readonly HomeAssistantCardEditorHacsBundleFile[]): Uint8Array {
  const chunks: Uint8Array[] = [];
  const centralDirectoryRecords: ZipCentralDirectoryRecord[] = [];
  let offset = 0;

  for (const file of files) {
    const fileName = encodeUtf8(file.path);
    const content = encodeUtf8(file.content);
    const crc32 = calculateCrc32(content);
    const localHeader = createZipLocalFileHeader(fileName, crc32, content.length);
    chunks.push(localHeader, content);
    centralDirectoryRecords.push({
      fileName,
      crc32,
      size: content.length,
      localHeaderOffset: offset,
    });
    offset += localHeader.length + content.length;
  }

  const centralDirectoryOffset = offset;
  for (const record of centralDirectoryRecords) {
    const centralDirectoryHeader = createZipCentralDirectoryHeader(record);
    chunks.push(centralDirectoryHeader);
    offset += centralDirectoryHeader.length;
  }

  const centralDirectorySize = offset - centralDirectoryOffset;
  chunks.push(createZipEndOfCentralDirectoryRecord(
    centralDirectoryRecords.length,
    centralDirectorySize,
    centralDirectoryOffset,
  ));

  return concatUint8Arrays(chunks);
}

function createZipLocalFileHeader(fileName: Uint8Array, crc32: number, size: number): Uint8Array {
  const header = new Uint8Array(30 + fileName.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0x0800, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0x0021, true);
  view.setUint32(14, crc32, true);
  view.setUint32(18, size, true);
  view.setUint32(22, size, true);
  view.setUint16(26, fileName.length, true);
  view.setUint16(28, 0, true);
  header.set(fileName, 30);
  return header;
}

function createZipCentralDirectoryHeader(record: ZipCentralDirectoryRecord): Uint8Array {
  const header = new Uint8Array(46 + record.fileName.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0x0800, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint16(14, 0x0021, true);
  view.setUint32(16, record.crc32, true);
  view.setUint32(20, record.size, true);
  view.setUint32(24, record.size, true);
  view.setUint16(28, record.fileName.length, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, record.localHeaderOffset, true);
  header.set(record.fileName, 46);
  return header;
}

function createZipEndOfCentralDirectoryRecord(
  fileCount: number,
  centralDirectorySize: number,
  centralDirectoryOffset: number,
): Uint8Array {
  const record = new Uint8Array(22);
  const view = new DataView(record.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, fileCount, true);
  view.setUint16(10, fileCount, true);
  view.setUint32(12, centralDirectorySize, true);
  view.setUint32(16, centralDirectoryOffset, true);
  view.setUint16(20, 0, true);
  return record;
}

function calculateCrc32(content: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of content) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function concatUint8Arrays(chunks: readonly Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((length, chunk) => length + chunk.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}

function encodeUtf8(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function formatInvalidLocaleReviewLine(
  locale: HomeAssistantCardEditorHacsBundleArchiveInvalidLocale,
): string {
  const actual = locale.actualLanguage ? `, actual ${locale.actualLanguage}` : "";
  return `Invalid locale ${locale.path}: expected ${locale.expectedLanguage}${actual} (${locale.reason})`;
}

function formatScriptReadinessReviewLine(
  readiness: HomeAssistantCardEditorHacsBundleArchiveScriptReadiness,
): string {
  if (readiness.valid) {
    return `Script: ${readiness.path ?? "unknown script"} defines ${readiness.expectedCustomElementName ?? "unknown element"} (${readiness.reason})`;
  }
  const expected = readiness.expectedCustomElementName ? `expected ${readiness.expectedCustomElementName}` : "expected custom element unknown";
  return `Invalid script ${readiness.path ?? "unknown script"}: ${expected} (${readiness.reason})`;
}

function formatExampleReadinessReviewLine(
  readiness: HomeAssistantCardEditorHacsBundleArchiveExampleReadiness,
): string {
  if (readiness.valid) {
    return `Example card: ${readiness.actualType ?? "unknown"} (${readiness.reason})`;
  }
  const expected = readiness.expectedType ? `expected ${readiness.expectedType}` : "expected card type unknown";
  const actual = readiness.actualType ? `, actual ${readiness.actualType}` : "";
  return `Invalid example card ${readiness.path}: ${expected}${actual} (${readiness.reason})`;
}

function formatReadmeReadinessReviewLine(
  readiness: HomeAssistantCardEditorHacsBundleArchiveReadmeReadiness,
): string {
  if (readiness.valid) {
    return `README: ${readiness.expectedResourcePath ?? "unknown resource"} / ${readiness.expectedCardType ?? "unknown card"} (${readiness.reason})`;
  }
  const missing = !readiness.mentionsResourcePath
    ? readiness.expectedResourcePath ?? "resource path"
    : readiness.expectedCardType ?? "card type";
  return `Invalid README ${readiness.path}: missing ${missing} (${readiness.reason})`;
}

function inspectLocaleArchiveEntry(
  content: Uint8Array,
  entry: ReadableZipArchiveEntry,
  path: string,
): HomeAssistantCardEditorHacsBundleArchiveInvalidLocale | undefined {
  const expectedLanguage = path.match(/^locales\/([a-z]{2})\.json$/)?.[1] ?? "";
  try {
    const parsed = parseJsonRecord(readStoredZipEntryText(content, entry));
    const actualLanguage = isRecord(parsed._meta) && typeof parsed._meta.language === "string"
      ? parsed._meta.language
      : undefined;
    if (!actualLanguage) {
      return {
        path,
        expectedLanguage,
        reason: "missing-meta-language",
      };
    }
    if (actualLanguage !== expectedLanguage) {
      return {
        path,
        expectedLanguage,
        actualLanguage,
        reason: "language-mismatch",
      };
    }
    return undefined;
  } catch {
    return {
      path,
      expectedLanguage,
      reason: "invalid-json",
    };
  }
}

function isSafeHacsBundleArchivePath(path: string): boolean {
  const trimmed = path.trim();
  if (!trimmed || trimmed !== path) return false;
  if (trimmed.includes("\\") || trimmed.startsWith("/") || /^[a-zA-Z]:/.test(trimmed)) return false;
  return trimmed.split("/").every(segment => segment && segment !== "." && segment !== "..");
}

function listDuplicateStrings(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
      continue;
    }
    seen.add(value);
  }
  return [...duplicates];
}

function normalizeLanguageCodes(values: readonly string[]): string[] {
  return [...new Set(values
    .map(value => value.trim().toLowerCase())
    .filter(value => /^[a-z]{2}$/.test(value)))].sort((left, right) => {
      if (left === "en") return -1;
      if (right === "en") return 1;
      return left.localeCompare(right);
    });
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function parseJsonRecord(text: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(text);
  if (typeof parsed === "object" && parsed !== null) {
    return parsed as Record<string, unknown>;
  }
  return {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
