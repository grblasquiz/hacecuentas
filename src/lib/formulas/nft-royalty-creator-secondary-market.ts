export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _chart?: any; _insight?: any; }
export function nftRoyaltyCreatorSecondaryMarket(i: Inputs): Outputs {
  const v=Number(i.ventaSecundariaUsd)||0; const r=Number(i.royaltyPorcentaje)||0;
  const rec=v*r/100; const neto=v-rec;
  const insight = {
    title: 'Cómo se reparte la reventa',
    text: `De la venta de **USD ${v.toFixed(2)}**, el royalty del **${r}%** le deja **USD ${rec.toFixed(2)}** al creador y **USD ${neto.toFixed(2)}** al vendedor.`,
    tone: 'neutral',
    icon: '🖼️',
  };
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Vendedor (neto)', value: Number(neto.toFixed(2)) },
      { label: 'Creador (royalty)', value: Number(rec.toFixed(2)) },
    ],
    prefix: 'USD ',
    centerValue: 'USD ' + v.toFixed(2),
    centerLabel: 'Venta secundaria',
    ariaLabel: 'Reparto de la venta secundaria entre el neto del vendedor y el royalty del creador',
  };
  return { royaltyRecibido:`USD ${rec.toFixed(2)}`, neto:`USD ${neto.toFixed(2)}`, interpretacion:`Con ${r}% royalty: creator recibe USD ${rec.toFixed(2)}, vendedor USD ${neto.toFixed(2)}.`, _chart: chart, _insight: insight };
}
