import { useSyncExternalStore } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Braces,
  Clock,
  CodeXml,
  Database,
  GitCompareArrows,
  KanbanSquare,
  KeyRound,
  ListTree,
  ScanText,
  WholeWord,
} from "lucide-react";

export type ToolSlug =
  | "dashboard"
  | "uuid-tools"
  | "json-formatter"
  | "json-escape"
  | "html-preview"
  | "text-diff"
  | "text-extractor"
  | "character-counter"
  | "snippets"
  | "todo-board"
  | "pomodoro-timer";

export type UtilityToolSlug = Exclude<ToolSlug, "dashboard">;

export type Tool = {
  slug: UtilityToolSlug;
  href: string;
  title: string;
  section: string;
  icon: LucideIcon;
  subtype: string;
  description: string;
  status?: string;
  /** ISO date (YYYY-MM-DD) the tool was added. Drives the "NEW" badge for 14 days. */
  addedAt?: string;
};

const NEW_BADGE_DAYS = 14;

export function isRecentlyAdded(addedAt?: string): boolean {
  if (!addedAt) return false;
  const added = new Date(`${addedAt}T00:00:00`).getTime();
  if (isNaN(added)) return false;
  const ageDays = (Date.now() - added) / 86400000;
  return ageDays >= 0 && ageDays < NEW_BADGE_DAYS;
}

const SEEN_TOOLS_KEY = "devbox-seen-tools";
const SEEN_CHANGE_EVENT = "devbox-seen-tools-change";
const emptySeenTools = new Set<string>();
let cachedSeenRaw = "";
let cachedSeenTools = emptySeenTools;

function readSeenTools(): Set<string> {
  let raw = "[]";
  try {
    raw = localStorage.getItem(SEEN_TOOLS_KEY) ?? "[]";
  } catch {}
  if (raw === cachedSeenRaw) return cachedSeenTools;
  cachedSeenRaw = raw;
  try {
    const arr: unknown = JSON.parse(raw);
    cachedSeenTools = new Set(Array.isArray(arr) ? arr : []);
  } catch {
    cachedSeenTools = emptySeenTools;
  }
  return cachedSeenTools;
}

/** Marks a tool as visited so its "NEW" badge stops showing, even within the 14-day window. */
export function markToolSeen(slug: UtilityToolSlug) {
  const seen = readSeenTools();
  if (seen.has(slug)) return;
  const next = new Set(seen);
  next.add(slug);
  try {
    localStorage.setItem(SEEN_TOOLS_KEY, JSON.stringify(Array.from(next)));
  } catch {}
  try {
    window.dispatchEvent(new Event(SEEN_CHANGE_EVENT));
  } catch {}
}

function subscribeSeenTools(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(SEEN_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SEEN_CHANGE_EVENT, onChange);
  };
}

function getServerSeenTools(): Set<string> {
  return emptySeenTools;
}

export function useSeenTools(): Set<string> {
  return useSyncExternalStore(subscribeSeenTools, readSeenTools, getServerSeenTools);
}

export const tools: Tool[] = [
  {
    slug: "uuid-tools",
    href: "/uuid-tools",
    title: "UUID Tools",
    section: "GENERATORS",
    icon: KeyRound,
    subtype: "Generator",
    description: "Generate, validate, and modify UUIDs.",
    status: "Valid UUID v4",
  },
  {
    slug: "json-formatter",
    href: "/json-formatter",
    title: "JSON Formatter & Validator",
    section: "FORMATTERS & VALIDATORS",
    icon: Braces,
    subtype: "Formatter & Validator",
    description: "Format, minify, and validate JSON.",
  },
  {
    slug: "json-escape",
    href: "/json-escape",
    title: "JSON Escape / Unescape",
    section: "FORMATTERS & VALIDATORS",
    icon: ListTree,
    subtype: "Encoder",
    description: "Escape and unescape JSON string values.",
  },
  {
    slug: "html-preview",
    href: "/html-preview",
    title: "HTML Preview",
    section: "FORMATTERS & VALIDATORS",
    icon: CodeXml,
    subtype: "Preview",
    description: "Edit markup and inspect a rendered preview.",
  },
  {
    slug: "text-diff",
    href: "/text-diff",
    title: "Text Diff",
    section: "COMPARATORS",
    icon: GitCompareArrows,
    subtype: "Comparator",
    description: "Compare two texts and highlight differences.",
  },
  {
    slug: "text-extractor",
    href: "/text-extractor",
    title: "Text Extractor",
    section: "TEXT TOOLS",
    icon: ScanText,
    subtype: "OCR",
    description: "Extract readable text from pasted or attached images.",
  },
  {
    slug: "character-counter",
    href: "/character-counter",
    title: "Character / Word Counter",
    section: "TEXT TOOLS",
    icon: WholeWord,
    subtype: "Text Tool",
    description: "Count characters, words, and lines instantly.",
  },
  {
    slug: "snippets",
    href: "/snippets",
    title: "Snippets",
    section: "PRODUCTIVITY",
    icon: Database,
    subtype: "Productivity",
    description: "Save and organize text snippets locally in your browser.",
    addedAt: "2026-08-12",
  },
  {
    slug: "todo-board",
    href: "/todo-board",
    title: "TODO Board",
    section: "PRODUCTIVITY",
    icon: KanbanSquare,
    subtype: "Productivity",
    description: "Track tasks on a local kanban board.",
    addedAt: "2026-08-17",
  },
  {
    slug: "pomodoro-timer",
    href: "/pomodoro-timer",
    title: "Pomodoro Timer",
    section: "PRODUCTIVITY",
    icon: Clock,
    subtype: "Productivity",
    description: "Focus in intervals with a Pomodoro or custom timer.",
    addedAt: "2026-08-17",
  },
];

export const sectionOrder = [
  "GENERATORS",
  "FORMATTERS & VALIDATORS",
  "COMPARATORS",
  "TEXT TOOLS",
  "PRODUCTIVITY",
];

export const activeBySlug: Record<ToolSlug, string> = {
  dashboard: "Dashboard",
  "uuid-tools": "UUID Tools",
  "json-formatter": "JSON Formatter & Validator",
  "json-escape": "JSON Escape / Unescape",
  "html-preview": "HTML Preview",
  "text-diff": "Text Diff",
  "text-extractor": "Text Extractor",
  "character-counter": "Character / Word Counter",
  snippets: "Snippets",
  "todo-board": "TODO Board",
  "pomodoro-timer": "Pomodoro Timer",
};
