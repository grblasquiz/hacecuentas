export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function vacunaCalendarioNacionalAnses(i: Inputs): Outputs {
  const m=Number(i.edadMeses)||0;
  const cal: Record<number,string> = {
    0:'BCG + Hepatitis B (RN)',
    2:'Pentavalente + OPV + Rotavirus + Neumococo + Meningo',
    4:'Pentavalente + OPV + Rotavirus + Neumococo',
    6:'Pentavalente + OPV + Neumococo + Antigripal anual',
    12:'Triple Viral + Hep A + Varicela + Neumococo refuerzo',
    15:'Varicela + Hep A refuerzo',
    18:'DTP + OPV + Triple Viral refuerzo',
    72:'Triple bacteriana + OPV + Varicela refuerzo (6 años)'
  };
  const keys=Object.keys(cal).map(Number).sort((a,b)=>a-b);
  let c=keys[0]; for (const k of keys) if (k<=m) c=k;
  return { vacunas:cal[c]||'Sin vacunas programadas', resumen:`A los ${m} meses: ${cal[c]||'—'}.` };
}
