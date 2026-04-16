export interface Inputs { edad: number; }
export interface Outputs { horasRecomendadas: string; rangoMinMax: string; etapa: string; mensaje: string; }
const RANGOS:{max:number;etapa:string;rec:string;rango:string;tip:string}[] = [
  {max:0.25,etapa:'Recién nacido (0-3 meses)',rec:'14-17 horas',rango:'11-19 horas',tip:'Los recién nacidos duermen la mayor parte del día en ciclos de 2-4 horas.'},
  {max:1,etapa:'Bebé (4-11 meses)',rec:'12-15 horas',rango:'10-18 horas',tip:'Incluye siestas. A los 6 meses suelen dormir 6-8 horas seguidas de noche.'},
  {max:2,etapa:'Niño pequeño (1-2 años)',rec:'11-14 horas',rango:'9-16 horas',tip:'Incluye 1-2 siestas. Rutina de sueño consistente es clave.'},
  {max:5,etapa:'Preescolar (3-5 años)',rec:'10-13 horas',rango:'8-14 horas',tip:'Muchos dejan la siesta a los 4-5 años. Mantené una rutina nocturna.'},
  {max:13,etapa:'Escolar (6-13 años)',rec:'9-11 horas',rango:'7-12 horas',tip:'El sueño es fundamental para el rendimiento escolar y el crecimiento.'},
  {max:17,etapa:'Adolescente (14-17 años)',rec:'8-10 horas',rango:'7-11 horas',tip:'El ritmo circadiano adolescente se desplaza: es normal dormirse y despertarse más tarde.'},
  {max:25,etapa:'Adulto joven (18-25 años)',rec:'7-9 horas',rango:'6-11 horas',tip:'Priorizá el sueño sobre pantallas nocturnas. Tu cerebro todavía se está desarrollando.'},
  {max:64,etapa:'Adulto (26-64 años)',rec:'7-9 horas',rango:'6-10 horas',tip:'La constancia es más importante que la cantidad. Mismo horario toda la semana.'},
  {max:200,etapa:'Adulto mayor (65+ años)',rec:'7-8 horas',rango:'5-9 horas',tip:'Es normal dormir menos profundamente. Siestas cortas (20 min) pueden complementar.'},
];
export function suenoIdealEdad(i: Inputs): Outputs {
  const edad = Number(i.edad);
  if (isNaN(edad) || edad < 0) throw new Error('Ingresá una edad válida');
  const r = RANGOS.find(r => edad <= r.max) || RANGOS[RANGOS.length-1];
  return { horasRecomendadas: r.rec, rangoMinMax: r.rango, etapa: r.etapa, mensaje: r.tip };
}
