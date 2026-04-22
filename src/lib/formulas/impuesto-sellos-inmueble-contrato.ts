/**
 * Calculadora de Impuesto de Sellos (inmueble / contrato) — Argentina 2026.
 *
 * Fórmula base: Sellos = monto × alícuota
 *
 * Fuente: leyes impositivas provinciales 2026 (ARBA, AGIP, API, Rentas
 * Córdoba, Rentas Tucumán, etc.). Las alícuotas son nominales y hay muchas
 * exenciones/reducciones según provincia (vivienda única suele estar exenta
 * o muy reducida).
 */

export interface ImpuestoSellosInmuebleContratoInputs {
  montoContrato: number;
  /** Slug de provincia (opcional). Si se setea y alicuota no, usa default por operación. */
  provincia?: string;
  /** 'compraventa' | 'alquiler' — tipo de operación. */
  tipoOperacion?: string;
  /** Alícuota manual (%). Si > 0, prevalece sobre la default de la provincia. */
  alicuota?: number;
  partesQuePagan?: string;
}

export interface ImpuestoSellosInmuebleContratoOutputs {
  impuestoTotal: number;
  montoPorParte: number;
  alicuotaAplicada: number;
  provinciaNombre: string;
  detalle: string;
}

interface AlicuotaProvincia {
  nombre: string;
  compraventa: number;
  alquiler: number;
  ley?: string;
}

// Alícuotas nominales 2026 por provincia. Fuentes: leyes impositivas
// provinciales 2026. Notas importantes sobre exenciones:
//   - CABA: vivienda única hasta $226.1M EXENTA; 2ª+ viv. 2.7% (Ley 6927).
//   - Córdoba: boleto previo 1%.
//   - Jujuy: vivienda exenta; comercial −50%.
//   - Neuquén: vivienda única exenta (art. 237.b).
//   - Santa Fe: vivienda única 0,1%.
//   - San Juan: vivienda 0,8%.
// Estas son las alícuotas nominales para "2ª vivienda / sin exención".
const ALICUOTAS: Record<string, AlicuotaProvincia> = {
  caba:               { nombre: 'CABA',                   compraventa: 3.5, alquiler: 0.5, ley: 'Ley Tarifaria 6927' },
  'buenos-aires':     { nombre: 'Buenos Aires',           compraventa: 3.6, alquiler: 1.2, ley: 'Ley Impositiva 15558' },
  catamarca:          { nombre: 'Catamarca',              compraventa: 2.0, alquiler: 1.0 },
  chaco:              { nombre: 'Chaco',                  compraventa: 2.5, alquiler: 1.0 },
  chubut:             { nombre: 'Chubut',                 compraventa: 2.0, alquiler: 1.0 },
  cordoba:            { nombre: 'Córdoba',                compraventa: 1.0, alquiler: 0.5, ley: 'Ley 11090/2026' },
  corrientes:         { nombre: 'Corrientes',             compraventa: 3.5, alquiler: 1.0 },
  'entre-rios':       { nombre: 'Entre Ríos',             compraventa: 3.5, alquiler: 1.0, ley: 'Ley 11193/2025' },
  formosa:            { nombre: 'Formosa',                compraventa: 4.0, alquiler: 1.0, ley: 'Ley 1590' },
  jujuy:              { nombre: 'Jujuy',                  compraventa: 1.0, alquiler: 1.0 },
  'la-pampa':         { nombre: 'La Pampa',               compraventa: 1.0, alquiler: 1.0 },
  'la-rioja':         { nombre: 'La Rioja',               compraventa: 2.5, alquiler: 1.0 },
  mendoza:            { nombre: 'Mendoza',                compraventa: 3.0, alquiler: 1.5 },
  misiones:           { nombre: 'Misiones',               compraventa: 3.0, alquiler: 1.0, ley: 'Ley XXII-25' },
  neuquen:            { nombre: 'Neuquén',                compraventa: 3.0, alquiler: 2.0 },
  'rio-negro':        { nombre: 'Río Negro',              compraventa: 2.0, alquiler: 1.0 },
  salta:              { nombre: 'Salta',                  compraventa: 2.5, alquiler: 1.0, ley: 'Ley 6611' },
  'san-juan':         { nombre: 'San Juan',               compraventa: 3.0, alquiler: 1.0, ley: 'Ley 2026-I' },
  'san-luis':         { nombre: 'San Luis',               compraventa: 1.5, alquiler: 1.2, ley: 'Ley VIII-0254' },
  'santa-cruz':       { nombre: 'Santa Cruz',             compraventa: 3.0, alquiler: 1.0 },
  'santa-fe':         { nombre: 'Santa Fe',               compraventa: 4.5, alquiler: 0.5, ley: 'Ley 3650' },
  'santiago-estero':  { nombre: 'Santiago del Estero',    compraventa: 1.0, alquiler: 0.6, ley: 'Ley 6794' },
  'tierra-del-fuego': { nombre: 'Tierra del Fuego',       compraventa: 1.0, alquiler: 1.0 },
  tucuman:            { nombre: 'Tucumán',                compraventa: 3.0, alquiler: 1.0, ley: 'Ley 8467' },
};

