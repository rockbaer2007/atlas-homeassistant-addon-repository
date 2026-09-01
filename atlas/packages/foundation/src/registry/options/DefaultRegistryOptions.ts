import type { RegistryOptions } from "./RegistryOptions";
import { DuplicatePolicies } from "../policies/DuplicatePolicy";
import { RegistrationPolicies } from "../policies/RegistrationPolicy";
import { RemovalPolicies } from "../policies/RemovalPolicy";

export const DefaultRegistryOptions = {
  duplicatePolicy: DuplicatePolicies.Throw,
  registrationPolicy: RegistrationPolicies.Allow,
  removalPolicy: RemovalPolicies.Allow,
  features: {
    statistics: true,
    diagnostics: false,
    snapshots: true,
    events: true
  }
} as const satisfies RegistryOptions;
