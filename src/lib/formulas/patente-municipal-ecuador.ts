/**
 * Impuesto de Patente Municipal — Ecuador 2026.
 *
 * Marco legal: COOTAD Art. 546–550.
 *  - Art. 547: pagan todas las personas (naturales/jurídicas) que ejerzan
 *    permanentemente actividades económicas y estén obligadas a obtener RUC.
 *  - Art. 548: la tarifa la fija cada GAD (municipio) mediante ordenanza, pero
 *    el impuesto MÍNIMO es USD 10 y el MÁXIMO es USD 25.000 al año.
 *    Base imponible = el patrimonio del contribuyente dentro del cantón.
 *      · Obligados a llevar contabilidad: patrimonio neto declarado al SRI.
 *      · No obligados a llevar contabilidad: patrimonio = 10% de los ingresos
 *        declarados en el ejercicio económico anterior (COOTAD Art. 548).
 *
 * Cada cantón publica su propia tabla progresiva dentro de esos límites.
 * Tomamos como referencia general la tabla progresiva publicada por el GAD de
 * Cuenca (fracción básica + % sobre el excedente), representativa del esquema
 * COOTAD, y modelamos los regímenes de tarifa fija de Quito.
 *
 * Fuentes:
 *  - COOTAD Art. 547–548 (mín. $10 / máx. $25.000; base = patrimonio).
 *  - GAD Cuenca, Ordenanza de patentes municipales (tabla progresiva):
 *    https://www.cuenca.gob.ec/node/10510
 *  - Quito Informa (tarifa única $15 no obligados; $10 transportistas/autónomos):
 *    https://www.quitoinforma.gob.ec/2025/07/07/patente-municipal-ahora-con-tarifa-unica-usd-15-desde-el-10-de-julio/
 *  - Verificado 2026-06-15.
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

// Límites nacionales del COOTAD Art. 548 (USD).
export const PATENTE_MIN = 10;
export const PATENTE_MAX = 25000;

// Tabla progresiva representativa (GAD Cuenca, ordenanza vigente).
// base = impuesto de la fracción básica · pct = % sobre el excedente del "desde".
// fuente: https://www.cuenca.gob.ec/node/10510
type Tramo = { desde: number; hasta: number; base: number; pct: number };
export const TABLA_PATENTE: Tramo[] = [
  { desde: 0,         hasta: 1000,      base: 10,       pct: 0.0    },
  { desde: 1000,      hasta: 5000,      base: 12,       pct: 0.0020 },
  { desde: 5000,      hasta: 10000,     base: 20,       pct: 0.0025 },
  { desde: 10000,     hasta: 20000,     base: 32.5,     pct: 0.0027 },
  { desde: 20000,     hasta: 50000,     base: 59.5,     pct: 0.0029 },
  { desde: 50000,     hasta: 100000,    base: 146.5,    pct: 0.0031 },
  { desde: 100000,    hasta: 300000,    base: 301.5,    pct: 0.0033 },
  { desde: 300000,    hasta: 500000,    base: 961.5,    pct: 0.0036 },
  { desde: 500000,    hasta: 3000000,   base: 1681.5,   pct: 0.0039 },
  { desde: 3000000,   hasta: Infinity,  base: 11431.5,  pct: 0.0042 },
];

export interface Inputs {
  /** Patrimonio neto / capital del negocio dentro del cantón (USD). */
  patrimonio: number;
  /** Cantón / régimen: 'tabla' (progresiva COOTAD), 'quito' (tarifa fija). */
  canton?: string;
  /** 'si' si está obligado a llevar contabilidad (cambia el régimen de Quito). */
  obligadoContabilidad?: string;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Impuesto progresivo por tramos (estilo COOTAD), acotado al máximo legal. */
