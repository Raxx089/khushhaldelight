import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  defaultThemeId,
  defaultThemeMode,
  getStoreTheme,
  storeThemes,
  tokensToCss,
} from "./themeOptions";

export type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  themeId: string;
  mode: ThemeMode;
  setThemeId: (id: string) => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const themeStorageKey = "khushhal-store-theme";
const modeStorageKey = "khushhal-store-theme-mode";

function readThemeId() {
  try {
    const saved = window.localStorage.getItem(themeStorageKey);
    return saved && storeThemes.some((theme) => theme.id === saved) ? saved : defaultThemeId;
  } catch {
    return defaultThemeId;
  }
}

function readMode(): ThemeMode {
  try {
    return window.localStorage.getItem(modeStorageKey) === "dark" ? "dark" : defaultThemeMode;
  } catch {
    return defaultThemeMode;
  }
}

function applyTheme(themeId: string, mode: ThemeMode) {
  const root = document.documentElement;
  const selected = getStoreTheme(themeId);
  root.dataset.theme = selected.id;
  root.dataset.themeMode = mode;
  for (const [property, value] of Object.entries(tokensToCss(selected[mode]))) {
    root.style.setProperty(property, value);
  }
  root.style.colorScheme = mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState(readThemeId);
  const [mode, setModeState] = useState<ThemeMode>(readMode);

  useEffect(() => {
    applyTheme(themeId, mode);
  }, [themeId, mode]);

  const value = useMemo<ThemeContextValue>(() => ({
    themeId,
    mode,
    setThemeId: (id) => {
      if (!storeThemes.some((theme) => theme.id === id)) return;
      setThemeIdState(id);
      try {
        window.localStorage.setItem(themeStorageKey, id);
      } catch {
        console.warn("Theme selection could not be saved in this browser.");
      }
    },
    setMode: (nextMode) => {
      setModeState(nextMode);
      try {
        window.localStorage.setItem(modeStorageKey, nextMode);
      } catch {
        console.warn("Theme presentation mode could not be saved in this browser.");
      }
    },
  }), [themeId, mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useStoreTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useStoreTheme must be used within ThemeProvider");
  return context;
}
