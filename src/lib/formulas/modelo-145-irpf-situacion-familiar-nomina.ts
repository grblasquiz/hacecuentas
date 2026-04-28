export interface Inputs {
  salario_bruto_anual: number;
  estado_civil: 'soltero' | 'casado_conyuge_sin_rentas' | 'casado_conyuge_con_rentas' | 'separado_hijos' | 'viudo';
  num_hijos: number;
  hijos_menores_3: number;
  hijos_discapacidad: number;
  grado_discapacidad_hijos: 'ninguno' | 'entre_33_65' | '65_o_mas';
  ascendientes_cargo: number;
  edad_ascendiente: 'no' | 'si';
  discapacidad_titular: 'ninguna' | 'entre_33_65' | '65_o_mas';
  movilidad_geografica: 'no' | 'si';
  deduccion_vivienda_alquiler: 'no' | 'si';
  hipoteca_anterior_2013: 'no' | 'si';
  cuota_hipoteca_anual: number;
  otras_retenciones_pagador: 'no' | 'si';
}

export interface Outputs {
  retencion_correcta_pct: number;
  retencion_defecto_pct: number;
  diferencia_pct: number;
  ahorro_mensual_eur: number;
  ahorro_anual_eur: number;
  cuota_retenida_correcta_anual: number;
  neto_mensual_correcto: number;
  fecha_presentar: string;
  alerta_obligacion: string;
}

