export interface ThemeTokens {
  darkest: string;
  dark: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accentDark: string;
  accentLight: string;
  accentPale: string;
  accentSoft: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  mutedText: string;
  border: string;
}

export interface StoreTheme {
  id: string;
  name: string;
  style: string;
  description: string;
  swatches: string[];
  light: ThemeTokens;
  dark: ThemeTokens;
}

const theme = (
  id: string,
  name: string,
  style: string,
  description: string,
  swatches: string[],
  light: ThemeTokens,
  dark: ThemeTokens,
): StoreTheme => ({ id, name, style, description, swatches, light, dark });

export const storeThemes: StoreTheme[] = [
  theme("pistachio", "Pistachio & Belgian Chocolate", "Fresh · Organic · Contemporary",
    "Sage accents with warm vanilla cream and Belgian chocolate depth.",
    ["#A9B89A", "#E9E1CF", "#49352C", "#C9A66B", "#F8F5EC"],
    { darkest: "#29231F", dark: "#382B25", primary: "#49352C", primaryDark: "#382B25", primaryLight: "#765E50", accent: "#C9A66B", accentDark: "#957344", accentLight: "#D8BC8D", accentPale: "#F1E5CB", accentSoft: "#E7EDE0", background: "#F8F5EC", surface: "#FFFEFA", surfaceAlt: "#E9E1CF", text: "#29231F", mutedText: "#756B60", border: "rgba(73,53,44,.16)" },
    { darkest: "#171513", dark: "#211D1A", primary: "#A9B89A", primaryDark: "#879778", primaryLight: "#C6D0BC", accent: "#D6B77D", accentDark: "#B3935C", accentLight: "#E6D0A7", accentPale: "#433D31", accentSoft: "#2F362E", background: "#1C1A17", surface: "#292520", surfaceAlt: "#342E27", text: "#F8F5EC", mutedText: "#C2B8A8", border: "rgba(214,183,125,.22)" }),
  theme("strawberry", "Strawberry Pink & Vanilla Cream", "Romantic · Soft · Elegant",
    "Blush pink accents, berry-brown text and creamy vanilla surfaces.",
    ["#E8A6AD", "#F8E7E2", "#FFF9F1", "#75434B", "#C99B72"],
    { darkest: "#43272B", dark: "#60353C", primary: "#75434B", primaryDark: "#60353C", primaryLight: "#9D6670", accent: "#C99B72", accentDark: "#9F7250", accentLight: "#D9B594", accentPale: "#F3D8D8", accentSoft: "#F8E7E2", background: "#FFF9F1", surface: "#FFFFFF", surfaceAlt: "#F8E7E2", text: "#43272B", mutedText: "#806970", border: "rgba(117,67,75,.16)" },
    { darkest: "#201517", dark: "#2E1E21", primary: "#E8A6AD", primaryDark: "#CE8790", primaryLight: "#F3C4C9", accent: "#D6AA81", accentDark: "#B68A63", accentLight: "#E7C8A8", accentPale: "#4A3033", accentSoft: "#3C292D", background: "#21191A", surface: "#302426", surfaceAlt: "#3B2A2D", text: "#FFF9F1", mutedText: "#D0B9B7", border: "rgba(232,166,173,.22)" }),
  theme("burgundy", "Burgundy & Champagne Luxury", "Royal · Exclusive · Sophisticated",
    "Dramatic burgundy foundations with champagne and antique-gold detail.",
    ["#591F2D", "#8C3544", "#E8D6B9", "#C5A36C", "#FAF4E9"],
    { darkest: "#35141D", dark: "#591F2D", primary: "#591F2D", primaryDark: "#431823", primaryLight: "#8C3544", accent: "#C5A36C", accentDark: "#927343", accentLight: "#D8BE91", accentPale: "#F1E3C9", accentSoft: "#F3E8D8", background: "#FAF4E9", surface: "#FFFCF6", surfaceAlt: "#E8D6B9", text: "#35141D", mutedText: "#75635B", border: "rgba(89,31,45,.17)" },
    { darkest: "#1C1013", dark: "#2B171C", primary: "#C5A36C", primaryDark: "#A8854D", primaryLight: "#D9BD8D", accent: "#D5B87E", accentDark: "#B08D53", accentLight: "#E7D2A9", accentPale: "#493038", accentSoft: "#39262B", background: "#211719", surface: "#302125", surfaceAlt: "#3C292D", text: "#FAF4E9", mutedText: "#D0BEB1", border: "rgba(197,163,108,.24)" }),
  theme("caramel", "Caramel & Coffee", "Warm · Artisanal · Comforting",
    "Coffee-inspired espresso browns, latte cream and toasted caramel tones.",
    ["#B77B4B", "#D6AD83", "#F2E4D3", "#49352E", "#FFF9F0"],
    { darkest: "#30231E", dark: "#49352E", primary: "#49352E", primaryDark: "#382921", primaryLight: "#705447", accent: "#B77B4B", accentDark: "#8D5B36", accentLight: "#CC986B", accentPale: "#F0D8BE", accentSoft: "#F2E4D3", background: "#FFF9F0", surface: "#FFFEFA", surfaceAlt: "#F2E4D3", text: "#30231E", mutedText: "#77665A", border: "rgba(73,53,46,.17)" },
    { darkest: "#181411", dark: "#241C17", primary: "#D6AD83", primaryDark: "#B98B61", primaryLight: "#E5C8A5", accent: "#CC8D5C", accentDark: "#A96D42", accentLight: "#DEA779", accentPale: "#49372C", accentSoft: "#372A22", background: "#1D1915", surface: "#2B241E", surfaceAlt: "#382D24", text: "#FFF9F0", mutedText: "#CBB9A4", border: "rgba(214,173,131,.22)" }),
  theme("lavender", "Lavender & White Chocolate", "Delicate · Modern · Creative",
    "Pastel lilac meets creamy white chocolate with a refined gold accent.",
    ["#B8A5CC", "#E8DFF0", "#FFFDF8", "#74647F", "#D7C3A3"],
    { darkest: "#332D38", dark: "#54485F", primary: "#74647F", primaryDark: "#5A4E65", primaryLight: "#9686A2", accent: "#B8A5CC", accentDark: "#8A759E", accentLight: "#CFC0DD", accentPale: "#F0E9F4", accentSoft: "#E8DFF0", background: "#FFFDF8", surface: "#FFFFFF", surfaceAlt: "#E8DFF0", text: "#332D38", mutedText: "#766E7B", border: "rgba(116,100,127,.17)" },
    { darkest: "#18151B", dark: "#242029", primary: "#B8A5CC", primaryDark: "#9985B1", primaryLight: "#D1C4E0", accent: "#D7C3A3", accentDark: "#AE9773", accentLight: "#E5D6BE", accentPale: "#403747", accentSoft: "#312B37", background: "#1C1920", surface: "#2A2530", surfaceAlt: "#37303D", text: "#FFFDF8", mutedText: "#C8BFCF", border: "rgba(184,165,204,.23)" }),
  theme("terracotta", "Terracotta & Ivory", "Natural · Handcrafted · Authentic",
    "Clay and sand hues give the handmade story an earthy premium feel.",
    ["#B96745", "#D99570", "#F3E6D5", "#5B4035", "#FAF5EB"],
    { darkest: "#3C2923", dark: "#5B4035", primary: "#5B4035", primaryDark: "#453127", primaryLight: "#7A5949", accent: "#B96745", accentDark: "#914D34", accentLight: "#CC8665", accentPale: "#F0D6C6", accentSoft: "#F3E6D5", background: "#FAF5EB", surface: "#FFFEFA", surfaceAlt: "#F3E6D5", text: "#3C2923", mutedText: "#78675C", border: "rgba(91,64,53,.17)" },
    { darkest: "#191311", dark: "#271D18", primary: "#D99570", primaryDark: "#BC7956", primaryLight: "#E8B394", accent: "#C57A58", accentDark: "#9E5E42", accentLight: "#D99570", accentPale: "#49352B", accentSoft: "#392B24", background: "#1F1916", surface: "#2D241F", surfaceAlt: "#3A2D25", text: "#FAF5EB", mutedText: "#CFB9A8", border: "rgba(217,149,112,.22)" }),
  theme("midnight", "Midnight Navy & Gold", "Bold · Exclusive · High-end",
    "A midnight-blue boutique identity, bright champagne and metallic gold.",
    ["#172A46", "#344B68", "#D5B878", "#F1EBDD", "#FFFFFF"],
    { darkest: "#101D31", dark: "#172A46", primary: "#172A46", primaryDark: "#101D31", primaryLight: "#344B68", accent: "#D5B878", accentDark: "#A88B50", accentLight: "#E2CC98", accentPale: "#F3E8CE", accentSoft: "#E9E5D9", background: "#FFFFFF", surface: "#FFFEFA", surfaceAlt: "#F1EBDD", text: "#101D31", mutedText: "#687487", border: "rgba(23,42,70,.16)" },
    { darkest: "#0A1320", dark: "#111D2D", primary: "#D5B878", primaryDark: "#B3985B", primaryLight: "#E7D3A3", accent: "#D5B878", accentDark: "#A88B50", accentLight: "#E8D6A9", accentPale: "#30394A", accentSoft: "#222E40", background: "#121B28", surface: "#1D2938", surfaceAlt: "#273548", text: "#F1EBDD", mutedText: "#B8C0CA", border: "rgba(213,184,120,.23)" }),
  theme("mocha-matcha", "Mocha & Matcha", "Minimal · Natural · Contemporary",
    "Modern matcha-green accents paired with mocha, biscuit and cream.",
    ["#7B8965", "#B9BDA0", "#E8DCC8", "#765342", "#F8F3E9"],
    { darkest: "#3C302A", dark: "#5A4034", primary: "#765342", primaryDark: "#5A4034", primaryLight: "#95715C", accent: "#7B8965", accentDark: "#5C6949", accentLight: "#9BA787", accentPale: "#E6E8D9", accentSoft: "#B9BDA0", background: "#F8F3E9", surface: "#FFFEFA", surfaceAlt: "#E8DCC8", text: "#3C302A", mutedText: "#786C5D", border: "rgba(118,83,66,.17)" },
    { darkest: "#171512", dark: "#211D18", primary: "#B9BDA0", primaryDark: "#969C79", primaryLight: "#D0D2BD", accent: "#9BA787", accentDark: "#7B8965", accentLight: "#B9C1A4", accentPale: "#3A3B31", accentSoft: "#2D3229", background: "#1B1A16", surface: "#28251F", surfaceAlt: "#353027", text: "#F8F3E9", mutedText: "#C5B9A8", border: "rgba(185,189,160,.22)" }),
];

