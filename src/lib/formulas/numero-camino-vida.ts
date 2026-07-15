export interface CaminoVidaInputs { fechaNacimiento: string; }
export interface CaminoVidaOutputs { numeroVida: number; numeroAnioPersonal: number; fortalezas: string; desafios: string; significado: string; aviso: string; _insight?: any; }
const significados: Record<number, [string,string,string]> = {
  1:['iniciativa, autonomía y liderazgo','impaciencia o exceso de individualismo','El 1 se asocia con comenzar y abrir camino.'], 2:['cooperación, tacto y escucha','indecisión o dependencia','El 2 se asocia con vínculos y colaboración.'], 3:['creatividad, comunicación y entusiasmo','dispersión o superficialidad','El 3 se asocia con expresión y sociabilidad.'], 4:['orden, constancia y sentido práctico','rigidez o resistencia al cambio','El 4 se asocia con estructura y trabajo sostenido.'], 5:['adaptación, curiosidad y libertad','inconstancia o impulsividad','El 5 se asocia con cambio y exploración.'], 6:['responsabilidad, cuidado y armonía','control o sobrecarga','El 6 se asocia con servicio y comunidad.'], 7:['análisis, introspección y estudio','aislamiento o escepticismo','El 7 se asocia con búsqueda y reflexión.'], 8:['gestión, ambición y organización','materialismo o dureza','El 8 se asocia con logro y administración.'], 9:['empatía, visión amplia y generosidad','idealización o dificultad para cerrar ciclos','El 9 se asocia con integración y vocación humanitaria.'],
  11:['intuición, inspiración y sensibilidad','tensión nerviosa o expectativas irreales','El 11 es un número maestro asociado con inspiración.'], 22:['visión práctica y capacidad de construir','presión excesiva o perfeccionismo','El 22 es un número maestro asociado con proyectos de gran escala.'], 33:['compasión, enseñanza y servicio','sacrificio o falta de límites','El 33 es un número maestro asociado con cuidado y enseñanza.'],
};
function reducir(n: number): number { while (n > 9 && ![11,22,33].includes(n)) n = String(n).split('').reduce((a,b)=>a+Number(b),0); return n; }
export function numeroCaminoVida(i: CaminoVidaInputs): CaminoVidaOutputs {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(i.fechaNacimiento || ''));
  if (!m) throw new Error('Ingresá una fecha de nacimiento válida');
  const fecha = new Date(`${m[1]}-${m[2]}-${m[3]}T12:00:00Z`); if (Number.isNaN(fecha.getTime()) || fecha.getUTCDate() !== Number(m[3])) throw new Error('La fecha no existe');
  const numeroVida = reducir(`${m[1]}${m[2]}${m[3]}`.split('').reduce((a,b)=>a+Number(b),0));
  const ahora = new Date(); const numeroAnioPersonal = reducir(Number(m[2]) + Number(m[3]) + String(ahora.getFullYear()).split('').reduce((a,b)=>a+Number(b),0));
  const [fortalezas, desafios, significado] = significados[numeroVida] || significados[9];
  const aviso = 'La numerología es una práctica de entretenimiento sin respaldo científico para predecir personalidad o futuro.';
  return { numeroVida, numeroAnioPersonal, fortalezas, desafios, significado, aviso,
    _insight: { title: `Tu camino de vida es ${numeroVida}`, text: `En numerología, el **${numeroVida}** se vincula con ${fortalezas}. Tu año personal actual es **${numeroAnioPersonal}**. Es una lectura recreativa, no una evaluación objetiva.`, tone: 'neutral', icon: '✨' } };
}
