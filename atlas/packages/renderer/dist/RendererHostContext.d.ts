import type { CoreRuntimeHost } from "@atlas/core";
export type RendererHostContext = Readonly<{
    runtime: CoreRuntimeHost;
}>;
export declare function createRendererHostContext(runtime: CoreRuntimeHost): RendererHostContext;
