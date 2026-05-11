"use client";

import { useRef, useState } from "react";
import NextImage from "next/image";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Copy,
  FileImage,
  Loader2,
  ScanText,
  Trash2,
  Upload,
} from "lucide-react";
import { Breadcrumbs, Button, Card, PageTitle, cx } from "./primitives";
import { DevBoxShell } from "./shell";

const TESSERACT_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
const MAX_FILE_SIZE = 12 * 1024 * 1024;
const MAX_OCR_SIDE = 1800;
const MIN_TEXT_SIDE = 900;
const OCR_LANGUAGE: Language = "por+eng";
const OCR_PSM: SegmentationMode = "6";
const OCR_FORMAT: ExtractionFormat = "free";
const SHOULD_AUTO_CROP = true;
const SHOULD_BINARIZE = true;
const OCR_ROTATION = 0;

type TesseractProgress = {
  status?: string;
  progress?: number;
};

type OcrWord = {
  text?: string;
  confidence?: number;
};

type OcrData = {
  text?: string;
  confidence?: number;
  words?: OcrWord[];
};

type TesseractWorker = {
  load?: () => Promise<void>;
  loadLanguage?: (language: string) => Promise<void>;
  initialize?: (language: string, oem?: number) => Promise<void>;
  setParameters?: (parameters: Record<string, string>) => Promise<void>;
  recognize: (image: string | HTMLCanvasElement) => Promise<{ data: OcrData }>;
  terminate: () => Promise<void>;
};

type TesseractApi = {
  createWorker?: (...args: unknown[]) => Promise<TesseractWorker>;
  recognize?: (
    image: string | HTMLCanvasElement,
    language: string,
    options?: Record<string, unknown>,
  ) => Promise<{ data: OcrData }>;
  OEM?: { LSTM_ONLY?: number };
};

declare global {
  interface Window {
    Tesseract?: TesseractApi;
  }
}

type Language = "eng" | "por" | "por+eng";
type SegmentationMode = "6" | "7" | "8" | "11";
type ExtractionFormat = "free" | "numbers" | "uuid" | "currency" | "date" | "email" | "code";

type QualityReport = {
  score: number;
  warnings: string[];
  metrics: {
    resolution: string;
    contrast: string;
    sharpness: string;
  };
};

type ProcessedImage = {
  dataUrl: string;
  previewUrl: string;
  quality: QualityReport;
  sizeLabel: string;
};

type OcrResult = {
  raw: string;
  confidence: number;
  confidenceLabel: "High" | "Medium" | "Low";
  validationMessage: string;
  words: number;
};

