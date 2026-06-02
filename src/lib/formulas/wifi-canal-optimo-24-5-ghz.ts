export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function wifiCanalOptimo245Ghz(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      consejos24: 'Ancho 20 MHz',
      resumen24: 'Usar canales 1/6/11 únicos sin solape.',
      consejos5: 'DFS 52-144 requiere radar check',
      resumen5: '5 GHz: 36/149 seguros, evitar DFS si hay cortes.',
      insightTitle24: 'Banda 2,4 GHz: usá 1, 6 u 11',
      insightText24: 'En 2,4 GHz solo **1, 6 y 11** no se solapan entre sí. Mantené el ancho en **20 MHz** y elegí el canal menos congestionado de esos tres con un escáner WiFi. Llega más lejos y atraviesa paredes, pero es más lenta y la usa todo el barrio.',
      insightTitle5: 'Banda 5 GHz: 36-48 o 149-165',
      insightText5: 'En 5 GHz los canales **36-48 y 149-165** son seguros y no requieren DFS. Más velocidad y menos interferencia que 2,4 GHz, a cambio de menor alcance. Evitá los canales DFS (52-144) si notás cortes, porque el router los libera al detectar radar.',
    },
    en: {
      consejos24: '20 MHz width',
      resumen24: 'Use channels 1/6/11 exclusively without overlap.',
      consejos5: 'DFS 52-144 requires radar check',
      resumen5: '5 GHz: 36/149 are safe, avoid DFS if disconnections occur.',
      insightTitle24: '2.4 GHz band: use 1, 6 or 11',
      insightText24: 'On 2.4 GHz only channels **1, 6 and 11** do not overlap. Keep the width at **20 MHz** and pick the least congested of those three with a WiFi scanner. It reaches farther and goes through walls, but it is slower and the whole neighborhood uses it.',
      insightTitle5: '5 GHz band: 36-48 or 149-165',
      insightText5: 'On 5 GHz channels **36-48 and 149-165** are safe and require no DFS. Faster and with less interference than 2.4 GHz, at the cost of shorter range. Avoid the DFS channels (52-144) if you notice disconnections, since the router drops them when it detects radar.',
    },
  } as const)[__lang];
  const b=String(i.banda||'24');
  if (b==='24') return {
    canales:'1, 6, 11', consejos: T.consejos24, resumen: T.resumen24,
    _insight: { title: T.insightTitle24, text: T.insightText24, tone: 'neutral' as const, icon: '📶' },
  };
  return {
    canales:'36-48, 149-165', consejos: T.consejos5, resumen: T.resumen5,
    _insight: { title: T.insightTitle5, text: T.insightText5, tone: 'good' as const, icon: '📡' },
  };
}
