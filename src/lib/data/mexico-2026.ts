/**
 * Datos fiscales y laborales de MÉXICO 2026 — tabla maestra única.
 * Patrón hermano de peru-2026.ts / ecuador-2026.ts. Verificado 2026-06-10 vía fuentes oficiales.
 *
 * Fuentes principales:
 * - CONASAMI / DOF (Resolución 09-dic-2025): salarios mínimos 2026.
 * - INEGI (Comunicado 1/26) + DOF 09-ene-2026: UMA 2026 (vigente desde 01-feb-2026).
 * - SAT, Anexo 8 RMF 2026 (DOF 28-dic-2025): tarifas ISR 2026 (factor de actualización 1.1321).
 * - DOF 31-dic-2025: decreto subsidio para el empleo 2026.
 * - LSS (Ley del Seguro Social) + reforma de pensiones 2020: cuotas IMSS 2026 (tabla CEAV patronal).
 * - LFT (Ley Federal del Trabajo): prestaciones laborales (aguinaldo, vacaciones, primas, indemnizaciones).
 * - LISR Arts. 93, 96, 113-E, 115, 129, 151, 152: exenciones, RESICO, arrendamiento, bolsa, deducciones.
 * - Leyes estatales de hacienda 2026: ISN por estado.
 * Moneda: Peso mexicano (MXN, "$").
 */

/** Vigencia del dato (YYYY-MM-DD) — usada por el sello de frescura a nivel dato (src/lib/data-freshness.ts). */
export const DATA_AS_OF = '2026-06-10';

