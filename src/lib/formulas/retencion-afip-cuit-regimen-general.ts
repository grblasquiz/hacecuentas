export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function retencionAfipCuitRegimenGeneral(i: Inputs): Outputs {
  const imp=Number(i.importe)||0; const r=String(i.regimen||'inscripto_ganancias_2%');
  const rates:Record<string,number>={'inscripto_ganancias_2%':0.02,'no_inscripto_ganancias_28%':0.28,'profesional_liberal_10%':0.10,'alquiler_inmueble_6%':0.06};
  const tasa=rates[r]||0.02; const ret=imp*tasa; const neto=imp-ret;
  const tasaPct = tasa * 100;
  const insight = {
    title: tasaPct >= 28 ? 'Retención muy alta' : tasaPct >= 10 ? 'Retención considerable' : 'Retención estándar',
    text: `AFIP te retiene el **${tasaPct.toFixed(0)}%** del comprobante, es decir **$${Math.round(ret).toLocaleString('es-AR')}** sobre $${imp.toLocaleString('es-AR')}. Cobrás **$${Math.round(neto).toLocaleString('es-AR')}** netos; esa retención es un pago a cuenta de Ganancias que después computás en tu declaración.`,
    tone: tasaPct >= 10 ? 'warn' : 'neutral',
    icon: '🧾',
  };
  const out: Outputs = { retencion:`$${Math.round(ret).toLocaleString('es-AR')}`, neto:`$${Math.round(neto).toLocaleString('es-AR')}`, interpretacion:`${(tasa*100).toFixed(0)}% sobre $${imp.toLocaleString('es-AR')} = retención $${Math.round(ret).toLocaleString('es-AR')}. Cobrás $${Math.round(neto).toLocaleString('es-AR')}.`, _insight: insight };
  if (imp > 0 && ret > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Neto que cobrás', value: Math.round(neto) },
        { label: 'Retención AFIP', value: Math.round(ret) },
      ],
      prefix: '$',
      centerValue: `$${Math.round(imp).toLocaleString('es-AR')}`,
      centerLabel: 'Importe del comprobante',
      ariaLabel: `Reparto del importe de $${Math.round(imp).toLocaleString('es-AR')} entre el neto que cobrás y la retención de AFIP`,
    };
  }
  return out;
}
