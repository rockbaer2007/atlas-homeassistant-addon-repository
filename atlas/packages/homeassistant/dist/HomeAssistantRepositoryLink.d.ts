export type HomeAssistantAddOnRepositoryLinkRequest = Readonly<{
    repositoryUrl: string;
    baseUrl?: string;
}>;
export declare function createHomeAssistantAddOnRepositoryLink(request: HomeAssistantAddOnRepositoryLinkRequest): string;
export declare function sanitizeHomeAssistantRepositoryUrl(value: string): string;
