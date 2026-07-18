/**
 * Datos fiscales y laborales de VENEZUELA 2026 — tabla maestra única.
 * Fuentes: BCV, SENIAT, Gaceta Oficial, Sistema Patria, MinTrabajo (LOTTT).
 * Verificado 2026-06-22.
 *
 * Particularidad cambiaria: el bolívar (VES / "Bs.") tiene DOS tasas de mercado
 * relevantes — la oficial del BCV y la del mercado paralelo (Monitor Dólar).
 * Ambas cambian a diario; los snapshots de abajo son de referencia y deben
 * actualizarse (idealmente con data live; mientras tanto se hardcodean con fecha).
 *
 * Ingreso del trabajador (2026):
 *   - Salario mínimo (base legal LOTTT): Bs. 130/mes (lo ÚNICO que genera
 *     pasivos laborales: vacaciones, utilidades, prestaciones, seguridad social).
 *   - Cestaticket socialista: USD 40 indexado a la tasa BCV (beneficio de
 *     alimentación, NO salario: no incide en prestaciones/utilidades/vacaciones).
 * Fuente: BCV, MinTrabajo (LOTTT), Banca y Negocios.
 */

// Datos cambiarios en vivo (refrescados por scripts/data-sources/fetch-venezuela.mjs
// vía el cron diario → src/data/live/venezuela.json → re-bundleados en cada build).
// Fallback hardcodeado abajo si el fetch falla o el valor viene vacío.
import liveVe from '../../data/live/venezuela.json';

/** Vigencia del dato (YYYY-MM-DD) — usada por el sello de frescura a nivel dato (src/lib/data-freshness.ts). */
export const DATA_AS_OF = '2026-06-22';

const _liveBcv = Number((liveVe as any)?.bcv?.valor) || null;
const _liveParalelo = Number((liveVe as any)?.paralelo?.valor) || null;

