/**
 * Datos fiscales y laborales de ECUADOR 2026 — tabla maestra única.
 * Fuentes: SRI, IESS, Ministerio del Trabajo. Verificado 2026-06-08.
 * - SBU 2026: USD 482 (Ministerio del Trabajo).
 * - Tabla IR 2026: Resolución SRI NAC-DGERCGC25-00000043.
 * Ecuador está dolarizado → moneda USD ("$").
 */

/** Vigencia del dato (YYYY-MM-DD) — usada por el sello de frescura a nivel dato (src/lib/data-freshness.ts). */
export const DATA_AS_OF = '2026-06-15';

export const ECUADOR_2026 = {
  anio: 2026,
  sbu: 482,                  // Salario Básico Unificado (USD)
  iessPersonal: 0.0945,      // aporte personal IESS (relación de dependencia privada)
  iessPatronal: 0.1115,      // aporte patronal IESS (privado)
  iva: 0.15,                 // IVA general (15% desde 2024)
  fondosReserva: 0.0833,     // 8,33% (desde el 2º año con el mismo empleador)
  utilidades: 0.15,          // 15% de utilidades a repartir entre trabajadores
  decimoCuarto: 482,         // 1 SBU (igual al SBU del año)
  irFraccionBasicaDesgravada: 12208, // fracción exenta anual (USD)
  rebajaGastosPersonales: 0.18,      // rebaja del 18% sobre gastos personales (tope por canasta)
  // Tabla IR 2026 personas naturales (Resol. NAC-DGERCGC25-00000043)
  irTabla: [
    { desde: 0,      hasta: 12208,    base: 0,     pct: 0.00 },
    { desde: 12208,  hasta: 15549,    base: 0,     pct: 0.05 },
    { desde: 15549,  hasta: 20188,    base: 167,   pct: 0.10 },
    { desde: 20188,  hasta: 26700,    base: 631,   pct: 0.12 },
    { desde: 26700,  hasta: 35136,    base: 1412,  pct: 0.15 },
    { desde: 35136,  hasta: 46575,    base: 2678,  pct: 0.20 },
    { desde: 46575,  hasta: 62005,    base: 4965,  pct: 0.25 },
    { desde: 62005,  hasta: 82679,    base: 8823,  pct: 0.30 },
    { desde: 82679,  hasta: 109956,   base: 15025, pct: 0.35 },
    { desde: 109956, hasta: Infinity, base: 24572, pct: 0.37 },
  ],
  moneda: 'USD',
  simbolo: '$',
  // Impuesto a la Salida de Divisas (ISD) 2026
  // Fuente: SRI, https://www.sri.gob.ec/impuesto-a-la-salida-de-divisas-isd (tarifa general 5%).
  // Tarifa subió de 3,5% a 5% el 01-abr-2024 (Ley Orgánica para enfrentar el Conflicto Armado Interno).
  isdTarifa: 0.05,                  // tarifa general ISD 5%
  // Monto exento anual para consumos y retiros con tarjeta de crédito/débito en el exterior.
  // Fuente: SRI, Resolución NAC-DGERCGC24-00000045 (20-dic-2024), vigente 2025-2026-2027.
  isdExentoTarjetaAnual: 5188.26,   // USD/año (consumos + retiros con tarjeta en el exterior)
  // Monto exento para transferencias/envíos al exterior (no por tarjeta) y efectivo al salir del país:
  // 3 SBU. En 2026 = 3 × 482 = USD 1.446,00. Para transferencias por el sistema financiero se resta
  // por período quincenal; para efectivo, al salir del país.
  isdExentoTransfSBU: 3,            // 3 salarios básicos unificados
} as const;

/**
 * Canastas analíticas del INEC — marzo 2026 (USD).
 * Hogar tipo: 4 miembros con 1,6 perceptores que reciben el SBU.
 * Fuente: INEC, Informe Ejecutivo de las Canastas Analíticas Básica y Vital,
 * https://www.ecuadorencifras.gob.ec/canasta/ (marzo 2026).
 */
export const CANASTA_INEC_2026 = {
  basicaFamiliar: 829.38,        // Canasta Básica Familiar (75 productos) — marzo 2026
  vital: 579.20,                 // Canasta Familiar Vital (73 productos) — marzo 2026
  ingresoFamiliarRef: 899.73,    // ingreso familiar mensual de referencia INEC (1,6 perceptores del SBU)
  mesReferencia: 'marzo 2026',
} as const;

