
"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/use-translation";
import type { UdhaarEntry } from "@/types";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast"; // Restore toast

const udhaarFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  phoneNumber: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(["payable", "receivable"], { required_error: "You must select a transaction type." }),
});

type UdhaarFormValues = Omit<UdhaarEntry, "id" | "date">;

interface UdhaarFormProps {
  entry?: UdhaarEntry | null;
  onSave: (data: UdhaarFormValues, id?: string) => Promise<void>;
  onClose: () => void;
}

export function UdhaarForm({ entry, onSave, onClose }: UdhaarFormProps) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<UdhaarFormValues>({
    resolver: zodResolver(udhaarFormSchema),
    defaultValues: {
      name: "",
      amount: 0,
      phoneNumber: "",
      description: "",
      type: "receivable",
    },
  });

  useEffect(() => {
    if (entry) {
      form.reset({
        name: entry.name || "",
        amount: entry.amount || 0,
        phoneNumber: entry.phoneNumber || "",
        description: entry.description || "",
        type: entry.type || "receivable",
      });
    } else {
      form.reset({ 
        name: "",
        amount: 0,
        phoneNumber: "",
        description: "",
        type: "receivable",
      });
    }
  }, [entry, form]);


  async function onSubmit(data: UdhaarFormValues) {
    setIsSaving(true);
    try {
      await onSave(data, entry?.id);
      // Parent component (UdhaarKhataPage) will show the success toast
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("udhaarSaveErrorGeneral");
      toast({ // Restore toast for form-specific errors if onSave fails
        title: t("errorSavingUdhaarEntryTitle"),
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Failed to save udhaar entry from form:", error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-nunito text-primary">
          {entry ? t("editUdhaarEntryTitle") : t("addUdhaarEntryTitle")}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground">
          {entry ? t("udhaarKhataEditDescription") : t("udhaarKhataAddDescription")}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">{t("udhaarFormNameLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("udhaarFormNamePlaceholder")} {...field} className="rounded-lg bg-input border-border focus:ring-primary text-foreground"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">{t("udhaarFormAmountLabel")}</FormLabel>
                <FormControl>
                  <Input type="number" placeholder={t("udhaarFormAmountPlaceholder")} {...field} className="rounded-lg bg-input border-border focus:ring-primary text-foreground"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-foreground">{t("udhaarFormTypeLabel")}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value} 
                    className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="receivable" />
                      </FormControl>
                      <FormLabel className="font-normal text-foreground">
                        {t("udhaarFormTypeReceivable")}
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="payable" />
                      </FormControl>
                      <FormLabel className="font-normal text-foreground">
                        {t("udhaarFormTypePayable")}
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">{t("udhaarFormPhoneLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("udhaarFormPhonePlaceholder")} {...field} className="rounded-lg bg-input border-border focus:ring-primary text-foreground"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">{t("udhaarFormDescriptionLabel")}</FormLabel>
                <FormControl>
                  <Textarea placeholder={t("udhaarFormDescriptionPlaceholder")} {...field} className="rounded-lg bg-input border-border focus:ring-primary text-foreground"/>
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
              {isSaving ? t("productFormSavingButton") : t("udhaarFormSaveButton")}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
