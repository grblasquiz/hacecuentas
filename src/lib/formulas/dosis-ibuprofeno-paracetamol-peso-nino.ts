export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function dosisIbuprofenoParacetamolPesoNino(i: Inputs): Outputs {
  const p=Number(i.pesoKg)||0; const m=String(i.medicamento||'ibuprofeno');
  const dosis=m==='ibuprofeno'?p*10:p*12.5;
  const freq=m==='ibuprofeno'?'Cada 6-8 horas':'Cada 4-6 horas';
  const adv=m==='ibuprofeno'?'Máx 40 mg/kg/día. Con comida.':'Máx 75 mg/kg/día.';
  return { dosisMg:`${Math.round(dosis)} mg`, frecuencia:freq, advertencia:adv };
}
