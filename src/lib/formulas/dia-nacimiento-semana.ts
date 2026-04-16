export interface Inputs { fechaNacimiento: string; }
export interface Outputs { diaSemana: string; significado: string; proximoCumpleDia: string; }
const DIAS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const SIGS: Record<string,string> = {
  Domingo:'Bonito/a y alegre — persona optimista, bondadosa y con luz propia.',
  Lunes:'Rostro agraciado — persona atractiva, sensible y con gran intuición.',
  Martes:'Lleno/a de gracia — persona elegante, coordinada y con estilo natural.',
  'Miércoles':'Profundo/a y sensible — persona reflexiva, empática y con rica vida interior.',
  Jueves:'Lejos por llegar — persona ambiciosa, viajera y con grandes metas.',
  Viernes:'Amoroso/a y generoso/a — persona cariñosa, altruista y conectada con los demás.',
  'Sábado':'Trabajador/a incansable — persona dedicada, responsable y con ética de esfuerzo.'
};
export function diaNacimientoSemana(i: Inputs): Outputs {
  const d = new Date(i.fechaNacimiento);
  if (isNaN(d.getTime())) throw new Error('Ingresá una fecha válida');
  const dia = DIAS[d.getDay()];
  let proxAnio = new Date().getFullYear();
  let prox = new Date(proxAnio, d.getMonth(), d.getDate());
  if (prox <= new Date()) { proxAnio++; prox = new Date(proxAnio, d.getMonth(), d.getDate()); }
  return { diaSemana: dia, significado: SIGS[dia] || '', proximoCumpleDia: `${DIAS[prox.getDay()]} ${prox.toLocaleDateString('es-AR')}` };
}
