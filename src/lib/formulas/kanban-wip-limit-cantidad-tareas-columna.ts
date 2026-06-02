export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function kanbanWipLimitCantidadTareasColumna(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const _insight = { title: 'Límite WIP por columna', text: `Con estos parámetros el límite WIP sugerido es **${r.toFixed(2)}** tarea(s) por columna. Mantener el trabajo en curso bajo este número reduce el multitasking y acelera el flujo.`, tone: 'neutral', icon: '📋' };
  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`, _insight };
}