export const MEXICO_2026 = {
  anio: 2026,

  // ── Salario mínimo 2026 — CONASAMI, DOF Resolución 09-dic-2025 (vigente 01-ene-2026) ──
  salarioMinimo: {
    generalDiario: 315.04,        // zona general (+13% vs 2025: MIR $17.01 + 6.5% fijación)
    zlfnDiario: 440.87,           // Zona Libre de la Frontera Norte (+5%)
    generalMensual: 9577.22,      // 315.04 × 30.4 (factor mensual promedio usado por CONASAMI/IMSS)
    zlfnMensual: 13402.45,        // 440.87 × 30.4
    factorMensual: 30.4,
  },

  // ── UMA 2026 — INEGI Comunicado 1/26, DOF 09-ene-2026 (vigente 01-feb-2026; +3.69% vs 2025) ──
  uma: {
    diaria: 117.31,
    mensual: 3566.22,
    anual: 42794.64,
  },
  // UMA 2025 (aplicable a enero 2026, antes de la entrada en vigor de la UMA 2026)
  umaDiaria2025: 113.14,

  // ── UMI 2026 — Unidad Mixta Infonavit (actualiza los créditos VSM; verificado 2026-06-10) ──
  // Infonavit fijó la actualización 2026 en 0,00% → la UMI se mantiene en $100.81 diarios.
  umiDiaria2026: 100.81,

  // ── Tarifa ISR MENSUAL 2026 — Art. 96 LISR, Anexo 8 RMF 2026 (DOF 28-dic-2025) ──
  // [límite inferior, límite superior, cuota fija, % sobre excedente]
  // Verificada contra dos fuentes (contadormx.com/tablas-isr-2026 y fiscalapi.com/blog/tablas-isr-2026), 2026-06-10.
  isrTarifaMensual: [
    [0.01, 844.59, 0.0, 0.0192],
    [844.6, 7168.51, 16.22, 0.064],
    [7168.52, 12598.02, 420.95, 0.1088],
    [12598.03, 14644.64, 1011.68, 0.16],
    [14644.65, 17533.64, 1339.14, 0.1792],
    [17533.65, 35362.83, 1856.84, 0.2136],
    [35362.84, 55736.68, 5665.16, 0.2352],
    [55736.69, 106410.5, 10457.09, 0.3],
    [106410.51, 141880.66, 25659.23, 0.32],
    [141880.67, 425641.99, 37009.69, 0.34],
    [425642.0, Infinity, 133488.54, 0.35],
  ] as Array<[number, number, number, number]>,

  // ── Tarifa ISR ANUAL 2026 — Art. 152 LISR, Anexo 8 RMF 2026 (DOF 28-dic-2025) ──
  isrTarifaAnual: [
    [0.01, 10135.11, 0.0, 0.0192],
    [10135.12, 86022.11, 194.59, 0.064],
    [86022.12, 151176.19, 5051.37, 0.1088],
    [151176.2, 175735.66, 12140.13, 0.16],
    [175735.67, 210403.69, 16069.64, 0.1792],
    [210403.7, 424353.97, 22282.14, 0.2136],
    [424353.98, 668840.14, 67981.92, 0.2352],
    [668840.15, 1276925.98, 125485.07, 0.3],
    [1276925.99, 1702567.97, 307910.81, 0.32],
    [1702567.98, 5107703.92, 444116.23, 0.34],
    [5107703.93, Infinity, 1601862.46, 0.35],
  ] as Array<[number, number, number, number]>,

  // ── Subsidio para el empleo 2026 — Decreto DOF 31-dic-2025 (vigente 01-ene-2026) ──
  // 15.02% de la UMA mensual (transitorio enero: 15.59% de la UMA 2025 = $536.21).
  subsidioEmpleo: {
    montoMensual: 536.22,        // febrero–diciembre 2026 ($536.21 en enero)
    topeIngresoMensual: 11492.66, // ingreso base mensual máximo para tener derecho (subió de $10,171)
  },

  // ── Cuotas IMSS 2026 — LSS Arts. 25, 106, 107, 147, 168, 211 + reforma pensiones 2020 ──
  // Verificado contra sdv.com.mx/recursos/tablas-imss-2026 y contadormx.com (2026-06-10).
  imss: {
    topeSbcUmas: 25,             // tope del SBC: 25 UMA diarias (LSS Art. 28)
    obrero: {
      // % sobre SBC, salvo indicación
      eymExcedente: 0.004,       // enfermedad y maternidad, excedente del SBC sobre 3 UMA (LSS 106-II)
      eymPrestacionesDinero: 0.0025, // prestaciones en dinero (LSS 107)
      gastosMedicosPensionados: 0.00375, // (LSS 25)
      invalidezVida: 0.00625,    // (LSS 147)
      cesantiaVejez: 0.01125,    // CEAV — fija, sin cambios en 2026 (LSS 168)
      totalSinExcedente: 0.02375, // 0.25% + 0.375% + 0.625% + 1.125% (sin el excedente >3 UMA)
    },
    patron: {
      eymCuotaFijaUma: 0.204,    // 20.40% de la UMA mensual por trabajador (LSS 106-I)
      eymExcedente: 0.011,       // sobre el excedente del SBC de 3 UMA (LSS 106-II)
      eymPrestacionesDinero: 0.007,
      gastosMedicosPensionados: 0.0105,
      invalidezVida: 0.0175,
      guarderias: 0.01,          // (LSS 211)
      retiro: 0.02,              // SAR (LSS 168-I)
      // CEAV patronal 2026 — tabla progresiva por nivel de SBC (reforma 2020; sube cada año hasta 2030).
      // Verificada contra contadormx y elcontribuyente.mx (2026-06-10). [sbcHastaUmas, tasa]
      // El primer renglón aplica a SBC = 1 salario mínimo.
      ceavTabla2026: [
        { hastaUmas: 1.0, tasa: 0.0315, nota: '1.00 SM' },
        { hastaUmas: 1.5, tasa: 0.03676 },
        { hastaUmas: 2.0, tasa: 0.04851 },
        { hastaUmas: 2.5, tasa: 0.05556 },
        { hastaUmas: 3.0, tasa: 0.06026 },
        { hastaUmas: 3.5, tasa: 0.06361 },
        { hastaUmas: 4.0, tasa: 0.06613 },
        { hastaUmas: Infinity, tasa: 0.07513 }, // 4.01 UMA en adelante
      ],
      riesgoTrabajoPrimaMinima: 0.005,  // prima mínima RT (LSS 74)
      riesgoTrabajoPrimaMaxima: 0.15,   // prima máxima RT
      riesgoTrabajoClaseI: 0.0054355,   // prima media clase I (referencial, Reglamento LSS)
    },
    infonavitPatron: 0.05,       // aportación patronal INFONAVIT: 5% del SBC (Ley INFONAVIT Art. 29)
  },

  // ── Prima de riesgo de trabajo — fórmula de siniestralidad (LSS Art. 72, declaración anual febrero) ──
  // Prima = [(S/365) + V × (I + D)] × (F/N) + M
  primaRiesgoTrabajo: {
    V: 28,        // años de duración promedio de vida activa
    F: 2.3,       // factor de prima
    M: 0.005,     // prima mínima de riesgo (0.5%)
    primaMaxima: 0.15,
    variacionMaximaAnual: 0.01, // la prima no puede subir/bajar más de 1 punto porcentual por año (LSS 74)
  },

  // ── ISN (Impuesto Sobre Nóminas) 2026 por estado — leyes de hacienda estatales ──
  // Verificado contra aprendo.nominax.com (tabla 2026) + tress.com.mx, 2026-06-10.
  // Cambios 2026: Chihuahua 3→4%, Chiapas/Colima 2→3%, BCS/Morelos 2.5→3%, Yucatán 3→3.75%.
  isnPorEstado: {
    Aguascalientes: 0.025, 'Baja California': 0.0425, 'Baja California Sur': 0.03,
    Campeche: 0.03, Chiapas: 0.03, Chihuahua: 0.04, CDMX: 0.04, Coahuila: 0.02,
    Colima: 0.03, Durango: 0.03, 'Estado de México': 0.03, Guanajuato: 0.03,
    Guerrero: 0.03, Hidalgo: 0.03, Jalisco: 0.03, Michoacán: 0.03, Morelos: 0.03,
    Nayarit: 0.03, 'Nuevo León': 0.04, Oaxaca: 0.03, Puebla: 0.03, Querétaro: 0.03,
    'Quintana Roo': 0.03, 'San Luis Potosí': 0.03, Sinaloa: 0.03, Sonora: 0.03,
    Tabasco: 0.03, Tamaulipas: 0.04, Tlaxcala: 0.03, Veracruz: 0.03,
    Yucatán: 0.0375, Zacatecas: 0.035,
  } as Record<string, number>,

  // ── RESICO Personas Físicas — LISR Art. 113-E (tasas de ley, sin cambios 2026) ──
  resicoPf: {
    topeIngresosAnual: 3500000,
    retencionPersonaMoral: 0.0125, // retención de ISR cuando facturás a persona moral
    // tabla mensual: [ingreso mensual hasta, tasa sobre ingreso total cobrado]
    tablaMensual: [
      [25000, 0.01],
      [50000, 0.011],
      [83333.33, 0.015],
      [208333.33, 0.02],
      [3500000 / 12, 0.025], // 291,666.67
    ] as Array<[number, number]>,
  },

  // ── IVA — LIVA (sin cambios 2026) ──
  iva: {
    general: 0.16,
    frontera: 0.08,   // estímulo región fronteriza norte/sur
    tasaCero: 0,      // alimentos básicos, medicinas, libros…
  },

  // ── Prestaciones laborales — LFT ──
  lft: {
    aguinaldoDiasMinimo: 15,        // LFT Art. 87 (pagar antes del 20 de diciembre)
    primaVacacional: 0.25,          // LFT Art. 80 (mínimo 25% sobre salario de días de vacaciones)
    primaDominical: 0.25,           // LFT Art. 71 (25% extra por trabajar domingo como día normal)
    descansoLaboradoExtra: 2.0,     // LFT Art. 73: día de descanso trabajado = salario DOBLE adicional (total 3x)
    festivoLaboradoExtra: 2.0,      // LFT Art. 75: festivo obligatorio trabajado = salario doble adicional (total 3x)
    // Vacaciones dignas (reforma 2023, LFT Art. 76): 12 días el 1er año, +2 por año hasta 20 (año 5),
    // después +2 por cada 5 años de servicio.
    vacacionesPorAnio: [12, 14, 16, 18, 20] as number[], // años 1-5; 6-10: 22; 11-15: 24; 16-20: 26…
    vacacionesIncrementoQuinquenal: 2,
    horasExtras: {
      doblesMaxSemanal: 9,          // primeras 9 h/semana al 200% (LFT 66-67)
      tasaDoble: 2.0,
      tasaTriple: 3.0,              // a partir de la 10ª hora (LFT 68)
    },
    primaAntiguedad: {
      diasPorAnio: 12,              // LFT Art. 162
      topeSalarioVecesSm: 2,        // salario base topado a 2× salario mínimo (LFT Art. 486)
    },
    indemnizacion: {
      mesesConstitucionales: 3,     // 3 meses de salario integrado (LFT Art. 48/50)
      diasPorAnio20: 20,            // 20 días por año (despido injustificado, LFT Art. 50)
    },
  },

  // ── Exenciones de ISR sobre ingresos laborales — LISR Art. 93 (en UMA) ──
  exencionesIsrUmas: {
    aguinaldo: 30,                  // 30 UMA diarias (2026: $3,519.30)
    primaVacacional: 15,            // 15 UMA diarias ($1,759.65)
    ptu: 15,                        // 15 UMA diarias
    separacionPorAnio: 90,          // 90 UMA por año de servicio (prima antigüedad/liquidación), LISR 93-XIII
    horasExtrasPct: 0.5,            // 50% exento para >1 SM, con tope de 5 UMA por semana
    horasExtrasTopeUmasSemana: 5,
  },

  // ── Incapacidades y subsidios IMSS — LSS ──
  incapacidades: {
    enfermedadGeneral: {
      porcentajeSbc: 0.6,           // 60% del SBC (LSS Art. 98)
      desdeDia: 4,                  // se paga a partir del 4° día
      maxSemanas: 52,               // prorrogable 26 semanas más (LSS 96)
      prorrogaSemanas: 26,
    },
    riesgoTrabajo: { porcentajeSbc: 1.0, desdeDia: 1 }, // 100% del SBC desde el día 1 (LSS Art. 58)
    maternidad: { porcentajeSbc: 1.0, dias: 84 },       // 100% del SBC, 84 días (LSS Art. 101)
    paternidadDiasLft: 5,           // LFT Art. 132-XXVII bis
  },

  // ── Pensión Mínima / Garantizada Ley 97 (RCV) — LSS Art. 170, reforma DOF 16-dic-2020 ──
  // La reforma 2020 reemplazó el monto único por una tabla por rango de SBC (en UMA), edad
  // (60-65) y semanas cotizadas. El requisito de semanas sube 25/año desde 750 (2021) hasta
  // 1.000 en 2031; en 2026 son 875. El monto se actualiza por INPC (+3,69% en 2026) y va de
  // ~$3.500 a ~$10.600 mensuales (promedio del sistema ~$6.600). Verificado vs CONSAR/IMSS y
  // AMCP (montos 2026) el 2026-06-22. Cuando el SBC promedio queda por debajo del mínimo de la
  // tabla, igual se garantiza el piso si se cumplen semanas+edad.
  pmgLey97: {
    semanasRequeridas2026: 875,
    incrementoAnualSemanas: 25,
    semanasTope: 1000,
    anioTope: 2031,
    edadCesantia: 60,        // cesantía en edad avanzada (con factor de edad)
    edadVejez: 65,           // vejez (100%)
    montoMin: 3500,          // piso de la tabla art. 170 (2026)
    montoMax: 10600,         // techo de la tabla art. 170 (2026)
    montoPromedioSistema: 6600,
    inpc2026: 0.0369,        // actualización INPC aplicada en 2026
  },

  // ── Pensión por invalidez (Ley 97) — LSS Art. 141 ──
  pensionInvalidez: {
    porcentajeSalarioPromedio: 0.35,  // 35% del salario promedio de las últimas 500 semanas (actualizado)
    semanasRequeridas: 250,           // o 150 si la invalidez es ≥75%
    semanasRequeridasInvalidez75: 150,
    asignacionConyuge: 0.15,          // asignaciones familiares (LSS 138)
    asignacionHijo: 0.1,
    asignacionAscendiente: 0.1,
    ayudaAsistencial: 0.15,           // si no tiene dependientes
  },

  // ── Retiro parcial de AFORE por desempleo — LSS Art. 191, reglas CONSAR ──
  // Verificado contra consar.gob.mx / gob.mx/consar (2026-06-10).
  aforeDesempleo: {
    diasDesempleoMinimo: 46,
    aniosEntreRetiros: 5,
    modalidadA: {                    // cuenta con ≥3 años y ≥2 años cotizados
      diasSbc: 30,                   // 30 días del último SBC…
      topeVecesSmMensual: 10,        // …con tope de 10 salarios mínimos mensuales
    },
    modalidadB: {                    // cuenta con ≥5 años: lo MENOR entre…
      diasSbc: 90,                   // 90 días del SBC promedio de las últimas 250 semanas
      porcentajeSaldoRcv: 0.115,     // y 11.5% del saldo de la subcuenta RCV
    },
    // El retiro descuenta semanas cotizadas en proporción al monto retirado (reintegrables).
  },

  // ── Pensión IMSS Ley 73 (cesantía/vejez) — LSS 1973 Art. 167 ──
  // Tabla legal fija (no cambia por año): grupo de salario en veces el SM/UMA,
  // % de cuantía básica anual y % de incremento anual por cada 52 semanas >500.
  // Verificada renglón por renglón (2026-06-10).
  ley73: {
    semanasMinimas: 500,
    topeSalarioUmas: 25,
    // [salarioHastaVeces, cuantiaBasicaPct, incrementoAnualPct]
    tablaArt167: [
      [1.0, 0.8, 0.00563],
      [1.25, 0.7711, 0.00814],
      [1.5, 0.5818, 0.01178],
      [1.75, 0.4923, 0.0143],
      [2.0, 0.4267, 0.01615],
      [2.25, 0.3765, 0.01756],
      [2.5, 0.3368, 0.01868],
      [2.75, 0.3048, 0.01958],
      [3.0, 0.2783, 0.02033],
      [3.25, 0.256, 0.02096],
      [3.5, 0.237, 0.02149],
      [3.75, 0.2207, 0.02195],
      [4.0, 0.2065, 0.02235],
      [4.25, 0.1939, 0.02271],
      [4.5, 0.1829, 0.02302],
      [4.75, 0.173, 0.0233],
      [5.0, 0.1641, 0.02355],
      [5.25, 0.1561, 0.02377],
      [5.5, 0.1488, 0.02398],
      [5.75, 0.1422, 0.02416],
      [6.0, 0.1362, 0.02433],
      [Infinity, 0.13, 0.0245],
    ] as Array<[number, number, number]>,
    // Factor por edad de retiro en cesantía (LSS-73 Art. 171); vejez (65) = 100%.
    factorEdad: { 60: 0.75, 61: 0.8, 62: 0.85, 63: 0.9, 64: 0.95, 65: 1.0 } as Record<number, number>,
    asignaciones: {
      esposa: 0.15,                 // esposa/concubina (LSS-73 Art. 164)
      hijo: 0.1,                    // por hijo <16 (o estudiante hasta 25)
      ascendiente: 0.1,
      ayudaAsistencial: 0.15,       // si no hay dependientes
    },
  },

  // ── ISR por arrendamiento (federal) — LISR Art. 115 ──
  arrendamiento: {
    deduccionCiega: 0.35,           // 35% de deducción opcional sin comprobantes (+ predial pagado)
    retencionPersonaMoral: 0.1,     // si rentás a persona moral, te retiene 10%
  },

  // ── ISR por enajenación de casa habitación — LISR Art. 93 fracc. XIX ──
  ventaCasaHabitacion: {
    exencionUdis: 700000,           // exento hasta 700.000 UDIS si no usaste la exención en 3 años
    aniosEntreExenciones: 3,
    valorUdi: 8.810483,             // Banxico SIE SP68257, 2026-08-31 (la UDI cambia a diario)
    udiDataAsOf: '2026-08-31',
  },

  // ── ISR por ganancia en bolsa (acciones) — LISR Art. 129 ──
  bolsaIsrGanancia: 0.1,            // 10% definitivo sobre la ganancia neta del ejercicio

  // ── Deducciones personales — LISR Art. 151 ──
  deduccionesPersonales: {
    topeUmasAnuales: 5,             // tope global: 5 UMA anuales (2026: $213,973.20)…
    topePorcentajeIngresos: 0.15,   // …o 15% de los ingresos totales, lo que resulte MENOR
    // Colegiaturas (decreto de estímulo fiscal, fuera del tope global) — montos anuales por alumno.
    // Verificado contra sat.gob.mx/minisitio/DeduccionesPersonales/colegiaturas.html (2026-06-10).
    colegiaturas: {
      preescolar: 14200,
      primaria: 12900,
      secundaria: 19900,
      profesionalTecnico: 17100,
      bachillerato: 24500,
    },
  },

  // ── Pensiones y programas Bienestar 2026 — programasparaelbienestar.gob.mx (2026-06-10) ──
  bienestar: {
    adultosMayoresBimestral: 6400,    // 65+ años (+$200 vs 2025)
    mujeres60a64Bimestral: 3100,      // Pensión Mujeres Bienestar
    discapacidadBimestral: 3300,
    madresTrabajadorasBimestral: 1650,
  },

  // ── Pasaporte mexicano 2026 — derechos SRE (DOF derechos 2026; verificado 2026-06-10) ──
  pasaporte: {
    anios3: 1750,
    anios6: 2380,
    anios10: 4120,                   // solo mayores de 18
    descuentoVulnerable: 0.5,        // 60+ años, discapacidad, trabajadores agrícolas a Canadá
    recargoEmergencia: 0.3,          // trámite de emergencia: +30%
    // El de 1 año aplica solo a menores de 3 años (monto no incluido: verificar en SRE al construir).
  },

  moneda: 'MXN',
  simbolo: '$',
} as const;

