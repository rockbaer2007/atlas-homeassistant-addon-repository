const forbiddenPreActivationDependencies = new Set([
    "@atlas/renderer",
    "home-assistant-js-websocket",
]);
export function inspectHomeAssistantDependencyBoundary(dependencies) {
    const forbiddenDependencies = dependencies.filter(dependency => forbiddenPreActivationDependencies.has(dependency));
    return {
        ok: forbiddenDependencies.length === 0,
        forbiddenDependencies,
    };
}
