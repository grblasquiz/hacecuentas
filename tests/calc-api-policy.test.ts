import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { canDistributeCalc, canServeCalc } from '../src/lib/content-policy.ts';
import computeIndex from '../src/lib/calc-compute-index.json';

describe('política de aliases y API de cálculo', () => {
  it('sirve aliases canónicos existentes pero no los distribuye', () => {
    const alias = { slug: 'alias-historico', canonicalSlug: 'calculadora-canonica' };
    expect(canServeCalc(alias)).toBe(true);
    expect(canDistributeCalc(alias)).toBe(false);
    expect(canDistributeCalc({ ...alias, canonicalSlug: alias.slug })).toBe(true);
  });

  it('aplica pruning con el prefijo localizado', () => {
    const localizedPruned = { slug: 'annual-salary-to-hourly-rate-converter' };
    expect(canServeCalc(localizedPruned)).toBe(true);
    expect(canServeCalc(localizedPruned, 'en/')).toBe(false);
  });

  it('spec y compute usan el índice programático preservado tras la migración', () => {
    const specSource = readFileSync('src/pages/api/calc/[slug].json.ts', 'utf8');
    const computeSource = readFileSync('src/pages/api/calc/[slug]/compute.ts', 'utf8');
    expect(specSource).toContain('describeCalc(slug)');
    expect(computeSource).toContain('runCompute(slug, provided, lang)');
    expect(Object.keys(computeIndex).length).toBeGreaterThan(3000);

    const withoutFormula = Object.entries(computeIndex)
      .filter(([, calc]) => !existsSync(`src/lib/formulas/${calc.f}.ts`))
      .map(([slug]) => slug);
    expect(withoutFormula, 'spec 200 cuyo compute sería 501').toEqual([]);
  });

  it('conserva el contrato programático de viajes y redirige su page 2 histórica', () => {
    const travelContracts = Object.values(computeIndex).filter((calc) => calc.cat === 'viajes' && !calc.p);
    expect(travelContracts.length).toBeGreaterThan(50);
    expect(readFileSync('public/_redirects', 'utf8')).toMatch(
      /^\/categoria\/viajes\/2\s+\/viajes\s+301$/m,
    );
  });
});