/** ISR mensual 2026 (Art. 96 LISR, Anexo 8 RMF 2026) a partir de la base gravable mensual. */
export function isrMensual2026(baseGravable: number): number {
  return aplicarTarifa(baseGravable, MEXICO_2026.isrTarifaMensual);
}

/** ISR anual 2026 (Art. 152 LISR, Anexo 8 RMF 2026) a partir de la base gravable anual. */
export function isrAnual2026(baseGravable: number): number {
  return aplicarTarifa(baseGravable, MEXICO_2026.isrTarifaAnual);
}

/** ISR quincenal 2026: tarifa mensual proporcionada a quincena (15.2/30.4 = ÷2).
 *  El Anexo 8 publica la tarifa quincenal oficial con la misma proporción (difiere solo en centavos de redondeo). */
export function isrQuincenal2026(baseGravable: number): number {
  return aplicarTarifa(baseGravable * 2, MEXICO_2026.isrTarifaMensual) / 2;
}

function aplicarTarifa(base: number, tarifa: ReadonlyArray<readonly [number, number, number, number]>): number {
  if (!Number.isFinite(base) || base <= 0) return 0;
  for (const [limInf, limSup, cuotaFija, tasa] of tarifa) {
    if (base >= limInf && base <= limSup) {
      return Math.round((cuotaFija + (base - limInf) * tasa) * 100) / 100;
    }
  }
  const last = tarifa[tarifa.length - 1];
  return Math.round((last[2] + (base - last[0]) * last[3]) * 100) / 100;
}

