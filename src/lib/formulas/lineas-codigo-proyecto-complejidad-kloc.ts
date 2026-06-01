export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function lineasCodigoProyectoComplejidadKloc(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      scriptPeq: 'Script pequeño',
      masivo:    'Masivo (kernel/navegador)',
      enterprise:'Enterprise',
      appMed:    'Aplicación mediana',
      appPeq:    'App pequeña',
    },
    en: {
      scriptPeq: 'Small script',
      masivo:    'Massive (kernel/browser)',
      enterprise:'Enterprise',
      appMed:    'Medium application',
      appPeq:    'Small app',
    },
  } as const)[__lang];
  const loc=Number(i.loc)||0; const k=loc/1000;
  let cat=T.scriptPeq; if (k>=1000) cat=T.masivo; else if (k>=100) cat=T.enterprise; else if (k>=10) cat=T.appMed; else if (k>=1) cat=T.appPeq;
  const pm=2.4*Math.pow(k,1.05);
  const resumen = __lang === 'en'
    ? `${k.toFixed(1)} KLOC — ${cat}. COCOMO: ${pm.toFixed(0)} person-months.`
    : `${k.toFixed(1)} KLOC — ${cat}. COCOMO: ${pm.toFixed(0)} persona-mes.`;
  return { kloc:`${k.toFixed(1)} KLOC`, categoria:cat, esfuerzoMes:`${pm.toFixed(1)} PM`, resumen };
}
