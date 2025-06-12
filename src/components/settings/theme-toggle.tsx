
"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";


export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const isDark = theme !== 'light-theme-vyapar'; // Assuming default is dark

  return (
    <div className="flex items-center space-x-3 p-3 bg-background rounded-lg border border-border">
      <Label htmlFor="theme-switch" className="flex items-center cursor-pointer text-foreground flex-grow">
        {isDark ? 
          <Moon className="mr-3 h-6 w-6 text-primary" /> : 
          <Sun className="mr-3 h-6 w-6 text-accent" />
        }
        <span className="text-base font-medium">
         {isDark ? t("settingsThemeDark") : t("settingsThemeLight")}
        </span>
      </Label>
      <Switch
        id="theme-switch"
        checked={isDark}
        onCheckedChange={toggleTheme}
        aria-label="Toggle theme"
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
      />
    </div>
  );
}
