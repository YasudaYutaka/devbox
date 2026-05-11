"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Download,
  Info,
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
import { useLanguage } from "./language";
import { getLabels } from "./translations";

const defaultQuantity = 100;
const softBatchQuantity = 1000;
const maxBatchQuantity = 10000;
const uuidHexPattern = /^[0-9a-fA-F]{32}$/;
const uuidV4Pattern =
  /^[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?4[0-9a-fA-F]{3}-?[89abAB][0-9a-fA-F]{3}-?[0-9a-fA-F]{12}$/;

type Notice = "copied" | "csv" | null;

export function UuidToolsPage() {
  const { locale } = useLanguage();
  const labels = getLabels(locale);
  const pageText = locale === "pt"
    ? {
        section: "Geradores",
        title: "Ferramentas de UUID",
        subtitle: "Gere e transforme UUIDs rapidamente.",
        quick: "Utilitário rápido de UUID",
        valid: "UUID v4 válido",
        invalid: "UUID inválido",
        uuidValue: "Valor do UUID",
        placeholder: "Cole ou gere um UUID...",
        generateUuid: "Gerar UUID",
        addHyphen: "Adicionar hífens",
        removeHyphen: "Remover hífens",
        uppercase: "Maiúsculas",
        lowercase: "Minúsculas",
        batch: "Gerador de UUID em lote",
        csvReady: "CSV pronto",
        quantity: "Quantidade",
        outputOptions: "Opções de saída",
        removeHyphens: "Remover hífens",
        limit: "Limite",
        largeBatch: (quantity: string) => `Lote grande: a confirmação começa acima de ${quantity} UUIDs.`,
        resultsAppear: "Os resultados aparecem assim que um lote é gerado.",
        results: "Resultados",
        generatingBatch: "Gerando lote de UUIDs...",
        emptyBatch: "Gere um lote para ver os UUIDs aqui.",
        copyUuid: (index: number) => `Copiar UUID ${index}`,
        copyFailed: "Não foi possível copiar. Selecione o UUID e copie manualmente.",
        addHyphenError: "Digite exatamente 32 caracteres hexadecimais para adicionar hífens.",
        quantityRange: "Digite uma quantidade entre 1 e 10.000.",
        quantityMin: "A quantidade deve ser pelo menos 1.",
        quantityMax: (quantity: string) => `Digite ${quantity} UUIDs ou menos.`,
        largeTitle: "Gerar lote grande de UUIDs?",
        largeBody: (quantity: string) =>
          `Você está prestes a gerar ${quantity} UUIDs. Lotes grandes podem demorar para renderizar e copiar.`,
        cancel: "Cancelar",
      }
    : {
        section: "Generators",
        title: "UUID Tools",
        subtitle: "Generate and transform UUIDs quickly.",
        quick: "Quick UUID Utility",
        valid: "Valid UUID v4",
        invalid: "Invalid UUID",
        uuidValue: "UUID value",
        placeholder: "Paste or generate a UUID...",
        generateUuid: "Generate UUID",
        addHyphen: "Add Hyphen",
        removeHyphen: "Remove Hyphen",
        uppercase: "To Uppercase",
        lowercase: "To Lowercase",
        batch: "Batch UUID Generator",
        csvReady: "CSV ready",
        quantity: "Quantity",
        outputOptions: "Output options",
        removeHyphens: "Remove hyphens",
        limit: "Limit",
        largeBatch: (quantity: string) => `Large batch: confirmation starts above ${quantity} UUIDs.`,
        resultsAppear: "Results appear as soon as a batch is generated.",
        results: "Results",
        generatingBatch: "Generating UUID batch...",
        emptyBatch: "Generate a batch to see UUIDs here.",
        copyUuid: (index: number) => `Copy UUID ${index}`,
        copyFailed: "Copy failed. Select the UUID and copy it manually.",
        addHyphenError: "Enter exactly 32 hexadecimal characters to add hyphens.",
        quantityRange: "Enter a quantity between 1 and 10,000.",
        quantityMin: "Quantity must be at least 1.",
        quantityMax: (quantity: string) => `Enter ${quantity} UUIDs or fewer.`,
        largeTitle: "Generate large UUID batch?",
        largeBody: (quantity: string) =>
          `You are about to generate ${quantity} UUIDs. Large batches can take a moment to render and copy.`,
        cancel: "Cancel",
      };
  const [uuidValue, setUuidValue] = useState("");
  const [quickNotice, setQuickNotice] = useState<Notice>(null);
  const [quickError, setQuickError] = useState("");
  const [quantity, setQuantity] = useState(String(defaultQuantity));
  const [batchUppercase, setBatchUppercase] = useState(false);
  const [batchRemoveHyphens, setBatchRemoveHyphens] = useState(false);
  const [batchUuids, setBatchUuids] = useState<string[]>([]);
  const [batchNotice, setBatchNotice] = useState<Notice>(null);
  const [batchError, setBatchError] = useState("");
  const [copiedBatchIndex, setCopiedBatchIndex] = useState<number | null>(null);
  const [pendingBatchQuantity, setPendingBatchQuantity] = useState<number | null>(null);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);

  const quantityStatus = parseQuantity(quantity, {
    range: pageText.quantityRange,
    min: pageText.quantityMin,
    max: pageText.quantityMax(maxBatchQuantity.toLocaleString()),
  });
  const quickStatus = getUuidStatus(uuidValue);
  const hasBatchResults = batchUuids.length > 0;

  function handleGenerateSingle() {
    setUuidValue(generateUuid());
    setQuickError("");
    setQuickNotice(null);
  }

  function handleAddHyphen() {
    const normalized = uuidValue.replaceAll("-", "");

    if (!uuidHexPattern.test(normalized)) {
      setQuickError(pageText.addHyphenError);
      setQuickNotice(null);
      return;
    }

    setUuidValue(formatUuidWithHyphens(normalized));
    setQuickError("");
    setQuickNotice(null);
  }

  function handleRemoveHyphen() {
    setUuidValue(uuidValue.replaceAll("-", ""));
    setQuickError("");
    setQuickNotice(null);
  }

  function handleCaseChange(transform: "upper" | "lower") {
    setUuidValue((current) => (transform === "upper" ? current.toUpperCase() : current.toLowerCase()));
    setQuickError("");
    setQuickNotice(null);
  }

  async function handleCopySingle() {
    const didCopy = await copyText(uuidValue);
    setQuickError(didCopy ? "" : pageText.copyFailed);
    showQuickNotice(didCopy ? "copied" : null);
  }

  function handleGenerateBatch() {
    const count = parseQuantity(quantity, {
      range: pageText.quantityRange,
      min: pageText.quantityMin,
      max: pageText.quantityMax(maxBatchQuantity.toLocaleString()),
    });

    if (!count.valid) {
      setBatchError(count.message);
      setBatchNotice(null);
      setPendingBatchQuantity(null);
      return;
    }

    if (count.value > softBatchQuantity) {
      setPendingBatchQuantity(count.value);
      return;
    }

    void generateBatch(count.value);
  }

  function handleConfirmLargeBatch() {
    if (pendingBatchQuantity === null) {
      return;
    }

    void generateBatch(pendingBatchQuantity);
    setPendingBatchQuantity(null);
  }

  function handleCancelLargeBatch() {
    setPendingBatchQuantity(null);
  }

  async function generateBatch(count: number) {
    setIsBatchGenerating(true);
    setQuantity(String(count));
    setBatchError("");
    setBatchNotice(null);
    setCopiedBatchIndex(null);

    await waitForNextFrame();

    try {
      setBatchUuids(
        Array.from({ length: count }, () =>
          formatBatchUuid(generateUuid(), batchUppercase, batchRemoveHyphens),
        ),
      );
    } finally {
      setIsBatchGenerating(false);
    }
  }

  async function handleCopyBatch() {
    if (!hasBatchResults) {
      return;
    }

    const didCopy = await copyText(batchUuids.join("\n"));
    if (didCopy) {
      showBatchNotice("copied");
    }
  }

  function handleDownloadCsv() {
    if (!hasBatchResults) {
      return;
    }

    const csv = ["uuid", ...batchUuids.map(escapeCsvValue)].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "uuid-batch.csv";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showBatchNotice("csv");
  }

  function handleClearBatch() {
    setBatchUuids([]);
    setBatchNotice(null);
    setBatchError("");
    setCopiedBatchIndex(null);
  }

  async function handleCopyBatchRow(uuid: string, index: number) {
    const didCopy = await copyText(uuid);

    if (didCopy) {
      setCopiedBatchIndex(index);
      window.setTimeout(() => {
        setCopiedBatchIndex((current) => (current === index ? null : current));
      }, 1600);
    }
  }

  function showQuickNotice(notice: Notice) {
    setQuickNotice(notice);
    if (notice) {
      window.setTimeout(() => setQuickNotice(null), 1600);
    }
  }

  function showBatchNotice(notice: Notice) {
    setBatchNotice(notice);
    if (notice) {
      window.setTimeout(() => setBatchNotice(null), 1600);
    }
  }

  return (
    <DevBoxShell active="uuid-tools">
      <Breadcrumbs items={[{ label: "DevBox", href: "/" }, { label: pageText.section }, { label: pageText.title }]} />
      <PageTitle title={pageText.title} subtitle={pageText.subtitle} />

      <Card>
        <ToolCardHeader
          icon={Zap}
          iconClassName="text-[var(--primary)] dark:text-[var(--border)]"
          title={pageText.quick}
          aside={
            quickStatus === "empty" ? null : (
              <Badge variant={quickStatus === "valid" ? "success" : "danger"}>
                {quickStatus === "valid" ? pageText.valid : pageText.invalid}
              </Badge>
            )
          }
        />
        <div className="flex flex-col gap-4 p-6">
          <div className="flex h-14 min-w-0 overflow-hidden rounded-lg">
            <div className="flex min-w-0 flex-1 items-center rounded-l-lg border border-[var(--border)] bg-[var(--bg-page)] px-[18px]">
              <input
                aria-label={pageText.uuidValue}
                className="min-w-0 flex-1 bg-transparent font-mono text-[13.5px] font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                onChange={(event) => {
                  setUuidValue(event.target.value);
                  setQuickError("");
                  setQuickNotice(null);
                }}
                placeholder={pageText.placeholder}
                spellCheck={false}
                value={uuidValue}
              />
            </div>
            <button
              className="-ml-px inline-flex h-full w-[116px] shrink-0 items-center justify-center gap-2 rounded-r-lg border border-[var(--border)] bg-white text-sm font-medium text-[var(--text-primary)] shadow-[0_1px_3.5px_rgba(0,0,0,0.05)] transition-colors hover:bg-[var(--bg-hover)] dark:bg-[#24292e] dark:text-[#e6edf3]"
              onClick={handleCopySingle}
              type="button"
            >
              <Copy aria-hidden className="size-4" strokeWidth={2} />
              {labels.common.copy}
            </button>
          </div>

          <div className="flex min-h-6 items-center justify-end">
            {quickError ? (
              <span className="text-right text-xs font-medium text-red-600 dark:text-red-400">
                {quickError}
              </span>
            ) : quickNotice === "copied" ? (
              <StatusPill icon={Check}>{labels.common.copied}</StatusPill>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-[9px] bg-[var(--bg-page)] p-2">
            <Button onClick={handleGenerateSingle}>
              <RefreshCw aria-hidden className="size-3.5" strokeWidth={2} />
              {pageText.generateUuid}
            </Button>
            <div className="hidden h-6 w-px bg-[var(--border)] sm:block" />
            <Button onClick={handleAddHyphen} variant="outline">
              <Plus aria-hidden className="size-3" strokeWidth={2} />
              {pageText.addHyphen}
            </Button>
            <Button onClick={handleRemoveHyphen} variant="outline">
              <Minus aria-hidden className="size-3" strokeWidth={2} />
              {pageText.removeHyphen}
            </Button>
            <Button onClick={() => handleCaseChange("upper")} variant="outline">
              <ArrowUp aria-hidden className="size-3" strokeWidth={2} />
              {pageText.uppercase}
            </Button>
            <Button onClick={() => handleCaseChange("lower")} variant="outline">
              <ArrowDown aria-hidden className="size-3" strokeWidth={2} />
              {pageText.lowercase}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <ToolCardHeader
          icon={Layers}
          iconClassName="text-[#737373] dark:text-[var(--text-secondary)]"
          title={pageText.batch}
          aside={
            <div className="flex flex-wrap justify-end gap-1.5">
              <Button disabled={!hasBatchResults || isBatchGenerating} onClick={handleCopyBatch} variant="outline">
                <Copy aria-hidden className="size-3" strokeWidth={2} />
                {labels.common.copy}
              </Button>
              <Button disabled={!hasBatchResults || isBatchGenerating} onClick={handleDownloadCsv} variant="outline">
                <Download aria-hidden className="size-3" strokeWidth={2} />
                CSV
              </Button>
              <Button disabled={!hasBatchResults || isBatchGenerating} onClick={handleClearBatch} variant="ghost">
                <Trash2 aria-hidden className="size-3" strokeWidth={2} />
                {labels.common.clear}
              </Button>
            </div>
          }
        />
        <div className="grid gap-5 p-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="flex flex-col gap-3.5 rounded-lg border border-[var(--border)] bg-[var(--bg-page)] p-4">
            <PanelLabel>{pageText.quantity}</PanelLabel>
            <div className="flex h-[38px] gap-2">
              <input
                aria-label="Batch quantity"
                className="flex w-[78px] items-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 text-[13px] font-medium text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--primary)]"
                inputMode="numeric"
                max={maxBatchQuantity}
                min={1}
                onChange={(event) => {
                  setQuantity(event.target.value);
                  setBatchError("");
                }}
                type="number"
                value={quantity}
              />
              <Button disabled={isBatchGenerating} onClick={handleGenerateBatch}>
                <Play
                  aria-hidden
                  className={cx("size-3.5 fill-current", isBatchGenerating && "animate-spin")}
                  strokeWidth={2}
                />
                {isBatchGenerating ? labels.common.generating : labels.common.generate}
              </Button>
            </div>

            <PanelLabel>{pageText.outputOptions}</PanelLabel>
            <CheckboxControl
              checked={batchUppercase}
              label={pageText.uppercase}
              onChange={setBatchUppercase}
            />
            <CheckboxControl
              checked={batchRemoveHyphens}
              label={pageText.removeHyphens}
              onChange={setBatchRemoveHyphens}
            />

            <div className="flex flex-col gap-1.5 rounded-[7px] border border-[var(--border)] bg-[var(--bg-surface)] p-3">
              <h3 className="text-xs font-semibold text-[var(--text-primary)]">
                {pageText.limit}: {maxBatchQuantity.toLocaleString()} UUIDs
              </h3>
              <p
                aria-live="polite"
                className={cx(
                  "text-[11px] leading-[1.45]",
                  batchError ? "font-medium text-[var(--error)]" : "text-[var(--text-secondary)]",
                )}
              >
                {batchError ||
                  quantityStatus.message ||
                  (quantityStatus.valid && quantityStatus.value > softBatchQuantity
                    ? pageText.largeBatch(softBatchQuantity.toLocaleString())
                    : pageText.resultsAppear)}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-2.5">
            <div className="flex min-h-6 items-center justify-between gap-3">
              <PanelLabel>{pageText.results} ({batchUuids.length})</PanelLabel>
              {batchNotice === "copied" ? <StatusPill icon={Check}>{labels.common.copied}</StatusPill> : null}
              {batchNotice === "csv" ? <StatusPill icon={Download}>{pageText.csvReady}</StatusPill> : null}
            </div>
            <div className="flex max-h-[430px] min-h-[230px] min-w-0 flex-col gap-1.5 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--bg-page)] p-2">
              {isBatchGenerating ? (
                <div className="flex min-h-[210px] flex-col items-center justify-center gap-3 rounded-md bg-[var(--bg-surface)] p-6 text-center text-xs text-[var(--text-secondary)]">
                  <span className="flex size-9 items-center justify-center rounded-md bg-[var(--bg-active)] text-[var(--primary)]">
                    <Play aria-hidden className="size-4 animate-spin fill-current" strokeWidth={2} />
                  </span>
                  <span>{pageText.generatingBatch}</span>
                </div>
              ) : hasBatchResults ? (
                batchUuids.map((uuid, index) => (
                  <div
                    className="flex h-[34px] min-w-0 shrink-0 items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3"
                    key={`${uuid}-${index}`}
                  >
                    <span className="min-w-0 truncate font-mono text-[11.5px] text-[var(--text-primary)]">
                      {uuid}
                    </span>
                    <button
                      aria-label={pageText.copyUuid(index + 1)}
                      className="inline-flex size-6 shrink-0 items-center justify-center rounded text-[#737373] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] dark:text-[var(--text-secondary)]"
                      onClick={() => handleCopyBatchRow(uuid, index)}
                      title={pageText.copyUuid(index + 1)}
                      type="button"
                    >
                      {copiedBatchIndex === index ? (
                        <Check aria-hidden className="size-3" strokeWidth={2} />
                      ) : (
                        <Copy aria-hidden className="size-3" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex min-h-[210px] items-center justify-center rounded-md bg-[var(--bg-surface)] p-6 text-center text-xs text-[var(--text-secondary)]">
                  {pageText.emptyBatch}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {pendingBatchQuantity !== null ? (
        <LargeBatchDialog
          quantity={pendingBatchQuantity}
          text={pageText}
          generateLabel={labels.common.generate}
          onCancel={handleCancelLargeBatch}
          onConfirm={handleConfirmLargeBatch}
        />
      ) : null}
    </DevBoxShell>
  );
}

function generateUuid() {
  const webCrypto = globalThis.crypto;

  if (webCrypto?.randomUUID) {
    return webCrypto.randomUUID();
  }

  const bytes = new Uint8Array(16);

  if (webCrypto?.getRandomValues) {
    webCrypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

  return formatUuidWithHyphens(hex);
}

function formatUuidWithHyphens(value: string) {
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

function formatBatchUuid(uuid: string, uppercase: boolean, removeHyphens: boolean) {
  let formatted = removeHyphens ? uuid.replaceAll("-", "") : uuid;

  if (uppercase) {
    formatted = formatted.toUpperCase();
  }

  return formatted;
}

function getUuidStatus(value: string) {
  if (!value.trim()) {
    return "empty";
  }

  return uuidV4Pattern.test(value.trim()) ? "valid" : "invalid";
}

function parseQuantity(
  value: string,
  messages: { range: string; min: string; max: string },
):
  | { valid: true; value: number; message: "" }
  | { valid: false; value: null; message: string } {
  const normalized = value.trim();

  if (!/^\d+$/.test(normalized)) {
    return { valid: false, value: null, message: messages.range };
  }

  const parsed = Number.parseInt(normalized, 10);

  if (parsed < 1) {
    return { valid: false, value: null, message: messages.min };
  }

  if (parsed > maxBatchQuantity) {
    return {
      valid: false,
      value: null,
      message: messages.max,
    };
  }

  return { valid: true, value: parsed, message: "" };
}

async function copyText(value: string) {
  if (!navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function waitForNextFrame() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

function escapeCsvValue(value: string) {
  if (!/[",\n\r]/.test(value)) {
    return value;
  }

  return `"${value.replaceAll("\"", "\"\"")}"`;
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

function CheckboxControl({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
      <span className="relative flex size-4 items-center justify-center rounded border border-[var(--border)] bg-[var(--bg-surface)]">
        <input
          checked={checked}
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        {checked ? <Check aria-hidden className="size-3 text-[var(--primary)]" strokeWidth={2.5} /> : null}
      </span>
      {label}
    </label>
  );
}

function StatusPill({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon: LucideIcon;
}) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-[var(--badge-soon-bg)] px-2.5 text-[11px] font-medium text-[var(--text-primary)]">
      <Icon aria-hidden className="size-3" strokeWidth={2} />
      {children}
    </span>
  );
}

function LargeBatchDialog({
  quantity,
  text,
  generateLabel,
  onCancel,
  onConfirm,
}: {
  quantity: number;
  text: {
    largeTitle: string;
    largeBody: (quantity: string) => string;
    cancel: string;
  };
  generateLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      aria-labelledby="large-batch-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
    >
      <div className="w-full max-w-[420px] rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
        <div className="flex items-start gap-3 border-b border-[var(--border)] p-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[var(--warning-bg)] text-[var(--warning)]">
            <Info aria-hidden className="size-4" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h2 id="large-batch-title" className="text-[15px] font-semibold text-[var(--text-primary)]">
              {text.largeTitle}
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">
              {text.largeBody(quantity.toLocaleString())}
            </p>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 p-4 sm:flex-row sm:justify-end">
          <Button className="w-full sm:w-auto" onClick={onCancel} variant="outline">
            {text.cancel}
          </Button>
          <Button className="w-full sm:w-auto" onClick={onConfirm}>
            <Play aria-hidden className="size-3.5 fill-current" strokeWidth={2} />
            {generateLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
