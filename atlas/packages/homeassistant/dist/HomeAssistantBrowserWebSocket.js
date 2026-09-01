export function createBrowserHomeAssistantWebSocket(url, WebSocketConstructor = globalThis.WebSocket) {
    const socket = new WebSocketConstructor(url);
    const messageListeners = new Set();
    const closeListeners = new Set();
    socket.onmessage = event => {
        for (const listener of messageListeners) {
            void listener(event.data);
        }
    };
    socket.onclose = event => {
        const reason = formatHomeAssistantBrowserWebSocketCloseReason(event);
        for (const listener of closeListeners) {
            listener(reason);
        }
    };
    return {
        send(data) {
            socket.send(data);
        },
        close() {
            socket.close();
        },
        onMessage(listener) {
            messageListeners.add(listener);
            return () => messageListeners.delete(listener);
        },
        onClose(listener) {
            closeListeners.add(listener);
            return () => closeListeners.delete(listener);
        },
    };
}
function formatHomeAssistantBrowserWebSocketCloseReason(event) {
    if (event.reason)
        return event.reason;
    if (event.code === 1000)
        return "ATLAS connection closed normally.";
    return event.code ? `WebSocket closed with code ${event.code}.` : undefined;
}
