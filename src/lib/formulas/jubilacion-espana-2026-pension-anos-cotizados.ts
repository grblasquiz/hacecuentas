// Calculadora Pensión Jubilación Contributiva España 2026
// Fuente: Seguridad Social, BOE, AEAT - datos vigentes 2026

export interface Inputs {
  fecha_nacimiento: string;        // ISO date string 'YYYY-MM-DD'
  anios_cotizados: number;         // años cotizados totales (decimales aceptados)
  base_reguladora: number;         // €/mes media últimas 300 mensualidades / 350
  jubilacion_anticipada: boolean;  // true = calcular anticipada voluntaria
  meses_anticipados?: number;      // 1-24 meses antes de la edad ordinaria
}

export interface Outputs {
  edad_actual: number;                  // años con decimal
  fecha_jubilacion_ordinaria: string;   // 'DD/MM/YYYY'
  anios_para_jubilacion: number;        // años restantes (puede ser negativo si ya cumplió)
  porcentaje_base: number;              // % sobre BR antes de penalización
  coeficiente_anticipacion: number;     // % de reducción por anticipación (0 si no aplica)
  pension_mensual: number;              // €/mes estimados
  pension_anual: number;                // €/año (14 pagas)
  pension_maxima_2026: number;          // tope legal 2026
  pension_minima_2026: number;          // referencia mínima contributiva 2026
  anios_cotizados_para_100: number;     // umbral para el 100% en 2026
  aviso: string;                        // mensaje informativo
}

