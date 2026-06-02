export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function dietaMediterraneaAdherenciaScoreTest(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      alta: 'Alta',
      media: 'Media',
      baja: 'Baja',
      consejoMejorar: 'Sumá más vegetales, pescado y aceite oliva.',
      consejoBuena: 'Buena base. Optimizar detalles.',
      versionReducida: 'versión reducida',
      insightTitle: 'Tu adherencia mediterránea',
      insightAlta: (n: number) => `Cumplís **${n} de 4** hábitos clave: adherencia **alta** a la dieta mediterránea. Buena base — desde acá el margen está en afinar detalles (legumbres, frutos secos, menos ultraprocesados).`,
      insightMedia: (n: number) => `Cumplís **${n} de 4** hábitos: adherencia **media**. Vas por buen camino; sumar un pilar más (aceite de oliva, pescado o fruta diaria) te lleva a la franja alta.`,
      insightBaja: (n: number) => `Solo **${n} de 4** hábitos presentes: adherencia **baja**. El mayor impacto está en incorporar vegetales, pescado y aceite de oliva como base diaria.`,
      scaleLabel: (n: number) => `${n}/4`,
      segBaja: 'Baja',
      segMedia: 'Media',
      segAlta: 'Alta',
      aria: (n: number, adh: string) => `Puntaje de adherencia mediterránea: ${n} de 4, nivel ${adh}.`,
    },
    en: {
      alta: 'High',
      media: 'Medium',
      baja: 'Low',
      consejoMejorar: 'Add more vegetables, fish and olive oil.',
      consejoBuena: 'Good foundation. Optimize the details.',
      versionReducida: 'reduced version',
      insightTitle: 'Your Mediterranean adherence',
      insightAlta: (n: number) => `You hit **${n} of 4** key habits: **high** adherence to the Mediterranean diet. Solid base — from here the upside is in fine-tuning (legumes, nuts, fewer ultra-processed foods).`,
      insightMedia: (n: number) => `You hit **${n} of 4** habits: **medium** adherence. You're on track; adding one more pillar (olive oil, fish, or daily fruit) pushes you into the high range.`,
      insightBaja: (n: number) => `Only **${n} of 4** habits in place: **low** adherence. The biggest gain is making vegetables, fish and olive oil your daily base.`,
      scaleLabel: (n: number) => `${n}/4`,
      segBaja: 'Low',
      segMedia: 'Medium',
      segAlta: 'High',
      aria: (n: number, adh: string) => `Mediterranean adherence score: ${n} of 4, ${adh} level.`,
    },
  } as const)[__lang];
  const a=String(i.aceiteOliva||'no')==='si'?1:0;
  const p=String(i.pescadoSemana||'no')==='si'?1:0;
  const v=String(i.vinoTintoDiario||'no')==='si'?1:0;
  const f=String(i.frutasDiarias||'no')==='si'?1:0;
  const total=a+p+v+f;
  const adh=total>=3?T.alta:total>=2?T.media:T.baja;
  const cons=total<3?T.consejoMejorar:T.consejoBuena;

  const tone: 'good' | 'warn' | 'neutral' = total >= 3 ? 'good' : total >= 2 ? 'neutral' : 'warn';
  const insightText = total >= 3 ? T.insightAlta(total) : total >= 2 ? T.insightMedia(total) : T.insightBaja(total);
  const _insight = { title: T.insightTitle, text: insightText, tone, icon: '🫒' };

  const _chart = {
    type: 'scale',
    marker: total,
    markerLabel: T.scaleLabel(total),
    min: 0,
    segments: [
      { nombre: T.segBaja, max: 2, color: '#fecaca', colorDark: '#dc2626' },
      { nombre: T.segMedia, max: 3, color: '#fde68a', colorDark: '#d97706' },
      { nombre: T.segAlta, max: total >= 4 ? 4.3 : 4, color: '#22c55e', colorDark: '#16a34a' },
    ],
    ariaLabel: T.aria(total, adh),
  };

  return { puntaje:`${total}/4 (${T.versionReducida})`, adherencia:adh, consejo:cons, _insight, _chart };
}
