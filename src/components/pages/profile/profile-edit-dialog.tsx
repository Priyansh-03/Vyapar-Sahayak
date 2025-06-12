
"use client";

import React from "react"; // Added this line
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogContent } from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/use-translation";
import type { UserProfileData } from "@/data/mock-data"; // Import the interface
import { useState } from "react";

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileEditDialogProps {
  currentUser: UserProfileData;
  onSave: (data: Pick<UserProfileData, "name" | "email">) => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
}

export function ProfileEditDialog({ currentUser, onSave, onClose, isOpen }: ProfileEditDialogProps) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
    },
  });
  
  // Reset form if currentUser changes (e.g. on dialog open)
  React.useEffect(() => {
    if (currentUser) {
      form.reset({
        name: currentUser.name,
        email: currentUser.email,
      });
    }
  }, [currentUser, form, isOpen]);


  async function onSubmit(data: ProfileFormValues) {
    setIsSaving(true);
    try {
      await onSave(data);
      // Success toast is handled by the parent page
      onClose(); // Close dialog on successful save
    } catch (error) {
      // Error toast can also be handled by parent or here if needed
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <DialogContent className="sm:max-w-lg rounded-xl bg-card border-border">
      <DialogHeader>
        <DialogTitle className="font-nunito text-primary">{t("profileEditDialogTitle")}</DialogTitle>
        <DialogDescription className="text-muted-foreground">
          {t("profileEditDialogDescription")}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">{t("profileFormNameLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("profileFormNamePlaceholder")} {...field} className="rounded-lg bg-input border-border focus:ring-primary text-foreground"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">{t("profileFormEmailLabel")}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t("profileFormEmailPlaceholder")} {...field} className="rounded-lg bg-input border-border focus:ring-primary text-foreground"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="rounded-full">
              {t("cancelButton")}
            </Button>
            <Button type="submit" disabled={isSaving || !form.formState.isDirty} className="rounded-full button-hover-effect">
              {isSaving ? t("profileFormSavingButton") : t("profileFormSaveButton")}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
