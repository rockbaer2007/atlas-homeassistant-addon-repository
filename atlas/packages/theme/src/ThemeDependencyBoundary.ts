export interface ThemeDependencyBoundaryReport {
  readonly ok: boolean;
  readonly forbiddenDependencies: readonly string[];
}

const forbiddenPreActivationDependencies = new Set([
  "@atlas/runtime",
  "@atlas/homeassistant",
  "lit",
]);

export function inspectThemeDependencyBoundary(
  dependencies: readonly string[],
): ThemeDependencyBoundaryReport {
  const forbiddenDependencies = dependencies.filter(dependency =>
    forbiddenPreActivationDependencies.has(dependency),
  );

  return {
    ok: forbiddenDependencies.length === 0,
    forbiddenDependencies,
  };
}
