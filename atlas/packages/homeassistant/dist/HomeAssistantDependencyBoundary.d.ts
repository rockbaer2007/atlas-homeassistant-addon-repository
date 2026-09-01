export interface HomeAssistantDependencyBoundaryReport {
    readonly ok: boolean;
    readonly forbiddenDependencies: readonly string[];
}
export declare function inspectHomeAssistantDependencyBoundary(dependencies: readonly string[]): HomeAssistantDependencyBoundaryReport;
