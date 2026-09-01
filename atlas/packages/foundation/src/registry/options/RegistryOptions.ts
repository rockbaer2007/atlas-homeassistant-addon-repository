import type { DuplicatePolicy } from "../policies/DuplicatePolicy";
import type { RegistrationPolicy } from "../policies/RegistrationPolicy";
import type { RemovalPolicy } from "../policies/RemovalPolicy";
import type { RegistryFeatures } from "./RegistryFeatures";

export type RegistryOptions = Readonly<{
  duplicatePolicy: DuplicatePolicy;
  registrationPolicy: RegistrationPolicy;
  removalPolicy: RemovalPolicy;
  features: RegistryFeatures;
}>;
