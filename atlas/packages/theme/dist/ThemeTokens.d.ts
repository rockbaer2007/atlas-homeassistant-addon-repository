export type ThemeTokens = Readonly<{
    colorBackground: string;
    colorSurface: string;
    colorText: string;
    colorAccent: string;
    fontFamily: string;
    spacing: string;
}>;
export type ThemeStyleTarget = Readonly<{
    style: {
        setProperty(name: string, value: string): void;
    };
}>;
export declare const DefaultThemeTokens: ThemeTokens;
export declare function createThemeTokens(tokens?: Partial<ThemeTokens>): ThemeTokens;
export declare function createThemeCssVariables(tokens: ThemeTokens): Readonly<Record<string, string>>;
export declare function createThemeStylesheet(tokens: ThemeTokens, selector?: string): string;
export declare function applyThemeTokens(target: ThemeStyleTarget, tokens: ThemeTokens): void;
