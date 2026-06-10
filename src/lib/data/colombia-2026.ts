/**
 * Datos fiscales y laborales de COLOMBIA 2026 — tabla maestra única.
 * Fuentes oficiales, verificado por WebSearch 2026-06-10:
 * - SMLMV 2026: Decreto 1469 de 2025 (29-dic-2025) → $1.750.905 (+23% vs 2025).
 * - Auxilio de transporte 2026: Decreto 1470 de 2025 → $249.095.
 * - UVT 2026: Resolución DIAN 000238 del 15-dic-2025 → $52.374 (IPC clase media 5,17%).
 * - UVT 2025: $49.799 (DIAN; rige para topes de declaración del año gravable 2025 que se presenta en 2026).
 * - Reforma laboral: Ley 2466 de 2025 (jornada nocturna desde 19:00 desde 25-dic-2025;
 *   recargo dominical/festivo 80% → 90% desde 01-jul-2026 → 100% desde 01-jul-2027; aprendices SENA).
 * - Jornada: Ley 2101 de 2021 (44 h/sem hasta 14-jul-2026; 42 h/sem desde 15-jul-2026).
 * - Reforma pensional Ley 2381/2024: SUSPENDIDA por la Corte Constitucional (Auto 841 de 2025).
 *   A jun-2026 rige el sistema de la Ley 100/1993 (RAIS vs RPM, FSP vigente). NO usar pilares como vigentes.
 * Moneda: Peso colombiano (COP, "$").
 */

/** Vigencia del dato (YYYY-MM-DD) — usada por el sello de frescura a nivel dato (src/lib/data-freshness.ts). */
export const DATA_AS_OF = '2026-06-10';