export function impuestoSellosInmuebleContrato(
  inputs: ImpuestoSellosInmuebleContratoInputs
): ImpuestoSellosInmuebleContratoOutputs {
  const monto = Number(inputs.montoContrato);
  const alicuotaManual = Number(inputs.alicuota);
  const provincia = String(inputs.provincia || '').toLowerCase();
  const tipoOperacion = String(inputs.tipoOperacion || 'compraventa').toLowerCase();
  const partes = inputs.partesQuePagan || 'mitades';

  if (!monto || monto <= 0) throw new Error('Ingresá el monto del contrato');
  if (tipoOperacion !== 'compraventa' && tipoOperacion !== 'alquiler') {
    throw new Error('Tipo de operación debe ser "compraventa" o "alquiler"');
  }

  // Alícuota efectiva: manual > provincia+tipoOperacion
  let alicuota: number;
  let provinciaNombre: string;
  if (alicuotaManual && alicuotaManual > 0) {
    alicuota = alicuotaManual;
    const cfg = ALICUOTAS[provincia];
    provinciaNombre = cfg ? `${cfg.nombre} (alícuota manual)` : 'Alícuota manual';
  } else if (ALICUOTAS[provincia]) {
    alicuota = tipoOperacion === 'alquiler'
      ? ALICUOTAS[provincia].alquiler
      : ALICUOTAS[provincia].compraventa;
    provinciaNombre = ALICUOTAS[provincia].nombre;
  } else {
    throw new Error('Seleccioná una provincia o ingresá la alícuota manual');
  }

  if (alicuota < 0 || alicuota > 10) throw new Error('La alícuota debe estar entre 0 y 10%');

  const impuesto = monto * (alicuota / 100);
  const porParte = partes === 'mitades' ? impuesto / 2 : impuesto;
  const partesStr = partes === 'mitades' ? '50% cada parte' : 'una sola parte';
  const opLabel = tipoOperacion === 'alquiler' ? 'contrato de alquiler' : 'compraventa de inmueble';

  return {
    impuestoTotal: Math.round(impuesto),
    montoPorParte: Math.round(porParte),
    alicuotaAplicada: alicuota,
    provinciaNombre,
    detalle: `Sellos ${provinciaNombre} (${opLabel}): $${Math.round(monto).toLocaleString('es-AR')} × ${alicuota}% = $${Math.round(impuesto).toLocaleString('es-AR')}. Distribución: ${partesStr} → $${Math.round(porParte).toLocaleString('es-AR')} por parte. Muchas provincias tienen exenciones para vivienda única — consultá con escribano.`,
  };
}
