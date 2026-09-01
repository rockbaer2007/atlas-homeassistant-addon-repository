import { RuntimeHost, type RuntimeHostConfiguration } from "@atlas/runtime";

export type CoreRuntimeHost = RuntimeHost;
export type CoreRuntimeHostConfiguration = RuntimeHostConfiguration;

export function createCoreRuntimeHost(
  configuration: CoreRuntimeHostConfiguration,
): CoreRuntimeHost {
  return new RuntimeHost(configuration);
}
