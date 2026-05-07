import {
  ArrowDown,
  ArrowUp,
  Copy,
  Download,
  Layers,
  Minus,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Badge, Breadcrumbs, Button, Card, PageTitle, cx } from "./primitives";
import { DevBoxShell } from "./shell";

const batchUuids = [
  "550e8400-e370-41e4-a714-e4a634540a00",
  "7c9e6a79-7f25-4d8a-914a-a97fe1f96ae7",
  "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "a8a0b4f9-3c8b-4ef6-80a0-d4e9e0d3de11",
  "3f9a84e4-5717-45a3-83f6-2c4e2f66ef4a",
];

export function UuidToolsPage() {
  return (
    <DevBoxShell active="uuid-tools">
      <Breadcrumbs items={["DevBox", "Generators", "UUID Tools"]} />
      <PageTitle title="UUID Tools" subtitle="Generate and transform UUIDs quickly." />

      <Card>
        <ToolCardHeader
          icon={Zap}
          iconClassName="text-[var(--primary)] dark:text-[var(--border)]"
          title="Quick UUID Utility"
          aside={<Badge>Valid UUID v4</Badge>}
        />
        <div className="flex flex-col gap-4 p-6">
          <div className="flex h-14 min-w-0 overflow-hidden rounded-lg">
            <div className="flex min-w-0 flex-1 items-center rounded-l-lg border border-[var(--border)] bg-[var(--bg-page)] px-[18px]">
              <span className="truncate font-mono text-[13.5px] font-medium text-[var(--text-primary)]">
                558e840b-e29b-41d4-a716-444655440000
              </span>
            </div>
            <button className="-ml-px inline-flex h-full w-[116px] shrink-0 items-center justify-center gap-2 rounded-r-lg border border-[var(--border)] bg-white text-sm font-medium text-[var(--text-primary)] shadow-[0_1px_3.5px_rgba(0,0,0,0.05)] transition-colors hover:bg-[var(--bg-hover)] dark:bg-[#24292e] dark:text-[#e6edf3]">
              <Copy aria-hidden className="size-4" strokeWidth={2} />
              Copy
            </button>
          </div>

          <div className="flex justify-end">
            <span className="inline-flex h-6 items-center rounded-full bg-[var(--badge-soon-bg)] px-2.5 text-[11px] font-medium text-[var(--text-primary)]">
              Copied!
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-[9px] bg-[var(--bg-page)] p-2">
            <Button>
              <RefreshCw aria-hidden className="size-3.5" strokeWidth={2} />
              Generate UUID
            </Button>
            <div className="hidden h-6 w-px bg-[var(--border)] sm:block" />
            <Button variant="outline">
              <Plus aria-hidden className="size-3" strokeWidth={2} />
              Add Hyphen
            </Button>
            <Button variant="outline">
              <Minus aria-hidden className="size-3" strokeWidth={2} />
              Remove Hyphen
            </Button>
            <Button variant="outline">
              <ArrowUp aria-hidden className="size-3" strokeWidth={2} />
              To Uppercase
            </Button>
            <Button variant="outline">
              <ArrowDown aria-hidden className="size-3" strokeWidth={2} />
              To Lowercase
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <ToolCardHeader
          icon={Layers}
          iconClassName="text-[#737373] dark:text-[var(--text-secondary)]"
          title="Batch UUID Generator"
          aside={
            <div className="flex flex-wrap justify-end gap-1.5">
              <Button variant="outline">
                <Copy aria-hidden className="size-3" strokeWidth={2} />
                Copy
              </Button>
              <Button variant="outline">
                <Download aria-hidden className="size-3" strokeWidth={2} />
                CSV
              </Button>
              <Button variant="ghost">
                <Trash2 aria-hidden className="size-3" strokeWidth={2} />
                Clear
              </Button>
            </div>
          }
        />
        <div className="grid gap-5 p-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="flex flex-col gap-3.5 rounded-lg border border-[var(--border)] bg-[var(--bg-page)] p-4">
            <PanelLabel>Quantity</PanelLabel>
            <div className="flex h-[38px] gap-2">
              <div className="flex w-[78px] items-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 text-[13px] font-medium text-[var(--text-primary)]">
                10
              </div>
              <Button>
                <Play aria-hidden className="size-3.5 fill-current" strokeWidth={2} />
                Generate
              </Button>
            </div>

            <PanelLabel>Output options</PanelLabel>
            <CheckboxPreview label="Uppercase" />
            <CheckboxPreview label="Remove hyphens" />

            <div className="flex flex-col gap-1.5 rounded-[7px] border border-[var(--border)] bg-[var(--bg-surface)] p-3">
              <h3 className="text-xs font-semibold text-[var(--text-primary)]">Empty state</h3>
              <p className="text-[11px] leading-[1.45] text-[var(--text-secondary)]">
                Results appear as soon as a batch is generated.
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-2.5">
            <div className="flex items-center justify-between gap-3">
              <PanelLabel>Results (10)</PanelLabel>
              <Badge>Copied!</Badge>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-page)] p-2">
              {batchUuids.map((uuid) => (
                <div
                  className="flex h-[34px] min-w-0 items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3"
                  key={uuid}
                >
                  <span className="min-w-0 truncate font-mono text-[11.5px] text-[var(--text-primary)]">
                    {uuid}
                  </span>
                  <Copy
                    aria-hidden
                    className="size-3 shrink-0 text-[#737373] dark:text-[var(--text-secondary)]"
                    strokeWidth={2}
                  />
                </div>
              ))}
              <div className="h-[30px] rounded-md bg-[var(--bg-page)] dark:bg-[var(--bg-hover)]" />
            </div>
          </div>
        </div>
      </Card>
    </DevBoxShell>
  );
}

function ToolCardHeader({
  title,
  icon: Icon,
  iconClassName,
  aside,
}: {
  title: string;
  icon: LucideIcon;
  iconClassName?: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-14 flex-col gap-3 border-b border-[var(--border)] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-2">
        <Icon aria-hidden className={cx("size-4 shrink-0", iconClassName)} strokeWidth={2} />
        <h2 className="truncate text-[15px] font-semibold text-[var(--text-primary)]">{title}</h2>
      </div>
      {aside}
    </div>
  );
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold text-[var(--text-secondary)]">{children}</div>;
}

function CheckboxPreview({ label }: { label: string }) {
  return (
    <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
      <span className="flex size-4 items-center justify-center rounded border border-[var(--border)] bg-[var(--bg-surface)]">
        <span className="size-2 rounded-[2px] bg-[var(--bg-surface)]" />
      </span>
      {label}
    </label>
  );
}
