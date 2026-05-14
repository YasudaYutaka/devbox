"use client";

import { useMemo, useState } from "react";
import { CodeXml, Copy, Play, Trash2 } from "lucide-react";
import { Breadcrumbs, Button, Card, PageTitle } from "./primitives";
import { DevBoxShell } from "./shell";
import { useLanguage } from "./language";
import { getLabels } from "./translations";

const starterHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Preview</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: Inter, system-ui, sans-serif;
        color: #172b4d;
        background: #f4f5f7;
      }

      main {
        width: min(560px, calc(100% - 32px));
        padding: 32px;
        border: 1px solid #dfe1e6;
        border-radius: 8px;
        background: white;
        box-shadow: 0 10px 32px rgba(9, 30, 66, 0.12);
      }

      h1 {
        margin: 0 0 12px;
        font-size: 28px;
      }

      p {
        margin: 0;
        line-height: 1.6;
        color: #6b778c;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Hello, DevBox</h1>
      <p>Edit this HTML, then render it in the preview pane.</p>
    </main>
  </body>
</html>`;

export function HtmlPreviewPage() {
  const { locale } = useLanguage();
  const labels = getLabels(locale);
  const pageText =
    locale === "pt"
      ? {
          section: "Formatadores e Validadores",
          title: "Prévia de HTML",
          subtitle: "Edite marcação e inspecione uma prévia renderizada.",
          input: "HTML de entrada",
          preview: "Prévia",
          render: "Renderizar",
          emptyPreview: "Renderize HTML para ver a prévia aqui.",
          copyFailed: "Não foi possível copiar. Selecione o HTML e copie manualmente.",
        }
      : {
          section: "Formatters & Validators",
          title: "HTML Preview",
          subtitle: "Edit markup and inspect a rendered preview.",
          input: "Input HTML",
          preview: "Preview",
          render: "Render",
          emptyPreview: "Render HTML to see the preview here.",
          copyFailed: "Copy failed. Select the HTML and copy it manually.",
        };
  const [source, setSource] = useState(starterHtml);
  const [renderedHtml, setRenderedHtml] = useState(starterHtml);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const iframeTitle = useMemo(() => `${pageText.title} ${pageText.preview}`, [pageText.title, pageText.preview]);

  function handleRender() {
    setRenderedHtml(source);
    setError("");
  }

  function handleClear() {
    setSource("");
    setRenderedHtml("");
    setNotice("");
    setError("");
  }

  async function handleCopy() {
    if (!source) return;

    try {
      await navigator.clipboard.writeText(source);
      setNotice(labels.common.copied);
      setError("");
      window.setTimeout(() => setNotice(""), 1600);
    } catch {
      setNotice("");
      setError(pageText.copyFailed);
    }
  }

  return (
    <DevBoxShell active="html-preview">
      <Breadcrumbs
        items={[
          { label: "DevBox", href: "/" },
          { label: pageText.section },
          { label: pageText.title },
        ]}
      />
      <PageTitle
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleRender}>
              <Play aria-hidden className="size-3.5 fill-current" strokeWidth={2} />
              {pageText.render}
            </Button>
            <Button disabled={!source} onClick={handleCopy} variant="outline">
              <Copy aria-hidden className="size-3.5" strokeWidth={2} />
              {labels.common.copy}
            </Button>
            <Button onClick={handleClear} variant="ghost">
              <Trash2 aria-hidden className="size-3.5" strokeWidth={2} />
              {labels.common.clear}
            </Button>
          </div>
        }
        subtitle={pageText.subtitle}
        title={pageText.title}
      />
      <div className="grid min-h-[620px] gap-4 lg:grid-cols-2">
        <Card className="flex min-h-[420px] flex-col">
          <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <CodeXml aria-hidden className="size-4 shrink-0 text-[var(--primary)]" strokeWidth={2} />
              <h2 className="truncate text-[13px] font-semibold text-[var(--text-primary)]">
                {pageText.input}
              </h2>
            </div>
            {notice ? <span className="text-[11px] text-[var(--success)]">{notice}</span> : null}
          </div>
          <textarea
            aria-label={pageText.input}
            className="min-h-0 flex-1 resize-none bg-transparent p-4 font-mono text-xs leading-[1.6] text-[var(--text-primary)] outline-none"
            onChange={(event) => {
              setSource(event.target.value);
              setError("");
              setNotice("");
            }}
            spellCheck={false}
            value={source}
          />
        </Card>

        <Card className="flex min-h-[420px] flex-col">
          <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--bg-page)] px-4 py-3">
            <h2 className="text-[13px] font-semibold text-[var(--text-primary)]">{pageText.preview}</h2>
            <span className="text-[11px] text-[var(--text-secondary)]">
              {renderedHtml ? labels.common.ready : labels.common.waiting}
            </span>
          </div>
          <div className="min-h-0 flex-1 bg-[var(--bg-page)] p-4">
            {renderedHtml ? (
              <iframe
                className="h-full min-h-[380px] w-full rounded-md border border-[var(--border)] bg-white"
                sandbox="allow-forms allow-modals allow-popups allow-scripts"
                srcDoc={renderedHtml}
                title={iframeTitle}
              />
            ) : (
              <div className="flex h-full min-h-[380px] items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-6 text-center text-xs text-[var(--text-secondary)]">
                {pageText.emptyPreview}
              </div>
            )}
          </div>
        </Card>
      </div>
      {error ? <p className="text-[12px] font-medium text-[var(--error)]">{error}</p> : null}
      {renderedHtml !== source ? (
        <p className="text-[12px] text-[var(--text-secondary)]">
          {locale === "pt" ? "Há alterações não renderizadas." : "There are unrendered changes."}
        </p>
      ) : null}
    </DevBoxShell>
  );
}
