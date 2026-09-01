import { RuntimeHost, type RuntimeHostConfiguration } from "@atlas/runtime";
export type CoreRuntimeHost = RuntimeHost;
export type CoreRuntimeHostConfiguration = RuntimeHostConfiguration;
export declare function createCoreRuntimeHost(configuration: CoreRuntimeHostConfiguration): CoreRuntimeHost;
