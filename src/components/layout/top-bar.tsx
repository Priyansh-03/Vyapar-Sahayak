
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTranslation } from "@/hooks/use-translation";
import { UserCircle2, Bell, X } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function TopBar() {
  const { t, isLoadingTranslations } = useTranslation();
  const { toasts, dismiss } = useToast();

  const [isClient, setIsClient] = useState(false);
  
  const [notificationsSrText, setNotificationsSrText] = useState("Notifications");
  const [userGreetingText, setUserGreetingText] = useState("Hello there!");
  const [clearAllButtonText, setClearAllButtonText] = useState("Clear All");
  const [removeItemTooltipText, setRemoveItemTooltipText] = useState("Remove notification");
  const [viewAllText, setViewAllText] = useState("View all");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isLoadingTranslations && isClient) { 
      setNotificationsSrText(t("notificationsTitle"));
      setUserGreetingText(t("userGreeting"));
      setClearAllButtonText(t("notificationsClearAll"));
      setRemoveItemTooltipText(t("notificationsRemoveItem"));
      setViewAllText(t("notificationsViewAllInActivityLog"));
    }
  }, [isLoadingTranslations, t, isClient]);


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6">
      <SidebarTrigger className="text-foreground hover:text-primary" />
      <div className="flex w-full items-center justify-end md:justify-between">
        <h1 className="text-xl font-nunito font-semibold text-primary hidden md:block">
          {/* App Name can be shown here if not in sidebar, or a page title */}
        </h1>
        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSwitcher />
          
          {isClient ? (
            <motion.div
              whileHover={{ scale: 1.1, y: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "relative rounded-full text-muted-foreground hover:text-primary hover:bg-muted/50"
                      )}
                      suppressHydrationWarning 
                    >
                      <Bell className="h-5 w-5" />
                      {toasts.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                          {toasts.length}
                        </span>
                      )}
                      <span className="sr-only">{notificationsSrText}</span>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-popover text-popover-foreground border-border shadow-lg rounded-md">
                    <p>{notificationsSrText}</p>
                  </TooltipContent>
                </Tooltip>

                <PopoverContent className="w-full max-w-sm rounded-xl p-0 border-border shadow-2xl bg-popover">
                  <div className="flex items-center justify-between p-3 border-b border-border">
                    <h4 className="font-nunito font-semibold text-popover-foreground">{notificationsSrText}</h4>
                      {toasts.length > 0 && (
                         <button
                          onClick={() => dismiss()}
                          aria-label={clearAllButtonText} 
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "text-xs text-primary hover:text-primary/80 rounded-full px-2 py-1"
                          )}
                        >
                          {clearAllButtonText} 
                        </button>
                      )}
                  </div>
                  <ScrollArea className="h-80">
                    {toasts.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="p-4 text-sm text-center text-muted-foreground">
                          {t("notificationsNoNew")}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {toasts.map((toastItem) => ( 
                          <div key={toastItem.id} className="relative group p-3 hover:bg-muted/30 transition-colors">
                            {toastItem.title && <p className="text-sm font-medium text-popover-foreground">{String(toastItem.title)}</p>}
                            {toastItem.description && (
                              <p className="text-xs text-muted-foreground pt-0.5">
                                {typeof toastItem.description === "string" ? toastItem.description : String(toastItem.description)}
                              </p>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  aria-label={removeItemTooltipText} 
                                  onClick={() => dismiss(toastItem.id)}
                                  className="absolute top-1.5 right-1.5 h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-destructive/10"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="bg-popover text-popover-foreground border-border shadow-lg rounded-md">
                                <p>{removeItemTooltipText}</p> 
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                   <div className="p-2 text-center border-t border-border">
                    <Link href="/profile?tab=activity" className="text-xs text-primary hover:underline">
                      {viewAllText}
                    </Link>
                  </div>
                </PopoverContent>
              </Popover>
            </motion.div>
          ) : (
            <div 
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "relative rounded-full text-muted-foreground h-10 w-10 flex items-center justify-center" 
              )}
              aria-hidden="true" 
            >
              <Bell className="h-5 w-5 opacity-50" /> 
              <span className="sr-only">Notifications</span> 
            </div>
          )}
          <motion.div
            whileHover={{ scale: 1.05, y: -1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link 
              href="/profile" 
              className={cn(
                  buttonVariants({variant: "ghost"}),
                  "flex items-center gap-2 p-2 rounded-full hover:bg-muted/50 transition-colors cursor-pointer group text-sm text-muted-foreground hover:text-primary h-auto"
              )}
            >
              {isClient ? (
                <UserCircle2 className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
              ) : (
                <span className="inline-block h-6 w-6" /> 
              )}
              <span className="hidden lg:inline-block">
                {userGreetingText} 
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
