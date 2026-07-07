export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
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
      insightTitle: 'Dónde cae en la escala',
      scaleAria: 'Escala de pH de 0 a 14 con el valor calculado marcado',
    },
    en: {
      errorH: 'Enter [H+] > 0',
      muyAcido: 'Very acidic',
      acido: 'Acidic',
      neutro: 'Neutral',
      alcalino: 'Alkaline',
      muyAlcalino: 'Very alkaline',
      insightTitle: 'Where it sits on the scale',
      scaleAria: 'pH scale from 0 to 14 with the calculated value marked',
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

  const phR = Math.round(ph * 100) / 100;
  const esExtremo = clasif === T.muyAcido || clasif === T.muyAlcalino;
  const esNeutro = clasif === T.neutro;
  const ultimoMax = Math.max(14, Math.ceil(phR) + 1);
  const tone = esNeutro ? 'good' : (esExtremo ? 'warn' : 'neutral');

  const insightText = __lang === 'en'
    ? `A hydrogen concentration of [H⁺] = ${h} mol/L gives **pH ${ph.toFixed(2)}**, which lands in the **${clasif.toLowerCase()}** zone. Each whole pH point is a 10× change in acidity, so small shifts in [H⁺] move the result a lot.`
    : `Una concentración [H⁺] = ${h} mol/L da **pH ${ph.toFixed(2)}**, que cae en la zona **${clasif.toLowerCase()}**. Cada punto entero de pH es un cambio de 10× en la acidez, así que variaciones chicas de [H⁺] mueven mucho el resultado.`;

  return {
    ph: ph.toFixed(2),
    clasificacion: clasif,
    resumen,
    _insight: {
      title: T.insightTitle,
      text: insightText,
      tone,
      icon: '🧪',
    },
    _chart: {
      type: 'scale',
      marker: phR,
      markerLabel: `pH ${ph.toFixed(2)}`,
      min: 0,
      segments: [
        { nombre: T.muyAcido, max: 3, color: '#fca5a5', colorDark: '#ef4444' },
        { nombre: T.acido, max: 6.9, color: '#fdba74', colorDark: '#f97316' },
        { nombre: T.neutro, max: 7.1, color: '#86efac', colorDark: '#22c55e' },
        { nombre: T.alcalino, max: 11, color: '#93c5fd', colorDark: '#3b82f6' },
        { nombre: T.muyAlcalino, max: ultimoMax, color: '#c4b5fd', colorDark: '#8b5cf6' },
      ],
      ariaLabel: T.scaleAria,
    },
  };
}
