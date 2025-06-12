
"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Keep if text input is re-enabled
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/hooks/use-translation";
import predefinedCommandsData from '@/config/predefined-commands.json';
import type { UdhaarEntry, Product } from '@/types';
import { Bot, Send, Loader2, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getProducts } from '@/services/product-service';
import { getUdhaarEntries } from '@/services/udhaar-service';


interface PredefinedCommand {
  id: string;
  action_type: string;
  en: string[];
  "hi-IN": string[];
  hi: string[];
}

interface ChatbotDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const allowedCommandIds = [
  'cmd_nav_home',
  'cmd_nav_products',
  'cmd_nav_bill',
  'cmd_nav_ledger',
  'cmd_nav_settings',
  'cmd_udhaar_check_due',
  'cmd_prod_check_stock'
];

export function ChatbotDialog({ isOpen, onClose }: ChatbotDialogProps) {
  const { t, currentLanguage } = useTranslation();
  const router = useRouter();

  const [userQuery, setUserQuery] = useState<string | null>(null);
  const [botResponse, setBotResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // General loading for command processing
  const [isLoadingChatData, setIsLoadingChatData] = useState(false); // Specific for data fetching within chat
  const [commands, setCommands] = useState<Array<{id: string, text: string}>>([]);
  const [typedQuery, setTypedQuery] = useState('');

  const [chatView, setChatView] = useState<'main_commands' | 'name_selection_due' | 'product_selection_stock' | 'show_result'>('main_commands');
  const [udhaarCustomers, setUdhaarCustomers] = useState<UdhaarEntry[]>([]);
  const [availableProductsForStockCheck, setAvailableProductsForStockCheck] = useState<Product[]>([]);
  // const inputRef = useRef<HTMLInputElement>(null); // Keep if text input is re-enabled


  useEffect(() => {
    const typedCommands = predefinedCommandsData as PredefinedCommand[];
    const langKey = currentLanguage as keyof Omit<PredefinedCommand, 'id' | 'action_type'>;

    const allLangCommands = typedCommands
      .filter(cmd => allowedCommandIds.includes(cmd.id))
      .map(cmd => ({
          id: cmd.id,
          text: cmd[langKey]?.[0] || cmd.en[0],
          action_type: cmd.action_type // Keep action_type for sorting
      })).filter(cmd => cmd.text);

    const navigationCommands = allLangCommands.filter(cmd => cmd.action_type === "navigation");
    const otherCommands = allLangCommands.filter(cmd => cmd.action_type !== "navigation");

    const sortedCommands = [...otherCommands, ...navigationCommands];
    
    setCommands(sortedCommands.map(cmd => ({ id: cmd.id, text: cmd.text }))); // Remove action_type before setting state
  }, [currentLanguage]);


  const handleCommandClick = async (commandId: string, commandText: string) => {
    setUserQuery(commandText);
    setIsLoading(true); // General loading starts
    setBotResponse(null);
    setTypedQuery('');

    let navigated = false;

    switch(commandId) {
      case "cmd_nav_home": router.push("/"); navigated = true; break;
      case "cmd_nav_products": router.push("/products"); navigated = true; break;
      case "cmd_nav_bill": router.push("/generate-bill"); navigated = true; break;
      case "cmd_nav_ledger": router.push("/udhaar-khata"); navigated = true; break;
      case "cmd_nav_settings": router.push("/settings"); navigated = true; break;

      case "cmd_udhaar_check_due":
        setIsLoadingChatData(true); // Specific data loading for this command
        setIsLoading(false); // Turn off general loading as data loading takes over
        try {
          const allEntries = await getUdhaarEntries();
          const customersWithDues = allEntries.filter(
            e => e.type === 'receivable' && e.amount > 0
          );
          setUdhaarCustomers(customersWithDues);
          setChatView('name_selection_due');
        } catch (error) {
          setBotResponse(t("chatbotErrorFetchingData") || "Error fetching ledger data.");
          setChatView('show_result');
        } finally {
          setIsLoadingChatData(false);
        }
        return; // Exit early as general loading is handled

      case "cmd_prod_check_stock":
        setIsLoadingChatData(true); // Specific data loading
        setIsLoading(false); // Turn off general loading
        try {
          const firestoreProducts = await getProducts();
          setAvailableProductsForStockCheck(firestoreProducts);
          setChatView('product_selection_stock');
        } catch (error) {
          setBotResponse(t("chatbotErrorFetchingData") || "Error fetching product data.");
          setChatView('show_result');
        } finally {
          setIsLoadingChatData(false);
        }
        return; // Exit early

      default:
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate for non-data ops
        setBotResponse(t("chatbotResponseNotDirectlyActionable"));
        setChatView('show_result');
    }

    if (navigated) {
      handleDialogClose(); // This resets all loading states
      return;
    }

    setIsLoading(false); // General loading ends if not handled by specific cases
  };


  const handleNameSelectionForDue = (customer: UdhaarEntry) => {
    setUserQuery(t("chatbotQuerySelectedNameDue", { name: customer.name }));
    setBotResponse(t("chatbotResponseSelectedNameDue", { name: customer.name, amount: customer.amount.toFixed(2) }));
    setChatView('show_result');
  };

  const handleProductSelectionForStock = (product: Product) => {
    setUserQuery(t("chatbotQuerySelectedProductStock", { name: product.name }));
    setBotResponse(t("chatbotResponseSelectedProductStock", { name: product.name, quantity: product.quantity.toString() }));
    setChatView('show_result');
  };

  const handleDialogClose = () => {
    setUserQuery(null);
    setBotResponse(null);
    setIsLoading(false);
    setIsLoadingChatData(false);
    setChatView('main_commands');
    setUdhaarCustomers([]);
    setAvailableProductsForStockCheck([]);
    setTypedQuery('');
    onClose();
  }

  const resetToMainCommands = () => {
    setUserQuery(null);
    setBotResponse(null);
    setIsLoading(false);
    setIsLoadingChatData(false);
    setChatView('main_commands');
    setUdhaarCustomers([]);
    setAvailableProductsForStockCheck([]);
    setTypedQuery('');
  }

  const renderContent = () => {
    if (isLoading || isLoadingChatData) {
        return (
            <div className="flex items-center justify-center h-full space-x-2 text-primary">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>{(isLoadingChatData || isLoading) ? (t("chatbotLoadingData") || "Loading data...") : t("chatbotLoadingResponse")}</span>
            </div>
        );
    }

    if (chatView === 'name_selection_due') {
      return (
        <div className="space-y-3">
          <h3 className="text-md font-medium text-foreground">{t("chatbotSelectCustomerTitle")}</h3>
          {udhaarCustomers.length > 0 ? (
            udhaarCustomers.map((customer) => (
              <Button
                key={customer.id}
                variant="outline"
                className="w-full justify-start text-left h-auto py-2.5 px-4 rounded-lg border-border hover:border-primary hover:bg-primary/10 hover:text-primary focus:ring-primary"
                onClick={() => handleNameSelectionForDue(customer)}
              >
                <ChevronRight className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                <span className="flex-grow">{customer.name}</span>
              </Button>
            ))
          ) : (
            <p className="text-muted-foreground">{t("chatbotNoPendingDues")}</p>
          )}
           <Button variant="ghost" onClick={resetToMainCommands} className="w-full mt-4 text-sm">
            &larr; {t("chatbotBackButton")}
          </Button>
        </div>
      );
    }

    if (chatView === 'product_selection_stock') {
      return (
        <div className="space-y-3">
          <h3 className="text-md font-medium text-foreground">{t("chatbotSelectProductStockTitle")}</h3>
          {availableProductsForStockCheck.length > 0 ? (
            availableProductsForStockCheck.map((product) => (
              <Button
                key={product.id}
                variant="outline"
                className="w-full justify-start text-left h-auto py-2.5 px-4 rounded-lg border-border hover:border-primary hover:bg-primary/10 hover:text-primary focus:ring-primary"
                onClick={() => handleProductSelectionForStock(product)}
              >
                <ChevronRight className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                <span className="flex-grow">{product.name} ({t('productTableQuantity')}: {product.quantity})</span>
              </Button>
            ))
          ) : (
            <p className="text-muted-foreground">{t("chatbotNoProductsForStock")}</p>
          )}
           <Button variant="ghost" onClick={resetToMainCommands} className="w-full mt-4 text-sm">
            &larr; {t("chatbotBackButton")}
          </Button>
        </div>
      );
    }


    if (chatView === 'show_result' && (userQuery || botResponse)) {
        return (
            <div className="space-y-3">
                {userQuery && (
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{t("chatbotUserQueryLabel")}</p>
                        <p className="p-2 bg-muted/30 rounded-md text-foreground">{userQuery}</p>
                    </div>
                )}
                {botResponse && (
                     <div>
                        <p className="text-sm font-medium text-muted-foreground">{t("chatbotBotResponseLabel")}</p>
                        <p className="p-2 bg-primary rounded-md text-primary-foreground">{botResponse}</p>
                     </div>
                )}
                <Button variant="ghost" onClick={resetToMainCommands} className="w-full mt-4 text-sm">
                   &larr; {t("chatbotBackButton")}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {commands.map((cmd) => (
              <Button
                key={cmd.id}
                variant="outline"
                className="w-full justify-start text-left h-auto py-2.5 px-4 rounded-lg border-border hover:border-primary hover:bg-primary/10 hover:text-primary focus:ring-primary"
                onClick={() => handleCommandClick(cmd.id, cmd.text)}
              >
                <ChevronRight className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                <span className="flex-grow">{cmd.text}</span>
              </Button>
            ))}
            {(commands.length === 0 && !isLoading && !isLoadingChatData) && (
                <p className="text-muted-foreground text-center py-4">{t("chatbotNoResponse")}</p>
            )}
        </div>
    );
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl rounded-xl bg-card border-border flex flex-col h-[80vh] sm:h-[70vh]">
        <DialogHeader className="flex-shrink-0 border-b border-border pb-4">
          <DialogTitle className="font-nunito text-primary text-xl flex items-center">
            <Bot className="mr-2 h-6 w-6" />
            {t("chatbotDialogTitle")}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-grow my-4 pr-3">
          {renderContent()}
        </ScrollArea>

        <DialogFooter className="mt-auto pt-4 border-t border-border flex-shrink-0 flex-col sm:flex-row sm:items-center gap-2">
          <Button type="button" variant="outline" className="rounded-full w-full sm:w-auto sm:ml-auto" onClick={handleDialogClose}>
            {t("chatbotCloseButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
