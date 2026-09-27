import { describe, expect, it, vi } from "vitest";
import type {
  AsyncDisposable,
  AsyncInitializable,
  AsyncStartable,
  Configurable,
  Diagnosable,
  HealthCheckable,
  Observable,
  Subscription,
  Validatable,
} from "../src";

describe("foundation capability contracts", () => {
  it("exposes lifecycle, configuration, validation and diagnostics capabilities", async () => {
    const initialize = vi.fn(async () => undefined);
    const start = vi.fn(async () => undefined);
    const dispose = vi.fn(async () => undefined);
    const configure = vi.fn((_options: { enabled: boolean }) => undefined);
    const service = {
      initialize,
      start,
      dispose,
      configure,
      isHealthy: () => true,
      validate: () => ({ valid: true }),
      createSnapshot: () => ({ count: 2 }),
    } satisfies AsyncInitializable
      & AsyncStartable
      & AsyncDisposable
      & Configurable<{ enabled: boolean }>
      & HealthCheckable
      & Validatable<{ valid: boolean }>
      & Diagnosable<{ count: number }>;

    await service.initialize();
    await service.start();
    service.configure({ enabled: true });
    await service.dispose();

    expect(service.isHealthy()).toBe(true);
    expect(service.validate()).toEqual({ valid: true });
    expect(service.createSnapshot()).toEqual({ count: 2 });
    expect(initialize).toHaveBeenCalledOnce();
    expect(start).toHaveBeenCalledOnce();
    expect(configure).toHaveBeenCalledWith({ enabled: true });
    expect(dispose).toHaveBeenCalledOnce();
  });

  it("defines observable subscriptions as callable unsubscribe handles", () => {
    type Change = Readonly<{ value: number }>;
    const listener = vi.fn();
    let currentListener: ((event: Change) => void) | undefined = listener;
    const observable: Observable<Change> = {
      subscribe: callback => {
        currentListener = callback;
        return (() => { currentListener = undefined; }) satisfies Subscription;
      },
    };

    const unsubscribe = observable.subscribe(listener);
    currentListener?.({ value: 7 });
    unsubscribe();
    currentListener?.({ value: 8 });

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ value: 7 });
  });
});
