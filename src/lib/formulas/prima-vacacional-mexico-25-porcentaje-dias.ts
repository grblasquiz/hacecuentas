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
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 México
  const UMA_DIARIA_2026 = 205; // MXN, INEGI 2026
  const UMA_ANUAL_2026 = UMA_DIARIA_2026 * 365; // $74,825 MXN
  const EXENCION_ISR_UMA = 15; // 15 UMA exentas en prima vacacional
  const EXENCION_ISR_MONTO = UMA_DIARIA_2026 * EXENCION_ISR_UMA; // $3,075 MXN

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

  return {
    dias_vacaciones: Math.round(dias_vacaciones),
    prima_vacacional_bruta: Math.round(prima_vacacional_bruta * 100) / 100,
    uma_anual_2026: Math.round(UMA_ANUAL_2026 * 100) / 100,
    exencion_isr: Math.round(exencion_isr * 100) / 100,
    base_gravable: Math.round(base_gravable * 100) / 100,
    isr_calculado: Math.round(isr_calculado * 100) / 100,
    prima_neta: Math.round(prima_neta * 100) / 100,
    nota_fiscal: nota_fiscal
  };
}
