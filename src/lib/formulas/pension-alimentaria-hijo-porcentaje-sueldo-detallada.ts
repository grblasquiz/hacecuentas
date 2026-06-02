export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function pensionAlimentariaHijoPorcentajeSueldoDetallada(i: Inputs): Outputs {
  const s=Number(i.sueldoObligado)||0; const h=Number(i.hijos)||1; const im=Number(i.ingresoMadre)||0;
  let pct=h===1?22:h===2?32:h===3?40:45;
  const ingresosTotales=s+im;
  const proporcional=s/ingresosTotales;
  const cuota=(s*pct/100)*proporcional;
  const cuotaRedondeada=Math.round(cuota);
  const pctSobreSueldo=s>0?(cuota/s)*100:0;
  const _insight={
    title:'Cuota estimada',
    text:`Para **${h} hijo${h>1?'s':''}** la base es **${pct}%**, ajustada por el aporte de la madre a tus ingresos: la cuota queda en **$${cuotaRedondeada.toLocaleString('es-AR')}** por mes (≈${pctSobreSueldo.toFixed(0)}% de tu sueldo). Es una estimación orientativa; el juez fija el monto final.`,
    tone:'neutral',
    icon:'👶',
  };
  return { cuotaMensual:`$${cuotaRedondeada.toLocaleString('es-AR')}`, porcentaje:`${pct}% (ajustado por aporte madre)`, observacion:`Base: ${pct}% para ${h} hijo${h>1?'s':''}. Ajustado por ingresos conjuntos.`, _insight };
}
