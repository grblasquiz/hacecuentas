// Datos oficiales Argentina 2026 — verificados jul-2026 (fuentes en cada bloque).
// Convención: cada export lleva fuente + fecha de verificación. NO inventar valores acá.

export const fmtARS = (v: number, dec = 0) =>
  '$' + v.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

// ── Compras del exterior (régimen vigente desde el Decreto 604/2026, BO 17-jul-2026) ──
// El decreto unificó courier y puerta a puerta: misma franquicia de US$400 FOB, 5 envíos/año,
// y derogó el arancel único del 50% sobre el excedente de los envíos postales.
// IMPORTANTE: la franquicia exime DERECHO DE IMPORTACIÓN y TASA DE ESTADÍSTICA, **no el IVA**.
// ARCA: los envíos dentro de la franquicia quedan "alcanzados únicamente por el impuesto al
// valor agregado e impuestos internos, de corresponder".
// Fuentes: Decreto 604/2026 (BO 17-jul-2026) · ARCA — Pequeños envíos courier (afip.gob.ar).
export const COURIER_2026 = {
  franquiciaUSD: 400,        // valor FOB exento de derecho de importación y tasa de estadística (NO de IVA)
  enviosPorAnio: 5,
  topeEnvioUSD: 3000,
  topeKg: 50,
  unidadesIgualesMax: 3,
  fuente: 'ARCA — régimen courier (Dto. 1065/2024 · RG 5631/25) + Decreto 604/2026',
} as const;

// IVA general de importación. Se aplica sobre TODO el valor, esté o no dentro de la franquicia.
export const IVA_IMPORTACION_2026 = 0.21;
// Tasa de estadística: solo sobre el excedente de la franquicia.
export const TASA_ESTADISTICA_2026 = 0.03;
// Derecho de importación sobre el excedente: NO es una alícuota única — depende de la posición
// arancelaria (AEC Mercosur, 0%–35%). 20% es el valor típico de bienes de consumo, editable.
// SIN VERIFICAR (28-07-2026): no hay una alícuota oficial única; el 20% es una referencia, no norma.
export const DERECHO_IMPORTACION_TIPICO_2026 = 0.20;

export const PUERTA_A_PUERTA_2026 = {
  franquiciaUSD: 400,        // Dto. 604/2026: equiparado al courier (antes US$50)
  enviosConFranquicia: 5,    // Dto. 604/2026: 5 por año calendario (antes 12)
  alicuotaExcedente: null,   // Dto. 604/2026 derogó el arancel único del 50%: rige el régimen general
  topeEnvioUSD: 3000,
  topeKg: 20,
  fuente: 'Decreto 604/2026 (BO 17-jul-2026) — Correo Argentino / ARCA, envíos postales internacionales',
} as const;

export const DOLAR_OFICIAL_REF = { venta: 1530, fecha: '2026-08-31' } as const; // referencia oficial, editable en cada calc

// ── Franquicia de equipaje de viajeros (ARCA/ex-AFIP, vigente 2026) ──
// Fuente: https://www.afip.gob.ar/viajeros/ayuda/franquicia.asp
export const FRANQUICIA_VIAJERO_2026 = {
  aereaMaritimaUSD: 500,
  terrestreFluvialUSD: 300,
  freeShopLlegadaUSD: 500,   // adicional, solo arribo aéreo/marítimo (y Puerto Iguazú)
  menores16Factor: 0.5,      // menores de 16: 50% de la franquicia
  alicuotaExcedente: 0.5,    // 50% sobre el excedente
} as const;

// ── Cuenta DNI — topes y descuentos AGOSTO 2026 (Banco Provincia) ──
// Fuente primaria: páginas y términos de cada promoción de Banco Provincia.
export interface RubroCuentaDni {
  label: string; pct: number; tope: number | null; periodo: 'semana' | 'mes' | 'finde';
  dias: string;
}
export const CUENTA_DNI_AGO_2026: Record<string, RubroCuentaDni> = {
  gastronomia:   { label: 'Gastronomía', pct: 25, tope: 8000, periodo: 'semana', dias: 'sábados y domingos' },
  carnicerias:   { label: 'Comercios de cercanía (incluye alimentos)', pct: 20, tope: 6000, periodo: 'semana', dias: 'lunes a viernes' },
  supermercados: { label: 'Supermercados adheridos', pct: 15, tope: 6000, periodo: 'semana', dias: 'martes y miércoles; compra mínima $30.000' },
  ferias:        { label: 'Ferias y mercados bonaerenses', pct: 40, tope: 6000, periodo: 'semana', dias: 'todos los días' },
  garrafas:      { label: 'Garrafas', pct: 40, tope: 18000, periodo: 'mes', dias: 'todos los días' },
  universidades: { label: 'Universidades, clubes y eventos', pct: 40, tope: 6000, periodo: 'semana', dias: 'todos los días' },
  ypfFull:       { label: 'Tiendas YPF Full', pct: 25, tope: 8000, periodo: 'semana', dias: 'sábados y domingos' },
  marcas:        { label: 'Comercios de temporada adheridos', pct: 30, tope: 15000, periodo: 'mes', dias: 'todos los días' },
  librerias:     { label: 'Librerías (textos escolares)', pct: 10, tope: null, periodo: 'semana', dias: 'lunes y martes' },
  farmacias:     { label: 'Farmacias y perfumerías', pct: 10, tope: null, periodo: 'semana', dias: 'miércoles y jueves' },
};

