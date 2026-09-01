export function createServiceKey(name) {
    return {
        id: Symbol(name),
        name
    };
}
