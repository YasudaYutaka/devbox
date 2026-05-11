"use client";

import { useState } from "react";
import {
  ArrowLeftRight,
  Check,
  Copy,
  GitCompareArrows,
  Info,
  Sparkles,
  X,
} from "lucide-react";
import { diffChars } from "diff";
import { Breadcrumbs, Button, Card, PageTitle, cx } from "./primitives";
import { DevBoxShell } from "./shell";
import { useLanguage } from "./language";
import { getLabels } from "./translations";

type Segment = { type: "equal" | "added" | "removed"; text: string };

const diffSoftLimitBytes = 500 * 1024;
const diffHardLimitBytes = 1024 * 1024;

export function TextDiffPage() {
  const { locale } = useLanguage();
  const labels = getLabels(locale);
  const pageText = locale === "pt"
    ? {
        section: "Comparadores",
        title: "Comparador de Texto",
        subtitle: "Compare dois textos e veja apenas as diferenças instantaneamente.",
        compare: "Comparar",
        switch: "Trocar",
        pasteTitle: "Cole o texto para comparar",
        text1: "Texto 1",
        text2: "Texto 2",
        original: "Texto original",
        modified: "Texto modificado",
        ignoreWhitespace: "Ignorar espaços",
        ignoreCase: "Ignorar maiúsculas/minúsculas",
        showOnlyDiff: "Mostrar apenas diferenças",
        inline: "Inline",
        sideBySide: "Lado a lado",
        result: "Resultado da comparação",
        segment: "segmento",
        segments: "segmentos",
        matches: "iguais",
        empty: "Cole texto nos dois painéis e pressione Comparar para ver as diferenças.",
        tooLarge: (limit: string) => `Entrada grande demais - cada campo é limitado a ${limit}.`,
        largeInput: (left: string, right: string, limit: string) =>
          `Entrada grande: texto 1 tem ${left}, texto 2 tem ${right}. A comparação pedirá confirmação acima de ${limit}.`,
        confirmLarge: "Esta comparação é grande e pode ser mais lenta para renderizar. Continuar?",
        inlineTitle: "Comparação de segmentos inline",
        sideTitle: "Comparação de segmentos lado a lado",
        placeholder: "Cole ou digite o texto aqui...",
      }
    : {
        section: "Comparators",
        title: "Text Diff",
        subtitle: "Compare two texts and instantly spot only the differences.",
        compare: "Compare",
        switch: "Switch",
        pasteTitle: "Paste text to compare",
        text1: "Text 1",
        text2: "Text 2",
        original: "Original text",
        modified: "Modified text",
        ignoreWhitespace: "Ignore whitespace",
        ignoreCase: "Ignore case",
        showOnlyDiff: "Show only differences",
        inline: "Inline",
        sideBySide: "Side-by-side",
        result: "Diff result",
        segment: "segment",
        segments: "segments",
        matches: "matches",
        empty: "Paste text in both panels and press Compare to see differences.",
        tooLarge: (limit: string) => `Input too large - each field is limited to ${limit}.`,
        largeInput: (left: string, right: string, limit: string) =>
          `Large input: text 1 is ${left}, text 2 is ${right}. Compare will ask for confirmation above ${limit}.`,
        confirmLarge: "This is a large diff and may be slower to render. Continue?",
        inlineTitle: "Inline segment comparison",
        sideTitle: "Side-by-side segment comparison",
        placeholder: "Paste or type text here...",
      };
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [showOnlyDiff, setShowOnlyDiff] = useState(false);
  const [mode, setMode] = useState<"inline" | "side-by-side">("side-by-side");
  const [result, setResult] = useState<Segment[] | null>(null);
  const [tooLong, setTooLong] = useState(false);
  const [copied, setCopied] = useState(false);
  const text1Size = getTextSize(text1);
  const text2Size = getTextSize(text2);
  const isOverSoftLimit = text1Size > diffSoftLimitBytes || text2Size > diffSoftLimitBytes;

  function runDiff(a: string, b: string) {
    if (getTextSize(a) > diffHardLimitBytes || getTextSize(b) > diffHardLimitBytes) {
      setTooLong(true);
      setResult(null);
      return;
    }
    setTooLong(false);

    let dispA = a;
    let dispB = b;
    if (ignoreWhitespace) {
      dispA = dispA.replace(/[^\S\n]+/g, " ").replace(/^[^\S\n]+|[^\S\n]+$/g, "");
      dispB = dispB.replace(/[^\S\n]+/g, " ").replace(/^[^\S\n]+|[^\S\n]+$/g, "");
    }

    const changes = diffChars(dispA, dispB, { ignoreCase });
    setResult(
      changes.map((c) => ({
        type: c.added ? "added" : c.removed ? "removed" : "equal",
        text: c.value,
      })),
    );
  }

  function handleCompare() {
    if (isOverSoftLimit && !window.confirm(pageText.confirmLarge)) {
      return;
    }

    runDiff(text1, text2);
  }

  function handleSwitch() {
    setText1(text2);
    setText2(text1);
    if (result !== null) runDiff(text2, text1);
  }

  function handleClear() {
    setText1("");
    setText2("");
    setResult(null);
    setTooLong(false);
    setCopied(false);
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(segmentsToPlainText(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const displaySegments =
    result && showOnlyDiff ? result.filter((s) => s.type !== "equal") : result;

  const addedCount = result ? result.filter((s) => s.type === "added").length : 0;
  const removedCount = result ? result.filter((s) => s.type === "removed").length : 0;
  const equalCount = result ? result.filter((s) => s.type === "equal").length : 0;

  return (
    <DevBoxShell active="text-diff">
      <Breadcrumbs
        items={[{ label: "DevBox", href: "/" }, { label: pageText.section }, { label: pageText.title }]}
      />
      <PageTitle
        title={pageText.title}
        subtitle={pageText.subtitle}
        action={
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Button onClick={handleCompare}>
              <GitCompareArrows aria-hidden className="size-3.5" strokeWidth={2} />
              {pageText.compare}
            </Button>
            <Button variant="outline" onClick={handleSwitch}>
              <ArrowLeftRight aria-hidden className="size-3.5" strokeWidth={2} />
              {pageText.switch}
            </Button>
            <Button variant="ghost" onClick={handleClear}>
              <X aria-hidden className="size-3.5" strokeWidth={2} />
              {labels.common.clearAll}
            </Button>
          </div>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">{pageText.pasteTitle}</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <TextEditorPanel
              accent="primary"
              helper={pageText.text1}
              title={pageText.original}
              value={text1}
              onChange={setText1}
              placeholder={pageText.placeholder}
            />
            <TextEditorPanel
              accent="success"
              helper={pageText.text2}
              title={pageText.modified}
              value={text2}
              onChange={setText2}
              placeholder={pageText.placeholder}
            />
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <CheckboxPreview
            checked={ignoreWhitespace}
            label={pageText.ignoreWhitespace}
            onChange={setIgnoreWhitespace}
          />
          <CheckboxPreview
            checked={ignoreCase}
            label={pageText.ignoreCase}
            onChange={setIgnoreCase}
          />
          <CheckboxPreview
            checked={showOnlyDiff}
            label={pageText.showOnlyDiff}
            onChange={setShowOnlyDiff}
          />
        </div>
        <SegmentedTabs value={mode} onChange={setMode} labels={{ inline: pageText.inline, sideBySide: pageText.sideBySide }} />
      </div>

      <Card className="min-h-[360px]">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <Sparkles aria-hidden className="size-4 shrink-0 text-[var(--primary)]" strokeWidth={2} />
            <h2 className="truncate text-sm font-semibold text-[var(--text-primary)]">
              {pageText.result}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {result && (
              <>
                {addedCount > 0 && (
                  <ResultBadge tone="added">+{addedCount} {addedCount !== 1 ? pageText.segments : pageText.segment}</ResultBadge>
                )}
                {removedCount > 0 && (
                  <ResultBadge tone="removed">-{removedCount} {removedCount !== 1 ? pageText.segments : pageText.segment}</ResultBadge>
                )}
                {equalCount > 0 && (
                  <ResultBadge tone="changed">{equalCount} {pageText.matches}</ResultBadge>
                )}
              </>
            )}
            <Button variant="outline" onClick={handleCopy} disabled={!result || tooLong}>
              <Copy aria-hidden className="size-3" strokeWidth={2} />
              {copied ? labels.common.copied : labels.common.copy}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-3.5">
          {!result && !tooLong && (
            <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-page)] px-3 py-2 text-xs text-[var(--text-secondary)]">
              <Info aria-hidden className="size-3.5 shrink-0" strokeWidth={2} />
              <span>{pageText.empty}</span>
            </div>
          )}

          {tooLong && (
            <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--error-bg)] px-3 py-2 text-xs text-[var(--error)]">
              <Info aria-hidden className="size-3.5 shrink-0" strokeWidth={2} />
              <span>{pageText.tooLarge(formatBytes(diffHardLimitBytes))}</span>
            </div>
          )}

          {isOverSoftLimit && !tooLong && (
            <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--warning-bg)] px-3 py-2 text-xs text-[var(--warning)]">
              <Info aria-hidden className="size-3.5 shrink-0" strokeWidth={2} />
              <span>
                {pageText.largeInput(formatBytes(text1Size), formatBytes(text2Size), formatBytes(diffSoftLimitBytes))}
              </span>
            </div>
          )}

          {displaySegments && !tooLong && mode === "inline" && (
            <PreviewCard title={pageText.inlineTitle}>
              <div className="flex flex-col gap-2 font-mono text-[11px] text-[var(--text-primary)]">
                <div className="leading-relaxed">
                  <span className="mr-1.5 text-[var(--text-secondary)]">{pageText.text1}:</span>
                  {renderSegs(displaySegments, "left")}
                </div>
                <div className="leading-relaxed">
                  <span className="mr-1.5 text-[var(--text-secondary)]">{pageText.text2}:</span>
                  {renderSegs(displaySegments, "right")}
                </div>
              </div>
            </PreviewCard>
          )}

          {displaySegments && !tooLong && mode === "side-by-side" && (
            <PreviewCard title={pageText.sideTitle}>
              <div className="grid gap-3 lg:grid-cols-2">
                <DiffSideColumn label={pageText.text1}>{renderSegs(displaySegments, "left")}</DiffSideColumn>
                <DiffSideColumn label={pageText.text2}>{renderSegs(displaySegments, "right")}</DiffSideColumn>
              </div>
            </PreviewCard>
          )}
        </div>
      </Card>
    </DevBoxShell>
  );
}

