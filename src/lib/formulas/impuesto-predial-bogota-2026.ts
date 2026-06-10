/**
 * Impuesto predial unificado Bogotá 2026 — tarifa según avalúo catastral, estrato y uso.
 * Constantes base: COLOMBIA_2026.predialBogota (Resolución SDH-000194 del 12-dic-2025).
 * La tabla progresiva residencial completa se transcribe acá (el data file guarda sólo los extremos;
 * ver comentario "transcribir al construir la calc" en colombia-2026.ts). Fuente: art. 1 Resolución
 * SDH-000194, verificada contra haciendabogota.gov.co/es/impuestos/impuesto-predial-unificado (2026-06-10).
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

// Tabla residencial urbana 2026: tarifa (por mil) según rango de avalúo catastral.
// La tarifa del rango se aplica sobre TODO el avalúo (no es marginal).
const TABLA_RESIDENCIAL_2026: Array<{ hasta: number; porMil: number }> = [
  { hasta: 194_307_000, porMil: 5.5 },
  { hasta: 207_062_000, porMil: 5.6 },
  { hasta: 238_375_000, porMil: 5.7 },
  { hasta: 269_690_000, porMil: 5.8 },
  { hasta: 301_005_000, porMil: 5.9 },
  { hasta: 332_318_000, porMil: 6.0 },
  { hasta: 363_632_000, porMil: 6.1 },
  { hasta: 394_946_000, porMil: 6.2 },
  { hasta: 447_136_000, porMil: 6.3 },
  { hasta: 499_330_000, porMil: 6.4 },
  { hasta: 551_518_000, porMil: 6.5 },
  { hasta: 603_709_000, porMil: 6.6 },
  { hasta: 655_899_000, porMil: 6.8 },
  { hasta: 708_090_000, porMil: 7.0 },
  { hasta: 760_279_000, porMil: 7.2 },
  { hasta: 812_470_000, porMil: 7.4 },
  { hasta: 864_660_000, porMil: 7.6 },
  { hasta: 937_727_000, porMil: 7.8 },
  { hasta: 1_010_794_000, porMil: 8.0 },
  { hasta: 1_083_859_000, porMil: 8.2 },
  { hasta: 1_156_929_000, porMil: 8.4 },
  { hasta: 1_229_992_000, porMil: 8.6 },
  { hasta: 1_303_058_000, porMil: 8.8 },
  { hasta: 1_376_126_000, porMil: 9.0 },
  { hasta: 1_449_192_000, porMil: 9.2 },
  { hasta: 1_710_142_000, porMil: 9.5 },
  { hasta: 1_971_099_000, porMil: 10.1 },
  { hasta: 2_232_051_000, porMil: 10.8 },
  { hasta: 2_505_139_000, porMil: 11.5 },
  { hasta: Infinity, porMil: 12.3 },
];

// Umbrales preferenciales en SMLMV (Acuerdo 648 de 2016; tarifas en COLOMBIA_2026.predialBogota.preferencialEstratos).
// Estratos 1-2: avalúo < 16 SMLMV → excluido del impuesto; 16-107 SMLMV → 1‰; >107-135 SMLMV → 3‰.
const EXCLUSION_E12_SMLMV = 16;
const UMBRAL_1PORMIL_SMLMV = 107;

export interface Inputs {
  avaluo: number;       // avalúo catastral 2026 (COP)
  uso?: string;         // 'residencial' | 'comercial'
  estrato?: string;     // '1'..'6' (sólo afecta uso residencial)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const avaluo = i.avaluo === undefined || i.avaluo === null || (i.avaluo as any) === ''
    ? NaN : Number(i.avaluo);
  if (!Number.isFinite(avaluo) || avaluo <= 0) throw new Error('Ingresa el avalúo catastral 2026 de tu predio');

  const uso = String(i.uso || 'residencial') === 'comercial' ? 'comercial' : 'residencial';
  const estrato = Math.min(6, Math.max(1, Math.round(Number(String(i.estrato ?? '4')) || 4)));

  const P = COLOMBIA_2026.predialBogota;
  const smlmv = COLOMBIA_2026.smlmv;
  const pref = P.preferencialEstratos;
  const tope135 = pref.topeAvaluoSmlmv * smlmv;          // $236.372.175 en 2026
  const piso16 = EXCLUSION_E12_SMLMV * smlmv;            // $28.014.480
  const corte107 = UMBRAL_1PORMIL_SMLMV * smlmv;         // $187.346.835

  let tarifaPorMil = 0;
  let regimen = '';
  let excluido = false;

  if (uso === 'comercial') {
    tarifaPorMil = avaluo <= P.comercial.cortePesos ? P.comercial.tarifaPorMilHasta : P.comercial.tarifaPorMilDesde;
    regimen = `Comercial (${String(tarifaPorMil).replace('.', ',')} por mil ${avaluo <= P.comercial.cortePesos ? 'hasta' : 'sobre'} ${fmtCOP(P.comercial.cortePesos)})`;
  } else if (estrato <= 2 && avaluo < piso16) {
    excluido = true;
    regimen = `Residencial estrato ${estrato} con avalúo menor a 16 SMLMV (${fmtCOP(piso16)}): excluido del predial`;
  } else if (estrato <= 2 && avaluo <= tope135) {
    tarifaPorMil = avaluo <= corte107 ? pref.estrato1y2DesdePorMil : pref.estrato1y2HastaPorMil;
    regimen = `Tarifa preferencial estrato ${estrato} (avalúo hasta 135 SMLMV)`;
  } else if (estrato === 3 && avaluo <= tope135) {
    tarifaPorMil = pref.estrato3PorMil;
    regimen = 'Tarifa preferencial estrato 3 (avalúo hasta 135 SMLMV)';
  } else {
    const tramo = TABLA_RESIDENCIAL_2026.find((t) => avaluo <= t.hasta)!;
    tarifaPorMil = tramo.porMil;
    regimen = 'Tabla general residencial (Resolución SDH-000194)';
  }

  // El impuesto se aproxima al múltiplo de mil más cercano.
  const impuesto = excluido ? 0 : Math.round((avaluo * tarifaPorMil) / 1000 / 1000) * 1000;
  const tarifaTxt = String(tarifaPorMil).replace('.', ',');

  const _insight = {
    title: excluido ? 'Tu predio está excluido' : `Tarifa ${tarifaTxt} por mil`,
    text: excluido
      ? `Las casas y apartamentos de **estratos 1 y 2** con avalúo catastral menor a 16 SMLMV (**${fmtCOP(piso16)}** en 2026) están excluidos del impuesto predial en Bogotá: **no pagas nada** por este predio.`
      : `Con avalúo de **${fmtCOP(avaluo)}** pagas tarifa de **${tarifaTxt} por mil** → **${fmtCOP(impuesto)}** por la vigencia 2026. El descuento del 10% por pronto pago venció el 17-abr-2026; te queda pagar **sin sanción hasta el 10 de julio de 2026**.`,
    tone: excluido ? 'good' : impuesto > 0 && tarifaPorMil <= 3 ? 'good' : 'info',
    icon: '🏛️',
  };

  const _chart = {
    type: 'scale',
    marker: tarifaPorMil,
    markerLabel: `${tarifaTxt}‰`,
    min: 0,
    segments: [
      { nombre: 'Preferencial (1-3‰)', max: 3, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'General baja (5,5-6,6‰)', max: 6.6, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: 'General media (6,8-9,2‰)', max: 9.2, color: '#eab308', colorDark: '#facc15' },
      { nombre: 'General alta (9,5-12,3‰)', max: 12.3, color: '#f97316', colorDark: '#fb923c' },
    ],
    ariaLabel: `Tarifa de ${tarifaTxt} por mil sobre un avalúo de ${fmtCOP(avaluo)}: impuesto de ${fmtCOP(impuesto)}.`,
  };

  return {
    impuestoAnual: excluido ? '$0 (excluido)' : fmtCOP(impuesto),
    tarifaAplicada: excluido ? 'Excluido (estratos 1-2, avalúo < 16 SMLMV)' : `${tarifaTxt} por mil — ${regimen}`,
    fechas: `Pago sin sanción hasta el 10-jul-2026. Descuento 10% (hasta 17-abr-2026) y declaración por cuotas SPAC (hasta 08-may-2026) ya vencieron a esta fecha.`,
    detalle: excluido
      ? `Avalúo ${fmtCOP(avaluo)} < ${fmtCOP(piso16)} (16 SMLMV) en estrato ${estrato}: el predio no paga predial en 2026.`
      : `${fmtCOP(avaluo)} × ${tarifaTxt}‰ = ${fmtCOP(impuesto)} (aproximado al múltiplo de mil). Régimen: ${regimen}.`,
    _insight,
    _chart,
  };
}