export const VENEZUELA_2026 = {
  anio: 2026,
  moneda: 'VES',
  simbolo: 'Bs.',

  // ───────────────────────── CAMBIARIO ─────────────────────────
  // Tasas de referencia. CAMBIAN A DIARIO — se leen de src/data/live/venezuela.json
  // (cron diario, fetch-venezuela.mjs) con fallback hardcodeado.
  // BCV: tasa oficial publicada por el Banco Central de Venezuela.
  // Paralelo: promedio del mercado libre (Monitor Dólar / Binance P2P).
  // Fuentes: BCV (https://www.bcv.org.ve), ve.dolarapi.com, Monitor Dólar Venezuela.
  fx: {
    bcv: _liveBcv ?? 612.43,               // Bs./USD — live (fallback snapshot 22-jun-2026)
    paralelo: _liveParalelo ?? 807.92,     // Bs./USD — live (fallback snapshot 20-jun-2026)
    fechaBcv: (liveVe as any)?.bcv?.fecha ?? '2026-06-22',
    fechaParalelo: (liveVe as any)?.paralelo?.fecha ?? '2026-06-20',
    // Brecha = (paralelo/bcv - 1). Se recalcula en runtime.
  },

  // ───────────────────────── SALARIO Y CESTATICKET ─────────────────────────
  // Salario mínimo legal LOTTT — única base de pasivos laborales.
  salarioMinimoVes: 130,       // Bs./mes (sin cambios desde mar-2022). ⚠️ ACTUALIZAR
  cestaticketUsd: 40,          // Cestaticket socialista, indexado a tasa BCV
  // Nota: el cestaticket se paga en Bs. al equivalente USD según la tasa BCV del día.

  // ───────────────────────── UNIDAD TRIBUTARIA ─────────────────────────
  // Valor de la U.T. — SOLO para tributos nacionales del SENIAT (prohibido para
  // beneficios laborales por la propia providencia).
  // Gaceta Oficial Nº 43.140, Providencia SNAT/2025/000048 (reajuste de Bs. 9 → Bs. 43).
  // Fuente: Acceso a la Justicia, Finanzas Digital, Efecto Cocuyo.
  unidadTributaria: 43,        // Bs. por U.T. ⚠️ VERIFICAR (puede reajustarse en el año)

  // ───────────────────────── IVA ─────────────────────────
  // Ley del IVA. Alícuota general 16%; reducida 8%; suntuaria +15% (=31%).
  // Fuente: SENIAT, Justia Venezuela (Ley del IVA), Acceso a la Justicia.
  iva: 0.16,                   // alícuota general
  ivaReducida: 0.08,           // bienes/servicios reducidos (alimentos, aeronáutica, etc.)
  ivaSuntuariaAdicional: 0.15, // adicional de lujo (16% + 15% = 31% total)

  // ───────────────────────── IGTF ─────────────────────────
  // Impuesto a las Grandes Transacciones Financieras.
  // Pagos en divisas (efectivo/no bancarizado) por sujetos no exonerados: 3%.
  // (En bolívares: 2% para sujetos pasivos especiales; rango legal 2%–8%, hasta 20% no bancarizado.)
  // Fuente: PwC Venezuela, Prodavinci, FacturaSimple, Acceso a la Justicia.
  igtf: 0.03,                  // 3% sobre pagos en divisas (efectivo)

  // ───────────────────────── ISLR — PERSONAS NATURALES ─────────────────────────
  // Ley de ISLR, Art. 50 — Tarifa N° 1 (residentes). Expresada en U.T.
  // Desgravamen único: 774 U.T.  ·  Rebaja personal: 10 U.T. (+10 U.T. por cónyuge
  // y +10 U.T. por carga familiar). No residentes: 34% proporcional.
  // El "sustraendo" implementa la progresividad acumulativa por tramo.
  // Fuente: Venelogía, Grant Thornton / Moore / Marambio-HLB (tablas de retención, UT 43).
  islr: {
    desgravamenUnicoUt: 774,   // deducción única en U.T. (alternativa a desgravámenes detallados)
    rebajaPersonalUt: 10,      // rebaja del contribuyente (en U.T.)
    rebajaCargaFamiliarUt: 10, // por cónyuge no separado de bienes y por cada carga (en U.T.)
    // Tarifa N° 1: límite superior del tramo (U.T.), tasa marginal y sustraendo (U.T.).
    // Impuesto (U.T.) = baseGravable_UT × tasa − sustraendo.
    tarifa1: [
      { hastaUt: 1000,     tasa: 0.06, sustraendoUt: 0 },
      { hastaUt: 1500,     tasa: 0.09, sustraendoUt: 30 },
      { hastaUt: 2000,     tasa: 0.12, sustraendoUt: 75 },
      { hastaUt: 2500,     tasa: 0.16, sustraendoUt: 155 },
      { hastaUt: 3000,     tasa: 0.20, sustraendoUt: 255 },
      { hastaUt: 4000,     tasa: 0.24, sustraendoUt: 375 },
      { hastaUt: 6000,     tasa: 0.29, sustraendoUt: 575 },
      { hastaUt: Infinity, tasa: 0.34, sustraendoUt: 875 },
    ],
    noResidente: 0.34,         // tarifa proporcional para no residentes
  },

  // ───────────────────────── LOTTT (LABORAL) ─────────────────────────
  // Ley Orgánica del Trabajo, los Trabajadores y las Trabajadoras (2012).
  // Fuente: LOTTT (INCES), Nayma Consultores, Acceso a la Justicia, finiquitojusto.
  lottt: {
    // Vacaciones (Art. 190): 15 días hábiles el 1er año + 1 día/año, tope 30.
    vacacionesDiasBase: 15,
    vacacionesDiasPorAnio: 1,
    vacacionesDiasMax: 30,
    // Bono vacacional (Art. 192): mín. 15 días + 1 día/año, tope 30.
    bonoVacacionalDiasBase: 15,
    bonoVacacionalDiasPorAnio: 1,
    bonoVacacionalDiasMax: 30,
    // Utilidades / aguinaldo (Art. 131): mín. legal 30 días, hasta 120 (según empresa).
    utilidadesDiasMin: 30,
    utilidadesDiasMax: 120,
    // Prestaciones sociales (Art. 142) — sistema DUAL, se paga el MAYOR:
    //   (a+b) Garantía: 15 días/trimestre (a partir del 1er trimestre)
    //         + 2 días/año adicionales acumulativos, tope 30 (desde el 2º año).
    //   (c)   Retroactivo: 30 días/año (o fracción > 6 meses) al último salario integral.
    prestaciones: {
      garantiaDiasPorTrimestre: 15,
      diasAdicionalesPorAnio: 2,
      diasAdicionalesMax: 30,
      retroactivoDiasPorAnio: 30,
      fraccionSuperiorMeses: 6,  // fracción > 6 meses cuenta como año completo (retroactivo)
    },
    // Salario integral = salario normal + alícuota bono vacacional + alícuota utilidades.
    // Alícuota = (díasConcepto × salarioDiario) / 360.
    diasAnioComercial: 360,
    // Preaviso (Art. 81) por antigüedad — referencial (días):
    preaviso: [
      { hastaMeses: 1, dias: 0 },    // < 1 mes: no aplica
      { hastaMeses: 6, dias: 7 },    // 1–6 meses: 1 semana
      { hastaMeses: 12, dias: 15 },  // 6 meses–1 año: 2 semanas
      { hastaMeses: Infinity, dias: 30 }, // > 1 año: 1 mes
    ],
  },

  // ───────────────────────── COMBUSTIBLE ─────────────────────────
  // Gasolina subsidiada vs internacional. Sistema Patria asigna cupo mensual.
  // Fuentes: CNN Español, Bloomberg Línea, Reporte Confidencial (2026).
  combustible: {
    precioSubsidiadoUsdLitro: 0.10,  // hasta el cupo, con Carnet de la Patria ⚠️ VERIFICAR
    precioInternacionalUsdLitro: 0.50, // sin cupo / sobre el límite (pago en divisas) ⚠️ VERIFICAR
    cupoMensualLitrosAuto: 120,      // litros/mes subsidiados (automóvil)
    cupoMensualLitrosMoto: 60,       // litros/mes subsidiados (moto)
  },
} as const;

