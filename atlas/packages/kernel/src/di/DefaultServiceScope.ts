import type { ServiceScope } from "./ServiceScope";
import type { ServiceProvider } from "./ServiceProvider";

export class DefaultServiceScope implements ServiceScope {
  constructor(public readonly provider: ServiceProvider){}
  dispose(): void {}
}