export function compute(i: Inputs): Outputs {
  // ── Constantes IRPF 2026 (AEAT / RD 439/2007 actualizado) ──────────────────

  // Tarifa conjunta estatal + autonómica media 2026
  // Fuente: AEAT - Manual Renta 2025 y previsión 2026
  const TRAMOS: Array<[number, number]> = [
    [12450,    0.19],
    [20200,    0.24],
    [35200,    0.30],
    [60000,    0.37],
    [300000,   0.45],
    [Infinity, 0.47],
  ];

  // Mínimos personales y familiares (art. 57-61 Ley IRPF)
  const MINIMO_CONTRIBUYENTE = 5550;        // Base
  const MINIMO_DESC_1 = 2400;
  const MINIMO_DESC_2 = 2700;
  const MINIMO_DESC_3 = 4000;
  const MINIMO_DESC_4_SS = 4500;            // 4º y siguientes
  const EXTRA_DESC_MENOR_3 = 2800;
  const MINIMO_DISC_HIJO_33_64 = 3000;
  const MINIMO_DISC_HIJO_65 = 9000;
  const MINIMO_ASC_65 = 1150;
  const EXTRA_ASC_75 = 1400;
  const MINIMO_DISC_TITULAR_33_64 = 3000;
  const MINIMO_DISC_TITULAR_65 = 9000;

  // Reducción por rendimientos del trabajo (art. 20 Ley IRPF)
  const UMBRAL_RED_TRABAJO_1 = 14047.5;
  const UMBRAL_RED_TRABAJO_2 = 19747.5;
  const REDUCCION_MAXIMA_TRABAJO = 6498;
  const REDUCCION_MINIMA_TRABAJO = 2364;

  // Tipo de cotización SS trabajador 2026 (contingencias comunes 4,70% + desempleo 1,55% + FP 0,10%)
  // Fuente: Seguridad Social / TGSS Orden cotización 2026
  const TIPO_SS_TRABAJADOR = 0.0635;

  // ── 1. Cotización SS estimada ───────────────────────────────────────────────
  const salario = Math.max(0, i.salario_bruto_anual);
  const ss_trabajador = salario * TIPO_SS_TRABAJADOR;

  // ── 2. Rendimiento neto del trabajo ────────────────────────────────────────
  const rendimiento_neto = salario - ss_trabajador;

  // ── 3. Reducción por rendimientos del trabajo ───────────────────────────────
  let reduccion_trabajo: number;
  if (rendimiento_neto <= UMBRAL_RED_TRABAJO_1) {
    reduccion_trabajo = REDUCCION_MAXIMA_TRABAJO;
  } else if (rendimiento_neto <= UMBRAL_RED_TRABAJO_2) {
    // Reducción lineal entre ambos umbrales
    const proporcion = (rendimiento_neto - UMBRAL_RED_TRABAJO_1) / (UMBRAL_RED_TRABAJO_2 - UMBRAL_RED_TRABAJO_1);
    reduccion_trabajo = REDUCCION_MAXIMA_TRABAJO - proporcion * (REDUCCION_MAXIMA_TRABAJO - REDUCCION_MINIMA_TRABAJO);
  } else {
    reduccion_trabajo = REDUCCION_MINIMA_TRABAJO;
  }

  // Reducción adicional por discapacidad del titular
  let reduccion_discapacidad_titular = 0;
  if (i.discapacidad_titular === 'entre_33_65') {
    reduccion_discapacidad_titular = MINIMO_DISC_TITULAR_33_64;
  } else if (i.discapacidad_titular === '65_o_mas') {
    reduccion_discapacidad_titular = MINIMO_DISC_TITULAR_65;
  }

  // Reducción adicional por movilidad geográfica (estimación 2.364€)
  const reduccion_movilidad = i.movilidad_geografica === 'si' ? 2364 : 0;

  // ── 4. Base de retención ────────────────────────────────────────────────────
  const base_retencion = Math.max(0,
    rendimiento_neto
    - reduccion_trabajo
    - reduccion_discapacidad_titular
    - reduccion_movilidad
  );

  // ── 5. Mínimo personal y familiar ──────────────────────────────────────────
  // Mínimo contribuyente
  let minimo_personal = MINIMO_CONTRIBUYENTE;

  // Mínimo por descendientes
  const num_hijos = Math.max(0, Math.min(20, i.num_hijos));
  const hijos_menores_3 = Math.max(0, Math.min(num_hijos, i.hijos_menores_3));
  const hijos_disc = Math.max(0, Math.min(num_hijos, i.hijos_discapacidad));

  let minimo_descendientes = 0;
  for (let h = 1; h <= num_hijos; h++) {
    if (h === 1) minimo_descendientes += MINIMO_DESC_1;
    else if (h === 2) minimo_descendientes += MINIMO_DESC_2;
    else if (h === 3) minimo_descendientes += MINIMO_DESC_3;
    else minimo_descendientes += MINIMO_DESC_4_SS;
  }
  // Extra menores de 3 años
  minimo_descendientes += hijos_menores_3 * EXTRA_DESC_MENOR_3;

  // Mínimo por discapacidad de hijos
  let minimo_disc_hijos = 0;
  if (hijos_disc > 0) {
    const importe_disc_hijo = i.grado_discapacidad_hijos === '65_o_mas'
      ? MINIMO_DISC_HIJO_65
      : MINIMO_DISC_HIJO_33_64;
    minimo_disc_hijos = hijos_disc * importe_disc_hijo;
  }

  // Mínimo por ascendientes
  const num_asc = Math.max(0, Math.min(8, i.ascendientes_cargo));
  let minimo_ascendientes = num_asc * MINIMO_ASC_65;
  if (i.edad_ascendiente === 'si' && num_asc > 0) {
    minimo_ascendientes += num_asc * EXTRA_ASC_75;
  }

  const minimo_familiar_total = minimo_personal
    + minimo_descendientes
    + minimo_disc_hijos
    + minimo_ascendientes;

  // ── 6. Cuota de retención bruta ─────────────────────────────────────────────
  // Aplicamos la tarifa a la base de retención y al mínimo familiar
  // Cuota = T(base_retención) - T(mínimo personal y familiar)
  // Fuente: Reglamento IRPF art. 82
  function aplicar_tarifa(base: number): number {
    let cuota = 0;
    let tramo_inferior = 0;
    for (const [limite, tipo] of TRAMOS) {
      if (base <= tramo_inferior) break;
      const base_tramo = Math.min(base, limite) - tramo_inferior;
      cuota += base_tramo * tipo;
      tramo_inferior = limite;
    }
    return cuota;
  }

  const cuota_base = aplicar_tarifa(base_retencion);
  const cuota_minimo = aplicar_tarifa(minimo_familiar_total);
  let cuota_retencion = Math.max(0, cuota_base - cuota_minimo);

  // ── 7. Deducciones que reducen la cuota ────────────────────────────────────
  // Deducción por inversión vivienda habitual (hipoteca anterior 2013)
  // Base máxima 9.040€, tipo 15% → deducción máx. 1.356€/año
  // Fuente: DT 18ª Ley IRPF
  if (i.hipoteca_anterior_2013 === 'si') {
    const base_hip = Math.min(Math.max(0, i.cuota_hipoteca_anual), 9040);
    const deduccion_hipoteca = base_hip * 0.15;
    cuota_retencion = Math.max(0, cuota_retencion - deduccion_hipoteca);
  }

  // Deducción por alquiler (autonómica media, estimación ~10,05% de cuotas alquiler)
  // Reducimos cuota un 5% estimado para contemplar efecto medio autonómico
  if (i.deduccion_vivienda_alquiler === 'si') {
    cuota_retencion = Math.max(0, cuota_retencion * 0.95);
  }

  // ── 8. Tipo de retención correcto ───────────────────────────────────────────
  const retencion_correcta_pct = salario > 0
    ? Math.max(2, (cuota_retencion / salario) * 100)
    : 0;

  // Mínimo legal 2% (art. 86 Rgto IRPF)
  // Para segundo pagador con rentas >1.500€ el mínimo sube a nivel general
  const minimo_legal = i.otras_retenciones_pagador === 'si' ? 15 : 2;
  const retencion_final = Math.max(minimo_legal, retencion_correcta_pct);

  // ── 9. Retención por defecto (sin Modelo 145) ───────────────────────────────
  // Sin 145: empresa asume soltero sin cargas ni deducciones
  const base_defecto = Math.max(0, rendimiento_neto - REDUCCION_MINIMA_TRABAJO);
  const cuota_defecto_bruta = Math.max(0,
    aplicar_tarifa(base_defecto) - aplicar_tarifa(MINIMO_CONTRIBUYENTE)
  );
  const retencion_defecto_pct_raw = salario > 0
    ? Math.max(2, (cuota_defecto_bruta / salario) * 100)
    : 0;
  const retencion_defecto_pct = i.otras_retenciones_pagador === 'si'
    ? Math.max(15, retencion_defecto_pct_raw)
    : retencion_defecto_pct_raw;

  // ── 10. Comparativa y ahorro ────────────────────────────────────────────────
  const diferencia_pct = retencion_defecto_pct - retencion_final;
  const cuota_retenida_correcta_anual = salario * (retencion_final / 100);
  const cuota_retenida_defecto_anual = salario * (retencion_defecto_pct / 100);
  const ahorro_anual_eur = Math.max(0, cuota_retenida_defecto_anual - cuota_retenida_correcta_anual);
  // 14 pagas orientativas
  const ahorro_mensual_eur = ahorro_anual_eur / 14;

  // Neto mensual aproximado con retención correcta (sin cotización SS detallada por CCAA)
  const neto_anual = salario - ss_trabajador - cuota_retenida_correcta_anual;
  const neto_mensual_correcto = neto_anual / 14;

  // ── 11. Mensaje fecha de presentación ──────────────────────────────────────
  let fecha_presentar = 'Antes del inicio del año o en los 10 días siguientes a cualquier cambio en tu situación personal o familiar (matrimonio, nacimiento, separación, etc.).';
  if (i.num_hijos > 0 || i.estado_civil !== 'soltero' || i.ascendientes_cargo > 0) {
    fecha_presentar = 'Entrega el Modelo 145 actualizado a RRHH cuanto antes para que apliquen el tipo correcto desde la próxima nómina. Recuerda actualizarlo siempre que cambie tu situación (nacimiento, matrimonio, fallecimiento, etc.).';
  }

  // ── 12. Alerta obligación ───────────────────────────────────────────────────
  let alerta_obligacion = '';
  if (diferencia_pct > 5) {
    alerta_obligacion = `⚠️ Tu retención actual por defecto (${retencion_defecto_pct.toFixed(1)}%) es ${diferencia_pct.toFixed(1)} puntos superior a la que te corresponde (${retencion_final.toFixed(1)}%). Entrega el Modelo 145 actualizado a tu empresa para recuperar ese dinero en nómina.`;
  } else if (diferencia_pct < -1) {
    alerta_obligacion = `⚠️ Tu situación real implica un tipo (${retencion_final.toFixed(1)}%) superior al que puede estar aplicando tu empresa. Revisa el Modelo 145 entregado para evitar una declaración de Renta a pagar con recargos.`;
  } else if (i.otras_retenciones_pagador === 'si') {
    alerta_obligacion = 'ℹ️ Tienes dos pagadores con el segundo superando 1.500€/año. Esto eleva el mínimo de retención y puede hacer obligatoria la declaración de la Renta. Considera comunicarlo a tu empresa principal en el Modelo 145.';
  } else {
    alerta_obligacion = 'ℹ️ Tu retención está ajustada a tu situación. Recuerda actualizar el Modelo 145 ante cualquier cambio familiar.';
  }

  return {
    retencion_correcta_pct: Math.round(retencion_final * 100) / 100,
    retencion_defecto_pct: Math.round(retencion_defecto_pct * 100) / 100,
    diferencia_pct: Math.round(diferencia_pct * 100) / 100,
    ahorro_mensual_eur: Math.round(ahorro_mensual_eur * 100) / 100,
    ahorro_anual_eur: Math.round(ahorro_anual_eur * 100) / 100,
    cuota_retenida_correcta_anual: Math.round(cuota_retenida_correcta_anual * 100) / 100,
    neto_mensual_correcto: Math.round(neto_mensual_correcto * 100) / 100,
    fecha_presentar,
    alerta_obligacion,
  };
}
