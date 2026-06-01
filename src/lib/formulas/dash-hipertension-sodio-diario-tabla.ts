export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function dashHipertensionSodioDiarioTabla(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      dia: 'mg/día',
      equivalente: (sal: string) => `${sal} g sal (1 cucharadita ≈ 2.3g)`,
      observacionEstricta: 'Versión estricta: hipertensión severa o riesgo alto.',
      observacionEstandar: 'Versión estándar para control PA general.',
    },
    en: {
      dia: 'mg/day',
      equivalente: (sal: string) => `${sal} g salt (1 teaspoon ≈ 2.3g)`,
      observacionEstricta: 'Strict version: severe hypertension or high risk.',
      observacionEstandar: 'Standard version for general blood pressure control.',
    },
    pt: {
      dia: 'mg/dia',
      equivalente: (sal: string) => `${sal} g de sal (1 colher de chá ≈ 2,3g)`,
      observacionEstricta: 'Versão estrita: hipertensão grave ou risco alto.',
      observacionEstandar: 'Versão padrão para controle geral da pressão arterial.',
    },
  } as const)[__lang];
  const t=String(i.tipoDash||'estandar');
  const na=t==='estricto'?1500:2300;
  const sal=na/400;
  return { sodioMaximo:`${na} ${T.dia}`, equivalente:T.equivalente(sal.toFixed(2)), observacion:t==='estricto'?T.observacionEstricta:T.observacionEstandar };
}