/** @deprecated Nombre histórico; conserva compatibilidad y apunta a agosto 2026. */
export const CUENTA_DNI_JUL_2026 = CUENTA_DNI_AGO_2026;

// ── Asignaciones ANSES agosto 2026 (Res. ANSES 233/2026, Anexos I y V) ──
// Fuente primaria: BORA, IF-2026-70639076 (SUAF) e IF-2026-70638768 (universales).
// Los importes oficiales se redondean al entero superior (art. 3 de la resolución).
export const ASIGNACIONES_ANSES_AGO_2026 = {
  periodo: '2026-08',
  fuente: 'Resolución ANSES 233/2026 — Anexos I y V',
  auhGeneral: 150_848,
  auhDiscapacidad: 491_173,
  pctRetenido: 0.2,
  ayudaEscolar: 55_672,
  suaf: {
    topeIgf: 6_184_406,
    topeIndividual: 3_092_203,
    tramos: [
      { limite: 1_167_863, tramo: 1, asignacion: 75_433 },
      { limite: 1_712_784, tramo: 2, asignacion: 50_884 },
      { limite: 1_977_464, tramo: 3, asignacion: 30_777 },
      { limite: 6_184_406, tramo: 4, asignacion: 15_881 },
    ],
  },
} as const;

/** @deprecated Nombre histórico; conserva compatibilidad y apunta a agosto 2026. */
export const AUH_JUL_2026 = {
  montoGeneral: ASIGNACIONES_ANSES_AGO_2026.auhGeneral,
  pctRetenido: ASIGNACIONES_ANSES_AGO_2026.pctRetenido,
  cobroMensual: ASIGNACIONES_ANSES_AGO_2026.auhGeneral * 0.8,
  retenidoMensual: ASIGNACIONES_ANSES_AGO_2026.auhGeneral * 0.2,
} as const;

// ── Préstamos personales Banco Nación (jul-2026) ──
// Fuente: BNA simulador + prensa (LM Neuquén 07-2026, Cronista). Editable en la calc.
export const BNA_PRESTAMO_2026 = {
  tnaClienteSueldo: 61,      // % TNA preferencial Nación Sueldo
  tnaNoCliente: 91,          // % TNA Nación Libre Destino (no clientes)
  plazoMaxMeses: 72,
  montoMax: 50000000,
  relacionCuotaIngreso: 0.3, // la cuota no puede superar el 30% del ingreso neto
} as const;

// ── Plan de pagos ARCA "Mis Facilidades" RG 5828/2026 (adhesión hasta 30-oct-2026) ──
// Fuente: ARCA misfacilidades RG-5828-2026 + iProfesional jul-2026.
export const MIS_FACILIDADES_RG5828 = {
  tasaMensualPct: 2.75,      // tasa de financiación mensual
  cuotaMinima: 50000,        // mínimo por cuota y por pago a cuenta
  planes: {
    micro:   { label: 'Micro/pequeña empresa y pequeños contribuyentes', pagoACuentaPct: 5,  cuotasMax: 18 },
    mediana: { label: 'Mediana empresa (tramos 1 y 2)',                  pagoACuentaPct: 10, cuotasMax: 15 },
    retenciones: { label: 'Retenciones y percepciones (micro/pequeña)',  pagoACuentaPct: 5,  cuotasMax: 9 },
  },
} as const;

// ── AySA — cuadro de aumentos 2026 (AMBA) ──
// Fuente: ERAS/AySA vía Infobae 29-jun-2026 y El Diario Sur 03-jul-2026: +3% mensual may–ago 2026.
export const AYSA_2026 = {
  aumentoJulioPct: 3,
  aumentoAgostoPct: 3,
  facturaPromedioJunio: 29967, // factura residencial promedio jun-2026
} as const;

// ── Prepagas — aumento julio 2026 ──
// Fuente: prensa 08-jul-2026 (ANR/ADNSUR): mayoría 2,1%; OSDE hasta 2,3%; Omint hasta 2,9%. Acumulado ~16% anual.
export const PREPAGAS_JUL_2026 = {
  aumentoPromedioPct: 2.1,
  osdeHastaPct: 2.3,
  omintHastaPct: 2.9,
  acumulado2026Pct: 16,
} as const;

// ── Billeteras / plazo fijo (jul-2026) ──
// Fuentes: iProfesional 08-jul-2026 (ranking billeteras) e Infobae 02-jul-2026 (plazos fijos por banco).
export const RENDIMIENTOS_JUL_2026 = {
  mercadoPagoTNA: 27.71,     // desde 03-jul-2026, FCI Mercado Fondo (Ahorro Clase A)
  cocosTNA: 27.93,
  ualaTNA: 26,
  plazoFijoBnaTNA: 19,       // 30 días; rango bancos 16–23%
  plazoFijoRango: [16, 23],
} as const;
