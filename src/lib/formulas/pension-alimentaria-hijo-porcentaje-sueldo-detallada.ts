export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function pensionAlimentariaHijoPorcentajeSueldoDetallada(i: Inputs): Outputs {
  const s=Number(i.sueldoObligado)||0; const h=Number(i.hijos)||1; const im=Number(i.ingresoMadre)||0;
  let pct=h===1?22:h===2?32:h===3?40:45;
  const ingresosTotales=s+im;
  const proporcional=s/ingresosTotales;
  const cuota=(s*pct/100)*proporcional;
  return { cuotaMensual:`$${Math.round(cuota).toLocaleString('es-AR')}`, porcentaje:`${pct}% (ajustado por aporte madre)`, observacion:`Base: ${pct}% para ${h} hijo${h>1?'s':''}. Ajustado por ingresos conjuntos.` };
}
