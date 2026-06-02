/**
 * Libertad condicional — Art. 13 Código Penal Argentino.
 * Requisitos: cumplidos 2/3 de la pena (penas de más de 3 años) o 8 meses en penas menores.
 * Ley 27.375 (2017) excluye ciertos delitos graves.
 * Calcula fecha de cumplimiento de 2/3 dado el inicio de la pena y la duración total.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

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
  const fmtLargo = (d: Date) => d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

  const aniosCumplir = Math.floor(mesesCumplir / 12);
  const mesesRestoCumplir = Math.round(mesesCumplir - aniosCumplir * 12);
  const tiempoTxt = aniosCumplir > 0
    ? `${aniosCumplir} ${aniosCumplir === 1 ? 'año' : 'años'}${mesesRestoCumplir > 0 ? ` y ${mesesRestoCumplir} ${mesesRestoCumplir === 1 ? 'mes' : 'meses'}` : ''}`
    : `${mesesRestoCumplir} ${mesesRestoCumplir === 1 ? 'mes' : 'meses'}`;

  const _insight = delitoExcluido
    ? {
        title: 'No corresponde',
        text: `Por tratarse de un **delito excluido por la Ley 27.375**, no procede la libertad condicional, sin importar la fracción de pena cumplida. La persona debe cumplir la condena completa.`,
        tone: 'warn',
        icon: '🚫',
      }
    : {
        title: 'Fecha estimada',
        text: `Cumplidos los **2/3 de la pena** (unos **${tiempoTxt}**), la libertad condicional podría solicitarse a partir del **${fmtLargo(fechaCumplimiento)}**. Es orientativo: depende de buena conducta, informe penitenciario favorable y resolución del juez.`,
        tone: 'neutral',
        icon: '⚖️',
      };

  return {
    fechaLibertadCondicional: fmt(fechaCumplimiento),
    fechaFinPena: fmt(fechaFinPena),
    mesesCumplidos: Math.round(mesesCumplir * 10) / 10,
    aviso,
    disclaimer: 'Cálculo orientativo según Art. 13 CP. Requiere resolución judicial. Consultar abogado penalista.',
    _insight,
  };
}