export const defaultThemeId = "pistachio";
export const defaultThemeMode = "light";

export function getStoreTheme(id: string) {
  return storeThemes.find((item) => item.id === id) ?? storeThemes[0];
}

export function tokensToCss(tokens: ThemeTokens) {
  return {
    "--choco-950": tokens.darkest,
    "--choco-900": tokens.dark,
    "--choco-800": tokens.primary,
    "--choco-700": tokens.primaryDark,
    "--choco-600": tokens.primaryLight,
    "--choco-500": tokens.primaryLight,
    "--gold-600": tokens.accentDark,
    "--gold-500": tokens.accent,
    "--gold-400": tokens.accentLight,
    "--gold-300": tokens.accentPale,
    "--gold-100": tokens.accentSoft,
    "--cream-50": tokens.background,
    "--cream-100": tokens.surfaceAlt,
    "--cream-200": tokens.surfaceAlt,
    "--cream-300": tokens.accentPale,
    "--background": tokens.background,
    "--foreground": tokens.text,
    "--card": tokens.surface,
    "--card-foreground": tokens.text,
    "--popover": tokens.surface,
    "--popover-foreground": tokens.text,
    "--primary": tokens.primary,
    "--primary-foreground": tokens.background,
    "--secondary": tokens.surfaceAlt,
    "--secondary-foreground": tokens.text,
    "--muted": tokens.surfaceAlt,
    "--muted-foreground": tokens.mutedText,
    "--accent": tokens.accent,
    "--accent-foreground": tokens.darkest,
    "--border": tokens.border,
    "--input-background": tokens.surface,
    "--ring": tokens.accent,
    "--color-primary": tokens.primary,
    "--color-secondary": tokens.surfaceAlt,
    "--color-background": tokens.background,
    "--color-surface": tokens.surface,
    "--color-text": tokens.text,
    "--color-accent": tokens.accent,
    "--color-button": tokens.primary,
    "--color-border": tokens.border,
  } as Record<string, string>;
}
