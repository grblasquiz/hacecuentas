export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function rmPesoMuertoEstimador(i: Inputs): Outputs {
  const __lang = i.__lang === 'pt' ? 'pt' : 'es';
  const p = Number(i.peso) || 0; const r = Number(i.reps) || 1;
  const rm = p * (1 + r / 30);
  const resumen = __lang === 'pt'
    ? `1RM estimado: ${rm.toFixed(0)} kg a partir de ${p}kg × ${r} reps.`
    : `1RM estimado: ${rm.toFixed(0)} kg desde ${p}kg × ${r} reps.`;

  const rmF = rm.toFixed(1);
  const fuerza = (rm * 0.85).toFixed(0);
  const hipertrofiaLo = (rm * 0.70).toFixed(0);
  const hipertrofiaHi = (rm * 0.80).toFixed(0);
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (r <= 1) {
    insightTone = 'good';
    insightText = __lang === 'pt'
      ? `Com 1 rep, **${p} kg já é seu 1RM real** no levantamento terra. Para força treine perto de **${fuerza} kg** (85%); para hipertrofia, **${hipertrofiaLo}–${hipertrofiaHi} kg**.`
      : `Con 1 rep, **${p} kg ya es tu 1RM real** en peso muerto. Para fuerza entrená cerca de **${fuerza} kg** (85%); para hipertrofia, **${hipertrofiaLo}–${hipertrofiaHi} kg**.`;
  } else if (r <= 6) {
    insightTone = 'good';
    insightText = __lang === 'pt'
      ? `De **${p} kg × ${r} reps**, seu 1RM de terra é **${rmF} kg** — estimativa confiável. Treine força a **${fuerza} kg** ou hipertrofia a **${hipertrofiaLo}–${hipertrofiaHi} kg**.`
      : `Desde **${p} kg × ${r} reps**, tu 1RM de peso muerto es **${rmF} kg** — estimación confiable. Entrená fuerza a **${fuerza} kg** o hipertrofia a **${hipertrofiaLo}–${hipertrofiaHi} kg**.`;
  } else {
    insightTone = 'warn';
    insightText = __lang === 'pt'
      ? `Com **${r} reps**, o **${rmF} kg** tem erro de ~10%+. Refaça o teste com 3–6 reps para precisão; por ora, trabalhe a **${hipertrofiaLo}–${hipertrofiaHi} kg**.`
      : `Con **${r} reps**, el **${rmF} kg** arrastra un error de ~10%+. Repetí el test con 3–6 reps para precisión; por ahora trabajá a **${hipertrofiaLo}–${hipertrofiaHi} kg**.`;
  }
  const _insight = {
    title: __lang === 'pt' ? 'Seu 1RM no terra' : 'Tu 1RM en peso muerto',
    text: insightText,
    tone: insightTone,
    icon: '🏋️',
  };

  return { rm1: rm.toFixed(1) + ' kg', resumen, _insight };
}