export function compute(i: Inputs): Outputs {
  // ── CONSTANTES 2026 (Seguridad Social / BOE) ──────────────────────────────
  const PENSION_MAXIMA_2026 = 3267.60;          // €/mes (14 pagas) - Orden HFP 2026
  const PENSION_MINIMA_2026 = 900.00;           // €/mes referencia con cónyuge a cargo
  const MESES_COTIZADOS_100_2026 = 441;         // 36 años y 9 meses → 100% BR en 2026
  const MESES_COTIZADOS_100_2027 = 444;         // 37 años → 100% BR desde 2027
  const MESES_MINIMOS = 180;                    // 15 años mínimo para pensión
  // Edad ordinaria 2026 (en meses desde nacimiento)
  const MESES_EDAD_ORDINARIA_GENERAL_2026 = 66 * 12 + 8;   // 66a 8m
  const MESES_EDAD_ORDINARIA_LARGA_2026   = 65 * 12;       // 65a (≥38a 3m cotizados)
  const UMBRAL_COTIZACION_EDAD_65_MESES   = 38 * 12 + 3;   // 38a 3m

  // ── VALORES POR DEFECTO SEGUROS ──────────────────────────────────────────
  const aniosCotizados = Math.max(0, Math.min(50, i.anios_cotizados || 0));
  const baseReguladora = Math.max(0, i.base_reguladora || 0);
  const mesesAnticipados = i.jubilacion_anticipada
    ? Math.max(1, Math.min(24, Math.round(i.meses_anticipados || 1)))
    : 0;

  // ── EDAD ACTUAL ───────────────────────────────────────────────────────────
  const hoy = new Date();
  let edadActual = 0;
  let fechaNac: Date | null = null;
  try {
    fechaNac = new Date(i.fecha_nacimiento);
    if (!isNaN(fechaNac.getTime())) {
      const diffMs = hoy.getTime() - fechaNac.getTime();
      edadActual = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    }
  } catch (_) {
    edadActual = 0;
  }
  edadActual = Math.max(0, edadActual);

  // ── EDAD ORDINARIA DE JUBILACIÓN 2026 ─────────────────────────────────────
  // Si cotizados ≥ 38a 3m → jubilación a 65; si no → 66a 8m
  const mesesCotizadosTotales = aniosCotizados * 12;
  const edadOrdinariaEnMeses =
    mesesCotizadosTotales >= UMBRAL_COTIZACION_EDAD_65_MESES
      ? MESES_EDAD_ORDINARIA_LARGA_2026
      : MESES_EDAD_ORDINARIA_GENERAL_2026;

  // Fecha de jubilación ordinaria
  let fechaJubilacion = 'No disponible';
  let aniosParaJubilacion = 0;
  if (fechaNac && !isNaN(fechaNac.getTime())) {
    const fJub = new Date(fechaNac);
    fJub.setMonth(fJub.getMonth() + edadOrdinariaEnMeses);
    if (i.jubilacion_anticipada && mesesAnticipados > 0) {
      fJub.setMonth(fJub.getMonth() - mesesAnticipados);
    }
    const dd = String(fJub.getDate()).padStart(2, '0');
    const mm = String(fJub.getMonth() + 1).padStart(2, '0');
    const yyyy = fJub.getFullYear();
    fechaJubilacion = `${dd}/${mm}/${yyyy}`;
    const diffAnios = (fJub.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    aniosParaJubilacion = Math.round(diffAnios * 10) / 10;
  }

  // ── PORCENTAJE APLICABLE SEGÚN AÑOS COTIZADOS ─────────────────────────────
  // Tramos vigentes 2026:
  // - 15 años (180 meses)          → 50,00%
  // - 180-300 meses (15a-25a)      → +0,19% por mes adicional
  // - 300-441 meses (25a-36a9m)    → +0,18% por mes adicional
  // - ≥441 meses (≥36a9m)         → 100,00%
  // Fuente: art. 210 LGSS y escala transitoria INSS 2026

  let porcentajeBase = 0;
  const MESES_COT_15 = 180;
  const MESES_COT_25 = 300;

  if (mesesCotizadosTotales < MESES_MINIMOS) {
    // Sin derecho a pensión contributiva
    porcentajeBase = 0;
  } else if (mesesCotizadosTotales >= MESES_COTIZADOS_100_2026) {
    porcentajeBase = 100;
  } else if (mesesCotizadosTotales >= MESES_COT_25) {
    // Tramo 25a-36a9m: base desde 15a = 50% + tramo 15-25a
    const pct15a25a = (MESES_COT_25 - MESES_COT_15) * 0.19; // 120 meses × 0,19 = 22,80%
    const mesesExtraEnTramo2 = mesesCotizadosTotales - MESES_COT_25;
    porcentajeBase = 50 + pct15a25a + mesesExtraEnTramo2 * 0.18;
  } else {
    // Tramo 15a-25a
    const mesesExtraEnTramo1 = mesesCotizadosTotales - MESES_COT_15;
    porcentajeBase = 50 + mesesExtraEnTramo1 * 0.19;
  }
  porcentajeBase = Math.min(100, Math.max(0, Math.round(porcentajeBase * 100) / 100));

  // ── COEFICIENTE REDUCTOR POR JUBILACIÓN ANTICIPADA VOLUNTARIA ─────────────
  // Escala según años cotizados en el momento de la jubilación
  // Fuente: art. 208 LGSS modificado por Ley 21/2021
  // Reducción por trimestre anticipado:
  //   < 38a 6m  → 0,50%/trimestre
  //   38a6m-41a5m → 0,45%/trimestre
  //   41a6m-44a5m → 0,40%/trimestre
  //   ≥44a6m    → 0,35%/trimestre

  let coeficienteAnticipacion = 0;
  if (i.jubilacion_anticipada && mesesAnticipados > 0 && mesesCotizadosTotales >= MESES_MINIMOS) {
    const trimestresAnticipados = Math.ceil(mesesAnticipados / 3);
    let reduccionPorTrimestre: number;
    if (mesesCotizadosTotales < 38 * 12 + 6) {
      reduccionPorTrimestre = 0.50;
    } else if (mesesCotizadosTotales < 41 * 12 + 6) {
      reduccionPorTrimestre = 0.45;
    } else if (mesesCotizadosTotales < 44 * 12 + 6) {
      reduccionPorTrimestre = 0.40;
    } else {
      reduccionPorTrimestre = 0.35;
    }
    coeficienteAnticipacion = Math.round(trimestresAnticipados * reduccionPorTrimestre * 100) / 100;
  }

  // ── CÁLCULO PENSIÓN ───────────────────────────────────────────────────────
  const factorAplicado = (porcentajeBase - coeficienteAnticipacion) / 100;
  let pensionMensual = 0;
  if (mesesCotizadosTotales >= MESES_MINIMOS && baseReguladora > 0) {
    pensionMensual = baseReguladora * Math.max(0, factorAplicado);
    pensionMensual = Math.min(pensionMensual, PENSION_MAXIMA_2026);
    pensionMensual = Math.round(pensionMensual * 100) / 100;
  }
  const pensionAnual = Math.round(pensionMensual * 14 * 100) / 100;

  // ── AÑOS COTIZADOS PARA EL 100% ───────────────────────────────────────────
  const aniosCotizadosPara100 = Math.round((MESES_COTIZADOS_100_2026 / 12) * 100) / 100;
  // = 36,75 años = 36a 9m

  // ── AVISO ─────────────────────────────────────────────────────────────────
  let aviso = '';
  if (mesesCotizadosTotales < MESES_MINIMOS) {
    aviso = 'No alcanzas los 15 años de cotización mínimos para causar derecho a pensión contributiva de jubilación. Consulta posibles complementos no contributivos.';
  } else if (baseReguladora <= 0) {
    aviso = 'Introduce una base reguladora mensual para obtener el importe de la pensión.';
  } else if (pensionMensual >= PENSION_MAXIMA_2026) {
    aviso = `La pensión calculada supera el tope máximo legal (${PENSION_MAXIMA_2026.toFixed(2)} €/mes en 2026). Se aplica el límite.`;
  } else if (i.jubilacion_anticipada && coeficienteAnticipacion > 0) {
    aviso = `Jubilación anticipada voluntaria con ${mesesAnticipados} mes(es) de anticipación. Penalización aplicada: ${coeficienteAnticipacion.toFixed(2)}%. Esta penalización es permanente y no recuperable.`;
  } else if (porcentajeBase === 100) {
    aviso = 'Alcanzas el 100% de la base reguladora. Se aplica el porcentaje máximo.';
  } else {
    const mesesParaMaximo = MESES_COTIZADOS_100_2026 - mesesCotizadosTotales;
    const aniosParaMaximo = Math.round((mesesParaMaximo / 12) * 10) / 10;
    aviso = `Te faltan ${aniosParaMaximo} años cotizados para alcanzar el 100% de la base reguladora.`;
  }

  return {
    edad_actual: Math.round(edadActual * 10) / 10,
    fecha_jubilacion_ordinaria: fechaJubilacion,
    anios_para_jubilacion: aniosParaJubilacion,
    porcentaje_base: porcentajeBase,
    coeficiente_anticipacion: coeficienteAnticipacion,
    pension_mensual: pensionMensual,
    pension_anual: pensionAnual,
    pension_maxima_2026: PENSION_MAXIMA_2026,
    pension_minima_2026: PENSION_MINIMA_2026,
    anios_cotizados_para_100: aniosCotizadosPara100,
    aviso
  };
}