const formatOptions: Array<{
  value: ExtractionFormat;
  label: string;
  whitelist?: string;
  pattern?: RegExp;
}> = [
  { value: "free", label: "Free text" },
  { value: "numbers", label: "Numbers", whitelist: "0123456789.,-+ " },
  {
    value: "uuid",
    label: "UUID",
    whitelist: "0123456789abcdefABCDEF-",
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  },
  {
    value: "currency",
    label: "Currency",
    whitelist: "0123456789.,$R€£¥ -",
    pattern: /^(?:R\$|\$|€|£|¥)?\s?-?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?$/,
  },
  {
    value: "date",
    label: "Date",
    whitelist: "0123456789/-.",
    pattern: /^(?:\d{2}[/-]\d{2}[/-]\d{4}|\d{4}-\d{2}-\d{2}|\d{2}\.\d{2}\.\d{4})$/,
  },
  {
    value: "email",
    label: "Email",
    whitelist: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@._+-",
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  {
    value: "code",
    label: "Code / ID",
    whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_./:#",
  },
];

let tesseractPromise: Promise<TesseractApi> | null = null;

export function TextExtractorPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");
    setResult(null);
    setProgress(0);
    setStatus("");

    if (!file.type.startsWith("image/")) {
      setError("Unsupported file type. Upload a PNG, JPEG, WebP, GIF, or BMP image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("The image is too large. Use an image under 12 MB or crop it first.");
      return;
    }

    try {
      const image = await loadImage(file);
      const next = preprocessImage(image, {
        autoCrop: SHOULD_AUTO_CROP,
        binarize: SHOULD_BINARIZE,
        rotation: OCR_ROTATION,
      });
      setFileName(file.name);
      setProcessed(next);
      if (next.quality.warnings.length > 0) {
        setStatus("Image loaded with quality warnings. OCR can run, but results may need review.");
      } else {
        setStatus("Image preprocessed and ready for OCR.");
      }
    } catch {
      setError("Could not read that image. Try another file or export it as PNG/JPEG.");
    }
  }

  async function runOcr() {
    if (!processed) {
      setError("Attach or paste an image before running OCR.");
      return;
    }

    setError("");
    setIsProcessing(true);
    setProgress(0.05);
    setStatus("Loading Tesseract OCR worker...");

    let worker: TesseractWorker | null = null;

    try {
      const Tesseract = await loadTesseract();
      const selectedFormat = formatOptions.find((item) => item.value === OCR_FORMAT);
      const parameters: Record<string, string> = {
        tessedit_pageseg_mode: OCR_PSM,
        tessedit_ocr_engine_mode: "1",
      };

      if (selectedFormat?.whitelist) {
        parameters.tessedit_char_whitelist = selectedFormat.whitelist;
      }

      const logger = (message: TesseractProgress) => {
        if (message.status) setStatus(titleCase(message.status));
        if (typeof message.progress === "number") {
          setProgress(Math.max(0.05, Math.min(0.98, message.progress)));
        }
      };

      if (Tesseract.createWorker) {
        worker = await createTesseractWorker(Tesseract, OCR_LANGUAGE, logger);
        if (worker.setParameters) {
          await worker.setParameters(parameters);
        }
        const response = await worker.recognize(processed.dataUrl);
        setResult(buildResult(response.data, OCR_FORMAT));
      } else if (Tesseract.recognize) {
        const response = await Tesseract.recognize(processed.dataUrl, OCR_LANGUAGE, {
          logger,
          ...parameters,
        });
        setResult(buildResult(response.data, OCR_FORMAT));
      } else {
        throw new Error("Missing Tesseract API");
      }

      setProgress(1);
      setStatus("OCR complete.");
    } catch {
      setError("Tesseract could not initialize or process this image. Try a smaller, clearer image.");
      setStatus("");
    } finally {
      if (worker) await worker.terminate();
      setIsProcessing(false);
    }
  }

  function clearAll() {
    setFileName("");
    setProcessed(null);
    setResult(null);
    setError("");
    setStatus("");
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied to clipboard.");
    } catch {
      setError("Could not copy text. Select the output manually and copy it.");
    }
  }

  return (
    <DevBoxShell active="text-extractor">
      <Breadcrumbs
        items={[{ label: "DevBox", href: "/" }, { label: "Text Tools" }, { label: "Text Extractor" }]}
      />
      <PageTitle
        title="Text Extractor"
        subtitle="Extract readable text from pasted or attached images."
      />

      <Card className="min-h-[620px]">
        <div className="flex min-h-14 flex-col gap-3 border-b border-[var(--border)] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <ScanText aria-hidden className="size-4 shrink-0 text-[var(--primary)]" strokeWidth={2} />
            <h2 className="truncate text-[15px] font-semibold text-[var(--text-primary)]">
              Image to Text
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => inputRef.current?.click()}>
              <Upload aria-hidden className="size-3.5" strokeWidth={2} />
              Attach file
            </Button>
            <Button onClick={clearAll} variant="outline">
              <Trash2 aria-hidden className="size-3.5" strokeWidth={2} />
              Clear
            </Button>
          </div>
        </div>

        <div className="flex min-h-[560px] flex-col gap-5 p-6">
          <section className="flex min-w-0 flex-col gap-4">
            <input
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }}
              ref={inputRef}
              type="file"
            />

            <button
              className="flex min-h-[260px] w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-hover)] p-7 text-center transition-colors hover:border-[var(--primary)]"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const file = event.dataTransfer.files?.[0];
                if (file) void handleFile(file);
              }}
              onPaste={(event) => {
                const file = Array.from(event.clipboardData.files).find((item) =>
                  item.type.startsWith("image/"),
                );
                if (file) void handleFile(file);
              }}
              type="button"
            >
              {processed ? (
                <NextImage
                  alt="Preprocessed OCR preview"
                  className="max-h-[220px] max-w-full rounded-md border border-[var(--border)] bg-white object-contain"
                  height={600}
                  src={processed.previewUrl}
                  unoptimized
                  width={900}
                />
              ) : (
                <>
                  <span className="flex size-12 items-center justify-center rounded-lg bg-[var(--bg-surface)] text-[var(--primary)] shadow-sm">
                    <FileImage aria-hidden className="size-6" strokeWidth={2} />
                  </span>
                  <span className="flex max-w-[360px] flex-col gap-1">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      Drop, paste, or attach an image
                    </span>
                    <span className="text-xs leading-5 text-[var(--text-secondary)]">
                      The image is cropped to the detected text area, resized, converted to grayscale,
                      contrast-adjusted, denoised, and binarized before OCR.
                    </span>
                  </span>
                </>
              )}
            </button>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[var(--text-primary)]">
                    {fileName || "No image attached"}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {processed ? `${processed.sizeLabel} after preprocessing` : "PNG, JPEG, WebP, GIF, BMP"}
                  </p>
                </div>
                <QualityPill report={processed?.quality ?? null} />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <ProgressMessage
                error={error}
                processed={processed}
                progress={progress}
                result={result}
                status={status}
              />
              <Button disabled={isProcessing || !processed} onClick={() => void runOcr()}>
                {isProcessing ? (
                  <Loader2 aria-hidden className="size-3.5 animate-spin" strokeWidth={2} />
                ) : (
                  <ScanText aria-hidden className="size-3.5" strokeWidth={2} />
                )}
                Extract text
              </Button>
            </div>
          </section>

          <section className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Clipboard
                  aria-hidden
                  className="size-4 shrink-0 text-[var(--text-secondary)]"
                  strokeWidth={2}
                />
                <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  Extracted text
                </h3>
              </div>
              <OutputHeader result={result} />
            </div>

            <div className="flex min-h-[300px] flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] p-4">
              <textarea
                aria-label="Raw OCR output"
                className="min-h-[150px] flex-1 resize-none bg-transparent font-mono text-sm leading-[1.6] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                placeholder="Extracted text will appear here after an image is processed."
                readOnly
                value={result?.raw ?? ""}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[var(--text-secondary)]">
                {result ? `${result.raw.length} characters / ${result.words} words` : "0 characters / 0 words"}
              </span>
              <div className="flex gap-2">
                <Button
                  disabled={!result?.raw}
                  onClick={() => result && void copyText(result.raw)}
                  variant="outline"
                >
                  <Copy aria-hidden className="size-3.5" strokeWidth={2} />
                  Copy text
                </Button>
              </div>
            </div>
          </section>
        </div>
      </Card>
    </DevBoxShell>
  );
}

