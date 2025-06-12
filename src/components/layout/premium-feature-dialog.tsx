
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { CheckCircle2, XCircle, Star } from "lucide-react";

interface PremiumFeatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeatureComparison {
  featureKey: string;
  basicDescriptionKey: string;
  premiumDescriptionKey: string;
  premiumOnly?: boolean;
}

export function PremiumFeatureDialog({ isOpen, onClose }: PremiumFeatureDialogProps) {
  const { t } = useTranslation();

  const features: FeatureComparison[] = [
    // Basic Features (also in Premium)
    {
      featureKey: "premiumDialogFeatureDashboard",
      basicDescriptionKey: "premiumDialogFeatureIncluded",
      premiumDescriptionKey: "premiumDialogFeatureIncluded",
      premiumOnly: false,
    },
    {
      featureKey: "premiumDialogFeatureManageProducts",
      basicDescriptionKey: "premiumDialogFeatureIncluded",
      premiumDescriptionKey: "premiumDialogFeatureIncluded",
      premiumOnly: false,
    },
    {
      featureKey: "premiumDialogFeatureGenerateBill",
      basicDescriptionKey: "premiumDialogFeatureIncluded",
      premiumDescriptionKey: "premiumDialogFeatureIncluded",
      premiumOnly: false,
    },
    {
      featureKey: "premiumDialogFeatureManageLedger",
      basicDescriptionKey: "premiumDialogFeatureIncluded",
      premiumDescriptionKey: "premiumDialogFeatureIncluded",
      premiumOnly: false,
    },
    {
      featureKey: "premiumDialogFeatureViewHistory",
      basicDescriptionKey: "premiumDialogFeatureIncluded",
      premiumDescriptionKey: "premiumDialogFeatureIncluded",
      premiumOnly: false,
    },
    {
      featureKey: "premiumDialogFeatureSettingsApp",
      basicDescriptionKey: "premiumDialogFeatureIncluded",
      premiumDescriptionKey: "premiumDialogFeatureIncluded",
      premiumOnly: false,
    },
    {
      featureKey: "premiumDialogFeatureChatbotBasic",
      basicDescriptionKey: "premiumDialogFeatureIncluded",
      premiumDescriptionKey: "premiumDialogFeatureIncluded",
      premiumOnly: false,
    },
    {
      featureKey: "premiumDialogFeatureVoiceDictation",
      basicDescriptionKey: "premiumDialogFeatureIncluded",
      premiumDescriptionKey: "premiumDialogFeatureIncluded",
      premiumOnly: false,
    },
    // Premium-Only Features
    {
      featureKey: "premiumDialogFeatureVoiceCommands",
      basicDescriptionKey: "premiumDialogVoiceCommandsBasic",
      premiumDescriptionKey: "premiumDialogVoiceCommandsPremium",
      premiumOnly: true,
    },
    {
      featureKey: "premiumDialogFeatureProfilePictures",
      basicDescriptionKey: "premiumDialogProfilePicturesBasic",
      premiumDescriptionKey: "premiumDialogProfilePicturesPremium",
      premiumOnly: true,
    },
    {
      featureKey: "premiumDialogFeatureItemPictures",
      basicDescriptionKey: "premiumDialogItemPicturesBasic",
      premiumDescriptionKey: "premiumDialogItemPicturesPremium",
      premiumOnly: true,
    },
     {
      featureKey: "premiumDialogFeatureAdvancedAnalytics",
      basicDescriptionKey: "premiumDialogAdvancedAnalyticsBasic",
      premiumDescriptionKey: "premiumDialogAdvancedAnalyticsPremium",
      premiumOnly: true,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl rounded-xl bg-card border-border p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="font-nunito text-primary text-2xl flex items-center">
            <Star className="mr-3 h-7 w-7 text-yellow-400" />
            {t("premiumDialogTitle")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground pt-1">
            {t("premiumDialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
          {/* Basic Column */}
          <div className="border border-border rounded-lg p-4 bg-background/30">
            <h3 className="text-xl font-semibold text-foreground mb-4">{t("premiumDialogBasicTitle")}</h3>
            <ul className="space-y-3">
              {features.map((item, index) => (
                <li key={`basic-${index}`} className="flex items-start">
                  {item.premiumOnly ? (
                    <XCircle className="h-5 w-5 text-destructive mr-2.5 mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2.5 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <span className="font-medium text-foreground block">{t(item.featureKey)}</span>
                    <span className="text-xs text-muted-foreground">{t(item.basicDescriptionKey)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Premium Column */}
          <div className="border-2 border-primary rounded-lg p-4 bg-primary/5 relative shadow-lg">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-0.5 rounded-full text-xs font-semibold shadow-md">
              {t("premiumDialogPopularBadge")}
            </div>
            <h3 className="text-xl font-semibold text-primary mb-4">{t("premiumDialogPremiumTitle")}</h3>
            <ul className="space-y-3">
              {features.map((item, index) => (
                <li key={`premium-${index}`} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2.5 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium text-foreground block">{t(item.featureKey)}</span>
                    <span className="text-xs text-muted-foreground">{t(item.premiumDescriptionKey)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="p-6 border-t border-border gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="rounded-full">
              {t("cancelButton")}
            </Button>
          </DialogClose>
          <Button 
            type="button" 
            className="rounded-full button-hover-effect bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white"
            onClick={() => { /* Future: handle upgrade action */ onClose(); }}
          >
            <Star className="mr-2 h-4 w-4" />
            {t("premiumDialogUpgradeButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
