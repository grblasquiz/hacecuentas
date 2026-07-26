import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  canDistributeCalc,
  canServeCalc,
} from '../src/lib/content-policy.ts';

const COLLECTIONS = [
  ['calcs', ''],
  ['calcs-en', 'en/'],
  ['calcs-es', 'es/'],
  ['calcs-co', 'co/'],
  ['calcs-mx', 'mx/'],
  ['calcs-cl', 'cl/'],
  ['calcs-pe', 'pe/'],
  ['calcs-ec', 'ec/'],
  ['calcs-ve', 've/'],
  ['calcs-py', 'py/'],
  ['calcs-uy', 'uy/'],
  ['calcs-do', 'do/'],
  ['calcs-pt', 'pt/'],
  ['calcs-pt-pt', 'pt-pt/'],
] as const;

describe('política de aliases y API de cálculo', () => {
  it('sirve aliases canónicos existentes pero no los distribuye', () => {
    const alias = {
      slug: 'alias-historico',
      canonicalSlug: 'calculadora-canonica',
    };
    expect(canServeCalc(alias)).toBe(true);
    expect(canDistributeCalc(alias)).toBe(false);
    expect(
      canDistributeCalc({ ...alias, canonicalSlug: alias.slug }),
    ).toBe(true);
  });

  it('aplica pruning con el prefijo localizado', () => {
    const localizedPruned = { slug: 'annual-salary-to-hourly-rate-converter' };
    expect(canServeCalc(localizedPruned)).toBe(true);
    expect(canServeCalc(localizedPruned, 'en/')).toBe(false);
  });

  it('spec y compute cubren las 14 colecciones con la misma política de servicio', () => {
    const specSource = readFileSync(
      'src/pages/api/calc/[slug].json.ts',
      'utf8',
    );
    const computeSource = readFileSync(
      'scripts/generate-compute-index.ts',
      'utf8',
    );
    expect(specSource).toContain('canServeCalc(data, col.prefix)');
    expect(computeSource).toContain('canServeCalc(d, pathPrefix)');

    for (const [collection] of COLLECTIONS) {
      const declaration =
        collection === 'calcs' ? '  calcs:' : `  '${collection}':`;
      expect(specSource, `spec sin ${collection}`).toContain(declaration);
    }

    const withoutFormula: string[] = [];
    for (const [collection, prefix] of COLLECTIONS) {
      const directory = `src/content/${collection}`;
      for (const file of readdirSync(directory).filter((name) =>
        name.endsWith('.json'),
      )) {
        const calc = JSON.parse(readFileSync(`${directory}/${file}`, 'utf8'));
        if (
          !calc.slug ||
          !calc.formulaId ||
          !canServeCalc(calc, prefix)
        ) {
          continue;
        }
        if (!existsSync(`src/lib/formulas/${calc.formulaId}.ts`)) {
          withoutFormula.push(`${collection}/${calc.slug}`);
        }
      }
    }
    expect(withoutFormula, 'spec 200 cuyo compute sería 404').toEqual([]);
  });

  it('viajes queda en una sola página y su page 2 histórica redirige al hub', () => {
    const calcs = readdirSync('src/content/calcs')
      .filter((file) => file.endsWith('.json'))
      .map((file) =>
        JSON.parse(readFileSync(`src/content/calcs/${file}`, 'utf8')),
      )
      .filter(
        (calc) =>
          calc.category === 'viajes' && canDistributeCalc(calc),
      );
    expect(calcs).toHaveLength(60);

    const redirects = readFileSync('public/_redirects', 'utf8');
    expect(redirects).toMatch(
      /^\/categoria\/viajes\/2\s+\/categoria\/viajes\s+301$/m,
    );
  });
});
