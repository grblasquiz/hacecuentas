import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync('src/pages/feriados-colombia-2026.astro', 'utf8');
const component = readFileSync('src/components/generated/FeriadosColombiaExperience.astro', 'utf8');

describe('calendario canónico de festivos Colombia 2026', () => {
  it('publica los 18 festivos nacionales y la consulta exacta', () => {
    expect(page).toContain('Calendario Colombia 2026: 18 festivos y puentes');
    expect(component).toContain('<h1>Calendario Colombia 2026: 18 festivos y puentes</h1>');
    expect(component).toContain('18 festivos nacionales');
  });

  it('contiene exactamente 18 fechas y conserva el próximo festivo real', () => {
    const dates = component.match(/\["2026-\d{2}-\d{2}",/g) ?? [];
    expect(dates).toHaveLength(18);
    expect(component).toContain('["2026-08-07","Viernes","Batalla de Boyacá"');
  });

  it('elimina el festivo y la ley inexistentes', () => {
    expect(page).not.toMatch(/Virgen de Chiquinquirá|Ley 2578|19 festivos/i);
    expect(component).not.toMatch(/Virgen de Chiquinquirá|Ley 2578|19 festivos|Nuevo festivo en 2026/i);
  });

  it('cita la Ley 51 de 1983 y no revive la calculadora retirada', () => {
    expect(page).toContain('ley_0051_1983.html');
    expect(component).toContain('ley_0051_1983.html');
    expect(page).not.toContain('/co/calculadora-festivos-colombia-2026-calendario-puentes');
    expect(component).not.toContain('/co/calculadora-festivos-colombia-2026-calendario-puentes');
  });
});
