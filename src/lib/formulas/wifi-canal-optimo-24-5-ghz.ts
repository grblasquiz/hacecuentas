export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function wifiCanalOptimo245Ghz(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      consejos24: 'Ancho 20 MHz',
      resumen24: 'Usar canales 1/6/11 únicos sin solape.',
      consejos5: 'DFS 52-144 requiere radar check',
      resumen5: '5 GHz: 36/149 seguros, evitar DFS si hay cortes.',
    },
    en: {
      consejos24: '20 MHz width',
      resumen24: 'Use channels 1/6/11 exclusively without overlap.',
      consejos5: 'DFS 52-144 requires radar check',
      resumen5: '5 GHz: 36/149 are safe, avoid DFS if disconnections occur.',
    },
  } as const)[__lang];
  const b=String(i.banda||'24');
  if (b==='24') return { canales:'1, 6, 11', consejos: T.consejos24, resumen: T.resumen24 };
  return { canales:'36-48, 149-165', consejos: T.consejos5, resumen: T.resumen5 };
}
