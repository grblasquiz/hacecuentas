/** Calculadora de cuota de crédito UVA */
export interface Inputs { montoPrestamoUVAs: number; tasaAnual: number; plazoAnios: number; valorUVAHoy: number; }
export interface Outputs { cuotaPesos: number; cuotaUVAs: number; totalPagado: number; interesesTotales: number; _chart?: any; _insight?: any; }

export function creditoUvaCuotaActual(i: Inputs): Outputs {
  const monto = Number(i.montoPrestamoUVAs);
  const tasaAnual = Number(i.tasaAnual);
  const plazo = Number(i.plazoAnios);
  const uva = Number(i.valorUVAHoy);

  if (!monto || monto <= 0) throw new Error('Ingresá el monto en UVAs');
  if (tasaAnual < 0) throw new Error('La tasa no puede ser negativa');
  if (!plazo || plazo <= 0) throw new Error('Ingresá el plazo');
  if (!uva || uva <= 0) throw new Error('Ingresá el valor UVA de hoy');

  const tasaMensual = tasaAnual / 100 / 12;
  const meses = plazo * 12;

  let cuotaUVAs: number;
  if (tasaMensual > 0) {
    cuotaUVAs = monto * (tasaMensual * Math.pow(1 + tasaMensual, meses)) / (Math.pow(1 + tasaMensual, meses) - 1);
  } else {
    cuotaUVAs = monto / meses;
  }

  const totalPagado = cuotaUVAs * meses;
  const interesesTotales = totalPagado - monto;
  const cuotaPesos = cuotaUVAs * uva;

  const chart = interesesTotales > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Capital (UVAs)', value: Math.round(monto) },
      { label: 'Intereses (UVAs)', value: Math.round(interesesTotales) },
    ],
    prefix: '',
    centerValue: Math.round(totalPagado).toLocaleString('es-AR') + ' UVAs',
    centerLabel: 'Total a pagar',
    ariaLabel: 'Composición del total a pagar del crédito UVA: capital más intereses',
  } : undefined;

  const pctInteres = totalPagado > 0 ? Math.round((interesesTotales / totalPagado) * 100) : 0;
  const insight = {
    title: 'Capital vs intereses',
    text: `De cada cuota, el capital es **${100 - pctInteres}%** y los intereses **${pctInteres}%** del total a pagar (**${Math.round(totalPagado).toLocaleString('es-AR')} UVAs**). Recordá que en un crédito UVA el saldo se ajusta por inflación: tu cuota en pesos sube mes a mes aunque en UVAs sea fija.`,
    tone: pctInteres >= 50 ? 'warn' : 'neutral',
    icon: '🏠',
  };

  return {
    cuotaPesos: Math.round(cuotaPesos),
    cuotaUVAs: Math.round(cuotaUVAs * 100) / 100,
    totalPagado: Math.round(totalPagado),
    interesesTotales: Math.round(interesesTotales),
    _chart: chart,
    _insight: insight,
  };
}
