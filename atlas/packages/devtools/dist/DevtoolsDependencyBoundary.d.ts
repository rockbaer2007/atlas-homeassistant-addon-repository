export interface DevtoolsDependencyBoundaryReport {
    readonly ok: boolean;
    readonly forbiddenDependencies: readonly string[];
}
export declare function inspectDevtoolsDependencyBoundary(dependencies: readonly string[]): DevtoolsDependencyBoundaryReport;
