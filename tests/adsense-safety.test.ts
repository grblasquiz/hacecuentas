import { describe, expect, it } from 'vitest';
import { ADSENSE_SERVING_ENABLED, GOOGLE_CERTIFIED_CMP_ENABLED, isAdsenseExcludedPath } from '../src/lib/adsense';
import { canAdvertiseCalc, hasValidHumanEditorialReview } from '../src/lib/content-policy';

describe('seguridad de serving AdSense', () => {
  it('no permite serving mientras no exista CMP certificada', () => {
    expect(GOOGLE_CERTIFIED_CMP_ENABLED).toBe(false);
    expect(ADSENSE_SERVING_ENABLED).toBe(false);
  });

  it.each(['/buscar', '/buscar?q=', '/mi-hacecuentas', '/mi/alquiler', '/login', '/recuperar-clave', '/sugerir', '/sugerencias', '/contacto', '/embed/calculadora-imc', '/descargar/resultado', '/cookies', '/privacidad', '/terminos', '/aviso-legal', '/404', '/confirmacion', '/error'])('excluye %s', (path) => {
    expect(isAdsenseExcludedPath(path)).toBe(true);
  });

  it('no excluye una calculadora editorial completa', () => {
    expect(isAdsenseExcludedPath('/calculadora-imc')).toBe(false);
  });

  it('no confunde una aprobación automática con revisión editorial humana', () => {
    const calc = {
      slug: 'calculadora-ejemplo',
      sources: [{ name: 'Fuente', url: 'https://example.com/dato' }],
      explanation: 'x'.repeat(700),
      example: { result: '42' },
      sourceVerified: true,
      automatedTests: 'passed',
      editorialReview: 'approved',
      editorialReviewMethod: 'automated',
      editorialReviewer: 'Script',
      editorialReviewedAt: '2026-07-26',
    };
    expect(hasValidHumanEditorialReview(calc)).toBe(false);
    expect(canAdvertiseCalc(calc)).toBe(false);
  });

  it('habilita el gate editorial sólo con método, persona y fecha humana', () => {
    const calc = {
      slug: 'calculadora-ejemplo',
      sources: [{ name: 'Fuente', url: 'https://example.com/dato' }],
      explanation: 'x'.repeat(700),
      example: { result: '42' },
      sourceVerified: true,
      automatedTests: 'passed',
      editorialReview: 'approved',
      editorialReviewMethod: 'human',
      editorialReviewer: 'Martín Rodríguez',
      editorialReviewedAt: '2026-07-26',
    };
    expect(hasValidHumanEditorialReview(calc)).toBe(true);
    expect(canAdvertiseCalc(calc)).toBe(true);
  });

  it('aplica la misma restricción profesional a conceptos médicos traducidos', () => {
    const base = {
      sources: [{ name: 'Fuente', url: 'https://example.com/dato' }],
      explanation: 'x'.repeat(700),
      example: { result: '42' },
      sourceVerified: true,
      automatedTests: 'passed',
      editorialReview: 'approved',
      editorialReviewMethod: 'human',
      editorialReviewer: 'Editor humano',
      editorialReviewedAt: '2026-07-26',
    };
    expect(canAdvertiseCalc({ ...base, slug: 'daily-caffeine-safe-dose' })).toBe(false);
    expect(canAdvertiseCalc({ ...base, slug: 'dose-segura-cafeina' })).toBe(false);
  });
});
