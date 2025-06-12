
"use client";

import React, { useEffect } from "react"; // Added React import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserX } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error("Profile Page Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="items-center text-center">
          <UserX className="h-12 w-12 text-destructive mb-3" />
          <CardTitle className="text-xl font-nunito text-destructive">
            {t("profileErrorTitle")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("profileErrorDescription")}
            {error.message && <p className="mt-2 text-xs">Details: {error.message}</p>}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => reset()} className="rounded-full button-hover-effect">
            {t("profileErrorRetry")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