export const COLOMBIA_2026 = {
  anio: 2026,

  // ───────────────────────── Salario mínimo ─────────────────────────
  smlmv: 1_750_905,            // Decreto 1469/2025 (MinTrabajo, 29-dic-2025). Vigente desde 01-ene-2026.
  auxilioTransporte: 249_095,  // Decreto 1470/2025. Aplica a quien gana hasta 2 SMLMV. SMLMV + auxilio = $2.000.000.
  topeAuxilioSmlmv: 2,         // auxilio de transporte sólo si salario < 2 SMLMV ($3.501.810)
  smdlv: 1_750_905 / 30,       // salario mínimo diario legal vigente = $58.363,50

  // ───────────────────────── Unidades fiscales ─────────────────────────
  uvt: 52_374,                 // UVT 2026 — Resolución DIAN 000238 del 15-dic-2025
  uvt2025: 49_799,             // UVT 2025 — se usa para los topes de declaración del año gravable 2025 (se declara en 2026)

  // ───────────────────────── Jornada laboral (Ley 2101/2021) ─────────────────────────
  jornada: {
    horasSemanaHasta14Jul2026: 44,   // vigente 15-jul-2025 a 14-jul-2026
    horasSemanaDesde15Jul2026: 42,   // último escalón Ley 2101/2021, rige desde 15-jul-2026
    divisorMensualHasta14Jul2026: 220, // horas/mes para valor hora con jornada 44 h
    divisorMensualDesde15Jul2026: 210, // horas/mes con jornada 42 h (la hora "sube" ~4,76%)
  },

  // ───────────────────────── Recargos y horas extras (CST + Ley 2466/2025) ─────────────────────────
  recargos: {
    horaInicioNocturna: 19,            // jornada nocturna 19:00–06:00 desde 25-dic-2025 (Ley 2466/2025; antes 21:00)
    nocturno: 0.35,                    // recargo trabajo ordinario nocturno (art. 168 CST)
    extraDiurna: 0.25,                 // hora extra diurna +25%
    extraNocturna: 0.75,               // hora extra nocturna +75%
    dominicalFestivoHasta30Jun2026: 0.80, // Ley 2466/2025: 80% desde 01-jul-2025
    dominicalFestivoDesde01Jul2026: 0.90, // 90% desde 01-jul-2026
    dominicalFestivoDesde01Jul2027: 1.00, // 100% desde 01-jul-2027
  },

  // ───────────────────────── Seguridad social y parafiscales (empleados) ─────────────────────────
  aportes: {
    saludEmpleado: 0.04,        // Ley 100/1993 (total salud 12,5%)
    saludEmpleador: 0.085,      // exonerado para PJ con trabajadores < 10 SMLMV (art. 114-1 ET, Ley 1607/2012)
    pensionEmpleado: 0.04,      // Ley 100/1993 (total pensión 16%)
    pensionEmpleador: 0.12,
    // ARL — 100% a cargo del empleador, según clase de riesgo (Decreto 1772/1994):
    arl: { I: 0.00522, II: 0.01044, III: 0.02436, IV: 0.0435, V: 0.0696 },
    parafiscales: {
      cajaCompensacion: 0.04,   // CCF — NUNCA exonerada
      icbf: 0.03,               // exonerado PJ < 10 SMLMV (art. 114-1 ET)
      sena: 0.02,               // exonerado PJ < 10 SMLMV (art. 114-1 ET)
    },
    exoneracionArt114_1SmlmvTope: 10, // PJ no paga salud 8,5% + SENA + ICBF por trabajadores que ganan < 10 SMLMV
    ibcMinimoSmlmv: 1,          // IBC mínimo = 1 SMLMV
    ibcTopeSmlmv: 25,           // IBC máximo = 25 SMLMV = $43.772.625 (Ley 797/2003)
  },

  // Fondo de Solidaridad Pensional — escala sobre IBC en SMLMV (Ley 100 art. 27; Decreto 1833/2016).
  // VIGENTE: la reforma pensional (Ley 2381/2024) está suspendida (Auto 841/2025 Corte Constitucional).
  fsp: [
    { desdeSmlmv: 4, hastaSmlmv: 16, tasa: 0.01 },
    { desdeSmlmv: 16, hastaSmlmv: 17, tasa: 0.012 },
    { desdeSmlmv: 17, hastaSmlmv: 18, tasa: 0.014 },
    { desdeSmlmv: 18, hastaSmlmv: 19, tasa: 0.016 },
    { desdeSmlmv: 19, hastaSmlmv: 20, tasa: 0.018 },
    { desdeSmlmv: 20, hastaSmlmv: Infinity, tasa: 0.02 },
  ],

  // ───────────────────────── Independientes (PILA) ─────────────────────────
  independientes: {
    ibcPorcentajeIngresos: 0.40, // cotizan sobre el 40% del ingreso mensualizado (Ley 2277/2022 art. 89)
    salud: 0.125,                // 12,5% del IBC (asume todo el aporte)
    pension: 0.16,               // 16% del IBC
    // ARL: voluntaria para riesgo I-III, obligatoria riesgo IV-V (usa tabla aportes.arl)
  },

  // ───────────────────────── Salario integral ─────────────────────────
  salarioIntegral: {
    minimoSmlmv: 13,            // 10 SMLMV + 30% factor prestacional (art. 132 CST) = $22.761.765 en 2026
    factorPrestacional: 0.30,
    ibcFactor: 0.70,            // seguridad social se cotiza sobre el 70% del salario integral
  },

  // ───────────────────────── Prestaciones sociales ─────────────────────────
  prestaciones: {
    cesantiasPorcentaje: 1 / 12,        // 1 mes de salario por año (8,33%)
    interesesCesantias: 0.12,           // 12% anual sobre saldo de cesantías (Ley 52/1975)
    primaPorcentaje: 1 / 12,            // 30 días de salario por año, pagada jun (máx 30-jun) y dic (máx 20-dic)
    vacacionesDiasHabiles: 15,          // 15 días hábiles por año (art. 186 CST) ≈ 4,17% mensual
    vacacionesPorcentaje: 15 / 360,
    sancionMoraCesantiasDiasPorDia: 1,  // 1 día de salario por día de retraso si no consigna al 14-feb (Ley 50/1990 art. 99)
  },

  // ───────────────────────── Aprendices SENA (Ley 2466/2025 art. 21 + Decreto 0223 de 2026) ─────────────────────────
  aprendizSena: {
    lectivaPorcentajeSmlmv: 0.75,     // etapa lectiva: 75% SMLMV = $1.313.179
    productivaPorcentajeSmlmv: 1.00,  // etapa productiva/práctica: 100% SMLMV = $1.750.905
    // Desde Decreto 0223/2026 (05-mar-2026) es contrato laboral especial a término fijo:
    // EPS + ARL desde el inicio; pensión, prima y vacaciones en la etapa productiva.
  },

  // ───────────────────────── Incapacidades (CST art. 227, Ley 100 art. 206) ─────────────────────────
  incapacidad: {
    porcentajeDias1a90: 2 / 3,    // 66,67% del salario (días 1-2 a cargo del empleador, 3-90 EPS)
    porcentajeDias91a180: 0.5,    // 50% del salario (días 91-180, EPS)
    diasACargoEmpleador: 2,
    pisoIbcSmlmv: 1,              // el pago no puede ser inferior al SMLMV proporcional
  },

  // ───────────────────────── Embargo de salario (CST arts. 154-156) ─────────────────────────
  embargo: {
    inembargableSmlmv: 1,           // el SMLMV es inembargable
    excedenteEmbargable: 1 / 5,     // sólo 1/5 de lo que exceda el SMLMV
    topeAlimentosCooperativas: 0.5, // hasta 50% de TODO el salario por pensión alimenticia o cooperativas
  },

  // ───────────────────────── Indemnización despido sin justa causa (art. 64 CST, término indefinido) ─────────────────────────
  indemnizacionDespido: {
    menos10Smlmv: { diasPrimerAnio: 30, diasPorAnioAdicional: 20 },
    desde10Smlmv: { diasPrimerAnio: 20, diasPorAnioAdicional: 15 },
    // Término fijo: salarios del tiempo faltante del contrato.
  },

  // ───────────────────────── Declaración de renta 2026 (año gravable 2025 → topes con UVT 2025 = $49.799) ─────────────────────────
  declaracionRenta2026: {
    topePatrimonioUvt: 4_500,        // $224.095.500
    topeIngresosUvt: 1_400,          // $69.718.600
    topeConsumosTarjetaUvt: 1_400,
    topeComprasUvt: 1_400,
    topeConsignacionesUvt: 1_400,
    topePatrimonioPesos: 224_095_500,
    topeIngresosPesos: 69_718_600,   // = 1.400 × 49.799 (basta superar UN tope para estar obligado)
  },

  // ───────────────────────── Sanciones DIAN (Estatuto Tributario) ─────────────────────────
  sanciones: {
    extemporaneidadPorMes: 0.05,     // 5% del impuesto a cargo por mes o fracción, antes de emplazamiento (art. 641 ET)
    extemporaneidadTope: 1.0,        // tope 100% del impuesto
    extemporaneidadConEmplazamientoPorMes: 0.10, // 10%/mes tras emplazamiento, tope 200% (art. 642 ET)
    minimaUvt: 10,                   // sanción mínima 10 UVT = $523.740 en 2026 (art. 639 ET)
  },

  // ───────────────────────── Retención en la fuente por conceptos 2026 ─────────────────────────
  // Bases mínimas con UVT 2026 = $52.374. OJO: el Consejo de Estado suspendió arts. 2-8 del
  // Decreto 572/2025 → rigen las bases del Decreto 1625/2016 (tabla clásica), verificado 2026-06-10.
  retefuenteConceptos: [
    { concepto: 'Compras generales', baseUvt: 27, basePesos: 1_414_098, declarante: 0.025, noDeclarante: 0.035 },
    { concepto: 'Servicios generales', baseUvt: 4, basePesos: 209_496, declarante: 0.04, noDeclarante: 0.06 },
    { concepto: 'Honorarios y comisiones', baseUvt: 0, basePesos: 0, declarante: 0.11, noDeclarante: 0.10 }, // PJ 11%; PN no declarante 10% (11% si contrato > 3.300 UVT)
    { concepto: 'Arrendamiento bienes inmuebles', baseUvt: 27, basePesos: 1_414_098, declarante: 0.035, noDeclarante: 0.035 },
  ],

  // ───────────────────────── Retención salarial art. 383 ET (mensual, en UVT) ─────────────────────────
  // Tabla estatutaria (Ley 2277/2022): marginal sobre el exceso + adición fija en UVT.
  retefuenteArt383: [
    { desdeUvt: 0, hastaUvt: 95, tasa: 0, adicionUvt: 0 },
    { desdeUvt: 95, hastaUvt: 150, tasa: 0.19, adicionUvt: 0 },
    { desdeUvt: 150, hastaUvt: 360, tasa: 0.28, adicionUvt: 10 },
    { desdeUvt: 360, hastaUvt: 640, tasa: 0.33, adicionUvt: 69 },
    { desdeUvt: 640, hastaUvt: 945, tasa: 0.35, adicionUvt: 162 },
    { desdeUvt: 945, hastaUvt: 2_300, tasa: 0.37, adicionUvt: 268 },
    { desdeUvt: 2_300, hastaUvt: Infinity, tasa: 0.39, adicionUvt: 770 },
  ],

  // ───────────────────────── Renta personas naturales art. 241 ET (anual, en UVT) ─────────────────────────
  rentaArt241: [
    { desdeUvt: 0, hastaUvt: 1_090, tasa: 0, adicionUvt: 0 },
    { desdeUvt: 1_090, hastaUvt: 1_700, tasa: 0.19, adicionUvt: 0 },
    { desdeUvt: 1_700, hastaUvt: 4_100, tasa: 0.28, adicionUvt: 116 },
    { desdeUvt: 4_100, hastaUvt: 8_670, tasa: 0.33, adicionUvt: 788 },
    { desdeUvt: 8_670, hastaUvt: 18_970, tasa: 0.35, adicionUvt: 2_296 },
    { desdeUvt: 18_970, hastaUvt: 31_000, tasa: 0.37, adicionUvt: 5_901 },
    { desdeUvt: 31_000, hastaUvt: Infinity, tasa: 0.39, adicionUvt: 10_352 },
  ],
  rentaExentaLaboral: { porcentaje: 0.25, topeAnualUvt: 790 }, // renta exenta 25% laboral, tope 790 UVT/año (art. 206-10 ET, Ley 2277)

  // ───────────────────────── Régimen Simple de Tributación (RST) ─────────────────────────
  // Tope de ingresos brutos para optar al RST: < 100.000 UVT/año (12.000 UVT para
  // profesiones liberales / factor intelectual). Tarifas progresivas 1,2%–14,5%
  // según actividad e ingresos (art. 905-908 ET, Ley 2277/2022).
  // 100.000 × UVT 2026 ($52.374) = $5.237.400.000. Fuentes:
  //  - https://dian.com.co/regimen-simple-tributacion-colombia-2026/
  //  - https://www.rsm.global/colombia/es/insights/regimen-simple-de-tributacion-2026-llego-el-momento-de-revisar-tus-requisitos
  regimenSimple: {
    topeIngresosUvt: 100_000,        // general
    topeIngresosProfesionalesUvt: 12_000, // profesiones liberales / factor intelectual
    get topeIngresosPesos() { return this.topeIngresosUvt * COLOMBIA_2026.uvt; }, // $5.237.400.000
  },

  // ───────────────────────── Ganancia ocasional ─────────────────────────
  gananciaOcasional: {
    tarifaGeneral: 0.15,           // Ley 2277/2022 (venta de activos ≥ 2 años, herencias, donaciones)
    tarifaLoterias: 0.20,
    exencionViviendaUvt: 5_000,    // art. 311-1 ET (Ley 2277): primeras 5.000 UVT = $261.870.000 de la utilidad
    // exentas en venta de casa/apto de habitación (≥ 2 años de posesión; destino: otra vivienda o pago de hipoteca)
    retencionVentaInmueblePN: 0.01, // retención 1% en venta de inmuebles de persona natural (hasta 20.000 UVT)
  },

  // ───────────────────────── GMF 4×1000 ─────────────────────────
  gmf: { tasa: 0.004, exencionMensualUvt: 350 }, // exención: 350 UVT/mes = $18.330.900 en cuenta marcada (art. 879 ET)

  // ───────────────────────── Compraventa de vivienda: gastos de cierre ─────────────────────────
  compraventa: {
    derechosNotariales: 0.0054,    // 0,54% del valor de la escritura (Resolución SNR 2026-000964-6 del 20-ene-2026, vigente 01-feb-2026); usual 50/50 comprador-vendedor
    retencionVendedorPN: 0.01,     // 1% a cargo del vendedor persona natural (arts. 398-401 ET)
    impuestoRegistroBogota: 0.0167,// impuesto de registro (Bogotá/Cundinamarca) — comprador. Varía por departamento (0,5%-1% legal, Ley 223/1995 + sobretasas)
    beneficenciaBogota: 0.0029,    // derechos de registro/beneficencia aprox. Bogotá — comprador (referencial, verificado en prensa especializada 2026)
    timbreDesdeUvt: 20_000,        // impuesto de timbre sólo si la venta supera 20.000 UVT = $1.047.480.000 (ya hay calc dedicada)
  },

  // ───────────────────────── Multas de tránsito 2026 ─────────────────────────
  // Desde 2026 se indexan por UVB (art. 313 Ley 2294/2023), ya no por SMDLV.
  // Valores vigencia 2026 (Circular MinTransporte 20264000000037; redondeo oficial a la centena).
  multasTransito: {
    A: 168_900,   // ej.: peatón/ciclista que incumple normas
    B: 337_400,   // ej.: estacionar mal, no llevar documentos
    C: 633_200,   // ej.: exceso de velocidad, semáforo en rojo, sin tecnomecánica
    D: 1_266_100, // ej.: conducir sin licencia, transitar en contravía
    E: 1_899_300, // ej.: alcoholemia (grados según reincidencia)
    descuentoProntoPago50: { porcentaje: 0.5, plazoDiasHabiles: 5, plazoDiasHabilesElectronico: 11 },  // con curso
    descuentoProntoPago25: { porcentaje: 0.25, plazoDiasHabiles: 20, plazoDiasHabilesElectronico: 26 }, // con curso
  },

  // ───────────────────────── Impuesto predial Bogotá 2026 ─────────────────────────
  // Resolución SDH-000194 del 12-dic-2025 (ajuste de rangos 10,02% por IPVN-DANE) + haciendabogota.gov.co (2026-06-10).
  predialBogota: {
    descuentoProntoPago: 0.10,
    fechaDescuento: '2026-04-17',       // 10% pagando hasta 17-abr-2026 (ya vencida a jun-2026)
    fechaLimite: '2026-07-10',          // fecha límite sin sanción
    residencial: {
      tarifaMinPorMil: 5.5,             // hasta $194.307.000 de avalúo
      tarifaMaxPorMil: 12.3,            // avalúos > $2.505.139.000
      rangoMinPesos: 194_307_000,
      rangoMaxPesos: 2_505_139_000,
      // Tabla progresiva intermedia completa: art. 1 Resolución SDH-000194 (transcribir al construir la calc).
    },
    preferencialEstratos: {
      // tarifas preferenciales para avalúos hasta 135 SMLMV:
      estrato1y2DesdePorMil: 1,         // desde 16 SMLMV de avalúo
      estrato1y2HastaPorMil: 3,         // > 107 SMLMV
      estrato3PorMil: 3,                // hasta 135 SMLMV
      topeAvaluoSmlmv: 135,
    },
    comercial: { tarifaPorMilHasta: 8, cortePesos: 363_264_000, tarifaPorMilDesde: 9.5 },
    spacCuotas: ['2026-06-05', '2026-08-14', '2026-10-02', '2026-12-04'], // pago en 4 cuotas (declarar antes del 08-may-2026)
  },

  moneda: 'COP',
  simbolo: '$',
} as const;

