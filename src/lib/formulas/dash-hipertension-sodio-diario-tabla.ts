export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function dashHipertensionSodioDiarioTabla(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      dia: 'mg/día',
      equivalente: (sal: string) => `${sal} g sal (1 cucharadita ≈ 2.3g)`,
      observacionEstricta: 'Versión estricta: hipertensión severa o riesgo alto.',
      observacionEstandar: 'Versión estándar para control PA general.',
      insightTitle: 'Tu tope diario de sodio',
      insightText: (na: number, sal: string) => `El plan te limita a **${na} mg de sodio por día** (unos **${sal} g de sal**). Como referencia, una dieta occidental típica ronda 3.400 mg, así que el margen real está en lo procesado, fiambres y pan.`,
      segStrict: 'DASH estricto',
      segStd: 'DASH estándar',
      segHigh: 'Consumo típico/alto',
      markerLabel: 'Tu tope',
      aria: (na: number) => `Tope de ${na} mg de sodio diario sobre la escala DASH.`,
    },
    en: {
      dia: 'mg/day',
      equivalente: (sal: string) => `${sal} g salt (1 teaspoon ≈ 2.3g)`,
      observacionEstricta: 'Strict version: severe hypertension or high risk.',
      observacionEstandar: 'Standard version for general blood pressure control.',
      insightTitle: 'Your daily sodium cap',
      insightText: (na: number, sal: string) => `This plan caps you at **${na} mg of sodium per day** (about **${sal} g of salt**). For reference, a typical Western diet runs near 3,400 mg, so the real margin lives in processed food, cold cuts and bread.`,
      segStrict: 'Strict DASH',
      segStd: 'Standard DASH',
      segHigh: 'Typical/high intake',
      markerLabel: 'Your cap',
      aria: (na: number) => `Cap of ${na} mg of daily sodium on the DASH scale.`,
    },
    pt: {
      dia: 'mg/dia',
      equivalente: (sal: string) => `${sal} g de sal (1 colher de chá ≈ 2,3g)`,
      observacionEstricta: 'Versão estrita: hipertensão grave ou risco alto.',
      observacionEstandar: 'Versão padrão para controle geral da pressão arterial.',
      insightTitle: 'Seu teto diário de sódio',
      insightText: (na: number, sal: string) => `O plano te limita a **${na} mg de sódio por dia** (cerca de **${sal} g de sal**). Como referência, uma dieta ocidental típica fica perto de 3.400 mg, então a margem real está nos ultraprocessados, frios e pão.`,
      segStrict: 'DASH estrito',
      segStd: 'DASH padrão',
      segHigh: 'Consumo típico/alto',
      markerLabel: 'Seu teto',
      aria: (na: number) => `Teto de ${na} mg de sódio diário na escala DASH.`,
    },
  } as const)[__lang];
  const t=String(i.tipoDash||'estandar');
  const na=t==='estricto'?1500:2300;
  const sal=na/400;
  return {
    sodioMaximo:`${na} ${T.dia}`,
    equivalente:T.equivalente(sal.toFixed(2)),
    observacion:t==='estricto'?T.observacionEstricta:T.observacionEstandar,
    _insight: {
      title: T.insightTitle,
      text: T.insightText(na, sal.toFixed(2)),
      tone: 'neutral',
      icon: '🧂',
    },
    _chart: {
      type: 'scale',
      marker: na,
      markerLabel: T.markerLabel,
      min: 0,
      segments: [
        { nombre: T.segStrict, max: 1500, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: T.segStd, max: 2300, color: '#eab308', colorDark: '#facc15' },
        { nombre: T.segHigh, max: 3500, color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: T.aria(na),
    },
  };
}
