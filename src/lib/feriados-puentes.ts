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


/** Descansos consecutivos de tres días o más para una semana laboral de lunes a viernes. */
export function calcularFindesLargos(feriados: Feriado[]) {
  const porFecha = new Map(feriados.map(feriado => [feriado.fecha, feriado]));
  const diaMs = 86_400_000;
  const iso = (instante: number) => new Date(instante).toISOString().slice(0, 10);
  const descansa = (instante: number) => {
    const dia = new Date(instante).getUTCDay();
    return dia === 0 || dia === 6 || porFecha.has(iso(instante));
  };
  const bloques = new Map<string, { desde: string; hasta: string; dias: number; nombres: string[] }>();
  for (const { fecha } of feriados) {
    const feriado = Date.parse(fecha + 'T00:00:00Z');
    let inicio = feriado;
    let fin = feriado;
    while (descansa(inicio - diaMs)) inicio -= diaMs;
    while (descansa(fin + diaMs)) fin += diaMs;
    const dias = (fin - inicio) / diaMs + 1;
    const desde = iso(inicio);
    if (dias < 3 || bloques.has(desde)) continue;
    const nombres = new Set<string>();
    for (let dia = inicio; dia <= fin; dia += diaMs) {
      const festivo = porFecha.get(iso(dia));
      if (festivo) nombres.add(festivo.nombre);
    }
    bloques.set(desde, { desde, hasta: iso(fin), dias, nombres: [...nombres] });
  }
  return [...bloques.values()].sort((a, b) => a.desde.localeCompare(b.desde));
}
