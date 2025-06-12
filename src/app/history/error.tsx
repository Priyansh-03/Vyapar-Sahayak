
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { History as HistoryIcon } from "lucide-react"; // Using HistoryIcon to avoid conflict
import { useTranslation } from "@/hooks/use-translation";

export default function HistoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error("Bill History Page Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-lg shadow-xl text-center">
        <CardHeader className="items-center">
          <HistoryIcon className="h-12 w-12 text-destructive mb-3" />
          <CardTitle className="text-xl font-nunito text-destructive">
            {t("historyErrorLoadingTitle")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("historyErrorGeneralDescription")}
          </CardDescription>
          {error.message && (
            <div className="mt-2 text-xs text-muted-foreground">
              Details: {error.message}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Button onClick={() => reset()} className="rounded-full button-hover-effect">
            {t("retryButton")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
