
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
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/use-translation";
import type { Product } from "@/types";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
// Removed Image and icon imports for UploadCloud, TrashIcon

const productFormSchema = z.object({
  name: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  category: z.string().min(2, { message: "Category must be at least 2 characters." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  quantity: z.coerce.number().int().min(0, { message: "Quantity cannot be negative." }),
  minStockThreshold: z.coerce.number().int().min(0, {message: "Minimum stock threshold cannot be negative."}).optional(),
});

type ProductFormValues = Omit<Product, "id">; // imageUrl was already removed from Product type

interface ProductFormProps {
  product?: Product | null;
  onSave: (data: ProductFormValues, id?: string) => Promise<void>;
  onClose: () => void;
}

export function ProductForm({ product, onSave, onClose }: ProductFormProps) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
          name: product?.name || "",
          category: product?.category || "",
          price: product?.price || 0,
          quantity: product?.quantity || 0,
          minStockThreshold: product?.minStockThreshold,
        },
  });
  
  useEffect(() => {
    form.reset({
        name: product?.name || "",
        category: product?.category || "",
        price: product?.price || 0,
        quantity: product?.quantity || 0,
        minStockThreshold: product?.minStockThreshold,
    });
  }, [product, form]);


  async function onSubmit(data: ProductFormValues) {
    setIsSaving(true);
    try {
      await onSave(data, product?.id);
      toast({
        title: product ? t("productUpdatedTitle") : t("productAddedTitle"),
        description: t(product ? "productUpdatedDescription" : "productAddedDescription", { name: data.name }),
        variant: "default",
      });
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: t("errorSavingProductTitle"),
        description: t("productSaveError", { error: errorMessage }),
        variant: "destructive",
      });
      console.error("Error saving product:", error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-nunito text-primary">{product ? t("editProductFormTitle") : t("addProductFormTitle")}</DialogTitle>
        <DialogDescription className="text-muted-foreground">
          {product ? t("productFormUpdateDetails") : t("productFormAddNewToInventory")}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
          
          {/* Image upload section removed */}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">{t("productFormNameLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("productFormNamePlaceholder")} {...field} value={field.value ?? ""} className="rounded-lg bg-input border-border focus:ring-primary text-foreground"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">{t("productFormCategoryLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("productFormCategoryPlaceholder")} {...field} value={field.value ?? ""} className="rounded-lg bg-input border-border focus:ring-primary text-foreground"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">{t("productFormPriceLabel")}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder={t("productFormPricePlaceholder")} 
                      {...field}
                      value={field.value?.toString() ?? ''}
                      onChange={e => field.onChange(e.target.value)}
                      className="rounded-lg bg-input border-border focus:ring-primary text-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">{t("productFormQuantityLabel")}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder={t("productFormQuantityPlaceholder")} 
                      {...field} 
                      value={field.value?.toString() ?? ''}
                      onChange={e => field.onChange(e.target.value)}
                      className="rounded-lg bg-input border-border focus:ring-primary text-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
           <FormField
            control={form.control}
            name="minStockThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">{t("productFormMinStockThresholdLabel")}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder={t("productFormMinStockThresholdPlaceholder")} 
                    {...field} 
                    value={field.value?.toString() ?? ''}
                    onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.value)}
                    className="rounded-lg bg-input border-border focus:ring-primary text-foreground"
                  />
                </FormControl>
                 <p className="text-xs text-muted-foreground">{t("productFormMinStockThresholdHint")}</p>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="rounded-full">
              {t("cancelButton")}
            </Button>
            <Button type="submit" disabled={isSaving} className="rounded-full button-hover-effect">
              {isSaving ? t("productFormSavingButton") : t("productFormSaveButton")}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
