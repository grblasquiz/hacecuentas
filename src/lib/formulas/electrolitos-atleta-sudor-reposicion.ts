export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function electrolitosAtletaSudorReposicion(i: Inputs): Outputs {
  const p=Number(i.pesoKg)||0; const h=Number(i.horasEjercicio)||1; const t=Number(i.temperaturaC)||20; const i_=String(i.intensidad||'media');
  let naPorHora=500; if(t>30) naPorHora+=200; if(i_==='alta') naPorHora+=200; if(i_==='baja') naPorHora-=150;
  const naTot=naPorHora*h;
  const k=naPorHora*0.4*h;
  const liq=750*h;
  return { sodio:`${Math.round(naTot)} mg (${Math.round(naPorHora)} mg/h)`, potasio:`${Math.round(k)} mg`, liquidos:`${liq} mL (~${(liq/1000).toFixed(1)} L)` };
}