/** Subsidio para el empleo mensual 2026 (decreto DOF 31-dic-2025): monto fijo si el ingreso no supera el tope. */
export function subsidioEmpleoMensual2026(ingresoMensual: number): number {
  if (!Number.isFinite(ingresoMensual) || ingresoMensual <= 0) return 0;
  return ingresoMensual <= MEXICO_2026.subsidioEmpleo.topeIngresoMensual
    ? MEXICO_2026.subsidioEmpleo.montoMensual
    : 0;
}

/** Cuota obrera IMSS mensual sobre un SBC mensual (con tope 25 UMA y excedente >3 UMA). */
export function cuotaImssObreroMensual(sbcMensual: number): number {
  if (!Number.isFinite(sbcMensual) || sbcMensual <= 0) return 0;
  const { uma, imss } = MEXICO_2026;
  const tope = uma.diaria * imss.topeSbcUmas * MEXICO_2026.salarioMinimo.factorMensual;
  const sbc = Math.min(sbcMensual, tope);
  const tresUmaMensual = uma.diaria * 3 * MEXICO_2026.salarioMinimo.factorMensual;
  const excedente = Math.max(0, sbc - tresUmaMensual);
  const cuota = sbc * imss.obrero.totalSinExcedente + excedente * imss.obrero.eymExcedente;
  return Math.round(cuota * 100) / 100;
}

