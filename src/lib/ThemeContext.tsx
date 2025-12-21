"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// Define the themes with their CSS variable values
const themes = {
  oblivion: {
    '--color-primary-bg': '#0A0A0A',
    '--color-secondary-bg': '#1A1A1A',
    '--color-primary-text': '#F0F0F0',
    '--color-secondary-text': '#A0A0A0',
    '--color-accent-1': '#00F0FF', // Cyber Blue
    '--color-accent-2': '#FF00FF', // Cyber Pink
    '--color-border': 'rgba(255,255,255,0.1)',
  },
  matrix: {
    '--color-primary-bg': '#0D0D0D',
    '--color-secondary-bg': '#151515',
    '--color-primary-text': '#00FF41', // Matrix Green
    '--color-secondary-text': '#00AA2C',
    '--color-accent-1': '#00FF41',
    '--color-accent-2': '#00AA2C',
    '--color-border': 'rgba(0,255,65,0.2)',
  },
  akira: {
    '--color-primary-bg': '#140000',
    '--color-secondary-bg': '#200000',
    '--color-primary-text': '#FF2D00', // Akira Red
    '--color-secondary-text': '#FF7043',
    '--color-accent-1': '#FF2D00',
    '--color-accent-2': '#FF7043',
    '--color-border': 'rgba(255,45,0,0.2)',
  },
  void: {
    '--color-primary-bg': '#000000',
    '--color-secondary-bg': '#050505',
    '--color-primary-text': '#FFFFFF',
    '--color-secondary-text': '#E0E0E0',
    '--color-accent-1': '#FFFFFF',
    '--color-accent-2': '#CCCCCC',
    '--color-border': 'rgba(255,255,255,0.1)',
  },
  vaporwave: {
    '--color-primary-bg': '#1a0a2e',
    '--color-secondary-bg': '#2d1b4e',
    '--color-primary-text': '#00fff9',
    '--color-secondary-text': '#ff00c1',
    '--color-accent-1': '#00fff9',
    '--color-accent-2': '#ff00c1',
    '--color-border': 'rgba(0,255,249,0.3)',
  },
  solar: {
    '--color-primary-bg': '#0f0f0f',
    '--color-secondary-bg': '#1a1a1a',
    '--color-primary-text': '#ffaa00',
    '--color-secondary-text': '#cc8800',
    '--color-accent-1': '#ffcc00',
    '--color-accent-2': '#ff6600',
    '--color-border': 'rgba(255,170,0,0.2)',
  },
  netrunner: {
    '--color-primary-bg': '#051a1a',
    '--color-secondary-bg': '#0a2525',
    '--color-primary-text': '#00ff9d',
    '--color-secondary-text': '#00cc7d',
    '--color-accent-1': '#00ff9d',
    '--color-accent-2': '#00b8ff',
    '--color-border': 'rgba(0,255,157,0.2)',
  },
  arctic: {
    '--color-primary-bg': '#081018',
    '--color-secondary-bg': '#102028',
    '--color-primary-text': '#e0f0ff',
    '--color-secondary-text': '#a0c0d0',
    '--color-accent-1': '#00aaff',
    '--color-accent-2': '#ffffff',
    '--color-border': 'rgba(0,170,255,0.2)',
  },
  km18_gold: {
    '--color-primary-bg': '#050505',
    '--color-secondary-bg': '#111111',
    '--color-primary-text': '#D4AF37', // Gold
    '--color-secondary-text': '#C5A028',
    '--color-accent-1': '#FFD700',
    '--color-accent-2': '#FFFFFF',
    '--color-border': 'rgba(212,175,55,0.4)',
  },
};

export type ThemeName = keyof typeof themes;
type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeName;
  colorMode: ColorMode;
  setTheme: (name: ThemeName) => void;
  toggleColorMode: () => void;
  applyThemeStyles: (name: ThemeName) => void;
  availableThemes: { name: ThemeName; colors: { [key: string]: string } }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('oblivion_theme') as ThemeName;
        return (savedTheme && themes[savedTheme]) ? savedTheme : 'oblivion';
    }
    return 'oblivion';
  });
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    if (typeof window !== 'undefined') {
        const savedMode = localStorage.getItem('oblivion_color_mode') as ColorMode;
        return savedMode === 'light' ? 'light' : 'dark';
    }
    return 'dark';
  });

  const applyThemeStyles = useCallback((name: ThemeName, mode: ColorMode) => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    // Handle Light/Dark Mode
    if (mode === 'light') {
        root.setAttribute('data-theme', 'light');
        // Clear inline styles so CSS variables take over
        Object.keys(themes.oblivion).forEach((prop) => {
            root.style.removeProperty(prop);
        });
    } else {
        root.removeAttribute('data-theme');
        // Apply Dark Mode Theme
        const selectedTheme = themes[name];
        if (selectedTheme) {
            Object.entries(selectedTheme).forEach(([prop, value]) => {
                root.style.setProperty(prop, value);
            });
        }
    }
    
    localStorage.setItem('oblivion_theme', name);
    localStorage.setItem('oblivion_color_mode', mode);
  }, []);

  useEffect(() => {
    applyThemeStyles(theme, colorMode);
  }, [theme, colorMode, applyThemeStyles]); // Depend on theme and colorMode now.

  const setTheme = useCallback((name: ThemeName) => {
    setThemeState(name);
    // If setting a specific skin, ensure we are in dark mode (as skins are dark-only for now)
    if (colorMode === 'light') {
        setColorMode('dark');
        applyThemeStyles(name, 'dark');
    } else {
        applyThemeStyles(name, 'dark');
    }
  }, [applyThemeStyles, colorMode]);

  const toggleColorMode = useCallback(() => {
      const newMode = colorMode === 'light' ? 'dark' : 'light';
      setColorMode(newMode);
      applyThemeStyles(theme, newMode);
  }, [colorMode, theme, applyThemeStyles]);

  const availableThemes = Object.entries(themes).map(([name, colors]) => ({
    name: name as ThemeName,
    colors,
  }));

  return (
    <ThemeContext.Provider value={{ theme, colorMode, setTheme, toggleColorMode, applyThemeStyles: (name) => applyThemeStyles(name, colorMode), availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
