/** Mundial 2026 - Probabilidad de ganar penales */
export interface Inputs { seleccion1: string; seleccion2: string; }
export interface Outputs { prob1: string; prob2: string; favorito: string; historico: string; _insight?: any; _chart?: any; }

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

  const parejo = Math.abs(p1 - p2) < 5;
  const favName = p1 >= p2 ? s1 : s2;
  const favPct = Math.max(p1, p2);
  const insightText = parejo
    ? `Por récord histórico en penales la tanda está muy pareja: **${s1} ${p1.toFixed(0)}%** vs **${s2} ${p2.toFixed(0)}%**. A esta altura define el momento y la frialdad, no el historial.`
    : `El historial en penales favorece a **${favName}** con **${favPct.toFixed(0)}%** de probabilidad. Ojo: es una referencia estadística, una tanda puntual tiene mucho de azar.`;

  return {
    prob1: `${s1}: ${p1.toFixed(0)}% (histórico ${h1}%)`,
    prob2: `${s2}: ${p2.toFixed(0)}% (histórico ${h2}%)`,
    favorito: fav,
    historico: `Récord histórico: Alemania 83%, Brasil 73%, Argentina 66%, Italia 40%, Inglaterra 33%. Base: tandas de penales en Mundiales FIFA.`,
    _insight: {
      title: 'Lectura de la tanda',
      text: insightText,
      tone: parejo ? 'neutral' : 'good',
      icon: '🥅',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: s1, value: Number(p1.toFixed(0)) },
        { label: s2, value: Number(p2.toFixed(0)) },
      ],
      prefix: '',
      centerValue: `${favPct.toFixed(0)}%`,
      centerLabel: favName,
      ariaLabel: `Probabilidad de ganar la tanda de penales: ${s1} ${p1.toFixed(0)}% contra ${s2} ${p2.toFixed(0)}%`,
    },
  };
}
