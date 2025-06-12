
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Language } from "@/types";
import useLocalStorage from "@/hooks/use-local-storage";

// Dynamically import locales
const loadLocale = async (language: Language) => {
  switch (language) {
    case "hi-IN":
      return (await import("@/locales/hi-IN.json")).default;
    case "hi":
      return (await import("@/locales/hi.json")).default;
    default:
      return (await import("@/locales/en.json")).default;
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Record<string, string>;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useLocalStorage<Language>("vyapar_sahayak_language", "en");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTranslations = async () => {
      setIsLoading(true);
      const loadedTranslations = await loadLocale(language);
      setTranslations(loadedTranslations);
      setIsLoading(false);
    };
    fetchTranslations();
  }, [language]);

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    let translation = translations[key] || key;
    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(`{${placeholder}}`, String(replacements[placeholder]));
      });
    }
    return translation;
  }, [translations]);
  

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
