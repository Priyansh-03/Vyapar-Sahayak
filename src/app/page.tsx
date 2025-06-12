
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { ActionCard } from "@/components/pages/home/action-card";
import { PlusCircle, Archive, FileOutput, BookUser, AlertOctagon, Receipt, Loader2, WalletCards } from "lucide-react";
import { useSettings } from "@/contexts/settings-context";
import type { Product, Bill } from "@/types";
import { getProducts, seedProductsIfEmpty } from "@/services/product-service";
import { getBillsFromFirestore } from "@/services/bill-service";
import { initialProductsArray } from "@/data/mock-data";
import { motion } from "framer-motion";
import { usePathname } from 'next/navigation';

export default function HomePage() {
  const { t } = useTranslation();
  const { globalLowStockThreshold } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const pathname = usePathname();

  const fetchLiveStats = useCallback(async () => {
    setIsLoadingStats(true);
    setStatsError(null);
    try {
      const [firestoreProducts, firestoreBills] = await Promise.all([
        getProducts(),
        getBillsFromFirestore()
      ]);
      console.log("Fetched bills for stats:", firestoreBills.map(b => ({ id: b.id, timestamp: b.timestamp, totalAmount: b.totalAmount })));
      setProducts(firestoreProducts);
      setBills(firestoreBills);
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : "Failed to load live stats");
    } finally {
      setIsLoadingStats(false);
    }
  }, []);


  useEffect(() => {
    const seedAndFetchInitialData = async () => {
      await seedProductsIfEmpty(initialProductsArray); 
      fetchLiveStats();
    };
    // Only fetch if current path is exactly '/'
    if (pathname === '/') {
      seedAndFetchInitialData();
    }
  }, [pathname, fetchLiveStats]);


  const actionCards = [
    {
      titleKey: "homeActionAddProduct",
      description: "Easily add new items to your inventory.",
      href: "/products?action=add",
      Icon: PlusCircle,
      actionTextKey: "homeActionAddProduct"
    },
    {
      titleKey: "homeActionCheckStock",
      description: "View and manage your current stock levels.",
      href: "/products",
      Icon: Archive,
      actionTextKey: "homeActionCheckStock"
    },
    {
      titleKey: "homeActionGenerateBill",
      description: "Quickly create and print bills for customers.",
      href: "/generate-bill",
      Icon: FileOutput,
      actionTextKey: "homeActionGenerateBill"
    },
    {
      titleKey: "homeActionUdhaarKhata",
      description: "Manage credits and debts.",
      href: "/udhaar-khata",
      Icon: BookUser, 
      actionTextKey: "homeActionUdhaarKhata"
    },
  ];

  const totalProductsCount = useMemo(() => products.length, [products]);

  const lowStockItemsCount = useMemo(() => {
    return products.filter(product => {
      const threshold = product.minStockThreshold ?? globalLowStockThreshold;
      return product.quantity > 0 && threshold > 0 && product.quantity < threshold;
    }).length;
  }, [products, globalLowStockThreshold]);

  const todaysSalesAmount = useMemo(() => {
    const now = new Date();
    const todaysBills = bills.filter(bill => {
      if (!(bill.timestamp instanceof Date) || isNaN(bill.timestamp.getTime())) {
        console.warn("Invalid timestamp for bill (sales amount calc):", bill.id, bill.timestamp);
        return false; 
      }
      return bill.timestamp.getFullYear() === now.getFullYear() &&
             bill.timestamp.getMonth() === now.getMonth() &&
             bill.timestamp.getDate() === now.getDate();
    });
    console.log("Bills filtered for 'today's sales' calculation:", todaysBills.map(b => ({id: b.id, timestamp: b.timestamp, totalAmount: b.totalAmount })));
    return todaysBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  }, [bills]);

  const todaysBillsCount = useMemo(() => {
    const now = new Date();
    const filteredBills = bills.filter(bill => {
      if (!(bill.timestamp instanceof Date) || isNaN(bill.timestamp.getTime())) {
         console.warn("Invalid timestamp for bill (count calc):", bill.id, bill.timestamp);
        return false;
      }
      return bill.timestamp.getFullYear() === now.getFullYear() &&
             bill.timestamp.getMonth() === now.getMonth() &&
             bill.timestamp.getDate() === now.getDate();
    });
     console.log("Bills filtered for 'today's bills count':", filteredBills.map(b => ({id: b.id, timestamp: b.timestamp })));
    return filteredBills.length;
  }, [bills]);

  const quickStats = useMemo(() => [
    { titleKey: "homeTotalProductsStat", value: totalProductsCount.toString(), Icon: Archive, color: "text-primary" },
    { titleKey: "homeLowStockItemsStat", value: lowStockItemsCount.toString(), Icon: AlertOctagon, color: "text-destructive" },
    { titleKey: "homeTodaysSalesStat", value: `₹${todaysSalesAmount.toFixed(2)}`, Icon: Receipt, color: "text-accent" }, 
    { titleKey: "homeBillsTodayStat", value: todaysBillsCount.toString(), Icon: WalletCards, color: "text-yellow-500" },
  ], [t, totalProductsCount, lowStockItemsCount, todaysSalesAmount, todaysBillsCount]);

  const renderStatValue = (value: string) => {
    if (isLoadingStats) return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
    if (statsError) return <span className="text-destructive text-xl">!</span>;
    return value;
  };

  return (
    <div className="space-y-8">
      <section className="bg-card p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-nunito font-bold text-primary mb-2">
          {t("homeWelcome")}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t("homeTagline")}
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-nunito font-semibold text-foreground mb-4">{t("homeQuickActionsTitle")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {actionCards.map((card) => (
            <ActionCard
              key={card.href}
              title={t(card.titleKey)}
              description={card.description}
              href={card.href}
              Icon={card.Icon}
              actionText={t(card.actionTextKey)}
            />
          ))}
        </div>
      </section>
      
      <section className="modern-card mt-8">
         <h2 className="text-2xl font-nunito font-semibold text-primary mb-6">{t("homeQuickStatsTitle")}</h2>
         {statsError && !isLoadingStats && (
            <p className="text-center text-destructive mb-4">{t("errorLoadingStats") || "Error loading stats."} ({statsError})</p>
         )}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map(stat => (
              <motion.div
                key={stat.titleKey}
                className="bg-background/50 p-5 rounded-lg shadow-md flex flex-col items-center text-center"
                whileHover={{ y: -5, scale: 1.03, boxShadow: "0px 10px 20px hsla(var(--foreground), 0.1)" }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }} 
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <stat.Icon className={`h-10 w-10 mb-3 ${stat.color}`} />
                </motion.div>
                <h3 className="text-md font-medium text-muted-foreground">{t(stat.titleKey)}</h3>
                <p className="text-3xl font-semibold font-nunito text-foreground mt-1">
                  {renderStatValue(stat.value)}
                </p>
              </motion.div>
            ))}
         </div>
      </section>
    </div>
  );

}

