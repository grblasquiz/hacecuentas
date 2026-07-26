import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  RedirectCycleError,
  auditFlattenedRedirects,
  combineRedirectEntries,
  flattenRedirectGraph,
  parseCloudflareRedirects,
  parsePruningRedirects,
  toWorkerRedirectMap,
} from '../scripts/lib/redirect-graph.mjs';

describe('grafo combinado de redirects', () => {
  it('parsea reglas exactas y deja patterns fuera del mapa del Worker', () => {
    const parsed = parseCloudflareRedirects(`
      /vieja /intermedia 301
      /temporal /nueva 302
      /docs/* /docs/:splat 301
      https://otro.test/foo /bar 301
    `);

    expect(parsed.entries).toEqual([
      {
        source: '/vieja',
        destination: '/intermedia',
        status: 301,
        origin: '_redirects',
        line: 2,
      },
      {
        source: '/temporal',
        destination: '/nueva',
        status: 302,
        origin: '_redirects',
        line: 3,
      },
    ]);
    expect(parsed.ignored).toHaveLength(1);
  });

  it('da precedencia a _redirects y aplana cada source al destino final', () => {
    const pruning = parsePruningRedirects(`
      export const PRUNING_REDIRECTS = {
        '/a': '/b',
        '/b': '/c',
        '/override': '/viejo',
      };
    `);
    const staticEntries = parseCloudflareRedirects(`
      /c /final 308
      /override /actual 302
    `).entries;
    const { map, overlaps } = combineRedirectEntries(pruning, staticEntries);
    const { flattened, chains } = flattenRedirectGraph(map);
    const workerMap = toWorkerRedirectMap(flattened);

    expect(overlaps).toHaveLength(1);
    expect(workerMap['/a']).toEqual({ d: '/final', s: 301 });
    expect(workerMap['/b']).toEqual({ d: '/final', s: 301 });
    expect(workerMap['/c']).toEqual({ d: '/final', s: 308 });
    expect(workerMap['/override']).toEqual({ d: '/actual', s: 302 });
    expect(chains.find((chain) => chain.source === '/a')?.path).toEqual([
      '/a',
      '/b',
      '/c',
      '/final',
    ]);
  });

  it('falla de forma determinista ante ciclos', () => {
    const entries = parseCloudflareRedirects(`
      /a /b 301
      /b /c 301
      /c /a 301
    `).entries;
    const { map } = combineRedirectEntries([], entries);

    expect(() => flattenRedirectGraph(map)).toThrow(RedirectCycleError);
    expect(() => flattenRedirectGraph(map)).toThrow('/a -> /b -> /c -> /a');
  });

  it('el grafo real queda sin segundos saltos internos', () => {
    const root = resolve(import.meta.dirname, '..');
    const pruning = parsePruningRedirects(
      readFileSync(resolve(root, 'src/lib/pruning-redirects.ts'), 'utf8'),
    );
    const staticEntries = parseCloudflareRedirects(
      readFileSync(resolve(root, 'public/_redirects'), 'utf8'),
    ).entries;
    const { map } = combineRedirectEntries(pruning, staticEntries);
    const { flattened, chains } = flattenRedirectGraph(map);

    expect(chains.length).toBeGreaterThan(0);
    for (const entry of flattened.values()) {
      expect(map.has(entry.destination), `segundo salto pendiente: ${entry.destination}`).toBe(false);
    }
  });

  it('bloquea sources simultáneamente 410+redirect y destinos finales inexistentes', () => {
    const { map } = combineRedirectEntries(
      [],
      parseCloudflareRedirects(`
        /gone-source /destino-vivo 301
        /origen /no-existe 301
      `).entries,
    );
    const { flattened } = flattenRedirectGraph(map);
    const audit = auditFlattenedRedirects({
      rawMap: map,
      flattened,
      gonePaths: new Set(['/gone-source']),
      indexedPaths: new Set(['/destino-vivo']),
    });

    expect(audit.sourceGoneConflicts).toMatchObject([
      { source: '/gone-source', target: '/destino-vivo' },
    ]);
    expect(audit.invalidTargetIssues).toMatchObject([
      { source: '/origen', target: '/no-existe' },
    ]);
  });

  it('distingue canonical aliases, hubs vacíos y deuda noindex opcional', () => {
    const { map } = combineRedirectEntries(
      [],
      parseCloudflareRedirects(`
        /alias-source /alias 301
        /hub-source /categoria/vacia 301
        /legacy-source /calc-noindex 301
      `).entries,
    );
    const { flattened } = flattenRedirectGraph(map);
    const audit = auditFlattenedRedirects({
      rawMap: map,
      flattened,
      indexedPaths: new Set(),
      targetMetadata: new Map([
        [
          '/alias',
          {
            canonicalTarget: '/canonica',
            nonDistributableReasons: [],
            expectedStatic: true,
          },
        ],
        [
          '/calc-noindex',
          {
            nonDistributableReasons: ['noindex=true'],
            expectedStatic: true,
          },
        ],
      ]),
      categoryAvailability: new Map([['vacia', 0]]),
    });

    expect(audit.canonicalTargetIssues).toMatchObject([
      {
        source: '/alias-source',
        target: '/alias',
        canonicalTarget: '/canonica',
      },
    ]);
    expect(audit.invalidTargetIssues).toMatchObject([
      {
        source: '/hub-source',
        target: '/categoria/vacia',
      },
    ]);
    expect(audit.nonDistributableTargetIssues).toMatchObject([
      {
        source: '/legacy-source',
        target: '/calc-noindex',
      },
    ]);
    expect(
      audit.invalidTargetIssues.some((issue) => issue.target === '/calc-noindex'),
    ).toBe(false);
  });

  it('detecta noindex y canonical ajeno en el HTML compilado de un hub', () => {
    const { map } = combineRedirectEntries(
      [],
      parseCloudflareRedirects(`
        /a /hub-noindex 301
        /b /hub-alias 301
      `).entries,
    );
    const { flattened } = flattenRedirectGraph(map);
    const audit = auditFlattenedRedirects({
      rawMap: map,
      flattened,
      indexedPaths: new Set(['/hub-noindex', '/hub-alias']),
      builtPages: new Map([
        ['/hub-noindex', { noindex: true, file: 'dist/client/hub-noindex.html' }],
        [
          '/hub-alias',
          {
            canonicalPath: '/hub-canonico',
            noindex: false,
            file: 'dist/client/hub-alias.html',
          },
        ],
      ]),
    });

    expect(audit.invalidTargetIssues[0]).toMatchObject({
      target: '/hub-noindex',
    });
    expect(audit.canonicalTargetIssues[0]).toMatchObject({
      target: '/hub-alias',
      canonicalTarget: '/hub-canonico',
    });
  });

  it('ejecuta el gate antes de generar el wrapper en build split y fast', () => {
    const root = resolve(import.meta.dirname, '..');
    const split = readFileSync(resolve(root, 'scripts/build-split.sh'), 'utf8');
    const fast = readFileSync(
      resolve(root, 'scripts/deploy-fast-page.sh'),
      'utf8',
    );
    const redirectGate = 'scripts/audit-redirect-graph.mjs --check';
    const wrapper = 'scripts/generate-worker-wrapper.mjs';

    expect(split.indexOf(redirectGate)).toBeGreaterThan(-1);
    expect(split.indexOf(redirectGate)).toBeLessThan(split.indexOf(wrapper));
    expect(split).toContain('scripts/audit-sitemap-coverage.mjs --check');
    expect(split).toContain('scripts/audit-hreflang.ts');
    expect(split).toContain('scripts/verify-build-integrity.ts');

    expect(fast.indexOf(redirectGate)).toBeGreaterThan(-1);
    expect(fast.indexOf(redirectGate)).toBeLessThan(fast.indexOf(wrapper));
  });
});
