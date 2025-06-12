
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import { DEFAULT_GLOBAL_LOW_STOCK_THRESHOLD } from "@/data/mock-data";

interface SettingsContextType {
  globalLowStockThreshold: number;
  setGlobalLowStockThreshold: (threshold: number) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [globalLowStockThreshold, setGlobalLowStockThreshold] = useLocalStorage<number>(
    "vyapar_sahayak_global_low_stock_threshold",
    DEFAULT_GLOBAL_LOW_STOCK_THRESHOLD
  );
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage<boolean>(
    "vyapar_sahayak_notifications_enabled",
    false // Changed default to false
  );

  return (
    <SettingsContext.Provider value={{
      globalLowStockThreshold,
      setGlobalLowStockThreshold,
      notificationsEnabled,
      setNotificationsEnabled
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

    