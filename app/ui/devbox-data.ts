import type { LucideIcon } from "lucide-react";
import { Braces, GitCompareArrows, KeyRound } from "lucide-react";

export type ToolSlug = "dashboard" | "uuid-tools" | "json-formatter" | "text-diff";

export type Tool = {
  slug: ToolSlug;
  href: string;
  title: string;
  section: string;
  icon: LucideIcon;
  subtype: string;
  description: string;
  status?: string;
};

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
    slug: "text-diff",
    href: "/text-diff",
    title: "Text Diff",
    section: "COMPARATORS",
    icon: GitCompareArrows,
    subtype: "Comparator",
    description: "Compare two texts and highlight differences.",
  },
];

export const sectionOrder = [
  "GENERATORS",
  "FORMATTERS & VALIDATORS",
  "COMPARATORS",
  "TEXT TOOLS",
];

export const activeBySlug: Record<ToolSlug, string> = {
  dashboard: "Dashboard",
  "uuid-tools": "UUID Tools",
  "json-formatter": "JSON Formatter & Validator",
  "text-diff": "Text Diff",
};
