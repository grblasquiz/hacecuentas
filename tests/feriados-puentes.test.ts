import { describe, expect, it } from 'vitest';
import { calcularPuentes } from '../src/lib/feriados-puentes';
import { FERIADOS_LATAM_2027 } from '../src/lib/data/feriados-latam-2027';
import type { Feriado } from '../src/lib/data/feriados-latam-2026';

const feriado = (fecha: string, dia: string): Feriado => ({ fecha, dia, nombre: 'Feriado', tipo: 'Nacional' });

describe('puentes con licencia en días hábiles', () => {
  it('Carnaval AR y EC no requiere licencia el lunes feriado', () => {
    for (const pais of ['argentina', 'ecuador']) {
      expect(calcularPuentes(FERIADOS_LATAM_2027[pais].feriados).some((f) => f.fecha === '2027-02-09')).toBe(false);
    }
  });
  it('Jueves Santo seguido de Viernes Santo no requiere licencia', () => {
    for (const pais of ['colombia', 'peru']) {
      expect(calcularPuentes(FERIADOS_LATAM_2027[pais].feriados).some((f) => f.fecha === '2027-03-25')).toBe(false);
    }
  });
  it('conserva la licencia útil del lunes 24 de mayo', () => {
    expect(calcularPuentes(FERIADOS_LATAM_2027.argentina.feriados).find((f) => f.fecha === '2027-05-25')?.fechaLicencia).toBe('2027-05-24');
  });
  it('resuelve jueves y límites de mes/año con fechas UTC', () => {
    expect(calcularPuentes([feriado('2026-12-31', 'Jueves')])[0].fechaLicencia).toBe('2027-01-01');
    expect(calcularPuentes([feriado('2027-06-01', 'Martes')])[0].fechaLicencia).toBe('2027-05-31');
    expect(calcularPuentes([feriado('2026-12-31', 'Jueves'), feriado('2027-01-01', 'Viernes')])).toEqual([]);
  });
  it('nunca recomienda licencia en otra fecha de la lista, en ningún país', () => {
    for (const pais of Object.values(FERIADOS_LATAM_2027)) {
      const fechas = new Set(pais.feriados.map((f) => f.fecha));
      for (const puente of calcularPuentes(pais.feriados)) expect(fechas.has(puente.fechaLicencia)).toBe(false);
    }
  });
});
