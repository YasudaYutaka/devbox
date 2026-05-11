"use client";

import { useState } from "react";
import { CheckCircle2, Copy, FileJson2, Minimize2 } from "lucide-react";
import { Breadcrumbs, Card, cx } from "./primitives";
import { DevBoxShell } from "./shell";
import { useLanguage } from "./language";
import { getLabels } from "./translations";

const jsonSoftLimitBytes = 500 * 1024;
const jsonHardLimitBytes = 2 * 1024 * 1024;

function formatJson(input: string): { ok: true; result: string } | { ok: false; error: string } {
  try {
    return { ok: true, result: JSON.stringify(JSON.parse(input), null, 2) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

function minifyJson(input: string): { ok: true; result: string } | { ok: false; error: string } {
  try {
    return { ok: true, result: JSON.stringify(JSON.parse(input)) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

function validateJson(input: string): { valid: boolean; error: string } {
  try {
    JSON.parse(input);
    return { valid: true, error: "" };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

export function JsonFormatterPage() {
  const { locale } = useLanguage();
  const labels = getLabels(locale);
  const pageText = locale === "pt"
    ? {
        section: "Formatadores e Validadores",
        title: "Formatador / Validador de JSON",
        subtitle: "Formate, minifique e valide JSON.",
        format: "Formatar",
        minify: "Minificar",
        input: "JSON de entrada",
        output: "JSON de saída",
        valid: "JSON válido",
        invalid: "JSON inválido",
        largeInput: (size: string, limit: string) =>
          `Entrada grande: ${size}. A formatação de JSON é limitada a ${limit}.`,
        sizeError: (size: string, limit: string) =>
          `A entrada tem ${size}. A formatação de JSON é limitada a ${limit}.`,
      }
    : {
        section: "Formatters & Validators",
        title: "JSON Formatter / Validator",
        subtitle: "Format, minify, and validate JSON.",
        format: "Format",
        minify: "Minify",
        input: "Input JSON",
        output: "Output JSON",
        valid: "Valid JSON",
        invalid: "Invalid JSON",
        largeInput: (size: string, limit: string) =>
          `Large input: ${size}. JSON formatting is limited to ${limit}.`,
        sizeError: (size: string, limit: string) =>
          `Input is ${size}. JSON formatting is limited to ${limit}.`,
      };
  const [inputJson, setInputJson] = useState("");
  const [outputJson, setOutputJson] = useState("");
  const [status, setStatus] = useState<"valid" | "invalid" | "idle">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [notice, setNotice] = useState("");
  const inputSize = getTextSize(inputJson);
  const isOverSoftLimit = inputSize > jsonSoftLimitBytes;

  function handleFormat() {
    if (!checkJsonSize(inputSize, setStatus, setErrorMsg, setOutputJson, pageText.sizeError)) {
      return;
    }

    const r = formatJson(inputJson);
    if (r.ok) {
      setOutputJson(r.result);
      setStatus("valid");
      setErrorMsg("");
    } else {
      setStatus("invalid");
      setErrorMsg(r.error);
      setOutputJson("");
    }
  }

  function handleMinify() {
    if (!checkJsonSize(inputSize, setStatus, setErrorMsg, setOutputJson, pageText.sizeError)) {
      return;
    }

    const r = minifyJson(inputJson);
    if (r.ok) {
      setOutputJson(r.result);
      setStatus("valid");
      setErrorMsg("");
    } else {
      setStatus("invalid");
      setErrorMsg(r.error);
      setOutputJson("");
    }
  }

  function handleValidate() {
    if (!checkJsonSize(inputSize, setStatus, setErrorMsg, setOutputJson, pageText.sizeError)) {
      return;
    }

    const r = validateJson(inputJson);
    setStatus(r.valid ? "valid" : "invalid");
    setErrorMsg(r.error);
    setOutputJson("");
  }

  async function handleCopy() {
    if (!outputJson) return;
    await navigator.clipboard.writeText(outputJson);
    setNotice(labels.common.copied);
    setTimeout(() => setNotice(""), 1600);
  }

  return (
    <DevBoxShell active="json-formatter">
      <Breadcrumbs items={[{ label: "DevBox", href: "/" }, { label: pageText.section }, { label: pageText.title }]} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[22px] font-semibold leading-tight tracking-normal text-[var(--text-primary)]">
              {pageText.title}
            </h1>
            {status === "valid" && (
              <span className="inline-flex h-[22px] items-center justify-center rounded-full bg-[var(--success-bg)] px-2 text-[11px] font-semibold text-[var(--success)]">
                {pageText.valid}
              </span>
            )}
            {status === "invalid" && (
              <span className="inline-flex h-[22px] items-center justify-center rounded-full bg-[var(--error-bg)] px-2 text-[11px] font-semibold text-[var(--error)]">
                {pageText.invalid}
              </span>
            )}
          </div>
          <p className="text-[13px] text-[var(--text-secondary)]">
            {pageText.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <JsonActionButton icon={FileJson2} onClick={handleFormat}>{pageText.format}</JsonActionButton>
          <JsonActionButton icon={Minimize2} variant="outline" onClick={handleMinify}>
            {pageText.minify}
          </JsonActionButton>
          <JsonActionButton icon={CheckCircle2} variant="outline" onClick={handleValidate}>
            {labels.common.validate}
          </JsonActionButton>
        </div>
      </div>
      <div className="grid min-h-[620px] gap-4 lg:grid-cols-2">
        <InputPanel title={pageText.input} value={inputJson} onChange={setInputJson} />
        <OutputPanel title={pageText.output} value={outputJson} notice={notice} onCopy={handleCopy} copyLabel={labels.common.copy} />
      </div>
      {isOverSoftLimit && status !== "invalid" && (
        <p className="text-[12px] font-medium text-[var(--warning)]">
          {pageText.largeInput(formatBytes(inputSize), formatBytes(jsonHardLimitBytes))}
        </p>
      )}
      {status === "invalid" && errorMsg && (
        <p className="text-[12px] font-mono text-[var(--error)]">{errorMsg}</p>
      )}
    </DevBoxShell>
  );
}

function InputPanel({ title, value, onChange }: { title: string; value: string; onChange: (v: string) => void }) {
  return (
    <Card className="flex min-h-[420px] flex-col">
      <div className="flex min-h-12 items-center gap-3 border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-[13px] font-semibold text-[var(--text-primary)]">{title}</h2>
      </div>
      <textarea
        className="min-h-0 flex-1 resize-none bg-transparent p-4 font-mono text-xs leading-[1.6] text-[var(--text-primary)] outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
    </Card>
  );
}

function OutputPanel({
  title,
  value,
  notice,
  onCopy,
  copyLabel,
}: {
  title: string;
  value: string;
  notice: string;
  onCopy: () => void;
  copyLabel: string;
}) {
  return (
    <Card className="flex min-h-[420px] flex-col">
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--bg-page)] px-4 py-3">
        <h2 className="text-[13px] font-semibold text-[var(--text-primary)]">{title}</h2>
        <div className="flex items-center gap-2">
          {notice && <span className="text-[11px] text-[var(--success)]">{notice}</span>}
          <button
            onClick={onCopy}
            disabled={!value}
            className="inline-flex h-7 items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 text-[11px] font-medium text-[var(--text-primary)] shadow-[0_1px_3.5px_rgba(0,0,0,0.05)] transition-colors hover:bg-[var(--bg-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Copy aria-hidden className="size-3" strokeWidth={2} />
            {copyLabel}
          </button>
        </div>
      </div>
      <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap bg-[var(--bg-page)] p-4 font-mono text-xs leading-[1.6] text-[var(--text-primary)]">
        {value}
      </pre>
    </Card>
  );
}

function checkJsonSize(
  size: number,
  setStatus: (value: "valid" | "invalid" | "idle") => void,
  setErrorMsg: (value: string) => void,
  setOutputJson: (value: string) => void,
  sizeError: (size: string, limit: string) => string,
) {
  if (size <= jsonHardLimitBytes) {
    return true;
  }

  setStatus("invalid");
  setErrorMsg(sizeError(formatBytes(size), formatBytes(jsonHardLimitBytes)));
  setOutputJson("");
  return false;
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

function JsonActionButton({
  children,
  icon: Icon,
  variant = "default",
  onClick,
}: {
  children: React.ReactNode;
  icon: typeof FileJson2;
  variant?: "default" | "outline";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
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
