/** Gin Tonic */
export interface Inputs { personas: number; tragosPorPersona: number; mlginPorTrago: number; mltonicaPorTrago: number; }
export interface Outputs { totalTragos: number; totalgin: string; totaltonica: string; listaCompras: string; }

export function ginTonicProporciones(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const g = Number(i.mlginPorTrago);
  const to = Number(i.mltonicaPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const botellasTonica = Math.ceil(to * tot * 1.15 / 200); // tónicas de 200ml
  const fmt = (ml: number) => `${ml}ml (${(ml / 1000).toFixed(2)}L)`;
  const lista = `Gin: ${fmt(Math.ceil(g * tot * 1.15))} (${Math.ceil(g * tot * 1.15 / 750)} bot 750ml) | Tónica: ${botellasTonica} bot 200ml | Limones/pepinos: ${Math.ceil(tot / 4)} | Hielo (macizo): ${(p * 0.8).toFixed(1)}kg`;

  return {
    totalTragos: tot,
    totalgin: fmt(g * tot),
    totaltonica: fmt(to * tot),
    listaCompras: lista,
  };
}
