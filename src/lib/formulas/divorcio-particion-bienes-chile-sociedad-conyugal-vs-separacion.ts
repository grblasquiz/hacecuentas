export interface Inputs {
  regimen_patrimonial: 'sociedad_conyugal' | 'separacion_bienes' | 'participacion_gananciales';
  anos_matrimonio: number;
  bienes_gananciales_totales: number;
  bienes_propios_conyugue_a: number;
  bienes_propios_conyugue_b: number;
  deudas_gananciales: number;
  deudas_propias_a: number;
  deudas_propias_b: number;
  gastos_proceso_legal: number;
  arancel_notarial: number;
  impuesto_transferencia: boolean;
}

export interface OutputRow {
  regimen: string;
  conyugue_a: number;
  conyugue_b: number;
}

export interface Outputs {
  porcentaje_conyugue_a: number;
  porcentaje_conyugue_b: number;
  monto_bienes_conyugue_a: number;
  monto_bienes_conyugue_b: number;
  costo_total_divorcio: number;
  costo_porcentaje_activo: number;
  deuda_neta_conyugue_a: number;
  deuda_neta_conyugue_b: number;
  patrimonio_liquido_a: number;
  patrimonio_liquido_b: number;
  tabla_comparativa: OutputRow[];
  impuesto_estimado: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes SII 2026
  const TASA_IMPUESTO_TRANSFERENCIA = 0.0125; // 1.25%
  const EXENSION_DIVORCIO = 0.5; // 50% exención en divorcio mutuo acuerdo
  const TASA_IGC_MAX = 0.45; // Impuesto Global Complementario máximo
  const LIMITE_IGC = 15000000; // Límite patrimonio para IGC

  // Validaciones básicas
  if (i.bienes_gananciales_totales < 0) i.bienes_gananciales_totales = 0;
  if (i.deudas_gananciales < 0) i.deudas_gananciales = 0;
  if (i.gastos_proceso_legal < 0) i.gastos_proceso_legal = 0;
  if (i.anos_matrimonio < 0) i.anos_matrimonio = 0;

  let porcentaje_a = 0;
  let porcentaje_b = 0;
  let patrimonio_bruto_a = 0;
  let patrimonio_bruto_b = 0;
  let deuda_neta_a = 0;
  let deuda_neta_b = 0;

  // Cálculo según régimen
  if (i.regimen_patrimonial === 'sociedad_conyugal') {
    // SOCIEDAD CONYUGAL: 50/50 gananciales
    const activo_ganancial_neto = Math.max(
      0,
      i.bienes_gananciales_totales - i.deudas_gananciales
    );

    const cuota_ganancial_a = activo_ganancial_neto * 0.5;
    const cuota_ganancial_b = activo_ganancial_neto * 0.5;

    patrimonio_bruto_a = i.bienes_propios_conyugue_a + cuota_ganancial_a;
    patrimonio_bruto_b = i.bienes_propios_conyugue_b + cuota_ganancial_b;

    // Deudas: mitad gananciales + propias
    deuda_neta_a =
      i.deudas_propios_a + i.deudas_gananciales * 0.5;
    deuda_neta_b =
      i.deudas_propios_b + i.deudas_gananciales * 0.5;

    porcentaje_a = 50;
    porcentaje_b = 50;
  } else if (i.regimen_patrimonial === 'separacion_bienes') {
    // SEPARACIÓN DE BIENES: cada uno lo suyo
    patrimonio_bruto_a = i.bienes_propios_conyugue_a;
    patrimonio_bruto_b = i.bienes_propios_conyugue_b;

    deuda_neta_a = i.deudas_propios_a; // Sin asumir deudas gananciales
    deuda_neta_b = i.deudas_propios_b;

    porcentaje_a = 100;
    porcentaje_b = 0; // No hay división de gananciales
  } else if (i.regimen_patrimonial === 'participacion_gananciales') {
    // PARTICIPACIÓN EN GANANCIALES: independiente + equidad en ganancia
    patrimonio_bruto_a = i.bienes_propios_conyugue_a;
    patrimonio_bruto_b = i.bienes_propios_conyugue_b;

    // Simplificación: asumir que ganancia neta es proporcional a patrimonio ganancial inicial
    // (En real se requiere comparativa patrimonio inicio vs fin matrimonio)
    const ganancia_neta_a = (i.bienes_gananciales_totales * 0.5) - (i.deudas_gananciales * 0.5);
    const ganancia_neta_b = (i.bienes_gananciales_totales * 0.5) - (i.deudas_gananciales * 0.5);

    // Si ganancias iguales, no hay transferencia; si no, cónyuge ganador paga 50% diferencia
    if (ganancia_neta_a > ganancia_neta_b) {
      const diferencia = ganancia_neta_a - ganancia_neta_b;
      patrimonio_bruto_a += diferencia * 0.5;
      patrimonio_bruto_b -= diferencia * 0.5;
    } else if (ganancia_neta_b > ganancia_neta_a) {
      const diferencia = ganancia_neta_b - ganancia_neta_a;
      patrimonio_bruto_b += diferencia * 0.5;
      patrimonio_bruto_a -= diferencia * 0.5;
    }

    deuda_neta_a = i.deudas_propios_a; // Deudas propias
    deuda_neta_b = i.deudas_propios_b;

    porcentaje_a = 50; // Conceptualmente equiparable a sociedad conyugal en resultado
    porcentaje_b = 50;
  }