/**
 * Tarifa eléctrica residencial Ecuador 2026 (USD/kWh).
 * Fuente: Pliego Tarifario del SPEE 2026, Resolución ARCONEL-029/25 (31-dic-2025);
 *   ARCERNNR/ARCONEL precio medio nacional $0,1061/kWh; CNEL EP tarifa residencial.
 * - Tarifa Dignidad: $0,04/kWh para consumos hasta 110 kWh/mes (Sierra) o 130 kWh/mes
 *   (Costa/Oriente/Insular), si el abonado estuvo por debajo del límite en 11 de los
 *   últimos 12 meses. Fuente: ARCONEL — Tarifa Dignidad / CELEC EP.
 * - Residencial general (sin subsidio): cargo de energía ~$0,091/kWh sobre el primer bloque,
 *   con cargo fijo de comercialización de $1,414/mes. Estructura por bloques crecientes.
 *   Verificado contra valores publicados por CNEL EP (50 kWh ≈ $5,96; 100 kWh ≈ $10,61;
 *   150 kWh ≈ $15,38; 200 kWh ≈ $20,21).
 */
export const TARIFA_ELECTRICA_EC_2026 = {
  tarifaDignidad: 0.04,            // USD/kWh (consumo subsidiado)
  limiteDignidadSierra: 110,       // kWh/mes
  limiteDignidadCosta: 130,        // kWh/mes (Costa/Oriente/Insular)
  comercializacion: 1.414,         // USD/mes (cargo fijo residencial)
  // Bloques residenciales sin subsidio (USD/kWh) — estructura creciente.
  // Tramos según el detalle publicado por CNEL EP (período jun-nov):
  // 131-500 ≈$0,10 · 501-700 ≈$0,13 · 701-1.000 ≈$0,15 · 1.001-1.500 ≈$0,17 · 1.501-2.500 ≈$0,27.
  bloques: [
    { hasta: 130,      usdKwh: 0.091 },
    { hasta: 500,      usdKwh: 0.10 },
    { hasta: 700,      usdKwh: 0.13 },
    { hasta: 1000,     usdKwh: 0.15 },
    { hasta: 1500,     usdKwh: 0.17 },
    { hasta: Infinity, usdKwh: 0.27 },
  ],
  precioMedioNacional: 0.1061,     // USD/kWh (precio medio facturado 2026, ARCONEL)
} as const;

/**
 * Costo de vida Ecuador 2026 — referencia INEC.
 * Fuente: INEC, Canasta Familiar Básica (75 productos), marzo 2026.
 *   https://www.ecuadorencifras.gob.ec/canasta/
 * - Nacional: $829,38 (marzo 2026; +$5 vs. $824,17 de febrero).
 * - Ingreso familiar promedio: $899,73/mes (1,6 perceptores con SBU) → la canasta absorbe el 92,18%.
 * - Valores por ciudad (Canasta Familiar Básica, INEC; marzo 2026):
 *     Cuenca $876,38 (la más alta) · Loja $860,45 · Quito $856,57 · Manta $855,00 ·
 *     Guayaquil $839,00 · Ambato $797,30 · Esmeraldas $797,30 · Machala $769,13 (la más baja) ·
 *     Santo Domingo $769,13.
 *   Verificado: Cuenca/Loja/Quito/Machala con valor exacto (cents) en Ecuador Chequea
 *   (cita textual INEC marzo 2026: "Cuenca 876,38; Loja 860,45; Quito 856,57; la más baja Machala 769,13").
 *   Manta/Guayaquil/Esmeraldas/Santo Domingo son aproximados (prensa cita ~$855/~$839/~$797/~$770);
 *   el INEC publica el cuadro completo por ciudad sólo en imagen (no extraíble). Re-verificar cents.
 *   Las 9 ciudades del IPC: Quito, Guayaquil, Manta, Machala, Loja, Esmeraldas, Ambato, Cuenca,
 *   Santo Domingo de los Colorados. La canasta es para un hogar tipo de 4 personas (referencia INEC).
 */
