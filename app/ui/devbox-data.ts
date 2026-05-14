import type { LucideIcon } from "lucide-react";
import {
  Braces,
  CodeXml,
  GitCompareArrows,
  KeyRound,
  ScanText,
  WholeWord,
} from "lucide-react";

export type ToolSlug =
  | "dashboard"
  | "uuid-tools"
  | "json-formatter"
  | "html-preview"
  | "text-diff"
  | "text-extractor"
  | "character-counter";

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
  "html-preview": "HTML Preview",
  "text-diff": "Text Diff",
  "text-extractor": "Text Extractor",
  "character-counter": "Character / Word Counter",
};
