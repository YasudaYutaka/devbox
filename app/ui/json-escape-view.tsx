"use client";

import { useState } from "react";
import { Braces, Copy, RefreshCw, TextCursorInput, Trash2 } from "lucide-react";
import { Breadcrumbs, Button, Card, PageTitle } from "./primitives";
import { DevBoxShell } from "./shell";
import { useLanguage } from "./language";
import { getLabels } from "./translations";

function escapeJsonString(input: string): string {
  return JSON.stringify(input).slice(1, -1);
}

function unescapeJsonString(input: string): { ok: true; result: string } | { ok: false; error: string } {
  try {
    return { ok: true, result: JSON.parse(`"${input}"`) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function JsonEscapePage() {
  const { locale } = useLanguage();
  const labels = getLabels(locale);
  const pageText = locale === "pt"
    ? {
        section: "Formatadores e Validadores",
        title: "Escape / Unescape de JSON",
        subtitle: "Escape texto para strings JSON e decodifique sequências escapadas.",
        escape: "Escape",
        unescape: "Unescape",
        input: "Entrada",
        output: "Saída",
        inputPlaceholder: "Cole texto ou uma string JSON escapada...",
        swap: "Trocar",
        empty: "O resultado aparecerá aqui.",
      }
    : {
        section: "Formatters & Validators",
        title: "JSON Escape / Unescape",
        subtitle: "Escape text for JSON strings and decode escaped sequences.",
        escape: "Escape",
        unescape: "Unescape",
        input: "Input",
        output: "Output",
        inputPlaceholder: "Paste text or an escaped JSON string...",
        swap: "Swap",
        empty: "The result will appear here.",
      };

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function handleInputChange(v: string) {
    setInput(v);
    setOutput("");
    setError("");
  }

  function handleEscape() {
    setOutput(escapeJsonString(input));
    setError("");
  }

  function handleUnescape() {
    const r = unescapeJsonString(input);
    if (r.ok) {
      setOutput(r.result);
      setError("");
    } else {
      setOutput("");
      setError(r.error);
    }
  }

  function handleSwap() {
    setInput(output);
    setOutput("");
    setError("");
  }

  function handleClear() {
    setInput("");
    setOutput("");
    setError("");
  }

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setNotice(labels.common.copied);
    setTimeout(() => setNotice(""), 1600);
  }

  return (
    <DevBoxShell active="json-escape">
      <Breadcrumbs items={[{ label: "DevBox", href: "/" }, { label: pageText.section }, { label: pageText.title }]} />
      <PageTitle
        title={pageText.title}
        subtitle={pageText.subtitle}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleEscape}>
              <Braces aria-hidden className="size-3.5" strokeWidth={2} />
              {pageText.escape}
            </Button>
            <Button onClick={handleUnescape}>
              <TextCursorInput aria-hidden className="size-3.5" strokeWidth={2} />
              {pageText.unescape}
            </Button>
            <Button disabled={!output} variant="outline" onClick={handleSwap}>
              <RefreshCw aria-hidden className="size-3.5" strokeWidth={2} />
              {pageText.swap}
            </Button>
          </div>
        }
      />

      <Card>
        <div className="grid min-h-[540px] gap-0 lg:grid-cols-2">
          <TextPanel
            clearLabel={labels.common.clear}
            label={pageText.input}
            placeholder={pageText.inputPlaceholder}
            value={input}
            onChange={handleInputChange}
            onClear={handleClear}
          />
          <ResultPanel
            copyLabel={labels.common.copy}
            emptyLabel={pageText.empty}
            notice={notice}
            title={pageText.output}
            value={output}
            onCopy={handleCopy}
          />
        </div>
      </Card>

      {error && <p className="text-[12px] font-mono text-[var(--error)]">{error}</p>}
    </DevBoxShell>
  );
}

function TextPanel({
  clearLabel,
  label,
  placeholder,
  value,
  onChange,
  onClear,
}: {
  clearLabel: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="flex min-h-[420px] min-w-0 flex-col border-b border-[var(--border)] lg:border-b-0 lg:border-r">
      <PanelHeader
        aside={
          <button
            className="inline-flex h-7 items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 text-[11px] font-medium text-[var(--text-primary)] shadow-[0_1px_3.5px_rgba(0,0,0,0.05)] transition-colors hover:bg-[var(--bg-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!value}
            type="button"
            onClick={onClear}
          >
            <Trash2 aria-hidden className="size-3" strokeWidth={2} />
            {clearLabel}
          </button>
        }
        title={label}
      />
      <textarea
        className="min-h-0 flex-1 resize-none bg-transparent p-4 font-mono text-xs leading-[1.6] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
        placeholder={placeholder}
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </section>
  );
}

function ResultPanel({
  title,
  emptyLabel,
  copyLabel,
  value,
  notice,
  onCopy,
}: {
  title: string;
  emptyLabel: string;
  copyLabel: string;
  value: string;
  notice: string;
  onCopy: () => void;
}) {
  return (
    <section className="flex min-h-[420px] min-w-0 flex-col bg-[var(--bg-page)]">
      <PanelHeader
        aside={
          <div className="flex items-center gap-2">
            {notice && <span className="text-[11px] text-[var(--success)]">{notice}</span>}
            <button
              className="inline-flex h-7 items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 text-[11px] font-medium text-[var(--text-primary)] shadow-[0_1px_3.5px_rgba(0,0,0,0.05)] transition-colors hover:bg-[var(--bg-hover)] disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!value}
              type="button"
              onClick={onCopy}
            >
              <Copy aria-hidden className="size-3" strokeWidth={2} />
              {copyLabel}
            </button>
          </div>
        }
        title={title}
      />
      <div className="flex min-h-0 flex-1 flex-col">
        {value
          ? (
            <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-[1.6] text-[var(--text-primary)]">
              {value}
            </pre>
          )
          : (
            <div className="flex flex-1 items-center justify-center p-6 text-center text-xs text-[var(--text-secondary)]">
              {emptyLabel}
            </div>
          )}
      </div>
    </section>
  );
}

function PanelHeader({
  title,
  aside,
}: {
  title: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
      <h2 className="text-[13px] font-semibold text-[var(--text-primary)]">{title}</h2>
      {aside}
    </div>
  );
}
