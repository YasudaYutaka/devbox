"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { tools, type Tool } from "./devbox-data";
import { DevBoxShell } from "./shell";
import { useLanguage } from "./language";
import { cx } from "./primitives";
import { getLabels } from "./translations";

const emptyRecentTools: Tool[] = [];
let cachedRecentlyUsedRaw = "";
let cachedRecentlyUsedTools: Tool[] = emptyRecentTools;

export function DashboardPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const text = getLabels(locale);
  const [selected, setSelected] = useState<string | null>(null);
  const recentTools = useSyncExternalStore(
    subscribeToRecentlyUsed,
    getRecentlyUsedTools,
    getServerRecentlyUsedTools,
  );

  return (
    <DevBoxShell active="dashboard">
      <div className="p-3 sm:p-5">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">{text.dashboard.title}</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {text.dashboard.subtitle}
            </p>
          </div>
          <h2 className="text-base font-semibold">{text.dashboard.tools}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isSelected = selected === tool.slug;
              const localizedTool = text.tools[tool.slug];

              return (
                <div
                  className={cx(
                    "flex h-[164px] flex-col gap-3 rounded-lg border bg-[var(--bg-surface)] p-5 transition-colors",
                    isSelected
                      ? "border-[var(--primary)] shadow-[0_0_0_1px_var(--primary)]"
                      : "border-[var(--border)] hover:border-[color-mix(in_srgb,var(--primary)_40%,var(--border))]",
                  )}
                  key={tool.title}
                  onClick={() => setSelected(isSelected ? null : tool.slug)}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-active)] text-[var(--primary)]">
                      <Icon aria-hidden className="size-[18px]" strokeWidth={2} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm font-semibold">{localizedTool.title}</span>
                      <span className="truncate text-[10px] font-medium text-[var(--primary)]">
                        {localizedTool.subtype}
                      </span>
                    </span>
                  </div>
                  <p className="min-h-8 text-[13px] leading-4 text-[var(--text-secondary)]">
                    {localizedTool.description}
                  </p>
                  <button
                    className="mt-auto inline-flex h-8 w-fit cursor-pointer items-center justify-center gap-1.5 rounded-md bg-[var(--primary)] px-3.5 text-xs font-medium text-white transition-colors hover:bg-[var(--primary-hover)] dark:border dark:border-[var(--border)] dark:bg-[#30363d] dark:text-[#e6edf3] dark:hover:bg-[var(--bg-hover)]"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(tool.href);
                    }}
                    type="button"
                  >
                    {text.dashboard.openTool}
                    <ArrowRight aria-hidden className="size-3.5" strokeWidth={2} />
                  </button>
                </div>
              );
            })}
          </div>
          {recentTools.length > 0 && <RecentlyUsedSection tools={recentTools} />}
        </div>
      </div>
    </DevBoxShell>
  );
}

function getRecentlyUsedTools() {
  try {
    const raw = localStorage.getItem("devbox-recently-used") ?? "[]";

    if (raw === cachedRecentlyUsedRaw) {
      return cachedRecentlyUsedTools;
    }

    const stored: string[] = JSON.parse(raw);
    cachedRecentlyUsedRaw = raw;
    cachedRecentlyUsedTools = stored
      .map((slug) => tools.find((tool) => tool.slug === slug))
      .filter((tool): tool is Tool => tool !== undefined);

    return cachedRecentlyUsedTools;
  } catch {
    cachedRecentlyUsedRaw = "";
    cachedRecentlyUsedTools = emptyRecentTools;
    return cachedRecentlyUsedTools;
  }
}

function getServerRecentlyUsedTools() {
  return emptyRecentTools;
}

function subscribeToRecentlyUsed(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function RecentlyUsedSection({ tools: items }: { tools: Tool[] }) {
  const router = useRouter();
  const { locale } = useLanguage();
  const text = getLabels(locale);
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">{text.dashboard.recentlyUsed}</h2>
      <div className="flex flex-wrap gap-3">
        {items.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              className="flex h-10 cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-4 text-[13px] font-medium transition-colors hover:bg-[var(--bg-hover)]"
              key={tool.slug}
              onClick={() => router.push(tool.href)}
              type="button"
            >
              <Icon aria-hidden className="size-4 text-[var(--primary)]" strokeWidth={2} />
              {text.tools[tool.slug].title}
            </button>
          );
        })}
      </div>
    </section>
  );
}
