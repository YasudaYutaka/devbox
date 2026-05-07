import { CheckCircle2, Copy, FileJson2, Minimize2 } from "lucide-react";
import { Breadcrumbs, Card, cx } from "./primitives";
import { DevBoxShell } from "./shell";

const sampleJson = `{
  "name": "DevBox",
  "version": "1.0.0",
  "tools": [
    "uuid",
    "json",
    "diff"
  ],
  "config": {
    "theme": "dark",
    "privacy": true
  }
}`;

export function JsonFormatterPage() {
  return (
    <DevBoxShell active="json-formatter">
      <Breadcrumbs items={[{ label: "DevBox", href: "/" }, { label: "Formatters & Validators" }, { label: "JSON Formatter" }]} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[22px] font-semibold leading-tight tracking-normal text-[var(--text-primary)]">
              JSON Formatter / Validator
            </h1>
            <span className="inline-flex h-[22px] items-center justify-center rounded-full bg-[var(--success-bg)] px-2 text-[11px] font-semibold text-[var(--success)]">
              Valid JSON
            </span>
          </div>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Format, minify, and validate JSON.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <JsonActionButton icon={FileJson2}>Format</JsonActionButton>
          <JsonActionButton icon={Minimize2} variant="outline">
            Minify
          </JsonActionButton>
          <JsonActionButton icon={CheckCircle2} variant="outline">
            Validate
          </JsonActionButton>
        </div>
      </div>
      <div className="grid min-h-[620px] gap-4 lg:grid-cols-2">
        <EditorPanel title="Input JSON" />
        <EditorPanel title="Output JSON" showCopy />
      </div>
    </DevBoxShell>
  );
}

function EditorPanel({
  title,
  showCopy = false,
}: {
  title: string;
  showCopy?: boolean;
}) {
  return (
    <Card className="flex min-h-[420px] flex-col">
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-[13px] font-semibold text-[var(--text-primary)]">{title}</h2>
        {showCopy ? (
          <button className="inline-flex h-7 items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 text-[11px] font-medium text-[var(--text-primary)] shadow-[0_1px_3.5px_rgba(0,0,0,0.05)] transition-colors hover:bg-[var(--bg-hover)]">
            <Copy aria-hidden className="size-3" strokeWidth={2} />
            Copy
          </button>
        ) : null}
      </div>
      <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-[1.6] text-[var(--text-primary)]">
        {sampleJson}
      </pre>
    </Card>
  );
}

function JsonActionButton({
  children,
  icon: Icon,
  variant = "default",
}: {
  children: React.ReactNode;
  icon: typeof FileJson2;
  variant?: "default" | "outline";
}) {
  return (
    <button
      className={cx(
        "inline-flex h-[34px] items-center justify-center gap-1.5 rounded-md px-4 text-xs font-medium transition-colors",
        variant === "default" &&
          "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] dark:border dark:border-[var(--border)] dark:bg-[#30363d] dark:text-[#e6edf3] dark:hover:bg-[var(--bg-hover)]",
        variant === "outline" &&
          "border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[0_1px_3.5px_rgba(0,0,0,0.05)] hover:bg-[var(--bg-hover)]",
      )}
    >
      <Icon aria-hidden className="size-3.5" strokeWidth={2} />
      {children}
    </button>
  );
}
