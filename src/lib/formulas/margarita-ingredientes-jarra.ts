/** Margarita */
export interface Inputs { personas: number; tragosPorPersona: number; mltequilablancoPorTrago: number; mltriplesecPorTrago: number; mljugodelimaPorTrago: number; }
export interface Outputs { totalTragos: number; totaltequilablanco: string; totaltriplesec: string; totaljugodelima: string; listaCompras: string; }

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

  return {
    totalTragos: tot,
    totaltequilablanco: fmt(tTeq),
    totaltriplesec: fmt(tTri),
    totaljugodelima: fmt(tLim),
    listaCompras: lista,
  };
}
