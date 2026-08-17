"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, Check, Download, ListTodo, Plus, Trash2, Upload, X } from "lucide-react";
import { useLanguage } from "./language";
import { DevBoxShell } from "./shell";
import { Badge, Breadcrumbs, PageTitle, cx } from "./primitives";
import { getLabels } from "./translations";

type Status = "todo" | "doing" | "done";
type Priority = "low" | "medium" | "high";

type Subtask = { id: string; text: string; done: boolean };

type Task = {
  id: string;
  title: string;
  notes: string;
  status: Status;
  priority: Priority;
  dueDate: string;
  tags: string[];
  order: number;
  createdAt: number;
  subtasks: Subtask[];
};

const STORAGE_KEY = "devbox-todos";
const STATUSES: Status[] = ["todo", "doing", "done"];
const PRIORITIES: Priority[] = ["low", "medium", "high"];

function persist(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {}
}

function newId(prefix: string) {
  return `${prefix}${Date.now()}`;
}

function nowTs() {
  return Date.now();
}

function normalize(raw: unknown, i: number): Task {
  const t = (raw ?? {}) as Partial<Task> & { done?: boolean };
  const status: Status = STATUSES.includes(t.status as Status)
    ? (t.status as Status)
    : t.done
      ? "done"
      : "todo";
  return {
    id: t.id || `t${Date.now()}${i}`,
    title: t.title || "",
    notes: t.notes || "",
    status,
    priority: PRIORITIES.includes(t.priority as Priority) ? (t.priority as Priority) : "medium",
    dueDate: t.dueDate || "",
    tags: Array.isArray(t.tags) ? t.tags.filter(Boolean) : [],
    order: typeof t.order === "number" ? t.order : i,
    createdAt: t.createdAt || Date.now(),
    subtasks: Array.isArray(t.subtasks)
      ? t.subtasks.map((s, j) => ({ id: s.id || `s${j}`, text: s.text || "", done: !!s.done }))
      : [],
  };
}

type DueInfo = { has: boolean; label?: string; tone?: "normal" | "soon" | "overdue" | "done" };

type TodoLabels = ReturnType<typeof getLabels>["todoBoard"];

function dueInfo(dueDate: string, done: boolean, t: TodoLabels): DueInfo {
  if (!dueDate) return { has: false };
  const due = new Date(`${dueDate}T00:00:00`);
  const now = new Date();
  const d0 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const d1 = Date.UTC(due.getFullYear(), due.getMonth(), due.getDate());
  const diff = Math.round((d1 - d0) / 86400000);
  let label: string;
  if (diff < 0) label = `${Math.abs(diff)}${t.overdueSuffix}`;
  else if (diff === 0) label = t.today;
  else if (diff === 1) label = t.tomorrow;
  else if (diff < 7) label = t.inDays.replace("{n}", String(diff));
  else label = due.toLocaleDateString(t.localeCode, { month: "short", day: "numeric" });
  let tone: DueInfo["tone"] = "normal";
  if (done) tone = "done";
  else if (diff < 0) tone = "overdue";
  else if (diff <= 1) tone = "soon";
  return { has: true, label, tone };
}

function dueBadgeClasses(tone?: DueInfo["tone"]) {
  if (tone === "overdue") return "bg-[var(--error-bg)] text-[var(--error)] border-transparent";
  if (tone === "soon") return "bg-[var(--warning-bg)] text-[var(--warning)] border-transparent";
  return "bg-[var(--badge-soon-bg)] text-[var(--text-secondary)] border-[var(--border)]";
}

function prioColorVar(p: Priority) {
  if (p === "high") return "var(--error)";
  if (p === "medium") return "var(--warning)";
  return "var(--text-muted)";
}

function prioBadgeClasses(p: Priority) {
  if (p === "high") return "text-[var(--error)] bg-[var(--error-bg)] border-transparent";
  if (p === "medium") return "text-[var(--warning)] bg-[var(--warning-bg)] border-transparent";
  return "text-[var(--text-muted)] bg-[var(--bg-page)] border-[var(--border)]";
}

