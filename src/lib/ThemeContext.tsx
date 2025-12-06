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
};

type ThemeName = keyof typeof themes;

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (name: ThemeName) => void;
  applyThemeStyles: (name: ThemeName) => void;
  availableThemes: { name: ThemeName; colors: { [key: string]: string } }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('oblivion'); // Default theme

  // Apply theme styles to the document root
  const applyThemeStyles = useCallback((name: ThemeName) => {
    const root = document.documentElement;
    const selectedTheme = themes[name];
    if (selectedTheme) {
      Object.entries(selectedTheme).forEach(([prop, value]) => {
        root.style.setProperty(prop, value);
      });
      localStorage.setItem('oblivion_theme', name);
    }
  }, []);

  // Load theme from localStorage on mount and apply
  useEffect(() => {
    const savedTheme = localStorage.getItem('oblivion_theme') as ThemeName;
    if (savedTheme && themes[savedTheme]) {
      setThemeState(savedTheme);
      applyThemeStyles(savedTheme);
    } else {
      applyThemeStyles(theme); // Apply default theme if no saved theme
    }
  }, [applyThemeStyles, theme]);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeState(name);
    applyThemeStyles(name);
  }, [applyThemeStyles]);

  const availableThemes = Object.entries(themes).map(([name, colors]) => ({
    name: name as ThemeName,
    colors,
  }));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, applyThemeStyles, availableThemes }}>
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
