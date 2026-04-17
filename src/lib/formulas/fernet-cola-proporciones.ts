/** Fernet Cola */
export interface Inputs { personas: number; tragosPorPersona: number; mlfernetbrancaPorTrago: number; mlcocacolaPorTrago: number; mlhieloPorTrago: number; }
export interface Outputs { totalTragos: number; totalfernetbranca: string; totalcocacola: string; totalhielo: string; listaCompras: string; }

export function fernetColaProporciones(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const f = Number(i.mlfernetbrancaPorTrago);
  const c = Number(i.mlcocacolaPorTrago);
  const h = Number(i.mlhieloPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const fmt = (ml: number) => `${ml}ml (${(ml / 1000).toFixed(2)}L)`;
  const botellasCoca = Math.ceil(c * tot * 1.15 / 2250); // botella 2.25L
  const lista = `Fernet: ${fmt(Math.ceil(f * tot * 1.15))} (${Math.ceil(f * tot * 1.15 / 750)} bot 750ml) | Coca: ${fmt(Math.ceil(c * tot * 1.15))} (${botellasCoca} bot 2.25L) | Hielo: ${((h * tot) / 1000).toFixed(1)}kg`;

  return {
    totalTragos: tot,
    totalfernetbranca: fmt(f * tot),
    totalcocacola: fmt(c * tot),
    totalhielo: `${h * tot}g (${((h * tot) / 1000).toFixed(1)}kg)`,
    listaCompras: lista,
  };
}
