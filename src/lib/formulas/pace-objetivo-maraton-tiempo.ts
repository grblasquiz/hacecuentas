export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function paceObjetivoMaratonTiempo(i: Inputs): Outputs {
  const h = Number(i.horas) || 0; const m = Number(i.minutos) || 0;
  const totalMin = h * 60 + m;
  const paceKm = totalMin / 42.195;
  const paceMi = totalMin / 26.22;
  const minKm = Math.floor(paceKm); const secKm = Math.round((paceKm - minKm) * 60);
  const minMi = Math.floor(paceMi); const secMi = Math.round((paceMi - minMi) * 60);
  return { paceMinKm: `${minKm}:${String(secKm).padStart(2, '0')}`, paceMinMi: `${minMi}:${String(secMi).padStart(2, '0')}`,
    resumen: `Maratón en ${h}h${m}min → pace ${minKm}:${String(secKm).padStart(2,'0')} min/km.` };
}
