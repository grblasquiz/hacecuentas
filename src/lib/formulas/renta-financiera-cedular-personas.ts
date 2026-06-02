export interface Inputs { [k: string]: number | string; }
export interface Outputs {
  impuesto: string;
  gananciaNeta: string;
  interpretacion: string;
  _insight?: any;
  _chart?: any;
}
export function rentaFinancieraCedularPersonas(i: Inputs): Outputs {
  const g=Number(i.gananciaRealizada)||0; const a=Number(i.alicuota)||15;
  const imp=g*a/100; const neto=g-imp;

  const usd = (n: number) => 'USD ' + n.toFixed(2);
  const tone = a >= 25 ? 'warn' : a >= 15 ? 'neutral' : 'good';
  const _insight = {
    title: 'Impuesto cedular financiero',
    text: `Sobre una ganancia de **${usd(g)}**, el impuesto cedular del **${a}%** se lleva **${usd(imp)}**, dejándote **${usd(neto)}** netos.`,
    tone: tone as 'good' | 'neutral' | 'warn',
    icon: '📈',
  };

  // Donut: impuesto + ganancia neta suman la ganancia realizada.
  const _chart = g > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Ganancia neta', value: Number(neto.toFixed(2)) },
      { label: `Impuesto (${a}%)`, value: Number(imp.toFixed(2)) },
    ],
    prefix: 'USD ',
    centerValue: usd(g),
    centerLabel: 'Ganancia',
    ariaLabel: `Composición de la ganancia de ${usd(g)}: ganancia neta ${usd(neto)} e impuesto ${usd(imp)}`,
  } : undefined;

  return {
    impuesto: `USD ${imp.toFixed(2)}`,
    gananciaNeta: `USD ${neto.toFixed(2)}`,
    interpretacion: `Sobre ganancia USD ${g}: impuesto ${a}% = USD ${imp.toFixed(2)}. Neto USD ${neto.toFixed(2)}.`,
    _insight,
    _chart,
  };
}
