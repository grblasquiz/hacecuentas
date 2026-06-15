/** Impuesto del 1,5 por mil sobre los activos totales (Ecuador) — impuesto municipal del COOTAD.
 *  Base imponible = activos totales − obligaciones de hasta un año plazo (pasivos corrientes) − pasivos contingentes.
 *  Impuesto = base imponible × 1,5/1000 (0,0015).
 *  Sujetos pasivos: personas naturales y jurídicas obligadas a llevar contabilidad que ejercen
 *  actividad económica permanente en el cantón (COOTAD Arts. 552–555).
 *  Fuente: COOTAD Art. 552 (sujeto activo), Art. 553 (sujetos pasivos + base imponible/deducciones),
 *    Art. 554 (exenciones), Art. 555 (período y plazo de pago).
 *    https://www.cuenca.gob.ec/content/impuesto-al-15-por-mil-sobre-los-activos-totales
 *  Orientativo: cada GAD municipal fija el calendario por noveno dígito del RUC. Ecuador dolarizado → USD.
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

/** Tarifa del impuesto: 1,5 por mil = 0,0015. Fuente: COOTAD, Sección X (1.5 por mil sobre activos totales). */
const TARIFA_1_5_POR_MIL = 0.0015;

export interface Inputs {
  activosTotales: number;
  /** Obligaciones (pasivos) corrientes de hasta un año plazo. Deducibles (COOTAD art. 553). */
  pasivosCorrientes?: number;
  /** Pasivos contingentes. Deducibles (COOTAD art. 553). */
  pasivosContingentes?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Trata ''/null/undefined como 0; números válidos se conservan (guard de campos opcionales). */
function num(v: unknown): number {
  if (v === '' || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function compute(i: Inputs): Outputs {
  const activosTotales = num(i.activosTotales);
  if (activosTotales <= 0) throw new Error('Ingresá el total de activos (mayor a 0)');

  const pasivosCorrientes = Math.max(0, num(i.pasivosCorrientes));
  const pasivosContingentes = Math.max(0, num(i.pasivosContingentes));
  const deducciones = pasivosCorrientes + pasivosContingentes;

  // La base imponible no puede ser negativa: si las deducciones superan los activos, queda en 0.
  const baseImponible = Math.max(0, activosTotales - deducciones);
  const impuesto = baseImponible * TARIFA_1_5_POR_MIL;

  // Tasa efectiva sobre los activos totales (cae a medida que crecen las deducciones).
  const tasaEfectivaSobreActivos = activosTotales > 0 ? (impuesto / activosTotales) * 1000 : 0;

  const _insight = {
    title: 'Tu impuesto del 1,5 por mil',
    text: `Sobre activos totales de **${fmtUSDec(activosTotales)}**, restando **${fmtUSDec(deducciones)}** de pasivos deducibles (corrientes y contingentes), tu base imponible es **${fmtUSDec(baseImponible)}**. El impuesto municipal del 1,5 por mil es **${fmtUSDec(impuesto)}** al año. Equivale a ${tasaEfectivaSobreActivos.toFixed(2).replace('.', ',')} por mil sobre tus activos totales una vez aplicadas las deducciones.`,
    tone: impuesto > 0 ? 'neutral' : 'positive',
    icon: '🏢',
  };
  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Base imponible (gravada)', value: Math.round(baseImponible * 100) / 100 },
      { label: 'Pasivos deducibles', value: Math.round(deducciones * 100) / 100 },
    ],
    ariaLabel: `Base imponible ${fmtUSDec(baseImponible)} y pasivos deducibles ${fmtUSDec(deducciones)} sobre activos totales de ${fmtUSDec(activosTotales)}.`,
  };

  return {
    impuesto: fmtUSDec(impuesto),
    baseImponible: fmtUSDec(baseImponible),
    deducciones: fmtUSDec(deducciones),
    activosTotales: fmtUSDec(activosTotales),
    detalle: `Base imponible = ${fmtUSDec(activosTotales)} − ${fmtUSDec(deducciones)} = ${fmtUSDec(baseImponible)}. Impuesto = ${fmtUSDec(baseImponible)} × 1,5‰ = ${fmtUSDec(impuesto)}.`,
    _insight,
    _chart,
  };
}
