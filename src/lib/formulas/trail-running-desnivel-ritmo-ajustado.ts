export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function trailRunningDesnivelRitmoAjustado(i: Inputs): Outputs {
  const d=Number(i.distanciaKm)||0; const des=Number(i.desnivelPositivo)||0; const p=Number(i.paceBaseKm)||6;
  const paceSeg=p*60; const ajuste=des/d; // segundos/km adicionales por m de desnivel por km
  const paceAjustado=paceSeg+ajuste*10;
  const totSeg=paceAjustado*d;
  const h=Math.floor(totSeg/3600); const m=Math.floor((totSeg%3600)/60); const s=Math.round(totSeg%60);
  const pMin=Math.floor(paceAjustado/60); const pSeg=Math.round(paceAjustado%60);
  return { tiempoAjustado:`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`, ritmoEfectivo:`${pMin}:${String(pSeg).padStart(2,'0')}/km`, interpretacion:`${d} km con +${des}m desnivel: tiempo estimado ${h}h ${m}m.` };
}
