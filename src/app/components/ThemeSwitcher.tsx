import { useRef, useState } from "react";
import { Check, Moon, Palette, Sun } from "lucide-react";
import { storeThemes } from "../themes/themeOptions";
import { useStoreTheme } from "../themes/ThemeContext";

interface ThemeSwitcherProps {
  compact?: boolean;
}

export function ThemeSwitcher({ compact = false }: ThemeSwitcherProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { themeId, mode, setThemeId, setMode } = useStoreTheme();
  const currentTheme = storeThemes.find((theme) => theme.id === themeId) ?? storeThemes[0];

  return (
    <div ref={containerRef} className={`relative ${compact ? "w-full" : ""}`}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--choco-800)] transition-colors hover:bg-[var(--gold-100)] ${compact ? "w-full justify-center" : ""}`}
      >
        <Palette size={17} />
        <span>{compact ? "Choose a theme" : "Theme"}</span>
        {!compact && (
          <span className="hidden max-w-28 truncate text-xs text-[var(--muted-foreground)] xl:inline">
            {currentTheme.name.split(" & ")[0]}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose website theme"
          className={`${compact ? "relative mx-auto w-full" : "absolute right-0 w-[min(21rem,calc(100vw-2rem))]"} z-[70] mt-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-[var(--foreground)] shadow-2xl`}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Choose your palette</p>
              <p className="text-xs text-[var(--muted-foreground)]">Saved on this device</p>
            </div>
            <button
              type="button"
              onClick={() => setMode(mode === "light" ? "dark" : "light")}
              className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium hover:bg-[var(--secondary)]"
              aria-label={`Switch to ${mode === "light" ? "dark" : "light"} presentation`}
            >
              {mode === "light" ? <Moon size={14} /> : <Sun size={14} />}
              {mode === "light" ? "Dark" : "Light"}
            </button>
          </div>
          <div className="max-h-[min(55vh,26rem)] space-y-1 overflow-y-auto">
            {storeThemes.map((theme) => {
              const selected = theme.id === themeId;
              return (
                <button
                  type="button"
                  key={theme.id}
                  aria-pressed={selected}
                  onClick={() => {
                    setThemeId(theme.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${selected ? "border-[var(--gold-500)] bg-[var(--gold-100)]" : "border-transparent hover:bg-[var(--secondary)]"}`}
                >
                  <span className="flex shrink-0 overflow-hidden rounded-full ring-1 ring-black/10">
                    {theme.swatches.map((color, index) => (
                      <span key={`${theme.id}-${index}`} className="h-6 w-3.5" style={{ backgroundColor: color }} />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold">{theme.name}</span>
                    <span className="block truncate text-[10px] text-[var(--muted-foreground)]">{theme.style}</span>
                  </span>
                  {selected && <Check size={16} className="shrink-0 text-[var(--gold-600)]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
