/** Aperol Spritz */
export interface Inputs { personas: number; tragosPorPersona: number; mlaperolPorTrago: number; mlproseccoPorTrago: number; mlsodaPorTrago: number; }
export interface Outputs { totalTragos: number; totalaperol: string; totalprosecco: string; totalsoda: string; listaCompras: string; }

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

  return {
    totalTragos: tot,
    totalaperol: fmt(a * tot),
    totalprosecco: fmt(pr * tot),
    totalsoda: fmt(s * tot),
    listaCompras: lista,
  };
}
