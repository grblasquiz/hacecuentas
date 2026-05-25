/**
 * Calculadora de patente automotor Provincia de Córdoba 2026
 *
 * Marco legal:
 *   - Código Tributario Provincial - Ley 6.006
 *   - Ley Impositiva Provincial anual (2026: Ley 11.099 con modif.)
 *
 * Alícuotas 2026 según rango de valuación fiscal:
 *   Hasta $5.000.000          → 1,5%
 *   $5.000.001 a $10.000.000  → 2%
 *   $10.000.001 a $20.000.000 → 2,5%
 *   $20.000.001 a $50.000.000 → 3%
 *   $50.000.001 a $100M       → 3,75%
 *   Más de $100M              → 4,5%
 *
 * Forma de pago:
 *   - Anual contado: 15% descuento (Resolución DGR Córdoba anual)
 *   - 5 cuotas bimestrales: feb/abr/jun/ago/oct (sin descuento)
 */

export type RangoValuacion =
  | 'hasta-5'
  | '5-a-10'
  | '10-a-20'
  | '20-a-50'
  | '50-a-100'
  | 'mas-100';

export type FormaPagoPatente = 'anual-contado' | '5-cuotas';

export interface PatenteCordobaInputs {
  valuacionFiscal: RangoValuacion;
  valuacionMonto: number;
  modeloAuto?: string;
  anioAuto?: number;
  formaPago: FormaPagoPatente;
}

export interface PatenteCordobaOutputs {
  totalAnual: number;
  cuotaAnualBase: number;
  descuentoContado: number;
  cuotasBimestrales: number;
  alicuotaAplicada: string;
  vencimientos: string;
  mensaje: string;
}

const ALICUOTAS_2026: Record<RangoValuacion, number> = {
  'hasta-5': 0.015,
  '5-a-10': 0.02,
  '10-a-20': 0.025,
  '20-a-50': 0.03,
  '50-a-100': 0.0375,
  'mas-100': 0.045,
};

const ALICUOTAS_LABEL: Record<RangoValuacion, string> = {
  'hasta-5': '1,5% (hasta $5.000.000)',
  '5-a-10': '2% ($5M a $10M)',
  '10-a-20': '2,5% ($10M a $20M)',
  '20-a-50': '3% ($20M a $50M)',
  '50-a-100': '3,75% ($50M a $100M)',
  'mas-100': '4,5% (más de $100M)',
};

const VENCIMIENTOS_5_CUOTAS =
  '1ª cuota: febrero / 2ª: abril / 3ª: junio / 4ª: agosto / 5ª: octubre. ' +
  'Fechas exactas en calendario fiscal DGR Córdoba.';

const VENCIMIENTO_ANUAL =
  'Pago contado: primer vencimiento (febrero). Verificá fecha exacta en calendario fiscal DGR Córdoba.';

export function patenteAutoCordoba(
  inputs: PatenteCordobaInputs,
): PatenteCordobaOutputs {
  const valuacionMonto = Number(inputs.valuacionMonto);
  const rango: RangoValuacion = inputs.valuacionFiscal || '10-a-20';
  const forma: FormaPagoPatente = inputs.formaPago || '5-cuotas';

  if (!valuacionMonto || valuacionMonto <= 0) {
    throw new Error('Ingresá la valuación fiscal del vehículo');
  }

  const alicuota = ALICUOTAS_2026[rango] ?? 0.025;

  // Patente anual base (sin descuentos)
  const cuotaAnualBase = valuacionMonto * alicuota;

  // Descuento anual contado: 15%
  const descuentoContado =
    forma === 'anual-contado' ? cuotaAnualBase * 0.15 : 0;

  const totalAnual = cuotaAnualBase - descuentoContado;

  // 5 cuotas iguales (siempre se muestra como información)
  const cuotasBimestrales = cuotaAnualBase / 5;

  const vencimientos =
    forma === 'anual-contado' ? VENCIMIENTO_ANUAL : VENCIMIENTOS_5_CUOTAS;

  // Mensajes contextuales
  let mensaje = '';
  if (forma === 'anual-contado') {
    mensaje =
      `Pagando contado ahorrás ${Math.round(descuentoContado).toLocaleString('es-AR')} ` +
      `pesos (15% del total). Verificá que estés en el régimen "Buen Contribuyente" ` +
      `de DGR Córdoba para mantener el descuento en 2027.`;
  } else {
    mensaje =
      `En 5 cuotas pagás $${Math.round(cuotasBimestrales).toLocaleString('es-AR')} ` +
      `cada bimestre. Si podés afrontar el pago contado, te conviene: ahorrarías ` +
      `$${Math.round(cuotaAnualBase * 0.15).toLocaleString('es-AR')} (15% off).`;
  }

  // Advertencia por rango alto
  if (rango === 'mas-100') {
    mensaje +=
      ' Estás en el tramo más alto (4,5%): considerá revisar la valuación fiscal en ' +
      'rentas.cba.gov.ar — a veces hay errores que conviene reclamar antes del primer vencimiento.';
  }

  return {
    totalAnual: Math.round(totalAnual),
    cuotaAnualBase: Math.round(cuotaAnualBase),
    descuentoContado: Math.round(descuentoContado),
    cuotasBimestrales: Math.round(cuotasBimestrales),
    alicuotaAplicada: ALICUOTAS_LABEL[rango] ?? '2,5%',
    vencimientos,
    mensaje,
  };
}
