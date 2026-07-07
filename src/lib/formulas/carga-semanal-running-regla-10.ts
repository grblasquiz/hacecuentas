export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cargaSemanalRunningRegla10(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const km = Number(i.kmActuales) || 0;
  const prox = km * 1.1;
  const m4 = km * Math.pow(1.1, 4);
  const sumaKm = (prox - km).toFixed(1); // km que sumás la primera semana
  const resumen = __lang === 'en'
    ? `Next week ${prox.toFixed(0)} km. In 4 weeks: ${m4.toFixed(0)} km.`
    : `Próx sem ${prox.toFixed(0)} km. En 4 semanas: ${m4.toFixed(0)} km.`;
  const _insight = {
    title: __lang === 'en' ? 'Safe weekly progression' : 'Progresión semanal segura',
    text: __lang === 'en'
      ? `Going from **${km.toFixed(0)} km** to **${prox.toFixed(0)} km** means adding just **${sumaKm} km** next week. Hold the 10% rule and you'll reach **${m4.toFixed(0)} km** in 4 weeks without spiking injury risk.`
      : `Pasar de **${km.toFixed(0)} km** a **${prox.toFixed(0)} km** es sumar apenas **${sumaKm} km** la semana que viene. Respetando la regla del 10% llegás a **${m4.toFixed(0)} km** en 4 semanas sin disparar el riesgo de lesión.`,
    tone: 'good',
    icon: '🏃',
  };
  return { kmProxima: prox.toFixed(1) + ' km', km4Semanas: m4.toFixed(0) + ' km', resumen, _insight };
}
