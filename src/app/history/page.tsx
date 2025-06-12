
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History as HistoryIcon, FileText, AlertTriangle, Loader2, IndianRupee, User, CalendarDays, Clock, Search, Filter, Phone } from "lucide-react"; // Added Phone
import { useTranslation } from "@/hooks/use-translation";
import type { Bill, BillItem } from "@/types";
import { getBillsFromFirestore } from "@/services/bill-service";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type SortOption = "dateDesc" | "dateAsc" | "amountDesc" | "amountAsc";

export default function HistoryPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("dateDesc");

  const fetchBills = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedBills = await getBillsFromFirestore();
      setBills(fetchedBills);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("historyErrorLoadingBills");
      setError(errorMessage);
      toast({
        title: t("historyErrorLoadingTitle"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const filteredAndSortedBills = useMemo(() => {
    let filtered = bills;

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = bills.filter(bill =>
        bill.billNumber.toLowerCase().includes(lowerSearchTerm) ||
        (bill.customerName && bill.customerName.toLowerCase().includes(lowerSearchTerm)) ||
        (bill.customerPhoneNumber && bill.customerPhoneNumber.includes(lowerSearchTerm)) || // Added phone number to search
        format(bill.timestamp, "dd MMM yyyy").toLowerCase().includes(lowerSearchTerm) ||
        format(bill.timestamp, "hh:mm:ss a").toLowerCase().includes(lowerSearchTerm) ||
        bill.items.some(item => item.name.toLowerCase().includes(lowerSearchTerm))
      );
    }

    switch (sortOption) {
      case "dateAsc":
        return [...filtered].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      case "amountDesc":
        return [...filtered].sort((a, b) => b.totalAmount - a.totalAmount);
      case "amountAsc":
        return [...filtered].sort((a, b) => a.totalAmount - b.totalAmount);
      case "dateDesc":
      default:
        return [...filtered].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
  }, [bills, searchTerm, sortOption]);


  const renderBillList = () => {
    if (isLoading && bills.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center flex-grow p-6">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">{t("historyLoadingBills")}</p>
        </div>
      );
    }

    if (error && bills.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center flex-grow p-6">
          <AlertTriangle className="h-12 w-12 text-destructive mb-3" />
          <CardTitle className="text-xl font-nunito text-destructive">
            {t("historyErrorLoadingTitle")}
          </CardTitle>
          <p className="text-muted-foreground my-2">{error}</p>
          <Button onClick={fetchBills} className="rounded-full button-hover-effect">
            {t("retryButton")}
          </Button>
        </div>
      );
    }
    
    if (!isLoading && filteredAndSortedBills.length === 0) {
      return (
        <div className="text-center py-12 flex flex-col items-center justify-center flex-grow">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold font-nunito text-foreground mb-2">
            {searchTerm ? t("noProductsMatchYourSearch") : t("historyNoBillsFoundTitle")}
            </h2>
            <p className="text-muted-foreground">
            {searchTerm ? t("adjustSearchOrFilter") : t("historyNoBillsFoundDescription")}
            </p>
        </div>
      );
    }

    return (
        <>
        {isLoading && bills.length > 0 && ( 
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        )}
        {error && bills.length > 0 && ( 
          <div className="text-center py-4 text-destructive">
            <AlertTriangle className="inline-block mr-2 h-5 w-5" />
            {t("historyErrorLoadingBills")}
            <Button onClick={fetchBills} variant="link" size="sm" className="ml-2">
              {t("retryButton")}
            </Button>
          </div>
        )}
        <Accordion type="single" collapsible className="w-full space-y-3">
          {filteredAndSortedBills.map((bill) => (
            <AccordionItem key={bill.id} value={bill.id} className="bg-background/50 rounded-lg border border-border shadow-sm">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/20 rounded-t-lg transition-colors">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full text-sm text-left gap-1 sm:gap-2">
                  <div className="flex-1">
                      <span className="font-medium text-primary block">
                      {t("billSummaryNumber", { billNumber: bill.billNumber })}
                      </span>
                      {bill.customerName && (
                      <span className="text-xs text-muted-foreground flex items-center mt-0.5">
                          <User className="h-3 w-3 mr-1"/> {bill.customerName}
                      </span>
                      )}
                      {bill.customerPhoneNumber && (
                        <span className="text-xs text-muted-foreground flex items-center mt-0.5">
                            <Phone className="h-3 w-3 mr-1"/> {bill.customerPhoneNumber}
                        </span>
                      )}
                  </div>
                  <div className="text-xs text-muted-foreground sm:text-right whitespace-nowrap">
                      <div className="flex items-center"><CalendarDays className="h-3 w-3 mr-1" /> {format(bill.timestamp, "dd MMM yyyy")}</div>
                      <div className="flex items-center mt-0.5"><Clock className="h-3 w-3 mr-1" /> {format(bill.timestamp, "hh:mm:ss a")}</div>
                  </div>
                  <span className="font-semibold text-foreground text-base sm:text-sm pt-1 sm:pt-0">
                    <IndianRupee className="inline h-3.5 w-3.5 -mt-0.5" />{bill.totalAmount.toFixed(2)}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 border-t border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground text-xs">{t("productTableName")}</TableHead>
                      <TableHead className="text-center text-muted-foreground text-xs">{t("productTableQuantity")}</TableHead>
                      <TableHead className="text-right text-muted-foreground text-xs">{t("productTablePrice")}</TableHead>
                      <TableHead className="text-right text-muted-foreground text-xs">{t("generateBillSubtotal", {subtotal: ''}).replace(': ₹{subtotal}', '')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bill.items.map((item: BillItem, index: number) => (
                      <TableRow key={`${bill.id}-${item.productId}-${index}`} className="border-border text-xs">
                        <TableCell className="font-medium text-foreground py-1.5">{item.name}</TableCell>
                        <TableCell className="text-center text-muted-foreground py-1.5">{item.quantity}</TableCell>
                        <TableCell className="text-right text-muted-foreground py-1.5">
                          <IndianRupee className="inline h-3 w-3 -mt-0.5" />{item.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-foreground py-1.5">
                          <IndianRupee className="inline h-3 w-3 -mt-0.5" />{item.subtotal.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </>
    );
  };
  

  return (
    <div className="flex flex-col h-full space-y-6">
      <header className="flex items-center justify-between flex-shrink-0">
        <h1 className="text-3xl font-nunito font-bold text-primary flex items-center">
          <HistoryIcon className="mr-3 h-8 w-8" />
          {t("historyPageTitle")}
        </h1>
      </header>

      <Card className="shadow-xl rounded-xl flex flex-col flex-grow"> 
        <CardHeader className="flex-shrink-0 border-b border-border pb-4">
          <CardTitle className="text-xl font-nunito text-foreground">
            {t("historyListOfBills")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col flex-grow"> 
           <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center flex-shrink-0"> 
            <div className="relative flex-grow w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                type="search"
                placeholder={t("productsSearchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-full bg-input border-border focus:ring-primary w-full"
                />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-5 w-5 text-muted-foreground shrink-0" />
              <Select value={sortOption} onValueChange={(value: string) => setSortOption(value as SortOption)}>
                  <SelectTrigger className="w-full sm:w-[180px] rounded-full bg-input border-border focus:ring-primary text-sm h-10">
                      <SelectValue placeholder={t("settingsSortByLabel")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                      <SelectItem value="dateDesc">{t("settingsSortDateDesc")}</SelectItem>
                      <SelectItem value="dateAsc">{t("settingsSortDateAsc")}</SelectItem>
                      <SelectItem value="amountDesc">{t("settingsSortAmountDesc")}</SelectItem>
                      <SelectItem value="amountAsc">{t("settingsSortAmountAsc")}</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto pr-2"> 
            {renderBillList()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
    

