
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, PlusCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { Product } from "@/types";
import { suggestProducts, SuggestProductsInput } from "@/ai/flows/suggest-products";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast"; // Restore toast

interface SuggestedItemsProps {
  salesHistory: string;
  currentCartItems: Product[];
  availableProducts: Product[];
  onAddSuggestedToCart: (product: Product) => void;
}

export function SuggestedItems({
  salesHistory,
  currentCartItems,
  availableProducts,
  onAddSuggestedToCart,
}: SuggestedItemsProps) {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentCartString = currentCartItems.map(item => item.name).join(", ");
      const input: SuggestProductsInput = {
        salesHistory,
        currentCart: currentCartString,
      };
      const result = await suggestProducts(input);
      const suggestedNames = result.suggestedProducts.split(",").map(s => s.trim().toLowerCase());

      const matchedSuggestions = availableProducts.filter(p =>
        suggestedNames.includes(p.name.toLowerCase()) &&
        !currentCartItems.find(cartItem => cartItem.id === p.id) && 
        p.quantity > 0 
      ).slice(0, 3); 

      setSuggestions(matchedSuggestions);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      const errorMessage = (err instanceof Error) ? err.message : t("suggestedItemsError");
      setError(errorMessage);
      toast({ // Restore toast
        title: t("suggestedItemsErrorTitle"),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [salesHistory, currentCartItems, availableProducts, t]); 

  useEffect(() => {
    if (currentCartItems.length > 0 || suggestions.length === 0) {
      fetchSuggestions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCartItems, salesHistory]); // fetchSuggestions has availableProducts as dep, so it's covered.

  if (isLoading) {
    return (
      <Card className="shadow-md rounded-xl bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg font-nunito text-accent">
            <Lightbulb className="h-5 w-5 mr-2" />
            {t("suggestedItemsTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center space-x-4 p-2 border border-border rounded-lg bg-background/50">
              <Skeleton className="h-10 w-10 rounded-md bg-muted" />
              <div className="space-y-2 flex-grow">
                <Skeleton className="h-4 w-3/4 bg-muted" />
                <Skeleton className="h-3 w-1/2 bg-muted" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error && !isLoading && suggestions.length === 0) { 
    return (
       <Card className="shadow-md rounded-xl bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg font-nunito text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            {t("suggestedItemsErrorTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0 && !isLoading) {
    return null; 
  }

  return (
    <Card className="shadow-md rounded-xl bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-nunito text-accent">
          <Lightbulb className="h-5 w-5 mr-2" />
          {t("suggestedItemsTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestions.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-2.5 bg-background/50 hover:bg-muted/30 rounded-lg border border-border transition-colors"
          >
            <div className="flex items-center gap-3 flex-grow overflow-hidden">
              <Image
                src={`https://placehold.co/64x64.png?text=${product.name.substring(0, 1)}`}
                alt={product.name}
                width={32}
                height={32}
                className="rounded-md aspect-square object-cover flex-shrink-0"
                data-ai-hint="product suggestion"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-foreground truncate" title={product.name}>{product.name}</p>
                <p className="text-xs text-muted-foreground">₹{product.price.toFixed(2)}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onAddSuggestedToCart(product)}
              disabled={product.quantity === 0}
              className="text-primary hover:text-primary/80 hover:bg-primary/10 rounded-full flex-shrink-0 ml-2"
            >
              <PlusCircle className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">{t("addToCartButton")}</span>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
