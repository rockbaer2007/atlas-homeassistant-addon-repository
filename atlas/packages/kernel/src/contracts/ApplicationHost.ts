import type { Application } from "./Application";

export interface ApplicationHost {
  readonly application: Application;

  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
}
