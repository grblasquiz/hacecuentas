export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function cuotaAlimentosPorcentajeSueldoHijo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const s=Number(i.sueldoProgenitor)||0; const h=Number(i.cantidadHijos)||1;
  const pct=h===1?22:h===2?32:h===3?40:45;
  const cuota=s*pct/100;
  const cuotaFmt = __lang === 'en'
    ? `$${Math.round(cuota).toLocaleString('en-US')}`
    : __lang === 'pt'
    ? `$${Math.round(cuota).toLocaleString('pt-BR')}`
    : `$${Math.round(cuota).toLocaleString('es-AR')}`;
  const interpretacion = __lang === 'en'
    ? `Reference: ${pct}% of net salary for ${h} child${h>1?'ren':''} = $${Math.round(cuota).toLocaleString('en-US')}/month. The judge sets the final amount.`
    : __lang === 'pt'
    ? `Referência: ${pct}% do salário líquido para ${h} filho${h>1?'s':''} = $${Math.round(cuota).toLocaleString('pt-BR')}/mês. O juiz define o valor final.`
    : `Referencia: ${pct}% del sueldo neto para ${h} hijo${h>1?'s':''} = $${Math.round(cuota).toLocaleString('es-AR')}/mes. El juez fija el valor final.`;
  return { cuotaMensual: cuotaFmt, porcentaje:`${pct}%`, interpretacion };
}
