export interface ThemeDependencyBoundaryReport {
    readonly ok: boolean;
    readonly forbiddenDependencies: readonly string[];
}
export declare function inspectThemeDependencyBoundary(dependencies: readonly string[]): ThemeDependencyBoundaryReport;
