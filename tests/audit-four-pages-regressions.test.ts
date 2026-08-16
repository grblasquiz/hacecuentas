import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { interesJudicialTasa } from '../src/lib/formulas/interes-judicial-tasa';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('regresiones de las cuatro páginas auditadas', () => {
  it('interés judicial prioriza la tasa manual aunque exista jurisdicción', () => {
    const result = interesJudicialTasa({ capital: 1_000_000, tasaAnual: 10, jurisdiccion: 'nacion', fechaDesde: '2025-01-01', fechaHasta: '2026-01-01' });
    expect(result.interesesGenerados).toBe(100_000);
    expect(result.tasaAplicada).toContain('tasa manual informada');
    expect(result._insight.text).toContain('no es una liquidación judicial');
  });

  it('interés judicial usa fecha dinámica y fuentes enlazadas', () => {
    const component = read('src/components/InteresJudicialTasa.astro');
    expect(component).toContain('const now = new Date()');
    expect(component).toContain('href={typeof s');
    expect(component).toContain("$('ijt-quick').innerHTML");
    expect(component).not.toContain("const D_HASTA = '2026-07-14'");
  });

  it('construcción expone rango, cotización propia y contingencia', () => {
    const component = read('src/components/CostoM2Experience.astro');
    expect(component).toContain('m2-custom');
    expect(component).toContain('m2-contingency');
    expect(component).toContain('Rango probable');
    expect(component).not.toContain('Promedio mensual');
  });

  it('Ganancias usa fuente única, enlaces reales y estados accesibles', () => {
    const component = read('src/components/generated/EscalaGananciasBlogExperience.astro');
    expect(component).toContain("GANANCIAS_2026");
    expect(component).toContain('aria-pressed="true"');
    expect(component).toContain('aria-expanded="true"');
    expect(component).toContain('href="/ganancias-cuarta-categoria"');
    expect(component).not.toContain('Abriendo calculadora');
  });

  it('IMC prioriza rango saludable y deja fórmulas históricas opcionales', () => {
    const hub = read('src/lib/hubs/peso-ideal-imc.ts');
    const component = read('src/components/ImcExperience.astro');
    expect(hub).toContain('rango de peso saludable');
    expect(hub).toContain("value: ''");
    expect(component).toContain('Referencias históricas');
    expect(component).toContain('no cambia el IMC');
  });
});
