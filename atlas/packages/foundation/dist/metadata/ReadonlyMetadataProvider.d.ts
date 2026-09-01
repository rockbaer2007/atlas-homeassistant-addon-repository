export interface ReadonlyMetadataProvider {
    has(key: string): boolean;
    get<T = unknown>(key: string): T | undefined;
}
