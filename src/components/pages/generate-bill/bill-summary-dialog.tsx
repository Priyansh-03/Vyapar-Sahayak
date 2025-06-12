
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Bill } from "@/types";
import { useTranslation } from "@/hooks/use-translation";
import { format } from "date-fns";
import { User, CalendarDays, Clock, Hash, Phone } from "lucide-react";

interface BillSummaryDialogProps {
  bill: Bill | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BillSummaryDialog({ bill, isOpen, onClose }: BillSummaryDialogProps) {
  const { t } = useTranslation();

  if (!bill) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-xl bg-card border-border">
        <DialogHeader className="pb-4">
          <DialogTitle className="font-nunito text-primary text-xl">{t("billSummaryTitle")}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t("billSummaryDetailsBelow")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm mb-4">
          <div className="flex items-center">
            <Hash className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">{t("billSummaryNumberLabel")}:</span>
            <span className="ml-1 text-foreground font-semibold">{bill.billNumber}</span>
          </div>
          {bill.customerName && (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">{t("billCustomerNameLabel")}:</span>
              <span className="ml-1 text-foreground">{bill.customerName}</span>
            </div>
          )}
          {bill.customerPhoneNumber && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">{t("billCustomerPhoneLabel")}:</span>
              <span className="ml-1 text-foreground">{bill.customerPhoneNumber}</span>
            </div>
          )}
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">{t("billDateLabel")}:</span>
            <span className="ml-1 text-foreground">{format(bill.timestamp, "dd/MM/yyyy")}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">{t("billTimeLabel")}:</span>
            <span className="ml-1 text-foreground">{format(bill.timestamp, "hh:mm:ss a")}</span>
          </div>
        </div>

        <ScrollArea className="max-h-[40vh] my-2 pr-3 border-t border-b border-border py-3">
          <div className="space-y-3">
            {bill.items.map((item, index) => (
              <div key={`${item.productId}-${index}`} className="flex justify-between items-center text-sm p-2.5 bg-background/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} x ₹{item.price.toFixed(2)}
                  </p>
                </div>
                <p className="text-foreground font-medium">₹{item.subtotal.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4 pt-3">
          <div className="flex justify-between items-center font-bold text-lg text-primary">
            <span>{t("generateBillGrandTotal", {total: ''}).replace(': ₹{total}', '')}</span> 
            <span>₹{bill.totalAmount.toFixed(2)}</span>
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button onClick={onClose} className="w-full sm:w-auto rounded-full button-hover-effect">
            {t("billSummaryCloseButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
