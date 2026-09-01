export type HomeAssistantControllableDomain = "light" | "switch";
export type HomeAssistantControllableService = "turn_on" | "turn_off";
export type HomeAssistantServiceCommand = Readonly<{
    entityId: string;
    domain: HomeAssistantControllableDomain;
    service: HomeAssistantControllableService;
    brightnessPercent?: number;
}>;
export declare function createHomeAssistantBrightnessCommand(entityId: string, brightnessPercent: number): HomeAssistantServiceCommand | undefined;
export declare function isHomeAssistantControllableEntityId(entityId: string): boolean;
export declare function createHomeAssistantServiceCommand(entityId: string, service: HomeAssistantControllableService): HomeAssistantServiceCommand | undefined;