function TextEditorPanel({
  accent,
  helper,
  title,
  value,
  onChange,
  placeholder,
}: {
  accent: "primary" | "success";
  helper: string;
  title: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
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
      <textarea
        className="min-h-0 flex-1 resize-none bg-transparent p-4 font-mono text-xs leading-[1.6] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder={placeholder}
      />
    </div>
  );
}

function CheckboxPreview({
  checked,
  label,
  onChange,
}: {
  checked?: boolean;
  label: string;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[var(--text-primary)]">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span
        className={cx(
          "flex size-4 items-center justify-center rounded border",
          checked
            ? "border-[var(--primary)] bg-[var(--primary)] text-white"
            : "border-[var(--border)] bg-[var(--bg-surface)]",
        )}
        aria-hidden
      >
        {checked ? <Check className="size-3" strokeWidth={2.5} /> : null}
      </span>
      {label}
    </label>
  );
}

function SegmentedTabs({
  value,
  onChange,
  labels,
}: {
  value: "inline" | "side-by-side";
  onChange: (v: "inline" | "side-by-side") => void;
  labels: { inline: string; sideBySide: string };
}) {
  return (
    <div className="flex h-10 w-fit shrink-0 items-center overflow-hidden rounded-md bg-[var(--bg-page)] p-1">
      {(["inline", "side-by-side"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cx(
            "h-full rounded-sm px-3 text-xs font-medium capitalize transition-colors",
            value === tab
              ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
          )}
        >
          {tab === "inline" ? labels.inline : labels.sideBySide}
        </button>
      ))}
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
      <div className="min-h-8 whitespace-pre-wrap break-words rounded-md bg-[var(--bg-page)] p-2 font-mono text-[11px] leading-relaxed text-[var(--text-primary)]">
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
        "inline-flex whitespace-pre-wrap rounded-[3px] px-1 py-0.5",
        tone === "added" && "bg-[var(--diff-added)] text-[var(--success)]",
        tone === "removed" && "bg-[var(--diff-removed)] text-[var(--error)]",
      )}
    >
      {children}
    </span>
  );
}

// --- render helpers ---

function renderSegs(segs: Segment[], side: "left" | "right"): React.ReactNode[] {
  const filtered = segs.filter((s) => (side === "left" ? s.type !== "added" : s.type !== "removed"));
  const nodes: React.ReactNode[] = [];

  filtered.forEach((seg, si) => {
    const parts = seg.text.split("\n");
    parts.forEach((part, pi) => {
      if (pi > 0) nodes.push(<br key={`${si}-br-${pi}`} />);
      if (!part) return;
      if (seg.type === "equal") {
        nodes.push(<span key={`${si}-${pi}`}>{part}</span>);
      } else {
        nodes.push(
          <DiffChip key={`${si}-${pi}`} tone={seg.type as "added" | "removed"}>
            {part}
          </DiffChip>,
        );
      }
    });
  });

  return nodes;
}


function getTextSize(value: string) {
  return new Blob([value]).size;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024).toLocaleString()} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(bytes % (1024 * 1024) === 0 ? 0 : 1)} MB`;
}

function segmentsToPlainText(segs: Segment[]): string {
  return segs
    .map((s) =>
      s.type === "removed" ? `[-${s.text}]` : s.type === "added" ? `[+${s.text}]` : s.text,
    )
    .join("");
}
