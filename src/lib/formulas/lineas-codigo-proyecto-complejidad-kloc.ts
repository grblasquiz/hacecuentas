export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function lineasCodigoProyectoComplejidadKloc(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      scriptPeq: 'Script pequeño',
      masivo:    'Masivo (kernel/navegador)',
      enterprise:'Enterprise',
      appMed:    'Aplicación mediana',
      appPeq:    'App pequeña',
      insightTitle: 'Esfuerzo estimado (COCOMO)',
    },
    en: {
      scriptPeq: 'Small script',
      masivo:    'Massive (kernel/browser)',
      enterprise:'Enterprise',
      appMed:    'Medium application',
      appPeq:    'Small app',
      insightTitle: 'Estimated effort (COCOMO)',
    },
  } as const)[__lang];
  const loc=Number(i.loc)||0; const k=loc/1000;
  let cat=T.scriptPeq; if (k>=1000) cat=T.masivo; else if (k>=100) cat=T.enterprise; else if (k>=10) cat=T.appMed; else if (k>=1) cat=T.appPeq;
  const pm=2.4*Math.pow(k,1.05);
  const resumen = __lang === 'en'
    ? `${k.toFixed(1)} KLOC — ${cat}. COCOMO: ${pm.toFixed(0)} person-months.`
    : `${k.toFixed(1)} KLOC — ${cat}. COCOMO: ${pm.toFixed(0)} persona-mes.`;
  const mesesEquipo = pm / 4; // calendario aprox. con un equipo de 4
  const insightText = __lang === 'en'
    ? `**${k.toFixed(1)} KLOC** (${cat}) imply **~${pm.toFixed(0)} person-months** by the basic COCOMO model — roughly **${mesesEquipo.toFixed(1)} months** of calendar time for a team of 4.`
    : `**${k.toFixed(1)} KLOC** (${cat}) implican **~${pm.toFixed(0)} persona-mes** según el modelo COCOMO básico: aprox. **${mesesEquipo.toFixed(1)} meses** de calendario con un equipo de 4.`;
  const _insight = { title: T.insightTitle, text: insightText, tone: 'neutral', icon: '💻' };
  return { kloc:`${k.toFixed(1)} KLOC`, categoria:cat, esfuerzoMes:`${pm.toFixed(1)} PM`, resumen, _insight };
}
