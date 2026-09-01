export class DefaultRegistry {
    items = new Map();
    listeners = new Set();
    get size() { return this.items.size; }
    has(key) { return this.items.has(key); }
    get(key) { return this.items.get(key); }
    keys() { return this.items.keys(); }
    values() { return this.items.values(); }
    entries() { return this.items.entries(); }
    register(key, value) {
        this.items.set(key, value);
        this.emit({ type: "registered", key, value });
    }
    unregister(key) {
        const value = this.items.get(key);
        const removed = this.items.delete(key);
        if (removed)
            this.emit({ type: "unregistered", key, value });
        return removed;
    }
    clear() {
        if (this.items.size === 0)
            return;
        this.items.clear();
        this.emit({ type: "cleared" });
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    emit(event) {
        for (const l of this.listeners)
            l(event);
    }
}
