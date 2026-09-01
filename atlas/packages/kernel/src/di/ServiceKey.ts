export type ServiceKey<T=unknown> = Readonly<{
  id: symbol;
  name: string;
}>;

export function createServiceKey<T>(name: string): ServiceKey<T> {
  return {
    id: Symbol(name),
    name
  };
}