/** Tasa CEAV patronal 2026 según el SBC diario (tabla reforma de pensiones). */
export function tasaCeavPatron2026(sbcDiario: number): number {
  const { uma, salarioMinimo, imss } = MEXICO_2026;
  if (!Number.isFinite(sbcDiario) || sbcDiario <= 0) return 0;
  // El primer renglón aplica a quien gana exactamente 1 salario mínimo.
  if (sbcDiario <= salarioMinimo.generalDiario) return imss.patron.ceavTabla2026[0].tasa;
  const enUmas = sbcDiario / uma.diaria;
  for (const fila of imss.patron.ceavTabla2026) {
    if (enUmas <= fila.hastaUmas) return fila.tasa;
  }
  return imss.patron.ceavTabla2026[imss.patron.ceavTabla2026.length - 1].tasa;
}

/** Salario diario integrado mínimo legal (factor de integración) según años de antigüedad cumplidos. */
export function factorIntegracion(aniosAntiguedad: number): number {
  const { lft } = MEXICO_2026;
  const anios = Math.max(1, Math.floor(Number.isFinite(aniosAntiguedad) ? aniosAntiguedad : 1));
  let diasVacaciones: number;
  if (anios <= lft.vacacionesPorAnio.length) {
    diasVacaciones = lft.vacacionesPorAnio[anios - 1];
  } else {
    // 6-10: 22, 11-15: 24, 16-20: 26…
    diasVacaciones = 20 + lft.vacacionesIncrementoQuinquenal * Math.ceil((anios - 5) / 5);
  }
  const factor = (365 + lft.aguinaldoDiasMinimo + diasVacaciones * lft.primaVacacional) / 365;
  return Math.round(factor * 10000) / 10000;
}

