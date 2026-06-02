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
  if (int===0) return {
    proximo:T.noAplica, advertencia:T.sinCambio, resumen:T.cadena,
    _insight: {
      title: __lang === 'en' ? 'Timing chain — no schedule' : 'Cadena de distribución — sin plan',
      text: __lang === 'en'
        ? `**${m}** uses a timing chain: there's no fixed mileage to replace it. Only act if you hear rattling or get a warning light.`
        : `**${m}** usa cadena de distribución: no hay kilometraje fijo de cambio. Actuá solo si escuchás cascabeleo o salta un testigo.`,
      tone: 'neutral',
      icon: '🔗',
    },
  };
  const prox=Math.ceil(km/int)*int; const adv=km>prox-5000?T.proximo:'OK';
  const faltan = Math.max(0, prox - km);
  const due = km > prox - 5000;
  const _insight = __lang === 'en'
    ? {
        title: due ? 'Replace the timing belt soon' : 'Timing belt OK',
        text: due
          ? `At **${km.toLocaleString()} km** you're within 5,000 km of the **${prox.toLocaleString()} km** interval for **${m}**. Book the belt change now — a snapped belt can wreck the engine.`
          : `**${m}**: next belt change at **${prox.toLocaleString()} km**, about **${faltan.toLocaleString()} km** away. No rush yet, but don't skip it.`,
        tone: due ? 'warn' : 'good',
        icon: due ? '⚠️' : '🔧',
      }
    : {
        title: due ? 'Cambiá la correa pronto' : 'Correa al día',
        text: due
          ? `Con **${km.toLocaleString()} km** estás a menos de 5.000 km del intervalo de **${prox.toLocaleString()} km** para **${m}**. Agendá el cambio ya: una correa cortada puede destruir el motor.`
          : `**${m}**: próximo cambio a **${prox.toLocaleString()} km**, te faltan unos **${faltan.toLocaleString()} km**. No corre apuro, pero no lo saltees.`,
        tone: due ? 'warn' : 'good',
        icon: due ? '⚠️' : '🔧',
      };
  return { proximo:prox.toLocaleString()+' km', advertencia:adv, resumen:T.proximoCambio(m, prox, adv), _insight };
}
