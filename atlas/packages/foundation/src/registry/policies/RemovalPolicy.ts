export const RemovalPolicies = {
  Allow: "allow",
  Reject: "reject"
} as const;

export type RemovalPolicy =
  typeof RemovalPolicies[keyof typeof RemovalPolicies];
