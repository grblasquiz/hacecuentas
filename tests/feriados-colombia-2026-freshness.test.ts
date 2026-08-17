import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync('src/pages/feriados-colombia-2026.astro', 'utf8');
const experience = readFileSync('src/components/generated/FeriadosColombiaExperience.astro', 'utf8');

describe('calendario Colombia 2026 actualizado por Ley 2578', () => {
  it('publica 19 festivos en metadata, H1 y contenido', () => {
    expect(page).toContain('Calendario Colombia 2026: 19 festivos y puentes');
    expect(page).toContain('Los 19 festivos nacionales de Colombia en 2026');
    expect(experience).toContain('Calendario Colombia 2026: 19 festivos y puentes');
    expect(experience).not.toContain('18 festivos');
  });

  it('incluye el nuevo descanso de Chiquinquirá y la fuente legal primaria', () => {
    expect(experience).toContain('2026-07-13');
    expect(experience).toContain('Nuestra Señora del Rosario de Chiquinquirá');
    expect(page).toContain('https://www.suin-juriscol.gov.co/viewDocument.asp?id=30056513');
    expect(page).toContain('Ley 2578 de 2026');
  });

  it('deja un próximo festivo vigente también en el HTML sin JavaScript', () => {
    expect(experience).toContain('data-next-date>17 AGO');
    expect(experience).toContain('data-next-name>Asunción de la Virgen');
    expect(experience).not.toContain('data-next-date>7 AGO');
  });
});
