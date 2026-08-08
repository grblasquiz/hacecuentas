/**
 * Datos fiscales, laborales y de prestaciones de ESPAÑA 2026 — tabla maestra única.
 * Fuentes oficiales (verificado 2026-07-18):
 * - SMI 2026: Real Decreto 126/2026, de 18 de febrero (BOE-A-2026-3815) → 1.221 €/mes × 14 pagas = 17.094 €/año (+3,1% vs 1.184 € de 2025).
 * - IPREM 2026: congelado desde 2023 (sin nuevos PGE) → 600 €/mes; 7.200 €/año (12 pagas) / 8.400 €/año (14 pagas); 20 €/día.
 * - Revalorización pensiones 2026: +2,7% (IPC medio dic-nov), Ley 21/2021. Mínimas suben más (hasta +11,4% con cargas).
 * - Pensión de viudedad: 52% base reguladora (general), 60% (≥65 sin otras rentas ni trabajo), 70% (con cargas familiares + límites de renta). Art. 31 Decreto 3158/1966 y desarrollo.
 * - Incapacidad permanente: total 55% BR (75% cualificada), absoluta 100% BR, gran invalidez 100% BR + complemento. LGSS RD-Leg 8/2015.
 * - Complemento brecha de género 2026: 36,90 €/mes por hijo (14 pagas = 516,60 €/año), máximo 4 hijos. Art. 60 LGSS.
 * - Retención IRPF de autónomos profesionales: 15% general, 7% nuevos (alta + 2 años). Art. 95 RIRPF.
 * - PVPC (precio regulado de la luz) 2026: media anual del término de energía ≈ 0,128 €/kWh; precio "todo incluido" con peajes e impuestos ≈ 0,15 €/kWh.
 * - Bono Cultural Joven 2026: 400 € para nacidos en 2008. Plazo 22-jun a 31-oct-2026. Ministerio de Cultura.
 * - ITV 2026: tarifas reguladas por CCAA (Madrid y Murcia libres) + tasa DGT 4,18 €.
 * Moneda: Euro (EUR, "€"). Formato es-ES (miles con punto, decimales con coma).
 */

/** Vigencia del dato (YYYY-MM-DD) — usada por el sello de frescura (src/lib/data-freshness.ts). */
export const DATA_AS_OF = '2026-07-18';

/** Formato monetario España (es-ES): 1.234,56 €. */
export function fmtEUR(n: number, decimales = 2): string {
  return n.toLocaleString('es-ES', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }) + ' €';
}

