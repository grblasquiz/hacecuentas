/**
 * Costo de la Revisión Técnica Vehicular (RTV) en Ecuador 2026.
 *
 * Calcula la tasa de RTV según tipo de vehículo, ciudad e intento de revisión,
 * más las posibles multas por no aprobar la revisión o no matricular a tiempo.
 *
 * Ecuador está dolarizado → todos los montos en USD ("$"), sin conversión.
 *
 * Datos 2026 (tarifas referenciales — verificar con tu municipio/GAD):
 *  - AMT Quito, liviano particular: $31,56 la 1ª revisión; 3ª $15,78 (mitad). // fuente: AMT Quito vía Expreso/Extra/Acavir, https://www.expreso.ec/quito/quito-inicia-la-revision-tecnica-vehicular-2026-costos-multas-y-como-agendar-cita-271542.html, 2026
 *  - ATM Guayaquil, liviano particular: $29,87 la 1ª/4ª revisión; 3ª $14,94; 2ª $0. // fuente: ATM Guayaquil, Tarifario 2026 (Memorando EPMTMG-DFI-2026-0143-M), https://atm.gob.ec/wp-content/uploads/2026/02/TARIFARIO-2026.pdf, 2026
 *  - 2ª revisión (re-chequeo): GRATIS ($0) si se hace dentro del plazo. // fuente: ATM Guayaquil Tarifario 2026 (2da RTV $-), 2026
 *  - Multa por no cumplir el calendario de matriculación: $25. // fuente: AMT Quito vía Expreso, https://www.expreso.ec/quito/quito-inicia-la-revision-tecnica-vehicular-2026-costos-multas-y-como-agendar-cita-271542.html, 2026
 *  - Multa por no presentarse o no aprobar la RTV: $50. // fuente: AMT Quito vía Expreso, 2026
 *  - Recargo anual por matrícula vencida: $25 por año. // fuente: AMT Quito vía Expreso, 2026
 */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

// ---- Tabla de tarifas RTV 2026 por tipo de vehículo (1ª revisión, base Quito AMT) ----
// fuente: tarifario RTV Quito 2026 (AMT) — Expreso/Extra/Acavir, 2026.
// Liviano $31,56 confirmado por 3 fuentes; resto de categorías según tabla AMT 2026,
// consistente con el Tarifario oficial ATM Guayaquil 2026 (mismas magnitudes).
const TARIFA_BASE_QUITO: Record<string, number> = {
  moto:       18.55,  // motocicleta / plataforma
  liviano:    31.56,  // vehículo particular liviano
  camioneta:  21.29,  // camioneta / furgoneta / buseta
  taxi:       21.39,  // taxi / comercial liviano
  pesado:     50.04,  // camión / transporte pesado
};

const TIPO_LABEL: Record<string, string> = {
  moto:      'Motocicleta',
  liviano:   'Vehículo liviano particular',
  camioneta: 'Camioneta / furgoneta',
  taxi:      'Taxi / comercial liviano',
  pesado:    'Camión / transporte pesado',
};

// Ajuste por ciudad sobre la tarifa base de Quito (AMT).
// Guayaquil (ATM) aplica ~5% menos (liviano $31,56 Quito → $29,87 oficial Guayaquil = factor 0,946);
// el resto de ciudades/GAD suele cobrar ~10% menos. // fuente: Tarifario ATM Guayaquil 2026 / AMT Quito, 2026.
const FACTOR_CIUDAD: Record<string, number> = {
  quito:      1.00,
  guayaquil:  0.946,  // calibrado para que liviano dé $29,87 (tarifario oficial ATM 2026)
  otra:       0.90,
};

const CIUDAD_LABEL: Record<string, string> = {
  quito:     'Quito (AMT)',
  guayaquil: 'Guayaquil (ATM)',
  otra:      'Otra ciudad (GAD)',
};

// Factor de costo según el número de revisión (intento):
//  1ª = tarifa completa · 2ª (re-chequeo) = GRATIS ($0) · 3ª = mitad · 4ª = tarifa completa.
// fuente: Tarifario oficial ATM Guayaquil 2026 — liviano $29,87 / $0 / $14,94 / $29,87, 2026.
const FACTOR_INTENTO: Record<string, number> = {
  '1': 1.0,
  '2': 0.0,
  '3': 0.5,
  '4': 1.0,
};

// Multas (USD) — AMT Quito 2026.
const MULTA_NO_CALENDARIO = 25;  // no matricular en el mes asignado
const MULTA_NO_APROBAR    = 50;  // no presentarse / no aprobar la RTV
const RECARGO_ANUAL       = 25;  // por cada año de matrícula vencida
const STICKER_RTV         = 3.90; // adhesivo RTV (Quito). // fuente: AMT Quito, 2026.

export interface Inputs {
  tipoVehiculo: string;     // 'moto' | 'liviano' | 'camioneta' | 'taxi' | 'pesado'
  ciudad: string;           // 'quito' | 'guayaquil' | 'otra'
  intento?: string;         // '1' | '2' | '3' | '4'
  noAprobo?: boolean | string;       // ¿no aprobó / no se presentó a la RTV? (multa $50) — 'si'|'no'|bool
  fueraDeCalendario?: boolean | string; // ¿matriculó fuera del mes asignado? (multa $25) — 'si'|'no'|bool
  aniosVencida?: number;    // años de matrícula vencida (recargo $25/año)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const tipo = String(i.tipoVehiculo || '');
  const ciudad = String(i.ciudad || '');
  const intento = String(i.intento || '1');

