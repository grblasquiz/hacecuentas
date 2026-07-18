/**
 * Datos fiscales y laborales de PERÚ 2026 — tabla maestra única.
 * Fuentes: SUNAT, MTPE, EsSalud, BCRP. Verificado 2026-06-08.
 * - RMV: DS 006-2024-TR (S/ 1.130, vigente desde ene-2025, mantenida en 2026).
 * - UIT 2026: DS 301-2025-EF (S/ 5.500).
 * Moneda: Sol (PEN, "S/").
 */

/** Vigencia del dato (YYYY-MM-DD) — usada por el sello de frescura a nivel dato (src/lib/data-freshness.ts). */
export const DATA_AS_OF = '2026-06-08';

export const PERU_2026 = {
  anio: 2026,
  rmv: 1130,                 // Remuneración Mínima Vital (S/)
  uit: 5500,                 // Unidad Impositiva Tributaria
  igv: 0.18,                 // 16% IGV + 2% IPM (tasa general)
  igvMypeRestauranteHotel: 0.105, // tasa especial MYPE restaurantes/hoteles (desde 2026)
  asignacionFamiliar: 113,   // 10% de la RMV (trabajadores con hijos menores)
  essalud: 0.09,             // aporte del EMPLEADOR (no se descuenta de la boleta)
  onp: 0.13,                 // descuento de pensión ONP (sobre la remuneración)
  afp: {
    // AFP = aporte obligatorio al fondo (10%) + prima de seguro + comisión por flujo (varía por AFP).
    fondo: 0.10,
    primaSeguro: 0.0174,     // % sobre remuneración asegurable (con tope), aprox.
    comisionFlujo: {         // comisión sobre flujo (% del sueldo) por AFP — referencial 2026
      Habitat: 0.0147, Integra: 0.0155, Prima: 0.0160, Profuturo: 0.0169,
    },
    totalAprox: 0.125,       // total aproximado AFP (fondo + prima + comisión) ~12,5%
  },
  // Renta de 5ta categoría (trabajadores dependientes): deducción de 7 UIT y tramos progresivos.
  renta5ta: {
    deduccionUit: 7,         // 7 UIT exentas (S/ 38.500)
    tramos: [                // límite superior del tramo en UIT (acumulativo) y tasa marginal
      { hastaUit: 5, tasa: 0.08 },
      { hastaUit: 20, tasa: 0.14 },
      { hastaUit: 35, tasa: 0.17 },
      { hastaUit: 45, tasa: 0.20 },
      { hastaUit: Infinity, tasa: 0.30 },
    ],
  },
  gratificacion: {
    // Julio y diciembre: 1 sueldo completo cada una, libres de AFP/ONP.
    bonificacionExtraordinaria: 0.09, // 9% extra (lo que iría a EsSalud) — Ley 30334
  },
  // Impuesto predial municipal anual — Art. 11-13, TUO Ley de Tributación Municipal
  // (DS 156-2004-EF, base Decreto Legislativo 776). Escala progresiva acumulativa
  // sobre el autovalúo, en tramos de UIT. Mínimo = 0,6% de la UIT.
  predial: {
    tramos: [                // límite superior del tramo en UIT (acumulativo) y tasa marginal
      { hastaUit: 15, tasa: 0.002 },        // hasta 15 UIT (S/ 82.500): 0,2%
      { hastaUit: 60, tasa: 0.006 },        // de 15 a 60 UIT (S/ 82.500–330.000): 0,6%
      { hastaUit: Infinity, tasa: 0.01 },   // exceso de 60 UIT (> S/ 330.000): 1,0%
    ],
    minimoUit: 0.006,        // impuesto mínimo = 0,6% de la UIT (Art. 13)
    deduccionPensionistaUit: 50, // deducción de hasta 50 UIT del autovalúo (pensionista/adulto mayor, vivienda única) — Art. 19
  },
  moneda: 'PEN',
  simbolo: 'S/',
} as const;

/** Impuesto a la renta de 5ta categoría ANUAL a partir del ingreso bruto anual.
 *  Aplica la deducción de 7 UIT y los tramos progresivos. Devuelve el impuesto anual (S/). */
