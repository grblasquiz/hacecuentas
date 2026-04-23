/** Mundial 2026 - Probabilidad de ganar penales */
export interface Inputs { seleccion1: string; seleccion2: string; }
export interface Outputs { prob1: string; prob2: string; favorito: string; historico: string; }

const HISTORICO: Record<string, number> = {
  'Alemania': 83,
  'Brasil': 73,
  'Argentina': 66,
  'Uruguay': 66,
  'Francia': 50,
  'España': 50,
  'Italia': 40,
  'Inglaterra': 33,
  'Países Bajos': 25,
  'Otra': 50,
};

function getHistorico(name: string): number {
  const key = Object.keys(HISTORICO).find(k => name.toLowerCase().startsWith(k.toLowerCase())) || 'Otra';
  return HISTORICO[key];
}

export function mundial2026ProbabilidadPenales(i: Inputs): Outputs {
  const s1 = String(i.seleccion1 || '');
  const s2 = String(i.seleccion2 || '');
  if (!s1 || !s2) throw new Error('Elegí ambas selecciones');
  const h1 = getHistorico(s1);
  const h2 = getHistorico(s2);
  const total = h1 + h2;
  const p1 = (h1 / total) * 100;
  const p2 = (h2 / total) * 100;
  let fav: string;
  if (Math.abs(p1 - p2) < 5) fav = `Paridad en los penales: ${s1} vs ${s2}, muy parejo.`;
  else if (p1 > p2) fav = `${s1} favorita con ${p1.toFixed(0)}% vs ${p2.toFixed(0)}% de ${s2}.`;
  else fav = `${s2} favorita con ${p2.toFixed(0)}% vs ${p1.toFixed(0)}% de ${s1}.`;

  return {
    prob1: `${s1}: ${p1.toFixed(0)}% (histórico ${h1}%)`,
    prob2: `${s2}: ${p2.toFixed(0)}% (histórico ${h2}%)`,
    favorito: fav,
    historico: `Récord histórico: Alemania 83%, Brasil 73%, Argentina 66%, Italia 40%, Inglaterra 33%. Base: tandas de penales en Mundiales FIFA.`,
  };
}
