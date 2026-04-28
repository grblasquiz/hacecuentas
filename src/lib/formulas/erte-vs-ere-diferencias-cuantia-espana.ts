export interface Inputs {
  salario_bruto_anual: number;
  num_pagas: number;
  anios_antiguedad: number;
  meses_antiguedad_extra: number;
  tipo_ere: 'objetivo' | 'improcedente';
  porcentaje_jornada_erte: number;
}

export interface Outputs {
  salario_mensual_bruto: number;
  base_reguladora_diaria: number;
  base_reguladora_mensual: number;
  prestacion_erte_mes_1_180: number;
  prestacion_erte_mes_181_plus: number;
  tope_maximo_erte: number;
  indemnizacion_ere_bruta: number;
  dias_indemnizacion_por_anio: number;
  tope_indemnizacion_ere: number;
  prestacion_paro_ere_mes_1_180: number;
  prestacion_paro_ere_mes_181_plus: number;
  duracion_paro_meses: string;
  resumen_comparativo: string;
}

export function compute(i: Inputs): Outputs {
  // --- Constantes 2026 (Fuente: SEPE, IPREM 2026) ---
  const IPREM_MENSUAL_2026 = 600.00; // € — IPREM mensual 2026 (estimado, confirmar en BOE)
  const IPREM_DIARIO_2026 = IPREM_MENSUAL_2026 * 14 / 365; // base cálculo SEPE

  // Topes prestación desempleo / ERTE 2026 (sin hijos)
  // Fuente: SEPE — se actualizan con el IPREM
  // Sin hijos: 175% IPREM mensual (14 pagas)
  // 1 hijo: 200% IPREM mensual (14 pagas)
  // 2+ hijos: 225% IPREM mensual (14 pagas)
  const TOPE_MAX_SIN_HIJOS = Math.round(IPREM_MENSUAL_2026 * 14 / 12 * 175 / 100 * 100) / 100;
  const TOPE_MIN = Math.round(IPREM_MENSUAL_2026 * 14 / 12 * 80 / 100 * 100) / 100; // 80% IPREM (sin hijos)

  // Días de indemnización según tipo ERE
  // Causas objetivas/económicas: 20 días/año, máx 12 mensualidades (art. 53 ET)
  // Despido improcedente: 33 días/año, máx 24 mensualidades (art. 56 ET)
  const DIAS_ERE_OBJETIVO = 20;
  const DIAS_ERE_IMPROCEDENTE = 33;
  const TOPE_MENSUALIDADES_OBJETIVO = 12;
  const TOPE_MENSUALIDADES_IMPROCEDENTE = 24;

  // Porcentajes prestación desempleo (Fuente: art. 270 LGSS)
  const PCT_PARO_PRIMEROS_180 = 0.70;
  const PCT_PARO_DESDE_181 = 0.60;

  // --- Saneamiento de inputs ---
  const salarioBrutoAnual = Math.max(0, i.salario_bruto_anual || 0);
  const numPagas = i.num_pagas === 14 ? 14 : 12;
  const aniosAntiguedad = Math.max(0, Math.floor(i.anios_antiguedad || 0));
  const mesesExtra = Math.min(11, Math.max(0, Math.floor(i.meses_antiguedad_extra || 0)));
  const tipoEre = i.tipo_ere === 'improcedente' ? 'improcedente' : 'objetivo';
  const pctJornadaErte = Math.min(100, Math.max(1, i.porcentaje_jornada_erte || 100)) / 100;

  if (salarioBrutoAnual <= 0) {
    return {
      salario_mensual_bruto: 0,
      base_reguladora_diaria: 0,
      base_reguladora_mensual: 0,
      prestacion_erte_mes_1_180: 0,
      prestacion_erte_mes_181_plus: 0,
      tope_maximo_erte: 0,
      indemnizacion_ere_bruta: 0,
      dias_indemnizacion_por_anio: 0,
      tope_indemnizacion_ere: 0,
      prestacion_paro_ere_mes_1_180: 0,
      prestacion_paro_ere_mes_181_plus: 0,
      duracion_paro_meses: 'Introduce un salario válido para calcular',
      resumen_comparativo: 'Introduce los datos para ver la comparativa',
    };
  }

  // --- Cálculos comunes ---
  // Salario mensual bruto (normalizando a 12 meses)
  const salarioMensualBruto = salarioBrutoAnual / numPagas;
  // El SEPE usa el salario normalizado a 12 mensualidades para la base reguladora
  const salarioAnualNormalizado = salarioBrutoAnual; // ya incluye extras prorrateadas si num_pagas=12, o separadas si 14

  // Base reguladora diaria — SEPE: total bruto / 365
  // Fuente: art. 270 LGSS y Guía SEPE prestación contributiva
  const baseReguladoraDiaria = salarioAnualNormalizado / 365;
  // Base reguladora mensual (× 30 por convención SEPE)
  const baseReguladoraMensual = baseReguladoraDiaria * 30;

  // --- ERTE ---
  // Cuantía bruta (sin topes) proporcional a jornada afectada
  const erteBruto1_180 = baseReguladoraMensual * PCT_PARO_PRIMEROS_180 * pctJornadaErte;
  const erteBruto181plus = baseReguladoraMensual * PCT_PARO_DESDE_181 * pctJornadaErte;

  // Tope máximo sin hijos (aplicar el proporcional a la jornada también al tope)
  const topeMaxErte = TOPE_MAX_SIN_HIJOS * pctJornadaErte;
  const topeMinErte = TOPE_MIN * pctJornadaErte;

  // Aplicar topes mínimo y máximo
  const prestacionErte1_180 = Math.min(Math.max(erteBruto1_180, topeMinErte), topeMaxErte);
  const prestacionErte181plus = Math.min(Math.max(erteBruto181plus, topeMinErte), topeMaxErte);

  // --- ERE: indemnización ---
  const antiguedadTotal = aniosAntiguedad + mesesExtra / 12; // años con decimales
  const diasIndemnizacion = tipoEre === 'improcedente' ? DIAS_ERE_IMPROCEDENTE : DIAS_ERE_OBJETIVO;
  const topeMensualidades = tipoEre === 'improcedente' ? TOPE_MENSUALIDADES_IMPROCEDENTE : TOPE_MENSUALIDADES_OBJETIVO;

  // Salario diario para indemnización: salario anual / 365
  const salarioDiario = salarioAnualNormalizado / 365;
  // Indemnización sin tope
  const indemnizacionSinTope = salarioDiario * diasIndemnizacion * antiguedadTotal;
  // Tope en euros: mensualidades × salario mensual bruto (12 pagas normalizadas)
  const salarioMensualNormalizado = salarioAnualNormalizado / 12;
  const topeIndemnizacionEuros = salarioMensualNormalizado * topeMensualidades;
  // Aplicar tope
  const indemnizacionEreBruta = Math.min(indemnizacionSinTope, topeIndemnizacionEuros);

  // --- Paro tras ERE (mismo cálculo que ERTE en cuantía) ---
  // Cuantía paro ordinario: igual que ERTE pero sin proporcionalidad de jornada
  const paroBruto1_180 = baseReguladoraMensual * PCT_PARO_PRIMEROS_180;
  const paroBruto181plus = baseReguladoraMensual * PCT_PARO_DESDE_181;
  const prestacionParo1_180 = Math.min(Math.max(paroBruto1_180, TOPE_MIN), TOPE_MAX_SIN_HIJOS);
  const prestacionParo181plus = Math.min(Math.max(paroBruto181plus, TOPE_MIN), TOPE_MAX_SIN_HIJOS);

  // --- Duración paro (estimada por antigüedad en empresa como proxy de cotización) ---
  // Fuente: art. 269 LGSS — tabla días cotizados → meses prestación
  // Se estima: antigüedad total (años) × 365 días cotizados, máx 2.160
  const diasCotizadosEstimados = Math.min(Math.round(antiguedadTotal * 365), 2160);

  const calcularDuracionParo = (dias: number): number => {
    if (dias < 360) return 0;
    if (dias < 540) return 4;
    if (dias < 720) return 6;
    if (dias < 900) return 8;
    if (dias < 1080) return 10;
    if (dias < 1260) return 12;
    if (dias < 1440) return 16;
    if (dias < 1620) return 18;
    if (dias < 1800) return 20;
    if (dias < 2160) return 22;
    return 24;
  };

  const duracionParoMesesNum = calcularDuracionParo(diasCotizadosEstimados);
  const duracionParoMesesStr =
    duracionParoMesesNum === 0
      ? 'No se alcanza el mínimo (360 días cotizados)'
      : `${duracionParoMesesNum} meses (estimado por ${diasCotizadosEstimados} días cotizados en empresa actual)`;

  // --- Resumen comparativo ---
  const erteMensualFormateado = prestacionErte1_180.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const ereIndemnFormateado = indemnizacionEreBruta.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const ereParoFormateado = prestacionParo1_180.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const tipoEreTexto = tipoEre === 'improcedente' ? 'improcedente (33 días/año)' : 'causas objetivas (20 días/año)';
  const jornadaTexto = pctJornadaErte === 1 ? 'suspensión total' : `reducción del ${Math.round(pctJornadaErte * 100)}% de jornada`;

  const resumenComparativo =
    `ERTE (${jornadaTexto}): cobras ~${erteMensualFormateado} €/mes los primeros 6 meses, sin consumir tu paro y manteniendo tu puesto. ` +
    `ERE por ${tipoEreTexto}: recibes ${ereIndemnFormateado} € de indemnización bruta + paro de ~${ereParoFormateado} €/mes durante ${duracionParoMesesNum > 0 ? duracionParoMesesNum + ' meses' : 'menos de 4 meses (cotización insuficiente)'}. ` +
    `El ERTE es más favorable a corto plazo si el empleo se recupera; el ERE cierra la relación laboral con una compensación única.`;

  // --- Redondear outputs a 2 decimales ---
  const r2 = (n: number) => Math.round(n * 100) / 100;

  return {
    salario_mensual_bruto: r2(salarioMensualBruto),
    base_reguladora_diaria: r2(baseReguladoraDiaria),
    base_reguladora_mensual: r2(baseReguladoraMensual),
    prestacion_erte_mes_1_180: r2(prestacionErte1_180),
    prestacion_erte_mes_181_plus: r2(prestacionErte181plus),
    tope_maximo_erte: r2(topeMaxErte),
    indemnizacion_ere_bruta: r2(indemnizacionEreBruta),
    dias_indemnizacion_por_anio: diasIndemnizacion,
    tope_indemnizacion_ere: topeMensualidades,
    prestacion_paro_ere_mes_1_180: r2(prestacionParo1_180),
    prestacion_paro_ere_mes_181_plus: r2(prestacionParo181plus),
    duracion_paro_meses: duracionParoMesesStr,
    resumen_comparativo: resumenComparativo,
  };
}
