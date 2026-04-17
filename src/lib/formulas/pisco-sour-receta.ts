/** Pisco Sour */
export interface Inputs { personas: number; tragosPorPersona: number; mlpiscoPorTrago: number; mljugodelimonPorTrago: number; mljarabesimplePorTrago: number; mlclaradehuevoPorTrago: number; }
export interface Outputs { totalTragos: number; totalpisco: string; totaljugodelimon: string; totaljarabesimple: string; totalclaradehuevo: string; listaCompras: string; }

export function piscoSourReceta(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const pi = Number(i.mlpiscoPorTrago);
  const lim = Number(i.mljugodelimonPorTrago);
  const j = Number(i.mljarabesimplePorTrago);
  const cl = Number(i.mlclaradehuevoPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const limones = Math.ceil((lim * tot) / 25); // lima sutil ~25ml
  const huevos = Math.ceil((cl * tot) / 30);
  const fmt = (ml: number) => `${ml}ml (${(ml / 1000).toFixed(2)}L)`;
  const lista = `Pisco: ${fmt(Math.ceil(pi * tot * 1.15))} (${Math.ceil(pi * tot * 1.15 / 750)} bot) | Limones: ${limones} | Jarabe: ${fmt(Math.ceil(j * tot * 1.15))} | Huevos: ${huevos} | Amargo angostura: 1 botella 90ml | Hielo: ${(p * 0.5).toFixed(1)}kg`;

  return {
    totalTragos: tot,
    totalpisco: fmt(pi * tot),
    totaljugodelimon: fmt(lim * tot),
    totaljarabesimple: fmt(j * tot),
    totalclaradehuevo: `${cl * tot}ml (${huevos} huevos)`,
    listaCompras: lista,
  };
}
