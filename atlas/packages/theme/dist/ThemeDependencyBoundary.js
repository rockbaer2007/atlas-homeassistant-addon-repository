const forbiddenPreActivationDependencies = new Set([
    "@atlas/runtime",
    "@atlas/homeassistant",
    "lit",
]);
export function inspectThemeDependencyBoundary(dependencies) {
    const forbiddenDependencies = dependencies.filter(dependency => forbiddenPreActivationDependencies.has(dependency));
    return {
        ok: forbiddenDependencies.length === 0,
        forbiddenDependencies,
    };
}
