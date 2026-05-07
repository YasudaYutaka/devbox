import Link from "next/link";
import { Box, Search, ShieldCheck } from "lucide-react";
import { activeBySlug, sectionOrder, tools, type ToolSlug } from "./devbox-data";
import { cx } from "./primitives";
import { ThemeToggle } from "./theme-toggle";

export function DevBoxShell({
  active,
  children,
}: {
  active: ToolSlug;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[var(--bg-page)] text-[var(--text-primary)]">
      <Header />
      <div className="flex min-h-[calc(100dvh-48px)]">
        <Sidebar active={active} />
        <main className="min-w-0 flex-1 overflow-hidden bg-[var(--bg-page)] p-5 sm:p-7 lg:px-10">
          <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-header)] px-4">
      <Link href="/" className="flex items-center gap-2">
        <Box aria-hidden className="size-5 text-[var(--primary)]" strokeWidth={2} />
        <span className="text-base font-bold">DevBox</span>
      </Link>
      <span className="hidden text-[11px] text-[var(--text-muted)] sm:inline">
        Fast utilities for developers
      </span>
      <div className="flex-1" />
      <div className="hidden h-8 w-[220px] items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-page)] px-2.5 text-xs text-[var(--text-muted)] md:flex">
        <Search aria-hidden className="size-3.5" strokeWidth={2} />
        <span>Search tools...</span>
      </div>
      <span className="hidden h-6 items-center gap-1 rounded-full bg-[var(--success-bg)] px-2.5 text-[11px] font-medium text-[var(--success)] sm:flex">
        <ShieldCheck aria-hidden className="size-3" strokeWidth={2} />
        Local-first
      </span>
      <ThemeToggle />
      <button className="flex size-8 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">
        <span className="sr-only">GitHub</span>
        <GithubIcon aria-hidden className="size-4" />
      </button>
    </header>
  );
}

function Sidebar({ active }: { active: ToolSlug }) {
  return (
    <aside className="hidden w-60 shrink-0 overflow-y-auto border-r border-[var(--border)] bg-[var(--bg-sidebar)] px-4 py-0 lg:block">
      {sectionOrder.map((section) => {
        const sectionTools = tools.filter((tool) => tool.section === section);
        if (sectionTools.length === 0) {
          return null;
        }
        return (
          <div className="flex flex-col gap-1 py-3" key={section}>
            <div className="px-2 py-0 text-[10px] font-semibold uppercase tracking-[1px] text-[var(--text-muted)]">
              {section}
            </div>
            {sectionTools.map((tool) => {
              const isActive = activeBySlug[active] === tool.title;
              const Icon = tool.icon;
              return (
                <Link
                  className={cx(
                    "flex h-8 items-center gap-2 rounded-md px-2 text-[13px] transition-colors",
                    isActive
                      ? "bg-[var(--bg-active)] font-medium text-[var(--primary)]"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
                  )}
                  href={tool.href}
                  key={`${section}-${tool.title}`}
                >
                  <Icon
                    aria-hidden
                    className={cx(
                      "size-4 shrink-0",
                      isActive ? "text-[var(--primary)]" : "text-[var(--text-secondary)]",
                    )}
                    strokeWidth={2}
                  />
                  <span className="truncate">{tool.title}</span>
                </Link>
              );
            })}
          </div>
        );
      })}
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
