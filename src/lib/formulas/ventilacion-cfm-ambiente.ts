export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function ventilacionCfmAmbiente(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const V = Number(i.largo) * Number(i.ancho) * Number(i.alto);
  const N = Number(i.cambios) || 8;
  const m3h = V * N;
  const cfm = m3h * 0.588;
  const resumen = __lang === 'en'
    ? `You need ${cfm.toFixed(0)} CFM (${m3h.toFixed(0)} m³/h) for ${V.toFixed(0)} m³ with ${N} air changes/h.`
    : `Necesitás ${cfm.toFixed(0)} CFM (${m3h.toFixed(0)} m³/h) para ${V.toFixed(0)} m³ con ${N} cambios/h.`;
  const _insight = {
    title: __lang === 'en' ? 'Sizing the extractor' : 'Cómo dimensionar el extractor',
    text: __lang === 'en'
      ? `For a **${V.toFixed(0)} m³** room renewing its air **${N} times/h**, pick a fan rated at least **${cfm.toFixed(0)} CFM** (${m3h.toFixed(0)} m³/h). Buy a bit above this number, since ducts and filters cut real airflow.`
      : `Para un ambiente de **${V.toFixed(0)} m³** que renueva el aire **${N} veces/h**, elegí un extractor de al menos **${cfm.toFixed(0)} CFM** (${m3h.toFixed(0)} m³/h). Comprá un poco por encima de ese número: los ductos y filtros le bajan el caudal real.`,
    tone: 'neutral',
    icon: '🌬️',
  };
  return { cfm: cfm.toFixed(0), m3h: m3h.toFixed(0) + ' m³/h', resumen, _insight };
}
