import { List, TextCursorInput, Trash2, WholeWord, type LucideIcon } from "lucide-react";
import { Breadcrumbs, Button, Card, PageTitle } from "./primitives";
import { DevBoxShell } from "./shell";

const metrics = [
  { label: "Characters", icon: TextCursorInput },
  { label: "Words", icon: WholeWord },
  { label: "Lines", icon: List },
];

export function CharacterCounterPage() {
  return (
    <DevBoxShell active="character-counter">
      <Breadcrumbs items={[{ label: "DevBox", href: "/" }, { label: "Text Tools" }, { label: "Character / Word Counter" }]} />
      <PageTitle
        title="Character / Word Counter"
        subtitle="Count characters, words, and lines instantly."
      />

      <Card className="min-h-[560px]">
        <div className="flex min-h-14 flex-col gap-3 border-b border-[var(--border)] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <WholeWord
              aria-hidden
              className="size-4 shrink-0 text-[var(--primary)]"
              strokeWidth={2}
            />
            <h2 className="truncate text-[15px] font-semibold text-[var(--text-primary)]">
              Text Analysis
            </h2>
          </div>
          <Button variant="ghost">
            <Trash2 aria-hidden className="size-3" strokeWidth={2} />
            Clear
          </Button>
        </div>

        <div className="grid min-h-[504px] gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_200px]">
          <div className="flex min-h-[320px] rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] p-4">
            <p className="text-sm leading-[1.6] text-[var(--text-muted)]">
              Paste or type your text here...
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {metrics.map((metric) => (
              <MetricCard icon={metric.icon} key={metric.label} label={metric.label} />
            ))}
          </div>
        </div>
      </Card>
    </DevBoxShell>
  );
}

function MetricCard({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex min-h-[84px] flex-col gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] p-4">
      <div className="flex min-w-0 items-center gap-1.5">
        <Icon
          aria-hidden
          className="size-3.5 shrink-0 text-[var(--text-secondary)]"
          strokeWidth={2}
        />
        <span className="truncate text-xs font-medium text-[var(--text-secondary)]">{label}</span>
      </div>
      <span className="text-[28px] font-bold leading-none text-[var(--text-primary)]">0</span>
    </div>
  );
}
