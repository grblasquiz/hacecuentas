export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function lineasCodigoProyectoComplejidadKloc(i: Inputs): Outputs {
  const loc=Number(i.loc)||0; const k=loc/1000;
  let cat='Script pequeño'; if (k>=1000) cat='Masivo (kernel/navegador)'; else if (k>=100) cat='Enterprise'; else if (k>=10) cat='Aplicación mediana'; else if (k>=1) cat='App pequeña';
  const pm=2.4*Math.pow(k,1.05);
  return { kloc:`${k.toFixed(1)} KLOC`, categoria:cat, esfuerzoMes:`${pm.toFixed(1)} PM`, resumen:`${k.toFixed(1)} KLOC — ${cat}. COCOMO: ${pm.toFixed(0)} persona-mes.` };
}
