export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function zincDosisInmunidadHombreMujerEdad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      forma: 'Picolinato o gluconato',
      advertenciaCorto: 'Solo uso corto (5-7 días). Tomar con comida.',
      advertenciaLargo: 'No exceder 40 mg/día largo plazo.',
      diasufijo: 'mg/día',
    },
    en: {
      forma: 'Picolinate or gluconate',
      advertenciaCorto: 'Short-term use only (5–7 days). Take with food.',
      advertenciaLargo: 'Do not exceed 40 mg/day long-term.',
      diasufijo: 'mg/day',
    },
  } as const)[__lang];
  const sx=String(i.sexo||'hombre'); const o=String(i.objetivo||'mantenimiento');
  let d=sx==='hombre'?11:8;
  if(o==='inmunidad') d=15;
  else if(o==='resfrio') d=50;
  else if(o==='embarazo') d=12;
  return { dosis:`${d} ${T.diasufijo}`, forma:T.forma, advertencia:o==='resfrio'?T.advertenciaCorto:T.advertenciaLargo };
}
