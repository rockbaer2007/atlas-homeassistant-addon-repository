export interface ServiceResolver {
  resolve<T>(key: symbol): T;
  contains(key: symbol): boolean;
}
