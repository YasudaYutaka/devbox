import Link from "next/link";
import { ArrowRight, Binary, Braces, KeyRound, Shield, Timer, Type } from "lucide-react";
import { tools } from "./devbox-data";
import { DevBoxShell } from "./shell";

export function DashboardPage() {
  const mainTools = tools;

  return (
    <DevBoxShell active="dashboard">
      <div className="p-3 sm:p-5">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">Welcome to DevBox</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Generate, format, validate, and compare developer data.
            </p>
          </div>
          <h2 className="text-base font-semibold">Tools</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {mainTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <Link
                  className="group flex h-[164px] flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-5 transition-colors hover:border-[color-mix(in_srgb,var(--primary)_40%,var(--border))]"
                  href={tool.href}
                  key={tool.title}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-active)] text-[var(--primary)]">
                      <Icon aria-hidden className="size-[18px]" strokeWidth={2} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm font-semibold">{tool.title}</span>
                      <span className="truncate text-[10px] font-medium text-[var(--primary)]">
                        {tool.subtype}
                      </span>
                    </span>
                  </div>
                  <p className="min-h-8 text-[13px] leading-4 text-[var(--text-secondary)]">
                    {tool.description}
                  </p>
                  <span className="mt-auto inline-flex h-8 w-fit items-center justify-center gap-1.5 rounded-md bg-[var(--primary)] px-3.5 text-xs font-medium text-white transition-colors group-hover:bg-[var(--primary-hover)] dark:border dark:border-[var(--border)] dark:bg-[#30363d] dark:text-[#e6edf3] dark:group-hover:bg-[var(--bg-hover)]">
                    Open tool
                    <ArrowRight aria-hidden className="size-3.5" strokeWidth={2} />
                  </span>
                </Link>
              );
            })}
          </div>
          <DashboardPillSection title="Recently used" items={recentlyUsedItems} />
          {/* <DashboardPillSection title="Coming soon" items={comingSoonItems} muted /> */}
        </div>
      </div>
    </DevBoxShell>
  );
}

const recentlyUsedItems = [
  { label: "UUID Tools", icon: KeyRound },
  { label: "JSON Formatter", icon: Braces },
];

const comingSoonItems = [
  { label: "JWT Decoder", icon: Shield },
  { label: "Base64", icon: Binary },
  { label: "Timestamp", icon: Timer },
  { label: "Text Extractor", icon: Type },
];

function DashboardPillSection({
  title,
  items,
  muted = false,
}: {
  title: string;
  items: Array<{ label: string; icon: typeof KeyRound }>;
  muted?: boolean;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="flex flex-wrap gap-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
          <div
            className={
              muted
                ? "flex h-[34px] items-center gap-2 rounded-lg bg-[var(--badge-soon-bg)] px-3 text-xs text-[var(--badge-soon-text)] opacity-70"
                : "flex h-10 items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-4 text-[13px] font-medium"
            }
            key={item.label}
          >
            <Icon
              aria-hidden
              className={muted ? "size-3.5" : "size-4 text-[var(--primary)]"}
              strokeWidth={2}
            />
            {item.label}
          </div>
          );
        })}
      </div>
    </section>
  );
}
