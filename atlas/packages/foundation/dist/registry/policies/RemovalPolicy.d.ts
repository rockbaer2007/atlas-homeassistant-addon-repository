export declare const RemovalPolicies: {
    readonly Allow: "allow";
    readonly Reject: "reject";
};
export type RemovalPolicy = typeof RemovalPolicies[keyof typeof RemovalPolicies];
