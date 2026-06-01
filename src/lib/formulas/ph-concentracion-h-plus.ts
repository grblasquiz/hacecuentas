export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function phConcentracionHPlus(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorH: 'Ingresá [H+] > 0',
      muyAcido: 'Muy ácido',
      acido: 'Ácido',
      neutro: 'Neutro',
      alcalino: 'Alcalino',
      muyAlcalino: 'Muy alcalino',
    },
    en: {
      errorH: 'Enter [H+] > 0',
      muyAcido: 'Very acidic',
      acido: 'Acidic',
      neutro: 'Neutral',
      alcalino: 'Alkaline',
      muyAlcalino: 'Very alkaline',
    },
  } as const)[__lang];
  const h = Number(i.h);
  if (!h || h <= 0) throw new Error(T.errorH);
  const ph = -Math.log10(h);
  let clasif: string;
  if (ph < 3) clasif = T.muyAcido; else if (ph < 7) clasif = T.acido;
  else if (ph === 7 || Math.abs(ph - 7) < 0.1) clasif = T.neutro;
  else if (ph < 11) clasif = T.alcalino; else clasif = T.muyAlcalino;
  const resumen = __lang === 'en'
    ? `pH ${ph.toFixed(2)} — ${clasif} (with [H⁺] = ${h} mol/L).`
    : `pH ${ph.toFixed(2)} — ${clasif} (con [H⁺] = ${h} mol/L).`;
  return { ph: ph.toFixed(2), clasificacion: clasif, resumen };
}
