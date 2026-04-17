/** Caipirinha */
export interface Inputs { personas: number; tragosPorPersona: number; mlcachacaPorTrago: number; mllimaPorTrago: number; mlazucarPorTrago: number; }
export interface Outputs { totalTragos: number; totalcachaca: string; totallima: string; totalazucar: string; listaCompras: string; }

export function caipirinhaBrasileno(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const ca = Number(i.mlcachacaPorTrago);
  const li = Number(i.mllimaPorTrago);
  const az = Number(i.mlazucarPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const limas = Math.ceil((li * tot) / 60); // media lima por trago, ~60g
  const fmt = (ml: number) => `${ml}ml`;
  const lista = `Cachaça: ${fmt(Math.ceil(ca * tot * 1.15))} (${Math.ceil(ca * tot * 1.15 / 750)} bot 750ml) | Limas: ${limas} unidades | Azúcar: ${Math.ceil(az * tot * 1.1)}g | Hielo: ${(p * 0.8).toFixed(1)}kg`;

  return {
    totalTragos: tot,
    totalcachaca: fmt(ca * tot),
    totallima: `${li * tot}g (${limas} limas)`,
    totalazucar: `${az * tot} g`,
    listaCompras: lista,
  };
}
