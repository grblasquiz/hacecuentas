import { MEXICO_2026, isrMensual2026 } from '../data/mexico-2026';

export interface Inputs {
  sueldo_diario: number;
  dias_trabajados_anio: number;
  dias_aguinaldo: number;
  considerar_proporcional: boolean;
}

export interface Outputs {
  aguinaldo_bruto: number;
  base_isr: number;
  isr_retenido: number;
  aguinaldo_neto: number;
  tasa_isr_efectiva: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 México — fuente única src/lib/data/mexico-2026.ts (SAT, INEGI).
  const UMA_2026 = MEXICO_2026.uma.diaria; // UMA diaria 2026 ($117.31)
  const EXENCION_UMA = MEXICO_2026.exencionesIsrUmas.aguinaldo; // 30 UMA (Art. 93 LISR)
  const EXENCION_PESOS = UMA_2026 * EXENCION_UMA; // 30 × UMA diaria

  // Validaciones básicas
  if (i.sueldo_diario < 0) i.sueldo_diario = 0;
  if (i.dias_trabajados_anio < 1) i.dias_trabajados_anio = 1;
  if (i.dias_trabajados_anio > 365) i.dias_trabajados_anio = 365;
  if (i.dias_aguinaldo < 15) i.dias_aguinaldo = 15;
  if (i.dias_aguinaldo > 40) i.dias_aguinaldo = 40;

  // Cálculo aguinaldo bruto
  let aguinaldo_bruto = i.sueldo_diario * i.dias_aguinaldo;

  // Aplicar prorrateo si trabajó < 365 días
  if (i.considerar_proporcional && i.dias_trabajados_anio < 365) {
    aguinaldo_bruto = aguinaldo_bruto * (i.dias_trabajados_anio / 365);
  }

  // Base gravable = aguinaldo - exención 30 UMA
  const base_isr = Math.max(0, aguinaldo_bruto - EXENCION_PESOS);

  // ISR sobre la base gravable con la tarifa MENSUAL 2026 (Art. 96 LISR), fuente
  // única mexico-2026 — procedimiento simplificado Art. 174 RISR aplicado al
  // monto gravado del aguinaldo (misma lógica que las otras calcs de aguinaldo MX).
  const isr_retenido = isrMensual2026(base_isr);

  // Aguinaldo neto
  const aguinaldo_neto = aguinaldo_bruto - isr_retenido;

  // Tasa efectiva
  const tasa_isr_efectiva = aguinaldo_bruto > 0 ? (isr_retenido / aguinaldo_bruto) * 100 : 0;

  const brutoR = Math.round(aguinaldo_bruto);
  const netoR = Math.round(aguinaldo_neto);
  const isrR = Math.round(isr_retenido);
  const tasaR = Math.round(tasa_isr_efectiva * 100) / 100;
  const fmtMX = (x: number) => x.toLocaleString('es-MX');

  const _insight = isrR <= 0
    ? {
        title: 'Aguinaldo libre de ISR',
        text: `Cobrás **$${fmtMX(netoR)}** completos: tu aguinaldo no supera las **30 UMA exentas** ($${fmtMX(EXENCION_PESOS)}), así que no hay retención de ISR. Por ley el mínimo es 15 días de salario.`,
        tone: 'good',
        icon: '🎁',
      }
    : {
        title: 'Te retienen ISR del aguinaldo',
        text: `De **$${fmtMX(brutoR)}** brutos, los primeros $${fmtMX(EXENCION_PESOS)} (30 UMA) van exentos y sobre el resto te retienen **$${fmtMX(isrR)}** de ISR (tasa efectiva **${tasaR}%**). Te quedan **$${fmtMX(netoR)}** netos.`,
        tone: tasaR >= 10 ? 'warn' : 'neutral',
        icon: '🧾',
      };

  const _chart = isrR > 0
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Neto a cobrar', value: netoR },
          { label: 'ISR retenido', value: isrR },
        ],
        prefix: '$',
        centerValue: `$${fmtMX(brutoR)}`,
        centerLabel: 'Aguinaldo bruto',
        ariaLabel: `Aguinaldo bruto de $${fmtMX(brutoR)} repartido en $${fmtMX(netoR)} netos y $${fmtMX(isrR)} de ISR retenido.`,
      }
    : undefined;

  const out: Outputs = {
    aguinaldo_bruto: Math.round(aguinaldo_bruto * 100) / 100,
    base_isr: Math.round(base_isr * 100) / 100,
    isr_retenido: Math.round(isr_retenido * 100) / 100,
    aguinaldo_neto: Math.round(aguinaldo_neto * 100) / 100,
    tasa_isr_efectiva: tasaR,
    _insight
  };
  if (_chart) out._chart = _chart;
  return out;
}
