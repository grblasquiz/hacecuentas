import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync('src/pages/feriados-colombia-2026.astro', 'utf8');
const component = readFileSync('src/components/generated/FeriadosColombiaExperience.astro', 'utf8');

describe('calendario canónico de festivos Colombia 2026', () => {
  it('publica los 19 festivos nacionales y la consulta exacta', () => {
    expect(page).toContain('Calendario Colombia 2026: 19 festivos y puentes');
    expect(component).toContain('<h1>Calendario Colombia 2026: 19 festivos y puentes</h1>');
    expect(component).toContain('19 festivos nacionales');
  });

  it('contiene exactamente 19 fechas y conserva el próximo festivo real', () => {
    const dates = component.match(/\["2026-\d{2}-\d{2}",/g) ?? [];
    expect(dates).toHaveLength(19);
    expect(component).toContain('["2026-08-17","Lunes","Asunción de la Virgen"');
  });

  it('incorpora el festivo creado por la Ley 2578 de 2026', () => {
    expect(page).toMatch(/Chiquinquirá|Ley 2578|19 festivos/i);
    expect(component).toContain('["2026-07-13","Lunes","Nuestra Señora del Rosario de Chiquinquirá"');
    expect(page).toContain('https://www.suin-juriscol.gov.co/viewDocument.asp?id=30056513');
  });

  it('cita la Ley 51 de 1983 y no revive la calculadora retirada', () => {
    expect(page).toContain('ley_0051_1983.html');
    expect(component).toContain('ley_0051_1983.html');
    expect(page).not.toContain('/co/calculadora-festivos-colombia-2026-calendario-puentes');
    expect(component).not.toContain('/co/calculadora-festivos-colombia-2026-calendario-puentes');
  });
});
