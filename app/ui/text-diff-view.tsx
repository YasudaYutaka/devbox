import {
  ArrowLeftRight,
  Check,
  Copy,
  GitCompareArrows,
  Info,
  Sparkles,
  X,
} from "lucide-react";
import { Breadcrumbs, Button, Card, PageTitle, cx } from "./primitives";
import { DevBoxShell } from "./shell";

export function TextDiffPage() {
  return (
    <DevBoxShell active="text-diff">
      <Breadcrumbs items={[{ label: "DevBox", href: "/" }, { label: "Comparators" }, { label: "Text Diff" }]} />
      <PageTitle
        title="Text Diff"
        subtitle="Compare two texts and instantly spot only the differences."
        action={
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Button>
              <GitCompareArrows aria-hidden className="size-3.5" strokeWidth={2} />
              Compare
            </Button>
            <Button variant="outline">
              <ArrowLeftRight aria-hidden className="size-3.5" strokeWidth={2} />
              Switch
            </Button>
            <Button variant="ghost">
              <X aria-hidden className="size-3.5" strokeWidth={2} />
              Clear all
            </Button>
          </div>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Paste text to compare</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <TextEditorPanel
              accent="primary"
              helper="Text 1"
              sample="abcdef"
              title="Original text"
            />
            <TextEditorPanel
              accent="success"
              helper="Text 2"
              sample="123abc123"
              title="Modified text"
            />
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <CheckboxPreview checked label="Ignore whitespace" />
          <CheckboxPreview label="Ignore case" />
          <CheckboxPreview checked label="Show only differences" />
        </div>
        <SegmentedTabs />
      </div>

      <Card className="min-h-[360px]">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <Sparkles aria-hidden className="size-4 shrink-0 text-[var(--primary)]" strokeWidth={2} />
            <h2 className="truncate text-sm font-semibold text-[var(--text-primary)]">
              Diff result modes
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ResultBadge tone="added">+2 segments</ResultBadge>
            <ResultBadge tone="removed">-1 segment</ResultBadge>
            <ResultBadge tone="changed">1 match</ResultBadge>
            <Button variant="outline">
              <Copy aria-hidden className="size-3" strokeWidth={2} />
              Copy
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-3.5">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-page)] px-3 py-2 text-xs text-[var(--text-secondary)]">
            <Info aria-hidden className="size-3.5 shrink-0" strokeWidth={2} />
            <span>Only changed segments are highlighted. Matching text stays neutral.</span>
          </div>

          <PreviewCard title="Inline segment comparison">
            <div className="flex flex-col gap-1.5 font-mono text-[11px] text-[var(--text-primary)]">
              <div className="flex flex-wrap items-center gap-1">
                <span>Text 1: abc </span>
                <DiffChip tone="removed">def</DiffChip>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span>Text 2: </span>
                <DiffChip tone="added">123</DiffChip>
                <span> abc </span>
                <DiffChip tone="added">123</DiffChip>
              </div>
            </div>
          </PreviewCard>

          <PreviewCard title="Side-by-side segment comparison">
            <div className="grid gap-3 lg:grid-cols-2">
              <DiffSideColumn label="Text 1">
                <span>abc </span>
                <DiffChip tone="removed">def</DiffChip>
              </DiffSideColumn>
              <DiffSideColumn label="Text 2">
                <DiffChip tone="added">123</DiffChip>
                <span> abc </span>
                <DiffChip tone="added">123</DiffChip>
              </DiffSideColumn>
            </div>
          </PreviewCard>
        </div>
      </Card>
    </DevBoxShell>
  );
}

function TextEditorPanel({
  accent,
  helper,
  sample,
  title,
}: {
  accent: "primary" | "success";
  helper: string;
  sample: string;
  title: string;
}) {
  return (
    <div className="flex h-[148px] min-w-0 flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={cx(
              "size-2 shrink-0 rounded-full",
              accent === "primary" && "bg-[var(--primary)]",
              accent === "success" && "bg-[var(--success)]",
            )}
          />
          <h2 className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{title}</h2>
        </div>
        <span className="shrink-0 text-[11px] text-[var(--text-secondary)]">{helper}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden p-4 font-mono text-xs leading-[1.6] text-[var(--text-primary)]">
        {sample}
      </div>
    </div>
  );
}

function CheckboxPreview({ checked, label }: { checked?: boolean; label: string }) {
  return (
    <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)]">
      <span
        className={cx(
          "flex size-4 items-center justify-center rounded border",
          checked
            ? "border-[var(--primary)] bg-[var(--primary)] text-white"
            : "border-[var(--border)] bg-[var(--bg-surface)]",
        )}
      >
        {checked ? <Check aria-hidden className="size-3" strokeWidth={2.5} /> : null}
      </span>
      {label}
    </label>
  );
}

function SegmentedTabs() {
  return (
    <div className="flex h-10 w-fit shrink-0 items-center overflow-hidden rounded-md bg-[var(--bg-page)] p-1">
      <button className="h-full rounded-sm px-3 text-xs font-medium text-[var(--text-secondary)]">
        Inline
      </button>
      <button className="h-full rounded-sm bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--text-primary)] shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        Side-by-side
      </button>
    </div>
  );
}

function ResultBadge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "added" | "removed" | "changed";
}) {
  return (
    <span
      className={cx(
        "inline-flex h-6 items-center rounded-full px-2 text-[10px] font-semibold",
        tone === "added" && "bg-[var(--success-bg)] text-[var(--success)]",
        tone === "removed" && "bg-[var(--error-bg)] text-[var(--error)]",
        tone === "changed" && "bg-[var(--warning-bg)] text-[var(--warning)]",
      )}
    >
      {children}
    </span>
  );
}

function PreviewCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-3">
      <div className="text-xs font-semibold text-[var(--text-primary)]">{title}</div>
      {children}
    </div>
  );
}

function DiffSideColumn({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="text-[11px] font-medium text-[var(--text-secondary)]">{label}</div>
      <div className="flex min-h-8 flex-wrap items-center gap-1 rounded-md bg-[var(--bg-page)] p-2 font-mono text-[11px] text-[var(--text-primary)]">
        {children}
      </div>
    </div>
  );
}

function DiffChip({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "added" | "removed";
}) {
  return (
    <span
      className={cx(
        "inline-flex rounded-[3px] px-1 py-0.5",
        tone === "added" && "bg-[var(--diff-added)] text-[var(--success)]",
        tone === "removed" && "bg-[var(--diff-removed)] text-[var(--error)]",
      )}
    >
      {children}
    </span>
  );
}
