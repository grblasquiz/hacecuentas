// Datos oficiales Argentina 2026 — verificados jul-2026 (fuentes en cada bloque).
// Convención: cada export lleva fuente + fecha de verificación. NO inventar valores acá.

export const fmtARS = (v: number, dec = 0) =>
  '$' + v.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

// ── Compras del exterior (régimen vigente jul-2026, pre-reforma courier anunciada) ──
// Fuentes: ARCA envíos internacionales + prensa especializada (iProfesional/Canal26/minutouno, jul-2026).
export const COURIER_2026 = {
  franquiciaUSD: 400,        // valor FOB exento de derecho de importación y tasa de estadística
  enviosPorAnio: 5,
  topeEnvioUSD: 3000,
  topeKg: 50,
  unidadesIgualesMax: 3,
  fuente: 'ARCA — régimen courier (RG vigente jul-2026)',
} as const;

export const PUERTA_A_PUERTA_2026 = {
  franquiciaUSD: 50,         // por envío, primeros 12 envíos del año
  enviosConFranquicia: 12,
  alicuotaExcedente: 0.5,    // 50% sobre el excedente de USD 50
  topeEnvioUSD: 3000,
  topeKg: 20,
  fuente: 'Correo Argentino / ARCA — envíos postales internacionales',
} as const;

export const DOLAR_OFICIAL_REF = { venta: 1500, fecha: '2026-07-17' } as const; // BCRA, referencia editable en cada calc

// ── Franquicia de equipaje de viajeros (ARCA/ex-AFIP, vigente 2026) ──
// Fuente: https://www.afip.gob.ar/viajeros/ayuda/franquicia.asp
export const FRANQUICIA_VIAJERO_2026 = {
  aereaMaritimaUSD: 500,
  terrestreFluvialUSD: 300,
  freeShopLlegadaUSD: 500,   // adicional, solo arribo aéreo/marítimo (y Puerto Iguazú)
  menores16Factor: 0.5,      // menores de 16: 50% de la franquicia
  alicuotaExcedente: 0.5,    // 50% sobre el excedente
} as const;

// ── Cuenta DNI — topes y descuentos JULIO 2026 (Banco Provincia) ──
// Fuente: Banco Provincia vía prensa (Canal26/El Destape, 30-jun-2026). Refresh mensual.
export interface RubroCuentaDni {
  label: string; pct: number; tope: number | null; periodo: 'semana' | 'mes' | 'finde';
  dias: string;
}
export const CUENTA_DNI_JUL_2026: Record<string, RubroCuentaDni> = {
  gastronomia:   { label: 'Gastronomía', pct: 25, tope: 10000, periodo: 'semana', dias: 'todos los días' },
  carnicerias:   { label: 'Carnicerías y granjas', pct: 20, tope: 6000, periodo: 'semana', dias: 'lunes a viernes' },
  ferias:        { label: 'Ferias y mercados bonaerenses', pct: 40, tope: 6000, periodo: 'semana', dias: 'todos los días' },
  garrafas:      { label: 'Garrafas', pct: 40, tope: 18000, periodo: 'mes', dias: 'todos los días' },
  universidades: { label: 'Universidades, clubes y eventos', pct: 40, tope: 6000, periodo: 'semana', dias: 'todos los días' },
  ypfFull:       { label: 'Tiendas YPF Full', pct: 25, tope: 10000, periodo: 'finde', dias: 'sábados y domingos' },
  marcas:        { label: 'Marcas destacadas', pct: 30, tope: 15000, periodo: 'mes', dias: 'todos los días' },
  librerias:     { label: 'Librerías (textos escolares)', pct: 10, tope: null, periodo: 'semana', dias: 'lunes y martes' },
  farmacias:     { label: 'Farmacias y perfumerías', pct: 10, tope: null, periodo: 'semana', dias: 'miércoles y jueves' },
};

// ── AUH julio 2026 (ANSES, movilidad) ──
// Fuente: Infobae/Ámbito 06-jul-2026. General por hijo; se acredita 80% y se retiene 20% (Libreta AUH).
export const AUH_JUL_2026 = {
  montoGeneral: 148049,      // bruto por hijo
  pctRetenido: 0.2,          // se libera al presentar la Libreta AUH
  cobroMensual: 118439.2,    // 80%
  retenidoMensual: 29609.8,  // 20%
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
