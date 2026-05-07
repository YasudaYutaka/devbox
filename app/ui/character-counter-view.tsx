"use client";

import { useMemo, useState } from "react";
import { List, TextCursorInput, Trash2, WholeWord, type LucideIcon } from "lucide-react";
import { Breadcrumbs, Button, Card, PageTitle } from "./primitives";
import { DevBoxShell } from "./shell";

const metrics = [
  { label: "Characters", icon: TextCursorInput },
  { label: "Words", icon: WholeWord },
  { label: "Lines", icon: List },
];

export function CharacterCounterPage() {
  const [text, setText] = useState("");

  const charCount = text.length;
  const wordCount = useMemo(
    () => (text.trim() === "" ? 0 : text.trim().split(/\s+/).length),
    [text],
  );
  const lineCount = useMemo(
    () => (text === "" ? 0 : text.split("\n").length),
    [text],
  );
  const metricValues = [charCount, wordCount, lineCount];

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
          <Button onClick={() => setText("")} variant="ghost">
            <Trash2 aria-hidden className="size-3" strokeWidth={2} />
            Clear
          </Button>
        </div>

        <div className="grid min-h-[504px] gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_200px]">
          <div className="flex min-h-[320px] rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] p-4">
            <textarea
              aria-label="Text input"
              className="h-full w-full resize-none bg-transparent font-mono text-sm leading-[1.6] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type your text here..."
              spellCheck={false}
              value={text}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {metrics.map((metric, index) => (
              <MetricCard
                icon={metric.icon}
                key={metric.label}
                label={metric.label}
                value={metricValues[index]}
              />
            ))}
          </div>
        </div>
      </Card>
    </DevBoxShell>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
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
      <span className="text-[28px] font-bold leading-none text-[var(--text-primary)]">{value}</span>
    </div>
  );
}
