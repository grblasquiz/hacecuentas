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

/**
 * Precios de combustibles del Ecuador — USD por GALÓN (Ecuador vende combustible por galón).
 * Período vigente: 12-jul-2026 a 11-ago-2026.
 * Fuente: EP Petroecuador (precios sugeridos de venta al público) — primicias.ec y eluniverso.com
 *   (11–12 jul 2026), https://www.primicias.ec/economia/precios-gasolina-super-extra-ecopais-diesel-ecuador-julio-127717/
 * - Extra y Ecopaís: bajo el "sistema de bandas" vigente desde jun-2024. La banda permite un techo
 *   de +5% de subida y hasta −10% de bajada del precio cada mes. Precio jul-2026: $3,26/galón (bajó
 *   desde $3,31).
 * - Diésel Premium (segmento automotor): $3,20/galón (bajó desde $3,25).
 * - Súper: precio liberalizado (varía por mercado); sugerido Petroecuador $5,61/galón.
 * Nota: Galápagos y algunas provincias tienen precios distintos; estos son los de la red continental.
 */
export const COMBUSTIBLES_EC_2026 = {
  periodo: '12-jul-2026 a 11-ago-2026',
  unidad: 'galón',
  precios: {
    extra:   { label: 'Gasolina Extra',   usdGalon: 3.26 },
    ecopais: { label: 'Gasolina Ecopaís', usdGalon: 3.26 },
    super:   { label: 'Gasolina Súper',   usdGalon: 5.61 },
    diesel:  { label: 'Diésel Premium',   usdGalon: 3.20 },
  },
  bandaTechoSubida: 0.05,   // +5% máximo de subida mensual (bandas Extra/Ecopaís)
  bandaPisoBajada: 0.10,    // −10% máximo de bajada mensual
} as const;

/**
 * Costo del pasaporte ordinario electrónico ecuatoriano — 2026 (USD, no incluye IVA).
 * Fuente: Registro Civil (DIGERCIC) / MREMH — gob.ec, "Emisión de pasaporte ordinario…",
 *   https://www.gob.ec/dgrcic/tramites/emision-pasaporte-ordinario-primera-vez-renovacion-mayores-18-anos
 * - Adulto (18+): $90, vigencia 10 años. La renovación cuesta lo mismo que la primera emisión.
 * - Menor de 18: $80, vigencia máxima 5 años (no puede superar los 5 años).
 * - Tercera edad (65+): 50% de descuento → $45.
 * - Persona con discapacidad ≥30%: exonerada (gratis).
 * No existe un "recargo por trámite urgente": la entrega el mismo día se hace sin costo extra en las
 * oficinas principales (Quito Matriz, Guayaquil, Cuenca San Blas); en el resto tarda 24–72 h.
 */
export const PASAPORTE_EC_2026 = {
  adulto: 90,          // 18+ (primera vez o renovación)
  menor: 80,           // < 18 años
  terceraEdad: 45,     // 65+ (50% de descuento sobre $90)
  discapacidad: 0,     // ≥30% de discapacidad: exonerado
  vigenciaAdulto: 10,  // años
  vigenciaMenor: 5,    // años
} as const;

/**
 * Multa por no sufragar / incumplir funciones electorales — Ecuador 2026.
 * Base legal: Código de la Democracia (LOEOP), arts. 292–293. Todas las multas se calculan como
 *   porcentaje del Salario Básico Unificado (SBU) del año de la elección. SBU 2026 = $482.
 * Fuente: CNE (cne.gob.ec) — "Compensación y multas a los Miembros de las Juntas Receptoras del Voto",
 *   https://www.cne.gob.ec/compensacion-y-multas-a-los-miembros-de-las-juntas-receptoras-del-voto/
 * - No sufragar (elector que no vota): 10% del SBU → $48,20.
 * - No asistir a la capacitación siendo miembro de JRV designado: 10% del SBU → $48,20.
 * - No concurrir a integrar la Junta Receptora del Voto (miembro designado): 15% del SBU → $72,30.
 * - Abandono injustificado de funciones hasta terminar el escrutinio: 11 a 20 SBU ($5.302 a $9.640),
 *   fijado por el organismo electoral (rango, no monto fijo → no se computa automáticamente).
 * Voto OBLIGATORIO: 18 a 65 años. Voto FACULTATIVO (no genera multa): 16–17 años, 65+ años,
 *   personas con discapacidad, analfabetos y ecuatorianos residentes en el exterior. Justificativos
 *   válidos (exención): enfermedad/impedimento con certificado, calamidad doméstica, y ausencia del país.
 */
