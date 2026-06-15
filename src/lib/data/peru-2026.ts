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
