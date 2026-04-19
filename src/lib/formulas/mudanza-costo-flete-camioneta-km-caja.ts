export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function mudanzaCostoFleteCamionetaKmCaja(i: Inputs): Outputs {
  const k=Number(i.km)||0; const m3=Number(i.m3)||0; const p=String(i.pisoSalida||'pb'); const e=String(i.conEmbalaje||'no')==='si';
  const base=300000+m3*12000;
  const perKm=k*1500;
  const pisoRec: Record<string,number> = { pb:0, '1-3':30000, '4-6':60000, '7-mas':100000 };
  const piso=pisoRec[p]||0;
  const emb=e?base*0.3:0;
  const total=base+perKm+piso+emb;
  return { flete:'$'+base.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), km:'$'+perKm.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), piso:'$'+piso.toLocaleString('es-AR'), total:'$'+total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Mudanza ${m3}m³ ${k}km piso ${p}${e?' + embalaje':''}: ~$${total.toFixed(0)}.` };
}
