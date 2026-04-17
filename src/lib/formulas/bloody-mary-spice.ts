/** Bloody Mary */
export interface Inputs { personas: number; tragosPorPersona: number; mlvodkaPorTrago: number; mljugodetomatePorTrago: number; mljugodelimonPorTrago: number; mlsalsaworcestershirePorTrago: number; mltabascoPorTrago: number; mlsalypimientaPorTrago: number; }
export interface Outputs { totalTragos: number; totalvodka: string; totaljugodetomate: string; totaljugodelimon: string; totalsalsaworcestershire: string; totaltabasco: string; totalsalypimienta: string; listaCompras: string; }

export function bloodyMarySpice(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const v = Number(i.mlvodkaPorTrago);
  const to = Number(i.mljugodetomatePorTrago);
  const l = Number(i.mljugodelimonPorTrago);
  const w = Number(i.mlsalsaworcestershirePorTrago);
  const tb = Number(i.mltabascoPorTrago);
  const s = Number(i.mlsalypimientaPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const fmt = (ml: number) => `${ml}ml`;
  const lista = `Vodka: ${fmt(Math.ceil(v * tot * 1.15))} (${Math.ceil(v * tot * 1.15 / 750)} bot) | Jugo tomate: ${fmt(Math.ceil(to * tot * 1.15))} (${Math.ceil(to * tot * 1.15 / 1000)} L) | Limones: ${Math.ceil(l * tot / 30)} | Worcestershire: botella 140ml | Tabasco: botella 60ml | Apio: ${tot} palitos | Hielo: ${(p * 0.6).toFixed(1)}kg`;

  return {
    totalTragos: tot,
    totalvodka: fmt(v * tot),
    totaljugodetomate: fmt(to * tot),
    totaljugodelimon: fmt(l * tot),
    totalsalsaworcestershire: `${w * tot}ml (${Math.ceil(w * tot / 3)} dashes)`,
    totaltabasco: `${tb * tot}ml (${Math.ceil(tb * tot / 1)} gotas)`,
    totalsalypimienta: `${s * tot}g (a gusto)`,
    listaCompras: lista,
  };
}
