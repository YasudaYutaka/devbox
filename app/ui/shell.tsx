"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Box, ChevronLeft, ChevronRight, Home, Search, ShieldCheck } from "lucide-react";
import { activeBySlug, sectionOrder, tools, type ToolSlug } from "./devbox-data";
import { LanguageToggle } from "./language-toggle";
import { useLanguage } from "./language";
import { cx } from "./primitives";
import { ThemeToggle } from "./theme-toggle";
import { getLabels, getSectionLabel } from "./translations";

export function DevBoxShell({
  active,
  children,
}: {
  active: ToolSlug;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (active === "dashboard") return;
    try {
      const stored: string[] = JSON.parse(
        localStorage.getItem("devbox-recently-used") ?? "[]",
      );
      const updated = [active, ...stored.filter((s) => s !== active)].slice(0, 2);
      localStorage.setItem("devbox-recently-used", JSON.stringify(updated));
    } catch {}
  }, [active]);

  return (
    <div className="min-h-dvh bg-[var(--bg-page)] text-[var(--text-primary)]">
      <Header />
      <div className="flex min-h-[calc(100dvh-48px)]">
        <Sidebar
          active={active}
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />
        <main className="min-w-0 flex-1 overflow-hidden bg-[var(--bg-page)] p-5 sm:p-7 lg:px-10">
          <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5">{children}</div>
        </main>
      </div>
    </div>
  );
}

