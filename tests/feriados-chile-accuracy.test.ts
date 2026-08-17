import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { FERIADOS_CL_2026, FERIADOS_LATAM_2026 } from '../src/lib/data/feriados-latam-2026';

const pagePath = fileURLToPath(new URL('../src/pages/feriados-chile-2026.astro', import.meta.url));
const page = readFileSync(pagePath, 'utf8');

describe('calendario Chile 2026', () => {
  it('publica los 16 feriados nacionales con cinco irrenunciables', () => {
    expect(FERIADOS_CL_2026).toHaveLength(16);
    expect(FERIADOS_CL_2026.filter((feriado) => feriado.tipo === 'Irrenunciable')).toHaveLength(5);
    expect(FERIADOS_CL_2026.map((feriado) => feriado.fecha)).toContain('2026-09-18');
    expect(FERIADOS_CL_2026.map((feriado) => feriado.fecha)).toContain('2026-12-25');
  });

  it('alinea title y H1 con la consulta exacta feriados Chile 2026', () => {
    expect(page).toContain("const title = 'Feriados Chile 2026: 16 fechas y 5 irrenunciables'");
    expect(page).toContain('Feriados Chile <span class="cf-yr">2026</span>: {total} fechas oficiales');
  });

  it('distingue los feriados territoriales sin sumarlos al total nacional', () => {
    expect(page).toContain("fecha: '2026-06-07'");
    expect(page).toContain("fecha: '2026-08-20'");
    expect(page).toContain('Comunas de Chillán y Chillán Viejo');
    expect(page).toContain('No se suman a los 16 nacionales');
    expect(FERIADOS_LATAM_2026.chile.dataAsOf).toBe('2026-08-17');
    expect(FERIADOS_LATAM_2026.chile.fuentes[1].url).toContain('gob.cl/noticias/feriados-2026');
  });

  it('explica el alcance legal y sus excepciones con fuente oficial', () => {
    expect(FERIADOS_LATAM_2026.chile.notaTipo).toContain('trabajadores del comercio');
    expect(FERIADOS_LATAM_2026.chile.notaTipo).toContain('excepciones');
    expect(FERIADOS_LATAM_2026.chile.fuentes[0].url).toBe('https://www.dt.gob.cl/portal/1628/w3-article-95017.html');
    expect(page).not.toContain('Ley 19.668');
  });

  it('no enlaza la calculadora de feriados retirada', () => {
    expect(page).not.toContain('calculadora-feriados-argentina-2026-calendario');
  });
});
