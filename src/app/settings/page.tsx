
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; // Added Switch
import { useTranslation } from "@/hooks/use-translation";
import { useSettings } from "@/contexts/settings-context";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useState, useEffect, useCallback } from "react";
import { Save, BellRing, BellOff } from "lucide-react"; // Added BellRing, BellOff
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { 
    globalLowStockThreshold, 
    setGlobalLowStockThreshold,
    notificationsEnabled,     // Added
    setNotificationsEnabled   // Added
  } = useSettings();

  const [thresholdInput, setThresholdInput] = useState<string>("");

  useEffect(() => {
    if (globalLowStockThreshold !== undefined) {
      setThresholdInput(globalLowStockThreshold.toString());
    }
  }, [globalLowStockThreshold]);

  const handleThresholdSave = useCallback(() => {
    try {
      const newThreshold = parseInt(thresholdInput, 10);
      if (isNaN(newThreshold) || newThreshold < 0) {
        throw new Error(t("settingsInvalidThresholdError"));
      }
      setGlobalLowStockThreshold(newThreshold);
      toast({ 
        title: t("settingsSavedTitle"),
        description: t("settingsGlobalThresholdUpdated", { threshold: newThreshold }),
        variant: "default",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({ 
        title: t("settingsErrorSavingThresholdTitle"),
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error saving threshold:", error);
      setThresholdInput(globalLowStockThreshold.toString());
    }
  }, [thresholdInput, setGlobalLowStockThreshold, t, globalLowStockThreshold]);

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-nunito font-bold text-primary text-center sm:text-left">
        {t("settingsTitle")}
      </h1>
      
      <Card className="shadow-xl rounded-xl bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-nunito text-foreground">
            {t("settingsThemeLabel")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <ThemeToggle />
            <p className="text-sm text-muted-foreground">
              {t("settingsThemeDescription")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl rounded-xl bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-nunito text-foreground">
            {t("settingsLanguageSectionTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <LanguageSwitcher />
            <p className="text-sm text-muted-foreground">
             {t("settingsLanguageDescription")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl rounded-xl bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-nunito text-foreground">
            {t("settingsNotificationsTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 rounded-lg bg-background border border-border p-3">
            <Label htmlFor="notification-toggle" className="flex items-center cursor-pointer flex-grow">
              {notificationsEnabled ? (
                <BellRing className="mr-3 h-5 w-5 text-primary" />
              ) : (
                <BellOff className="mr-3 h-5 w-5 text-muted-foreground" />
              )}
              <span className="text-md text-foreground">{t("settingsNotificationsEnableLabel")}</span>
            </Label>
            <Switch
              id="notification-toggle"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
              aria-label={t("settingsNotificationsEnableLabel")}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {t("settingsNotificationsEnableDescription")}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xl rounded-xl bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-nunito text-foreground">
            {t("settingsStockAlertTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="global-threshold" className="text-muted-foreground">
              {t("settingsGlobalThresholdLabel")}
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="global-threshold"
                type="number"
                min="0"
                value={thresholdInput}
                onChange={(e) => setThresholdInput(e.target.value)}
                className="rounded-lg bg-input border-border focus:ring-primary text-foreground max-w-xs"
              />
              <Button onClick={handleThresholdSave} size="sm" className="rounded-full button-hover-effect">
                 <Save className="h-4 w-4 sm:mr-2" />
                 <span className="hidden sm:inline">{t("settingsSaveThresholdButton")}</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("settingsGlobalThresholdDescription")}
            </p>
          </div>
           <p className="text-sm text-muted-foreground">
              {t("settingsPerProductOverrideNote")}
            </p>
        </CardContent>
      </Card>

    </div>
  );
}
