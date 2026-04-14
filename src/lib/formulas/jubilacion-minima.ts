/** Haber jubilatorio mínimo ANSES + bonos 2026 (aproximado) */
export interface Inputs { tieneBono: boolean | string; }
export interface Outputs { haberMinimo: number; bonoExtra: number; total: number; totalAnual: number; aguinaldoMedio: number; }

// Valores aproximados abril 2026
const HABER_MINIMO = 280000;
const BONO_EXTRA = 70000; // bono complementario ANSES para haberes mínimos

export function jubilacionMinima(i: Inputs): Outputs {
  const tieneBono = i.tieneBono === true || i.tieneBono === 'true' || i.tieneBono === 'si';
  const bono = tieneBono ? BONO_EXTRA : 0;
  const total = HABER_MINIMO + bono;
  const aguinaldoMedio = Math.round(HABER_MINIMO / 2);
  return {
    haberMinimo: HABER_MINIMO,
    bonoExtra: bono,
    total,
    totalAnual: total * 12 + HABER_MINIMO, // 12 meses + SAC (el bono no tiene SAC)
    aguinaldoMedio,
  };
}
