/**
 * Estimación de patente automotor según valuación fiscal y provincia.
 *
 * Cada provincia tiene su propia escala (ARBA, AGIP, API, DGR, etc.) por tramo
 * de valuación fiscal. Como simplificación, esta calc usa una alícuota
 * "representativa" por provincia que aproxima al promedio para vehículos de
 * valuación media. Para el cálculo exacto, el usuario puede ingresar la
 * alícuota manualmente (campo `alicuota` > 0 tiene prioridad sobre `provincia`).
 *
 * Fuentes 2026 (rangos):
 *   - PBA: 5 tramos, 1% a 4,5% (reforma ARBA 2026, Ley impositiva 2026)
 *   - CABA: hasta 4%, promedio ~3,5% (92% de los autos entre 1,6% y 3,5%)
 *   - Córdoba: escala 1% a 4%, descuento 35% pago anual
 *   - Santa Fe: escala 1% a 4%, descuento 35% anual
 *   - Resto: escalas provinciales propias
 */

export interface Inputs {
  valuacionFiscal: number;
  /** Slug de provincia (opcional). Si se setea y alicuota no, usa la default. */
  provincia?: string;
  /** Alícuota manual (%). Si > 0, prevalece sobre la default de la provincia. */
  alicuota?: number;
  cuotas?: number;
}

export interface Outputs {
  patenteAnual: number;
  patenteCuota: number;
  patenteMensual: number;
  alicuotaAplicada: number;
  provinciaNombre: string;
  detalle: string;
}

/**
 * Alícuota representativa por provincia (2026). Son valores indicativos
 * cercanos al promedio para autos de valuación media; la escala real varía
 * por tramo de valuación fiscal.
 */
const ALICUOTAS_PROVINCIA: Record<string, { nombre: string; alicuota: number }> = {
  caba:               { nombre: 'CABA',                   alicuota: 3.5 },
  'buenos-aires':     { nombre: 'Buenos Aires (PBA)',     alicuota: 3.0 },
  catamarca:          { nombre: 'Catamarca',              alicuota: 2.3 },
  chaco:              { nombre: 'Chaco',                  alicuota: 2.8 },
  chubut:             { nombre: 'Chubut',                 alicuota: 2.5 },
  cordoba:            { nombre: 'Córdoba',                alicuota: 3.2 },
  corrientes:         { nombre: 'Corrientes',             alicuota: 2.5 },
  'entre-rios':       { nombre: 'Entre Ríos',             alicuota: 2.8 },
  formosa:            { nombre: 'Formosa',                alicuota: 2.2 },
  jujuy:              { nombre: 'Jujuy',                  alicuota: 2.3 },
  'la-pampa':         { nombre: 'La Pampa',               alicuota: 2.5 },
  'la-rioja':         { nombre: 'La Rioja',               alicuota: 2.5 },
  mendoza:            { nombre: 'Mendoza',                alicuota: 2.5 },
  misiones:           { nombre: 'Misiones',               alicuota: 2.5 },
  neuquen:            { nombre: 'Neuquén',                alicuota: 2.5 },
  'rio-negro':        { nombre: 'Río Negro',              alicuota: 2.5 },
  salta:              { nombre: 'Salta',                  alicuota: 2.3 },
  'san-juan':         { nombre: 'San Juan',               alicuota: 2.3 },
  'san-luis':         { nombre: 'San Luis',               alicuota: 2.5 },
  'santa-cruz':       { nombre: 'Santa Cruz',             alicuota: 2.0 },
  'santa-fe':         { nombre: 'Santa Fe',               alicuota: 3.0 },
  'santiago-estero':  { nombre: 'Santiago del Estero',    alicuota: 2.3 },
  'tierra-del-fuego': { nombre: 'Tierra del Fuego',       alicuota: 1.8 },
  tucuman:            { nombre: 'Tucumán',                alicuota: 2.5 },
};

export function patenteAutoProvincia(i: Inputs): Outputs {
  const valuacion = Number(i.valuacionFiscal);
  const alicuotaManual = Number(i.alicuota);
  const provincia = String(i.provincia || '').toLowerCase();
  const cuotas = Math.max(1, Math.min(12, Number(i.cuotas) || 12));

  if (!valuacion || valuacion <= 0) {
    throw new Error('Ingresá la valuación fiscal del vehículo');
  }

  // Alícuota efectiva: manual > provincia > error
  let alicuota: number;
  let provinciaNombre: string;
  if (alicuotaManual && alicuotaManual > 0) {
    alicuota = alicuotaManual;
    const cfg = ALICUOTAS_PROVINCIA[provincia];
    provinciaNombre = cfg ? `${cfg.nombre} (alícuota manual)` : 'Alícuota manual';
  } else if (ALICUOTAS_PROVINCIA[provincia]) {
    alicuota = ALICUOTAS_PROVINCIA[provincia].alicuota;
    provinciaNombre = ALICUOTAS_PROVINCIA[provincia].nombre;
  } else {
    throw new Error('Seleccioná una provincia o ingresá la alícuota manual');
  }

  if (alicuota > 10) throw new Error('La alícuota no puede superar 10%');

  const patenteAnual = (valuacion * alicuota) / 100;
  const patenteCuota = patenteAnual / cuotas;
  const patenteMensual = patenteAnual / 12;

  return {
    patenteAnual: Math.round(patenteAnual),
    patenteCuota: Math.round(patenteCuota),
    patenteMensual: Math.round(patenteMensual),
    alicuotaAplicada: alicuota,
    provinciaNombre,
    detalle: `${provinciaNombre} · alícuota ${alicuota}% aplicada sobre valuación fiscal $${Math.round(valuacion).toLocaleString('es-AR')}. Patente anual ≈ $${Math.round(patenteAnual).toLocaleString('es-AR')} (${cuotas} cuotas de $${Math.round(patenteCuota).toLocaleString('es-AR')} ≈ $${Math.round(patenteMensual).toLocaleString('es-AR')}/mes).`,
  };
}
