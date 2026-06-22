/**
 * Datos fiscales y laborales de URUGUAY 2026 — tabla maestra única.
 * Fuentes: DGI, BPS, MTSS, INE, BCU. Verificado 2026-06-22.
 * - SMN: Decreto N° 319/025 (26-dic-2025) → $24.572 desde ene-2026, $25.383 desde jul-2026.
 * - BPC 2026: Decreto N° 11/026 → $6.864 (sube 4,38% vs $6.576 de 2025), vigente 1-ene-2026.
 * - IRPF/IASS 2026: BPS Comunicado R 5/2026 + DGI (escalas en BPC).
 * Moneda: Peso uruguayo (UYU, "$U").
 */

/** Vigencia del dato (YYYY-MM-DD) — usada por el sello de frescura a nivel dato (src/lib/data-freshness.ts). */
export const DATA_AS_OF = '2026-06-22';

export const URUGUAY_2026 = {
  anio: 2026,
  moneda: 'UYU',
  simbolo: '$U',

  // ── BPC: unidad de referencia para IRPF, IASS, prestaciones y multas ──
  // Decreto N° 11/026. Se actualiza por decreto en enero de cada año.
  bpc: 6864,

  // ── Salario mínimo nacional (SMN) — Decreto N° 319/025 ──
  // Dos tramos en 2026: $24.572 (ene-jun) y $25.383 (jul-dic).
  // El decreto define jornal = SMN/25 y hora = SMN/200.
  smn: {
    mensualEnero: 24572,       // vigente 1-ene-2026
    mensualJulio: 25383,       // vigente 1-jul-2026 (ajuste adicional)
    jornalEnero: 982.88,       // 24.572 / 25
    horaEnero: 122.86,         // 24.572 / 200
    jornalJulio: 1015.32,      // 25.383 / 25
    horaJulio: 126.915,        // 25.383 / 200
    divisorJornal: 25,
    divisorHora: 200,
    aumentoAnualPct: 0.0754,   // 7,54% acumulado en el año
  },

  // ── Aportes personales del trabajador a BPS (Industria y Comercio, relación de dependencia) ──
  // Se descuentan del salario nominal. Total ≈ 18,1%–23,1% según FONASA.
  bps: {
    montepio: 0.15,            // aporte jubilatorio personal (15% s/ nominal)
    frl: 0.001,                // Fondo de Reconversión Laboral (0,1%)

    // FONASA: tasa personal según base de cálculo (2,5 BPC) y familia a cargo.
    // Umbral = 2,5 BPC = $17.160 nominal mensual (2,5 × 6.864).
    // Cónyuge/concubino computa sólo si NO tiene cobertura SNIS propia.
    fonasa: {
      umbralBpc: 2.5,          // base de cálculo que separa tasa baja/alta
      // Hasta 2,5 BPC:
      hasta25: {
        soloTrabajador: 0.03,       // sin cónyuge ni hijos
        conHijos: 0.03,             // con hijos, sin cónyuge
        conConyuge: 0.05,           // con cónyuge, sin hijos
        conConyugeEHijos: 0.05,     // con cónyuge e hijos
      },
      // Más de 2,5 BPC:
      mas25: {
        soloTrabajador: 0.045,      // 3% + 1,5%
        conHijos: 0.06,             // 3% + 1,5% + 1,5%
        conConyuge: 0.065,          // 3% + 1,5% + 2%
        conConyugeEHijos: 0.08,     // 3% + 1,5% + 1,5% + 2%
      },
    },

    // Aporte patronal (a cargo del EMPLEADOR, no se descuenta del recibo).
    // Industria y Comercio. Referencial — varía por sector/convenio.
    patronal: {
      jubilatorio: 0.075,      // 7,5% jubilatorio patronal
      fonasa: 0.05,            // 5% FONASA patronal
      frl: 0.001,              // 0,1% FRL patronal
      // No incluye aporte por aguinaldo/licencia (se calcula sobre cada partida).
    },
  },

  // ── IRPF — Categoría II (rentas del trabajo dependiente) ──
  // Escala mensual progresiva por franjas en BPC. BPS Comunicado R 5/2026 + DGI.
  // Mínimo no imponible = 7 BPC mensuales ($48.048).
  // Las deducciones NO se restan de la base: generan un crédito a tasa 14% (nominal < 15 BPC)
  // u 8% (nominal ≥ 15 BPC) que se descuenta del impuesto primario.
  irpf: {
    minimoNoImponibleBpc: 7,   // 7 BPC = $48.048/mes exento
    // Límite superior de cada franja en BPC (acumulativo) y tasa marginal.
    franjas: [
      { hastaBpc: 7, tasa: 0.00 },        // 0 – 7 BPC: 0%
      { hastaBpc: 10, tasa: 0.10 },       // 7 – 10 BPC: 10%
      { hastaBpc: 15, tasa: 0.15 },       // 10 – 15 BPC: 15%
      { hastaBpc: 30, tasa: 0.24 },       // 15 – 30 BPC: 24%
      { hastaBpc: 50, tasa: 0.25 },       // 30 – 50 BPC: 25%
      { hastaBpc: 75, tasa: 0.27 },       // 50 – 75 BPC: 27%
      { hastaBpc: 115, tasa: 0.31 },      // 75 – 115 BPC: 31%
      { hastaBpc: Infinity, tasa: 0.36 }, // > 115 BPC: 36%
    ],
    // Crédito por deducciones: tasa según nominal mensual.
    deduccion: {
      umbralBpc: 15,           // nominal < 15 BPC → 14%; ≥ 15 BPC → 8%
      tasaBaja: 0.14,          // nominal < 15 BPC ($102.960)
      tasaAlta: 0.08,          // nominal ≥ 15 BPC
      // Deducción por hijo/persona a cargo (monto anual sobre el que se aplica la tasa de crédito).
      hijoMenorBpcAnual: 20,        // 20 BPC/año por hijo menor
      hijoDiscapacidadBpcAnual: 40, // 40 BPC/año por hijo con discapacidad
    },
    // El empleador retiene un 6% adicional sobre las franjas para anticipar el IRPF del aguinaldo.
    factorAguinaldo: 0.06,
  },

  // ── IASS — Impuesto de Asistencia a la Seguridad Social (jubilaciones y pensiones) ──
  // Escala mensual progresiva por franjas en BPC. Mínimo no imponible = 9 BPC ($61.776).
  // Lo retiene BPS/la caja directamente de la pasividad.
  iass: {
    minimoNoImponibleBpc: 9,   // 9 BPC = $61.776/mes exento
    franjas: [
      { hastaBpc: 9, tasa: 0.00 },        // 0 – 9 BPC: 0%
      { hastaBpc: 15, tasa: 0.06 },       // 9 – 15 BPC: 6%
      { hastaBpc: 50, tasa: 0.24 },       // 15 – 50 BPC: 24%
      { hastaBpc: Infinity, tasa: 0.30 }, // > 50 BPC: 30%
    ],
  },

  // ── Impuestos al consumo / empresariales (DGI) ──
  iva: {
    basica: 0.22,              // tasa básica
    minima: 0.10,              // tasa mínima (alimentos, medicamentos, salud, etc.)
  },
  irae: 0.25,                  // Impuesto a las Rentas de las Actividades Económicas (25%)
  // IRNR (No Residentes): tasas proporcionales 3%–12% según tipo de renta.
  irnr: {
    general: 0.12,             // tasa general (rentas, servicios)
    intereses: 0.12,
    dividendos: 0.07,
    rangoMin: 0.03,
    rangoMax: 0.12,
  },

  // ── Parámetros laborales (MTSS) ──
  laboral: {
    // Aguinaldo (Sueldo Anual Complementario) = 1/12 de lo percibido en el semestre.
    // Se paga en JUNIO (dic-may) y DICIEMBRE (jun-nov). Divisor 12.
    aguinaldoDivisor: 12,

    // Licencia anual: 20 días por año calendario completo. +1 día cada 4 años desde el 5º.
    licenciaDiasBase: 20,
    licenciaDiasExtraCada4Anios: 1,   // a partir del 5º año de antigüedad

    // Salario vacacional: suma para mejor goce de la licencia.
    // = jornal LÍQUIDO de licencia × días de licencia. (líquido = neto de aportes BPS).
    // Aproximación habitual: (sueldo nominal × ~0,81 ÷ 30) × días.

    // Indemnización por despido (IPD).
    despido: {
      mensual: {
        mesesPorAnio: 1,       // 1 mensualidad por año de antigüedad (fracción = año entero)
        topeMeses: 6,          // tope 6 mensualidades (≥ 7 años)
      },
      jornalero: {
        jornalesPorAnio: 25,   // 25 jornales por año (si trabajó ≥ 240 jornadas/año)
        topeJornales: 150,     // tope 150 jornales (= 6 años)
        minimoJornadasParaDerecho: 100, // < 100 jornadas → sin derecho a IPD
      },
    },

    // Horas extra (Ley 15.996 / Decreto 550/989).
    horaExtra: {
      diaHabil: 1.00,          // +100% sobre la hora simple (días hábiles)
      feriadoODescanso: 1.50,  // +150% (feriado no laborable o descanso semanal)
      topeSemanal: 8,          // máx. 8 horas extra/semana
    },

    jornadaSemanalHoras: 44,   // Industria 48h; Comercio 44h (referencial)
    jornadaDiariaHoras: 8,
  },

  // ── Tipo de cambio USD/UYU (BCU interbancario) ──
  // SNAPSHOT — ACTUALIZAR: el dólar cotiza a diario. Para "dólar hoy" usar fuente en vivo (BCU/BROU).
  usd: {
    interbancario: 40.097,     // BCU interbancario (jun-2026)
    brouCompra: 39.07,         // BROU pizarra compra (referencial)
    brouVenta: 41.08,          // BROU pizarra venta (referencial)
    fecha: '2026-06-22',
  },

  // ── Unidad Indexada (UI) ──
  // SNAPSHOT — ACTUALIZAR: la UI se ajusta a diario por el IPC (la publica el INE; la difunde la DGI/BCU).
  // Se usa para alquileres, créditos hipotecarios, ahorro indexado y algunos tributos.
  // Valor oficial DGI al 22-jun-2026 = $6,5888 (jun-2026 abrió en $6,5583 y cerró cerca de $6,6011).
  unidadIndexada: {
    valor: 6.5888,             // $U por 1 UI (DGI, 22-jun-2026)
    fecha: '2026-06-22',
    fuente: 'INE/DGI',
  },

  // ── FONASA: devolución de aportes (reintegro de cuota mutual) ──
  // SNAPSHOT — ACTUALIZAR cada año: el CPE (Costo Promedio Equivalente) lo fija el Poder Ejecutivo por decreto.
  // El tope anual de aportes a la salud por beneficiario = CPE mensual × 12 × 1,25 (incremento del 25%).
  // Si los aportes FONASA del año superan ese tope, el excedente se devuelve (devolución FONASA).
  // CPE 2026 = $6.693/mes (rige desde 1-ene-2026; el valor anterior era $4.828).
  // OJO: la devolución que se paga en 2026 (sobre aportes 2025) usa el CPE viejo; el CPE nuevo impacta en la
  // devolución de 2027 (sobre aportes 2026). Acá usamos el CPE 2026 para estimar la devolución de los aportes 2026.
  fonasa: {
    cpeMensual: 6693,          // Costo Promedio Equivalente mensual 2026 ($U)
    factorTope: 1.25,          // el tope se incrementa un 25% sobre 12 × CPE
    mesesAnio: 12,
    fecha: '2026-06-22',
    fuente: 'BPS/DGI',
  },
} as const;

