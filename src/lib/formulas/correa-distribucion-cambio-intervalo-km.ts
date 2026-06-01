export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function correaDistribucionCambioIntervaloKm(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      noAplica: 'No aplica (cadena)',
      sinCambio: 'Cadena de distribución no requiere cambio programado',
      cadena: 'Cadena: solo cambiar si falla.',
      proximo: '⚠️ Próximo a vencer',
      proximoCambio: (m: string, prox: number, adv: string) => `${m}: próximo cambio a ${prox.toLocaleString()}. ${adv}.`,
    },
    en: {
      noAplica: 'N/A (chain drive)',
      sinCambio: 'Timing chain does not require scheduled replacement',
      cadena: 'Chain: replace only if it fails.',
      proximo: '⚠️ Due soon',
      proximoCambio: (m: string, prox: number, adv: string) => `${m}: next change at ${prox.toLocaleString()}. ${adv}.`,
    },
  } as const)[__lang];
  const m=String(i.marca||'generico'); const km=Number(i.kmActual)||0;
  const iv:Record<string,number>={generico:80000,vw:90000,toyota:0,ford:100000};
  const int=iv[m];
  if (int===0) return { proximo:T.noAplica, advertencia:T.sinCambio, resumen:T.cadena };
  const prox=Math.ceil(km/int)*int; const adv=km>prox-5000?T.proximo:'OK';
  return { proximo:prox.toLocaleString()+' km', advertencia:adv, resumen:T.proximoCambio(m, prox, adv) };
}
