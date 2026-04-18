export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function densidadPixelesPantallaPpiRetina(i: Inputs): Outputs {
  const w=Number(i.ancho)||0; const h=Number(i.alto)||0; const d=Number(i.diag)||0;
  if (d===0) return { ppi:'—', retina:'—', resumen:'Diagonal no puede ser 0.' };
  const ppi=Math.sqrt(w*w+h*h)/d;
  const retina=ppi>=300?'Sí':(ppi>=200?'Cercano':'No');
  return { ppi:ppi.toFixed(1), retina, resumen:`${w}×${h} en ${d}" = ${ppi.toFixed(0)} PPI.` };
}
