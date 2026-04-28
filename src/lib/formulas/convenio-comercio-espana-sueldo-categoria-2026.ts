export interface Inputs {
  categoria: string;
  jornada: string;
  antiguedad_anios: number;
  pagas_extra: string;
  ccaa: string;
}

export interface Outputs {
  salario_base_mensual: number;
  complemento_antiguedad_mensual: number;
  plus_convenio_mensual: number;
  bruto_mensual_total: number;
  bruto_anual: number;
  cuota_ss_trabajador_mensual: number;
  retencion_irpf_mensual: number;
  neto_mensual: number;
  neto_anual: number;
  tipo_irpf_aplicado: number;
  aviso: string;
}

export function compute(i: Inputs): Outputs {
  // --- Tablas salariales Convenio Comercio 2026 (jornada completa) ---
  // Fuente: BOE Convenio Colectivo General de Comercio, tablas 2026
  const TABLAS_SALARIALES: Record<string, { base: number; plus: number }> = {
    director_gerente:             { base: 2210.00, plus: 95.00 },
    jefe_division:                { base: 1980.00, plus: 85.00 },
    jefe_personal:                { base: 1850.00, plus: 80.00 },
    jefe_seccion:                 { base: 1620.00, plus: 70.00 },
    encargado_establecimiento:    { base: 1490.00, plus: 65.00 },
    dependiente_mayor:            { base: 1380.00, plus: 58.00 },
    dependiente:                  { base: 1220.00, plus: 52.00 },
    cajero:                       { base: 1190.00, plus: 50.00 },
    ayudante:                     { base: 1100.00, plus: 45.00 },
    mozo_almacen:                 { base: 1080.00, plus: 43.00 },
    auxiliar_caja:                { base: 1050.00, plus: 42.00 },
  };

  // --- Factor de jornada ---
  const FACTOR_JORNADA: Record<string, number> = {
    completa:   1.00,
    parcial_75: 0.75,
    parcial_50: 0.50,
    parcial_25: 0.25,
  };

  // --- Tramos de antigüedad (% sobre salario base) ---
  // Fuente: art. de antigüedad Convenio Colectivo General de Comercio
  function porcentajeAntiguedad(anios: number): number {
    if (anios < 3)  return 0.00;
    if (anios < 6)  return 0.03;
    if (anios < 10) return 0.06;
    if (anios < 15) return 0.09;
    if (anios < 20) return 0.12;
    if (anios < 25) return 0.15;
    return 0.18;
  }

  // --- Tipos orientativos IRPF 2026 sobre base imponible anual ---
  // Fuente: AEAT - Escala estatal + autonómica media según CCAA
  // Nota: el tipo autonómico varía; se usa tipo efectivo aproximado
  function tipoIRPFOrientativo(brutoAnual: number, ccaa: string): number {
    // Ajuste autonómico aproximado (puntos porcentuales sobre tipo estatal)
    const ajusteCCAA: Record<string, number> = {
      andalucia: -0.5,
      aragon: 0.5,
      asturias: 1.5,
      baleares: 1.0,
      canarias: -1.0,
      cantabria: 0.5,
      castilla_la_mancha: 0.0,
      castilla_leon: -0.5,
      cataluna: 1.5,
      extremadura: 1.0,
      galicia: 0.0,
      la_rioja: 0.0,
      madrid: -1.5,
      murcia: 0.0,
      navarra: 1.0,   // régimen foral orientativo
      pais_vasco: 0.5, // régimen foral orientativo
      valencia: 1.5,
    };
    const ajuste = ajusteCCAA[ccaa] ?? 0;

    // Tipo efectivo orientativo escala estatal 2026 (escala conjunta approx)
    // Fuente: AEAT - Escala general IRPF 2026
    let tipoBase: number;
    if (brutoAnual <= 12450)  tipoBase = 9.5;
    else if (brutoAnual <= 20200)  tipoBase = 12.0;
    else if (brutoAnual <= 35200)  tipoBase = 15.0;
    else if (brutoAnual <= 60000)  tipoBase = 20.5;
    else if (brutoAnual <= 300000) tipoBase = 26.0;
    else tipoBase = 28.0;

    return Math.max(0, tipoBase + ajuste);
  }

  // --- Tipo cotización SS trabajador 2026 ---
  // Fuente: TGSS - Orden de cotización 2026
  // Contingencias comunes 4.70% + Desempleo 1.55% + FP 0.10% + FOGASA 0.12%
  const TIPO_SS_TRABAJADOR = 0.0647;

  // --- Validaciones y defaults ---
  const tablaCategoria = TABLAS_SALARIALES[i.categoria] ?? TABLAS_SALARIALES['dependiente'];
  const factorJornada = FACTOR_JORNADA[i.jornada] ?? 1.0;
  const antiguedadAnios = Math.max(0, Math.min(45, Number(i.antiguedad_anios) || 0));
  const pagasExtra = parseInt(i.pagas_extra, 10) || 2;

  // --- Cálculo salario base y complementos prorateados por jornada ---
  const salarioBaseMensual = Math.round(tablaCategoria.base * factorJornada * 100) / 100;
  const plusConvenioMensual = Math.round(tablaCategoria.plus * factorJornada * 100) / 100;

  const pctAntiguedad = porcentajeAntiguedad(antiguedadAnios);
  const complementoAntiguedadMensual = Math.round(salarioBaseMensual * pctAntiguedad * 100) / 100;

  // --- Bruto mensual total (12 pagas ordinarias) ---
  const brutoMensualTotal = Math.round(
    (salarioBaseMensual + plusConvenioMensual + complementoAntiguedadMensual) * 100
  ) / 100;

  // --- Bruto anual: 12 mensualidades + pagas extra (base + antigüedad, sin plus convenio en extra salvo pacto) ---
  // Paga extra = salario base mensual + complemento antigüedad (criterio estándar)
  const importePagaExtra = Math.round((salarioBaseMensual + complementoAntiguedadMensual) * 100) / 100;
  const brutoAnual = Math.round(
    (brutoMensualTotal * 12 + importePagaExtra * pagasExtra) * 100
  ) / 100;

  // --- Cotización SS trabajador mensual ---
  const cuotaSSTrabajadorMensual = Math.round(brutoMensualTotal * TIPO_SS_TRABAJADOR * 100) / 100;

  // --- IRPF: base imponible anual aprox = bruto anual - cuota SS anual - reducción trabajo ---
  // Reducción por rendimientos del trabajo 2026 (art. 20 LIRPF): 5.565 € para rentas <= 13.115 €,
  // reducción decreciente hasta 0 para rentas >= 16.825 €; para simplificar usamos reducción fija conservadora
  const cuotaSSAnual = Math.round(cuotaSSTrabajadorMensual * 12 * 100) / 100;

  let reduccionTrabajo: number;
  const basePrevia = brutoAnual - cuotaSSAnual;
  if (basePrevia <= 13115) {
    reduccionTrabajo = 5565;
  } else if (basePrevia <= 16825) {
    // Reducción lineal de 5.565 a 0 entre 13.115 y 16.825
    reduccionTrabajo = Math.max(0, 5565 - 1.5 * (basePrevia - 13115));
  } else {
    reduccionTrabajo = 0;
  }

  const baseImponibleAnual = Math.max(0, Math.round((basePrevia - reduccionTrabajo) * 100) / 100);
  const tipoIRPF = tipoIRPFOrientativo(baseImponibleAnual, i.ccaa);

  const cuotaIRPFAnual = Math.round(baseImponibleAnual * (tipoIRPF / 100) * 100) / 100;
  const retencionIRPFMensual = Math.round((cuotaIRPFAnual / 12) * 100) / 100;

  // --- Neto ---
  const netoMensual = Math.round(
    (brutoMensualTotal - cuotaSSTrabajadorMensual - retencionIRPFMensual) * 100
  ) / 100;
  const netoAnual = Math.round(
    (brutoAnual - cuotaSSAnual - cuotaIRPFAnual) * 100
  ) / 100;

  // --- Aviso ---
  let aviso = "Cálculo orientativo basado en el Convenio Colectivo General de Comercio 2026 (BOE). ";
  if (i.ccaa === 'pais_vasco' || i.ccaa === 'navarra') {
    aviso += "País Vasco y Navarra tienen régimen foral propio: el IRPF real puede diferir significativamente. ";
  }
  aviso += "El IRPF no incluye deducciones personales ni familiares. Consulta el simulador de retenciones de la AEAT para un cálculo exacto.";

  return {
    salario_base_mensual: salarioBaseMensual,
    complemento_antiguedad_mensual: complementoAntiguedadMensual,
    plus_convenio_mensual: plusConvenioMensual,
    bruto_mensual_total: brutoMensualTotal,
    bruto_anual: brutoAnual,
    cuota_ss_trabajador_mensual: cuotaSSTrabajadorMensual,
    retencion_irpf_mensual: retencionIRPFMensual,
    neto_mensual: netoMensual,
    neto_anual: netoAnual,
    tipo_irpf_aplicado: Math.round(tipoIRPF * 100) / 100,
    aviso,
  };
}
