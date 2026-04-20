export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ingresoColegioPrivadoCuotaAnualCaba(i: Inputs): Outputs {
  const n=String(i.nivel||'primaria'); const t=String(i.tipoColegio||'bilinguie');
  const base={'bilinguie_premium':1200000,'bilinguie':650000,'tradicional':350000,'no_tradicional':500000}[t];
  const multNivel={'inicial':0.85,'primaria':1,'secundaria':1.15}[n];
  const cm=base*multNivel; const anual=cm*10+cm*1.5; // 10 cuotas + extras aprox
  return { cuotaMensual:`$${Math.round(cm).toLocaleString('es-AR')}/mes`, anualEstimado:`$${Math.round(anual).toLocaleString('es-AR')}`, extras:'Matricula, uniformes, cooperadora, viajes, libros extras.' };
}