function Header() {
  const router = useRouter();
  const { locale } = useLanguage();
  const text = getLabels(locale);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? tools.filter(
        (t) =>
          text.tools[t.slug].title.toLowerCase().includes(query.toLowerCase()) ||
          text.tools[t.slug].subtype.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    } else if (e.key === "Enter" && filtered.length > 0) {
      router.push(filtered[0].href);
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-header)] px-4">
      <Link href="/" className="flex items-center gap-2">
        <Box aria-hidden className="size-5 text-[var(--primary)]" strokeWidth={2} />
        <span className="text-base font-bold">DevBox</span>
      </Link>
      <span className="hidden text-[11px] text-[var(--text-muted)] sm:inline">
        {text.headerTagline}
      </span>
      <div className="flex-1" />
      <div className="relative hidden md:block" ref={containerRef}>
        <div className="flex h-8 w-[220px] items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-page)] px-2.5">
          <Search aria-hidden className="size-3.5 shrink-0 text-[var(--text-muted)]" strokeWidth={2} />
          <input
            aria-label={text.searchTools}
            className="min-w-0 flex-1 bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={text.searchPlaceholder}
            value={query}
          />
        </div>
        {open && filtered.length > 0 && (
          <div className="absolute right-0 top-full mt-1 w-[220px] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-lg">
            {filtered.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-[var(--bg-hover)]"
                  key={tool.slug}
                  onClick={() => {
                    router.push(tool.href);
                    setOpen(false);
                    setQuery("");
                  }}
                  type="button"
                >
                  <Icon
                    aria-hidden
                    className="size-4 shrink-0 text-[var(--primary)]"
                    strokeWidth={2}
                  />
                  <span className="truncate">{text.tools[tool.slug].title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <span className="hidden h-6 items-center gap-1 rounded-full bg-[var(--success-bg)] px-2.5 text-[11px] font-medium text-[var(--success)] sm:flex">
        <ShieldCheck aria-hidden className="size-3" strokeWidth={2} />
        {text.localFirst}
      </span>
      <ThemeToggle />
      <LanguageToggle />
      <a
        aria-label="GitHub"
        className="flex size-8 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
        href="https://github.com/YasudaYutaka/devbox"
        rel="noopener noreferrer"
        target="_blank"
      >
        <GithubIcon aria-hidden className="size-4" />
      </a>
    </header>
  );
}

function Sidebar({
  active,
  collapsed,
  onToggle,
}: {
  active: ToolSlug;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const isHome = active === "dashboard";
  const { locale } = useLanguage();
  const text = getLabels(locale);

  return (
    <aside
      className={cx(
        "hidden shrink-0 overflow-y-auto border-r border-[var(--border)] bg-[var(--bg-sidebar)] lg:flex lg:flex-col",
        collapsed ? "w-12 px-1.5" : "w-60 px-4",
      )}
    >
      <div className={cx("flex flex-col gap-1 py-3", collapsed && "items-center")}>
        <Link
          className={cx(
            "flex h-8 items-center gap-2 rounded-md transition-colors",
            collapsed ? "w-8 justify-center" : "px-2 text-[13px]",
            isHome
              ? "bg-[var(--bg-active)] font-medium text-[var(--primary)]"
              : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
          )}
          href="/"
          title={text.home}
        >
          <Home
            aria-hidden
            className={cx(
              "size-4 shrink-0",
              isHome ? "text-[var(--primary)]" : "text-[var(--text-secondary)]",
            )}
            strokeWidth={2}
          />
          {!collapsed && <span className="truncate">{text.home}</span>}
        </Link>
      </div>

      {sectionOrder.map((section) => {
        const sectionTools = tools.filter((tool) => tool.section === section);
        if (sectionTools.length === 0) return null;
        return (
          <div
            className={cx("flex flex-col gap-1 py-3", collapsed && "items-center")}
            key={section}
          >
            {!collapsed && (
              <div className="px-2 py-0 text-[10px] font-semibold uppercase tracking-[1px] text-[var(--text-muted)]">
                {getSectionLabel(locale, section)}
              </div>
            )}
            {sectionTools.map((tool) => {
              const localizedTool = text.tools[tool.slug];
              const isActive = activeBySlug[active] === tool.title;
              const Icon = tool.icon;
              return (
                <Link
                  className={cx(
                    "flex h-8 items-center gap-2 rounded-md transition-colors",
                    collapsed ? "w-8 justify-center" : "px-2 text-[13px]",
                    isActive
                      ? "bg-[var(--bg-active)] font-medium text-[var(--primary)]"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
                  )}
                  href={tool.href}
                  key={`${section}-${tool.title}`}
                  title={collapsed ? localizedTool.title : undefined}
                >
                  <Icon
                    aria-hidden
                    className={cx(
                      "size-4 shrink-0",
                      isActive ? "text-[var(--primary)]" : "text-[var(--text-secondary)]",
                    )}
                    strokeWidth={2}
                  />
                  {!collapsed && <span className="truncate">{localizedTool.title}</span>}
                </Link>
              );
            })}
          </div>
        );
      })}

      <div className="flex-1" />

      <div className={cx("flex py-3", collapsed ? "justify-center" : "justify-end px-2")}>
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
          onClick={onToggle}
          type="button"
        >
          {collapsed ? (
            <ChevronRight aria-hidden className="size-4" strokeWidth={2} />
          ) : (
            <ChevronLeft aria-hidden className="size-4" strokeWidth={2} />
          )}
        </button>
      </div>
    </aside>
  );
}

function GithubIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 2C6.477 2 2 6.588 2 12.253c0 4.529 2.865 8.371 6.839 9.728.5.094.683-.222.683-.494 0-.244-.009-.89-.014-1.747-2.782.62-3.369-1.375-3.369-1.375-.455-1.186-1.11-1.502-1.11-1.502-.908-.636.069-.623.069-.623 1.004.073 1.532 1.057 1.532 1.057.892 1.567 2.341 1.115 2.91.852.091-.662.349-1.115.635-1.371-2.221-.259-4.556-1.139-4.556-5.067 0-1.119.39-2.034 1.03-2.75-.103-.26-.446-1.302.098-2.714 0 0 .84-.276 2.75 1.051A9.388 9.388 0 0 1 12 6.952a9.39 9.39 0 0 1 2.504.346c1.909-1.327 2.747-1.051 2.747-1.051.546 1.412.203 2.454.1 2.714.64.716 1.028 1.631 1.028 2.75 0 3.938-2.338 4.805-4.566 5.059.359.317.679.944.679 1.902 0 1.372-.012 2.479-.012 2.815 0 .274.18.593.688.492C19.138 20.62 22 16.78 22 12.253 22 6.588 17.523 2 12 2Z" />
    </svg>
  );
}
