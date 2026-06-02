/** ¿Cuánto tarda escribir una tesis? */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  horasTotales: number;
  semanas: number;
  meses: number;
  desgloseEtapas: string;
  _insight?: any;
  _chart?: any;
}

export function tiempoEscribirTesisPalabras(i: Inputs): Outputs {
  const pal = Number(i.palabrasObjetivo) || 30000;
  const hsem = Number(i.horasSemana) || 15;
  const exp = String(i.experiencia || 'alguna');
  if (pal <= 0 || hsem <= 0) throw new Error('Datos inválidos');

  const HXP: Record<string, number> = { ninguna: 0.045, alguna: 0.035, buena: 0.025 };
  const hxp = HXP[exp] || 0.035;

  const horas = Math.round(pal * hxp);
  const sem = Math.round(horas / hsem);
  const meses = Math.round(sem / 4.33 * 10) / 10;

  const invest = Math.round(horas * 0.4);
  const draft = Math.round(horas * 0.25);
  const rev = Math.round(horas * 0.2);
  const fmt = Math.round(horas * 0.1);
  const def = horas - invest - draft - rev - fmt;

  const expNota: Record<string, string> = {
    ninguna: ' Sin experiencia previa, contá un margen extra para arrancar.',
    alguna: '',
    buena: ' Tu experiencia previa ya acortó la estimación.',
  };
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightIcon: string;
  if (meses >= 9) { insightTone = 'warn'; insightIcon = '⏳'; }
  else if (meses <= 3) { insightTone = 'good'; insightIcon = '🎓'; }
  else { insightTone = 'neutral'; insightIcon = '📚'; }
  const insightText = `Escribir **${pal.toLocaleString('es-AR')} palabras** dedicando **${hsem} h por semana** te lleva unas **${horas} h**, o sea ~**${sem} semanas** (${meses} meses). La investigación (${invest} h) es la etapa más pesada, así que no la subestimes al planificar.${expNota[exp] || ''}`;

  return {
    horasTotales: horas,
    semanas: sem,
    meses,
    desgloseEtapas: `Investig ${invest}h / Draft ${draft}h / Revisiones ${rev}h / Formato ${fmt}h / Defensa ${def}h`,
    _insight: { title: 'Un proyecto de varios meses', text: insightText, tone: insightTone, icon: insightIcon },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Investigación', value: invest },
        { label: 'Primer borrador', value: draft },
        { label: 'Revisiones', value: rev },
        { label: 'Formato', value: fmt },
        { label: 'Defensa', value: def },
      ],
      suffix: ' h',
      centerValue: `${horas} h`,
      centerLabel: 'total',
      ariaLabel: `Reparto de las ${horas} horas de la tesis entre sus etapas`,
    },
  };

}
