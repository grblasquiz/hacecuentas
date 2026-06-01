export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
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
  return { frecuencia:freq, profundidad:prof, ratio:rat };
}
