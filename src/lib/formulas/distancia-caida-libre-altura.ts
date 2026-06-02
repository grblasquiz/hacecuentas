export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function distanciaCaidaLibreAltura(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      errorTiempo: 'Ingresá tiempo',
      insTitle: 'Caída libre',
    },
    en: {
      errorTiempo: 'Enter a time value',
      insTitle: 'Free fall',
    },
    pt: {
      errorTiempo: 'Informe o tempo',
      insTitle: 'Queda livre',
    },
  } as const)[__lang];
  const t = Number(i.t); const g = Number(i.g) || 9.81;
  if (!t || t < 0) throw new Error(T.errorTiempo);
  const h = 0.5 * g * t * t;
  const resumen = __lang === 'en'
    ? `In ${t}s it falls ${h.toFixed(1)} m.`
    : __lang === 'pt'
    ? `Em ${t}s cai ${h.toFixed(1)} m.`
    : `En ${t}s cae ${h.toFixed(1)} m.`;
  const vImpacto = g * t; // m/s al final de la caída
  const vKmh = vImpacto * 3.6;
  const insText = __lang === 'en'
    ? `After **${t}s** of free fall the object drops **${h.toFixed(1)} m** and hits at **${vImpacto.toFixed(1)} m/s** (~**${vKmh.toFixed(0)} km/h**), using g = ${g} m/s².`
    : __lang === 'pt'
    ? `Após **${t}s** de queda livre o objeto cai **${h.toFixed(1)} m** e chega a **${vImpacto.toFixed(1)} m/s** (~**${vKmh.toFixed(0)} km/h**), com g = ${g} m/s².`
    : `Tras **${t}s** de caída libre el objeto baja **${h.toFixed(1)} m** y llega a **${vImpacto.toFixed(1)} m/s** (~**${vKmh.toFixed(0)} km/h**), con g = ${g} m/s².`;
  const insight = { title: T.insTitle, text: insText, tone: 'neutral', icon: '🪂' };
  return { altura: h.toFixed(2) + ' m', resumen, _insight: insight };
}
