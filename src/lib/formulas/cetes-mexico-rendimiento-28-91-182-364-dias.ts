export interface Inputs {
  monto_invertido: number;
  plazo_dias: 28 | 91 | 182 | 364;
  tasa_nominal_anual: number;
}

export interface Outputs {
  rendimiento_bruto: number;
  retencion_isr: number;
  rendimiento_neto: number;
  monto_vencimiento: number;
  tasa_neta_anualizada: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 México - Fuente: Banxico, SAT
  const TASA_RETENCION_ISR = 0.0145; // 1.45% retención en la fuente (SAT, CETES)
  const DIAS_ANNO = 365; // Año base para prorrateo retención
  const DIAS_ANNO_COMERCIAL = 360; // Año comercial para rendimiento

  // Validaciones
  if (i.monto_invertido <= 0) {
    return {
      rendimiento_bruto: 0,
      retencion_isr: 0,
      rendimiento_neto: 0,
      monto_vencimiento: i.monto_invertido,
      tasa_neta_anualizada: 0,
    };
  }

  if (i.tasa_nominal_anual < 0 || i.tasa_nominal_anual > 100) {
    return {
      rendimiento_bruto: 0,
      retencion_isr: 0,
      rendimiento_neto: 0,
      monto_vencimiento: i.monto_invertido,
      tasa_neta_anualizada: 0,
    };
  }

  // 1. Rendimiento bruto en pesos
  // Fórmula: Monto × Tasa nominal anual × (Días / 360)
  const rendimiento_bruto =
    i.monto_invertido *
    (i.tasa_nominal_anual / 100) *
    (i.plazo_dias / DIAS_ANNO_COMERCIAL);

  // 2. Retención ISR prorratead por plazo
  // Fórmula: Rendimiento bruto × Tasa retención 1.45% × (Días / 365)
  const retencion_isr =
    rendimiento_bruto *
    TASA_RETENCION_ISR *
    (i.plazo_dias / DIAS_ANNO);

  // 3. Rendimiento neto
  const rendimiento_neto = rendimiento_bruto - retencion_isr;

  // 4. Monto a recibir al vencimiento
  const monto_vencimiento = i.monto_invertido + rendimiento_neto;

  // 5. Tasa neta anualizada
  // Fórmula: (Rendimiento neto / Monto invertido) × (360 / Días) × 100%
  const tasa_neta_anualizada =
    (rendimiento_neto / i.monto_invertido) *
    (DIAS_ANNO_COMERCIAL / i.plazo_dias) *
    100;

  const rendNetoR = Math.round(rendimiento_neto * 100) / 100;
  const isrR = Math.round(retencion_isr * 100) / 100;
  const capitalR = Math.round(i.monto_invertido * 100) / 100;
  const vencimientoR = Math.round((capitalR + rendNetoR) * 100) / 100;
  const tasaNetaR = Math.round(tasa_neta_anualizada * 100) / 100;
  const mxn = (n: number) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const _insight = {
    title: 'Tu rendimiento neto',
    text: `Invirtiendo ${mxn(capitalR)} a **${i.plazo_dias} días** ganás **${mxn(rendNetoR)} netos** (ya descontado el ISR de ${mxn(isrR)}) y al vencimiento recibís **${mxn(vencimientoR)}**. La tasa neta anualizada equivale a **${tasaNetaR.toFixed(2)} %**.`,
    tone: 'good' as const,
    icon: '🏦',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Capital invertido', value: capitalR },
      { label: 'Rendimiento neto', value: rendNetoR },
    ],
    prefix: '$',
    centerValue: mxn(vencimientoR),
    centerLabel: 'al vencimiento',
    ariaLabel: `Composición del monto al vencimiento de ${mxn(vencimientoR)}: capital invertido más rendimiento neto`,
  };

  return {
    rendimiento_bruto: Math.round(rendimiento_bruto * 100) / 100,
    retencion_isr: isrR,
    rendimiento_neto: rendNetoR,
    monto_vencimiento: Math.round(monto_vencimiento * 100) / 100,
    tasa_neta_anualizada: tasaNetaR,
    _insight,
    _chart,
  };
}
