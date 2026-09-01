export const DuplicatePolicies = {
  Throw: "throw",
  Replace: "replace",
  Ignore: "ignore"
} as const;

export type DuplicatePolicy =
  typeof DuplicatePolicies[keyof typeof DuplicatePolicies];
