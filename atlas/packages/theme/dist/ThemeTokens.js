export const DefaultThemeTokens = {
    colorBackground: "#f5f7fb",
    colorSurface: "#ffffff",
    colorText: "#172033",
    colorAccent: "#0f766e",
    fontFamily: "system-ui, sans-serif",
    spacing: "16px",
};
export function createThemeTokens(tokens = {}) {
    return { ...DefaultThemeTokens, ...tokens };
}
export function createThemeCssVariables(tokens) {
    return {
        "--atlas-color-background": tokens.colorBackground,
        "--atlas-color-surface": tokens.colorSurface,
        "--atlas-color-text": tokens.colorText,
        "--atlas-color-accent": tokens.colorAccent,
        "--atlas-font-family": tokens.fontFamily,
        "--atlas-spacing": tokens.spacing,
    };
}
export function createThemeStylesheet(tokens, selector = ":root") {
    const declarations = Object.entries(createThemeCssVariables(tokens))
        .map(([name, value]) => `  ${name}: ${value};`)
        .join("\n");
    return `${selector} {\n${declarations}\n}`;
}
export function applyThemeTokens(target, tokens) {
    for (const [name, value] of Object.entries(createThemeCssVariables(tokens))) {
        target.style.setProperty(name, value);
    }
}
