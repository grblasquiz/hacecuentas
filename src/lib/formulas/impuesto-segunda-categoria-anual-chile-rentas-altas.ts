export interface Inputs {
  renta_sueldos_anuales: number;
  renta_honorarios: number;
  renta_capital_mobiliario: number;
  renta_arriendos: number;
  descuento_afp: number;
  descuento_salud: number;
  impuestos_pagados: number;
  gastos_deducibles: number;
  credito_unico_familiar: number;
  uta_valor: number;
}

export interface Outputs {
  renta_imponible_total: number;
  renta_en_uta: number;
  tramo_impositivo: string;
  tasa_marginal: number;
  impuesto_global_complementario: number;
  impuesto_menos_creditos: number;
  resultado_declaracion: number;
  tipo_resultado: string;
  anticipo_obligatorio: number;
}

export function compute(i: Inputs): Outputs {
  // Fuente: SII Servicio de Impuestos Internos Chile 2026
  // Valores UTA 2026: $68.625 (promedio, actualizar según mes)
  // Tasa IGC: 0%, 5%, 10%, 17%, 25%, 35–40% según tramo UTA
  // Límite anticipo obligatorio: >$1.500.000 (~22 UTA)

  // 1. Calcular Renta Bruta Total
  const renta_bruta = 
    i.renta_sueldos_anuales + 
    i.renta_honorarios + 
    i.renta_capital_mobiliario + 
    i.renta_arriendos;

  // 2. Calcular Renta Imponible (después descuentos obligatorios)
  const renta_imponible_total = 
    renta_bruta - 
    i.descuento_afp - 
    i.descuento_salud - 
    i.gastos_deducibles;

  // Asegurar que no sea negativa
  const renta_imp_final = Math.max(0, renta_imponible_total);

  // 3. Convertir a UTA
  const uta_valor = i.uta_valor > 0 ? i.uta_valor : 68625; // Default UTA 2026
  const renta_en_uta = renta_imp_final / uta_valor;

  // 4. Determinar tramo y tasa marginal según UTA
  // Tramos 2026 (verificar en www.sii.cl Tablas IGC)
  let tasa_marginal = 0;
  let tramo_impositivo = "0–13,5 UTA (exento)";

  if (renta_en_uta > 120) {
    tasa_marginal = 0.40; // Tramo máximo 35–40%
    tramo_impositivo = ">120 UTA (35-40%)";
  } else if (renta_en_uta > 80) {
    tasa_marginal = 0.25; // 25%
    tramo_impositivo = "80–120 UTA (25%)";
  } else if (renta_en_uta > 60) {
    tasa_marginal = 0.17; // 17%
    tramo_impositivo = "60–80 UTA (17%)";
  } else if (renta_en_uta > 30) {
    tasa_marginal = 0.10; // 10%
    tramo_impositivo = "30–60 UTA (10%)";
  } else if (renta_en_uta > 13.5) {
    tasa_marginal = 0.05; // 5%
    tramo_impositivo = "13,5–30 UTA (5%)";
  }

  // 5. Calcular Impuesto Global Complementario (IGC)
  // Fórmula simplificada: aplicar tasa marginal sobre renta imponible
  // En realidad es progresivo por cada tramo (requeriría tabla detallada)
  // Aproximación: tasa efectiva en el margen
  let impuesto_igc = 0;

  if (renta_en_uta > 120) {
    // Tramos progresivos acumulados (aproximación simplificada)
    impuesto_igc = 
      13.5 * uta_valor * 0 + // 0–13,5
      (30 - 13.5) * uta_valor * 0.05 + // 13,5–30
      (60 - 30) * uta_valor * 0.10 + // 30–60
      (80 - 60) * uta_valor * 0.17 + // 60–80
      (120 - 80) * uta_valor * 0.25 + // 80–120
      (renta_en_uta - 120) * uta_valor * 0.40; // >120
  } else if (renta_en_uta > 80) {
    impuesto_igc =
      13.5 * uta_valor * 0 +
      (30 - 13.5) * uta_valor * 0.05 +
      (60 - 30) * uta_valor * 0.10 +
      (80 - 60) * uta_valor * 0.17 +
      (renta_en_uta - 80) * uta_valor * 0.25;
  } else if (renta_en_uta > 60) {
    impuesto_igc =
      13.5 * uta_valor * 0 +
      (30 - 13.5) * uta_valor * 0.05 +
      (60 - 30) * uta_valor * 0.10 +
      (renta_en_uta - 60) * uta_valor * 0.17;
  } else if (renta_en_uta > 30) {
    impuesto_igc =
      13.5 * uta_valor * 0 +
      (30 - 13.5) * uta_valor * 0.05 +
      (renta_en_uta - 30) * uta_valor * 0.10;
  } else if (renta_en_uta > 13.5) {
    impuesto_igc =
      13.5 * uta_valor * 0 +
      (renta_en_uta - 13.5) * uta_valor * 0.05;
  }

  // Redondear a pesos
  impuesto_igc = Math.round(impuesto_igc);

  // 6. Calcular Impuesto menos créditos y retenciones
  const impuesto_menos_creditos = 
    impuesto_igc - 
    i.impuestos_pagados - 
    i.credito_unico_familiar;

  // 7. Resultado declaración (devolución o cargo)
  const resultado_declaracion = impuesto_menos_creditos;
  let tipo_resultado = "Cargo";

  if (resultado_declaracion < 0) {
    tipo_resultado = "Devolución";
  } else if (resultado_declaracion === 0) {
    tipo_resultado = "Sin movimiento";
  }

  // 8. Anticipo obligatorio (si cargo >$1.500.000 ~22 UTA)
  // Anticipo = 50% del cargo calculado
  let anticipo_obligatorio = 0;
  const limite_anticipo = 1500000; // $1.500.000

  if (resultado_declaracion > limite_anticipo) {
    anticipo_obligatorio = Math.round(resultado_declaracion * 0.5);
  }

  return {
    renta_imponible_total: Math.round(renta_imp_final),
    renta_en_uta: Math.round(renta_en_uta * 100) / 100,
    tramo_impositivo,
    tasa_marginal: Math.round(tasa_marginal * 10000) / 100, // porcentaje
    impuesto_global_complementario: impuesto_igc,
    impuesto_menos_creditos: Math.round(impuesto_menos_creditos),
    resultado_declaracion: Math.round(resultado_declaracion),
    tipo_resultado,
    anticipo_obligatorio
  };
}
