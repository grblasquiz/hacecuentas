export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cuotaAlimentosPorcentajeSueldoHijo(i: Inputs): Outputs {
  const s=Number(i.sueldoProgenitor)||0; const h=Number(i.cantidadHijos)||1;
  const pct=h===1?22:h===2?32:h===3?40:45;
  const cuota=s*pct/100;
  return { cuotaMensual:`$${Math.round(cuota).toLocaleString('es-AR')}`, porcentaje:`${pct}%`, interpretacion:`Referencia: ${pct}% del sueldo neto para ${h} hijo${h>1?'s':''} = $${Math.round(cuota).toLocaleString('es-AR')}/mes. El juez fija el valor final.` };
}
