/**
 * Calculadora de ISLR en Venezuela 2026 — Personas Naturales (Tarifa N° 1).
 *
 * Calcula el Impuesto Sobre La Renta anual de una persona natural residente a
 * partir de su enriquecimiento neto anual en bolívares, aplicando la Tarifa N° 1
 * de la Ley de ISLR (8 tramos, tasa marginal − sustraendo, expresados en U.T.),
 * el desgravamen único de 774 U.T. y la rebaja personal de 10 U.T. (más 10 U.T.
 * por cada carga familiar).
 *
 * Datos: NO se hardcodean tasas ni la U.T. — se leen de
 *   src/lib/data/venezuela-2026.ts (VENEZUELA_2026.islr, .unidadTributaria) y
 *   el cálculo del impuesto se delega al helper islrAnualVes.
 *   Fuente: SENIAT, Ley de ISLR (Art. 50, Tarifa N° 1), U.T. Bs. 43
 *   (Providencia SNAT/2025/000048, Gaceta Oficial 43.140).
 */
import { VENEZUELA_2026, islrAnualVes, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  enriquecimientoAnual?: number; // enriquecimiento neto anual en Bs.
  desgravamenUnico?: string;     // 'si' aplica el desgravamen único de 774 U.T.
  cargas?: number;               // nº de cargas familiares (rebaja 10 U.T. c/u)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const fmtPct = (n: number): string =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(n) + ' %';

export function calculadoraIslrVenezuela2026(i: Inputs): Outputs {
  const ut = VENEZUELA_2026.unidadTributaria;
  const islr = VENEZUELA_2026.islr;

  const enriquecimiento = Math.max(0, Number(i.enriquecimientoAnual) || 0);
  if (enriquecimiento <= 0) throw new Error('Ingresá tu enriquecimiento neto anual en bolívares.');

  const aplicaDesgravamen = String(i.desgravamenUnico ?? 'si') !== 'no';
  const cargas = Math.max(0, Math.floor(Number(i.cargas) || 0));

  // Desgravamen único: 774 U.T. en bolívares (alternativa a desgravámenes detallados).
  const desgravamenBs = aplicaDesgravamen ? islr.desgravamenUnicoUt * ut : 0;
  const netoGravable = Math.max(0, enriquecimiento - desgravamenBs);

  // Impuesto anual según Tarifa N° 1 (tasa marginal − sustraendo) menos rebajas.
  // El helper ya descuenta la rebaja personal (10 U.T.) + cargas (10 U.T. c/u).
  const impuestoAnual = islrAnualVes(netoGravable, cargas);

  // Rebajas en bolívares (solo informativo, para el desglose).
  const rebajaBs = (islr.rebajaPersonalUt + cargas * islr.rebajaCargaFamiliarUt) * ut;

  // Tramo marginal aplicado (para la narrativa y la tabla).
  const baseUt = netoGravable / ut;
  const tramo = islr.tarifa1.find((t) => baseUt <= t.hastaUt) ?? islr.tarifa1[islr.tarifa1.length - 1];
  const tasaMarginalPct = tramo.tasa * 100;

  const tasaEfectiva = enriquecimiento > 0 ? (impuestoAnual / enriquecimiento) * 100 : 0;
  const teQueda = Math.max(0, enriquecimiento - impuestoAnual);

  // Narrativa hook.
  let narrativa: string;
  if (impuestoAnual <= 0) {
    narrativa = `Con un enriquecimiento neto de ${fmtVES(enriquecimiento)}, tras el desgravamen ` +
      `(${fmtVES(desgravamenBs)}) y las rebajas (${fmtVES(rebajaBs)}) tu ISLR del ejercicio queda en Bs. 0. ` +
      `Te quedan íntegros tus ${fmtVES(teQueda)}.`;
  } else {
    narrativa = `Sobre un enriquecimiento neto de ${fmtVES(enriquecimiento)} (${baseUt.toFixed(0)} U.T. tras desgravamen) ` +
      `pagás ${fmtVES(impuestoAnual)} de ISLR, una tasa efectiva del ${fmtPct(tasaEfectiva)}. ` +
      `Caés en el tramo marginal del ${fmtPct(tasaMarginalPct)} de la Tarifa N° 1 (SENIAT).`;
  }

  // Tabla de tramos de la Tarifa N° 1 (info-gain, resalta el tramo aplicado).
  const filasTramos = islr.tarifa1.map((t, idx) => {
    const desde = idx === 0 ? 0 : islr.tarifa1[idx - 1].hastaUt;
    const hastaTxt = t.hastaUt === Infinity ? 'En adelante' : t.hastaUt.toLocaleString('de-DE');
    const aplica = (idx === 0 ? baseUt > 0 : baseUt > desde) && baseUt <= t.hastaUt;
    return [
      `${desde.toLocaleString('de-DE')} – ${hastaTxt} U.T.`,
      fmtPct(t.tasa * 100),
      t.sustraendoUt.toLocaleString('de-DE') + ' U.T.',
      aplica ? '◄ tu tramo' : '',
    ];
  });

  return {
    impuestoAnual,
    enriquecimientoNeto: enriquecimiento,
    desgravamen: desgravamenBs,
    netoGravable,
    rebajas: rebajaBs,
    tasaMarginal: tasaMarginalPct,
    tasaEfectiva,
    teQueda,
    detalle: `Neto gravable ${fmtVES(netoGravable)} (${baseUt.toFixed(0)} U.T.) · ISLR ${fmtVES(impuestoAnual)} · tasa efectiva ${fmtPct(tasaEfectiva)}`,
    _insight: {
      type: 'highlight',
      icon: '🇻🇪',
      text: narrativa,
    },
    _table: {
      title: 'ISLR Venezuela 2026 — Tarifa N° 1 (personas naturales)',
      headers: ['Tramo (en U.T.)', 'Tasa marginal', 'Sustraendo', ''],
      rows: filasTramos,
      note: `U.T. = ${fmtVES(ut)} (Providencia SNAT/2025/000048). Impuesto (U.T.) = base gravable en U.T. × tasa − sustraendo. ` +
        `Luego se descuentan 10 U.T. de rebaja personal y 10 U.T. por cada carga familiar. ` +
        `Desgravamen único: 774 U.T. (${fmtVES(islr.desgravamenUnicoUt * ut)}).`,
    },
  };
}
