import type { ServiceProvider } from "./ServiceProvider";
import type { ServiceKey } from "./ServiceKey";
import { DefaultServiceContainer } from "../container";

export class DefaultServiceProvider implements ServiceProvider {
  constructor(private readonly container: DefaultServiceContainer){}

  get<T>(key: ServiceKey<T>): T {
    return this.container.resolve<T>(key.id);
  }

  tryGet<T>(key: ServiceKey<T>): T | undefined {
    return this.container.contains(key.id)
      ? this.container.resolve<T>(key.id)
      : undefined;
  }
}