/**
 * Aplica una escala progresiva por franjas en BPC sobre una base mensual (en pesos).
 * Devuelve el impuesto mensual. Reutilizable para IRPF (impuesto primario) e IASS.
 */
export function impuestoPorFranjasBpc(
  baseMensual: number,
  franjas: ReadonlyArray<{ hastaBpc: number; tasa: number }>,
): number {
  const bpc = URUGUAY_2026.bpc;
  if (baseMensual <= 0) return 0;
  let impuesto = 0;
  let anteriorBpc = 0;
  for (const f of franjas) {
    const limite = f.hastaBpc === Infinity ? Infinity : f.hastaBpc * bpc;
    const piso = anteriorBpc * bpc;
    const enTramo = Math.min(baseMensual, limite) - piso;
    if (enTramo <= 0) { anteriorBpc = f.hastaBpc; continue; }
    impuesto += enTramo * f.tasa;
    anteriorBpc = f.hastaBpc;
    if (baseMensual <= limite) break;
  }
  return impuesto;
}

/**
 * IRPF mensual (Cat. II, trabajo) a partir del salario nominal y deducciones admitidas.
 * 1) Impuesto primario = escala progresiva sobre el nominal.
 * 2) Crédito por deducciones = deduccionesMensuales × (14% si nominal < 15 BPC, si no 8%).
 * 3) IRPF = max(0, primario − crédito).
 * `deduccionesMensuales` ya debe incluir aportes BPS (montepío+FONASA+FRL), hijos, etc.
 */
