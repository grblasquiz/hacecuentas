import { describe, expect, it } from 'vitest';
import {
  buildHreflangCluster,
  isHreflangEligibleCalc,
  isSelfCanonicalUrl,
  resolveHreflangRoute,
  type HreflangIndex,
} from '../src/lib/hreflang.ts';

describe('hreflang — elegibilidad', () => {
  it('acepta únicamente calcs distribuibles y autocanónicas', () => {
    expect(isHreflangEligibleCalc({ slug: 'calculadora-viva' })).toBe(true);
    expect(isHreflangEligibleCalc({ slug: 'calculadora-noindex', noindex: true })).toBe(false);
    expect(isHreflangEligibleCalc({ slug: 'calculadora-draft', status: 'draft' })).toBe(false);
    expect(
      isHreflangEligibleCalc({
        slug: 'alias',
        canonicalSlug: 'calculadora-viva',
      }),
    ).toBe(false);
    expect(
      isHreflangEligibleCalc({
        slug: 'calculadora-viva',
        canonicalSlug: 'calculadora-viva',
      }),
    ).toBe(true);
  });

  it('sólo permite fallback self en URLs autocanónicas', () => {
    expect(
      isSelfCanonicalUrl(
        '/calculadora-viva.html',
        'https://hacecuentas.com/calculadora-viva',
      ),
    ).toBe(true);
    expect(
      isSelfCanonicalUrl(
        '/tabla/alias',
        'https://hacecuentas.com/datos-canonicos',
      ),
    ).toBe(false);
    expect(
      isSelfCanonicalUrl(
        '/calculadora-viva',
        'https://otro-sitio.example/calculadora-viva',
      ),
    ).toBe(false);
  });

  it('excluye rutas reales de pruning 301 y Gone 410', () => {
    expect(isHreflangEligibleCalc({ slug: 'calculadora-12-cuotas-sin-interes' })).toBe(false);
    expect(
      isHreflangEligibleCalc({ slug: 'calculadora-aave-flash-loan-arbitraje-fee-net-profit' }),
    ).toBe(false);
  });
});

describe('hreflang — resolución por índice único', () => {
  const index: HreflangIndex = {
    es: [{ slug: 'calculadora-imc', clusterKey: 'calculadora-imc' }],
    en: [{ slug: 'bmi-calculator', clusterKey: 'calculadora-imc' }],
    pt: [{ slug: 'calculadora-imc', clusterKey: 'calculadora-imc' }],
    mx: [{ slug: 'calculadora-imc-mexico', clusterKey: 'calculadora-imc' }],
  };

  it('construye el mismo set desde cada miembro (reciprocidad por construcción)', () => {
    const fromEs = resolveHreflangRoute(index, 'es', 'calculadora-imc').tags;
    const fromEn = resolveHreflangRoute(index, 'en', 'bmi-calculator').tags;
    const fromPt = resolveHreflangRoute(index, 'pt', 'calculadora-imc').tags;
    const fromMx = resolveHreflangRoute(index, 'mx', 'calculadora-imc-mexico').tags;

    expect(fromEs).toEqual(fromEn);
    expect(fromEs).toEqual(fromPt);
    expect(fromEs).toEqual(fromMx);
    expect(fromEs).toEqual([
      { lang: 'es-AR', href: 'https://hacecuentas.com/calculadora-imc' },
      { lang: 'en-US', href: 'https://hacecuentas.com/en/bmi-calculator' },
      { lang: 'en', href: 'https://hacecuentas.com/en/bmi-calculator' },
      { lang: 'pt-BR', href: 'https://hacecuentas.com/pt/calculadora-imc' },
      { lang: 'es-MX', href: 'https://hacecuentas.com/mx/calculadora-imc-mexico' },
      { lang: 'x-default', href: 'https://hacecuentas.com/calculadora-imc' },
    ]);
  });

  it('suprime hreflang si la página actual no está en el índice distribuible', () => {
    expect(resolveHreflangRoute(index, 'en', 'alias-noindex').tags).toEqual([]);
  });

  it('deja el fallback self para una página distribuible standalone', () => {
    const standalone: HreflangIndex = {
      pe: [{ slug: 'calculadora-solo-peru' }],
    };
    expect(resolveHreflangRoute(standalone, 'pe', 'calculadora-solo-peru')).toEqual({
      members: { pe: 'calculadora-solo-peru' },
      tags: undefined,
    });
  });

  it('omite un locale ambiguo en vez de elegir un alternate arbitrario', () => {
    const ambiguous: HreflangIndex = {
      es: [{ slug: 'calculadora-base', clusterKey: 'calculadora-base' }],
      en: [
        { slug: 'first', clusterKey: 'calculadora-base' },
        { slug: 'second', clusterKey: 'calculadora-base' },
      ],
    };

    expect(resolveHreflangRoute(ambiguous, 'es', 'calculadora-base').tags).toBeUndefined();
    expect(resolveHreflangRoute(ambiguous, 'en', 'first')).toEqual({
      members: { en: 'first' },
      tags: undefined,
    });
  });
});

describe('hreflang — construcción básica', () => {
  it('no crea cluster para un único miembro', () => {
    expect(buildHreflangCluster({ es: 'calculadora-sola' })).toBeUndefined();
  });
});