function QualityPill({ report }: { report: QualityReport | null }) {
  if (!report) {
    return (
      <span className="rounded-full bg-[var(--badge-soon-bg)] px-2.5 py-1 text-[11px] font-medium text-[var(--badge-soon-text)]">
        Waiting
      </span>
    );
  }

  const poor = report.score < 70;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        poor ? "bg-[var(--warning-bg)] text-[var(--warning)]" : "bg-[var(--success-bg)] text-[var(--success)]",
      )}
      title={`${report.metrics.resolution}, ${report.metrics.contrast}, ${report.metrics.sharpness}`}
    >
      {poor ? (
        <AlertTriangle aria-hidden className="size-3" strokeWidth={2} />
      ) : (
        <CheckCircle2 aria-hidden className="size-3" strokeWidth={2} />
      )}
      Quality {report.score}
    </span>
  );
}

function OutputHeader({ result }: { result: OcrResult | null }) {
  if (!result) {
    return (
      <span className="rounded-full bg-[var(--badge-soon-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
        Ready
      </span>
    );
  }

  const isLow = result.confidenceLabel === "Low";
  const isMedium = result.confidenceLabel === "Medium";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap gap-2">
        <span
          className={cx(
            "rounded-full px-2.5 py-1 text-[11px] font-medium",
            isLow
              ? "bg-[var(--error-bg)] text-[var(--error)]"
              : isMedium
                ? "bg-[var(--warning-bg)] text-[var(--warning)]"
                : "bg-[var(--success-bg)] text-[var(--success)]",
          )}
        >
          {result.confidenceLabel} confidence ({Math.round(result.confidence)}%)
        </span>
        <span className="rounded-full bg-[var(--bg-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]">
          {result.words} words
        </span>
      </div>
      <span className="text-xs text-[var(--text-secondary)]">{result.validationMessage}</span>
    </div>
  );
}

