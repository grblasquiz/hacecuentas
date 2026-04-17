/** Cosmopolitan */
export interface Inputs { personas: number; tragosPorPersona: number; mlvodkacitrusPorTrago: number; mlcointreauPorTrago: number; mljugodelimaPorTrago: number; mljugodearandanosPorTrago: number; }
export interface Outputs { totalTragos: number; totalvodkacitrus: string; totalcointreau: string; totaljugodelima: string; totaljugodearandanos: string; listaCompras: string; }

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

  return {
    totalTragos: tot,
    totalvodkacitrus: fmt(v * tot),
    totalcointreau: fmt(c * tot),
    totaljugodelima: fmt(l * tot),
    totaljugodearandanos: fmt(ar * tot),
    listaCompras: lista,
  };
}