/** Formatea un monto en pesos mexicanos (es-MX). */
export function fmtMXN(n: number): string {
  return '$' + new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// Agregados jul-2026 (fábrica calcs MX) — cada bloque verificado 2026-07-18
// contra la fuente citada en su comentario.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Jóvenes Construyendo el Futuro 2026 — programasparaelbienestar.gob.mx
 * ("Jóvenes Construyendo el Futuro elevará su apoyo mensual a 9,582 pesos en 2026").
 * El apoyo está LIGADO al salario mínimo general: subió 13% igual que el SM 2026.
 * Incluye seguro médico IMSS (enfermedades, maternidad y riesgos de trabajo).
 */
export const JCF_2026 = {
  apoyoMensual: 9582.47,     // 2026 (en 2025 era $8,480)
  apoyoMensual2025: 8480,
  duracionMaxMeses: 12,      // capacitación de hasta 12 meses, apoyo por mes activo
  edadMin: 18,
  edadMax: 29,
} as const;

/**
 * Reforma de jornada laboral 40 horas — reforma constitucional publicada en el
 * DOF el 03-mar-2026 y adecuaciones a la LFT publicadas el 01-may-2026.
 * Reducción GRADUAL desde el 1 de enero del año indicado. EN 2026 SIGUEN LAS 48 h
 * (año de transición); las 40 h recién rigen en 2030. Fuente: STPS, preguntas
 * frecuentes "Reducción de la jornada laboral a 40 horas" (gob.mx/stps).
 */
export const JORNADA_40H_CALENDARIO: Record<number, number> = {
  2026: 48,
  2027: 46,
  2028: 44,
  2029: 42,
  2030: 40,
};

/**
 * Comisiones AFORE 2026 — CONSAR, Junta de Gobierno (comunicado nov-2025,
 * gob.mx/consar "…autoriza comisiones de las Afore para 2026").
 * Nueve afores cobran 0.54% anual sobre saldo administrado; PENSIONISSSTE 0.52%.
 * Promedio del sistema: 0.538% (baja desde 0.547% en 2025).
 */
export const AFORE_COMISIONES_2026 = {
  promedioSistema: 0.00538,
  pensionissste: 0.0052,
  // Azteca, Banamex, Coppel, Inbursa, Invercap, Principal, Profuturo, SURA y XXI Banorte
  restoAfores: 0.0054,
} as const;

/**
 * Gas LP — precio máximo CNE para CDMX, semana del 12 al 18 de julio de 2026
 * (gob.mx/cne "Precios máximos aplicables de Gas LP"; la CNE lo publica CADA SEMANA,
 * por eso las calcs lo exponen como campo editable con este default).
 * Los tanques estacionarios se cargan como máximo a ~85% de su capacidad por seguridad.
 */
export const GAS_LP_CDMX_JUL_2026 = {
  precioKg: 19.56,
  precioLitro: 10.56,
  llenadoMaxEstacionario: 0.85,
  dataAsOf: '2026-07-12',
} as const;

/**
 * Gasolina magna (regular) — promedio nacional ~$23.80/litro en julio 2026
 * (seguimiento diario de prensa sobre datos CRE/PROFECO; default editable).
 */
export const GASOLINA_MAGNA_LITRO_JUL_2026 = 23.8;

/**
 * Préstamos personales ISSSTE 2026 — esqueleto verificado en gob.mx/issste
 * (comunicado "Aprueba Junta Directiva del ISSSTE incremento en el Programa Anual
 * de Préstamos Personales 2026"): desde 2026 NO hay sorteos (asignación directa
 * semanal, cada lunes, vía SIAEPP/ASISSSTE), montos de $30,000 a ~$275,000 según
 * modalidad y el descuento quincenal NO puede exceder el 50% del sueldo básico o
 * de la pensión. Tasas por modalidad (ordinario ~10%) = referenciales editables.
 */
export const PRESTAMOS_ISSSTE_2026 = {
  montoMinPrograma: 30000,
  montoMaxPrograma: 275000,
  topeDescuentoSueldo: 0.5,
  tasaOrdinarioAnualRef: 0.10,
  quincenasPorAnio: 24,
} as const;