function ProgressMessage({
  error,
  processed,
  progress,
  result,
  status,
}: {
  error: string;
  processed: ProcessedImage | null;
  progress: number;
  result: OcrResult | null;
  status: string;
}) {
  if (error) {
    return (
      <p className="flex items-center gap-2 text-xs text-[var(--error)]">
        <AlertTriangle aria-hidden className="size-3.5 shrink-0" strokeWidth={2} />
        {error}
      </p>
    );
  }

  const warnings = processed?.quality.warnings ?? [];
  const resultWarning =
    result && result.confidence < 85
      ? "Review before trusting this result. Upload a clearer image if important text looks wrong."
      : "";

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {progress > 0 && progress < 1 ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border-light)]">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-all"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      ) : null}
      <p className="truncate text-xs text-[var(--text-secondary)]">
        {resultWarning || warnings[0] || status || "Attach an image to begin."}
      </p>
    </div>
  );
}

async function createTesseractWorker(
  Tesseract: TesseractApi,
  language: Language,
  logger: (message: TesseractProgress) => void,
) {
  if (!Tesseract.createWorker) {
    throw new Error("Tesseract worker unavailable");
  }

  try {
    return await Tesseract.createWorker(language, Tesseract.OEM?.LSTM_ONLY ?? 1, { logger });
  } catch {
    const worker = await Tesseract.createWorker({ logger });
    if (worker.load) await worker.load();
    if (worker.loadLanguage) await worker.loadLanguage(language);
    if (worker.initialize) await worker.initialize(language, Tesseract.OEM?.LSTM_ONLY ?? 1);
    return worker;
  }
}

function loadTesseract() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Tesseract is browser-only"));
  }

  if (window.Tesseract) {
    return Promise.resolve(window.Tesseract);
  }

  if (!tesseractPromise) {
    tesseractPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${TESSERACT_URL}"]`);
      const script = existing ?? document.createElement("script");

      script.addEventListener("load", () => {
        if (window.Tesseract) resolve(window.Tesseract);
        else reject(new Error("Tesseract failed to load"));
      });
      script.addEventListener("error", () => reject(new Error("Tesseract failed to load")));

      if (!existing) {
        script.src = TESSERACT_URL;
        script.async = true;
        document.head.appendChild(script);
      }
    });
  }

  return tesseractPromise;
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };
    image.src = url;
  });
}

