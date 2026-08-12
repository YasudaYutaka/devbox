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
      storage: "STORAGE",
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
      "json-escape": {
        title: "JSON Escape / Unescape",
        subtype: "Encoder",
        description: "Escape and unescape JSON string values.",
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
      snippets: {
        title: "Snippets",
        subtype: "Storage",
        description: "Save and organize text snippets locally in your browser.",
      },
    } satisfies Record<UtilityToolSlug, unknown>,
    snippets: {
      breadcrumbStorage: "Storage",
      subtitle: "Save and organize text snippets locally in your browser. Nothing leaves this device.",
      storedLocally: "stored locally",
      import: "Import",
      export: "Export",
      newSnippet: "New snippet",
      searchPlaceholder: "Search title, body, tag...",
      tagAll: "All",
      sortedByRecent: "Sorted by recent",
      snippet: "snippet",
      snippets: "snippets",
      shown: "shown",
      untitled: "Untitled snippet",
      bodyEmpty: "empty",
      noMatchTagQuery: 'No snippets tagged "{tag}" match "{query}".',
      noMatchTag: 'No snippets tagged "{tag}".',
      noMatchQuery: 'No snippets match "{query}".',
      noMatchHint: "Try a different term or clear the filters.",
      noSelection: "No snippet selected",
      noSelectionHint: "Select one from the list, or create a new snippet.",
      copy: "Copy",
      copied: "Copied",
      save: "Save",
      tagPlaceholder: "add tag",
      updated: "Updated",
      chars: "chars",
      line: "line",
      lines: "lines",
      bodyPlaceholder: "Paste or type your snippet — SQL, JSON, regex, a command, a note…",
      deleteTitle: "Delete snippet?",
      deleteBodySuffix: "will be permanently removed.",
      cancel: "Cancel",
      delete: "Delete",
      justNow: "just now",
      mAgo: "m ago",
      hAgo: "h ago",
      dAgo: "d ago",
      pageOf: "{page} of {total}",
    },
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
      storage: "ARMAZENAMENTO",
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
      "json-escape": {
        title: "Escape / Unescape de JSON",
        subtype: "Codificador",
        description: "Escape e reverta strings JSON.",
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
      snippets: {
        title: "Snippets",
        subtype: "Armazenamento",
        description: "Salve e organize trechos de texto localmente no seu navegador.",
      },
    } satisfies Record<UtilityToolSlug, unknown>,
    snippets: {
      breadcrumbStorage: "Armazenamento",
      subtitle: "Salve e organize trechos de texto localmente no seu navegador. Nada sai deste dispositivo.",
      storedLocally: "armazenados localmente",
      import: "Importar",
      export: "Exportar",
      newSnippet: "Novo snippet",
      searchPlaceholder: "Buscar título, conteúdo, tag...",
      tagAll: "Todos",
      sortedByRecent: "Mais recentes primeiro",
      snippet: "snippet",
      snippets: "snippets",
      shown: "exibidos",
      untitled: "Snippet sem título",
      bodyEmpty: "vazio",
      noMatchTagQuery: 'Nenhum snippet com tag "{tag}" corresponde a "{query}".',
      noMatchTag: 'Nenhum snippet com tag "{tag}".',
      noMatchQuery: 'Nenhum snippet corresponde a "{query}".',
      noMatchHint: "Tente um termo diferente ou limpe os filtros.",
      noSelection: "Nenhum snippet selecionado",
      noSelectionHint: "Selecione um da lista ou crie um novo snippet.",
      copy: "Copiar",
      copied: "Copiado",
      save: "Salvar",
      tagPlaceholder: "adicionar tag",
      updated: "Atualizado",
      chars: "caracteres",
      line: "linha",
      lines: "linhas",
      bodyPlaceholder: "Cole ou digite seu snippet — SQL, JSON, regex, um comando, uma anotação…",
      deleteTitle: "Excluir snippet?",
      deleteBodySuffix: "será excluído permanentemente.",
      cancel: "Cancelar",
      delete: "Excluir",
      justNow: "agora mesmo",
      mAgo: "min atrás",
      hAgo: "h atrás",
      dAgo: "d atrás",
      pageOf: "{page} de {total}",
    },
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
    case "STORAGE":
      return translated.storage;
    default:
      return section;
  }
}
