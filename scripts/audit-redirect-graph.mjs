#!/usr/bin/env node
/**
 * Auditor read-only del grafo combinado PRUNING_REDIRECTS + public/_redirects.
 *
 * Uso:
 *   node scripts/audit-redirect-graph.mjs
 *   node scripts/audit-redirect-graph.mjs --check
 *   node scripts/audit-redirect-graph.mjs --check --strict-targets
 *   node scripts/audit-redirect-graph.mjs --check --build-dir=dist/client
 *   node scripts/audit-redirect-graph.mjs --json
 *
 * `--check` falla por ciclos, contradicciones 410+redirect y destinos finales
 * retirados, inexistentes/no indexables, no canónicos o hubs vacíos.
 * `--strict-targets` también convierte en fatal la deuda heredada de redirects
 * hacia calculadoras no distribuibles (draft/noindex/restricted).
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RedirectCycleError,
  auditFlattenedRedirects,
  combineRedirectEntries,
  flattenRedirectGraph,
  parseCloudflareRedirects,
  parsePruningRedirects,
} from './lib/redirect-graph.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://hacecuentas.com';
const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const asJson = args.has('--json');
const check = args.has('--check');
const strictTargets = args.has('--strict-targets');
const verbose = args.has('--verbose');
const buildDirValue = rawArgs.find((arg) => arg.startsWith('--build-dir='))?.slice(12);
const buildDir = buildDirValue ? resolve(ROOT, buildDirValue) : null;

const CALC_COLLECTIONS = [
  ['calcs', ''],
  ['calcs-en', 'en'],
  ['calcs-es', 'es'],
  ['calcs-co', 'co'],
  ['calcs-mx', 'mx'],
  ['calcs-cl', 'cl'],
  ['calcs-ec', 'ec'],
  ['calcs-pe', 'pe'],
  ['calcs-ve', 've'],
  ['calcs-py', 'py'],
  ['calcs-uy', 'uy'],
  ['calcs-do', 'do'],
  ['calcs-pt', 'pt'],
  ['calcs-pt-pt', 'pt-pt'],
];

function normalizePath(value) {
  try {
    const url = new URL(value, SITE);
    if (url.origin !== SITE) return url.href;
    return url.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return String(value || '').replace(/\/+$/, '') || '/';
  }
}

function parseGone410(text) {
  return new Set(
    [...text.matchAll(/(['"])(\/[^'"]+)\1/g)].map((match) =>
      normalizePath(match[2]),
    ),
  );
}

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasValidProfessionalReviewer(calc) {
  const reviewer = calc?.professionalReviewer;
  return Boolean(
    reviewer &&
      typeof reviewer === 'object' &&
      nonEmpty(reviewer.name) &&
      nonEmpty(reviewer.profession) &&
      nonEmpty(reviewer.credential) &&
      nonEmpty(reviewer.profileUrl) &&
      /^\d{4}-\d{2}-\d{2}$/.test(reviewer.reviewedAt || ''),
  );
}

function nonDistributableReasons(calc) {
  const reasons = [];
  if (calc.status === 'draft') reasons.push('status=draft');
  if (calc.noindex === true) reasons.push('noindex=true');
  if (calc.distribution === 'restricted') reasons.push('distribution=restricted');
  if (calc.ymylRisk === 'high' && !hasValidProfessionalReviewer(calc)) {
    reasons.push('ymylRisk=high sin professionalReviewer válido');
  }
  return reasons;
}

function canonicalTargetFor(calc, prefix) {
  const slug = nonEmpty(calc.slug) ? calc.slug.trim() : '';
  const canonicalSlug = nonEmpty(calc.canonicalSlug)
    ? calc.canonicalSlug.trim()
    : '';
  if (!canonicalSlug || canonicalSlug === slug) return undefined;
  if (canonicalSlug.startsWith('/')) return normalizePath(canonicalSlug);
  return normalizePath(`/${prefix ? `${prefix}/` : ''}${canonicalSlug}`);
}

function loadCalcMetadata(prunedPaths, gonePaths) {
  const routes = new Map();
  const categoryAvailability = new Map();

  for (const [collection, prefix] of CALC_COLLECTIONS) {
    const directory = join(ROOT, 'src', 'content', collection);
    for (const name of readdirSync(directory)) {
      if (!name.endsWith('.json')) continue;
      const file = join(directory, name);
      const calc = JSON.parse(readFileSync(file, 'utf8'));
      if (!nonEmpty(calc.slug)) continue;

      const route = normalizePath(`/${prefix ? `${prefix}/` : ''}${calc.slug}`);
      const reasons = nonDistributableReasons(calc);
      const canonicalTarget = canonicalTargetFor(calc, prefix);
      routes.set(route, {
        kind: 'calc',
        calc,
        file: relative(ROOT, file),
        canonicalTarget,
        nonDistributableReasons: reasons,
        expectedStatic: true,
      });

      if (
        collection === 'calcs' &&
        nonEmpty(calc.category) &&
        reasons.length === 0 &&
        !canonicalTarget &&
        !prunedPaths.has(route) &&
        !gonePaths.has(route)
      ) {
        categoryAvailability.set(
          calc.category,
          (categoryAvailability.get(calc.category) || 0) + 1,
        );
      }
    }
  }
  return { routes, categoryAvailability };
}

function loadIndexedPaths() {
  const indexPath = join(ROOT, 'public', 'sitemap.xml');
  const paths = new Set();
  const files = [];
  const errors = [];

  if (!existsSync(indexPath)) {
    return {
      paths,
      files,
      errors: ['falta public/sitemap.xml'],
    };
  }

  const indexXml = readFileSync(indexPath, 'utf8');
  for (const match of indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    let file;
    try {
      const url = new URL(match[1].trim());
      if (url.origin !== SITE) continue;
      file = basename(url.pathname);
    } catch {
      continue;
    }
    if (!/^sitemap-[a-z0-9-]+\.xml$/i.test(file)) continue;
    if (files.includes(file)) continue;
    files.push(file);

    const sitemapPath = join(ROOT, 'public', file);
    if (!existsSync(sitemapPath)) {
      errors.push(`sitemap referenciado inexistente: public/${file}`);
      continue;
    }
    const xml = readFileSync(sitemapPath, 'utf8');
    for (const loc of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      try {
        const url = new URL(loc[1].trim());
        if (url.origin === SITE) paths.add(normalizePath(url.pathname));
      } catch {
        // El auditor de sitemap reporta XML inválido; acá sólo construimos inventario.
      }
    }
  }
  if (files.length === 0) errors.push('sitemap.xml no referencia ningún sitemap hijo');
  if (paths.size === 0) errors.push('los sitemaps referenciados no contienen URLs');
  return { paths, files, errors };
}

function walkHtml(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkHtml(file));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(file);
  }
  return files;
}

function attribute(tag, name) {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'),
  );
  return match?.[1] ?? match?.[2];
}

function routeForHtml(file, directory) {
  let path = relative(directory, file).replace(/\\/g, '/');
  if (path === 'index.html') return '/';
  path = path.replace(/\/index\.html$/, '').replace(/\.html$/, '');
  return normalizePath(`/${path}`);
}

function loadBuiltPages(directory) {
  const pages = new Map();
  const errors = [];
  if (!existsSync(directory)) {
    return {
      pages,
      errors: [`build-dir inexistente: ${relative(ROOT, directory)}`],
    };
  }

  const files = walkHtml(directory);
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    let canonicalPath;
    for (const tag of html.matchAll(/<link\b[^>]*>/gi)) {
      const rel = attribute(tag[0], 'rel') || '';
      if (!rel.split(/\s+/).some((value) => value.toLowerCase() === 'canonical')) {
        continue;
      }
      const href = attribute(tag[0], 'href');
      if (href) canonicalPath = normalizePath(href);
      break;
    }

    let noindex = false;
    for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
      const name = (attribute(tag[0], 'name') || '').toLowerCase();
      if (name !== 'robots' && name !== 'googlebot') continue;
      const content = (attribute(tag[0], 'content') || '').toLowerCase();
      if (content.split(/[\s,]+/).includes('noindex')) {
        noindex = true;
        break;
      }
    }

    pages.set(routeForHtml(file, directory), {
      file: relative(ROOT, file),
      canonicalPath,
      noindex,
    });
  }
  if (files.length === 0) {
    errors.push(`build-dir sin HTML: ${relative(ROOT, directory)}`);
  }
  return { pages, errors };
}

function groupTargetIssues(items) {
  const byTarget = new Map();
  for (const { source, ...details } of items) {
    const current = byTarget.get(details.target) || {
      ...details,
      sources: [],
    };
    current.sources.push(source);
    byTarget.set(details.target, current);
  }
  return [...byTarget.values()]
    .map((item) => ({ ...item, sources: item.sources.sort() }))
    .sort((a, b) => a.target.localeCompare(b.target));
}

const staticParsed = parseCloudflareRedirects(
  readFileSync(join(ROOT, 'public', '_redirects'), 'utf8'),
);
const pruningEntries = parsePruningRedirects(
  readFileSync(join(ROOT, 'src', 'lib', 'pruning-redirects.ts'), 'utf8'),
);
const { map: rawMap, overlaps } = combineRedirectEntries(
  pruningEntries,
  staticParsed.entries,
);
const gone410 = parseGone410(
  readFileSync(join(ROOT, 'src', 'lib', 'gone-410.ts'), 'utf8'),
);
const prunedPaths = new Set(pruningEntries.map((entry) => normalizePath(entry.source)));
const sitemapInventory = loadIndexedPaths();
const calcMetadata = loadCalcMetadata(prunedPaths, gone410);
const buildInventory = buildDir
  ? loadBuiltPages(buildDir)
  : { pages: null, errors: [] };

let flattened;
let chains = [];
let cycles = [];
try {
  ({ flattened, chains } = flattenRedirectGraph(rawMap));
} catch (error) {
  if (!(error instanceof RedirectCycleError)) throw error;
  cycles = error.cycles;
  flattened = new Map();
}

const semantic = auditFlattenedRedirects({
  rawMap,
  flattened,
  gonePaths: gone410,
  indexedPaths: sitemapInventory.paths,
  targetMetadata: calcMetadata.routes,
  categoryAvailability: calcMetadata.categoryAvailability,
  builtPages: buildInventory.pages,
});

const retiredTargets = groupTargetIssues(semantic.retiredTargetIssues);
const canonicalTargets = groupTargetIssues(semantic.canonicalTargetIssues);
const invalidTargets = groupTargetIssues(semantic.invalidTargetIssues);
const nonDistributableTargets = groupTargetIssues(
  semantic.nonDistributableTargetIssues,
);

const report = {
  summary: {
    pruningRules: pruningEntries.length,
    staticExactRules: staticParsed.entries.length,
    staticIgnoredRules: staticParsed.ignored.length,
    combinedSources: rawMap.size,
    overlaps: overlaps.length,
    redirectChains: chains.length,
    cycles: cycles.length,
    indexedPaths: sitemapInventory.paths.size,
    sitemapInventoryErrors: sitemapInventory.errors.length,
    buildInventoryErrors: buildInventory.errors.length,
    sourceGoneConflicts: semantic.sourceGoneConflicts.length,
    retiredTargetSources: semantic.retiredTargetIssues.length,
    retiredTargets: retiredTargets.length,
    canonicalTargetSources: semantic.canonicalTargetIssues.length,
    canonicalTargets: canonicalTargets.length,
    invalidTargetSources: semantic.invalidTargetIssues.length,
    invalidTargets: invalidTargets.length,
    nonDistributableTargetSources:
      semantic.nonDistributableTargetIssues.length,
    nonDistributableTargets: nonDistributableTargets.length,
  },
  inventoryErrors: [...sitemapInventory.errors, ...buildInventory.errors],
  cycles,
  chains,
  sourceGoneConflicts: semantic.sourceGoneConflicts,
  retiredTargets,
  canonicalTargets,
  invalidTargets,
  nonDistributableTargets,
  overlaps,
  ignoredStaticRules: staticParsed.ignored,
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const summary = report.summary;
  console.log(
    `[redirect-graph] ${summary.combinedSources} sources combinados ` +
      `(${summary.pruningRules} pruning + ${summary.staticExactRules} _redirects exactos)`,
  );
  console.log(
    `[redirect-graph] cadenas=${summary.redirectChains} ciclos=${summary.cycles} ` +
      `source-410+redirect=${summary.sourceGoneConflicts} ` +
      `targets-410=${summary.retiredTargets} canonical-alias=${summary.canonicalTargets} ` +
      `targets-inválidos=${summary.invalidTargets} ` +
      `targets-no-distribuibles=${summary.nonDistributableTargets}`,
  );

  if (report.inventoryErrors.length > 0) {
    console.error('\n== INVENTARIO INCOMPLETO (FATAL) ==');
    for (const error of report.inventoryErrors) console.error(`  ${error}`);
  }

  if (cycles.length > 0) {
    console.error('\n== CICLOS (FATAL) ==');
    for (const cycle of cycles) console.error(`  ${cycle.join(' -> ')}`);
  }

  if (verbose && chains.length > 0) {
    console.log(`\n== CADENAS APLANADAS POR EL WORKER (${chains.length}) ==`);
    for (const chain of chains) console.log(`  ${chain.path.join(' -> ')}`);
  }

  if (report.sourceGoneConflicts.length > 0) {
    console.error(
      `\n== SOURCES 410 CON REDIRECT INALCANZABLE (${report.sourceGoneConflicts.length}, FATAL) ==`,
    );
    for (const issue of report.sourceGoneConflicts) {
      console.error(
        `  ${issue.source} [GONE 410] + ${issue.status} → ${issue.target} (${issue.origin})`,
      );
    }
  }

  if (report.retiredTargets.length > 0) {
    console.error(`\n== DESTINOS FINALES RETIRADOS / 410 (${report.retiredTargets.length}, FATAL) ==`);
    for (const issue of report.retiredTargets) {
      console.error(`  ${issue.target}`);
      for (const source of issue.sources) console.error(`    <- ${source}`);
    }
  }

  if (report.canonicalTargets.length > 0) {
    console.error(
      `\n== DESTINOS FINALES NO CANÓNICOS (${report.canonicalTargets.length}, FATAL) ==`,
    );
    for (const issue of report.canonicalTargets) {
      console.error(
        `  ${issue.target} → canonical ${issue.canonicalTarget} [${issue.reasons.join(', ')}]`,
      );
      if (issue.file) console.error(`    data: ${issue.file}`);
      for (const source of issue.sources) console.error(`    <- ${source}`);
    }
  }

  if (report.invalidTargets.length > 0) {
    console.error(
      `\n== DESTINOS FINALES INVÁLIDOS (${report.invalidTargets.length}, FATAL) ==`,
    );
    for (const issue of report.invalidTargets) {
      console.error(`  ${issue.target} [${issue.reasons.join(', ')}]`);
      if (issue.file) console.error(`    data: ${issue.file}`);
      for (const source of issue.sources) console.error(`    <- ${source}`);
    }
  }

  if (report.nonDistributableTargets.length > 0) {
    console.warn(
      `\n== DESTINOS FINALES NO DISTRIBUIBLES (${report.nonDistributableTargets.length} targets; ` +
        `${summary.nonDistributableTargetSources} sources) ==`,
    );
    for (const issue of report.nonDistributableTargets) {
      console.warn(`  ${issue.target} [${issue.reasons.join(', ')}]`);
      console.warn(`    data: ${issue.file}`);
      for (const source of issue.sources) console.warn(`    <- ${source}`);
    }
    if (!strictTargets) {
      console.warn(
        '  Aviso no bloqueante. Usá --strict-targets para convertir esta deuda en gate fatal.',
      );
    }
  }
}

const fatal =
  report.inventoryErrors.length > 0 ||
  cycles.length > 0 ||
  semantic.sourceGoneConflicts.length > 0 ||
  semantic.retiredTargetIssues.length > 0 ||
  semantic.canonicalTargetIssues.length > 0 ||
  semantic.invalidTargetIssues.length > 0 ||
  (strictTargets && semantic.nonDistributableTargetIssues.length > 0);
if (check && fatal) process.exit(1);
