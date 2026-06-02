/** Cosmopolitan */
export interface Inputs { personas: number; tragosPorPersona: number; mlvodkacitrusPorTrago: number; mlcointreauPorTrago: number; mljugodelimaPorTrago: number; mljugodearandanosPorTrago: number; }
export interface Outputs { totalTragos: number; totalvodkacitrus: string; totalcointreau: string; totaljugodelima: string; totaljugodearandanos: string; listaCompras: string; _insight?: any; _chart?: any; }

export function cosmopolitanIngredientes(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const v = Number(i.mlvodkacitrusPorTrago);
  const c = Number(i.mlcointreauPorTrago);
  const l = Number(i.mljugodelimaPorTrago);
  const ar = Number(i.mljugodearandanosPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const limas = Math.ceil((l * tot) / 30);
  const fmt = (ml: number) => `${ml}ml (${(ml / 1000).toFixed(2)}L)`;
  const lista = `Vodka cítrico: ${fmt(Math.ceil(v * tot * 1.15))} (${Math.ceil(v * tot * 1.15 / 750)} bot) | Cointreau: ${fmt(Math.ceil(c * tot * 1.15))} | Limas: ${limas} | Jugo arándanos: ${fmt(Math.ceil(ar * tot * 1.15))} (${Math.ceil(ar * tot * 1.15 / 1000)}L) | Hielo: ${(p * 0.5).toFixed(1)}kg`;

  const mlVodka = v * tot;
  const mlCointreau = c * tot;
  const mlLima = l * tot;
  const mlArandanos = ar * tot;
  const mlTotal = mlVodka + mlCointreau + mlLima + mlArandanos;

  return {
    totalTragos: tot,
    totalvodkacitrus: fmt(mlVodka),
    totalcointreau: fmt(mlCointreau),
    totaljugodelima: fmt(mlLima),
    totaljugodearandanos: fmt(mlArandanos),
    listaCompras: lista,
    _insight: {
      title: 'Tu tanda de Cosmopolitan',
      text: `Para **${p} persona${p > 1 ? 's' : ''}** (${t} trago${t > 1 ? 's' : ''} c/u) salen **${tot} cocktails** y unos **${(mlTotal / 1000).toFixed(1)} L** de líquido. La lista de compras ya incluye un 15% extra de alcohol y jugos para no quedarte corto.`,
      tone: 'neutral',
      icon: '🍸',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Vodka cítrico', value: Math.round(mlVodka) },
        { label: 'Cointreau', value: Math.round(mlCointreau) },
        { label: 'Jugo de lima', value: Math.round(mlLima) },
        { label: 'Jugo de arándanos', value: Math.round(mlArandanos) },
      ],
      prefix: '',
      centerValue: `${(mlTotal / 1000).toFixed(1)} L`,
      centerLabel: 'líquido total',
      ariaLabel: `Composición de la tanda: vodka, cointreau, jugo de lima y jugo de arándanos para ${tot} cocktails`,
    },
  };
}
