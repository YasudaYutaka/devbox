import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-secondary)]">
      {items.map((item, index) => (
        <span className="flex items-center gap-1.5" key={item.label}>
          {item.href ? (
            <Link className="hover:text-[var(--primary)]" href={item.href}>
              {item.label}
            </Link>
          ) : (
            <span className={index === items.length - 1 ? "text-[var(--text-primary)]" : ""}>
              {item.label}
            </span>
          )}
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

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
};

export function Button({
  children,
  className,
  variant = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={cx(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "default" &&
          "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] dark:border dark:border-[var(--border)] dark:bg-[#30363d] dark:text-[#e6edf3] dark:hover:bg-[var(--bg-hover)]",
        variant === "outline" &&
          "border border-[var(--border)] bg-white text-[var(--text-primary)] hover:bg-[var(--bg-hover)] dark:bg-[#1b1f23] dark:text-[#e6edf3]",
        variant === "ghost" &&
          "text-[var(--text-primary)] hover:bg-[var(--bg-hover)] dark:text-[#e6edf3]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  variant = "success",
}: {
  children: React.ReactNode;
  variant?: "success" | "danger";
}) {
  return (
    <span
      className={cx(
        "inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-medium",
        variant === "success" && "bg-[var(--success-bg)] text-[var(--success)]",
        variant === "danger" && "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
      )}
    >
      {children}
    </span>
  );
}
