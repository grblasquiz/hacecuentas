import { MEXICO_2026 } from '../data/mexico-2026';

export interface Inputs {
  salario_diario_bruto: number;
  antiguedad_anos: number;
  porcentaje_prima: number;
}

export interface Outputs {
  dias_vacaciones: number;
  prima_vacacional_bruta: number;
  uma_anual_2026: number;
  exencion_isr: number;
  base_gravable: number;
  isr_calculado: number;
  prima_neta: number;
  nota_fiscal: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 México — UMA fuente única src/lib/data/mexico-2026.ts (INEGI)
  const UMA_DIARIA_2026 = MEXICO_2026.uma.diaria; // UMA diaria 2026 = $117,31
  const UMA_ANUAL_2026 = MEXICO_2026.uma.anual; // UMA anual 2026 = $42.794,64
  const EXENCION_ISR_UMA = MEXICO_2026.exencionesIsrUmas.primaVacacional; // 15 UMA exentas (Art. 93 LISR)
  const EXENCION_ISR_MONTO = UMA_DIARIA_2026 * EXENCION_ISR_UMA; // 15 × UMA diaria = $1.759,65

  // Tarifa ISR 2026 para personas físicas (simplificada por tramos)
  // Fuente: SAT 2026. Aplicamos tarifa marginal según base gravable
  const tarifasISR_2026 = [
    { limite: 248_459, cuota_fija: 0, tasa: 0.0192 },
    { limite: 373_628, cuota_fija: 4_769, tasa: 0.064, base_anterior: 248_459 },
    { limite: 623_630, cuota_fija: 12_779, tasa: 0.1088, base_anterior: 373_628 },
    { limite: 867_123, cuota_fija: 39_927, tasa: 0.16, base_anterior: 623_630 },
    { limite: 1_000_000, cuota_fija: 78_660, tasa: 0.1792, base_anterior: 867_123 },
    { limite: Infinity, cuota_fija: 101_349, tasa: 0.1944, base_anterior: 1_000_000 }
  ];

  // 1. Determinar días de vacaciones según antigüedad (LFT)
  let dias_vacaciones = 0;
  const antiguedad = Math.floor(i.antiguedad_anos); // Años completos

  if (antiguedad < 1) {
    dias_vacaciones = 0;
  } else if (antiguedad === 1) {
    dias_vacaciones = 12;
  } else if (antiguedad === 2) {
    dias_vacaciones = 14;
  } else if (antiguedad === 3) {
    dias_vacaciones = 16;
  } else if (antiguedad === 4) {
    dias_vacaciones = 18;
  } else if (antiguedad === 5) {
    dias_vacaciones = 20;
  } else if (antiguedad <= 10) {
    // 6 a 10 años: 20 + 2
    dias_vacaciones = 22;
  } else if (antiguedad <= 15) {
    // 11 a 15 años: 20 + 4
    dias_vacaciones = 24;
  } else if (antiguedad <= 20) {
    // 16 a 20 años: 20 + 6
    dias_vacaciones = 26;
  } else {
    // 21+ años: +2 cada 5 años sobre base 20
    const anos_sobre_20 = antiguedad - 20;
    const grupos_5 = Math.floor(anos_sobre_20 / 5);
    dias_vacaciones = 20 + 2 * grupos_5;
  }

  // 2. Calcular prima vacacional bruta
  const prima_vacacional_bruta =
    i.salario_diario_bruto * dias_vacaciones * (i.porcentaje_prima / 100);

  // 3. Determinar exención ISR (15 UMA anuales)
  const exencion_isr = EXENCION_ISR_MONTO;

  // 4. Calcular base gravable
  const base_gravable = Math.max(0, prima_vacacional_bruta - exencion_isr);

