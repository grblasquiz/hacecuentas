export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function melatoninaDosisSuenoEdad(i: Inputs): Outputs {
  const e=Number(i.edad)||0; const p=String(i.problema||'conciliar');
  const d={'conciliar':'0.5-1 mg','mantener':'0.3-0.5 mg liberación sostenida','jetlag':'3-5 mg solo primeras noches','turnos':'1-3 mg antes del sueño programado'}[p];
  const m={'conciliar':'30-60 min antes de dormir','mantener':'Al acostarse','jetlag':'Hora destino 9 pm','turnos':'Antes del sueño'}[p];
  return { dosis:d, momento:m, advertencia:'Empezá con menor dosis. Consulta médica si usás >2-4 semanas.' };
}