/** Formato número es-ES sin símbolo. */
export function fmtNum(n: number, decimales = 2): string {
  return n.toLocaleString('es-ES', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

// ─────────────────────────────────────────────────────────────
// SMI — Salario Mínimo Interprofesional 2026
// RD 126/2026 (BOE-A-2026-3815). 1.221 €/mes en 14 pagas.
// ─────────────────────────────────────────────────────────────
export const SMI_2026 = {
  mensual14: 1221,            // €/mes en 14 pagas
  anual: 17094,              // 1.221 × 14
  mensual12: 1424.5,         // 17.094 ÷ 12 (prorrateo en 12 pagas)
  diario: 40.7,              // referencia empleadas de hogar/eventuales (17.094 ÷ 420)
  horaEmpleadaHogar: 9.55,   // €/hora efectiva empleadas de hogar (incluye prorrateo pagas)
  anteriorMensual14: 1184,   // 2025
  subidaPct: 3.1,            // % subida 2026 vs 2025
  // Cotización del trabajador a la Seguridad Social (régimen general, contrato indefinido):
  ssTrabajadorPct: 6.35,     // 4,70% contingencias comunes + 1,55% desempleo + 0,10% FP
  meiTrabajadorPct: 0.15,    // Mecanismo de Equidad Intergeneracional (a cargo del trabajador) 2026
  jornadaHorasSemana: 40,    // jornada máxima legal (media anual) vigente en 2026
  horasMes: 173.33,          // 40 × 52 ÷ 12
};

// ─────────────────────────────────────────────────────────────
// IPREM 2026 (congelado desde 2023)
// ─────────────────────────────────────────────────────────────
export const IPREM_2026 = {
  mensual: 600,              // €/mes
  anual12: 7200,             // 12 pagas (sin extras)
  anual14: 8400,             // 14 pagas (con extras) — referencia por defecto salvo mención expresa
  diario: 20,                // €/día
  // Umbrales frecuentes expresados en "veces IPREM" (anual, 14 pagas salvo indicación):
  umbrales: [
    { veces: 1, etiqueta: '1 vez el IPREM' },
    { veces: 1.5, etiqueta: '1,5 veces el IPREM' },
    { veces: 2, etiqueta: '2 veces el IPREM' },
    { veces: 2.5, etiqueta: '2,5 veces el IPREM' },
    { veces: 3, etiqueta: '3 veces el IPREM' },
  ],
};

// ─────────────────────────────────────────────────────────────
// Pensiones 2026 — revalorización y viudedad
// ─────────────────────────────────────────────────────────────
export const PENSIONES_2026 = {
  revalorizacionPct: 2.7,    // subida general contributivas 2026 (IPC medio dic-nov, Ley 21/2021)
  maximaMensual: 3355.72,    // pensión máxima 2026 (referencial: 3.267,60 × 1,027), 14 pagas
  maximaAnual: 46980.08,
  // Porcentajes de la base reguladora en viudedad:
  viudedad: {
    general: 52,             // % general
    mayor65SinRentas: 60,    // % beneficiario ≥65 sin otra pensión ni rentas de trabajo
    cargasFamiliares: 70,    // % con cargas familiares, pensión = fuente principal y límites de renta
  },
  // Pensiones MÍNIMAS de viudedad 2026 (14 pagas):
  viudedadMinima2026: {
    conCargas: 1256.6,       // €/mes (17.592,40 €/año)
    titular65: 936.2,        // €/mes (13.106,80 €/año)
    titular60a64: 904.23,    // €/mes (12.659,20 €/año)
    titularMenor60: 709.4,   // €/mes (9.931,60 €/año)
  },
  // Límite de rentas (distintas de la pensión) para conservar el complemento a mínimos:
  limiteRentasComplementoMinimos: 9442, // €/año (sin cónyuge/cargas)
};

// ─────────────────────────────────────────────────────────────
// Incapacidad permanente 2026 — % de la base reguladora por grado
// ─────────────────────────────────────────────────────────────
export const INCAPACIDAD_PERMANENTE_2026 = {
  parcial: {
    pct: 0,                  // no es pensión mensual: indemnización a tanto alzado
    indemnizacionMensualidades: 24, // 24 mensualidades de la base reguladora
  },
  total: {
    pct: 55,                 // % base reguladora
    pctCualificada: 75,      // ≥55 años, sin trabajo y difícil reinserción (+20 pp)
  },
  absoluta: {
    pct: 100,                // % base reguladora (pensión exenta de IRPF)
  },
  granInvalidez: {
    pct: 100,                // % base reguladora
    complementoMinPctBR: 45, // el complemento de tercera persona no baja del 45% de la BR
  },
};

// ─────────────────────────────────────────────────────────────
// Subida salarial de empleados públicos (funcionarios) — acuerdo 2025-2028
// ─────────────────────────────────────────────────────────────
export const FUNCIONARIOS_SUBIDA = {
  pct2025: 2.5,              // % consolidable, retroactivo a 1-ene-2025
  pct2026Fijo: 1.5,          // % consolidable 2026
  pct2026Variable: 0.5,      // % adicional si IPC 2026 ≥ 1,5% (cobro retroactivo 1T-2027)
  ipcUmbralVariable: 1.5,    // umbral de IPC 2026 para activar el 0,5%
};

// ─────────────────────────────────────────────────────────────
// Retención de IRPF en factura de autónomos profesionales
// ─────────────────────────────────────────────────────────────
export const RETENCION_AUTONOMO = {
  general: 15,               // % general (actividades profesionales, sección 2ª/3ª IAE)
  nuevos: 7,                 // % reducido: año de alta + 2 siguientes
  modulos: 1,                // % estimación objetiva (módulos)
  ivaGeneral: 21,            // % IVA repercutido general (referencia, no se retiene)
};

// ─────────────────────────────────────────────────────────────
// Complemento para la reducción de la brecha de género 2026
// ─────────────────────────────────────────────────────────────
export const BRECHA_GENERO_2026 = {
  importeMensualPorHijo: 36.9, // €/mes por hijo (14 pagas)
  pagas: 14,
  importeAnualPorHijo: 516.6,  // 36,90 × 14
  maxHijos: 4,
};

// ─────────────────────────────────────────────────────────────
// PVPC — precio de la luz regulado 2026 (referencia para consumo eléctrico)
// ─────────────────────────────────────────────────────────────
export const LUZ_2026 = {
  pvpcTerminoEnergiaMedia: 0.128, // €/kWh (media anual término de energía)
  precioTodoIncluidoRef: 0.15,    // €/kWh estimado con peajes, cargos e IVA (default calculadoras)
};

// ─────────────────────────────────────────────────────────────
// Bono Cultural Joven 2026
// ─────────────────────────────────────────────────────────────
export const BONO_CULTURAL_2026 = {
  importe: 400,              // €
  anioNacimientoElegible: 2008, // cumplen 18 en 2026
  plazoInicio: '2026-06-22',
  plazoFin: '2026-10-31',
};

// ─────────────────────────────────────────────────────────────
// ITV 2026 — tarifas de referencia (reguladas por CCAA; Madrid y Murcia libres)
// Precios orientativos nacionales por combustible/cilindrada + tasa DGT.
// ─────────────────────────────────────────────────────────────
export const ITV_2026 = {
  tasaDGT: 4.18,             // €/tasa de tráfico (se suma a la tarifa de la estación)
  // Tarifas orientativas (con IVA) por tipo de vehículo:
  turismoGasolinaMenor1600: 33.28,
  turismoGasolinaMayor1600: 43.52,
  turismoDieselMenor1600: 38.39,
  turismoDieselMayor1600: 48.62,
  moto: 22.5,
  // Ajuste orientativo por CCAA (multiplicador sobre la tarifa de referencia):
  ccaaFactor: {
    andalucia: 0.85,         // de las más baratas
    extremadura: 0.85,
    baleares: 0.9,
    referencia: 1.0,         // media nacional regulada
    cataluna: 1.05,
    paisVasco: 1.2,          // de las más caras
    cantabria: 1.2,
  },
  // Madrid y Murcia: precio libre (no regulado) — la estación fija su tarifa.
};
