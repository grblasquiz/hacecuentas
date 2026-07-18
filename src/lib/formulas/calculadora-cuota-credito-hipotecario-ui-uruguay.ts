/**
 * Cuota de un crédito hipotecario en UI (Unidades Indexadas) — Uruguay.
 *
 * Los créditos para vivienda (BHU, ANV, bancos) suelen pactarse en UI. La cuota
 * en UI es FIJA (sistema francés), pero su equivalente en PESOS sube con la
 * inflación, porque la UI se ajusta a diario por el IPC.
 *
 * montoUI  = montoPesos / valorUI
 * cuotaUI  = montoUI × i / (1 − (1+i)^(−n)),  i = (1+TEA_UI)^(1/12) − 1, n = años×12
 * cuotaPesosHoy   = cuotaUI × valorUI
 * cuotaPesos(k años) = cuotaPesosHoy × (1 + inflación)^k
 *
 * Fuente: valor de la UI (INE/DGI); tasas de referencia BROU/BHU (editables).
 */
import { URUGUAY_2026, fmtUYU, fmtUI } from '../data/uruguay-2026';

export interface Inputs {
  /** Monto del préstamo, en pesos. */
  montoPesos: number;
  /** Tasa efectiva anual en UI (%), editable. */
  tasaTEA_UI: number;
  /** Plazo en años. */
  plazoAnios: number;
  /** Inflación anual esperada (%) para proyectar la cuota en pesos. */
  inflacionAnual: number;
}

export interface Outputs {
  cuotaUI: string;
  cuotaPesosHoy: string;
  cuotaPesosEn10Anios: string;
  totalUI: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

function cuotaFrancesaUI(montoUI: number, teaPct: number, n: number): number {
  if (montoUI <= 0 || n <= 0) return 0;
  const i = Math.pow(1 + teaPct / 100, 1 / 12) - 1;
  if (i <= 0) return montoUI / n;
  return (montoUI * i) / (1 - Math.pow(1 + i, -n));
}

export function compute(inp: Inputs): Outputs {
  const valorUI = URUGUAY_2026.unidadIndexada.valor; // 6.5888
  const montoPesos = Math.max(0, Number(inp.montoPesos) || 0);
  const teaPct = Math.max(0, Number(inp.tasaTEA_UI) || 0);
  const anios = Math.max(1, Math.round(Number(inp.plazoAnios) || 1));
  const inflacion = Math.max(0, Number(inp.inflacionAnual) || 0) / 100;

  const n = anios * 12;
  const montoUI = montoPesos / valorUI;
  const cuotaUI = cuotaFrancesaUI(montoUI, teaPct, n);
  const cuotaPesosHoy = cuotaUI * valorUI;
  const totalUI = cuotaUI * n;

  const proy = (k: number) => cuotaPesosHoy * Math.pow(1 + inflacion, k);
  const cuota10 = proy(10);

  const detalle =
    `Préstamo de ${fmtUYU(montoPesos)} = ${fmtUI(montoUI)} (a ${fmtUYU(valorUI)}/UI). ` +
    `A ${teaPct}% TEA en UI, ${anios} años (${n} cuotas), la cuota fija es ${fmtUI(cuotaUI)}, ` +
    `hoy equivalente a ${fmtUYU(cuotaPesosHoy)}. Con ${(inflacion * 100).toFixed(0)}% de inflación anual, ` +
    `esa misma cuota en pesos rondaría ${fmtUYU(cuota10)} dentro de 10 años. Total del crédito: ${fmtUI(totalUI)}.`;

  return {
    cuotaUI: fmtUI(cuotaUI),
    cuotaPesosHoy: fmtUYU(cuotaPesosHoy),
    cuotaPesosEn10Anios: fmtUYU(cuota10),
    totalUI: fmtUI(totalUI),
    detalle,
    _insight: {
      type: 'highlight',
      icon: '🏠',
      tone: 'info' as const,
      text:
        `La cuota es de **${fmtUI(cuotaUI)}**, hoy **${fmtUYU(cuotaPesosHoy)}**. En UI no cambia nunca, ` +
        `pero en pesos sube con la inflación: al ${(inflacion * 100).toFixed(0)}% anual, dentro de 10 años esa misma cuota ` +
        `costaría unos **${fmtUYU(cuota10)}**. Como el crédito está en UI, la cuota acompaña los precios (y tu sueldo, si también sigue la inflación).`,
    },
    _table: {
      title: 'Proyección de la cuota en pesos (la cuota en UI es fija)',
      headers: ['Momento', 'Cuota en pesos (estimada)'],
      rows: [
        ['Hoy', fmtUYU(proy(0))],
        ['En 1 año', fmtUYU(proy(1))],
        ['En 5 años', fmtUYU(proy(5))],
        ['En 10 años', fmtUYU(proy(10))],
        ['En 20 años', fmtUYU(proy(20))],
      ],
      note:
        `Cuota fija de ${fmtUI(cuotaUI)}. Proyección en pesos con ${(inflacion * 100).toFixed(0)}% de inflación anual y UI a ${fmtUYU(valorUI)} hoy. Tasa en UI editable; no es una oferta de crédito.`,
    },
  };
}