  // Asegurar no negativos
  patrimonio_bruto_a = Math.max(0, patrimonio_bruto_a);
  patrimonio_bruto_b = Math.max(0, patrimonio_bruto_b);
  deuda_neta_a = Math.max(0, deuda_neta_a);
  deuda_neta_b = Math.max(0, deuda_neta_b);

  // Total patrimonio para prorrateo costos
  const total_patrimonio = patrimonio_bruto_a + patrimonio_bruto_b;
  let costo_prorrateo_a = 0;
  let costo_prorrateo_b = 0;

  if (total_patrimonio > 0) {
    costo_prorrateo_a =
      i.gastos_proceso_legal * (patrimonio_bruto_a / total_patrimonio);
    costo_prorrateo_b =
      i.gastos_proceso_legal * (patrimonio_bruto_b / total_patrimonio);
  }

  // Patrimonio neto = bruto - deudas - costos legales
  const patrimonio_liquido_a = Math.max(
    0,
    patrimonio_bruto_a - deuda_neta_a - costo_prorrateo_a
  );
  const patrimonio_liquido_b = Math.max(
    0,
    patrimonio_bruto_b - deuda_neta_b - costo_prorrateo_b
  );

  // Impuesto transferencia (exención parcial divorcio si mutuo acuerdo)
  let impuesto_estimado = 0;
  if (i.impuesto_transferencia) {
    // En divorcio: 50% exención típica
    const base_imponible_a = patrimonio_liquido_a * (1 - EXENSION_DIVORCIO);
    const base_imponible_b = patrimonio_liquido_b * (1 - EXENSION_DIVORCIO);
    impuesto_estimado =
      (base_imponible_a + base_imponible_b) * TASA_IMPUESTO_TRANSFERENCIA;
  }

  // Costo total divorcio
  const costo_total_divorcio =
    i.gastos_proceso_legal + i.arancel_notarial + impuesto_estimado;
  const costo_porcentaje_activo =
    total_patrimonio > 0 ? (costo_total_divorcio / total_patrimonio) * 100 : 0;

  // Tabla comparativa (simular 3 regímenes con datos actuales)
  const tabla_comparativa: OutputRow[] = [
    {
      regimen: 'Sociedad conyugal (50/50)',
      conyugue_a: patrimonio_bruto_a * 0.5,
      conyugue_b: patrimonio_bruto_b * 0.5,
    },
    {
      regimen: 'Separación de bienes',
      conyugue_a: i.bienes_propios_conyugue_a,
      conyugue_b: i.bienes_propios_conyugue_b,
    },
    {
      regimen: 'Participación gananciales',
      conyugue_a: patrimonio_liquido_a,
      conyugue_b: patrimonio_liquido_b,
    },
  ];

  return {
    porcentaje_conyugue_a: porcentaje_a,
    porcentaje_conyugue_b: porcentaje_b,
    monto_bienes_conyugue_a: Math.round(patrimonio_bruto_a),
    monto_bienes_conyugue_b: Math.round(patrimonio_bruto_b),
    costo_total_divorcio: Math.round(costo_total_divorcio),
    costo_porcentaje_activo: Math.round(costo_porcentaje_activo * 100) / 100,
    deuda_neta_conyugue_a: Math.round(deuda_neta_a),
    deuda_neta_conyugue_b: Math.round(deuda_neta_b),
    patrimonio_liquido_a: Math.round(patrimonio_liquido_a),
    patrimonio_liquido_b: Math.round(patrimonio_liquido_b),
    tabla_comparativa: tabla_comparativa,
    impuesto_estimado: Math.round(impuesto_estimado),
  };
}
