import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  HC_EVENTS,
  HC_ALLOWED_PARAMS,
  sanitizeAnalyticsParams,
  isHcEvent,
  hcTrack,
} from '../src/lib/analytics';

describe('catálogo de eventos', () => {
  it('incluye exactamente los eventos de la spec', () => {
    const spec = [
      'hc_home_search_focus', 'hc_search_started', 'hc_search_submitted',
      'hc_search_result_clicked', 'hc_search_no_results', 'hc_category_filter_used',
      'hc_calculator_view', 'hc_calculator_input_started', 'hc_calculator_submit',
      'hc_calculator_success', 'hc_calculator_validation_error', 'hc_calculator_runtime_error',
      'hc_result_copy', 'hc_result_share', 'hc_result_save', 'hc_result_email_open',
      'hc_result_email_sent', 'hc_formula_expanded', 'hc_related_calculator_clicked',
      'hc_feedback_positive', 'hc_feedback_negative', 'hc_recent_calculator_opened',
    ];
    expect([...HC_EVENTS].sort()).toEqual([...spec].sort());
  });

  it('isHcEvent valida contra el catálogo', () => {
    expect(isHcEvent('hc_calculator_success')).toBe(true);
    expect(isHcEvent('random_event')).toBe(false);
  });
});

describe('sanitizeAnalyticsParams — garantía anti-PII', () => {
  it('conserva sólo claves de la whitelist', () => {
    const out = sanitizeAnalyticsParams({
      calculator_slug: 'sueldo-en-mano-argentina',
      calculator_category: 'sueldos',
      country: 'AR',
      input_mode: 'neto',
      result_position: 3,
      logged_in: false,
      device_type: 'mobile',
    });
    expect(Object.keys(out).sort()).toEqual(
      ['calculator_category', 'calculator_slug', 'country', 'device_type', 'input_mode', 'logged_in', 'result_position'],
    );
    expect(out.result_position).toBe(3);
    expect(out.logged_in).toBe(false);
  });

  it('DESCARTA cualquier dato sensible (sueldos, resultados, emails, montos, fechas, médico, fiscal)', () => {
    const dirty = {
      calculator_slug: 'ok',
      // todo lo de abajo NO está en la whitelist → debe desaparecer
      salary: 3000000,
      sueldo: 3000000,
      result: '$6.375',
      resultado: 6375,
      value: 1000000,
      email: 'martin@example.com',
      monto: 500000,
      deuda: 250000,
      fecha_embarazo: '2026-03-01',
      medical_dose: '500mg',
      cuit: '20-12345678-9',
    };
    const out = sanitizeAnalyticsParams(dirty as any);
    expect(Object.keys(out)).toEqual(['calculator_slug']);
    // Ningún valor sensible sobrevive, en ninguna clave
    const serialized = JSON.stringify(out);
    for (const leak of ['3000000', '6375', '6.375', '1000000', 'martin@example.com', '500000', '250000', '2026-03-01', '500mg', '20-12345678-9']) {
      expect(serialized).not.toContain(leak);
    }
  });

  it('todas las claves de whitelist son categóricas (regresión de la lista)', () => {
    expect([...HC_ALLOWED_PARAMS]).toEqual([
      'calculator_slug', 'calculator_category', 'country', 'input_mode', 'search_term',
      'result_position', 'error_field', 'error_type', 'device_type', 'logged_in', 'source_page',
    ]);
  });

  it('recorta strings largos (anti-texto-libre) y descarta vacíos/NaN', () => {
    const out = sanitizeAnalyticsParams({
      search_term: 'a'.repeat(500),
      calculator_slug: '   ',
      result_position: NaN,
    });
    expect((out.search_term as string).length).toBe(120);
    expect('calculator_slug' in out).toBe(false);
    expect('result_position' in out).toBe(false);
  });
});

describe('hcTrack — dispatch seguro', () => {
  const g: any = globalThis;
  beforeEach(() => {
    g.window = g;
    g.dataLayer = [];
    g.gtag = vi.fn();
  });
  afterEach(() => {
    delete g.window; delete g.dataLayer; delete g.gtag;
    vi.restoreAllMocks();
  });

  it('emite a gtag + dataLayer con params saneados', () => {
    hcTrack('hc_calculator_success', { calculator_slug: 's', salary: 999999 } as any);
    expect(g.gtag).toHaveBeenCalledWith('event', 'hc_calculator_success', { calculator_slug: 's' });
    expect(g.dataLayer.at(-1)).toEqual({ event: 'hc_calculator_success', calculator_slug: 's' });
    expect(JSON.stringify(g.dataLayer)).not.toContain('999999');
  });

  it('no lanza si gtag no existe', () => {
    delete g.gtag;
    expect(() => hcTrack('hc_result_copy', { calculator_slug: 's' })).not.toThrow();
  });
});
