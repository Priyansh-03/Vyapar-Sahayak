
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PackageSearch } from "lucide-react";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Products Page Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="items-center text-center">
          <PackageSearch className="h-12 w-12 text-destructive mb-3" />
          <CardTitle className="text-xl font-nunito text-destructive">
            Error Loading Products
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            We couldn't load the product information. Please try again.
          </CardDescription>
          {/* Moved error.message outside of CardDescription to avoid nesting <p> inside <p> or <div> inside <p> */}
          {error.message && (
            <div className="mt-2 text-xs text-muted-foreground"> {/* Applied text-muted-foreground for consistency */}
              Details: {error.message}
            </div>
          )}
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => reset()} className="rounded-full button-hover-effect">
            Retry Loading Products
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
