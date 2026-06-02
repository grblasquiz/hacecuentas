/** Plan de Repaso Óptimo para Examen */
export interface Inputs {
  [k: string]: any;
  __lang?: string;
}
export interface Outputs {
  repaso1: number;
  repaso2: number;
  repaso3: number;
  repaso4: number;
  repaso5: number;
  diaUltimoRepaso: string;
  _insight?: any;
}

export function repasoOptimoExamen(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      minDias: 'Mínimo 3 días',
      insightTitle: 'Repasos cada vez más espaciados',
    },
    en: {
      minDias: 'Minimum 3 days',
      insightTitle: 'Reviews spaced further apart',
    },
  } as const)[__lang];

  const dias = Number(i.diasHastaExamen) || 30;
  const n = Number(i.cantidadRepasos) || 4;
  if (dias < 3) throw new Error(T.minDias);

  // Distribución logarítmica: intervalos crecientes
  const ultimoDia = Math.max(dias - Math.max(3, Math.round(dias * 0.1)), Math.ceil(dias * 0.7));
  const out: any = { repaso1: 1, repaso2: 0, repaso3: 0, repaso4: 0, repaso5: 0 };

  // Repartir entre día 1 y ultimoDia con espaciado creciente
  const puntos: number[] = [1];
  for (let k = 1; k < n; k++) {
    const frac = Math.pow(k / (n - 1), 1.5); // curvatura exponencial
    puntos.push(Math.round(1 + (ultimoDia - 1) * frac));
  }

  out.repaso1 = puntos[0] || 0;
  out.repaso2 = puntos[1] || 0;
  out.repaso3 = puntos[2] || 0;
  out.repaso4 = puntos[3] || 0;
  out.repaso5 = puntos[4] || 0;

  out.diaUltimoRepaso = __lang === 'en'
    ? `${dias - ultimoDia} days before the exam`
    : `${dias - ultimoDia} días antes del examen`;

  // Insight: repaso espaciado — los intervalos crecen y el último cae cerca del examen.
  const usados = puntos.filter((p, idx) => idx === 0 || p !== puntos[idx - 1]);
  const primerIntervalo = (puntos[1] ?? puntos[0]) - puntos[0];
  const ultimoIntervalo = puntos[n - 1] - (puntos[n - 2] ?? puntos[n - 1]);
  const diasAntes = dias - ultimoDia;
  out._insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `Spread your **${usados.length} reviews** over ${dias} days starting on day **1**: the gaps grow from **${primerIntervalo} day(s)** to **${ultimoIntervalo} day(s)**, and the last one lands **${diasAntes} day(s)** before the exam — exactly when spaced repetition fights forgetting best.`
      : `Repartí los **${usados.length} repasos** en ${dias} días arrancando el día **1**: los intervalos crecen de **${primerIntervalo} día(s)** a **${ultimoIntervalo} día(s)** y el último cae **${diasAntes} día(s)** antes del examen, justo cuando la repetición espaciada combate mejor el olvido.`,
    tone: 'neutral' as const,
    icon: '📚',
  };

  return out;

}
