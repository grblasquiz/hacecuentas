export interface Inputs {
  renta_liquida_fiscal: number;
  gasto_fic_certificado: number;
  tipo_proyecto: 'investigacion_basica' | 'investigacion_aplicada' | 'desarrollo_experimental' | 'innovacion_tecnologica';
  institucion_ejecutora: 'directa' | 'colaboracion' | 'contratacion';
  tarifa_impuesto_renta: number;
}

export interface Outputs {
  aporte_maximo_fic: number;
  aporte_a_deducir: number;
  base_imponible_reducida: number;
  impuesto_sin_fic: number;
  impuesto_con_fic: number;
  ahorro_tributario: number;
  tasa_beneficio_efectiva: number;
  costo_neto_fic: number;
  requiere_certificacion: string;
  resumen_cumplimiento: string;
}

export function compute(i: Inputs): Outputs {
  // Validaciones básicas
  if (i.renta_liquida_fiscal < 0) {
    return {
      aporte_maximo_fic: 0,
      aporte_a_deducir: 0,
      base_imponible_reducida: i.renta_liquida_fiscal,
      impuesto_sin_fic: 0,
      impuesto_con_fic: 0,
      ahorro_tributario: 0,
      tasa_beneficio_efectiva: 0,
      costo_neto_fic: 0,
      requiere_certificacion: 'ERROR: Renta negativa no válida',
      resumen_cumplimiento: 'Datos de entrada inválidos'
    };
  }

  // Límite FIC: máximo 1% de renta líquida fiscal (DIAN art. 158-1)
  // Referencia: Estatuto Tributario Colombiano 2026
  const LIMITE_PORCENTAJE_FIC = 0.01;
  const aporte_maximo_fic = i.renta_liquida_fiscal * LIMITE_PORCENTAJE_FIC;

  // Aporte a deducir: el menor entre gasto certificado y máximo permitido
  const aporte_a_deducir = Math.min(i.gasto_fic_certificado, aporte_maximo_fic);

  // Base imponible después de deducción FIC
  const base_imponible_reducida = i.renta_liquida_fiscal - aporte_a_deducir;

  // Impuesto sin beneficio FIC (en COP)
  const tarifa_decimal = i.tarifa_impuesto_renta / 100;
  const impuesto_sin_fic = i.renta_liquida_fiscal * tarifa_decimal;

  // Impuesto con deducción FIC
  const impuesto_con_fic = base_imponible_reducida * tarifa_decimal;

  // Ahorro tributario
  const ahorro_tributario = impuesto_sin_fic - impuesto_con_fic;

  // Tasa de beneficio efectivo (%)
  const tasa_beneficio_efectiva = aporte_a_deducir > 0 
    ? (ahorro_tributario / aporte_a_deducir) * 100 
    : 0;

  // Costo neto del aporte FIC (lo que realmente cuesta después de beneficio fiscal)
  const costo_neto_fic = aporte_a_deducir - ahorro_tributario;

  // Requisitos y certificación (DIAN + COLCIENCIAS/MinCiencia)
  const requiere_certificacion = 'SÍ - OBLIGATORIA. Acta de cumplimiento COLCIENCIAS/MinCiencia vigente antes de declarar renta.';

  // Resumen checklist cumplimiento
  const checklist = [
    '✓ Gasto certificado por COLCIENCIAS/MinCiencia',
    '✓ Proyecto clasificado como I+D+i (investigación, desarrollo o innovación)',
    '✓ Sociedad mercantil domiciliada en Colombia',
    `✓ Aporte dentro de límite 1% renta (máx: $${Math.round(aporte_maximo_fic).toLocaleString('es-CO')})`,
    '✓ Documentación: facturas, contratos, informes técnicos, comprobantes pago',
    '✓ Contabilidad separada por proyecto',
    '✓ Acta vigente al momento de declaración de renta',
    '✓ Informe técnico de avance o finalización'
  ];

  const resumen_cumplimiento = `CHECKLIST FIC 2026:\n${checklist.join('\n')}\n\nIMPORTANTE: Incumplimiento genera rechazo de deducción, impuesto adicional + intereses. Consulta contador especializado en beneficios fiscales.`;

  return {
    aporte_maximo_fic: Math.round(aporte_maximo_fic),
    aporte_a_deducir: Math.round(aporte_a_deducir),
    base_imponible_reducida: Math.round(base_imponible_reducida),
    impuesto_sin_fic: Math.round(impuesto_sin_fic),
    impuesto_con_fic: Math.round(impuesto_con_fic),
    ahorro_tributario: Math.round(ahorro_tributario),
    tasa_beneficio_efectiva: Math.round(tasa_beneficio_efectiva * 100) / 100,
    costo_neto_fic: Math.round(costo_neto_fic),
    requiere_certificacion,
    resumen_cumplimiento
  };
}
