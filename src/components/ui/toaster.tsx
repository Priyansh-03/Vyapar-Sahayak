
"use client"

import { useToast, TOAST_MANUAL_DISMISS_DURATION } from "@/hooks/use-toast"
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSettings } from "@/contexts/settings-context";

let timelineKeyCounter = 0;
const DEFAULT_SCREEN_POPUP_DURATION = 7000; // 7 seconds for default on-screen auto-dismissal

export function Toaster() {
  const { toasts } = useToast()
  const { notificationsEnabled } = useSettings();

  if (!notificationsEnabled) {
    return (
      <ToastProvider swipeDirection="right" duration={TOAST_MANUAL_DISMISS_DURATION}>
        <ToastViewport />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider swipeDirection="right" duration={TOAST_MANUAL_DISMISS_DURATION}>
      {toasts.map(function ({ id, title, description, action, duration, variant }) {
        const uniqueReactKey = `toast-popup-${id}-${timelineKeyCounter++}`;
        // Use provided duration for screen, or default to 7s, or fallback to manual if explicitly very long
        const screenPopupDuration = duration === TOAST_MANUAL_DISMISS_DURATION 
                                      ? TOAST_MANUAL_DISMISS_DURATION 
                                      : (duration ?? DEFAULT_SCREEN_POPUP_DURATION);

        return (
          <Toast 
            key={uniqueReactKey}
            variant={variant}
            duration={screenPopupDuration} // This duration is for the on-screen Radix Toast instance
            className="relative overflow-hidden group"
          >
            <div className="grid gap-1 flex-grow">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action} 
            
            <ToastPrimitives.Close
              className={cn(
                "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:ring-2 group-hover:opacity-100",
                "group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600"
              )}
            >
              <X className="h-4 w-4" />
            </ToastPrimitives.Close>

            {/* Show timeline bar only if it's an auto-dismissing toast (not manual duration) */}
            {(screenPopupDuration && screenPopupDuration < TOAST_MANUAL_DISMISS_DURATION) && (
              <div
                className="absolute bottom-0 left-0 h-1 bg-primary/70 animate-toast-timeline"
                style={{ animationDuration: `${screenPopupDuration}ms` }}
              />
            )}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