function patenteProgresiva(patrimonio: number): number {
  const p = Math.max(0, patrimonio);
  let causado = PATENTE_MIN;
  for (const t of TABLA_PATENTE) {
    if (p > t.desde && p <= t.hasta) {
      causado = t.base + (p - t.desde) * t.pct;
      break;
    }
  }
  if (p > TABLA_PATENTE[TABLA_PATENTE.length - 1].desde) {
    const u = TABLA_PATENTE[TABLA_PATENTE.length - 1];
    causado = u.base + (p - u.desde) * u.pct;
  }
  return Math.min(Math.max(causado, PATENTE_MIN), PATENTE_MAX);
}

export function compute(i: Inputs): Outputs {
  const patrimonio = Number(i.patrimonio);
  const canton = String(i.canton || 'tabla').toLowerCase();
  const obligado = String(i.obligadoContabilidad || 'si') === 'si';

  if (!Number.isFinite(patrimonio) || patrimonio < 0) {
    throw new Error('Ingresá el patrimonio / capital del negocio (USD)');
  }

  let patente: number;
  let metodo: string;
  let cantonLabel: string;

  if (canton === 'quito') {
    cantonLabel = 'Quito (DMQ)';
    if (obligado) {
      // Obligados a llevar contabilidad: tabla progresiva sobre patrimonio neto.
      patente = patenteProgresiva(patrimonio);
      metodo = 'Tabla progresiva sobre el patrimonio neto (obligado a llevar contabilidad).';
    } else {
      // No obligados: tarifa única de $15 (ordenanza DMQ 2025).
      patente = 15;
      metodo = 'Tarifa única de $15 para personas naturales no obligadas a llevar contabilidad (DMQ).';
    }
  } else {
    cantonLabel = 'Tabla COOTAD (referencia general)';
    patente = patenteProgresiva(patrimonio);
    metodo = obligado
      ? 'Tabla progresiva sobre el patrimonio neto declarado al SRI.'
      : 'Tabla progresiva sobre el patrimonio (10% de los ingresos para no obligados).';
  }

  const patente2 = Math.round(patente * 100) / 100;
  const topeAplicado = patente2 >= PATENTE_MAX;
  const pisoAplicado = patente2 <= PATENTE_MIN;
  // Tasa efectiva sobre el patrimonio (referencia).
  const tasaEfectiva = patrimonio > 0 ? (patente2 / patrimonio) * 100 : 0;

  const _insight = {
    title: 'Tu patente municipal anual',
    text: `Con un patrimonio de **${fmtUSDec(patrimonio)}** en ${cantonLabel}, la patente municipal estimada es **${fmtUSDec(patente2)}** al año. ${
      pisoAplicado
        ? 'Se aplicó el **mínimo legal de $10** (COOTAD Art. 548).'
        : topeAplicado
        ? 'Se aplicó el **tope máximo legal de $25.000** (COOTAD Art. 548).'
        : `Equivale a una tasa efectiva del **${tasaEfectiva.toFixed(3)}%** sobre el patrimonio.`
    } Se declara y paga dentro de los 30 días posteriores al vencimiento de tu impuesto a la renta, según el 9.º dígito del RUC.`,
    tone: 'neutral',
    icon: '🏪',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Patrimonio del negocio', value: Math.round(patrimonio) },
      { label: 'Patente municipal', value: patente2 },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtUSDec(patente2),
    centerLabel: 'Patente anual',
    ariaLabel: `Patente municipal anual de ${fmtUSDec(patente2)} sobre un patrimonio de ${fmtUSDec(patrimonio)}.`,
  };

  return {
    patente: fmtUSDec(patente2),
    patrimonio: fmtUSDec(patrimonio),
    canton: cantonLabel,
    tasaEfectiva: tasaEfectiva.toFixed(3) + '%',
    limites: `Mínimo $10 · Máximo $25.000 (COOTAD Art. 548).`,
    detalle: `${metodo} Patente estimada: ${fmtUSDec(patente2)}/año.`,
    _insight,
    _chart,
  };
}
