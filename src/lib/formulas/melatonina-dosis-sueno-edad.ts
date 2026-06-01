export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function melatoninaDosisSuenoEdad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const e=Number(i.edad)||0; const p=String(i.problema||'conciliar');
  const d = __lang === 'en'
    ? {'conciliar':'0.5-1 mg','mantener':'0.3-0.5 mg extended-release','jetlag':'3-5 mg first nights only','turnos':'1-3 mg before scheduled sleep'}[p]
    : {'conciliar':'0.5-1 mg','mantener':'0.3-0.5 mg liberación sostenida','jetlag':'3-5 mg solo primeras noches','turnos':'1-3 mg antes del sueño programado'}[p];
  const m = __lang === 'en'
    ? {'conciliar':'30-60 min before bedtime','mantener':'At bedtime','jetlag':'Destination time 9 pm','turnos':'Before sleep'}[p]
    : {'conciliar':'30-60 min antes de dormir','mantener':'Al acostarse','jetlag':'Hora destino 9 pm','turnos':'Antes del sueño'}[p];
  const advertencia = __lang === 'en'
    ? 'Start with the lowest dose. Consult a doctor if using >2-4 weeks.'
    : 'Empezá con menor dosis. Consulta médica si usás >2-4 semanas.';
  return { dosis:d, momento:m, advertencia };
}
