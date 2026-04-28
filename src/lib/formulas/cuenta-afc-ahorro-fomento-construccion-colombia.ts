export interface Inputs {
  aporte_mensual: number;
  tarifa_marginal: number;
  años_proyeccion: number;
  rentabilidad_anual: number;
}

export interface Outputs {
  aporte_anual: number;
  aporte_anual_permitido: number;
  aporte_deducible: number;
  ahorro_fiscal_anual: number;
  capital_acumulado_sin_rentabilidad: number;
  capital_acumulado_con_rentabilidad: number;
  ahorro_fiscal_acumulado: number;
  rentabilidad_acumulada: number;
  patrimonio_total: number;
  aviso_limite: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia - DIAN
  const UVT_2026 = 41368; // Decreto UVT 2026
  const LIMITE_UVT = 3800; // Ley 1557 de 2012
  const LIMITE_LEGAL_PESOS = LIMITE_UVT * UVT_2026; // 157.2M aprox
  const PORCENTAJE_LIMITE_INGRESO = 0.30; // 30% ingreso laboral máximo

  // Validaciones y ajustes
  const aporte_mensual = Math.max(0, i.aporte_mensual || 0);
  const tarifa_marginal = Math.max(0, Math.min(100, i.tarifa_marginal || 0));
  const años_proyeccion = Math.max(1, Math.min(40, i.años_proyeccion || 5));
  const rentabilidad_anual = Math.max(0, Math.min(100, i.rentabilidad_anual || 6.5));

  // Cálculo aporte anual
  const aporte_anual = aporte_mensual * 12;

  // Límite legal (3.800 UVT)
  const aporte_anual_permitido = LIMITE_LEGAL_PESOS;

  // Aporte deducible: menor entre aporte anual y límite legal
  const aporte_deducible = Math.min(aporte_anual, LIMITE_LEGAL_PESOS);

  // Ahorro fiscal anual (año 1)
  const ahorro_fiscal_anual = aporte_deducible * (tarifa_marginal / 100);

  // Capital acumulado sin rentabilidad
  const capital_acumulado_sin_rentabilidad = aporte_anual * años_proyeccion;

  // Capital acumulado con rentabilidad (interés compuesto)
  let capital_acumulado_con_rentabilidad = 0;
  if (rentabilidad_anual === 0) {
    capital_acumulado_con_rentabilidad = capital_acumulado_sin_rentabilidad;
  } else {
    const r = rentabilidad_anual / 100;
    // Fórmula: VF = aporte_anual * [((1+r)^n - 1) / r]
    capital_acumulado_con_rentabilidad =
      aporte_anual * (((Math.pow(1 + r, años_proyeccion) - 1) / r));
  }

  // Ahorro fiscal acumulado (mismo año 1 × años)
  const ahorro_fiscal_acumulado = ahorro_fiscal_anual * años_proyeccion;

  // Rentabilidad generada por inversión
  const rentabilidad_acumulada =
    capital_acumulado_con_rentabilidad - capital_acumulado_sin_rentabilidad;

  // Patrimonio total (capital + ahorro fiscal acumulado)
  const patrimonio_total =
    capital_acumulado_con_rentabilidad + ahorro_fiscal_acumulado;

  // Aviso si supera límite
  let aviso_limite = "✓ Aporte dentro del límite legal (3.800 UVT)";
  if (aporte_anual > LIMITE_LEGAL_PESOS) {
    const exceso = aporte_anual - LIMITE_LEGAL_PESOS;
    aviso_limite = `⚠ Aporte excede límite: $${exceso.toLocaleString('es-CO', { maximumFractionDigits: 0 })} no es deducible en renta.`;
  }

  return {
    aporte_anual: Math.round(aporte_anual),
    aporte_anual_permitido: Math.round(aporte_anual_permitido),
    aporte_deducible: Math.round(aporte_deducible),
    ahorro_fiscal_anual: Math.round(ahorro_fiscal_anual),
    capital_acumulado_sin_rentabilidad: Math.round(
      capital_acumulado_sin_rentabilidad
    ),
    capital_acumulado_con_rentabilidad: Math.round(
      capital_acumulado_con_rentabilidad
    ),
    ahorro_fiscal_acumulado: Math.round(ahorro_fiscal_acumulado),
    rentabilidad_acumulada: Math.round(rentabilidad_acumulada),
    patrimonio_total: Math.round(patrimonio_total),
    aviso_limite: aviso_limite,
  };
}
