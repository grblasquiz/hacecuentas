export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function porcentajeGrasaCorporalFormulaNavy(i: Inputs): Outputs {
  const s=String(i.sexo||'m'); const h=Number(i.alturaCm)||0; const ci=Number(i.cinturaCm)||0; const cu=Number(i.cuelloCm)||0; const ca=Number(i.caderaCm)||0;
  let g=0;
  if (s==='m') g=86.010*Math.log10(ci-cu)-70.041*Math.log10(h)+36.76;
  else g=163.205*Math.log10(ci+ca-cu)-97.684*Math.log10(h)-78.387;
  let cat='—';
  if (s==='m') { if (g<6) cat='Esencial'; else if (g<14) cat='Atlético'; else if (g<18) cat='Fitness'; else if (g<25) cat='Normal'; else cat='Alto'; }
  else { if (g<14) cat='Esencial'; else if (g<21) cat='Atlético'; else if (g<25) cat='Fitness'; else if (g<32) cat='Normal'; else cat='Alto'; }
  return { grasa:g.toFixed(1)+'%', categoria:cat, resumen:`${s==='m'?'Hombre':'Mujer'} ${h}cm: ${g.toFixed(1)}% grasa (${cat}).` };
}
