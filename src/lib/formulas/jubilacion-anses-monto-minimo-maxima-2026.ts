export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function jubilacionAnsesMontoMinimoMaxima2026(i: Inputs): Outputs {
  const t=String(i.tipo||'minima');
  const h: Record<string,[number,number]> = { minima:[290000,70000], media:[550000,70000], maxima:[1950000,0], pnc:[200000,50000] };
  const [haber,bono]=h[t]||h.minima;
  return { haberMensual:'$'+haber.toLocaleString('es-AR'), bono:'$'+bono.toLocaleString('es-AR'), total:'$'+(haber+bono).toLocaleString('es-AR'), resumen:`${t}: $${haber} + bono $${bono} = $${haber+bono}/mes.` };
}
