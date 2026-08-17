"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Copy, Download, Plus, Tag, Trash2, Upload } from "lucide-react";
import { useLanguage } from "./language";
import { DevBoxShell } from "./shell";
import { Badge, Breadcrumbs, PageTitle, cx } from "./primitives";
import { getLabels } from "./translations";

type Snippet = {
  id: string;
  title: string;
  tag: string;
  body: string;
  updatedAt: number;
};

const STORAGE_KEY = "devbox-snippets";
const PAGE_SIZE = 5;


function persist(entries: Snippet[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

type DateStrings = { justNow: string; mAgo: string; hAgo: string; dAgo: string };

function relDate(ts: number, ds: DateStrings): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return ds.justNow;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}${ds.mAgo}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}${ds.hAgo}`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}${ds.dAgo}`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function SnippetsPage() {
  const { locale } = useLanguage();
  const t = getLabels(locale).snippets;
  const [entries, setEntries] = useState<Snippet[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ title: string; tag: string; body: string } | null>(null);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [page, setPage] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setPage(1); }, [query, activeTag]);

  useEffect(() => {
    let loaded: Snippet[] | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) loaded = JSON.parse(raw);
    } catch {}
    if (!Array.isArray(loaded)) loaded = [];
    loaded.sort((a, b) => b.updatedAt - a.updatedAt);
    setEntries(loaded);
    const first = loaded[0] ?? null;
    setSelectedId(first?.id ?? null);
    setDraft(first ? { title: first.title, tag: first.tag, body: first.body } : null);
  }, []);

  function selectSnippet(id: string) {
    const e = entries.find((e) => e.id === id);
    if (!e) return;
    setSelectedId(id);
    setDraft({ title: e.title, tag: e.tag, body: e.body });
  }

  function updateEntries(next: Snippet[]) {
    next.sort((a, b) => b.updatedAt - a.updatedAt);
    persist(next);
    setEntries(next);
  }

  function onSave() {
    if (!selectedId || !draft) return;
    const next = entries.map((e) =>
      e.id === selectedId ? { ...e, ...draft, updatedAt: Date.now() } : e,
    );
    updateEntries(next);
  }

  function onNew() {
    const id = "s" + Date.now();
    const entry: Snippet = { id, title: "", tag: "", body: "", updatedAt: Date.now() };
    const next = [entry, ...entries];
    persist(next);
    setEntries(next);
    setSelectedId(id);
    setDraft({ title: "", tag: "", body: "" });
    setQuery("");
  }

  function onDelete() {
    if (!selectedId) return;
    const next = entries.filter((e) => e.id !== selectedId);
    persist(next);
    setEntries(next);
    const first = next[0] ?? null;
    setSelectedId(first?.id ?? null);
    setDraft(first ? { title: first.title, tag: first.tag, body: first.body } : null);
    setConfirmDelete(false);
  }

  async function onCopy() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft.body);
    } catch {}
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 1500);
  }

  function onExport() {
    const data = JSON.stringify(entries, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "devbox-snippets.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function onImportChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed)) return;
        const byId: Record<string, Snippet> = {};
        [...entries, ...parsed].forEach((e) => {
          if (e && e.id) {
            byId[e.id] = {
              id: e.id,
              title: e.title || "",
              tag: e.tag || "",
              body: e.body || "",
              updatedAt: e.updatedAt || Date.now(),
            };
          }
        });
        const next = Object.values(byId).sort((a, b) => b.updatedAt - a.updatedAt);
        persist(next);
        setEntries(next);
        const first = next[0] ?? null;
        setSelectedId(first?.id ?? null);
        setDraft(first ? { title: first.title, tag: first.tag, body: first.body } : null);
      } catch {}
    };
    reader.readAsText(file);
    ev.target.value = "";
  }

  const q = query.trim().toLowerCase();
  const filtered = entries.filter((e) => {
    if (activeTag && (e.tag || "") !== activeTag) return false;
    if (!q) return true;
    return (
      (e.title || "").toLowerCase().includes(q) ||
      (e.body || "").toLowerCase().includes(q) ||
      (e.tag || "").toLowerCase().includes(q)
    );
  });

  const uniqueTags = Array.from(new Set(entries.map((e) => e.tag).filter(Boolean))).sort();

  const sel = entries.find((e) => e.id === selectedId) ?? null;
  const bodyLen = draft ? draft.body.length : 0;
  const lineCount = draft ? draft.body.split("\n").length : 0;
  const isDirty =
    !!sel &&
    !!draft &&
    (draft.title !== sel.title || draft.tag !== sel.tag || draft.body !== sel.body);

  const countLabel =
    entries.length +
    " " +
    (entries.length === 1 ? t.snippet : t.snippets) +
    (q || activeTag ? ` · ${filtered.length} ${t.shown}` : "");

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const paginated = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  return (
    <DevBoxShell active="snippets">
      <Breadcrumbs
        items={[
          { label: "DevBox", href: "/" },
          { label: t.breadcrumbProductivity },
          { label: "Snippets" },
        ]}
      />

      <PageTitle
        title="Snippets"
        subtitle={t.subtitle}
        action={
          <div className="flex items-center gap-2">
            <Badge>{entries.length} {t.storedLocally}</Badge>
            <input
              accept="application/json,.json"
              onChange={onImportChange}
              ref={fileRef}
              style={{ display: "none" }}
              type="file"
            />
            <button
              className="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              onClick={() => fileRef.current?.click()}
              type="button"
            >
              <Upload aria-hidden className="size-3.5" />
              {t.import}
            </button>
            <button
              className="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              onClick={onExport}
              type="button"
            >
              <Download aria-hidden className="size-3.5" />
              {t.export}
            </button>
            <button
              className="inline-flex h-[34px] items-center gap-1.5 rounded-md border-none bg-[var(--primary)] px-3 text-xs font-semibold text-[var(--text-on-primary)] hover:bg-[var(--primary-hover)]"
              onClick={onNew}
              type="button"
            >
              <Plus aria-hidden className="size-3.5" strokeWidth={2.4} />
              {t.newSnippet}
            </button>
          </div>
        }
      />

      {/* Two-panel layout */}
      <div className="grid min-h-[600px] gap-4 lg:grid-cols-[340px_1fr]">
        {/* LEFT: list */}
        <section className="flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-2.5 border-b border-[var(--border)] p-3">
            <div className="flex h-[34px] items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-page)] px-2.5">
              <svg
                aria-hidden
                className="size-3.5 shrink-0 text-[var(--text-muted)]"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                className="min-w-0 flex-1 bg-transparent text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                spellCheck={false}
                value={query}
              />
            </div>

            {uniqueTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  className={cx(
                    "rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium",
                    activeTag === null
                      ? "border-[var(--primary)] bg-[var(--bg-active)] text-[var(--primary)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]",
                  )}
                  onClick={() => setActiveTag(null)}
                  type="button"
                >
                  {t.tagAll}
                </button>
                {uniqueTags.map((t) => (
                  <button
                    className={cx(
                      "rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium",
                      activeTag === t
                        ? "border-[var(--primary)] bg-[var(--bg-active)] text-[var(--primary)]"
                        : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]",
                    )}
                    key={t}
                    onClick={() => setActiveTag(activeTag === t ? null : t)}
                    type="button"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--text-muted)]">
                {countLabel}
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">{t.sortedByRecent}</span>
            </div>
          </div>

          <div className="flex-1">
            {paginated.map((e) => {
              const isSel = e.id === selectedId;
              return (
                <button
                  className={cx(
                    "flex w-full items-stretch border-b border-[var(--border-light)] text-left",
                    isSel ? "bg-[var(--bg-active)]" : "bg-transparent hover:bg-[var(--bg-hover)]",
                  )}
                  key={e.id}
                  onClick={() => selectSnippet(e.id)}
                  type="button"
                >
                  <div
                    className={cx("w-[3px] shrink-0", isSel ? "bg-[var(--primary)]" : "")}
                  />
                  <div className="flex min-w-0 flex-col gap-1.5 px-3.5 py-3 text-left">
                    <span
                      className={cx(
                        "truncate text-[13px] font-semibold",
                        e.title
                          ? "text-[var(--text-primary)]"
                          : "text-[var(--text-muted)]",
                      )}
                    >
                      {e.title || t.untitled}
                    </span>
                    <span className="line-clamp-2 font-mono text-[11px] leading-relaxed text-[var(--text-muted)]">
                      {e.body.replace(/\s+/g, " ").trim() || t.bodyEmpty}
                    </span>
                    <div className="flex items-center gap-2">
                      {e.tag && (
                        <span className="rounded border border-[var(--border)] bg-[var(--bg-page)] px-1.5 py-px font-mono text-[10px] font-medium text-[var(--text-secondary)]">
                          {e.tag}
                        </span>
                      )}
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {relDate(e.updatedAt, t)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
            {(q || activeTag) && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-12 text-center">
                <span className="text-[13px] text-[var(--text-secondary)]">
                  {activeTag && q
                    ? t.noMatchTagQuery.replace("{tag}", activeTag).replace("{query}", query)
                    : activeTag
                      ? t.noMatchTag.replace("{tag}", activeTag)
                      : t.noMatchQuery.replace("{query}", query)}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {t.noMatchHint}
                </span>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[var(--border)] px-3 py-2">
              <button
                className="flex size-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] disabled:opacity-40 hover:enabled:bg-[var(--bg-hover)]"
                disabled={clampedPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                type="button"
              >
                <ChevronLeft aria-hidden className="size-3.5" />
              </button>
              <span className="text-[11px] text-[var(--text-muted)]">
                {t.pageOf.replace("{page}", String(clampedPage)).replace("{total}", String(totalPages))}
              </span>
              <button
                className="flex size-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] disabled:opacity-40 hover:enabled:bg-[var(--bg-hover)]"
                disabled={clampedPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                type="button"
              >
                <ChevronRight aria-hidden className="size-3.5" />
              </button>
            </div>
          )}
        </section>

        {/* RIGHT: editor */}
        <section className="flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          {sel ? (
            <div className="flex min-h-0 flex-1 flex-col">
              {/* editor header */}
              <div className="flex items-center gap-2.5 border-b border-[var(--border)] bg-[var(--bg-page)] px-3 py-2.5">
                <input
                  className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                  onChange={(e) => setDraft((d) => d && { ...d, title: e.target.value })}
                  placeholder={t.untitled}
                  spellCheck={false}
                  value={draft?.title ?? ""}
                />
                <button
                  className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 text-[11px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                  onClick={onCopy}
                  type="button"
                >
                  <Copy aria-hidden className="size-3" />
                  {copied ? t.copied : t.copy}
                </button>
                <button
                  className={cx(
                    "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-semibold transition-colors",
                    isDirty
                      ? "bg-[var(--primary)] text-[var(--text-on-primary)] hover:bg-[var(--primary-hover)]"
                      : "border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] cursor-default",
                  )}
                  disabled={!isDirty}
                  onClick={onSave}
                  type="button"
                >
                  {t.save}
                </button>
                <button
                  className="flex size-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--error)] hover:bg-[var(--error-bg)]"
                  onClick={() => setConfirmDelete(true)}
                  title="Delete snippet"
                  type="button"
                >
                  <Trash2 aria-hidden className="size-3.5" />
                </button>
              </div>

              {/* meta row */}
              <div className="flex flex-wrap items-center gap-2.5 border-b border-[var(--border)] bg-[var(--bg-page)] px-3 py-2">
                <div className="flex h-[26px] items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2">
                  <Tag aria-hidden className="size-3 text-[var(--text-secondary)]" />
                  <input
                    className="w-[120px] bg-transparent font-mono text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                    onChange={(e) => setDraft((d) => d && { ...d, tag: e.target.value })}
                    placeholder={t.tagPlaceholder}
                    spellCheck={false}
                    value={draft?.tag ?? ""}
                  />
                </div>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {t.updated} {relDate(sel.updatedAt, t)}
                </span>
                <div className="flex-1" />
                <span className="font-mono text-[11px] text-[var(--text-muted)]">
                  {bodyLen} {t.chars} · {lineCount} {lineCount === 1 ? t.line : t.lines}
                </span>
              </div>

              {/* body */}
              <textarea
                className="min-h-0 flex-1 resize-none border-none bg-[var(--bg-surface)] p-4 font-mono text-[13px] leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                onChange={(e) => setDraft((d) => d && { ...d, body: e.target.value })}
                placeholder={t.bodyPlaceholder}
                spellCheck={false}
                value={draft?.body ?? ""}
              />
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-12 text-center">
              <span className="text-sm text-[var(--text-secondary)]">{t.noSelection}</span>
              <span className="text-xs text-[var(--text-muted)]">{t.noSelectionHint}</span>
            </div>
          )}
        </section>
      </div>
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="flex w-[360px] flex-col gap-5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
                {t.deleteTitle}
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)]">
                &ldquo;{sel?.title || t.untitled}&rdquo; {t.deleteBodySuffix}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="inline-flex h-8 items-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                onClick={() => setConfirmDelete(false)}
                type="button"
              >
                {t.cancel}
              </button>
              <button
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[var(--error)] px-3 text-xs font-semibold text-white hover:opacity-90"
                onClick={onDelete}
                type="button"
              >
                <Trash2 aria-hidden className="size-3" />
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </DevBoxShell>
  );
}
