import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const source = readFileSync(
  new URL('../src/components/HubCalculationTracking.astro', import.meta.url),
  'utf8',
);

describe('tracking de calculadoras bespoke', () => {
  it('incluye la raíz .hcm usada por los mockups nuevos', () => {
    expect(source).toContain('[class*="mockup-"], .hcm');
  });

  it('cubre el funnel mínimo además de calculator_used', () => {
    for (const event of [
      'hc_calculator_view',
      'hc_calculator_input_started',
      'hc_calculator_submit',
      'hc_calculator_success',
      'hc_calculator_validation_error',
    ]) {
      expect(source).toContain(`funnel('${event}'`);
    }
  });

  it('mantiene deduplicación por raíz y navegación Astro', () => {
    expect(source).toContain('new WeakSet<Element>()');
    expect(source).toContain("document.addEventListener('astro:page-load', registerViews)");
  });
});
