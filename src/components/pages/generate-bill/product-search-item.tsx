
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";
import { PlusCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface ProductSearchItemProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductSearchItem({ product, onAddToCart }: ProductSearchItemProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between p-3 bg-card/80 hover:bg-muted/30 rounded-lg shadow-sm transition-colors duration-150 border border-border">
      <div className="flex items-center gap-3">
        <Image
          src={`https://placehold.co/64x64.png?text=${product.name.charAt(0).toUpperCase()}`}
          alt={product.name}
          width={40}
          height={40}
          className="rounded-md aspect-square object-cover"
          data-ai-hint="product item"
        />
        <div>
          <h4 className="font-medium text-sm text-foreground">{product.name}</h4>
          <p className="text-xs text-muted-foreground">₹{product.price.toFixed(2)} - {t('productTableQuantity')}: {product.quantity}</p>
        </div>
      </div>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => onAddToCart(product)}
        disabled={product.quantity === 0}
        className="shrink-0 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground button-hover-effect"
      >
        <PlusCircle className="h-4 w-4 mr-1_5" />
        <span className="hidden sm:inline">{t("addToCartButton")}</span>
      </Button>
    </div>
  );
}