export const MULTA_SUFRAGIO_EC_2026 = {
  sbu: 482,
  variantes: {
    no_sufragar:        { label: 'No sufragué (no voté)',                                  pctSBU: 0.10 },
    jrv_capacitacion:   { label: 'Miembro de JRV: no asistí a la capacitación',            pctSBU: 0.10 },
    jrv_no_integrar:    { label: 'Miembro de JRV designado: no concurrí a integrar la mesa', pctSBU: 0.15 },
  },
  edadObligatorioMin: 18,
  edadObligatorioMax: 65,
} as const;

/**
 * Interés por mora patronal del IESS — Ecuador 2026.
 * El IESS cobra un interés de mora sobre el capital adeudado (aportes patronales + personales) cuando
 * el empleador no paga la planilla a tiempo. La mora se genera desde el día 16 del mes siguiente al
 * período trabajado (la planilla se paga hasta el día 15). La tasa es la tasa activa efectiva máxima
 * referencial del sistema financiero que publica el Banco Central del Ecuador cada mes, más el recargo
 * que fija el IESS; en 2026 se ha mantenido en torno al 13,33% anual (p. ej. junio 2026: 13,33%).
 * El interés se acumula día a día sobre el capital impago; esta calculadora lo estima por meses.
 * Aportes 2026: personal 9,45% + patronal 11,15% = 20,60% del sueldo.
 * Fuentes: IESS (iess.gob.ec) — "Mora patronal", https://www.iess.gob.ec/en/web/empleador/mora-patronal ;
 *   noticia IESS "La tasa de interés por mora patronal es del 13,33%".
 */
export const IESS_MORA_EC_2026 = {
  tasaAnualReferencia: 13.33,   // % anual (referencia jun-2026); el BCE la actualiza cada mes
  aportePersonal: 0.0945,       // 9,45%
  aportePatronal: 0.1115,       // 11,15%
  diaPago: 15,                  // se paga hasta el día 15 del mes siguiente; mora desde el 16
} as const;

/**
 * Nota de postulación Transformar (Senescyt) — Ecuador 2026.
 * La nota de postulación combina el puntaje del examen Transformar con la nota de grado del
 * bachillerato (reportada por el Ministerio de Educación), más puntos por acción afirmativa.
 * Escala del examen Transformar: 400 a 1000 puntos. La nota de grado (sobre 10 o sobre 20) se lleva
 * a la misma escala de 1000 para ponderarla.
 * Ponderaciones (Senescyt / edusuperior.ec):
 *   - Bachillerato GENERAL: examen 35% + nota de grado 65%.
 *   - Bachillerato TÉCNICO (postulando a carrera técnica afín): examen 25% + nota de grado 75%.
 *   - Acción afirmativa: hasta 45 puntos adicionales sobre el resultado.
 * Fuente: edusuperior.ec, "Calcular Nota Transformar de postulación",
 *   https://edusuperior.ec/etapas/postulacion/calcular-nota ; educacionsuperior.gob.ec.
 */
export const SENESCYT_TRANSFORMAR_EC = {
  examenMin: 400,
  examenMax: 1000,
  general: { pesoExamen: 0.35, pesoGrado: 0.65 },
  tecnico: { pesoExamen: 0.25, pesoGrado: 0.75 },
  accionAfirmativaMax: 45,
} as const;
