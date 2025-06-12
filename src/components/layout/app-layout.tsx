
"use client";

import type { ReactNode } from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { TopBar } from "./top-bar";
import { NavMenu } from "./nav-menu";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "../ui/button";
import { LogOut, Store, Mic, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SttDialog } from "./stt-dialog";
import { ChatbotDialog } from "./chatbot-dialog";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/settings-context";
import type { Product } from "@/types";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getProducts } from "@/services/product-service";
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const pageVariants = {
  initial: {
    opacity: 0,
    x: "100vw", 
  },
  in: {
    opacity: 1,
    x: 0, 
  },
  out: {
    opacity: 0,
    x: "-100vw", 
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate', 
  duration: 0.45, 
};


export function AppLayout({ children }: { children: ReactNode }) {
  const { t, currentLanguage, isLoadingTranslations } = useTranslation();
  const { globalLowStockThreshold, notificationsEnabled } = useSettings();
  const { toast, dismiss } = useToast();
  const [isSttDialogOpen, setIsSttDialogOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const pathname = usePathname();

  const [globallyNotifiedProductIds, setGloballyNotifiedProductIds] = useState<Set<string>>(new Set());
  const [sttButtonAriaLabel, setSttButtonAriaLabel] = useState<string>("Open voice command"); 
  const [chatbotButtonAriaLabel, setChatbotButtonAriaLabel] = useState<string>("Open chatbot"); 
  
  const initialNotificationsDone = useRef(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);


  useEffect(() => {
    setHasMounted(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (!isLoadingTranslations) {
      setSttButtonAriaLabel(t("sttDialogTitle"));
      setChatbotButtonAriaLabel(t("chatbotDialogTitle"));
    }
  }, [isLoadingTranslations, t]);

  useEffect(() => {
    setGloballyNotifiedProductIds(new Set());
    dismiss(); 
    initialNotificationsDone.current = false; 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage, isLoadingTranslations, globalLowStockThreshold]); 


  useEffect(() => {
    if (isLoadingTranslations || initialNotificationsDone.current || !notificationsEnabled) return;

    const fetchAndNotify = async () => {
      try {
        const firestoreProducts: Product[] = await getProducts();
        const newlyNotifiedIdsInThisRun = new Set<string>();

        firestoreProducts.forEach(product => {
          if (globallyNotifiedProductIds.has(product.id)) {
            return;
          }

          const effectiveThreshold = product.minStockThreshold ?? globalLowStockThreshold;
          let notificationShown = false;

          if (product.quantity <= 0) {
            toast({
              title: t("productOutOfStockTitle"),
              description: t("productOutOfStockFull", { name: product.name }),
              variant: "destructive",
              duration: 10000,
            });
            notificationShown = true;
          } else if (effectiveThreshold > 0 && product.quantity < effectiveThreshold) {
            toast({
              title: t("productLowStockWarning"),
              description: t("productLowStockWarningFull", { name: product.name, quantity: product.quantity }),
              variant: "default",
              duration: 10000,
            });
            notificationShown = true;
          }
          
          if (notificationShown) {
            newlyNotifiedIdsInThisRun.add(product.id);
          }
        });

        if (newlyNotifiedIdsInThisRun.size > 0) {
          setGloballyNotifiedProductIds(prevIds => {
            const newSet = new Set(prevIds);
            newlyNotifiedIdsInThisRun.forEach(id => newSet.add(id));
            return newSet;
          });
        }
      } catch (error) {
        console.error("Failed to fetch products for initial notifications:", error);
      } finally {
        initialNotificationsDone.current = true; 
      }
    };
    if (pathname !== '/') {
      fetchAndNotify();
    } else {
        initialNotificationsDone.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingTranslations, globalLowStockThreshold, t, toast, pathname, notificationsEnabled]);


  const handleOpenSttDialog = useCallback(() => {
    setIsSttDialogOpen(true);
  }, []);
  
  const handleOpenChatbotDialog = useCallback(() => {
    setIsChatbotOpen(true);
  }, []);

  return (
    <SidebarProvider defaultOpen>
      <TooltipProvider delayDuration={100}> 
        <Sidebar
          collapsible="icon"
          variant="floating"
          className="border-r-sidebar-border shadow-2xl bg-sidebar"
        >
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
              <Store className="w-7 h-7 text-primary"/>
              <span className="font-nunito font-bold text-xl text-primary group-data-[collapsible=icon]:hidden">
                {t("appName")}
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <NavMenu />
          </SidebarContent>
          <SidebarFooter className="p-2">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start group-data-[collapsible=icon]:justify-center",
                "hover:bg-destructive/10 hover:text-destructive button-hover-effect"
              )}
              >
              <LogOut className="mr-2 group-data-[collapsible=icon]:mr-0 h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden">{t("navLogOut")}</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col"> {/* Added flex flex-col */}
          <TopBar />
          <main
            className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto"
            style={{ background: 'linear-gradient(180deg, hsl(var(--gradient-start)) 0%, hsl(var(--gradient-end)) 100%)' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                className="h-full" 
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
          
          <footer className="p-3 text-center text-xs text-muted-foreground mt-auto flex-shrink-0 border-t border-border/50 bg-background/30">
            {currentYear && <p>{t("copyrightLine1", { year: currentYear })}</p>}
            <p>{t("copyrightLine2")}</p>
          </footer>

          <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
             <motion.div
                initial={{ opacity: 1 }}
                animate={hasMounted ? { opacity: 0.85 } : { opacity: 1 }}
                whileHover={{ scale: 1.1, y: -2, opacity: 1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className={cn("transition-opacity", !hasMounted && "opacity-100")}
              >
              <Button
                variant="default"
                size="icon"
                className="h-14 w-14 rounded-full flex items-center justify-center bg-primary/80 hover:bg-primary/100 transition-all duration-200 shadow-[0_0_15px_3px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_20px_5px_hsl(var(--primary)/0.5)]"
                onClick={handleOpenSttDialog}
                aria-label={sttButtonAriaLabel} 
              >
                <Mic className="h-7 w-7 text-primary-foreground" strokeWidth={2.5} />
              </Button>
            </motion.div>
            <motion.div
                initial={{ opacity: 1 }}
                animate={hasMounted ? { opacity: 0.85 } : { opacity: 1 }}
                whileHover={{ scale: 1.1, y: -2, opacity: 1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className={cn("transition-opacity", !hasMounted && "opacity-100")}
            >
              <Button
                variant="secondary" 
                size="icon"
                className="h-14 w-14 rounded-full flex items-center justify-center bg-accent/80 hover:bg-accent/100 transition-all duration-200 shadow-[0_0_15px_3px_hsl(var(--accent)/0.4)] hover:shadow-[0_0_20px_5px_hsl(var(--accent)/0.5)]"
                onClick={handleOpenChatbotDialog}
                aria-label={chatbotButtonAriaLabel} 
              >
                <MessageCircle className="h-7 w-7 text-accent-foreground" strokeWidth={2.5} />
              </Button>
            </motion.div>
          </div>

        </SidebarInset>
      </TooltipProvider>
      
      <SttDialog
        isOpen={isSttDialogOpen}
        onClose={() => setIsSttDialogOpen(false)}
      />
      <ChatbotDialog
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />
    </SidebarProvider>
  );
}
