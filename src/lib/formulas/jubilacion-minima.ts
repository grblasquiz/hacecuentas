/** Haber jubilatorio mínimo ANSES + bonos 2026 (aproximado) */
export interface Inputs { tieneBono: boolean | string; }
export interface Outputs { haberMinimo: number; bonoExtra: number; total: number; totalAnual: number; aguinaldoMedio: number; _chart?: any; }

// Valores aproximados abril 2026
const HABER_MINIMO = 280000;
const BONO_EXTRA = 70000; // bono complementario ANSES para haberes mínimos

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
  return {
    haberMinimo: HABER_MINIMO,
    bonoExtra: bono,
    total,
    totalAnual: total * 12 + HABER_MINIMO, // 12 meses + SAC (el bono no tiene SAC)
    aguinaldoMedio,
    _chart: chart,
  };
}
