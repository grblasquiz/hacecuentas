export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function aceiteMotorCapacidadCambioKm(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const t=String(i.tipo||'mineral'); const km=Number(i.kmActual)||0;
  const iv:Record<string,number>={mineral:5000,semi:7500,sint:10000,sintLong:20000};
  const int=iv[t]||5000;
  const prox=km+int;
  const proxFmt = prox.toLocaleString();
  const intFmt = int.toLocaleString();
  const resumen = __lang === 'en'
    ? `${t}: next oil change at ${proxFmt} km.`
    : `${t}: próximo cambio a ${proxFmt} km.`;

  const _insight = {
    title: __lang === 'en' ? 'Your next oil change' : 'Tu próximo cambio',
    text: __lang === 'en'
      ? `With **${t}** oil the interval is **${intFmt} km**, so program the next change around **${proxFmt} km**. Keep the receipt or log the date — many warranties require proof of service.`
      : `Con aceite **${t}** el intervalo es de **${intFmt} km**, así que programá el próximo cambio cerca de los **${proxFmt} km**. Guardá la factura o anotá la fecha: muchas garantías piden el comprobante del service.`,
    tone: 'neutral',
    icon: '🛢️',
  };

  return { proximo:proxFmt+' km', km:intFmt+' km', resumen, _insight };
}
