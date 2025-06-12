
"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/contexts/language-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { SettingsProvider } from "@/contexts/settings-context";
import { Toaster } from "@/components/ui/toaster"; // Restore Toaster

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SettingsProvider>
          <LanguageProvider>
            {children}
            <Toaster /> {/* Restore Toaster */}
          </LanguageProvider>
        </SettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
