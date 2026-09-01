export function createSnapshot(entries) {
    const items = [];
    for (const [key, value] of entries) {
        items.push({ key, value });
    }
    return {
        createdAt: new Date(),
        count: items.length,
        entries: items
    };
}
