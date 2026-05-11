"use client";

import { Languages } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage, type Locale } from "./language";
import { cx } from "./primitives";

const options: Array<{ locale: Locale; label: string; shortLabel: string }> = [
  { locale: "en", label: "English", shortLabel: "EN" },
  { locale: "pt", label: "Português", shortLabel: "PT" },
];

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = options.find((option) => option.locale === locale) ?? options[0];

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={locale === "pt" ? "Alterar idioma" : "Change language"}
        className="flex h-8 items-center justify-center gap-1.5 rounded-md px-2 text-[11px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <Languages aria-hidden className="size-4" strokeWidth={2} />
        <span>{current.shortLabel}</span>
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full mt-1 w-36 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-1 shadow-lg"
          role="menu"
        >
          {options.map((option) => (
            <button
              className={cx(
                "flex h-8 w-full items-center justify-between rounded-md px-2.5 text-left text-xs font-medium hover:bg-[var(--bg-hover)]",
                option.locale === locale
                  ? "text-[var(--primary)]"
                  : "text-[var(--text-primary)]",
              )}
              key={option.locale}
              aria-checked={option.locale === locale}
              onClick={() => {
                setLocale(option.locale);
                setOpen(false);
              }}
              role="menuitemradio"
              type="button"
            >
              <span>{option.label}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{option.shortLabel}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
