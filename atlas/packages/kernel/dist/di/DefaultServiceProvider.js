export class DefaultServiceProvider {
    container;
    constructor(container) {
        this.container = container;
    }
    get(key) {
        return this.container.resolve(key.id);
    }
    tryGet(key) {
        return this.container.contains(key.id)
            ? this.container.resolve(key.id)
            : undefined;
    }
}
