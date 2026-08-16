/** Haber jubilatorio mínimo ANSES + bonos 2026 (aproximado) */
export interface Inputs { tieneBono: boolean | string; }
export interface Outputs { haberMinimo: number; bonoExtra: number; total: number; totalAnual: number; aguinaldoMedio: number; _chart?: any; _insight?: any; }

// Valores oficiales julio 2026 (ANSES — movilidad mensual por IPC, DNU 274/2024)
// Haber mínimo jul-2026: $411.989,33 tras el aumento del 2,15% (IPC de mayo).
// Con el bono extraordinario de $70.000 el total es $481.989,33. Se ajusta mes a mes.
const HABER_MINIMO = 419734.71;
const BONO_EXTRA = 70000; // bono complementario por decreto para haberes hasta la mínima

export function jubilacionMinima(i: Inputs): Outputs {
  const tieneBono = i.tieneBono === true || i.tieneBono === 'true' || i.tieneBono === 'si';
  const bono = tieneBono ? BONO_EXTRA : 0;
  const total = HABER_MINIMO + bono;
  const aguinaldoMedio = Math.round(HABER_MINIMO / 2);
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Haber mínimo', value: HABER_MINIMO },
      { label: 'Bono extra', value: bono },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: 'Total a cobrar',
    ariaLabel: 'Composición del total a cobrar: haber mínimo más bono',
  };
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const pctBono = total > 0 ? Math.round((bono / total) * 100) : 0;
  const _insight = {
    title: tieneBono ? 'Con bono incluido' : 'Sin bono complementario',
    text: tieneBono
      ? `Cobrás **${fmt(total)}** por mes: el haber mínimo de **${fmt(HABER_MINIMO)}** más el bono ANSES de **${fmt(bono)}** (el **${pctBono}%** del total). Ojo: el bono no genera aguinaldo, así que el SAC se calcula sólo sobre el haber.`
      : `Sin el bono complementario cobrás sólo el haber mínimo: **${fmt(HABER_MINIMO)}** por mes. Si tu haber no supera el mínimo, suele corresponderte el bono ANSES de **${fmt(BONO_EXTRA)}** extra.`,
    tone: (tieneBono ? 'good' : 'neutral') as 'good' | 'neutral',
    icon: '👵',
  };

  return {
    haberMinimo: HABER_MINIMO,
    bonoExtra: bono,
    total,
    totalAnual: total * 12 + HABER_MINIMO, // 12 meses + SAC (el bono no tiene SAC)
    aguinaldoMedio,
    _chart: chart,
    _insight,
  };
}
