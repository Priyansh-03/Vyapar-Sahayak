
"use client";

import { useState, useEffect } from "react"; 
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"; // Removed CardFooter
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  Icon: LucideIcon;
  actionText: string;
}

const iconColors = ["bg-primary/20 text-primary", "bg-accent/20 text-accent"];

export function ActionCard({ title, description, href, Icon, actionText }: ActionCardProps) {
  
  const [dynamicIconColorClass, setDynamicIconColorClass] = useState<string>(iconColors[0]); 

  useEffect(() => {
    setDynamicIconColorClass(iconColors[Math.floor(Math.random() * iconColors.length)]);
  }, []); 

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="h-full" // Added to ensure motion.div takes full height for layout
    >
      <Card className={cn(
          "modern-card flex flex-col h-full", // Added h-full
          "hover:shadow-2xl" // Keep existing shadow for base, Framer can augment
        )}>
        <CardHeader className="pb-4 pt-6 items-center text-center">
          <motion.div
            className={cn(
            "p-4 mb-4 rounded-full inline-block transition-all duration-300", // Removed group-hover:scale-110
            dynamicIconColorClass 
            )}
            whileHover={{ scale: 1.1, rotate: -5 }} // Icon specific hover
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Icon className="h-10 w-10" />
          </motion.div>
          <CardTitle className="text-2xl font-nunito mb-1 text-foreground">{title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground min-h-[40px]">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-end justify-center pb-6">
          <Link href={href} passHref legacyBehavior>
            <motion.a
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className={cn(
                "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                "bg-primary text-primary-foreground hover:bg-primary/90 button-hover-effect", // Copied from Button default variant
                "h-10 px-6 py-2 text-base" // Size and text specified
              )}
            >
              {actionText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </motion.a>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
