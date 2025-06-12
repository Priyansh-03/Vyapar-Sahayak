
"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import type { Language } from "@/types";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { t, currentLanguage, setLanguage, isLoadingTranslations } = useTranslation();

  const [triggerAriaLabel, setTriggerAriaLabel] = useState("Select language");
  const [placeholderText, setPlaceholderText] = useState("Select language");

  useEffect(() => {
    if (!isLoadingTranslations) {
      const translatedLabel = t("settingsLanguageLabel");
      setTriggerAriaLabel(translatedLabel);
      setPlaceholderText(translatedLabel);
    }
  }, [isLoadingTranslations, t]);

  const languages: { value: Language; labelKey: string }[] = [
    { value: "en", labelKey: "settingsLanguageEnglish" },
    { value: "hi-IN", labelKey: "settingsLanguageHinglish" },
    { value: "hi", labelKey: "settingsLanguageHindi" },
  ];

  return (
    <Select
      value={currentLanguage}
      onValueChange={(value: Language) => setLanguage(value)}
    >
      <SelectTrigger 
        suppressHydrationWarning // Added to address aria-controls mismatch
        className="w-auto h-9 rounded-full px-3 border-muted hover:border-primary focus:ring-primary gap-2 text-sm"
        aria-label={triggerAriaLabel}
      >
        <Languages className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
        <SelectValue placeholder={placeholderText} />
      </SelectTrigger>
      <SelectContent className="rounded-lg">
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {t(lang.labelKey)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
