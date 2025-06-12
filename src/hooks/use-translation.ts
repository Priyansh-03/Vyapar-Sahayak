
"use client";

import { useLanguage } from "@/contexts/language-context";

export const useTranslation = () => {
  const { t, language, setLanguage, isLoading } = useLanguage();
  return { t, currentLanguage: language, setLanguage, isLoadingTranslations: isLoading };
};
