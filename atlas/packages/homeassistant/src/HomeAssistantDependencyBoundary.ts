export interface HomeAssistantDependencyBoundaryReport {
  readonly ok: boolean;
  readonly forbiddenDependencies: readonly string[];
}

const forbiddenPreActivationDependencies = new Set([
  "@atlas/renderer",
  "home-assistant-js-websocket",
]);

export function inspectHomeAssistantDependencyBoundary(
  dependencies: readonly string[],
): HomeAssistantDependencyBoundaryReport {
  const forbiddenDependencies = dependencies.filter(dependency =>
    forbiddenPreActivationDependencies.has(dependency),
  );

  return {
    ok: forbiddenDependencies.length === 0,
    forbiddenDependencies,
  };
}
