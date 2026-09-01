import type { CoreRuntimeHost } from "./CoreRuntimeHost";

export type CoreRuntimeLifecycleAction = "start" | "stop" | "restart" | "dispose";
export type CoreRuntimeLifecycleState = CoreRuntimeHost["state"];

export type CoreRuntimeLifecycleResult = Readonly<{
  action: CoreRuntimeLifecycleAction;
  state: CoreRuntimeLifecycleState;
}>;

export async function transitionCoreRuntimeHost(
  host: CoreRuntimeHost,
  action: CoreRuntimeLifecycleAction,
): Promise<CoreRuntimeLifecycleResult> {
  await host[action]();

  return {
    action,
    state: host.state,
  };
}
