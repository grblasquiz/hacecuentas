export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function rcpCompresionesBlsCprRitmo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const e=String(i.edadVictima||'adulto');
  const freq = __lang === 'en' ? '100-120 compressions/min' : '100-120 compresiones/min';
  const prof = __lang === 'en'
    ? ({'adulto':'5-6 cm','nino_1_8':'~5 cm (1/3 chest depth)','bebe_menor_1':'4 cm'} as Record<string,string>)[e]
    : ({'adulto':'5-6 cm','nino_1_8':'~5 cm (1/3 profundidad tórax)','bebe_menor_1':'4 cm'} as Record<string,string>)[e];
  const rat = __lang === 'en'
    ? ({'adulto':'30:2','nino_1_8':'30:2 (1 rescuer) / 15:2 (2)','bebe_menor_1':'30:2 (1) / 15:2 (2)'} as Record<string,string>)[e]
    : ({'adulto':'30:2','nino_1_8':'30:2 (1 rescatador) / 15:2 (2)','bebe_menor_1':'30:2 (1) / 15:2 (2)'} as Record<string,string>)[e];
  const victimaEs = ({'adulto':'un adulto','nino_1_8':'un niño (1-8 años)','bebe_menor_1':'un bebé (menor de 1 año)'} as Record<string,string>)[e] || 'un adulto';
  const victimaEn = ({'adulto':'an adult','nino_1_8':'a child (1-8 yrs)','bebe_menor_1':'an infant (under 1 yr)'} as Record<string,string>)[e] || 'an adult';
  const _insight = {
    title: __lang === 'en' ? 'How to do CPR right' : 'Cómo hacer la RCP correctamente',
    text: __lang === 'en'
      ? `For ${victimaEn}: compress at **${freq}**, **${prof}** deep, with a **${rat}** ratio. Call emergency services first and don't stop until help arrives.`
      : `Para ${victimaEs}: comprimí a **${freq}**, **${prof}** de profundidad, con ritmo **${rat}**. Llamá primero a emergencias y no pares hasta que llegue la ayuda.`,
    tone: 'warn',
    icon: '🫀',
  };
  return { frecuencia:freq, profundidad:prof, ratio:rat, _insight };
}
