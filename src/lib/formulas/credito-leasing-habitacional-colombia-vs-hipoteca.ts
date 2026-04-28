export interface Inputs {
  precio_vivienda: number;
  plazo_anos: number;
  tasa_leasing_anual: number;
  tasa_hipoteca_anual: number;
  ingresos_mensuales_brutos: number;
  cuota_inicial_porcentaje: number;
  opcion_compra_porcentaje: number;
  tasa_marginal_irpf: number;
}

export interface Outputs {
  canon_mensual_leasing: number;
  cuota_hipoteca_mensual: number;
  total_pagado_leasing: number;
  total_pagado_hipoteca: number;
  diferencia_costo_total: number;
  beneficio_fiscal_leasing_anual: number;
  beneficio_fiscal_hipoteca_anual: number;
  ratio_endeudamiento_leasing: number;
  ratio_endeudamiento_hipoteca: number;
  diferencia_mensual: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes Colombia 2026
  const MESES_PLAZO = i.plazo_anos * 12; // Conversión años a meses
  const UVT_2026 = 48000000; // UVT Colombia 2026
  const LIMITE_DEDUCCION_HIPOTECA_UVT = 1.2; // Máximo UVT deducible intereses
  const SEGURO_HIPOTECA_ANUAL = 0.005; // 0.5% anual estimado
  const TASA_MARGINAL_DECIMAL = i.tasa_marginal_irpf / 100;

  // ========== LEASING HABITACIONAL ==========
  // Canon mensual: fórmula amortización francesa
  // Canon = [P × (r/12) × (1 + r/12)^n] / [(1 + r/12)^n − 1]
  const tasa_mensual_leasing = i.tasa_leasing_anual / 100 / 12;
  const factor_leasing = Math.pow(1 + tasa_mensual_leasing, MESES_PLAZO);
  const canon_mensual_leasing =
    (i.precio_vivienda * tasa_mensual_leasing * factor_leasing) /
    (factor_leasing - 1);

  // Total pagado leasing = canon × meses + opción compra
  const opcion_compra_valor =
    (i.precio_vivienda * i.opcion_compra_porcentaje) / 100;
  const total_pagado_leasing =
    canon_mensual_leasing * MESES_PLAZO + opcion_compra_valor;

  // Beneficio fiscal leasing anual (canon 100% deducible)
  const beneficio_fiscal_leasing_anual =
    canon_mensual_leasing * 12 * TASA_MARGINAL_DECIMAL;

  // Ratio endeudamiento leasing
  const ratio_endeudamiento_leasing =
    (canon_mensual_leasing / i.ingresos_mensuales_brutos) * 100;

  // ========== HIPOTECA TRADICIONAL ==========
  const cuota_inicial = (i.precio_vivienda * i.cuota_inicial_porcentaje) / 100;
  const prestamo_hipoteca = i.precio_vivienda - cuota_inicial;

  // Cuota hipoteca: fórmula amortización francesa
  const tasa_mensual_hipoteca = i.tasa_hipoteca_anual / 100 / 12;
  const factor_hipoteca = Math.pow(1 + tasa_mensual_hipoteca, MESES_PLAZO);
  const cuota_hipoteca_mensual =
    (prestamo_hipoteca * tasa_mensual_hipoteca * factor_hipoteca) /
    (factor_hipoteca - 1);

  // Total pagado hipoteca = cuotas + cuota inicial + seguros
  const seguros_totales = prestamo_hipoteca * SEGURO_HIPOTECA_ANUAL * i.plazo_anos; // Estimado sobre 20 años
  const total_pagado_hipoteca =
    cuota_hipoteca_mensual * MESES_PLAZO + cuota_inicial + seguros_totales;

  // Beneficio fiscal hipoteca (intereses años 1-5, límite 1.2 UVT)
  // Cálculo simplificado: intereses año 1 ≈ (saldo inicial × tasa) / 2
  const intereses_ano1_aprox =
    (prestamo_hipoteca * i.tasa_hipoteca_anual) / 100 / 2;
  const limite_deduccion_hipoteca =
    LIMITE_DEDUCCION_HIPOTECA_UVT * UVT_2026;
  const intereses_deducibles_hipoteca = Math.min(
    intereses_ano1_aprox,
    limite_deduccion_hipoteca
  );
  const beneficio_fiscal_hipoteca_anual =
    intereses_deducibles_hipoteca * TASA_MARGINAL_DECIMAL;

  // Ratio endeudamiento hipoteca
  const ratio_endeudamiento_hipoteca =
    (cuota_hipoteca_mensual / i.ingresos_mensuales_brutos) * 100;

  // ========== COMPARATIVAS ==========
  const diferencia_costo_total = total_pagado_leasing - total_pagado_hipoteca;
  const diferencia_mensual = canon_mensual_leasing - cuota_hipoteca_mensual;

  return {
    canon_mensual_leasing: Math.round(canon_mensual_leasing),
    cuota_hipoteca_mensual: Math.round(cuota_hipoteca_mensual),
    total_pagado_leasing: Math.round(total_pagado_leasing),
    total_pagado_hipoteca: Math.round(total_pagado_hipoteca),
    diferencia_costo_total: Math.round(diferencia_costo_total),
    beneficio_fiscal_leasing_anual: Math.round(
      beneficio_fiscal_leasing_anual
    ),
    beneficio_fiscal_hipoteca_anual: Math.round(
      beneficio_fiscal_hipoteca_anual
    ),
    ratio_endeudamiento_leasing: Math.round(
      ratio_endeudamiento_leasing * 100
    ) / 100,
    ratio_endeudamiento_hipoteca: Math.round(
      ratio_endeudamiento_hipoteca * 100
    ) / 100,
    diferencia_mensual: Math.round(diferencia_mensual),
  };
}
