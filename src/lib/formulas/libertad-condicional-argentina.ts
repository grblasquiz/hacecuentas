/**
 * Libertad condicional — Art. 13 Código Penal Argentino.
 * Requisitos: cumplidos 2/3 de la pena (penas de más de 3 años) o 8 meses en penas menores.
 * Ley 27.375 (2017) excluye ciertos delitos graves.
 * Calcula fecha de cumplimiento de 2/3 dado el inicio de la pena y la duración total.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

export function libertadCondicionalArgentina(i: Inputs): Outputs {
  const fechaInicioStr = String(i.fechaInicio || '');
  const anios = Math.max(0, Number(i.anios) || 0);
  const meses = Math.max(0, Number(i.meses) || 0);
  const delitoExcluido = String(i.delitoExcluido || 'no') === 'si';

  if (!fechaInicioStr) throw new Error('Ingresá la fecha de inicio');
  if (anios === 0 && meses === 0) throw new Error('Ingresá la pena');

  const fechaInicio = new Date(fechaInicioStr + 'T00:00:00');
  if (isNaN(fechaInicio.getTime())) throw new Error('Fecha inválida');

  const totalMeses = anios * 12 + meses;
  const mesesCumplir = (2 / 3) * totalMeses;

  const fechaCumplimiento = new Date(fechaInicio);
  fechaCumplimiento.setMonth(fechaCumplimiento.getMonth() + Math.floor(mesesCumplir));
  const diasExtra = Math.round((mesesCumplir - Math.floor(mesesCumplir)) * 30);
  fechaCumplimiento.setDate(fechaCumplimiento.getDate() + diasExtra);

  const fechaFinPena = new Date(fechaInicio);
  fechaFinPena.setMonth(fechaFinPena.getMonth() + totalMeses);

  const aviso = delitoExcluido
    ? 'ATENCIÓN: Ley 27.375 excluye este tipo de delito (homicidio agravado, abuso sexual grave, narcotráfico a gran escala, etc.). No corresponde libertad condicional.'
    : 'Requiere además buena conducta, informe favorable del Servicio Penitenciario y resolución del juez de ejecución.';

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  return {
    fechaLibertadCondicional: fmt(fechaCumplimiento),
    fechaFinPena: fmt(fechaFinPena),
    mesesCumplidos: Math.round(mesesCumplir * 10) / 10,
    aviso,
    disclaimer: 'Cálculo orientativo según Art. 13 CP. Requiere resolución judicial. Consultar abogado penalista.',
  };
}
