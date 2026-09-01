export function createHomeAssistantConnectionConfiguration(configuration) {
    return { ...configuration };
}
export function inspectHomeAssistantConnectionReadiness(configuration) {
    try {
        const url = new URL(configuration.url);
        if (url.protocol === "http:" || url.protocol === "https:") {
            return { ready: true };
        }
    }
    catch {
        // The public contract reports invalid configuration without opening a connection.
    }
    return {
        ready: false,
        reason: "Home Assistant connection requires an HTTP or HTTPS URL.",
    };
}
export function deriveHomeAssistantWebSocketUrl(configuration) {
    try {
        const source = new URL(configuration.url);
        if (source.protocol !== "http:" && source.protocol !== "https:") {
            return undefined;
        }
        source.protocol = source.protocol === "https:" ? "wss:" : "ws:";
        source.pathname = "/api/websocket";
        source.search = "";
        source.hash = "";
        return source.toString();
    }
    catch {
        return undefined;
    }
}
