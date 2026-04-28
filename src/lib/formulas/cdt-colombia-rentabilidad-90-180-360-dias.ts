export interface Inputs {
  monto_inicial: number;
  plazo_dias: 90 | 180 | 360 | 720;
  banco_seleccionado: 'bancolombia' | 'davivienda' | 'bbva' | 'banco_bogota' | 'personalizado';
  tasa_ea_personalizada: number;
}

export interface Outputs {
  tasa_ea_vigente: number;
  dias_exactos: number;
  rendimiento_bruto: number;
  retencion_fuente: number;
  rendimiento_neto: number;
  capital_final: number;
  rentabilidad_efectiva_neta: number;
}

function getTasaEA(banco: string, plazo: number): number {
  // Tasas EA vigentes abril 2026 - Referencias Superintendencia Financiera
  const tasas: Record<string, Record<number, number>> = {
    bancolombia: { 90: 8.2, 180: 9.5, 360: 10.2, 720: 10.8 },
    davivienda: { 90: 8.0, 180: 9.3, 360: 10.0, 720: 10.5 },
    bbva: { 90: 8.5, 180: 9.8, 360: 10.5, 720: 11.2 },
    banco_bogota: { 90: 8.3, 180: 9.6, 360: 10.3, 720: 10.9 }
  };
  return tasas[banco]?.[plazo] ?? 9.5;
}

export function compute(i: Inputs): Outputs {
  const { monto_inicial, plazo_dias, banco_seleccionado, tasa_ea_personalizada } = i;

  // Validaciones
  if (monto_inicial < 25000) {
    return {
      tasa_ea_vigente: 0,
      dias_exactos: 0,
      rendimiento_bruto: 0,
      retencion_fuente: 0,
      rendimiento_neto: 0,
      capital_final: monto_inicial,
      rentabilidad_efectiva_neta: 0
    };
  }

  // Obtener tasa EA según banco
  const tasa_ea = banco_seleccionado === 'personalizado' 
    ? tasa_ea_personalizada 
    : getTasaEA(banco_seleccionado, plazo_dias);

  const ea_decimal = tasa_ea / 100;
  const dias_exactos = plazo_dias;

  // Cálculo de rendimiento bruto con interés compuesto
  // RB = Capital × [(1 + EA)^(días/365) − 1]
  const exponente = dias_exactos / 365;
  const factor_crecimiento = Math.pow(1 + ea_decimal, exponente);
  const rendimiento_bruto = monto_inicial * (factor_crecimiento - 1);

  // Retención en la fuente: 4% sobre intereses (Resolución 092/2023 DIAN)
  const retencion_fuente = rendimiento_bruto * 0.04;

  // Rendimiento neto = rendimiento bruto - retención
  const rendimiento_neto = rendimiento_bruto - retencion_fuente;

  // Capital final
  const capital_final = monto_inicial + rendimiento_neto;

  // Rentabilidad efectiva neta anualizada
  // REN = [(CF / CI)^(365/días) − 1] × 100%
  const razon_capital = capital_final / monto_inicial;
  const exp_anual = 365 / dias_exactos;
  const rentabilidad_efectiva_neta = (Math.pow(razon_capital, exp_anual) - 1) * 100;

  return {
    tasa_ea_vigente: parseFloat(tasa_ea.toFixed(2)),
    dias_exactos,
    rendimiento_bruto: parseFloat(rendimiento_bruto.toFixed(2)),
    retencion_fuente: parseFloat(retencion_fuente.toFixed(2)),
    rendimiento_neto: parseFloat(rendimiento_neto.toFixed(2)),
    capital_final: parseFloat(capital_final.toFixed(2)),
    rentabilidad_efectiva_neta: parseFloat(rentabilidad_efectiva_neta.toFixed(2))
  };
}
