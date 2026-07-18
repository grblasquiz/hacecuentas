/**
 * Datos fiscales y laborales de PARAGUAY 2026 — tabla maestra única.
 * Fuentes: SET/DNIT (Dirección Nacional de Ingresos Tributarios), IPS (Instituto de
 * Previsión Social), MTESS (Ministerio de Trabajo, Empleo y Seguridad Social),
 * BCP (Banco Central del Paraguay). Verificado 2026-06-21.
 *
 * - Salario mínimo 2026: Gs. 3.044.000/mes — Decreto N° 6225 (reajuste 5%, vigente
 *   desde el 1-jul-2026). Jornal mínimo Gs. 117.077. Antes del reajuste el SMVM era
 *   Gs. 2.899.048 (jul-2024/jun-2026).
 *   Fuente: MTESS, https://www.mtess.gov.py/ ; ABC Color (Decreto 6225, 18-jun-2026).
 * - IPS: aporte obrero 9% (se descuenta del recibo) + aporte patronal 16,5%.
 *   Fuente: IPS, https://portal.ips.gov.py/sistemas/ipsportal/contenido.php?c=315
 * - Tributos (IVA 10%/5%, IRP, IRE, IDU): Ley N° 6380/19 de Modernización y
 *   Simplificación del Sistema Tributario Nacional.
 *   Fuente: DNIT, https://www.dnit.gov.py/web/portal-institucional/iva e /irp e /ire
 *
 * Moneda: Guaraní (PYG, "Gs."). El guaraní no usa decimales en la práctica.
 */

/** Vigencia del dato (YYYY-MM-DD) — usada por el sello de frescura a nivel dato (src/lib/data-freshness.ts). */
export const DATA_AS_OF = '2026-06-21';

export const PARAGUAY_2026 = {
  anio: 2026,

  // ── Salario mínimo y jornal ──────────────────────────────────────────────
  // Decreto N° 6225 (reajuste 5%), vigente desde 1-jul-2026. Antes: Gs. 2.899.048.
  salarioMinimo: 3044000,        // SMVM mensual para actividades diversas no especificadas (Gs.)
  jornalMinimo: 117077,          // jornal mínimo diario (Gs.) — trabajadores a jornal
  salarioMinimoAnterior: 2899048, // SMVM vigente jul-2024 → jun-2026 (referencia)
  // Divisor horario estándar para mensualizados con jornada completa: 30 días × 8 h = 240.
  horasMesEstandar: 240,
  diasMes: 30,
  horasDia: 8,

  // ── IPS (seguridad social) ───────────────────────────────────────────────
  ips: {
    obrero: 0.09,                // aporte del trabajador (se descuenta del salario bruto)
    patronal: 0.165,             // aporte del empleador (NO se descuenta del trabajador)
    // Desglose del patronal: 14% al IPS + 2,5% al Ministerio de Salud Pública.
    patronalIps: 0.14,
    patronalSalud: 0.025,
  },

  // ── IVA (Impuesto al Valor Agregado) — Ley 6380/19 ───────────────────────
  iva: {
    general: 0.10,               // tasa general (10%)
    reducida: 0.05,              // tasa reducida (5%)
    // La tasa del 5% aplica a: alquiler de inmuebles para vivienda, venta de inmuebles
    // (casas, departamentos, terrenos), medicamentos de uso humano registrados ante el
    // MSPyBS y productos de la canasta familiar básica (art. 90, Ley 6380/19).
  },

  // ── IRP (Impuesto a la Renta Personal) — Ley 6380/19 ─────────────────────
  // Renta por servicios personales: exento mientras el ingreso bruto anual no supere
  // Gs. 80.000.000. Superado ese umbral, se grava la RENTA NETA (ingresos − gastos
  // deducibles) con la escala progresiva. Las rentas del capital (intereses, alquileres,
  // ganancias de capital) tributan 8%, salvo dividendos (que van al IDU).
  irp: {
    noIncididoAnual: 80000000,   // umbral de no incidencia: ingreso bruto anual ≤ Gs. 80M → exento
    tasaRentaCapital: 0.08,      // rentas del capital (8%)
    // Escala progresiva sobre la renta neta anual (servicios personales). Tramos por
    // límite superior y tasa marginal de cada tramo (Ley 6380/19, art. 70).
    tramos: [
      { hasta: 50000000,  tasa: 0.08 },   // hasta Gs. 50.000.000: 8%
      { hasta: 150000000, tasa: 0.09 },   // de Gs. 50.000.001 a 150.000.000: 9%
      { hasta: Infinity,  tasa: 0.10 },   // exceso de Gs. 150.000.000: 10%
    ],
  },

  // ── IRE (Impuesto a la Renta Empresarial) e IDU ──────────────────────────
  ire: {
    general: 0.10,               // IRE Régimen General — 10% sobre la renta neta
    simple: 0.10,                // IRE SIMPLE (medianas, ingresos ≤ Gs. 2.000M/año) — 10%
    // RESIMPLE (pequeñas empresas): cuota fija anual según rango de ingresos (no %).
    simpleTopeIngresosAnual: 2000000000, // tope de facturación para el régimen SIMPLE (Gs.)
  },
  idu: 0.08,                     // Impuesto a los Dividendos y Utilidades (residentes): 8%
  iduNoResidente: 0.15,          // IDU para beneficiarios del exterior (no residentes): 15%

  // ── Parámetros laborales (Código del Trabajo, Ley 213/93) ────────────────
  laboral: {
    // Aguinaldo (13er sueldo, art. 243): 1/12 de todo lo percibido en el año calendario.
    aguinaldoDivisor: 12,
    // Indemnización por despido injustificado (art. 91): 15 jornales (salarios diarios)
    // por cada año de servicio o fracción mayor a 6 meses. Con ≥10 años de antigüedad
    // (estabilidad), el despido sin causa da derecho a doble indemnización o reposición.
    indemnizacionJornalesPorAnio: 15,
    estabilidadAniosDoble: 10,   // ≥10 años → doble indemnización (art. 94)
    // Preaviso (art. 87), en días según antigüedad:
    preaviso: [
      { hastaAnios: 1,        dias: 30 },   // período de prueba cumplido hasta 1 año
      { hastaAnios: 5,        dias: 45 },   // de 1 a 5 años
      { hastaAnios: 10,       dias: 60 },   // de 5 a 10 años
      { hastaAnios: Infinity, dias: 90 },   // más de 10 años
    ],
    // Vacaciones (art. 218), días hábiles corridos según antigüedad:
    vacaciones: [
      { hastaAnios: 5,        dias: 12 },   // hasta 5 años
      { hastaAnios: 10,       dias: 18 },   // de 5 a 10 años
      { hastaAnios: Infinity, dias: 30 },   // más de 10 años
    ],
    // Horas extras (art. 234): recargo sobre la hora ordinaria.
    horaExtraDiurna: 0.50,       // +50% (jornada diurna 06:00–20:00)
    horaExtraNocturna: 1.00,     // +100% (jornada nocturna 20:00–06:00)
    horaFeriadoDomingo: 1.00,    // +100% (feriados y descanso semanal)
    recargoNocturno: 0.30,       // +30% sobre el salario para el trabajo nocturno ordinario
    // Bonificación familiar (art. 261): 5% del salario mínimo por cada hijo < 17 años
    // (sin límite de edad si tiene discapacidad). Tope para percibirla: 2 salarios mínimos.
    bonificacionFamiliarPct: 0.05,
    bonificacionFamiliarTopeSalarios: 2, // sólo si el trabajador gana ≤ 2 SMVM
  },

  moneda: 'PYG',
  simbolo: 'Gs.',
} as const;

