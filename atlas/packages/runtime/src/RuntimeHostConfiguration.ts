import type { Application, EventBus, ServiceContainer } from "@atlas/kernel";

import type { RuntimeModule } from "./RuntimeModule";

export type RuntimeHostConfiguration = Readonly<{
  application: Application;
  events?: EventBus;
  services?: ServiceContainer;
  modules?: readonly RuntimeModule[];
}>;
