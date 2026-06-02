/** Revalúo contable de bienes de uso por inflación AR */
export interface Inputs { valorOrigen: number; mesesAntiguedad: number; ipcAcumuladoPct: number; depreciacionAcumuladaPct: number; alicuotaImpuestoPct: number; }
export interface Outputs { valorRevaluado: number; depreciacionRevaluada: number; valorNeto: number; impuestoEspecial: number; ahorroAmortizacion: number; explicacion: string; _insight?: any; _chart?: any; }
export function revaluoFiscalBienesUsoEmpresa(i: Inputs): Outputs {
  const origen = Number(i.valorOrigen);
  const ipc = Number(i.ipcAcumuladoPct) / 100;
  const depPct = Number(i.depreciacionAcumuladaPct) / 100;
  const alicuota = Number(i.alicuotaImpuestoPct) / 100;
  if (!origen || origen <= 0) throw new Error('Ingresá el valor de origen');
  const revaluado = origen * (1 + ipc);
  const depRev = revaluado * depPct;
  const neto = revaluado - depRev;
  const incremento = neto - (origen * (1 - depPct));
  const impuestoEsp = incremento * alicuota;
  // Ahorro futuro en Ganancias por mayor amortización (35% sobre incremento)
  const ahorro = incremento * 0.35;
  const conviene = ahorro >= impuestoEsp;
  const fmt = (n: number) => Math.round(n).toLocaleString('es-AR');
  return {
    valorRevaluado: Number(revaluado.toFixed(2)),
    depreciacionRevaluada: Number(depRev.toFixed(2)),
    valorNeto: Number(neto.toFixed(2)),
    impuestoEspecial: Number(impuestoEsp.toFixed(2)),
    ahorroAmortizacion: Number(ahorro.toFixed(2)),
    explicacion: `Valor revaluado: $${revaluado.toFixed(2)}. Impuesto especial: $${impuestoEsp.toFixed(2)}. Ahorro estimado en Ganancias: $${ahorro.toFixed(2)}.`,
    _insight: {
      title: 'Conveniencia del revalúo',
      text: conviene
        ? `Pagás **$${fmt(impuestoEsp)}** de impuesto especial pero recuperás **$${fmt(ahorro)}** en menor Ganancias por la mayor amortización: el revalúo te deja a favor. Tras revaluar, el bien neto queda en **$${fmt(neto)}**.`
        : `El impuesto especial de **$${fmt(impuestoEsp)}** supera el ahorro estimado de **$${fmt(ahorro)}** en Ganancias. Conviene rehacer el número con tu alícuota real y horizonte de amortización antes de optar por el revalúo.`,
      tone: conviene ? 'good' : 'warn',
      icon: '🏭',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Valor neto', value: Number(neto.toFixed(2)) },
        { label: 'Depreciación acumulada', value: Number(depRev.toFixed(2)) },
      ],
      prefix: '$',
      centerValue: '$' + fmt(revaluado),
      centerLabel: 'Valor revaluado',
      ariaLabel: 'Composición del valor revaluado: valor neto contable más depreciación acumulada.',
    },
  };
}
