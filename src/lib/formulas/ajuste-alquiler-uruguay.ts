/**
 * Ajuste / Reajuste de Alquiler — Uruguay 2026.
 *
 * Los contratos de arrendamiento de vivienda se reajustan una vez al año. El
 * criterio más usado (y el que fija la Ley de Vivienda Promovida y muchos
 * contratos) es tomar el MENOR entre la variación anual del IPC (precios) y de la
 * UR (Unidad Reajustable, que sigue los salarios). El inquilino paga el aumento
 * más bajo de los dos.
 *
 *     nuevo alquiler = alquiler actual × (1 + min(varIPC, varUR) / 100)
 *
 * El usuario ingresa ambas variaciones anuales (las publica el INE): así la
 * cuenta no depende de datos que caducan. Como referencia, la UR se ajusta
 * mensualmente por el Índice Medio de Salarios.
 */
import { fmtUYU } from '../data/uruguay-2026.ts';

export interface Inputs {
  /** Alquiler actual mensual, en pesos. */
  alquilerActual: number;
  /** Variación anual del IPC, en % (ej. 5.2). */
  varIpc: number;
  /** Variación anual de la UR, en % (ej. 8.1). */
  varUr: number;
}

export interface Outputs {
  nuevoAlquiler: string;
  indiceAplicado: string;
  aumento: string;
  ajusteIpc: string;
  ajusteUr: string;
  detalle: string;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  const base = Math.max(0, Number(i.alquilerActual) || 0);
  const ipc = Number(i.varIpc);
  const ur = Number(i.varUr);
  const vIpc = Number.isFinite(ipc) ? ipc : 0;
  const vUr = Number.isFinite(ur) ? ur : 0;

  const menor = Math.min(vIpc, vUr);
  const indice = vIpc <= vUr ? 'IPC' : 'UR';
  const nuevoIpc = base * (1 + vIpc / 100);
  const nuevoUr = base * (1 + vUr / 100);
  const nuevo = base * (1 + menor / 100);
  const aumento = nuevo - base;

  const detalle =
    `Alquiler actual ${fmtUYU(base)}. Ajuste por IPC (${vIpc.toFixed(2)}%) → ${fmtUYU(nuevoIpc)}; ` +
    `ajuste por UR (${vUr.toFixed(2)}%) → ${fmtUYU(nuevoUr)}. Se aplica el menor (${indice}, ${menor.toFixed(2)}%): ` +
    `nuevo alquiler ${fmtUYU(nuevo)} (+${fmtUYU(aumento)}).`;

  return {
    nuevoAlquiler: fmtUYU(nuevo),
    indiceAplicado: `${indice} (${menor.toFixed(2)}%)`,
    aumento: `+${fmtUYU(aumento)}`,
    ajusteIpc: fmtUYU(nuevoIpc),
    ajusteUr: fmtUYU(nuevoUr),
    detalle,
    _insight: {
      type: 'highlight',
      icon: '🏠',
      text: `Se aplica el menor de los dos índices: **${indice}** (${menor.toFixed(2)}%). Tu alquiler pasa de **${fmtUYU(base)}** a **${fmtUYU(nuevo)}**, un aumento de **${fmtUYU(aumento)}** al mes. Si se aplicara el otro índice pagarías ${fmtUYU(indice === 'IPC' ? nuevoUr : nuevoIpc)}.`,
      tone: menor <= 0 ? 'good' : 'info',
    },
  };
}
