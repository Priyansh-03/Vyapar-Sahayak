
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { Send, Mic, AlertTriangle, XCircle, AudioLines } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PremiumFeatureDialog } from "./premium-feature-dialog"; // Import PremiumFeatureDialog

const BrowserSpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) as { new(): SpeechRecognition } | undefined;

interface SttDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // onExecuteCommand prop removed as it's now a premium feature
}

export function SttDialog({
  isOpen,
  onClose,
}: SttDialogProps) {
  const { t, currentLanguage } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [sttText, setSttText] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const hasRequestedMicPermission = useRef(false);
  const [isPremiumDialogVisible, setIsPremiumDialogVisible] = useState(false); // State for premium dialog

  const getLangForRecognition = useCallback(() => {
    switch (currentLanguage) {
      case 'hi':
        return 'hi-IN';
      case 'hi-IN':
        return 'hi-IN';
      case 'en':
      default:
        return 'en-US';
    }
  }, [currentLanguage]);

  useEffect(() => {
    if (!BrowserSpeechRecognition) {
      setIsSupported(false);
      setMicError(t("sttDialogMicNotSupportedError"));
      return;
    }
    setIsSupported(true);

    const recognition = new BrowserSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = getLangForRecognition();

    recognition.onstart = () => {
      setIsListening(true);
      setMicError(null);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setSttText(finalTranscript.trim() || interimTranscript.trim());
    };

    recognition.onerror = (event) => {
      let errorMessage = t("sttDialogDefaultError");
      if (event.error === 'no-speech') errorMessage = t("sttDialogNoSpeechError");
      else if (event.error === 'audio-capture') errorMessage = t("sttDialogAudioCaptureError");
      else if (event.error === 'not-allowed') errorMessage = t("sttDialogMicPermissionErrorDescription");
      else if (event.error === 'network') errorMessage = t("sttDialogNetworkError");
      setMicError(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    speechRecognitionRef.current = recognition;

    return () => {
      speechRecognitionRef.current?.abort();
    };
  }, [t, getLangForRecognition]);

  const startListening = useCallback(async () => {
    if (!isSupported || !speechRecognitionRef.current || isListening) return;
    
    setSttText('');
    setMicError(null);
    hasRequestedMicPermission.current = true;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      speechRecognitionRef.current.lang = getLangForRecognition();
      speechRecognitionRef.current.start();
    } catch (err) {
      console.error("Mic permission error:", err);
      setMicError(t("sttDialogMicPermissionErrorDescription"));
      setIsListening(false);
    }
  }, [isSupported, isListening, t, getLangForRecognition]);

  const stopListening = useCallback(() => {
    if (speechRecognitionRef.current && isListening) {
      speechRecognitionRef.current.stop();
    }
    setIsListening(false);
  }, [isListening]);

  useEffect(() => {
    if (isOpen && isSupported && !hasRequestedMicPermission.current) {
      startListening();
    } else if (!isOpen) {
      stopListening();
      setSttText('');
      setMicError(null);
      hasRequestedMicPermission.current = false;
    }
  }, [isOpen, isSupported, startListening, stopListening]);
  
  const handleSend = () => {
    if (sttText.trim()) {
      // Close SttDialog and open PremiumFeatureDialog
      onClose(); // Close current STT dialog
      setIsPremiumDialogVisible(true); // Open premium dialog
    } else {
       // If no text, just close the STT dialog or provide feedback
       onClose();
    }
  };

  const handleDialogClose = () => {
    stopListening();
    onClose();
  };

  const handlePremiumDialogClose = () => {
    setIsPremiumDialogVisible(false);
    // Optionally, clear sttText or reset other STT states if needed
    setSttText(''); 
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-lg rounded-xl bg-card border-border flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="font-nunito text-primary text-center sm:text-left">{t("sttDialogTitle")}</DialogTitle>
          </DialogHeader>

          <div className="flex-grow my-4 min-h-[100px] p-3 bg-muted/30 rounded-md border border-border flex flex-col justify-center items-center text-center">
            {micError ? (
              <Alert variant="destructive" className="w-full">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle>{t("sttDialogMicPermissionErrorTitle")}</AlertTitle>
                <AlertDescription>{micError}</AlertDescription>
              </Alert>
            ) : isListening ? (
              <div className="flex flex-col items-center space-y-2 text-foreground">
                <AudioLines className="h-10 w-10 text-primary animate-pulse" />
                <p className="text-lg font-medium">{t("sttDialogListening")}</p>
              </div>
            ) : sttText ? (
              <p className="text-lg font-medium text-foreground">{sttText}</p>
            ) : (
              <p className="text-muted-foreground">{t("sttDialogPromptMessage") || "Click the mic to start speaking."}</p> 
            )}
          </div>
          
          <div className="flex-shrink-0 flex justify-center items-center my-2">
            {!isListening && (
              <Button
                variant="default"
                size="icon"
                className="h-16 w-16 rounded-full shadow-lg bg-primary hover:bg-primary/90"
                onClick={startListening}
                disabled={!isSupported || isListening}
                aria-label="Start Listening"
              >
                <Mic className="h-8 w-8 text-primary-foreground" />
              </Button>
            )}
            {isListening && (
              <Button
                variant="destructive"
                size="icon"
                className="h-16 w-16 rounded-full shadow-lg bg-destructive hover:bg-destructive/90"
                onClick={stopListening}
                aria-label="Stop Listening"
              >
                <XCircle className="h-8 w-8 text-destructive-foreground" />
              </Button>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 flex-shrink-0 border-t border-border pt-4">
            <Button type="button" variant="outline" className="rounded-full" onClick={handleDialogClose}>
              {t("cancelButton")}
            </Button>
            <Button 
              onClick={handleSend} 
              className="rounded-full button-hover-effect"
              disabled={isListening || !sttText.trim() || !!micError}
            >
              <Send className="mr-2 h-4 w-4" />
              {t("sttDialogSendButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PremiumFeatureDialog
        isOpen={isPremiumDialogVisible}
        onClose={handlePremiumDialogClose}
      />
    </>
  );
}
