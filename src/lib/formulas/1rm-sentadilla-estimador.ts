export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function rmSentadillaEstimador(i: Inputs): Outputs {
  const __lang = i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      label: '1RM estimado', desde: 'desde',
      insTitle: 'Cómo leer tu 1RM',
      insMid: (rm: string, p: number, r: number) => `Con **${p} kg × ${r} reps** tu máximo de una repetición ronda los **${rm} kg** (fórmula de Epley). Para entrenar fuerza apuntá a 1-5 reps con 85-95% de ese valor; para hipertrofia, 8-12 reps al 67-75%.`,
      insHigh: (rm: string, p: number, r: number) => `Estimar el 1RM con **${r} reps** infla el margen de error: la fórmula de Epley es más precisa de 1 a 6 repeticiones. Tu 1RM real con **${p} kg** probablemente sea algo menor que los **${rm} kg** calculados.`,
      insOne: (rm: string, p: number) => `Levantaste **${p} kg** a una sola repetición, así que **${rm} kg** ya es tu 1RM medido, no una estimación. Usalo como base para calcular tus porcentajes de carga.`,
    },
    pt: {
      label: '1RM estimado', desde: 'de',
      insTitle: 'Como ler seu 1RM',
      insMid: (rm: string, p: number, r: number) => `Com **${p} kg × ${r} reps** sua repetição máxima fica em torno de **${rm} kg** (fórmula de Epley). Para treinar força mire 1-5 reps com 85-95% desse valor; para hipertrofia, 8-12 reps a 67-75%.`,
      insHigh: (rm: string, p: number, r: number) => `Estimar o 1RM com **${r} reps** aumenta a margem de erro: a fórmula de Epley é mais precisa de 1 a 6 repetições. Seu 1RM real com **${p} kg** provavelmente é um pouco menor que os **${rm} kg** calculados.`,
      insOne: (rm: string, p: number) => `Você levantou **${p} kg** em uma única repetição, então **${rm} kg** já é seu 1RM medido, não uma estimativa. Use-o como base para calcular suas porcentagens de carga.`,
    },
  } as const)[__lang];
  const p = Number(i.peso) || 0; const r = Number(i.reps) || 1;
  const rm = p * (1 + r / 30);
  const rmFmt = rm.toFixed(0);
  let insText: string; let insTone: 'good' | 'warn' | 'neutral';
  if (r <= 1) { insText = T.insOne(rmFmt, p); insTone = 'good'; }
  else if (r > 10) { insText = T.insHigh(rmFmt, p, r); insTone = 'warn'; }
  else { insText = T.insMid(rmFmt, p, r); insTone = 'neutral'; }
  return {
    rm1: rm.toFixed(1) + ' kg',
    resumen: `${T.label}: ${rmFmt} kg ${T.desde} ${p}kg × ${r} reps.`,
    _insight: { title: T.insTitle, text: insText, tone: insTone, icon: '🏋️' },
  };
}
