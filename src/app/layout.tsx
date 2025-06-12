
"use client"; // Required for useTheme hook

import type { Metadata } from "next"; // Metadata should be defined in a server component if dynamic
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppLayout } from "@/components/layout/app-layout";
import { useTheme } from "@/hooks/use-theme"; // Import useTheme
import { useEffect } from "react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
  variable: "--font-nunito",
});

// Static metadata can remain here. For dynamic metadata based on theme, it's more complex.
// export const metadata: Metadata = { 
//   title: "Vyapar Sahayak",
//   description: "Modern POS and Inventory Management for Small Shopkeepers",
// };
// For now, we'll manage title in a client component if needed or keep it static.


function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light-theme-vyapar', 'dark-pine');
    if (theme === 'light-theme-vyapar') {
      root.classList.add('light-theme-vyapar');
    } else {
      root.classList.add('dark-pine'); // Default to dark-pine
    }
  }, [theme]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Vyapar Sahayak</title>
        <meta name="description" content="Modern POS and Inventory Management for Small Shopkeepers" />
      </head>
      <body
        className={`${inter.variable} ${nunito.variable} font-sans antialiased`}
      >
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers> {/* ThemeProvider is inside Providers */}
      <RootLayoutContent>{children}</RootLayoutContent>
    </Providers>
  );
}