/**
 * ISLR anual de persona natural residente a partir del enriquecimiento neto gravable
 * ya en bolívares. Convierte a U.T., aplica la Tarifa N° 1 (tasa marginal − sustraendo)
 * y resta las rebajas personales. Devuelve el impuesto anual en bolívares (Bs.).
 *
 * @param netoGravableVes  enriquecimiento neto gravable anual en Bs. (tras desgravamen).
 * @param cargasFamiliares  nº de rebajas de 10 U.T. extra (cónyuge + cargas). Default 0.
 */
export function islrAnualVes(netoGravableVes: number, cargasFamiliares = 0): number {
  const ut = VENEZUELA_2026.unidadTributaria;
  const baseUt = netoGravableVes / ut;
  if (baseUt <= 0) return 0;
  // Tramo aplicable: el primero cuyo límite superior contiene la base.
  const tramo = VENEZUELA_2026.islr.tarifa1.find((t) => baseUt <= t.hastaUt)!;
  let impuestoUt = baseUt * tramo.tasa - tramo.sustraendoUt;
  // Rebajas: personal (10 U.T.) + cargas (10 U.T. c/u).
  const rebajaUt =
    VENEZUELA_2026.islr.rebajaPersonalUt +
    cargasFamiliares * VENEZUELA_2026.islr.rebajaCargaFamiliarUt;
  impuestoUt = Math.max(0, impuestoUt - rebajaUt);
  return impuestoUt * ut;
}