/**
 * Tasas de cambio de referencia — Banco Central del Paraguay (BCP).
 * Cotización referencial diaria (promedio ponderado de operaciones interbancarias).
 * Fuente: BCP, https://www.bcp.gov.py/webapps/web/cotizacion/monedas
 * SNAPSHOT al 2026-06-19 — ACTUALIZAR: estos valores cambian a diario. Para las calcs
 * cambiarias conviene servir el valor en vivo (build-time fetch) y dejar este snapshot
 * sólo como fallback citable. 1 unidad de moneda extranjera = X guaraníes (PYG).
 */
export const TIPO_CAMBIO_PY = {
  asOf: '2026-06-19',
  usdPyg: 6093.69,   // 1 USD = Gs. 6.093,69 (dólar estadounidense)
  brlPyg: 1185.77,   // 1 BRL = Gs. 1.185,77 (real brasileño — frontera Ciudad del Este)
  arsPyg: 4.18,      // 1 ARS = Gs. 4,18 (peso argentino — frontera Encarnación)
  fuente: 'BCP — Cotización Referencial de Monedas',
  // NOTA: en zonas de frontera las casas de cambio operan con spread propio (compra/venta)
  // que se aparta de la referencia del BCP. El snapshot es la cotización oficial de referencia.
} as const;

/**
 * Impuesto a la Renta Personal (IRP) ANUAL — servicios personales — a partir de la
 * renta neta anual (ingresos por servicios personales − gastos/inversiones deducibles).
 *
 * Importante: el contribuyente sólo está incidido si su ingreso BRUTO anual supera
 * Gs. 80.000.000 (umbral de no incidencia). Por debajo de ese umbral el impuesto es 0,
 * aunque la renta neta sea positiva. Pasar el ingreso bruto en `ingresoBrutoAnual`.
 *
 * Devuelve el IRP anual en guaraníes (Gs.). Ley 6380/19.
 */
