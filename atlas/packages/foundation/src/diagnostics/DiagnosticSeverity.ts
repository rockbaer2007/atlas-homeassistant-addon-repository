export const DiagnosticSeverities={
  Info:"info",
  Warning:"warning",
  Error:"error"
} as const;
export type DiagnosticSeverity=typeof DiagnosticSeverities[keyof typeof DiagnosticSeverities];