#!/usr/bin/env node
/**
 * Gate post-build de hreflang.
 *
 * Falla si un <link rel="alternate" hreflang> apunta a:
 *   - redirect 3xx conocido,
 *   - URL retirada con 410,
 *   - HTML inexistente (404),
 *   - página noindex,
 *   - alias cuyo canonical apunta a otra URL,
 *   - miembro que no devuelve el vínculo (falta de reciprocidad).
 *
 * También valida que las páginas que emiten alternates sean indexables,
 * autocanónicas, tengan un solo x-default y se incluyan a sí mismas.
 *
 * Uso:
 *   npm run audit:hreflang
 *   node --experimental-strip-types scripts/audit-hreflang.ts --dir=dist/client
 */

import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PRUNING_REDIRECTS } from '../src/lib/pruning-redirects.ts';
import { GONE_410_URLS } from '../src/lib/gone-410.ts';

const SITE = 'https://hacecuentas.com';

export interface HreflangDocument {
  path: string;
  html: string;
}

export type HreflangAuditCode =
  | 'duplicate_language'
  | 'invalid_url'
  | 'source_noindex'
  | 'source_canonical_alias'
  | 'self_missing'
  | 'redirect'
  | 'gone_410'
  | 'not_found'
  | 'target_noindex'
  | 'target_canonical_alias'
  | 'not_reciprocal';

export interface HreflangAuditError {
  code: HreflangAuditCode;
  source: string;
  target?: string;
  detail: string;
}

interface Alternate {
  lang: string;
  href: string;
  path: string | null;
}

interface ParsedDocument {
  path: string;
  canonicalPath: string | null;
  noindex: boolean;
  alternates: Alternate[];
}

