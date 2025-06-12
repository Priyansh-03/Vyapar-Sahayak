
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Edit3, Trash2, BookText, IndianRupee, ArrowDownCircle, ArrowUpCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { UdhaarEntry } from "@/types";
import { UdhaarForm } from "@/components/pages/udhaar-khata/udhaar-form";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast, toast } from "@/hooks/use-toast";
import { getUdhaarEntries, addUdhaarEntry, updateUdhaarEntry, deleteUdhaarEntry, seedUdhaarEntriesIfEmpty } from "@/services/udhaar-service";

export default function UdhaarKhataPage() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<UdhaarEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<UdhaarEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<UdhaarEntry | null>(null);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await seedUdhaarEntriesIfEmpty(); 
      const firestoreEntries = await getUdhaarEntries();
      setEntries(firestoreEntries);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load ledger entries";
      setError(errorMessage);
      toast({
        title: t("errorLoadingUdhaarEntriesTitle") || "Error Loading Entries",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSaveEntry = useCallback(async (data: Omit<UdhaarEntry, "id" | "date">, id?: string) => {
    const entryDataForSave = { ...data, date: new Date() }; 

    try {
      let savedEntryName = data.name;
      if (id) {
        await updateUdhaarEntry(id, data); 
      } else {
        const newEntry = await addUdhaarEntry(entryDataForSave);
        savedEntryName = newEntry.name;
      }
      await fetchEntries(); 
      toast({
        title: id ? t("udhaarEntryUpdatedTitle") : t("udhaarEntryAddedTitle"),
        description: t(id ? "udhaarEntryUpdatedDescription" : "udhaarEntryAddedDescription", { name: savedEntryName }),
        variant: "default",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("udhaarSaveErrorGeneral");
      toast({
        title: t("errorSavingUdhaarEntryTitle"),
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error saving Udhaar entry:", error);
    } finally {
      setIsFormOpen(false);
      setEditingEntry(null);
    }
  }, [t, fetchEntries]);

  const handleDeleteEntry = useCallback(async (id: string) => {
    const entryBeingDeleted = entries.find(e => e.id === id);
    if (!entryBeingDeleted) return;

    try {
      await deleteUdhaarEntry(id);
      toast({
        title: t("udhaarEntryDeletedTitle"),
        description: t("udhaarEntryDeletedDescription", { name: entryBeingDeleted.name }),
        variant: "default",
      });
      await fetchEntries(); 
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: t("errorDeletingUdhaarEntryTitle"),
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error deleting Udhaar entry:", error);
    } finally {
      setEntryToDelete(null);
    }
  }, [t, fetchEntries, entries]);

  const openEditForm = useCallback((entry: UdhaarEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  }, []);

  const openAddForm = useCallback(() => {
    setEditingEntry(null);
    setIsFormOpen(true);
  }, []);

  const totalReceivable = useMemo(() => entries.filter(e => e.type === 'receivable').reduce((sum, e) => sum + e.amount, 0), [entries]);
  const totalPayable = useMemo(() => entries.filter(e => e.type === 'payable').reduce((sum, e) => sum + e.amount, 0), [entries]);

  const payableEntries = useMemo(() => entries.filter(e => e.type === 'payable').sort((a,b) => b.date.getTime() - a.date.getTime()), [entries]);
  const receivableEntries = useMemo(() => entries.filter(e => e.type === 'receivable').sort((a,b) => b.date.getTime() - a.date.getTime()), [entries]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderEntryTable = (entryList: UdhaarEntry[], tableType: 'payable' | 'receivable') => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      );
    }
    if (error && entryList.length === 0) { 
      return (
        <div className="text-center py-10">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-3" />
          <p className="text-destructive">{t("errorLoadingUdhaarEntriesTitle") || "Error Loading Entries"}</p>
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <Button onClick={fetchEntries} variant="outline" size="sm" className="rounded-full">
            {t("retryButton") || "Retry"}
          </Button>
        </div>
      );
    }

    const noEntriesMessageKey = tableType === 'payable' ? "udhaarKhataNoPayableEntries" : "udhaarKhataNoReceivableEntries";
    if (entryList.length === 0) {
      return (
        <div className="text-center py-12">
          <BookText className="mx-auto h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold font-nunito text-foreground">{t(noEntriesMessageKey)}</h3>
          <Button onClick={openAddForm} className="mt-6 rounded-full button-hover-effect">
            <PlusCircle className="mr-2 h-5 w-5" /> {t("udhaarKhataAddButton")}
          </Button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground">{t("udhaarEntryDate")}</TableHead>
              <TableHead className="text-muted-foreground">{t("udhaarEntryName")}</TableHead>
              <TableHead className="text-right text-muted-foreground">{t("udhaarEntryAmount")}</TableHead>
              <TableHead className="hidden md:table-cell text-muted-foreground">{t("udhaarEntryPhone")}</TableHead>
              <TableHead className="hidden lg:table-cell text-muted-foreground">{t("udhaarEntryDescription")}</TableHead>
              <TableHead className="text-center text-muted-foreground">{t("udhaarEntryType")}</TableHead>
              <TableHead className="text-right text-muted-foreground">{t("productTableActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entryList.map((entry) => (
              <TableRow key={entry.id} className="border-border hover:bg-muted/20 transition-colors">
                <TableCell className="text-muted-foreground text-xs">{format(entry.date, "dd MMM yy")}</TableCell>
                <TableCell className="font-medium text-foreground">{entry.name}</TableCell>
                <TableCell className={`text-right font-semibold ${entry.type === 'receivable' ? 'text-green-400' : 'text-red-400'}`}>
                  {entry.type === 'receivable' ? '+' : '-'} <IndianRupee className="inline h-3.5 w-3.5 -mt-0.5" />{entry.amount.toFixed(2)}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{entry.phoneNumber || "-"}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground truncate max-w-xs">{entry.description || "-"}</TableCell>
                 <TableCell className="text-center">
                  <Badge variant={entry.type === 'receivable' ? 'default' : 'destructive'}
                         className={cn(entry.type === 'receivable' ? 'bg-green-500/80 hover:bg-green-500/70 text-green-50' : 'bg-red-500/80 hover:bg-red-500/70 text-red-50', "text-xs")}>
                    {entry.type === 'receivable' ? t("udhaarTypeReceivable") : t("udhaarTypePayable")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEditForm(entry)} className="mr-2 hover:text-primary rounded-full" disabled={isLoading}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setEntryToDelete(entry)} className="hover:text-destructive rounded-full" disabled={isLoading}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-nunito font-bold text-primary flex items-center">
          <BookText className="mr-3 h-8 w-8" />
          {t("udhaarKhataTitle")}
        </h1>
        <Button onClick={openAddForm} className="rounded-full button-hover-effect" disabled={isLoading}>
          <PlusCircle className="mr-2 h-5 w-5" />
          {t("udhaarKhataAddButton")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card 
          className="bg-green-500/10 border-green-500/30 shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-200"
          onClick={() => scrollToSection("receivable-section")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') scrollToSection("receivable-section");}}
          aria-label={t('udhaarTypeReceivable')}
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg text-green-400 font-medium">
              {t('udhaarTypeReceivable')} (Lena Hai)
            </CardTitle>
            <ArrowUpCircle className="h-6 w-6 text-green-400"/>
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-7 w-7 animate-spin text-green-300"/> :
            <p className="text-3xl font-bold text-green-300"><IndianRupee className="inline h-7 w-7 -mt-1" />{totalReceivable.toFixed(2)}</p>
            }
          </CardContent>
        </Card>
        <Card 
          className="bg-red-500/10 border-red-500/30 shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-200"
          onClick={() => scrollToSection("payable-section")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') scrollToSection("payable-section");}}
          aria-label={t('udhaarTypePayable')}
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg text-red-400 font-medium">
             {t('udhaarTypePayable')} (Dena Hai)
            </CardTitle>
            <ArrowDownCircle className="h-6 w-6 text-red-400"/>
          </CardHeader>
          <CardContent>
           {isLoading ? <Loader2 className="h-7 w-7 animate-spin text-red-300"/> :
            <p className="text-3xl font-bold text-red-300"><IndianRupee className="inline h-7 w-7 -mt-1" />{totalPayable.toFixed(2)}</p>
           }
          </CardContent>
        </Card>
      </div>

      <Card id="payable-section" className="shadow-xl rounded-xl scroll-mt-20">
        <CardHeader>
          <CardTitle className="text-xl font-nunito text-foreground flex items-center">
            <ArrowDownCircle className="mr-2 h-6 w-6 text-red-400" />
            {t("udhaarKhataPayableSectionTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderEntryTable(payableEntries, 'payable')}
        </CardContent>
      </Card>

      <Card id="receivable-section" className="shadow-xl rounded-xl mt-8 scroll-mt-20">
        <CardHeader>
          <CardTitle className="text-xl font-nunito text-foreground flex items-center">
            <ArrowUpCircle className="mr-2 h-6 w-6 text-green-400" />
            {t("udhaarKhataReceivableSectionTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderEntryTable(receivableEntries, 'receivable')}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={(open) => { if(!open) {setIsFormOpen(false); setEditingEntry(null);} else {setIsFormOpen(true);}}}>
        <DialogContent className="sm:max-w-lg rounded-xl bg-card border-border">
          <UdhaarForm
            entry={editingEntry}
            onSave={handleSaveEntry}
            onClose={() => { setIsFormOpen(false); setEditingEntry(null);}}
          />
        </DialogContent>
      </Dialog>

       {entryToDelete && (
        <Dialog open={!!entryToDelete} onOpenChange={() => setEntryToDelete(null)}>
          <DialogContent className="sm:max-w-md rounded-xl bg-card border-border">
             <DialogHeader>
                <DialogTitle className="font-nunito text-primary flex items-center">
                    <AlertTriangle className="mr-2 h-6 w-6 text-destructive" />
                    {t("confirmDeleteTitle")}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground pt-2">
                    {t("confirmDeleteDescriptionUdhaar", {name: entryToDelete.name, amount: entryToDelete.amount.toFixed(2)})}
                </DialogDescription>
             </DialogHeader>
             <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setEntryToDelete(null)} className="rounded-full" disabled={isLoading}>
                    {t("cancelButton")}
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => handleDeleteEntry(entryToDelete.id)}
                    className="rounded-full button-hover-effect"
                    disabled={isLoading}
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("deleteButton")}
                </Button>
             </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
