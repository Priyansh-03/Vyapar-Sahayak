
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/hooks/use-translation";
import { User, Edit3, Shield, History, Edit2 } from "lucide-react"; 
import { userProfileData, type UserProfileData } from "@/data/mock-data";
import { ProfileEditDialog } from "@/components/pages/profile/profile-edit-dialog";
import { useToast, toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { PremiumFeatureDialog } from "@/components/layout/premium-feature-dialog"; // Import Premium Dialog

export default function ProfilePage() {
  const { t } = useTranslation();
  const { toasts } = useToast();

  const [currentUser, setCurrentUser] = useState<UserProfileData>({...userProfileData});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPremiumDialogVisible, setIsPremiumDialogVisible] = useState(false); // State for premium dialog

  const handleEditProfile = () => {
    setIsEditDialogOpen(true);
  };
  
  const handleSaveProfile = useCallback(async (data: Pick<UserProfileData, "name" | "email">) => {
    userProfileData.name = data.name;
    userProfileData.email = data.email;
    setCurrentUser({ ...userProfileData }); 
    toast({
      title: t("profileUpdateSuccessTitle"),
      description: t("profileUpdateSuccessDescription"),
      variant: "default",
    });
    setIsEditDialogOpen(false);
  }, [t]);

  const handleChangePassword = () => {
    toast({
      title: t("profileFeatureComingSoonTitle"),
      description: t("profileChangePasswordDescription"),
      variant: "default",
    });
  };

  const handleAvatarEditClick = () => {
    setIsPremiumDialogVisible(true);
  };
  
  const recentActivities = toasts.map(t => ({
    id: t.id,
    description: typeof t.description === 'string' ? t.description : String(t.title || "Activity"),
    timestamp: new Date()
  })).slice(0, 5);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="text-center sm:text-left">
        <h1 className="text-3xl font-nunito font-bold text-primary flex items-center justify-center sm:justify-start">
          <User className="mr-3 h-8 w-8" />
          {t("profilePageTitle")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("profilePageDescription")}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 shadow-xl rounded-xl bg-card border-border">
          <CardHeader className="items-center text-center p-6">
            <div className="relative mb-4 group">
              <Avatar className="h-24 w-24 ring-2 ring-primary ring-offset-2 ring-offset-card">
                <AvatarImage 
                  src={`https://placehold.co/128x128.png?text=${currentUser.name.substring(0,2).toUpperCase()}`} 
                  alt={currentUser.name} 
                  data-ai-hint="user avatar placeholder" 
                />
                <AvatarFallback className="text-3xl">
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-background/80 hover:bg-accent group-hover:opacity-100 opacity-50 transition-opacity duration-200 border-border hover:border-primary"
                onClick={handleAvatarEditClick}
                aria-label={t("profileChangeAvatarAriaLabel")}
              >
                <Edit2 className="h-4 w-4 text-foreground group-hover:text-primary" />
              </Button>
            </div>
            <CardTitle className="text-2xl font-nunito text-foreground">{currentUser.name}</CardTitle>
            <CardDescription className="text-muted-foreground">{currentUser.email}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground p-6 pt-0">
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span>{t("profileJoinedDateLabel")}:</span>
                    <span className="font-medium text-foreground">{format(new Date(currentUser.joinedDate), "dd/MM/yyyy")}</span>
                </div>
            </div>
             <Button 
                variant="outline" 
                className="w-full mt-6 rounded-full button-hover-effect-accent"
                onClick={handleEditProfile}
              >
              <Edit3 className="mr-2 h-4 w-4" />
              {t("profileEditButton")}
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-xl rounded-xl bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl font-nunito text-primary">{t("profileAccountSettingsLink")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-6">
            <Button 
                variant="ghost" 
                className="w-full justify-start text-md py-4 rounded-lg hover:bg-muted/50 hover:text-primary"
                onClick={handleChangePassword}
            >
              <Shield className="mr-3 h-5 w-5 text-muted-foreground" />
              {t("profileChangePasswordButton")}
            </Button>
            <Separator />
            <div className="pt-4">
                <div className="flex items-center text-md mb-3">
                    <History className="mr-3 h-5 w-5 text-muted-foreground" />
                    <span className="text-foreground">{t("profileActivityLogTitle")}</span>
                </div>
                {recentActivities.length > 0 ? (
                <ScrollArea className="h-40 pr-3">
                    <ul className="space-y-2">
                    {recentActivities.map((activity) => (
                        <li key={activity.id} className="text-xs text-muted-foreground p-2 bg-background/30 rounded-md border border-border">
                         {activity.description}
                        </li>
                    ))}
                    </ul>
                </ScrollArea>
                ) : (
                <p className="text-sm text-muted-foreground">{t("profileNoActivity")}</p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <ProfileEditDialog
            currentUser={currentUser}
            onSave={handleSaveProfile}
            onClose={() => setIsEditDialogOpen(false)}
            isOpen={isEditDialogOpen}
        />
      </Dialog>

      <PremiumFeatureDialog
        isOpen={isPremiumDialogVisible}
        onClose={() => setIsPremiumDialogVisible(false)}
      />
    </div>
  );
}
    
