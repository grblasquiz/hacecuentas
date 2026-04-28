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
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 México - Fuentes SAT, INEGI
  const UMA_2026 = 1081; // INEGI UMA diaria 2026
  const EXENCION_UMA = 30; // Exención aguinaldo = 30 UMA (SAT ISR 2026)
  const EXENCION_PESOS = UMA_2026 * EXENCION_UMA; // ~$32,430

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

  // Tarifa ISR anual 2026 (SAT). Aplicar a base_isr
  // Tramos 2026:
  // $0 - $3,271 → 1.92%
  // $3,271 - $26,170 → 6.4%
  // $26,170 - $61,790 → 10.88%
  // $61,790 - $104,387 → 16%
  // $104,387 - $130,194 → 19.84%
  // $130,194 - $391,181 → 23.52%
  // > $391,181 → 30% y 35%
  
  let isr_retenido = 0;
  if (base_isr > 0) {
    if (base_isr <= 3271) {
      isr_retenido = base_isr * 0.0192;
    } else if (base_isr <= 26170) {
      isr_retenido = 3271 * 0.0192 + (base_isr - 3271) * 0.064;
    } else if (base_isr <= 61790) {
      isr_retenido = 3271 * 0.0192 + (26170 - 3271) * 0.064 + (base_isr - 26170) * 0.1088;
    } else if (base_isr <= 104387) {
      isr_retenido = 3271 * 0.0192 + (26170 - 3271) * 0.064 + (61790 - 26170) * 0.1088 + (base_isr - 61790) * 0.16;
    } else if (base_isr <= 130194) {
      isr_retenido = 3271 * 0.0192 + (26170 - 3271) * 0.064 + (61790 - 26170) * 0.1088 + (104387 - 61790) * 0.16 + (base_isr - 104387) * 0.1984;
    } else if (base_isr <= 391181) {
      isr_retenido = 3271 * 0.0192 + (26170 - 3271) * 0.064 + (61790 - 26170) * 0.1088 + (104387 - 61790) * 0.16 + (130194 - 104387) * 0.1984 + (base_isr - 130194) * 0.2352;
    } else {
      isr_retenido = 3271 * 0.0192 + (26170 - 3271) * 0.064 + (61790 - 26170) * 0.1088 + (104387 - 61790) * 0.16 + (130194 - 104387) * 0.1984 + (391181 - 130194) * 0.2352 + (base_isr - 391181) * 0.30;
    }
  }

  // Aguinaldo neto
  const aguinaldo_neto = aguinaldo_bruto - isr_retenido;

  // Tasa efectiva
  const tasa_isr_efectiva = aguinaldo_bruto > 0 ? (isr_retenido / aguinaldo_bruto) * 100 : 0;

  return {
    aguinaldo_bruto: Math.round(aguinaldo_bruto * 100) / 100,
    base_isr: Math.round(base_isr * 100) / 100,
    isr_retenido: Math.round(isr_retenido * 100) / 100,
    aguinaldo_neto: Math.round(aguinaldo_neto * 100) / 100,
    tasa_isr_efectiva: Math.round(tasa_isr_efectiva * 100) / 100
  };
}
