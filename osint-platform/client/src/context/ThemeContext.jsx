import { createContext, useContext, useEffect, useLayoutEffect, useState, useRef } from 'react';
import { THEMES, DEFAULT_THEME } from '../utils/themes';

const ThemeContext = createContext(null);

const ROOT = document.documentElement;
const STORAGE_KEY = 'sentryscope_theme';

function applyTheme(themeId) {
  const theme = THEMES[themeId] || THEMES[DEFAULT_THEME];
  ROOT.style.setProperty('--theme-base', theme.colors.base);
  ROOT.style.setProperty('--theme-base-soft', theme.colors['base-soft']);
  ROOT.style.setProperty('--theme-card', theme.colors.card);
  ROOT.style.setProperty('--theme-card-hover', theme.colors['card-hover']);
  ROOT.style.setProperty('--theme-border', theme.colors.border);
  ROOT.style.setProperty('--theme-border-strong', theme.colors['border-strong']);
  ROOT.style.setProperty('--theme-accent', theme.colors.accent.DEFAULT);
  ROOT.style.setProperty('--theme-accent-dim', theme.colors.accent.dim);
  ROOT.style.setProperty('--theme-accent-glow', theme.colors.accent.glow);
  ROOT.style.setProperty('--theme-secondary', theme.colors.secondary.DEFAULT);
  ROOT.style.setProperty('--theme-secondary-dim', theme.colors.secondary.dim);
  ROOT.style.setProperty('--theme-secondary-glow', theme.colors.secondary.glow);
  ROOT.style.setProperty('--theme-danger', theme.colors.danger.DEFAULT);
  ROOT.style.setProperty('--theme-danger-dim', theme.colors.danger.dim);
  ROOT.style.setProperty('--theme-danger-glow', theme.colors.danger.glow);
  ROOT.style.setProperty('--theme-warning', theme.colors.warning.DEFAULT);
  ROOT.style.setProperty('--theme-warning-dim', theme.colors.warning.dim);
  ROOT.style.setProperty('--theme-warning-glow', theme.colors.warning.glow);
  ROOT.style.setProperty('--theme-text', theme.colors.text.DEFAULT);
  ROOT.style.setProperty('--theme-text-muted', theme.colors.text.muted);
  ROOT.style.setProperty('--theme-text-faint', theme.colors.text.faint);
  ROOT.style.setProperty('--theme-surface', theme.colors.surface);
  ROOT.style.setProperty('--theme-surface-border', theme.colors['surface-border']);
  ROOT.setAttribute('data-theme', themeId);
}

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME);
  const isFirstRender = useRef(true);

  useLayoutEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, themeId);
    } catch {
      // Storage may be unavailable
    }
  }, [themeId]);

  const value = {
    themeId,
    setThemeId,
    themes: Object.values(THEMES),
    currentTheme: THEMES[themeId] || THEMES[DEFAULT_THEME],
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