  if (!TARIFA_BASE_QUITO[tipo]) throw new Error('Elegí un tipo de vehículo válido');
  if (!FACTOR_CIUDAD[ciudad]) throw new Error('Elegí una ciudad válida');
  if (!(intento in FACTOR_INTENTO)) throw new Error('Elegí un intento de revisión válido (1 a 4)');

  // Acepta boolean (callers directos) o string 'si'/'no'/'true' (selects del form).
  const truthy = (v: boolean | string | undefined) =>
    v === true || (typeof v === 'string' && ['si', 'sí', 'true', '1'].includes(v.trim().toLowerCase()));
  const noAprobo = truthy(i.noAprobo);
  const fueraCalendario = truthy(i.fueraDeCalendario);
  const aniosVencida = Math.max(0, Math.floor(Number(i.aniosVencida) || 0));

  // Tasa de la RTV para este intento (USD).
  const tarifaBase = TARIFA_BASE_QUITO[tipo] * FACTOR_CIUDAD[ciudad];
  const costoRTV = tarifaBase * FACTOR_INTENTO[intento];
  // El sticker/adhesivo solo aplica al obtener la matrícula (1ª revisión aprobada).
  const sticker = intento === '1' ? STICKER_RTV : 0;

  // Multas y recargos (USD).
  const multaNoAprobar = noAprobo ? MULTA_NO_APROBAR : 0;
  const multaCalendario = fueraCalendario ? MULTA_NO_CALENDARIO : 0;
  const recargoVencida = aniosVencida * RECARGO_ANUAL;
  const totalMultas = multaNoAprobar + multaCalendario + recargoVencida;

  const totalAPagar = costoRTV + sticker + totalMultas;

  const esGratis = FACTOR_INTENTO[intento] === 0;

  const _insight = {
    title: esGratis ? 'Tu re-chequeo es gratis' : 'Tu costo de RTV',
    text: esGratis
      ? `La **2ª revisión (re-chequeo)** de tu ${TIPO_LABEL[tipo].toLowerCase()} en ${CIUDAD_LABEL[ciudad]} **no tiene costo** si la hacés dentro del plazo.${totalMultas > 0 ? ` Pero arrastrás **${fmtUSDec(totalMultas)}** en multas/recargos, así que pagás **${fmtUSDec(totalAPagar)}** en total.` : ' No tenés multas pendientes, así que no pagás nada por este intento.'}`
      : `La RTV de tu **${TIPO_LABEL[tipo].toLowerCase()}** en **${CIUDAD_LABEL[ciudad]}** (intento ${intento}) cuesta **${fmtUSDec(costoRTV)}**${sticker > 0 ? ` + ${fmtUSDec(sticker)} de adhesivo` : ''}.${totalMultas > 0 ? ` Con **${fmtUSDec(totalMultas)}** en multas/recargos, el total sube a **${fmtUSDec(totalAPagar)}**.` : ` Sin multas, pagás **${fmtUSDec(totalAPagar)}**.`}`,
    tone: totalMultas > 0 ? 'warning' : 'neutral',
    icon: totalMultas > 0 ? '⚠️' : '🔧',
  };

  const segments: Array<{ label: string; value: number }> = [
    { label: 'Tasa RTV', value: Math.round(costoRTV * 100) / 100 },
  ];
  if (sticker > 0) segments.push({ label: 'Adhesivo RTV', value: Math.round(sticker * 100) / 100 });
  if (multaNoAprobar > 0) segments.push({ label: 'Multa no aprobar ($50)', value: multaNoAprobar });
  if (multaCalendario > 0) segments.push({ label: 'Multa calendario ($25)', value: multaCalendario });
  if (recargoVencida > 0) segments.push({ label: `Recargo matrícula vencida (${aniosVencida} año/s)`, value: recargoVencida });

  const _chart = {
    type: 'donut',
    segments,
    label: fmtUSDec(totalAPagar),
    ariaLabel: `Total a pagar ${fmtUSDec(totalAPagar)} por la RTV y multas.`,
  };

  const detallePartes: string[] = [`Tasa RTV ${fmtUSDec(costoRTV)}`];
  if (sticker > 0) detallePartes.push(`adhesivo ${fmtUSDec(sticker)}`);
  if (multaNoAprobar > 0) detallePartes.push(`multa no aprobar ${fmtUSDec(multaNoAprobar)}`);
  if (multaCalendario > 0) detallePartes.push(`multa calendario ${fmtUSDec(multaCalendario)}`);
  if (recargoVencida > 0) detallePartes.push(`recargo vencida ${fmtUSDec(recargoVencida)}`);

  return {
    totalAPagar: fmtUSDec(totalAPagar),
    costoRTV: fmtUSDec(costoRTV),
    sticker: fmtUSDec(sticker),
    totalMultas: fmtUSDec(totalMultas),
    detalle: `${detallePartes.join(' + ')} = ${fmtUSDec(totalAPagar)}.`,
    _insight,
    _chart,
  };
}