export const COSTO_VIDA_EC_2026 = {
  canastaBasicaNacional: 829.38,   // USD/mes, hogar tipo 4 personas (INEC marzo 2026)
  ingresoFamiliarPromedio: 899.73, // USD/mes (1,6 perceptores)
  perceptores: 1.6,
  personasHogarTipo: 4,            // tamaño del hogar de referencia de la canasta INEC
  // Canasta Familiar Básica por ciudad (USD/mes, hogar de 4 personas) — INEC marzo 2026.
  // Cuenca/Loja/Quito/Machala: valor exacto verificado (Ecuador Chequea, cita INEC).
  // Manta/Guayaquil/Esmeraldas/Ambato/Santo Domingo: aproximados (prensa; INEC sólo en imagen).
  ciudades: {
    cuenca:        { label: 'Cuenca',            canasta: 876.38 },
    loja:          { label: 'Loja',              canasta: 860.45 },
    quito:         { label: 'Quito',             canasta: 856.57 },
    manta:         { label: 'Manta',             canasta: 855.00 },
    guayaquil:     { label: 'Guayaquil',         canasta: 839.00 },
    nacional:      { label: 'Promedio nacional', canasta: 829.38 },
    esmeraldas:    { label: 'Esmeraldas',        canasta: 797.30 },
    ambato:        { label: 'Ambato',            canasta: 797.30 },
    machala:       { label: 'Machala',           canasta: 769.13 },
    santo_domingo: { label: 'Santo Domingo',     canasta: 769.13 },
  },
} as const;

/**
 * Aranceles de universidades privadas del Ecuador 2025-2026 (USD).
 * Valores POR SEMESTRE de pregrado, modalidad presencial. Verificado 2026-06-15.
 *
 * USFQ (la más cara del país): tabla oficial OCAS año académico 2025-2026.
 *   Matrícula por semestre $441,50–$584,50; arancel por semestre $4.440,00–$5.862,00
 *   (Música el más bajo; Medicina/Odontología el más alto). La USFQ cobra arancel fijo
 *   por semestre regular (I y II semestre, carga completa), no por crédito suelto.
 *   Fuente: USFQ, "Aranceles, Matrículas - Pregrado 2025-2026",
 *   https://www.usfq.edu.ec/sites/default/files/2025-02/tarifas-usfq-aprobadas-ocas-2025-2026-estudiantes-antes-de-agosto-2023.pdf
 * UDLA: tarifario oficial pregrado (Resol. 08-2025-V, vig. 04-jul-2025).
 *   Marketing Diurno Presencial: matrícula $351,88 + arancel por semestre $3.519,00.
 *   Fuente: UDLA, https://academico.udla.edu.ec/page/tarifario/ug/UDLA1P264/
 * PUCE (particular cofinanciada, más económica): pregrado ≈ $4.345–$5.500 por semestre
 *   (matrícula + arancel del período), según carrera. Fuente: PUCE Financiamiento Estudiantil,
 *   https://www.puce.edu.ec/financiamiento-estudiantil/ y reportes de aranceles 2025.
 *
 * Nota: cada universidad define su propio esquema (USFQ por crédito $≈450 ó arancel fijo
 * por semestre; UDLA/PUCE por arancel de período). Por eso el cálculo se hace sobre el
 * valor por semestre, que es el dato comparable y el que el estudiante paga realmente.
 */
export const UNIVERSIDADES_PRIVADAS_EC_2026 = {
  asOf: '2025-2026',
  // Rangos de costo POR SEMESTRE de pregrado (matrícula + arancel del período), USD.
  rangos: [
    { id: 'usfq',  nombre: 'USFQ (San Francisco de Quito)', matricula: [441.50, 584.50], aranceleSemestre: [4440.00, 5862.00] },
    { id: 'udla',  nombre: 'UDLA (de las Américas)',        matricula: [351.88, 351.88], aranceleSemestre: [3519.00, 4800.00] },
    { id: 'puce',  nombre: 'PUCE (Católica del Ecuador)',   matricula: [0,      0],      aranceleSemestre: [4345.00, 5500.00] },
  ],
  semestresPorCarrera: 8,   // referencia: ~4 años / 8 semestres en pregrado
} as const;

/** Impuesto a la renta anual (Ecuador) a partir de la base imponible anual (ingresos − aportes − rebajas).
 *  Devuelve el impuesto causado en USD. */
export function impuestoRentaEC(baseImponibleAnual: number): number {
  const b = Math.max(0, baseImponibleAnual);
  for (const t of ECUADOR_2026.irTabla) {
    if (b > t.desde && b <= t.hasta) return t.base + (b - t.desde) * t.pct;
  }
  const ult = ECUADOR_2026.irTabla[ECUADOR_2026.irTabla.length - 1];
  return ult.base + (b - ult.desde) * ult.pct;
}

/** Formatea un monto en dólares (Ecuador, es-EC). */
export function fmtUSDec(n: number): string {
  return '$' + new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);
}
