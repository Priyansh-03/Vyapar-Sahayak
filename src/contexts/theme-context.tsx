
"use client";

import type { ReactNode } from "react";
import React, { createContext, useState, useEffect, useCallback } from "react";
import useLocalStorage from "@/hooks/use-local-storage";

export type Theme = "dark-pine" | "light-theme-vyapar";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useLocalStorage<Theme>("vyapar_sahayak_theme", "dark-pine");

  const applyThemeToDocument = useCallback((selectedTheme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove("light-theme-vyapar", "dark-pine"); // Remove all theme classes
    if (selectedTheme === "light-theme-vyapar") {
      root.classList.add("light-theme-vyapar");
    } else {
      root.classList.add("dark-pine"); // Default to dark-pine if not light
    }
  }, []);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme, applyThemeToDocument]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark-pine" ? "light-theme-vyapar" : "dark-pine");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
