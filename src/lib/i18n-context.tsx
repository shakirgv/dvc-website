"use client";

import React, { createContext, useContext } from "react";

type Dictionary = Record<string, any>;

const TranslationContext = createContext<Dictionary | null>(null);

export function TranslationProvider({ 
  children, 
  dictionary 
}: { 
  children: React.ReactNode; 
  dictionary: Dictionary;
}) {
  return (
    <TranslationContext.Provider value={dictionary}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const dictionary = useContext(TranslationContext);
  
  if (!dictionary) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }

  // Helper function to get nested keys like "navbar.home"
  const t = (key: string): string => {
    const keys = key.split(".");
    let value = dictionary;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key; // Fallback to the key itself if not found
      }
    }
    return typeof value === "string" ? value : key;
  };

  return { t, dict: dictionary };
}
