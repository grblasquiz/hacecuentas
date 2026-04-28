export interface Inputs {
  programa_tipo: 'carrera_4anios' | 'carrera_5anios' | 'tecnico_2anios' | 'licenciatura_3anios';
  arancel_anual_pesos: number;
  rsh_percentil: number;
  puntaje_paes: number;
  renta_mensual_estimada: number;
  anos_carrera?: number;
  beca_bicentenario_opcion: 'si' | 'no' | 'ambas';
}

export interface Outputs {
  costo_total_carrera_pesos: number;
  costo_anual_medio: number;
  elegibilidad_cae: string;
  elegibilidad_beca_bicentenario: string;
  cobertura_beca_bicentenario_pesos: number;
  deuda_cae_post_titulacion_pesos: number;
  cuota_cae_mensual_maxima: number;
  plazo_pago_meses: number;
  interes_total_2porciento: number;
  ahorro_beca_vs_cae: number;
  recomendacion_financiera: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile – MINEDUC/SII
  const ARANCEL_MAXIMO_CAE = 2500000; // Pesos, MINEDUC 2026
  const RSH_MAX_CAE = 80; // Percentil
  const RSH_MAX_BECA = 60; // Percentil
  const PAES_MIN_CAE = 450;
  const PAES_MIN_BECA = 500;
  const TASA_CAE_ANUAL = 0.02; // 2% fija post-egreso, SII 2026
  const CUOTA_MAX_PORCENTAJE = 0.10; // 10% renta máximo
  const COBERTURA_BECA_BIENIO_I_II = 2500000; // Años I–II máx, MINEDUC
  const COBERTURA_BECA_PORCENTAJE_III = 0.50; // 50% año III
  const ANOS_DEFAULT: Record<string, number> = {
    'carrera_4anios': 4,
    'carrera_5anios': 5,
    'tecnico_2anios': 2,
    'licenciatura_3anios': 3
  };

  // Aplicar años por defecto
  const anos_carrera = i.anos_carrera ?? ANOS_DEFAULT[i.programa_tipo] ?? 4;

  // Validación inputs básica
  if (i.arancel_anual_pesos < 0 || i.rsh_percentil < 0 || i.rsh_percentil > 100 || 
      i.puntaje_paes < 150 || i.puntaje_paes > 1000 || i.renta_mensual_estimada < 0) {
    return {
      costo_total_carrera_pesos: 0,
      costo_anual_medio: 0,
      elegibilidad_cae: 'Datos inválidos',
      elegibilidad_beca_bicentenario: 'Datos inválidos',
      cobertura_beca_bicentenario_pesos: 0,
      deuda_cae_post_titulacion_pesos: 0,
      cuota_cae_mensual_maxima: 0,
      plazo_pago_meses: 0,
      interes_total_2porciento: 0,
      ahorro_beca_vs_cae: 0,
      recomendacion_financiera: 'Revisa los datos ingresados.'
    };
  }

  // 1. Costo total carrera (arancel bruto)
  const costo_total_carrera_pesos = i.arancel_anual_pesos * anos_carrera;
  const costo_anual_medio = i.arancel_anual_pesos;

  // 2. Elegibilidad CAE
  const es_elegible_cae = 
    i.rsh_percentil <= RSH_MAX_CAE && 
    i.puntaje_paes >= PAES_MIN_CAE && 
    i.arancel_anual_pesos <= ARANCEL_MAXIMO_CAE;
  const elegibilidad_cae = es_elegible_cae 
    ? '✓ Elegible CAE (RSH ≤80, PAES ≥450, arancel ≤$2.5M)' 
    : '✗ No elegible CAE – ' + 
      (i.rsh_percentil > RSH_MAX_CAE ? 'RSH > 80 ' : '') +
      (i.puntaje_paes < PAES_MIN_CAE ? 'PAES < 450 ' : '') +
      (i.arancel_anual_pesos > ARANCEL_MAXIMO_CAE ? 'Arancel > $2.5M' : '');

  // 3. Elegibilidad Beca Bicentenario
  const es_elegible_beca = 
    i.rsh_percentil <= RSH_MAX_BECA && 
    i.puntaje_paes >= PAES_MIN_BECA;
  const elegibilidad_beca_bicentenario = es_elegible_beca
    ? '✓ Elegible Beca Bicentenario (RSH ≤60, PAES ≥500)'
    : '✗ No elegible Beca Bicentenario – ' +
      (i.rsh_percentil > RSH_MAX_BECA ? 'RSH > 60 ' : '') +
      (i.puntaje_paes < PAES_MIN_BECA ? 'PAES < 500' : '');

