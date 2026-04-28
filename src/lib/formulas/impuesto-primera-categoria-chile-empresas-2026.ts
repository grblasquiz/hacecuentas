export interface Inputs {
  utilidad_bruta: number;
  gastos_operacionales: number;
  gastos_financieros: number;
  gastos_rechazados?: number;
  rentas_no_operacionales?: number;
  depreciacion?: number;
  regime_tributario: 'a14' | '14d';
  ingresos_anuales?: number;
  ppm_pagados?: number;
}

export interface Outputs {
  rli: number;
  tarifa_efectiva: number;
  impuesto_primera_categoria: number;
  ppm_mensual: number;
  impuesto_neto: number;
  credito_igc: number;
  carga_tributaria_efectiva: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile − Fuente: SII
  const TARIFA_14A = 0.27; // Régimen general (Art. 21 Ley Renta)
  const TARIFA_14D = 0.25; // Régimen PYME (Art. 14d Ley Renta)
  const LIMITE_14D_INGRESOS = 3_000_000_000; // $3.000 MM límite elegibilidad 14D
  const MESES_ANIO = 12;

  // Validación y defaults
  const utilidad_bruta = i.utilidad_bruta || 0;
  const gastos_operacionales = i.gastos_operacionales || 0;
  const gastos_financieros = i.gastos_financieros || 0;
  const gastos_rechazados = i.gastos_rechazados || 0;
  const rentas_no_operacionales = i.rentas_no_operacionales || 0;
  const depreciacion = i.depreciacion || 0;
  const ingresos_anuales = i.ingresos_anuales || utilidad_bruta;
  const ppm_pagados = i.ppm_pagados || 0;

  // Cálculo RLI (Renta Líquida Imponible)
  // RLI = Utilidad Bruta − Gastos Oper. − Gastos Fin. − Deprec. + Rentas No Oper. + Gastos Rechazados
  // Fuente: Art. 21 Ley sobre Impuesto a la Renta (DL 824)
  const rli = Math.max(
    0,
    utilidad_bruta -
      gastos_operacionales -
      gastos_financieros -
      depreciacion +
      rentas_no_operacionales +
      gastos_rechazados
  );

  // Determinar tarifa según régimen
  // Régimen 14D: solo si ingresos ≤ $3.000 MM y cumple condiciones
  // Fuente: Art. 14d Ley Renta (PYME semi-integrado)
  let tarifa_efectiva = TARIFA_14A;
  let regimen_aplicado = '14A';

  if (i.regime_tributario === '14d' && ingresos_anuales <= LIMITE_14D_INGRESOS) {
    tarifa_efectiva = TARIFA_14D;
    regimen_aplicado = '14D';
  } else if (i.regime_tributario === '14d' && ingresos_anuales > LIMITE_14D_INGRESOS) {
    // Si selecciona 14D pero supera límite, aplica 14A
    tarifa_efectiva = TARIFA_14A;
    regimen_aplicado = '14A (exc. límite)';
  }

  // Cálculo Impuesto Primera Categoría
  // Fuente: Art. 21 (14A) y Art. 14d (14D) Ley Renta
  const impuesto_primera_categoria = rli * tarifa_efectiva;

  // Cálculo PPM (Pago Provisional Mensual)
  // PPM = Impuesto anual ÷ 12, pagadero días 12 de cada mes
  // Fuente: Art. 85 Ley Renta
  const ppm_mensual = Math.round(impuesto_primera_categoria / MESES_ANIO);

  // Impuesto Neto: después de acreditar PPM pagados
  // Sistema semi-integrado: 100% crédito de PPM
  // Fuente: Art. 21 Ley Renta (sistema semi-integrado desde 2018)
  const impuesto_neto = Math.max(0, impuesto_primera_categoria - ppm_pagados);

  // Crédito contra IGC Accionistas
  // En sistema semi-integrado, 100% del impuesto pagado es acreditable
  // Fuente: Art. 21 Ley Renta (reforma tributaria 2016)
  const credito_igc = impuesto_primera_categoria;

  // Carga tributaria efectiva
  // Fórmula: (Impuesto ÷ RLI) × 100
  const carga_tributaria_efectiva = rli > 0 ? (impuesto_primera_categoria / rli) * 100 : 0;

  return {
    rli: Math.round(rli),
    tarifa_efectiva: Math.round(tarifa_efectiva * 100),
    impuesto_primera_categoria: Math.round(impuesto_primera_categoria),
    ppm_mensual,
    impuesto_neto: Math.round(impuesto_neto),
    credito_igc: Math.round(credito_igc),
    carga_tributaria_efectiva: Number(carga_tributaria_efectiva.toFixed(2))
  };
}
