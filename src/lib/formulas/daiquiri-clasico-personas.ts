/** Daiquiri */
export interface Inputs { personas: number; tragosPorPersona: number; mlronblancoPorTrago: number; mljugodelimaPorTrago: number; mljarabesimplePorTrago: number; }
export interface Outputs { totalTragos: number; totalronblanco: string; totaljugodelima: string; totaljarabesimple: string; listaCompras: string; }

export function daiquiriClasicoPersonas(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const r = Number(i.mlronblancoPorTrago);
  const lim = Number(i.mljugodelimaPorTrago);
  const j = Number(i.mljarabesimplePorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const limones = Math.ceil((lim * tot) / 30);
  const fmt = (ml: number) => `${ml}ml (${(ml / 1000).toFixed(2)}L)`;
  const lista = `Ron blanco: ${fmt(Math.ceil(r * tot * 1.15))} (${Math.ceil(r * tot * 1.15 / 750)} botellas) | Limas: ${limones} | Jarabe: ${fmt(Math.ceil(j * tot * 1.15))} | Hielo: ${(p * 0.5).toFixed(1)}kg`;

  return {
    totalTragos: tot,
    totalronblanco: fmt(r * tot),
    totaljugodelima: fmt(lim * tot),
    totaljarabesimple: fmt(j * tot),
    listaCompras: lista,
  };
}