function attributes(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  const rx = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match: RegExpExecArray | null;
  while ((match = rx.exec(tag))) {
    out[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return out;
}

export function normalizeInternalPath(href: string): string | null {
  try {
    const url = new URL(href, SITE);
    if (url.origin !== SITE) return null;
    let path = url.pathname.replace(/\.html$/, '').replace(/\/index$/, '/');
    if (!path.startsWith('/')) path = `/${path}`;
    if (path.length > 1) path = path.replace(/\/+$/, '');
    return path || '/';
  } catch {
    return null;
  }
}

function parseDocument(document: HreflangDocument): ParsedDocument {
  const linkTags = document.html.match(/<link\b[^>]*>/gi) || [];
  const metaTags = document.html.match(/<meta\b[^>]*>/gi) || [];
  let canonicalPath: string | null = null;
  const alternates: Alternate[] = [];

  for (const tag of linkTags) {
    const attrs = attributes(tag);
    const rels = (attrs.rel || '').toLowerCase().split(/\s+/);
    if (rels.includes('canonical') && attrs.href && canonicalPath === null) {
      canonicalPath = normalizeInternalPath(attrs.href);
    }
    if (rels.includes('alternate') && attrs.hreflang && attrs.href) {
      alternates.push({
        lang: attrs.hreflang.toLowerCase(),
        href: attrs.href,
        path: normalizeInternalPath(attrs.href),
      });
    }
  }

  const noindex = metaTags.some((tag) => {
    const attrs = attributes(tag);
    return attrs.name?.toLowerCase() === 'robots' &&
      /(?:^|[\s,])noindex(?:$|[\s,])/i.test(attrs.content || '');
  });

  return {
    path: normalizeInternalPath(document.path) || document.path,
    canonicalPath,
    noindex,
    alternates,
  };
}

/**
 * Auditor puro, reutilizable en unit tests y por el CLI post-build.
 * `blockedPaths` usa valores "redirect" o "gone_410".
 */
export function auditHreflangDocuments(
  documents: HreflangDocument[],
  blockedPaths: ReadonlyMap<string, 'redirect' | 'gone_410'> = new Map(),
): HreflangAuditError[] {
  const parsed = new Map<string, ParsedDocument>();
  for (const document of documents) {
    const item = parseDocument(document);
    parsed.set(item.path, item);
  }

  const errors: HreflangAuditError[] = [];
  const emitted = new Set<string>();
  const add = (error: HreflangAuditError) => {
    const key = `${error.code}|${error.source}|${error.target || ''}|${error.detail}`;
    if (!emitted.has(key)) {
      emitted.add(key);
      errors.push(error);
    }
  };

  for (const source of parsed.values()) {
    if (source.alternates.length === 0) continue;

    const langCounts = new Map<string, number>();
    for (const alternate of source.alternates) {
      langCounts.set(alternate.lang, (langCounts.get(alternate.lang) || 0) + 1);
    }
    for (const [lang, count] of langCounts) {
      if (count > 1) {
        add({
          code: 'duplicate_language',
          source: source.path,
          detail: `${lang} aparece ${count} veces`,
        });
      }
    }

    if (source.noindex) {
      add({
        code: 'source_noindex',
        source: source.path,
        detail: 'una página noindex no debe emitir hreflang',
      });
    }
    if (source.canonicalPath && source.canonicalPath !== source.path) {
      add({
        code: 'source_canonical_alias',
        source: source.path,
        target: source.canonicalPath,
        detail: 'la fuente no es autocanónica',
      });
    }
    if (!source.alternates.some((alternate) => alternate.path === source.path)) {
      add({
        code: 'self_missing',
        source: source.path,
        detail: 'el cluster no incluye la URL actual',
      });
    }

    for (const alternate of source.alternates) {
      if (!alternate.path) {
        add({
          code: 'invalid_url',
          source: source.path,
          target: alternate.href,
          detail: `${alternate.lang} no es una URL interna válida`,
        });
        continue;
      }

      const blocked = blockedPaths.get(alternate.path);
      if (blocked === 'redirect') {
        add({
          code: 'redirect',
          source: source.path,
          target: alternate.path,
          detail: `${alternate.lang} apunta a un redirect`,
        });
        continue;
      }
      if (blocked === 'gone_410') {
        add({
          code: 'gone_410',
          source: source.path,
          target: alternate.path,
          detail: `${alternate.lang} apunta a una URL 410`,
        });
        continue;
      }

      const target = parsed.get(alternate.path);
      if (!target) {
        add({
          code: 'not_found',
          source: source.path,
          target: alternate.path,
          detail: `${alternate.lang} no tiene HTML 200 en el build`,
        });
        continue;
      }
      if (target.noindex) {
        add({
          code: 'target_noindex',
          source: source.path,
          target: target.path,
          detail: `${alternate.lang} apunta a una página noindex`,
        });
      }
      if (target.canonicalPath && target.canonicalPath !== target.path) {
        add({
          code: 'target_canonical_alias',
          source: source.path,
          target: target.path,
          detail: `${alternate.lang} apunta a un alias canónico de ${target.canonicalPath}`,
        });
      }
      if (!target.alternates.some((candidate) => candidate.path === source.path)) {
        add({
          code: 'not_reciprocal',
          source: source.path,
          target: target.path,
          detail: `${alternate.lang} no devuelve enlace a la fuente`,
        });
      }
    }
  }

  return errors;
}

function collectHtmlFiles(root: string, current = root): string[] {
  const out: string[] = [];
  for (const name of readdirSync(current)) {
    const path = join(current, name);
    const stat = statSync(path);
    if (stat.isDirectory()) out.push(...collectHtmlFiles(root, path));
    else if (name.endsWith('.html')) out.push(path);
  }
  return out;
}

function publicPathForHtml(root: string, file: string): string {
  const rel = relative(root, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'/index.html'.length)}`;
  return `/${rel.slice(0, -'.html'.length)}`;
}

export function parseExactRedirectLines(contents: string): string[] {
  const out: string[] = [];
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const [source, target, rawStatus] = line.split(/\s+/);
    const status = Number(rawStatus || 301);
    if (
      source?.startsWith('/') &&
      !/[*:]/.test(source) &&
      [301, 302, 307, 308].includes(status)
    ) {
      const sourcePath = normalizeInternalPath(source) || source;
      const targetPath = target ? normalizeInternalPath(target) : null;
      // `/mx/ -> /mx` sólo canonicaliza trailing slash. Tras normalizar ambas
      // representan la misma URL 200 y no debe bloquear HOME_HREFLANG.
      if (targetPath && targetPath === sourcePath) continue;
      out.push(sourcePath);
    }
  }
  return out;
}

function parseExactRedirects(file: string): string[] {
  if (!existsSync(file)) return [];
  return parseExactRedirectLines(readFileSync(file, 'utf8'));
}

function blockedPaths(repoRoot: string): Map<string, 'redirect' | 'gone_410'> {
  const out = new Map<string, 'redirect' | 'gone_410'>();
  for (const path of Object.keys(PRUNING_REDIRECTS)) {
    out.set(normalizeInternalPath(path) || path, 'redirect');
  }
  for (const path of parseExactRedirects(join(repoRoot, 'public', '_redirects'))) {
    out.set(path, 'redirect');
  }
  for (const path of GONE_410_URLS) {
    out.set(normalizeInternalPath(path) || path, 'gone_410');
  }
  return out;
}

function main(): void {
  const repoRoot = resolve(process.cwd());
  const dirArg = process.argv.find((arg) => arg.startsWith('--dir='));
  const clientDir = resolve(repoRoot, dirArg?.slice('--dir='.length) || 'dist/client');
  if (!existsSync(clientDir)) {
    console.error(`[hreflang-gate] ✗ no existe ${clientDir}; corré el build primero`);
    process.exit(1);
  }

  const documents = collectHtmlFiles(clientDir).map((file) => ({
    path: publicPathForHtml(clientDir, file),
    html: readFileSync(file, 'utf8'),
  }));
  const pagesWithHreflang = documents.filter((document) =>
    /<link\b[^>]*\bhreflang\s*=/i.test(document.html)
  ).length;
  const errors = auditHreflangDocuments(documents, blockedPaths(repoRoot));

  if (errors.length > 0) {
    console.error(
      `[hreflang-gate] ✗ ${errors.length} errores en ${pagesWithHreflang} páginas con hreflang`,
    );
    for (const error of errors.slice(0, 120)) {
      console.error(
        `  ${error.code}: ${error.source}${error.target ? ` -> ${error.target}` : ''} (${error.detail})`,
      );
    }
    if (errors.length > 120) {
      console.error(`  … ${errors.length - 120} errores adicionales`);
    }
    process.exit(1);
  }

  console.log(
    `[hreflang-gate] ✓ ${pagesWithHreflang} páginas verificadas; ` +
    'sin redirects/410/noindex/404/aliases ni clusters no recíprocos',
  );
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) main();
