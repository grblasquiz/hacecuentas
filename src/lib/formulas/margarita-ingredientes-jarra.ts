/** Margarita */
export interface Inputs { personas: number; tragosPorPersona: number; mltequilablancoPorTrago: number; mltriplesecPorTrago: number; mljugodelimaPorTrago: number; }
export interface Outputs { totalTragos: number; totaltequilablanco: string; totaltriplesec: string; totaljugodelima: string; listaCompras: string; _insight?: any; _chart?: any; }

export function margaritaIngredientesJarra(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const teq = Number(i.mltequilablancoPorTrago);
  const tri = Number(i.mltriplesecPorTrago);
  const lim = Number(i.mljugodelimaPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const tTeq = teq * tot;
  const tTri = tri * tot;
  const tLim = lim * tot;
  const limones = Math.ceil(tLim / 30); // 1 lima ≈ 30ml jugo
  const fmt = (ml: number) => `${ml}ml (${(ml / 1000).toFixed(2)}L)`;
  const lista = `Tequila: ${fmt(Math.ceil(tTeq * 1.15))} (${Math.ceil(tTeq * 1.15 / 750)} botellas) | Triple sec: ${fmt(Math.ceil(tTri * 1.15))} | Limas: ${limones} unidades | Sal gruesa: 100g | Hielo: ${(p * 0.5).toFixed(1)}kg`;

  const totalLiquido = tTeq + tTri + tLim;
  const botellasTeq = Math.ceil(tTeq * 1.15 / 750);
  const _insight = {
    title: 'Tu jarra de margaritas',
    text: `Para **${p} persona${p === 1 ? '' : 's'}** y **${tot} tragos** vas a necesitar unos **${(totalLiquido / 1000).toFixed(2)} L** de mezcla: **${(tTeq / 1000).toFixed(2)} L** de tequila, **${(tTri / 1000).toFixed(2)} L** de triple sec y **${(tLim / 1000).toFixed(2)} L** de jugo de lima (${limones} limas). Comprá **${botellasTeq} botella${botellasTeq === 1 ? '' : 's'}** de tequila con margen de sobra.`,
    tone: 'good',
    icon: '🍹',
  };
  const _chart = totalLiquido > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Tequila', value: Number(tTeq.toFixed(0)) },
      { label: 'Triple sec', value: Number(tTri.toFixed(0)) },
      { label: 'Jugo de lima', value: Number(tLim.toFixed(0)) },
    ].filter((s) => s.value > 0),
    prefix: '',
    centerValue: `${(totalLiquido / 1000).toFixed(2)} L`,
    centerLabel: 'Mezcla total',
    ariaLabel: 'Composición en mililitros de la mezcla de margarita: tequila, triple sec y jugo de lima.',
  } : undefined;
  return {
    totalTragos: tot,
    totaltequilablanco: fmt(tTeq),
    totaltriplesec: fmt(tTri),
    totaljugodelima: fmt(tLim),
    listaCompras: lista,
    _insight,
    _chart,
  };
}
