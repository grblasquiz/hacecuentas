/** Manhattan */
export interface Inputs { personas: number; tragosPorPersona: number; mlryewhiskeyPorTrago: number; mlvermouthrossoPorTrago: number; mlbitterangosturaPorTrago: number; }
export interface Outputs { totalTragos: number; totalryewhiskey: string; totalvermouthrosso: string; totalbitterangostura: string; listaCompras: string; }

export function manhattanClasico(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const w = Number(i.mlryewhiskeyPorTrago);
  const v = Number(i.mlvermouthrossoPorTrago);
  const b = Number(i.mlbitterangosturaPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const fmt = (ml: number) => `${ml}ml`;
  const lista = `Rye Whiskey: ${fmt(Math.ceil(w * tot * 1.15))} (${Math.ceil(w * tot * 1.15 / 750)} bot) | Vermouth rosso: ${fmt(Math.ceil(v * tot * 1.15))} | Angostura: ${Math.ceil(b * tot / 2)} dashes | Cerezas: ${tot} | Hielo: ${(p * 0.3).toFixed(1)}kg`;

  return {
    totalTragos: tot,
    totalryewhiskey: fmt(w * tot),
    totalvermouthrosso: fmt(v * tot),
    totalbitterangostura: `${b * tot}ml (${Math.ceil(b * tot / 2)} dashes)`,
    listaCompras: lista,
  };
}
