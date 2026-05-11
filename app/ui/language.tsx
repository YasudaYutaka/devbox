"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";

export type Locale = "en" | "pt";

const storageKey = "devbox-language";
const languageChangeEvent = "devbox-language-change";

function getStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }

  const savedLocale = window.localStorage.getItem(storageKey);
  return savedLocale === "pt" || savedLocale === "en" ? savedLocale : "en";
}

function getServerLocale(): Locale {
  return "en";
}

function subscribeToLanguage(onStoreChange: () => void) {
  const handleChange = () => onStoreChange();
  window.addEventListener("storage", handleChange);
  window.addEventListener(languageChangeEvent, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(languageChangeEvent, handleChange);
  };
}

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribeToLanguage, getStoredLocale, getServerLocale);

  useEffect(() => {
    document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale(nextLocale: Locale) {
        window.localStorage.setItem(storageKey, nextLocale);
        window.dispatchEvent(new Event(languageChangeEvent));
      },
    }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return value;
}