/** Días de vacaciones (o de bono vacacional) por años de antigüedad, con tope. */
export function diasVacacionesLottt(aniosAntiguedad: number): number {
  const l = VENEZUELA_2026.lottt;
  return Math.min(
    l.vacacionesDiasBase + Math.max(0, Math.floor(aniosAntiguedad) - 1) * l.vacacionesDiasPorAnio,
    l.vacacionesDiasMax,
  );
}

/**
 * Formatea un monto en bolívares con formato legal venezolano: punto para miles,
 * coma para decimales → "Bs. 1.234,56". Se usa 'de-DE' a propósito (mismo motivo
 * que en peru-2026.ts: el locale es-VE en Node emite formato estilo US).
 */
export function fmtVES(n: number): string {
  return 'Bs. ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);
}

/** Convierte USD → Bs. a la tasa indicada ('bcv' | 'paralelo'). */
export function usdToVes(usd: number, tasa: 'bcv' | 'paralelo' = 'bcv'): number {
  return usd * VENEZUELA_2026.fx[tasa];
}

/** Convierte Bs. → USD a la tasa indicada ('bcv' | 'paralelo'). */
export function vesToUsd(ves: number, tasa: 'bcv' | 'paralelo' = 'bcv'): number {
  return ves / VENEZUELA_2026.fx[tasa];
}

// ═════════════════════════════════════════════════════════════════════════
//  EXPORTS ADICIONALES (jul-2026) — valores oficiales verificados usados por
//  calcs nuevas. Se agregan al final para no tocar la tabla maestra de arriba.
// ═════════════════════════════════════════════════════════════════════════

/**
 * IVSS — Indemnización diaria por incapacidad temporal (reposo médico).
 * Ley del Seguro Social, Art. 9 y Reglamento.
 *   - Días 1 a 3: los paga el PATRONO al 100% del salario.
 *   - Desde el día 4 y hasta 52 semanas máx.: el IVSS paga 2/3 (66,66%) del
 *     salario normal; el patrono suele completar el 33,33% restante (según
 *     contrato/convención). Requiere validar el reposo ante el IVSS ≤72 h.
 * Fuente: Ley del Seguro Social (Justia VE), IVSS — Base Legal Indemnizaciones.
 */
export const IVSS_REPOSO = {
  porcentajeIvss: 0.6666,       // 2/3 del salario desde el día 4
  porcentajePatronoComplemento: 0.3334, // complemento habitual hasta el 100%
  diasEmpleador100: 3,          // primeros 3 días: patrono paga 100%
  desdeDia: 4,                  // el subsidio del IVSS arranca el día 4
  maxSemanas: 52,               // tope de 52 semanas por un mismo caso
} as const;

/**
 * IVSS — Prestación dineraria por Pérdida Involuntaria del Empleo ("paro forzoso").
 * Ley del Régimen Prestacional de Empleo, Art. 31 y ss.
 *   - Monto = 60% del salario mensual promedio cotizado al IVSS en los últimos
 *     12 meses, pagado por hasta 5 meses (5 cuotas mensuales).
 *   - Requisito: haber cotizado al menos 52 semanas en los últimos 24 meses y
 *     haber perdido el empleo de forma involuntaria. Solicitud ≤60 días.
 * Fuente: Ley de Régimen Prestacional de Empleo (Asamblea Nacional), Venelogía.
 */
export const PARO_FORZOSO_IVSS = {
  porcentaje: 0.60,             // 60% del salario promedio cotizado
  maxMeses: 5,                  // hasta 5 cuotas mensuales
  meses: 12,                    // promedio de los últimos 12 meses cotizados
  cotizacionesMinSemanas: 52,   // 52 semanas cotizadas mínimo
  ventanaMeses: 24,             // dentro de los últimos 24 meses
  plazoSolicitudDias: 60,       // plazo para solicitar tras el despido
} as const;

