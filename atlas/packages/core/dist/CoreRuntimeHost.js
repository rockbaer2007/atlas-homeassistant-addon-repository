import { RuntimeHost } from "@atlas/runtime";
export function createCoreRuntimeHost(configuration) {
    return new RuntimeHost(configuration);
}
