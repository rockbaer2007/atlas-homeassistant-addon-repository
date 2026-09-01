export const ServiceLifetimes = {
  Singleton: "singleton",
  Scoped: "scoped",
  Transient: "transient"
} as const;

export type ServiceLifetime =
  typeof ServiceLifetimes[keyof typeof ServiceLifetimes];
