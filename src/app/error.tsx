
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="text-center">
              <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
              <CardTitle className="text-2xl font-nunito text-destructive">
                Something went wrong!
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                We're sorry, but an unexpected error occurred. You can try to
                recover by clicking the button below.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2 mb-4">
                  Error Digest: {error.digest}
                </p>
              )}
              <Button onClick={() => reset()} className="rounded-full button-hover-effect">
                Try again
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
