export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function timeBlockingCalendarHorasProductividad(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const _insight = {
    title: 'Tu resultado en contexto',
    text: `Dividiendo **${v1}** entre **${v2}** te queda **${r.toFixed(2)}**. Usalo para repartir tus horas del día en bloques: cuanto más cierres el calendario en franjas fijas, menos tiempo perdés cambiando de tarea.`,
    tone: 'neutral' as const,
    icon: '🗓️',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`, _insight };
}
