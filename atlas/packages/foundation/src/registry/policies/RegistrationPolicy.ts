export const RegistrationPolicies = {
  Allow: "allow",
  Reject: "reject",
  Replace: "replace"
} as const;

export type RegistrationPolicy =
  typeof RegistrationPolicies[keyof typeof RegistrationPolicies];
