import currentTools from './current-tools-index.json';

export interface EmbeddableTool {
  slug: string;
  url: string;
  title: string;
  h1: string;
  description: string;
  category: string;
  locale: string;
  audience: string;
}

const LOCALE_PREFIXES = new Set([
  'en',
  'es',
  'mx',
  'co',
  'cl',
  'pe',
  'ec',
  've',
  'py',
  'uy',
  'do',
  'pt',
  'pt-pt',
]);

/**
 * `current-tools-index.json` también contiene los índices de silo (`/trabajo`,
 * `/cl/finanzas`, etc.). El plugin debe ofrecer sólo hubs con calculadora.
 */
export function isEmbeddableTool(tool: EmbeddableTool): boolean {
  const parts = tool.slug.split('/').filter(Boolean);
  if (parts.length === 0) return false;
  return LOCALE_PREFIXES.has(parts[0]) ? parts.length >= 3 : parts.length >= 2;
}

export const EMBEDDABLE_TOOLS = (currentTools as EmbeddableTool[])
  .filter(isEmbeddableTool)
  .sort((a, b) => a.title.localeCompare(b.title, 'es'));

export const EMBEDDABLE_BY_PATH = new Map(
  EMBEDDABLE_TOOLS.map((tool) => [`/${tool.slug}`, tool]),
);

