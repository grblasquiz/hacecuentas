/**
 * Calculadora de rendimiento FCI money market
 * Capitalización diaria: VF = monto × (1 + TNA/365)^días
 */

export interface RendimientoFciMoneyMarketInputs {
  monto: number;
  tna: number;
  plazoDias: number;
}

export interface RendimientoFciMoneyMarketOutputs {
  gananciaTotal: number;
  gananciaPorDia: number;
  valorFinal: number;
  teaEquivalente: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function rendimientoFciMoneyMarket(
  inputs: RendimientoFciMoneyMarketInputs
): RendimientoFciMoneyMarketOutputs {
  const monto = Number(inputs.monto);
  const tna = Number(inputs.tna);
  const dias = Math.round(Number(inputs.plazoDias));

  if (!monto || monto <= 0) throw new Error('Ingresá el monto a invertir');
  if (!tna || tna <= 0) throw new Error('Ingresá la TNA del fondo');
  if (!dias || dias <= 0) throw new Error('Ingresá el plazo en días');

  const tasaDiaria = tna / 100 / 365;
  const factorDiario = 1 + tasaDiaria;
  const valorFinal = monto * Math.pow(factorDiario, dias);
  const gananciaTotal = valorFinal - monto;
  const gananciaPorDia = gananciaTotal / dias;

  // TEA equivalente
  const tea = (Math.pow(factorDiario, 365) - 1) * 100;

  const rendPct = ((gananciaTotal / monto) * 100).toFixed(2);

  const insight = {
    title: 'Tu rendimiento',
    text: `Con **$${monto.toLocaleString('es-AR')}** al ${tna}% TNA durante ${dias} días ganás **$${Math.round(gananciaTotal).toLocaleString('es-AR')}** (**${rendPct}%**), ~$${Math.round(gananciaPorDia).toLocaleString('es-AR')}/día. La capitalización diaria del money market deja una TEA de **${tea.toFixed(1)}%**.`,
    tone: 'good',
    icon: '💰',
  };
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Capital invertido', value: Math.round(monto) },
      { label: 'Ganancia', value: Math.round(gananciaTotal) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(valorFinal).toLocaleString('es-AR'),
    centerLabel: 'Valor final',
    ariaLabel: 'Composición del valor final entre el capital invertido y la ganancia generada.',
  };

  return {
    gananciaTotal: Math.round(gananciaTotal),
    gananciaPorDia: Math.round(gananciaPorDia),
    valorFinal: Math.round(valorFinal),
    teaEquivalente: `${tea.toFixed(1)}% TEA`,
    detalle: `Con $${monto.toLocaleString('es-AR')} al ${tna}% TNA durante ${dias} días, ganás $${Math.round(gananciaTotal).toLocaleString('es-AR')} (${rendPct}%). Eso es ~$${Math.round(gananciaPorDia).toLocaleString('es-AR')}/día. Valor final: $${Math.round(valorFinal).toLocaleString('es-AR')}. TEA equivalente: ${tea.toFixed(1)}%.`,
    _insight: insight,
    _chart: chart,
  };
}