/**
 * LOTTT — Recargo por día feriado / día de descanso trabajado (Art. 119 y 120).
 *   - El día feriado o de descanso trabajado se paga con un RECARGO del 50%
 *     sobre el salario normal, además del salario del día.
 *   - Si se trabaja el día de descanso (feriado o no), nace además el derecho
 *     a un día de descanso compensatorio remunerado (no sustituible por dinero).
 * Fuente: LOTTT Art. 119-120 (ley.com.ve), Acceso a la Justicia.
 */
export const FERIADO_LOTTT = {
  recargo: 0.50,                // 50% de recargo sobre el salario normal
  horasParaCompensatorioCompleto: 4, // ≥4 h → día compensatorio completo
} as const;

/**
 * FAOV / BANAVIH — Fondo de Ahorro Obligatorio para la Vivienda.
 * Decreto con Rango, Valor y Fuerza de Ley del Régimen Prestacional de Vivienda
 * y Hábitat (Reforma Decreto Nº 9.048), Art. 30.
 *   - Aporte total 3% del SALARIO INTEGRAL mensual: 1% trabajador + 2% patrono.
 *   - Lo entera el patrono los primeros 5 días de cada mes ante BANAVIH.
 * Fuente: BANAVIH, Decreto Nº 9.048 (Asamblea Nacional), Acceso a la Justicia.
 */
export const FAOV_BANAVIH = {
  trabajador: 0.01,             // 1% retenido al trabajador
  patrono: 0.02,                // 2% aporte patronal
  total: 0.03,                  // 3% del salario integral
  baseEsSalarioIntegral: true,
} as const;

/**
 * LOTTT Art. 154 — Límite legal de amortización de deudas por nómina.
 * Las deudas del trabajador con el patrono se amortizan en cuotas que NO pueden
 * exceder 1/3 (≈33,33%) del salario semanal o mensual, según el período.
 * Se usa como tope prudencial de capacidad de pago para créditos por nómina.
 * Fuente: LOTTT Art. 154 (Justia VE), Nayma Consultores.
 */
export const DEDUCCION_MAXIMA_NOMINA_LOTTT = 1 / 3; // ≈ 0,3333

/**
 * Reconversiones monetarias del bolívar (factores fijos históricos).
 * Cada reconversión eliminó ceros dividiendo todo importe por un factor fijo.
 * En total se eliminaron 14 ceros (2008: 3, 2018: 5, 2021: 6).
 * Para pasar de una moneda vieja a la ACTUAL (bolívar digital, VED) se aplican
 * en cadena los factores de las reconversiones posteriores a esa moneda.
 * Fuente: BCV, Decreto de nueva expresión monetaria 01/10/2021 (Acceso a la
 * Justicia), Prodavinci, El Diario.
 */
export const RECONVERSIONES_VES = [
  {
    id: 'original',
    nombre: 'Bolívar (Bs., antes de 2008)',
    anio: null as number | null,
    ceros: 0,
    // Factor acumulado para llegar al bolívar ACTUAL (÷1.000 ÷100.000 ÷1.000.000).
    factorAActual: 1_000 * 100_000 * 1_000_000, // 1e14
  },
  {
    id: 'fuerte',
    nombre: 'Bolívar Fuerte (Bs.F, 2008)',
    anio: 2008,
    ceros: 3,
    factorAActual: 100_000 * 1_000_000, // 1e11
  },
  {
    id: 'soberano',
    nombre: 'Bolívar Soberano (Bs.S, 2018)',
    anio: 2018,
    ceros: 5,
    factorAActual: 1_000_000, // 1e6
  },
  {
    id: 'digital',
    nombre: 'Bolívar Digital (Bs.D / VED, 2021)',
    anio: 2021,
    ceros: 6,
    factorAActual: 1, // ya es la moneda actual
  },
] as const;
