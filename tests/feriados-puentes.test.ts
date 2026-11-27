import { describe, expect, it } from 'vitest';
import { calcularFindesLargos, calcularPuentes } from '../src/lib/feriados-puentes';
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

describe('fines de semana largos consecutivos', () => {
  it('agrupa Carnaval y el cruce de junio en bloques completos', () => {
    const findes = calcularFindesLargos(FERIADOS_LATAM_2027.argentina.feriados);
    expect(findes).toContainEqual({
      desde: '2027-02-06', hasta: '2027-02-09', dias: 4, nombres: ['Carnaval'],
    });
    expect(findes).toContainEqual({
      desde: '2027-06-19', hasta: '2027-06-21', dias: 3,
      nombres: ['Paso a la Inmortalidad del Gral. Manuel Belgrano', 'Paso a la Inmortalidad del Gral. Martín Miguel de Güemes'],
    });
    expect(findes.some(({ desde, hasta }) => desde <= '2027-05-25' && hasta >= '2027-05-25')).toBe(false);
  });

  it('une viernes y lunes contiguos sin duplicarlos y descarta feriados aislados', () => {
    const viernes = feriado('2027-01-01', 'Viernes');
    const lunes = feriado('2027-01-04', 'Lunes');
    const martes = feriado('2027-05-25', 'Martes');
    expect(calcularFindesLargos([lunes, martes, viernes])).toEqual([{
      desde: '2027-01-01', hasta: '2027-01-04', dias: 4, nombres: [viernes.nombre],
    }]);
    expect(calcularFindesLargos([feriado('2027-12-25', 'Sábado')])).toEqual([]);
  });
});
