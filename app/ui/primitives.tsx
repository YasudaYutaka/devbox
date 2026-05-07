import type { LucideIcon } from "lucide-react";

export function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Breadcrumbs({ items }: { items: [string, string, string] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-secondary)]">
      {items.map((item, index) => (
        <span className="flex items-center gap-1.5" key={item}>
          <span className={index === items.length - 1 ? "text-[var(--text-primary)]" : ""}>
            {item}
          </span>
          {index < items.length - 1 ? <span>&gt;</span> : null}
        </span>
      ))}
    </nav>
  );
}

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1.5">
        <h1 className="text-[22px] font-semibold leading-tight tracking-normal text-[var(--text-primary)]">
          {title}
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)]">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  icon,
  aside,
}: {
  title: string;
  icon?: LucideIcon;
  aside?: React.ReactNode;
}) {
  const Icon = icon;

  return (
    <div className="flex min-h-14 items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3">
      <div className="flex min-w-0 items-center gap-2">
        {Icon ? (
          <span className="flex size-8 items-center justify-center rounded-md bg-[var(--bg-active)] text-[var(--primary)]">
            <Icon aria-hidden className="size-4" strokeWidth={2} />
          </span>
        ) : null}
        <h2 className="truncate text-sm font-semibold">{title}</h2>
      </div>
      {aside}
    </div>
  );
}

export function Button({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
}) {
  return (
    <button
      className={cx(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
        variant === "default" &&
          "bg-[var(--primary)] text-[var(--text-on-primary)] hover:bg-[var(--primary-hover)]",
        variant === "outline" &&
          "border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
        variant === "ghost" &&
          "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
      )}
    >
      {children}
    </button>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full bg-[var(--success-bg)] px-2.5 text-[11px] font-medium text-[var(--success)]">
      {children}
    </span>
  );
}
