export function subscribeToCoreRuntimeEvent(host, eventType, handler) {
    return host.events.subscribe(eventType, handler);
}