function preprocessImage(
  image: HTMLImageElement,
  options: { autoCrop: boolean; binarize: boolean; rotation: number },
): ProcessedImage {
  const rotated = drawRotated(image, options.rotation);
  const sourceContext = rotated.getContext("2d", { willReadFrequently: true });
  if (!sourceContext) throw new Error("Canvas unavailable");

  const sourceData = sourceContext.getImageData(0, 0, rotated.width, rotated.height);
  const crop = options.autoCrop ? detectTextBounds(sourceData) : null;
  const cropWidth = crop ? crop.width : rotated.width;
  const cropHeight = crop ? crop.height : rotated.height;
  const longest = Math.max(cropWidth, cropHeight);
  const shortest = Math.min(cropWidth, cropHeight);
  const maxScale = longest > MAX_OCR_SIDE ? MAX_OCR_SIDE / longest : 1;
  const minScale = shortest < MIN_TEXT_SIDE ? Math.min(2.25, MIN_TEXT_SIDE / Math.max(1, shortest)) : 1;
  const scale = Math.min(maxScale, minScale);
  const outputWidth = Math.max(1, Math.round(cropWidth * scale));
  const outputHeight = Math.max(1, Math.round(cropHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas unavailable");

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    rotated,
    crop?.x ?? 0,
    crop?.y ?? 0,
    cropWidth,
    cropHeight,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  const imageData = context.getImageData(0, 0, outputWidth, outputHeight);
  const quality = analyzeQuality(imageData, outputWidth, outputHeight);
  enhanceImageData(imageData, options.binarize);
  context.putImageData(imageData, 0, 0);

  return {
    dataUrl: canvas.toDataURL("image/png"),
    previewUrl: canvas.toDataURL("image/png"),
    quality,
    sizeLabel: `${outputWidth} x ${outputHeight}px`,
  };
}

function drawRotated(image: HTMLImageElement, rotation: number) {
  const normalized = ((rotation % 360) + 360) % 360;
  const swap = normalized === 90 || normalized === 270;
  const canvas = document.createElement("canvas");
  canvas.width = swap ? image.naturalHeight : image.naturalWidth;
  canvas.height = swap ? image.naturalWidth : image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");

  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((normalized * Math.PI) / 180);
  context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  return canvas;
}

function detectTextBounds(imageData: ImageData) {
  const { data, width, height } = imageData;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let hits = 0;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const index = (y * width + x) * 4;
      const luminance = getLuminance(data[index], data[index + 1], data[index + 2]);
      if (luminance < 235) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        hits++;
      }
    }
  }

  if (hits < 40) return null;

  const pad = 18;
  const x = Math.max(0, minX - pad);
  const y = Math.max(0, minY - pad);
  const right = Math.min(width, maxX + pad);
  const bottom = Math.min(height, maxY + pad);

  if (right - x < width * 0.08 || bottom - y < height * 0.08) return null;
  return { x, y, width: right - x, height: bottom - y };
}

