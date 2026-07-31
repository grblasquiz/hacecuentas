import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
const loop = readFileSync(join(root, 'src/components/CalculatorResultLoop.astro'), 'utf8');
const aguinaldo = readFileSync(join(root, 'src/pages/trabajo/aguinaldo.astro'), 'utf8');
const calculator = readFileSync(join(root, 'src/components/Calculator.astro'), 'utf8');
const nextCalcs = readFileSync(join(root, 'src/components/NextCalcs.astro'), 'utf8');

describe('post-result loop', () => {
  it('uses the dashboard storage contract and never sends result values to analytics', () => {
    expect(loop).toContain("localStorage.setItem('hc:saved-calcs'");
    expect(loop).toContain("emit('save_to_dashboard')");
    expect(loop).not.toMatch(/emit\([^)]*(resultado|resultText\(\))/);
  });

  it('covers the unified funnel and contextual actions', () => {
    for (const event of ['calculator_start', 'calculator_complete', 'result_share', 'save_to_dashboard', 'related_click']) {
      expect(loop).toContain(`'${event}'`);
    }
    expect(aguinaldo).toContain("href: '/trabajo/sueldo-bruto-y-neto'");
    expect(aguinaldo).toContain("href: '/trabajo/liquidacion-final'");
    expect(calculator).toContain("productTrack('calculator_start')");
    expect(calculator).toContain("productTrack('calculator_complete')");
    expect(calculator).toContain("productTrack('result_share'");
    expect(calculator).toContain("productTrack('save_to_dashboard'");
    expect(nextCalcs).toContain("window.hcTrack('related_click'");
  });

  it('adds the legal-date calendar reminder', () => {
    expect(aguinaldo).toContain("date: '2026-12-18'");
    expect(loop).toContain("type: 'text/calendar;charset=utf-8'");
  });
});