  // 4. Cobertura Beca Bicentenario (años I–III)
  let cobertura_beca_bicentenario_pesos = 0;
  if (es_elegible_beca && i.beca_bicentenario_opcion !== 'no') {
    // Años I–II: hasta $2.5M c/u
    if (anos_carrera >= 2) {
      cobertura_beca_bicentenario_pesos += Math.min(i.arancel_anual_pesos, COBERTURA_BECA_BIENIO_I_II) * 2;
    } else if (anos_carrera === 1) {
      cobertura_beca_bicentenario_pesos += Math.min(i.arancel_anual_pesos, COBERTURA_BECA_BIENIO_I_II);
    }
    // Año III: 50% restante
    if (anos_carrera >= 3) {
      cobertura_beca_bicentenario_pesos += Math.min(i.arancel_anual_pesos, COBERTURA_BECA_BIENIO_I_II) * COBERTURA_BECA_PORCENTAJE_III;
    }
  }

  // 5. Deuda neta para CAE (después de beca)
  const deuda_neta_cae = Math.max(0, costo_total_carrera_pesos - cobertura_beca_bicentenario_pesos);

  // 6. Deuda CAE con interés 2% × 5 años post-titulación
  const interes_total_2porciento = deuda_neta_cae * TASA_CAE_ANUAL * 5;
  const deuda_cae_post_titulacion_pesos = deuda_neta_cae + interes_total_2porciento;

  // 7. Cuota máxima mensual (10% RSH)
  const cuota_cae_sin_limite = deuda_cae_post_titulacion_pesos > 0 ? deuda_cae_post_titulacion_pesos / 60 : 0; // Asume 60 meses base
  const cuota_cae_max_por_renta = i.renta_mensual_estimada * CUOTA_MAX_PORCENTAJE;
  const cuota_cae_mensual_maxima = Math.min(cuota_cae_sin_limite, cuota_cae_max_por_renta);

  // 8. Plazo de pago (meses)
  const plazo_pago_meses = cuota_cae_mensual_maxima > 0 
    ? Math.ceil(deuda_cae_post_titulacion_pesos / cuota_cae_mensual_maxima)
    : 0;

  // 9. Ahorro Beca vs CAE solo
  const ahorro_beca_vs_cae = cobertura_beca_bicentenario_pesos;

  // 10. Recomendación financiera
  let recomendacion_financiera = '';
  if (!es_elegible_cae && !es_elegible_beca) {
    recomendacion_financiera = 'No cumples requisitos CAE ni Beca Bicentenario. Explora crédito privado, becas de excelencia o postula nuevamente el próximo año si tu RSH mejora.';
  } else if (es_elegible_beca && i.beca_bicentenario_opcion !== 'no') {
    const ahorro_porcentaje = (cobertura_beca_bicentenario_pesos / costo_total_carrera_pesos) * 100;
    recomendacion_financiera = `🎓 **Excelente opción:** Beca Bicentenario cubre ${ahorro_porcentaje.toFixed(1)}% del total. CAE financia saldo con tasa 2%. Deuda estimada $${(deuda_cae_post_titulacion_pesos / 1000000).toFixed(1)}M a 5 años. Cuota máx $${Math.round(cuota_cae_mensual_maxima / 1000)}k/mes.`;
  } else if (es_elegible_cae) {
    recomendacion_financiera = `💼 CAE es tu opción. Deuda estimada $${(deuda_cae_post_titulacion_pesos / 1000000).toFixed(1)}M a 5 años post-egreso. Cuota máx $${Math.round(cuota_cae_mensual_maxima / 1000)}k/mes (10% RSH). Verifica compatibilidad con otros créditos.`;
  } else {
    recomendacion_financiera = 'No eres elegible para CAE ni Beca Bicentenario con estos datos. Consulta a tu IES sobre otras becas o financiamiento disponible.';
  }

  return {
    costo_total_carrera_pesos: Math.round(costo_total_carrera_pesos),
    costo_anual_medio: Math.round(costo_anual_medio),
    elegibilidad_cae,
    elegibilidad_beca_bicentenario,
    cobertura_beca_bicentenario_pesos: Math.round(cobertura_beca_bicentenario_pesos),
    deuda_cae_post_titulacion_pesos: Math.round(deuda_cae_post_titulacion_pesos),
    cuota_cae_mensual_maxima: Math.round(cuota_cae_mensual_maxima),
    plazo_pago_meses: Math.round(plazo_pago_meses),
    interes_total_2porciento: Math.round(interes_total_2porciento),
    ahorro_beca_vs_cae: Math.round(ahorro_beca_vs_cae),
    recomendacion_financiera
  };
}