function enhanceImageData(imageData: ImageData, binarize: boolean) {
  const { data } = imageData;
  let sum = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {
    const gray = getLuminance(data[i], data[i + 1], data[i + 2]);
    sum += gray;
    count++;
  }

  const mean = sum / Math.max(1, count);
  const contrast = 1.35;

  for (let i = 0; i < data.length; i += 4) {
    const gray = getLuminance(data[i], data[i + 1], data[i + 2]);
    let value = clamp((gray - mean) * contrast + mean);
    if (binarize) {
      value = value > mean - 8 ? 255 : 0;
    }
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
}

function analyzeQuality(imageData: ImageData, width: number, height: number): QualityReport {
  const { data } = imageData;
  const gray = new Uint8ClampedArray(width * height);
  let sum = 0;
  let bright = 0;
  let dark = 0;

  for (let i = 0; i < gray.length; i++) {
    const index = i * 4;
    const value = getLuminance(data[index], data[index + 1], data[index + 2]);
    gray[i] = value;
    sum += value;
    if (value > 245) bright++;
    if (value < 30) dark++;
  }

  const mean = sum / Math.max(1, gray.length);
  let variance = 0;
  for (let i = 0; i < gray.length; i++) {
    variance += (gray[i] - mean) ** 2;
  }
  const contrast = Math.sqrt(variance / Math.max(1, gray.length));
  const sharpness = laplacianVariance(gray, width, height);
  const warnings: string[] = [];

  if (width < 600 || height < 220) warnings.push("Low resolution can make small characters unreadable.");
  if (contrast < 32) warnings.push("Low contrast detected. A clearer image may improve OCR.");
  if (sharpness < 85) warnings.push("The image may be blurry. Upload a sharper capture if possible.");
  if (bright / gray.length > 0.28) warnings.push("Bright glare or washed-out areas may hide text.");
  if (dark / gray.length > 0.35) warnings.push("Heavy shadows or dark areas may reduce accuracy.");

  const score = clamp(
    100 -
      (width < 600 || height < 220 ? 18 : 0) -
      Math.max(0, 32 - contrast) * 0.7 -
      Math.max(0, 85 - sharpness) * 0.18 -
      (bright / gray.length > 0.28 ? 10 : 0) -
      (dark / gray.length > 0.35 ? 10 : 0),
  );

  return {
    score: Math.round(score),
    warnings,
    metrics: {
      resolution: `${width} x ${height}px`,
      contrast: `contrast ${Math.round(contrast)}`,
      sharpness: `sharpness ${Math.round(sharpness)}`,
    },
  };
}

function laplacianVariance(gray: Uint8ClampedArray, width: number, height: number) {
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  const step = Math.max(1, Math.floor(Math.min(width, height) / 500));

  for (let y = 1; y < height - 1; y += step) {
    for (let x = 1; x < width - 1; x += step) {
      const center = gray[y * width + x] * 4;
      const value =
        center -
        gray[(y - 1) * width + x] -
        gray[(y + 1) * width + x] -
        gray[y * width + x - 1] -
        gray[y * width + x + 1];
      sum += value;
      sumSq += value * value;
      count++;
    }
  }

  const mean = sum / Math.max(1, count);
  return sumSq / Math.max(1, count) - mean * mean;
}

function buildResult(data: OcrData, format: ExtractionFormat): OcrResult {
  const raw = (data.text ?? "").trim();
  const cleaned = cleanText(raw, format);
  const wordConfidences =
    data.words
      ?.map((word) => word.confidence)
      .filter((confidence): confidence is number => typeof confidence === "number" && confidence >= 0) ?? [];
  const confidence =
    typeof data.confidence === "number" && data.confidence >= 0
      ? data.confidence
      : average(wordConfidences);
  const selectedFormat = formatOptions.find((item) => item.value === format);
  const confidenceLabel = confidence >= 85 ? "High" : confidence >= 65 ? "Medium" : "Low";
  const validationMessage = validateCleanedText(cleaned, selectedFormat);

  return {
    raw,
    confidence,
    confidenceLabel,
    validationMessage,
    words: raw.trim() ? raw.trim().split(/\s+/).length : 0,
  };
}

function cleanText(raw: string, format: ExtractionFormat) {
  let text = raw
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (format !== "free") {
    text = text.replace(/\s+/g, " ").trim();
  }

  if (format === "numbers" || format === "currency" || format === "date") {
    text = text.replace(/[Oo]/g, "0").replace(/[Il|]/g, "1");
  }

  if (format === "uuid") {
    text = text.replace(/[Oo]/g, "0").replace(/\s+/g, "").toLowerCase();
  }

  if (format === "email") {
    text = text.replace(/\s+/g, "").replace(/\(at\)/gi, "@").replace(/\(dot\)/gi, ".").toLowerCase();
  }

  return text;
}

function validateCleanedText(
  cleaned: string,
  selectedFormat: (typeof formatOptions)[number] | undefined,
) {
  if (!cleaned) return "No text found";
  if (!selectedFormat?.pattern) return "Ready to review";
  return selectedFormat.pattern.test(cleaned) ? "Format validated" : "Format needs review";
}

function getLuminance(red: number, green: number, blue: number) {
  return 0.299 * red + 0.587 * green + 0.114 * blue;
}

function clamp(value: number) {
  return Math.max(0, Math.min(255, value));
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
