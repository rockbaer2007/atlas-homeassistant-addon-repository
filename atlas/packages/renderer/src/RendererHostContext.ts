import type { CoreRuntimeHost } from "@atlas/core";

export type RendererHostContext = Readonly<{
  runtime: CoreRuntimeHost;
}>;

export function createRendererHostContext(
  runtime: CoreRuntimeHost,
): RendererHostContext {
  return {
    runtime,
  };
}
