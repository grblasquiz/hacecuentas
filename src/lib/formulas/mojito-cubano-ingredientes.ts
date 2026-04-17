/** Mojito */
export interface Inputs { personas: number; tragosPorPersona: number; mlronblancoPorTrago: number; mlazucarPorTrago: number; mljugodelimaPorTrago: number; mlsodaPorTrago: number; mlhojasdementaPorTrago: number; }
export interface Outputs { totalTragos: number; totalronblanco: string; totalazucar: string; totaljugodelima: string; totalsoda: string; totalhojasdementa: string; listaCompras: string; }

export function mojitoCubanoIngredientes(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const r = Number(i.mlronblancoPorTrago);
  const a = Number(i.mlazucarPorTrago);
  const l = Number(i.mljugodelimaPorTrago);
  const s = Number(i.mlsodaPorTrago);
  const m = Number(i.mlhojasdementaPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const limones = Math.ceil((l * tot) / 30);
  const fmt = (ml: number) => `${ml}ml`;
  const lista = `Ron blanco: ${Math.ceil(r * tot * 1.15)}ml (${Math.ceil(r * tot * 1.15 / 750)} botellas) | Azúcar: ${Math.ceil(a * tot * 1.1)}g | Limas: ${limones} | Soda: ${Math.ceil(s * tot * 1.15)}ml | Menta: ${Math.ceil(m * tot / 8)} atados grandes | Hielo: ${(p * 0.8).toFixed(1)}kg`;

  return {
    totalTragos: tot,
    totalronblanco: fmt(r * tot),
    totalazucar: `${a * tot} g`,
    totaljugodelima: fmt(l * tot),
    totalsoda: fmt(s * tot),
    totalhojasdementa: `${m * tot} hojas (${Math.ceil(m * tot / 8)} atados)`,
    listaCompras: lista,
  };
}
