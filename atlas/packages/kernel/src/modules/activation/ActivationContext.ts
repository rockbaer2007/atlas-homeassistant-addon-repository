import type { ModuleDescriptor } from "../manifest/ModuleDescriptor";
import type { ServiceCollection } from "../../container/ServiceCollection";
import type { ServiceProvider } from "../../di/ServiceProvider";
export interface ActivationContext{readonly module:ModuleDescriptor;readonly services:ServiceCollection;readonly provider:ServiceProvider;}