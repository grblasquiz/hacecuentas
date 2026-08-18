import { describe, expect, it } from 'vitest';
import { FERIADOS_LATAM_2027 } from '../src/lib/data/feriados-latam-2027';

// El bug más caro en páginas de calendario es un día de la semana que no
// corresponde a la fecha: acá se recomputa cada uno contra el calendario real.
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

describe('feriados LATAM 2027', () => {
  const paises = Object.values(FERIADOS_LATAM_2027);

  it('cubre los 6 países con slug 2027 y datos completos', () => {
    expect(paises).toHaveLength(6);
    for (const p of paises) {
      expect(p.slug).toMatch(/^feriados-[a-z]+-2027$/);
      expect(p.feriados.length).toBeGreaterThanOrEqual(7);
      expect(p.fuentes.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('cada día de la semana coincide con la fecha real y todas las fechas son de 2027', () => {
    for (const p of paises) {
      for (const f of p.feriados) {
        expect(f.fecha, `${p.pais} ${f.nombre}`).toMatch(/^2027-\d{2}-\d{2}$/);
        const real = DIAS[new Date(f.fecha + 'T12:00:00Z').getUTCDay()];
        expect(f.dia, `${p.pais} ${f.fecha} ${f.nombre}`).toBe(real);
      }
    }
  });

  it('las listas vienen ordenadas por fecha y sin duplicados', () => {
    for (const p of paises) {
      const fechas = p.feriados.map((f) => f.fecha);
      expect(fechas, p.pais).toEqual([...fechas].sort());
      expect(new Set(fechas).size, p.pais).toBe(fechas.length);
    }
  });

  it('totales por país según la ley vigente', () => {
    expect(FERIADOS_LATAM_2027.argentina.feriados).toHaveLength(16);
    expect(FERIADOS_LATAM_2027.mexico.feriados).toHaveLength(7);
    expect(FERIADOS_LATAM_2027.colombia.feriados).toHaveLength(19);
    expect(FERIADOS_LATAM_2027.chile.feriados).toHaveLength(17);
    expect(FERIADOS_LATAM_2027.peru.feriados).toHaveLength(16);
    expect(FERIADOS_LATAM_2027.ecuador.feriados).toHaveLength(11);
    // Chile: 5 irrenunciables (el 17-sep de la Ley 20.983 NO es irrenunciable).
    expect(FERIADOS_LATAM_2027.chile.feriados.filter((f) => f.tipo === 'Irrenunciable')).toHaveLength(5);
  });
});
