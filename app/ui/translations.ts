import type { UtilityToolSlug } from "./devbox-data";
import type { Locale } from "./language";

export const labels = {
  en: {
    headerTagline: "Fast utilities for developers",
    searchTools: "Search tools",
    searchPlaceholder: "Search tools...",
    localFirst: "Local-first",
    home: "Home",
    dashboard: {
      title: "Welcome to DevBox",
      subtitle: "Generate, format, validate, and compare developer data.",
      tools: "Tools",
      openTool: "Open tool",
      recentlyUsed: "Recently used",
    },
    common: {
      copy: "Copy",
      copied: "Copied!",
      clear: "Clear",
      clearAll: "Clear all",
      generate: "Generate",
      generating: "Generating",
      validate: "Validate",
      ready: "Ready",
      waiting: "Waiting",
    },
    sections: {
      generators: "GENERATORS",
      formattersValidators: "FORMATTERS & VALIDATORS",
      comparators: "COMPARATORS",
      textTools: "TEXT TOOLS",
    },
    tools: {
      "uuid-tools": {
        title: "UUID Tools",
        subtype: "Generator",
        description: "Generate, validate, and modify UUIDs.",
      },
      "json-formatter": {
        title: "JSON Formatter & Validator",
        subtype: "Formatter & Validator",
        description: "Format, minify, and validate JSON.",
      },
      "html-preview": {
        title: "HTML Preview",
        subtype: "Preview",
        description: "Edit markup and inspect a rendered preview.",
      },
      "text-diff": {
        title: "Text Diff",
        subtype: "Comparator",
        description: "Compare two texts and highlight differences.",
      },
      "text-extractor": {
        title: "Text Extractor",
        subtype: "OCR",
        description: "Extract readable text from pasted or attached images.",
      },
      "character-counter": {
        title: "Character / Word Counter",
        subtype: "Text Tool",
        description: "Count characters, words, and lines instantly.",
      },
    } satisfies Record<UtilityToolSlug, unknown>,
  },
  pt: {
    headerTagline: "Utilitários rápidos para desenvolvedores",
    searchTools: "Buscar ferramentas",
    searchPlaceholder: "Buscar ferramentas...",
    localFirst: "Local primeiro",
    home: "Início",
    dashboard: {
      title: "Bem-vindo ao DevBox",
      subtitle: "Gere, formate, valide e compare dados para desenvolvimento.",
      tools: "Ferramentas",
      openTool: "Abrir ferramenta",
      recentlyUsed: "Usadas recentemente",
    },
    common: {
      copy: "Copiar",
      copied: "Copiado!",
      clear: "Limpar",
      clearAll: "Limpar tudo",
      generate: "Gerar",
      generating: "Gerando",
      validate: "Validar",
      ready: "Pronto",
      waiting: "Aguardando",
    },
    sections: {
      generators: "GERADORES",
      formattersValidators: "FORMATADORES E VALIDADORES",
      comparators: "COMPARADORES",
      textTools: "FERRAMENTAS DE TEXTO",
    },
    tools: {
      "uuid-tools": {
        title: "Ferramentas de UUID",
        subtype: "Gerador",
        description: "Gere, valide e modifique UUIDs.",
      },
      "json-formatter": {
        title: "Formatador e Validador de JSON",
        subtype: "Formatador e Validador",
        description: "Formate, minifique e valide JSON.",
      },
      "html-preview": {
        title: "Prévia de HTML",
        subtype: "Prévia",
        description: "Edite marcação e inspecione uma prévia renderizada.",
      },
      "text-diff": {
        title: "Comparador de Texto",
        subtype: "Comparador",
        description: "Compare dois textos e destaque as diferenças.",
      },
      "text-extractor": {
        title: "Extrator de Texto",
        subtype: "OCR",
        description: "Extraia texto legível de imagens coladas ou anexadas.",
      },
      "character-counter": {
        title: "Contador de Caracteres / Palavras",
        subtype: "Ferramenta de Texto",
        description: "Conte caracteres, palavras e linhas instantaneamente.",
      },
    } satisfies Record<UtilityToolSlug, unknown>,
  },
} as const;

export function getLabels(locale: Locale) {
  return labels[locale];
}

export function getSectionLabel(locale: Locale, section: string) {
  const translated = getLabels(locale).sections;
  switch (section) {
    case "GENERATORS":
      return translated.generators;
    case "FORMATTERS & VALIDATORS":
      return translated.formattersValidators;
    case "COMPARATORS":
      return translated.comparators;
    case "TEXT TOOLS":
      return translated.textTools;
    default:
      return section;
  }
}
