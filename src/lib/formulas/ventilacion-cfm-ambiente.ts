export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ventilacionCfmAmbiente(i: Inputs): Outputs {
  const V = Number(i.largo) * Number(i.ancho) * Number(i.alto);
  const N = Number(i.cambios) || 8;
  const m3h = V * N;
  const cfm = m3h * 0.588;
  return { cfm: cfm.toFixed(0), m3h: m3h.toFixed(0) + ' m³/h',
    resumen: `Necesitás ${cfm.toFixed(0)} CFM (${m3h.toFixed(0)} m³/h) para ${V.toFixed(0)} m³ con ${N} cambios/h.` };
}
