import type { Feriado } from './data/feriados-latam-2026';

/** Licencia sólo en un día hábil: un feriado contiguo ya da descanso. */
export function calcularPuentes(feriados: Feriado[]) {
  const fechas = new Set(feriados.map((f) => f.fecha));
  return feriados.flatMap((f) => {
    const fecha = new Date(`${f.fecha}T12:00:00Z`);
    const dia = fecha.getUTCDay();
    if (dia !== 2 && dia !== 4) return [];
    fecha.setUTCDate(fecha.getUTCDate() + (dia === 2 ? -1 : 1));
    const fechaLicencia = fecha.toISOString().slice(0, 10);
    if (fechas.has(fechaLicencia)) return [];
    return [{ ...f, fechaLicencia, pedir: dia === 2 ? 'el lunes anterior' : 'el viernes siguiente' }];
  });
}
