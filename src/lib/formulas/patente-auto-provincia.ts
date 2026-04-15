/** Estimación de patente automotor según valuación fiscal y alícuota provincial */
export interface Inputs {
  valuacionFiscal: number;
  alicuota: number;
  cuotas?: number;
}
export interface Outputs {
  patenteAnual: number;
  patenteCuota: number;
  patenteMensual: number;
  detalle: string;
}

export function patenteAutoProvincia(i: Inputs): Outputs {
  const valuacion = Number(i.valuacionFiscal);
  const alicuota = Number(i.alicuota);
  const cuotas = Number(i.cuotas) || 6;

  if (!valuacion || valuacion <= 0) throw new Error('Ingresá la valuación fiscal del vehículo');
  if (!alicuota || alicuota <= 0 || alicuota > 10) throw new Error('La alícuota debe estar entre 0.5% y 10%');
  if (cuotas < 1 || cuotas > 12) throw new Error('Las cuotas deben ser entre 1 y 12');

  const patenteAnual = valuacion * alicuota / 100;
  const patenteCuota = patenteAnual / cuotas;
  const patenteMensual = patenteAnual / 12;

  return {
    patenteAnual: Math.round(patenteAnual),
    patenteCuota: Math.round(patenteCuota),
    patenteMensual: Math.round(patenteMensual),
    detalle: `Patente anual estimada: $${Math.round(patenteAnual).toLocaleString('es-AR')} (${cuotas} cuotas de $${Math.round(patenteCuota).toLocaleString('es-AR')}). Equivale a $${Math.round(patenteMensual).toLocaleString('es-AR')}/mes.`,
  };
}