  // 5. Calcular ISR según tarifa 2026
  let isr_calculado = 0;
  if (base_gravable > 0) {
    const tramo = tarifasISR_2026.find((t) => base_gravable <= t.limite);
    if (tramo) {
      const excedente = base_gravable - tramo.base_anterior;
      isr_calculado = tramo.cuota_fija + excedente * tramo.tasa;
    }
  }

  // 6. Prima neta
  const prima_neta = prima_vacacional_bruta - isr_calculado;

  // 7. Nota fiscal
  let nota_fiscal = "";
  if (dias_vacaciones === 0) {
    nota_fiscal =
      "⚠️ Antigüedad < 1 año: aún sin derecho a vacaciones (LFT). Recalcula al cumplir 1 año.";
  } else if (base_gravable === 0) {
    nota_fiscal = `✅ Prima dentro de exención (15 UMA = $${EXENCION_ISR_MONTO.toFixed(
      0
    )} MXN). Sin ISR a retener.`;
  } else {
    nota_fiscal = `ⓘ Excedente de exención: $${base_gravable.toFixed(
      2
    )} MXN gravable. ISR retención estimada.`;
  }

  // Insight narrativo
  const fmt = (v: number) => '$' + Math.round(v).toLocaleString('es-MX') + ' MXN';
  let _insight: any;
  if (dias_vacaciones === 0) {
    _insight = {
      title: 'Todavía sin derecho a prima',
      text: `Con menos de **1 año** de antigüedad aún no te corresponden vacaciones (LFT), por lo que la prima vacacional es **$0**. Recalculá al cumplir el primer año.`,
      tone: 'warn',
      icon: '⏳',
    };
  } else if (isr_calculado <= 0) {
    _insight = {
      title: 'Prima libre de ISR',
      text: `Tus **${dias_vacaciones} días** de vacaciones generan una prima de **${fmt(prima_vacacional_bruta)}**, toda dentro de la exención de **15 UMA (${fmt(exencion_isr)})**: no se retiene ISR y cobrás los **${fmt(prima_neta)}** completos.`,
      tone: 'good',
      icon: '🏖️',
    };
  } else {
    const pctRet = prima_vacacional_bruta > 0 ? (isr_calculado / prima_vacacional_bruta) * 100 : 0;
    _insight = {
      title: 'Retención de ISR sobre el excedente',
      text: `De los **${fmt(prima_vacacional_bruta)}** de prima, **${fmt(exencion_isr)}** quedan exentos y el resto paga ISR: te retienen **${fmt(isr_calculado)}** (**${pctRet.toFixed(1)}%**) y cobrás **${fmt(prima_neta)}** netos.`,
      tone: 'warn',
      icon: '🏖️',
    };
  }

  // Gráfico: cómo se reparte la prima bruta (neto + ISR)
  let _chart: any;
  if (dias_vacaciones > 0 && prima_vacacional_bruta > 0) {
    const slices = [{ label: 'Prima neta', value: Math.round(prima_neta * 100) / 100 }];
    if (isr_calculado > 0) slices.push({ label: 'ISR retenido', value: Math.round(isr_calculado * 100) / 100 });
    _chart = {
      type: 'doughnut',
      slices,
      prefix: '$',
      centerValue: fmt(prima_vacacional_bruta),
      centerLabel: 'Prima bruta',
      ariaLabel: `Reparto de la prima vacacional bruta de ${fmt(prima_vacacional_bruta)} entre neto e ISR retenido`,
    };
  }

  return {
    dias_vacaciones: Math.round(dias_vacaciones),
    prima_vacacional_bruta: Math.round(prima_vacacional_bruta * 100) / 100,
    uma_anual_2026: Math.round(UMA_ANUAL_2026 * 100) / 100,
    exencion_isr: Math.round(exencion_isr * 100) / 100,
    base_gravable: Math.round(base_gravable * 100) / 100,
    isr_calculado: Math.round(isr_calculado * 100) / 100,
    prima_neta: Math.round(prima_neta * 100) / 100,
    nota_fiscal: nota_fiscal,
    _insight,
    _chart
  };
}
