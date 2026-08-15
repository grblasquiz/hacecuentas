import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const guide = readFileSync(new URL('../src/components/ActionableResultGuide.astro', import.meta.url), 'utf8');
const calculator = readFileSync(new URL('../src/components/Calculator.astro', import.meta.url), 'utf8');

describe('guía accionable postresultado', () => {
  it('cubre las categorías de mayor intención y tres idiomas', () => {
    for (const category of ['trabaj', 'impuest', 'finanz', 'salud', 'vivienda', 'negocio']) expect(guide).toContain(category);
    expect(guide).toContain("lang === 'en'");
    expect(guide).toContain("lang.startsWith('pt')");
  });
  it('se integra globalmente después del resultado', () => {
    expect(calculator).toContain('import ActionableResultGuide');
    expect(calculator).toContain('<ActionableResultGuide category={config.category} lang={lang} />');
    expect(guide).toContain('.calc-results:not([hidden])');
  });
});
