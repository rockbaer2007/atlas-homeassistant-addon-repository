export declare const DuplicatePolicies: {
    readonly Throw: "throw";
    readonly Replace: "replace";
    readonly Ignore: "ignore";
};
export type DuplicatePolicy = typeof DuplicatePolicies[keyof typeof DuplicatePolicies];