export function impuestoIRPAnual(rentaNetaAnual: number, ingresoBrutoAnual: number): number {
  // No incidido: si el ingreso bruto anual no supera el umbral, no hay IRP.
  if (ingresoBrutoAnual <= PARAGUAY_2026.irp.noIncididoAnual) return 0;
  let base = Math.max(0, rentaNetaAnual);
  if (base <= 0) return 0;
  let impuesto = 0;
  let anterior = 0;
  for (const t of PARAGUAY_2026.irp.tramos) {
    const limite = t.hasta === Infinity ? Infinity : t.hasta;
    const ancho = limite - anterior;
    const enTramo = Math.min(base, ancho);
    if (enTramo <= 0) break;
    impuesto += enTramo * t.tasa;
    base -= enTramo;
    anterior = limite;
    if (base <= 0) break;
  }
  return impuesto;
}

/**
 * Bonificación familiar mensual (art. 261, Código del Trabajo): 5% del salario mínimo
 * por cada hijo que cumple los requisitos. Sólo corresponde si el trabajador gana
 * ≤ 2 salarios mínimos. Con el SMVM 2026 (Gs. 3.044.000) = Gs. 152.200 por hijo.
 * (Con el SMVM anterior de Gs. 2.899.048 era Gs. 144.952 por hijo.)
 */
export function bonificacionFamiliar(hijos: number, salarioBruto: number): number {
  const sm = PARAGUAY_2026.salarioMinimo;
  if (salarioBruto > sm * PARAGUAY_2026.laboral.bonificacionFamiliarTopeSalarios) return 0;
  return Math.max(0, Math.floor(hijos)) * sm * PARAGUAY_2026.laboral.bonificacionFamiliarPct;
}

/**
 * Formatea un monto en guaraníes con el formato local paraguayo: punto para miles,
 * sin decimales (el guaraní no usa centavos) → "Gs. 3.044.000", "Gs. 152.200".
 * Se usa 'de-DE' para garantizar el separador de miles con punto en Node/V8.
 */
