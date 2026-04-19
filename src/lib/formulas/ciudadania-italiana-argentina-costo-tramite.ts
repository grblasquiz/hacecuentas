export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ciudadaniaItalianaArgentinaCostoTramite(i: Inputs): Outputs {
  const v=String(i.viaConsulado||'consulado'); const d=Number(i.documentos)||8;
  const cons=v==='consulado'?300:0;
  const trad=d*35000;
  const apost=d*20000;
  const gest=500000;
  const total=trad+apost+gest+cons*1400;
  return { consulado:v==='consulado'?'Arancel EUR 300':'No aplica', traducciones:'$'+trad.toLocaleString('es-AR'), total:'$'+total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Ciudadanía italiana ${v}: ~$${total.toFixed(0)} total.` };
}
