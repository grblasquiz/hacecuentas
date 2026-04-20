export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function retencionAfipCuitRegimenGeneral(i: Inputs): Outputs {
  const imp=Number(i.importe)||0; const r=String(i.regimen||'inscripto_ganancias_2%');
  const rates:Record<string,number>={'inscripto_ganancias_2%':0.02,'no_inscripto_ganancias_28%':0.28,'profesional_liberal_10%':0.10,'alquiler_inmueble_6%':0.06};
  const tasa=rates[r]||0.02; const ret=imp*tasa; const neto=imp-ret;
  return { retencion:`$${Math.round(ret).toLocaleString('es-AR')}`, neto:`$${Math.round(neto).toLocaleString('es-AR')}`, interpretacion:`${(tasa*100).toFixed(0)}% sobre $${imp.toLocaleString('es-AR')} = retención $${Math.round(ret).toLocaleString('es-AR')}. Cobrás $${Math.round(neto).toLocaleString('es-AR')}.` };
}