function relCreated(ts: number, t: TodoLabels) {
  const s = Math.floor((Date.now() - ts) / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d < 1) return h < 1 ? t.justNow : `${h}${t.hAgo}`;
  if (d < 7) return `${d}${t.dAgo}`;
  return new Date(ts).toLocaleDateString(t.localeCode, { month: "short", day: "numeric" });
}

function segClasses(active: boolean, kind: "low" | "medium" | "high" | "neutral") {
  if (!active) {
    return "border-[var(--border)] text-[var(--text-secondary)] bg-transparent";
  }
  if (kind === "high") return "border-[var(--error)] text-[var(--error)] bg-[var(--error-bg)]";
  if (kind === "medium")
    return "border-[var(--warning)] text-[var(--warning)] bg-[var(--warning-bg)]";
  return "border-[var(--primary)] text-[var(--text-primary)] bg-[var(--bg-active)]";
}

function statClasses(active: boolean) {
  return active
    ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--bg-active)]"
    : "border-[var(--border)] text-[var(--text-secondary)] bg-transparent";
}

export function TodoBoardPage() {
  const { locale } = useLanguage();
  const t = getLabels(locale).todoBoard;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState<Task | null>(null);
  const [isNewDraft, setIsNewDraft] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let loaded: unknown = null;
    try {
      loaded = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    } catch {}
    const list = Array.isArray(loaded) ? loaded : [];
    setTasks(list.map((raw, i) => normalize(raw, i)));
  }, []);

  function commit(next: Task[]) {
    persist(next);
    setTasks(next);
  }

  function applyStatusFields(base: Task, fields: Partial<Task> & { done?: boolean }): Task {
    const n: Task = { ...base, ...fields } as Task;
    if (fields.status) n.status = fields.status;
    if (typeof fields.done === "boolean") {
      n.status = fields.done ? "done" : base.status === "done" ? "todo" : base.status;
    }
    return n;
  }

  function patch(id: string, fields: Partial<Task> & { done?: boolean }) {
    const next = tasks.map((task) =>
      task.id === id ? applyStatusFields(task, fields) : task,
    );
    commit(next);
  }

  function patchDraft(fields: Partial<Task> & { done?: boolean }) {
    setDraft((prev) => (prev ? applyStatusFields(prev, fields) : prev));
  }

  function openExisting(task: Task) {
    setDraft(task);
    setIsNewDraft(false);
  }

  function addCard(status: Status) {
    const maxOrder = tasks.reduce((m, task) => Math.max(m, task.order), -1);
    setDraft({
      id: newId("t"),
      title: "",
      notes: "",
      status,
      priority: "medium",
      dueDate: "",
      tags: [],
      order: maxOrder + 1,
      createdAt: nowTs(),
      subtasks: [],
    });
    setIsNewDraft(true);
  }

  function saveDraft() {
    if (!draft) return;
    commit(
      isNewDraft
        ? [...tasks, draft]
        : tasks.map((task) => (task.id === draft.id ? draft : task)),
    );
    setDraft(null);
  }

  function closeEditor() {
    setDraft(null);
  }

  function addTag() {
    const tag = newTag.trim().toLowerCase();
    if (!tag || !draft) return;
    if (draft.tags.includes(tag)) {
      setNewTag("");
      return;
    }
    patchDraft({ tags: [...draft.tags, tag] });
    setNewTag("");
  }

  function removeTag(tag: string) {
    if (draft) patchDraft({ tags: draft.tags.filter((x) => x !== tag) });
  }

  function addSubtask() {
    const text = newSubtask.trim();
    if (!text || !draft) return;
    patchDraft({ subtasks: [...draft.subtasks, { id: newId("s"), text, done: false }] });
    setNewSubtask("");
  }

  function toggleSub(sid: string) {
    if (draft) {
      patchDraft({
        subtasks: draft.subtasks.map((s) => (s.id === sid ? { ...s, done: !s.done } : s)),
      });
    }
  }

  function textSub(sid: string, text: string) {
    if (draft) {
      patchDraft({ subtasks: draft.subtasks.map((s) => (s.id === sid ? { ...s, text } : s)) });
    }
  }

  function removeSub(sid: string) {
    if (draft) patchDraft({ subtasks: draft.subtasks.filter((s) => s.id !== sid) });
  }

  function doDelete() {
    if (!draft) return;
    commit(tasks.filter((task) => task.id !== draft.id));
    setDraft(null);
    setConfirmDelete(false);
  }

  function onExport() {
    const data = JSON.stringify(tasks, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "devbox-todos.json";
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
        const byId: Record<string, Task> = {};
        [...tasks, ...parsed].forEach((raw, i) => {
          if (raw && raw.id) byId[raw.id] = normalize(raw, i);
        });
        commit(Object.values(byId));
      } catch {}
    };
    reader.readAsText(file);
    ev.target.value = "";
  }

  function onDragStart(id: string, ev: React.DragEvent) {
    try {
      ev.dataTransfer.effectAllowed = "move";
      ev.dataTransfer.setData("text/plain", id);
    } catch {}
    setDragId(id);
  }

  function onDragEnd() {
    setDragId(null);
    setDragOverCol(null);
  }

  function onColDragOver(key: Status, ev: React.DragEvent) {
    if (!dragId) return;
    ev.preventDefault();
    try {
      ev.dataTransfer.dropEffect = "move";
    } catch {}
    if (dragOverCol !== key) setDragOverCol(key);
  }

  function onColDragLeave(key: Status, ev: React.DragEvent<HTMLDivElement>) {
    if (ev.currentTarget.contains(ev.relatedTarget as Node)) return;
    if (dragOverCol === key) setDragOverCol(null);
  }

  function onColDrop(key: Status, ev: React.DragEvent) {
    ev.preventDefault();
    if (dragId) {
      const task = tasks.find((x) => x.id === dragId);
      if (task && task.status !== key) patch(dragId, { status: key });
    }
    setDragId(null);
    setDragOverCol(null);
  }

  const q = query.trim().toLowerCase();
  const filtered = tasks.filter((task) => {
    if (activeTag && !task.tags.includes(activeTag)) return false;
    if (!q) return true;
    return (
      task.title.toLowerCase().includes(q) ||
      task.notes.toLowerCase().includes(q) ||
      task.tags.join(" ").toLowerCase().includes(q)
    );
  });

  const uniqueTags = Array.from(new Set(tasks.flatMap((task) => task.tags))).sort();

  const colDefs: { key: Status; label: string; dot: string }[] = [
    { key: "todo", label: t.colTodo, dot: "bg-[var(--text-muted)]" },
    { key: "doing", label: t.colDoing, dot: "bg-[var(--primary)]" },
    { key: "done", label: t.colDone, dot: "bg-[var(--success)]" },
  ];

  const draftDi = draft ? dueInfo(draft.dueDate, draft.status === "done", t) : { has: false };
  const draftSubDone = draft ? draft.subtasks.filter((s) => s.done).length : 0;

  return (
    <DevBoxShell active="todo-board">
      <Breadcrumbs
        items={[
          { label: "DevBox", href: "/" },
          { label: t.breadcrumbProductivity },
          { label: "TODO Board" },
        ]}
      />

      <PageTitle
        title="TODO Board"
        subtitle={t.subtitle}
        action={
          <div className="flex items-center gap-2">
            <Badge>
              {tasks.length} {t.storedLocally}
            </Badge>
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
          </div>
        }
      />

      {/* toolbar: search + tag filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex h-[34px] w-[260px] items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2.5">
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
          {uniqueTags.map((tag) => (
            <button
              className={cx(
                "rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium",
                activeTag === tag
                  ? "border-[var(--primary)] bg-[var(--bg-active)] text-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]",
              )}
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              type="button"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* board */}
      <div className="grid grid-cols-1 items-start gap-3.5 sm:grid-cols-3">
        {colDefs.map((cd) => {
          const over = !!dragId && dragOverCol === cd.key;
          const cards = filtered
            .filter((task) => task.status === cd.key)
            .sort((a, b) => a.order - b.order);
          return (
            <div
              className={cx(
                "flex min-h-[420px] flex-col gap-2.5 rounded-[10px] border p-2.5 transition-colors",
                over
                  ? "border-dashed border-[var(--primary)] bg-[var(--bg-active)]"
                  : "border-[var(--border)] bg-[var(--bg-page)]",
              )}
              key={cd.key}
              onDragLeave={(e) => onColDragLeave(cd.key, e)}
              onDragOver={(e) => onColDragOver(cd.key, e)}
              onDrop={(e) => onColDrop(cd.key, e)}
            >
              <div className="flex items-center gap-2 px-1 py-0.5">
                <span className={cx("size-[9px] rounded-full", cd.dot)} />
                <span className="text-xs font-semibold uppercase tracking-[0.6px] text-[var(--text-secondary)]">
                  {cd.label}
                </span>
                <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-px font-mono text-[11px] font-semibold text-[var(--text-muted)]">
                  {cards.length}
                </span>
              </div>

              <div className="flex min-h-5 flex-col gap-2.5">
                {cards.map((task) => {
                  const di = dueInfo(task.dueDate, task.status === "done", t);
                  const subDone = task.subtasks.filter((s) => s.done).length;
                  return (
                    <div
                      className={cx(
                        "relative cursor-grab overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:border-[var(--primary)]",
                        dragId === task.id && "opacity-40",
                      )}
                      draggable
                      key={task.id}
                      onClick={() => openExisting(task)}
                      onDragEnd={onDragEnd}
                      onDragStart={(e) => onDragStart(task.id, e)}
                    >
                      <div
                        className="absolute inset-y-0 left-0 w-[3px]"
                        style={{ background: prioColorVar(task.priority) }}
                      />
                      <div className="flex flex-col gap-2.5 py-2.5 pl-3.5 pr-3">
                        <span
                          className={cx(
                            "line-clamp-2 text-[13px] font-semibold leading-snug",
                            task.status === "done"
                              ? "text-[var(--text-muted)] line-through"
                              : "text-[var(--text-primary)]",
                          )}
                        >
                          {task.title || t.untitledTask}
                        </span>
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {task.tags.slice(0, 4).map((tag) => (
                              <span
                                className="rounded border border-[var(--border)] bg-[var(--bg-page)] px-1.5 py-px font-mono text-[10px] font-medium text-[var(--text-secondary)]"
                                key={tag}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {di.has && (
                            <span
                              className={cx(
                                "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-medium",
                                dueBadgeClasses(di.tone),
                              )}
                            >
                              <Calendar aria-hidden className="size-[11px]" />
                              {di.label}
                            </span>
                          )}
                          {task.subtasks.length > 0 && (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[var(--text-muted)]">
                              <ListTodo aria-hidden className="size-[11px]" />
                              {subDone}/{task.subtasks.length}
                            </span>
                          )}
                          <div className="flex-1" />
                          <span
                            className={cx(
                              "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.4px]",
                              prioBadgeClasses(task.priority),
                            )}
                            title={t.priority}
                          >
                            {task.priority === "low"
                              ? t.priorityLow
                              : task.priority === "medium"
                                ? t.priorityMedium
                                : t.priorityHigh}
                          </span>
                        </div>
                        <div className="mt-px flex items-center gap-1.5 border-t border-[var(--border-light)] pt-2">
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {relCreated(task.createdAt, t)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {cards.length === 0 && (
                  <div className="flex items-center justify-center rounded-lg border border-dashed border-[var(--border)] p-4.5 text-xs text-[var(--text-muted)]">
                    {t.noTasks}
                  </div>
                )}
              </div>

              <button
                className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-dashed border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                onClick={() => addCard(cd.key)}
                type="button"
              >
                <Plus aria-hidden className="size-3" strokeWidth={2.2} />
                {t.create}
              </button>
            </div>
          );
        })}
      </div>

      {/* editor modal */}
      {draft && (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center overflow-auto bg-black/50 px-4 py-14"
          onClick={closeEditor}
        >
          <div
            className="flex w-[560px] max-w-full flex-col overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 border-b border-[var(--border)] bg-[var(--bg-page)] px-3.5 py-3">
              <button
                className={cx(
                  "flex size-[22px] shrink-0 items-center justify-center rounded-md border-[1.5px]",
                  draft.status === "done"
                    ? "border-[var(--primary)] bg-[var(--primary)]"
                    : "border-[var(--border)] bg-transparent",
                )}
                onClick={() => patchDraft({ done: draft.status !== "done" })}
                title={t.status}
                type="button"
              >
                {draft.status === "done" && (
                  <svg
                    aria-hidden
                    className="size-3"
                    fill="none"
                    stroke="var(--text-on-primary)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    viewBox="0 0 24 24"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              <input
                className={cx(
                  "min-w-0 flex-1 bg-transparent text-[15px] font-semibold outline-none placeholder:text-[var(--text-muted)]",
                  draft.status === "done"
                    ? "text-[var(--text-muted)] line-through"
                    : "text-[var(--text-primary)]",
                )}
                onChange={(e) => patchDraft({ title: e.target.value })}
                placeholder={t.untitledTask}
                spellCheck={false}
                value={draft.title}
              />
              {!isNewDraft && (
                <button
                  className="flex size-[30px] shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--error)] hover:bg-[var(--error-bg)]"
                  onClick={() => setConfirmDelete(true)}
                  title={t.deleteTaskTitle}
                  type="button"
                >
                  <Trash2 aria-hidden className="size-3.5" />
                </button>
              )}
              <button
                className="flex h-[30px] shrink-0 items-center gap-1.5 rounded-md bg-[var(--primary)] px-3 text-xs font-semibold text-[var(--text-on-primary)] hover:bg-[var(--primary-hover)]"
                onClick={saveDraft}
                title={t.save}
                type="button"
              >
                <Check aria-hidden className="size-3.5" strokeWidth={2.4} />
                {t.save}
              </button>
              <button
                className="flex size-[30px] shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                onClick={closeEditor}
                title={t.close}
                type="button"
              >
                <X aria-hidden className="size-3.5" strokeWidth={2.2} />
              </button>
            </div>

            <div className="flex max-h-[70vh] flex-col gap-4.5 overflow-y-auto p-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--text-muted)]">
                  {t.status}
                </span>
                <div className="flex gap-1.5">
                  {(
                    [
                      ["todo", t.colTodo],
                      ["doing", t.colDoing],
                      ["done", t.colDone],
                    ] as [Status, string][]
                  ).map(([key, label]) => (
                    <button
                      className={cx(
                        "h-[30px] rounded-md border px-3 text-xs font-semibold",
                        statClasses(draft.status === key),
                      )}
                      key={key}
                      onClick={() => patchDraft({ status: key })}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--text-muted)]">
                    {t.priority}
                  </span>
                  <div className="flex gap-1.5">
                    {(
                      [
                        ["low", t.priorityLow, "low"],
                        ["medium", t.priorityMedium, "medium"],
                        ["high", t.priorityHigh, "high"],
                      ] as [Priority, string, "low" | "medium" | "high"][]
                    ).map(([key, label, kind]) => (
                      <button
                        className={cx(
                          "h-[30px] rounded-md border px-3 text-xs font-semibold",
                          segClasses(draft.priority === key, kind),
                        )}
                        key={key}
                        onClick={() => patchDraft({ priority: key })}
                        type="button"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--text-muted)]">
                    {t.dueDate}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      className="h-[30px] rounded-md border border-[var(--border)] bg-[var(--bg-page)] px-2 text-xs text-[var(--text-primary)] outline-none"
                      onChange={(e) => patchDraft({ dueDate: e.target.value })}
                      type="date"
                      value={draft.dueDate}
                    />
                    {draftDi.has && (
                      <span
                        className={cx(
                          "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-medium",
                          dueBadgeClasses(draftDi.tone),
                        )}
                      >
                        {draftDi.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--text-muted)]">
                  {t.tags}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {draft.tags.map((tag) => (
                    <span
                      className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--bg-page)] py-0.5 pl-2 pr-1 font-mono text-[11px] font-medium text-[var(--text-secondary)]"
                      key={tag}
                    >
                      {tag}
                      <button
                        className="flex items-center justify-center text-[var(--text-muted)]"
                        onClick={() => removeTag(tag)}
                        title={t.removeTag}
                        type="button"
                      >
                        <X aria-hidden className="size-[11px]" strokeWidth={2.2} />
                      </button>
                    </span>
                  ))}
                  <div className="flex h-7 items-center gap-1.5 rounded-md border border-dashed border-[var(--border)] px-2">
                    <input
                      className="w-24 bg-transparent font-mono text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTag()}
                      placeholder={t.addTagPlaceholder}
                      spellCheck={false}
                      value={newTag}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--text-muted)]">
                  {t.notes}
                </span>
                <textarea
                  className="min-h-[88px] resize-y rounded-md border border-[var(--border)] bg-[var(--bg-page)] p-2.5 font-mono text-xs leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                  onChange={(e) => patchDraft({ notes: e.target.value })}
                  placeholder={t.notesPlaceholder}
                  spellCheck={false}
                  value={draft.notes}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--text-muted)]">
                    {t.subtasks}
                  </span>
                  {draft.subtasks.length > 0 && (
                    <span className="font-mono text-[11px] text-[var(--text-muted)]">
                      {draftSubDone}/{draft.subtasks.length}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {draft.subtasks.map((st) => (
                    <div
                      className="flex items-center gap-2.5 rounded-md px-1.5 py-1 hover:bg-[var(--bg-hover)]"
                      key={st.id}
                    >
                      <button
                        className={cx(
                          "flex size-[17px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px]",
                          st.done
                            ? "border-[var(--primary)] bg-[var(--primary)]"
                            : "border-[var(--border)] bg-transparent",
                        )}
                        onClick={() => toggleSub(st.id)}
                        type="button"
                      >
                        {st.done && (
                          <svg
                            aria-hidden
                            className="size-2.5"
                            fill="none"
                            stroke="var(--text-on-primary)"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            viewBox="0 0 24 24"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                      <input
                        className={cx(
                          "min-w-0 flex-1 bg-transparent text-[13px] outline-none",
                          st.done
                            ? "text-[var(--text-muted)] line-through"
                            : "text-[var(--text-primary)]",
                        )}
                        onChange={(e) => textSub(st.id, e.target.value)}
                        placeholder={t.subtaskPlaceholder}
                        spellCheck={false}
                        value={st.text}
                      />
                      <button
                        className="flex size-[22px] shrink-0 items-center justify-center rounded-[5px] text-[var(--text-muted)] hover:bg-[var(--bg-active)] hover:text-[var(--error)]"
                        onClick={() => removeSub(st.id)}
                        title={t.removeSubtask}
                        type="button"
                      >
                        <X aria-hidden className="size-3" strokeWidth={2.2} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex h-8 items-center gap-2 rounded-md border border-dashed border-[var(--border)] px-2.5">
                  <Plus aria-hidden className="size-3.5 text-[var(--text-muted)]" strokeWidth={2.2} />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                    placeholder={t.addSubtaskPlaceholder}
                    spellCheck={false}
                    value={newSubtask}
                  />
                </div>
              </div>

              <span className="text-[11px] text-[var(--text-muted)]">
                {t.created} {relCreated(draft.createdAt, t)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* delete confirm modal */}
      {confirmDelete && draft && (
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
                {t.deleteConfirmTitle}
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)]">
                &ldquo;{draft.title || t.untitledTask}&rdquo; {t.deleteConfirmBodySuffix}
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
                onClick={doDelete}
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
