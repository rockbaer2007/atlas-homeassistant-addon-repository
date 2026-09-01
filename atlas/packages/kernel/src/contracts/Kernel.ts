import type {
  AsyncDisposable,
  AsyncInitializable,
  Diagnosable,
  Observable
} from "@atlas/foundation";
import type { ServiceContainer } from "./ServiceContainer";

export type KernelSnapshot = Readonly<{
  started: boolean;
}>;

export type KernelEvent = Readonly<{
  type: string;
}>;

export interface Kernel extends
  AsyncInitializable,
  AsyncDisposable,
  Diagnosable<KernelSnapshot>,
  Observable<KernelEvent> {

  readonly services: ServiceContainer;
}
