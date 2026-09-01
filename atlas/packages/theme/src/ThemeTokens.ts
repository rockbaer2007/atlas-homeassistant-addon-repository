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

export const DefaultThemeTokens: ThemeTokens = {
  colorBackground: "#f5f7fb",
  colorSurface: "#ffffff",
  colorText: "#172033",
  colorAccent: "#0f766e",
  fontFamily: "system-ui, sans-serif",
  spacing: "16px",
};

export function createThemeTokens(tokens: Partial<ThemeTokens> = {}): ThemeTokens {
  return { ...DefaultThemeTokens, ...tokens };
}

export function createThemeCssVariables(tokens: ThemeTokens): Readonly<Record<string, string>> {
  return {
    "--atlas-color-background": tokens.colorBackground,
    "--atlas-color-surface": tokens.colorSurface,
    "--atlas-color-text": tokens.colorText,
    "--atlas-color-accent": tokens.colorAccent,
    "--atlas-font-family": tokens.fontFamily,
    "--atlas-spacing": tokens.spacing,
  };
}

export function createThemeStylesheet(tokens: ThemeTokens, selector = ":root"): string {
  const declarations = Object.entries(createThemeCssVariables(tokens))
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");

  return `${selector} {\n${declarations}\n}`;
}

export function applyThemeTokens(target: ThemeStyleTarget, tokens: ThemeTokens): void {
  for (const [name, value] of Object.entries(createThemeCssVariables(tokens))) {
    target.style.setProperty(name, value);
  }
}
