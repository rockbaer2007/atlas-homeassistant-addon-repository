export type ServiceKey<T = unknown> = Readonly<{
    id: symbol;
    name: string;
}>;
export declare function createServiceKey<T>(name: string): ServiceKey<T>;
