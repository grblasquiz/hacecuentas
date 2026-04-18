export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function correaDistribucionCambioIntervaloKm(i: Inputs): Outputs {
  const m=String(i.marca||'generico'); const km=Number(i.kmActual)||0;
  const iv:Record<string,number>={generico:80000,vw:90000,toyota:0,ford:100000};
  const int=iv[m];
  if (int===0) return { proximo:'No aplica (cadena)', advertencia:'Cadena de distribución no requiere cambio programado', resumen:'Cadena: solo cambiar si falla.' };
  const prox=Math.ceil(km/int)*int; const adv=km>prox-5000?'⚠️ Próximo a vencer':'OK';
  return { proximo:prox.toLocaleString()+' km', advertencia:adv, resumen:`${m}: próximo cambio a ${prox.toLocaleString()}. ${adv}.` };
}
