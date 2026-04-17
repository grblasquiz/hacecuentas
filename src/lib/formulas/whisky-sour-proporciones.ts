/** Whisky Sour */
export interface Inputs { personas: number; tragosPorPersona: number; mlwhiskyPorTrago: number; mljugodelimonPorTrago: number; mljarabesimplePorTrago: number; mlclaradehuevoPorTrago: number; }
export interface Outputs { totalTragos: number; totalwhisky: string; totaljugodelimon: string; totaljarabesimple: string; totalclaradehuevo: string; listaCompras: string; }

export function whiskySourProporciones(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const w = Number(i.mlwhiskyPorTrago);
  const lim = Number(i.mljugodelimonPorTrago);
  const j = Number(i.mljarabesimplePorTrago);
  const cl = Number(i.mlclaradehuevoPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const limones = Math.ceil((lim * tot) / 30);
  const huevos = Math.ceil((cl * tot) / 30);
  const fmt = (ml: number) => `${ml}ml (${(ml / 1000).toFixed(2)}L)`;
  const lista = `Whisky: ${fmt(Math.ceil(w * tot * 1.15))} (${Math.ceil(w * tot * 1.15 / 750)} botellas) | Limones: ${limones} | Jarabe: ${fmt(Math.ceil(j * tot * 1.15))} | Huevos: ${huevos} | Hielo: ${(p * 0.5).toFixed(1)}kg | Cerezas al marrasquino: ${tot} unidades`;

  return {
    totalTragos: tot,
    totalwhisky: fmt(w * tot),
    totaljugodelimon: fmt(lim * tot),
    totaljarabesimple: fmt(j * tot),
    totalclaradehuevo: `${cl * tot}ml (${huevos} huevos)`,
    listaCompras: lista,
  };
}