/** Valor embargable de un salario mensual (COP). tipoDeuda: 'comun' | 'alimentos_cooperativas'. */
export function salarioEmbargable(salarioMensual: number, tipoDeuda: 'comun' | 'alimentos_cooperativas' = 'comun'): number {
  const s = Math.max(0, salarioMensual);
  if (tipoDeuda === 'alimentos_cooperativas') return s * COLOMBIA_2026.embargo.topeAlimentosCooperativas;
  const excedente = Math.max(0, s - COLOMBIA_2026.smlmv);
  return excedente * COLOMBIA_2026.embargo.excedenteEmbargable;
}

/** Tasa FSP según IBC en COP (0 si IBC < 4 SMLMV). Sistema Ley 100 vigente (reforma pensional suspendida). */
export function tasaFsp(ibc: number): number {
  const enSmlmv = ibc / COLOMBIA_2026.smlmv;
  for (const t of COLOMBIA_2026.fsp) {
    if (enSmlmv >= t.desdeSmlmv && enSmlmv < t.hastaSmlmv) return t.tasa;
  }
  return 0;
}

/** Retención en la fuente salarial mensual (art. 383 ET) sobre la base gravable mensual en COP. */
export function retefuenteMensualArt383(baseGravableMensual: number): number {
  const u = COLOMBIA_2026.uvt;
  const baseUvt = Math.max(0, baseGravableMensual) / u;
  for (const t of COLOMBIA_2026.retefuenteArt383) {
    if (baseUvt > t.desdeUvt && baseUvt <= t.hastaUvt) {
      return ((baseUvt - t.desdeUvt) * t.tasa + t.adicionUvt) * u;
    }
  }
  return 0;
}

/** Impuesto de renta ANUAL persona natural (art. 241 ET) sobre la base gravable anual en COP. */
export function impuestoRentaAnualArt241(baseGravableAnual: number): number {
  const u = COLOMBIA_2026.uvt;
  const baseUvt = Math.max(0, baseGravableAnual) / u;
  for (const t of COLOMBIA_2026.rentaArt241) {
    if (baseUvt > t.desdeUvt && baseUvt <= t.hastaUvt) {
      return ((baseUvt - t.desdeUvt) * t.tasa + t.adicionUvt) * u;
    }
  }
  return 0;
}

/** Valor de la hora ordinaria según la fecha (jornada 44 h hasta 14-jul-2026, 42 h después — Ley 2101/2021). */
export function valorHoraOrdinaria(salarioMensual: number, fecha: Date = new Date()): number {
  const divisor = fecha >= new Date('2026-07-15')
    ? COLOMBIA_2026.jornada.divisorMensualDesde15Jul2026
    : COLOMBIA_2026.jornada.divisorMensualHasta14Jul2026;
  return Math.max(0, salarioMensual) / divisor;
}

/** Formatea un monto en pesos colombianos (es-CO), sin decimales. */
export function fmtCOP(n: number): string {
  return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Math.round(n));
}
