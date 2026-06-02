/** Estimación patente automotor */
export interface Inputs { valuacionFiscal: number; jurisdiccion: string; }
export interface Outputs { patenteAnual: number; patenteMensual: number; patenteCuota: number; alicuota: string; _insight?: any; }

export function patenteAutoValor(i: Inputs): Outputs {
  const val = Number(i.valuacionFiscal);
  const jur = i.jurisdiccion || 'caba';
  if (!val || val <= 0) throw new Error('Ingresá la valuación fiscal');

  const alicuotas: Record<string, { pct: number; cuotas: number }> = {
    'caba': { pct: 3.2, cuotas: 6 },
    'pba': { pct: 2.8, cuotas: 6 },
    'cordoba': { pct: 3.0, cuotas: 4 },
    'santa-fe': { pct: 3.2, cuotas: 4 },
    'mendoza': { pct: 2.8, cuotas: 4 },
    'otra': { pct: 3.0, cuotas: 4 },
  };

  const { pct, cuotas } = alicuotas[jur] || alicuotas['otra'];
  const patenteAnual = val * (pct / 100);
  const patenteMensual = patenteAnual / 12;
  const patenteCuota = patenteAnual / cuotas;

  return {
    patenteAnual: Math.round(patenteAnual),
    patenteMensual: Math.round(patenteMensual),
    patenteCuota: Math.round(patenteCuota),
    alicuota: `${pct}% (${cuotas} cuotas/año)`,
    _insight: {
      title: 'Tu patente estimada',
      text: `Sobre una valuación de **$${Math.round(val).toLocaleString('es-AR')}** con alícuota **${pct}%**, la patente anual da ≈ **$${Math.round(patenteAnual).toLocaleString('es-AR')}**: **${cuotas} cuotas de $${Math.round(patenteCuota).toLocaleString('es-AR')}** o ≈ **$${Math.round(patenteMensual).toLocaleString('es-AR')}/mes**. Es un valor orientativo; la escala real varía por tramo y suele haber descuento por pago anual adelantado.`,
      tone: 'warn',
      icon: '🚗',
    },
  };
}
