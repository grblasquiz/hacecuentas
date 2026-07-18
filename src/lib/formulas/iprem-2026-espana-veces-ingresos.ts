/**
 * IPREM 2026 (España) — cuántas "veces el IPREM" son tus ingresos y a qué ayudas llegas.
 * IPREM 2026 (congelado desde 2023): 600 €/mes; 7.200 €/año (12 pagas) / 8.400 €/año (14 pagas).
 * Muchas ayudas (bono social, becas, justicia gratuita, IMV) fijan su límite en "veces el IPREM".
 * Datos en src/lib/data/espana-2026.ts. Euros (es-ES).
 */
import { IPREM_2026 } from '../data/espana-2026.ts';

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100) + ' €';
const fmtNum = (n: number, dec = 2): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec));

export interface Inputs {
  ingresos: number | string;
  periodo?: string;        // 'anual' | 'mensual'
  baseReferencia?: string; // '14' | '12' pagas del IPREM anual
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const ingresos = Number(i.ingresos) || 0;
  const periodo = i.periodo === 'mensual' ? 'mensual' : 'anual';
  const base = i.baseReferencia === '12' ? 12 : 14;
  if (ingresos <= 0) throw new Error('Introduce tus ingresos');

  const ingresosAnuales = periodo === 'mensual' ? ingresos * 14 : ingresos; // convención: nómina en 14 pagas
  const ipremAnual = base === 14 ? IPREM_2026.anual14 : IPREM_2026.anual12;
  const veces = ingresosAnuales / ipremAnual;
  const vecesR = Math.round(veces * 100) / 100;

  // Umbrales frecuentes de ayudas
  let franja = '';
  if (vecesR <= 1.5) franja = 'Por debajo de 1,5 × IPREM: encajas en la mayoría de límites de ayudas (bono social sin menores, justicia gratuita, becas).';
  else if (vecesR <= 2) franja = 'Entre 1,5 y 2 × IPREM: sigues dentro de límites como el bono social con menores a cargo o algunas becas.';
  else if (vecesR <= 2.5) franja = 'Entre 2 y 2,5 × IPREM: llegas a límites más altos (familia numerosa en bono social, algunas ayudas autonómicas).';
  else if (vecesR <= 3) franja = 'Entre 2,5 y 3 × IPREM: superas la mayoría de umbrales básicos, pero aún encajas en algunas ayudas de 3 × IPREM.';
  else franja = 'Por encima de 3 × IPREM: quedas fuera de los límites habituales de ayudas basadas en el IPREM.';

  const _insight = {
    title: 'Tus ingresos en "veces IPREM"',
    text: `Con **${fmtEur(ingresosAnuales)} anuales** y el IPREM 2026 de **${fmtEur(ipremAnual)}/año** (${base} pagas), tus ingresos equivalen a **${fmtNum(vecesR)} veces el IPREM**. ${franja}`,
    tone: vecesR <= 2 ? 'good' : vecesR <= 3 ? 'neutral' : 'warn',
    icon: '📋',
  };

  const _chart = {
    type: 'scale',
    marker: vecesR,
    markerLabel: fmtNum(vecesR) + '×',
    min: 0,
    segments: [
      { nombre: '≤1,5×', max: 1.5, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: '≤2×', max: 2, color: '#65a30d', colorDark: '#84cc16' },
      { nombre: '≤2,5×', max: 2.5, color: '#ca8a04', colorDark: '#eab308' },
      { nombre: '>2,5×', max: Math.max(3.5, Math.ceil(vecesR) + 0.5), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Tus ingresos equivalen a ${fmtNum(vecesR)} veces el IPREM.`,
  };

  return {
    vecesIPREM: fmtNum(vecesR) + ' × IPREM',
    ingresosAnuales: fmtEur(ingresosAnuales),
    ipremReferencia: fmtEur(ipremAnual) + `/año (${base} pagas)`,
    detalle: `${fmtEur(ingresosAnuales)} ÷ ${fmtEur(ipremAnual)} (IPREM anual ${base} pagas) = ${fmtNum(vecesR)} veces el IPREM.`,
    _insight,
    _chart,
  };
}
