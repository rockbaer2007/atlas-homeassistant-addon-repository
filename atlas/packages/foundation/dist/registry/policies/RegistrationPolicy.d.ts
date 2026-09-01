export declare const RegistrationPolicies: {
    readonly Allow: "allow";
    readonly Reject: "reject";
    readonly Replace: "replace";
};
export type RegistrationPolicy = typeof RegistrationPolicies[keyof typeof RegistrationPolicies];
