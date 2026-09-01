export interface DevtoolsDependencyBoundaryReport {
  readonly ok: boolean;
  readonly forbiddenDependencies: readonly string[];
}

const forbiddenPreActivationDependencies = new Set([
  "@atlas/renderer",
  "@atlas/theme",
  "@atlas/homeassistant",
  "vite",
]);

export function inspectDevtoolsDependencyBoundary(
  dependencies: readonly string[],
): DevtoolsDependencyBoundaryReport {
  const forbiddenDependencies = dependencies.filter(dependency =>
    forbiddenPreActivationDependencies.has(dependency),
  );

  return {
    ok: forbiddenDependencies.length === 0,
    forbiddenDependencies,
  };
}