export function irpfMensual(nominalMensual: number, deduccionesMensuales = 0): number {
  const bpc = URUGUAY_2026.bpc;
  const primario = impuestoPorFranjasBpc(nominalMensual, URUGUAY_2026.irpf.franjas);
  const tasaCredito = nominalMensual < URUGUAY_2026.irpf.deduccion.umbralBpc * bpc
    ? URUGUAY_2026.irpf.deduccion.tasaBaja
    : URUGUAY_2026.irpf.deduccion.tasaAlta;
  const credito = deduccionesMensuales * tasaCredito;
  return Math.max(0, primario - credito);
}

/** IASS mensual a partir de la jubilación/pensión nominal mensual. */
export function iassMensual(pasividadMensual: number): number {
  return impuestoPorFranjasBpc(pasividadMensual, URUGUAY_2026.iass.franjas);
}

/**
 * Devuelve la tasa FONASA personal del trabajador según base y familia a cargo.
 * @param nominalMensual salario nominal mensual (para comparar con 2,5 BPC)
 * @param conConyuge cónyuge/concubino a cargo sin cobertura SNIS propia
 * @param conHijos hijos menores a cargo
 */
export function tasaFonasa(nominalMensual: number, conConyuge = false, conHijos = false): number {
  const t = URUGUAY_2026.bps.fonasa;
  const umbral = t.umbralBpc * URUGUAY_2026.bpc;
  const tabla = nominalMensual <= umbral ? t.hasta25 : t.mas25;
  if (conConyuge && conHijos) return tabla.conConyugeEHijos;
  if (conConyuge) return tabla.conConyuge;
  if (conHijos) return tabla.conHijos;
  return tabla.soloTrabajador;
}

