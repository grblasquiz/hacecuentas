export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function paceObjetivoMaratonTiempo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const h = Number(i.horas) || 0; const m = Number(i.minutos) || 0;
  const totalMin = h * 60 + m;
  const paceKm = totalMin / 42.195;
  const paceMi = totalMin / 26.22;
  const minKm = Math.floor(paceKm); const secKm = Math.round((paceKm - minKm) * 60);
  const minMi = Math.floor(paceMi); const secMi = Math.round((paceMi - minMi) * 60);
  const resumen = __lang === 'en'
    ? `Marathon in ${h}h${m}min → pace ${minKm}:${String(secKm).padStart(2,'0')} min/km.`
    : `Maratón en ${h}h${m}min → pace ${minKm}:${String(secKm).padStart(2,'0')} min/km.`;
  const paceKmStr = `${minKm}:${String(secKm).padStart(2, '0')}`;
  const paceMiStr = `${minMi}:${String(secMi).padStart(2, '0')}`;
  const insight = {
    title: __lang === 'en' ? 'The pace you have to hold' : 'El ritmo que tenés que sostener',
    text: __lang === 'en'
      ? `To finish in **${h}h ${m}min** you must hold **${paceKmStr} min/km** (**${paceMiStr} min/mi**) for the full **42.195 km** — without slowing down. The key is not going out too fast: bank-time strategies usually backfire in the final 10 km.`
      : `Para terminar en **${h}h ${m}min** tenés que sostener **${paceKmStr} min/km** (**${paceMiStr} min/mi**) durante los **42,195 km** completos, sin aflojar. La clave es no salir demasiado rápido: querer "ganar tiempo" al inicio casi siempre se paga en los últimos 10 km.`,
    tone: 'neutral',
    icon: '🏃',
  };
  return { paceMinKm: paceKmStr, paceMinMi: paceMiStr,
    resumen, _insight: insight };
}