export function impuestoRenta5taAnual(ingresoBrutoAnual: number): number {
  const u = PERU_2026.uit;
  let base = Math.max(0, ingresoBrutoAnual - PERU_2026.renta5ta.deduccionUit * u);
  if (base <= 0) return 0;
  let impuesto = 0, anterior = 0;
  for (const t of PERU_2026.renta5ta.tramos) {
    const limite = t.hastaUit === Infinity ? Infinity : t.hastaUit * u;
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
 * Formatea un monto en soles con el formato legal peruano: punto para miles,
 * coma para decimales (Ley 23560) → "S/ 1.291,88", "S/ 60.000".
 * Se usa 'de-DE' a propósito: en Node/V8 el locale 'es-PE' emite formato estilo
 * US ("S/ 1,291.88"), que no coincide con la prosa de los JSONs de calcs-pe.
 */
export function fmtPEN(n: number): string {
  return 'S/ ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);
}

/** Como fmtPEN pero con 2 decimales fijos cuando el monto no es entero ("S/ 27,50" y no "S/ 27,5"). */
export function fmtPEN2(n: number): string {
  const r = Math.round(n * 100) / 100;
  const esEntero = Number.isInteger(r);
  return 'S/ ' + new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: esEntero ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(r);
}

// ============================================================================
// Bloque agregado 2026-07-18 — datos verificados para la tanda de calcs PE jul-2026
// ============================================================================

/** Multas electorales 2026 (Elecciones Generales: 1ra vuelta 12-abr-2026, 2da vuelta 7-jun-2026).
 *  Montos = % de la UIT 2026 (S/ 5.500) según clasificación de pobreza del distrito (INEI).
 *  Fuente: JNE — portal.jne.gob.pe (Multas). Verificado 2026-07-18. */
export const MULTAS_ELECTORALES_2026 = {
  omisionSufragio: {
    noPobre: 110,        // 2% UIT
    pobreNoExtremo: 55,  // 1% UIT
    pobreExtremo: 27.5,  // 0,5% UIT
  },
  miembroMesaAusente: 275, // 5% UIT — miembro de mesa designado que no asistió
} as const;

/** UIT histórica (SUNAT — indicestasas/uit.html). Cada valor fijado por D.S. del MEF. */
export const UIT_HISTORICO_PERU: Record<number, number> = {
  2015: 3850, 2016: 3950, 2017: 4050, 2018: 4150, 2019: 4200, 2020: 4300,
  2021: 4400, 2022: 4600, 2023: 4950, 2024: 5150, 2025: 5350, 2026: 5500,
};

/** Aguinaldo por Fiestas Patrias sector público 2026 — D.S. 128-2026-EF: S/ 300 en la planilla de julio.
 *  Requisitos: vínculo laboral al 30-jun-2026 y 3 meses de servicio; con menos de 3 meses se paga
 *  proporcional a los meses y días laborados (base 90 días). Los CAS NO lo reciben (Ley 32563). */
export const AGUINALDO_FIESTAS_PATRIAS_2026 = { monto: 300, baseDias: 90 } as const;

/** Construcción civil 2026 — convenio colectivo FTCCP-CAPECO homologado por R.M. 197-2025-TR,
 *  tablas vigentes del 1-ene al 31-dic-2026. Jornales básicos diarios y BUC por categoría. */
export const CONSTRUCCION_CIVIL_2026 = {
  jornal: { operario: 89.30, oficial: 69.75, peon: 62.80 },
  bucPct: { operario: 0.32, oficial: 0.30, peon: 0.30 },
  movilidadDia: 8.60,             // bonificación por movilidad acumulada, por día laborado
  escolaridadJornalesAnio: 30,    // asignación por escolaridad: 30 jornales básicos/año por hijo (30/360 por día)
} as const;

/** Deducción adicional de hasta 3 UIT (rentas de trabajo, SUNAT — ejercicio 2026):
 *  % deducible por tipo de gasto sustentado con comprobante electrónico vinculado al DNI. */
export const DEDUCCION_3UIT_2026 = {
  topeUit: 3, // 3 × 5.500 = S/ 16.500
  pct: {
    restaurantesHoteles: 0.15,
    alquiler: 0.30,
    medicosOdontologos: 0.30,
    otrosProfesionales: 0.30, // servicios de 4ta categoría (profesiones y oficios)
    essaludHogar: 1.00,       // aportes EsSalud de trabajadores del hogar
  },
} as const;

/** Envíos courier/postales (SUNAT — clasificación de envíos): FOB ≤ US$ 200 sin tributos;
 *  FOB > US$ 200 y ≤ US$ 2.000: Ad Valorem 4% + IGV 18% (16% IGV + 2% IPM). Más de US$ 2.000 → régimen general. */
export const COURIER_TRIBUTOS_PERU = {
  deMinimisUsd: 200,
  topeSimplificadoUsd: 2000,
  adValorem: 0.04,
  igv: 0.18,
} as const;

/** Subsidio por lactancia EsSalud: S/ 820 por cada hijo nacido (parto múltiple: se paga por cada uno). */
export const SUBSIDIO_LACTANCIA_2026 = 820;

/** Prácticas formativas (Ley 28518): subvención mínima = 1 RMV a jornada completa, proporcional a las horas.
 *  Jornada máxima: preprofesional 6 h/día o 30 h/sem; profesional 8 h/día o 48 h/sem.
 *  Además: media subvención adicional por cada 6 meses continuos. */
export const PRACTICAS_PERU_2026 = {
  jornadaMaxSemanal: { preprofesional: 30, profesional: 48 },
} as const;

/** Licencia de conducir A-I 2026 — tasas de evaluación y emisión (MTC / Municipalidad de Lima / Touring).
 *  Emisión: física S/ 14,70 (cód. 1602) · electrónica S/ 6,70 (cód. 1601). Lima-MML: conocimientos S/ 24,80 + manejo S/ 45.
 *  Touring (centros autorizados): pago único S/ 67,32 con 2 oportunidades por evaluación. */
export const BREVETE_PERU_2026 = {
  emisionFisica: 14.70,
  emisionElectronica: 6.70,
  conocimientosLima: 24.80,
  manejoLima: 45,
  touringPagoUnico: 67.32,
} as const;

/** Pasaporte electrónico (Migraciones): S/ 120,90 por persona, misma tasa a toda edad.
 *  Vigencia: mayores de edad 10 años (Ley 31678); 12-17 años: 5 años; menores de 12: 3 años. */
export const PASAPORTE_PERU_2026 = {
  tasa: 120.90,
  vigenciaAnios: { adulto: 10, de12a17: 5, menor12: 3 },
} as const;