export function fmtPYG(n: number): string {
  return 'Gs. ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLAS ADICIONALES 2026 (fábrica jul-2026). Verificadas con fuentes oficiales.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Petropar — precios de combustibles vigentes (Gs./litro).
 * Snapshot al 1-jul-2026: Petropar bajó el diésel (−2,6%) y mantuvo las naftas.
 * Fuente: Petropar, precios vigentes (https://www.petropar.gov.py/?page_id=4460);
 * ABC Color, 1-jul-2026. Cambian por resolución: son defaults editables.
 */
export const PETROPAR_2026 = {
  asOf: '2026-07-01',
  nafta88: 6690,        // Nafta Kape (88 octanos)
  nafta93: 7170,        // Nafta Oikoite (93 octanos)
  nafta97: 8540,        // Nafta Aratiri (97 octanos)
  dieselPora: 7990,     // Diésel Porã (reducido desde Gs. 8.200 el 1-jul-2026)
  dieselMbarete: 10000, // Diésel Mbarete (premium)
  fuente: 'Petropar — Precios vigentes',
  fuenteUrl: 'https://www.petropar.gov.py/?page_id=4460',
} as const;

/**
 * ANDE — Pliego de Tarifas N° 21 (residencial baja tensión, Categoría 142).
 * REGLA CLAVE: todo el consumo del mes se factura a UN SOLO precio, el de la faja
 * que corresponde al consumo TOTAL del mes (NO es tarifa marginal por bloques).
 * Los precios son la tarifa (sin IVA); la factura agrega IVA 10% (Ley 6380/19).
 * Tarifa social (Ley 3480/2008): el usuario familiar paga un % de la tarifa normal
 * según su banda de consumo (25% / 50% / 75%), es decir 75% / 50% / 25% de descuento.
 * Fuente: ANDE, Pliego de Tarifas N° 21 (act. 27-11-2024),
 * https://www.ande.gov.py/docs/tarifas/PLIEGO21.pdf
 */
export const ANDE_PLIEGO21 = {
  vigencia: 'Pliego N° 21',
  // Faja tarifaria residencial: { hasta kWh/mes, precio Gs./kWh }.
  fajasResidencial: [
    { hasta: 50,       precio: 311.55 },
    { hasta: 150,      precio: 349.89 },
    { hasta: 300,      precio: 365.45 },
    { hasta: 500,      precio: 403.82 },
    { hasta: 1000,     precio: 420.27 },
    { hasta: Infinity, precio: 435.51 },
  ],
  iva: 0.10, // IVA general Ley 6380/19; se suma sobre el importe de energía.
  // Tarifa social (Ley 3480/2008) — pagaPct = fracción de la tarifa normal que abona
  // el usuario familiar habilitado; descuentoPct = subsidio (1 − pagaPct).
  tarifaSocial: [
    { hasta: 100, pagaPct: 0.25, descuentoPct: 0.75 }, // 0–100 kWh/mes
    { hasta: 200, pagaPct: 0.50, descuentoPct: 0.50 }, // 101–200 kWh/mes
    { hasta: 300, pagaPct: 0.75, descuentoPct: 0.25 }, // 201–300 kWh/mes
  ],
  fuente: 'ANDE — Pliego de Tarifas N° 21',
  fuenteUrl: 'https://www.ande.gov.py/docs/tarifas/PLIEGO21.pdf',
} as const;

/**
 * Feriados nacionales de Paraguay 2026 (13 en total) — FECHAS OBSERVADAS.
 * Traslados confirmados por resolución del Ejecutivo (La Nación, 2-ene-2026):
 * Héroes (1/3 dom) → lun 2/3; Jura de la Constitución (20/6 sáb, nuevo feriado) →
 * lun 22/6. Boquerón (29/9) se deja en su fecha legal (martes); es movible por
 * decreto (puede observarse el lun 28/9). Fundación de Asunción (15/8) cae sábado.
 * Fuente: Ley de feriados + resoluciones del Poder Ejecutivo 2026.
 */
export const FERIADOS_PY_2026 = [
  { fecha: '2026-01-01', nombre: 'Año Nuevo' },
  { fecha: '2026-03-02', nombre: 'Día de los Héroes de la Patria (trasladado del 1/3)' },
  { fecha: '2026-04-02', nombre: 'Jueves Santo' },
  { fecha: '2026-04-03', nombre: 'Viernes Santo' },
  { fecha: '2026-05-01', nombre: 'Día del Trabajador' },
  { fecha: '2026-05-14', nombre: 'Día de la Independencia Nacional' },
  { fecha: '2026-05-15', nombre: 'Independencia Nacional / Día de la Madre' },
  { fecha: '2026-06-12', nombre: 'Día de la Paz del Chaco' },
  { fecha: '2026-06-22', nombre: 'Jura de la Constitución Nacional (trasladado del 20/6)' },
  { fecha: '2026-08-15', nombre: 'Fundación de Asunción' },
  { fecha: '2026-09-29', nombre: 'Victoria de Boquerón' },
  { fecha: '2026-12-08', nombre: 'Día de la Virgen de Caacupé' },
  { fecha: '2026-12-25', nombre: 'Navidad' },
] as const;

/**
 * Che Róga Porã 3.0 (2026) — crédito para la primera vivienda (MUVH / AFD).
 * Tasas: 6,5% anual para 1–6 salarios mínimos (segmento 2.0) y 9,9% para el nuevo
 * segmento de 6–9 SM (3.0). Plazo de hasta 30 años. La cuota no puede superar el 40%
 * del ingreso familiar. Tope de ingreso: 9 salarios mínimos. Monto máximo de crédito:
 * Gs. 792.000.000 en Asunción y Central; Gs. 652.000.000 en el interior.
 * Fuente: MUVH (Che Róga Porã 3.0) y AFD; Última Hora / ABC Color (jul-2026).
 */
export const CHE_ROGA_PORA_2026 = {
  version: '3.0',
  plazoMaxAnios: 30,
  plazoMinAnios: 20,
  cuotaMaxPctIngreso: 0.40,
  ingresoMaxSalarios: 9,
  ingresoMinSalarios: 1,
  tasaHasta6SM: 0.065,   // 1 a 6 salarios mínimos
  tasa6a9SM: 0.099,      // 6 a 9 salarios mínimos (segmento 3.0)
  umbralTasaSalarios: 6, // hasta 6 SM → 6,5%; más de 6 SM → 9,9%
  montoMaxCentral: 792000000,  // Asunción y Dpto. Central
  montoMaxInterior: 652000000, // resto del país
  fuente: 'MUVH / AFD — Che Róga Porã 3.0',
  fuenteUrl: 'https://www.cherogapora.gov.py/',
} as const;

/**
 * Embargo de salario — art. 245 del Código del Trabajo (Ley 213/93).
 * Límites máximos del salario embargable según el tipo de deuda. El aguinaldo es
 * inembargable en todos los casos. Fuente: Código del Trabajo (Ley 213/93), art. 245.
 */
export const EMBARGO_SALARIO_PY = {
  pensionAlimenticia: 0.50, // hasta 50%
  viviendaAlimentos: 0.40,  // hasta 40% (habitación o artículos alimenticios propios/familiares)
  otrasDeudas: 0.25,        // hasta 25% (los demás casos)
  aguinaldoInembargable: true,
  fuente: 'Código del Trabajo (Ley 213/93), art. 245',
} as const;
