
"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-translation";

interface LowStockBadgeProps {
  quantity: number;
  threshold: number; 
}

export function LowStockBadge({ quantity, threshold }: LowStockBadgeProps) {
  const { t } = useTranslation();

  if (quantity <= 0) {
    return (
      <Badge variant="destructive" className="whitespace-nowrap bg-red-700 text-white">
        {t("productOutOfStockWarning") || "Out of Stock"}
      </Badge>
    );
  }
  // Only show low stock if threshold is met AND it's not 0 (0 threshold means only warn for out of stock)
  if (threshold > 0 && quantity < threshold) {
    return (
      <Badge variant="destructive" className="whitespace-nowrap">
        {t("productLowStockWarning")} ({quantity})
      </Badge>
    );
  }
  return <span className="text-sm">{quantity}</span>;
}
