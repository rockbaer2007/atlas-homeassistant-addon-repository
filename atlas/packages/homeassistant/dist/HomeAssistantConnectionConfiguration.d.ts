export type HomeAssistantConnectionConfiguration = Readonly<{
    url: string;
}>;
export type HomeAssistantConnectionReadiness = Readonly<{
    ready: boolean;
    reason?: string;
}>;
export declare function createHomeAssistantConnectionConfiguration(configuration: HomeAssistantConnectionConfiguration): HomeAssistantConnectionConfiguration;
export declare function inspectHomeAssistantConnectionReadiness(configuration: HomeAssistantConnectionConfiguration): HomeAssistantConnectionReadiness;
export declare function deriveHomeAssistantWebSocketUrl(configuration: HomeAssistantConnectionConfiguration): string | undefined;
