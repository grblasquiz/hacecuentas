/** Aperol Spritz */
export interface Inputs { personas: number; tragosPorPersona: number; mlaperolPorTrago: number; mlproseccoPorTrago: number; mlsodaPorTrago: number; }
export interface Outputs { totalTragos: number; totalaperol: string; totalprosecco: string; totalsoda: string; listaCompras: string; _insight?: any; _chart?: any; }

export function aperolSpritzProporciones(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const a = Number(i.mlaperolPorTrago);
  const pr = Number(i.mlproseccoPorTrago);
  const s = Number(i.mlsodaPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const fmt = (ml: number) => `${ml}ml (${(ml / 1000).toFixed(2)}L)`;
  const lista = `Aperol: ${fmt(Math.ceil(a * tot * 1.15))} (${Math.ceil(a * tot * 1.15 / 750)} bot) | Prosecco: ${fmt(Math.ceil(pr * tot * 1.15))} (${Math.ceil(pr * tot * 1.15 / 750)} bot) | Soda: ${fmt(Math.ceil(s * tot * 1.15))} | Naranjas: ${Math.ceil(tot / 4)} | Hielo: ${(p * 1).toFixed(1)}kg`;

  const mlAperol = a * tot;
  const mlProsecco = pr * tot;
  const mlSoda = s * tot;
  const mlTotal = mlAperol + mlProsecco + mlSoda;
  const litrosTotal = (mlTotal / 1000).toFixed(2);
  const botProsecco = Math.ceil(mlProsecco * 1.15 / 750);
  const _insight = {
    title: 'Tu tanda de Aperol Spritz',
    text: `Para **${p} persona${p === 1 ? '' : 's'}** salen **${tot} tragos** y unos **${litrosTotal} L** de mezcla en total. Comprá con margen: vas a necesitar al menos **${botProsecco} botella${botProsecco === 1 ? '' : 's'}** de prosecco.`,
    tone: 'neutral',
    icon: '🍹',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Aperol', value: Math.round(mlAperol) },
      { label: 'Prosecco', value: Math.round(mlProsecco) },
      { label: 'Soda', value: Math.round(mlSoda) },
    ],
    prefix: '',
    centerValue: `${litrosTotal} L`,
    centerLabel: 'mezcla total',
    ariaLabel: `Composición de la mezcla: ${Math.round(mlAperol)}ml de Aperol, ${Math.round(mlProsecco)}ml de prosecco y ${Math.round(mlSoda)}ml de soda`,
  };
  return {
    totalTragos: tot,
    totalaperol: fmt(a * tot),
    totalprosecco: fmt(pr * tot),
    totalsoda: fmt(s * tot),
    listaCompras: lista,
    _insight,
    _chart,
  };
}
