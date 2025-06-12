
"use client";

import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, UserCircle2, Code2 } from "lucide-react";

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <header className="text-center sm:text-left">
        <h1 className="text-3xl font-nunito font-bold text-primary flex items-center justify-center sm:justify-start">
          <Mail className="mr-3 h-8 w-8" />
          {t("contactPageTitle")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("contactPageDescription")}</p>
      </header>

      <Card className="shadow-xl rounded-xl bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-nunito text-foreground">{t("contactGetInTouch")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{t("contactForInquiries")}</p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg border border-border">
              <UserCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">{t("contactDeveloperLabel")}</p>
                <p className="text-md font-medium text-foreground">Priyansh Srivastava</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg border border-border">
              <Mail className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">{t("contactEmailLabel")}</p>
                <a 
                  href="mailto:priyansh.sriv03@gmail.com" 
                  className="text-md font-medium text-foreground hover:text-primary transition-colors"
                >
                  priyansh.sriv03@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg border border-border">
              <Code2 className="h-6 w-6 text-accent flex-shrink-0" />
               <div>
                <p className="text-sm text-muted-foreground">{t("contactAppInfoLabel")}</p>
                <p className="text-md font-medium text-foreground">Vyapar Sahayak v1.0</p>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center pt-4">
            {t("contactMoreOptionsComingSoon")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