/**
 * Total de aportes personales BPS (sin IRPF) sobre el nominal: montepío + FONASA + FRL.
 * Devuelve { montepio, fonasa, frl, total, tasaFonasa }.
 */
export function aportesBpsPersonales(
  nominalMensual: number,
  conConyuge = false,
  conHijos = false,
): { montepio: number; fonasa: number; frl: number; total: number; tasaFonasa: number } {
  const tFonasa = tasaFonasa(nominalMensual, conConyuge, conHijos);
  const montepio = nominalMensual * URUGUAY_2026.bps.montepio;
  const fonasa = nominalMensual * tFonasa;
  const frl = nominalMensual * URUGUAY_2026.bps.frl;
  return { montepio, fonasa, frl, total: montepio + fonasa + frl, tasaFonasa: tFonasa };
}

/**
 * Salario líquido (en mano) mensual: nominal − aportes BPS − IRPF.
 * El IRPF usa como deducciones los aportes BPS personales (caso base, sin hijos/alquiler).
 */
export function salarioLiquido(
  nominalMensual: number,
  conConyuge = false,
  conHijos = false,
): { nominal: number; aportesBps: number; irpf: number; liquido: number } {
  const ap = aportesBpsPersonales(nominalMensual, conConyuge, conHijos);
  const irpf = irpfMensual(nominalMensual, ap.total);
  return {
    nominal: nominalMensual,
    aportesBps: ap.total,
    irpf,
    liquido: nominalMensual - ap.total - irpf,
  };
}

/**
 * Formatea un monto en pesos uruguayos con el formato local: punto para miles,
 * coma para decimales → "$U 1.234,50", "$U 24.572".
 * Se usa 'de-DE' a propósito (mismo criterio que el resto de los data files del proyecto).
 */
export function fmtUYU(n: number): string {
  return '$U ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);
}
