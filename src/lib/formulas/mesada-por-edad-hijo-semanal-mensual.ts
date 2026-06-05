export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function mesadaPorEdadHijoSemanalMensual(i: Inputs): Outputs {
  const edad = Number(i.edad) || 0;
  const factor = Number(i.factor) || 0;

  // factor = ARS por año de edad por año (factor anual)
  // e.g. factor=4000 y hijo de 10 años → 40.000 ARS/año
  const anual = edad * factor;
  const mensual = anual / 12;
  const semanal = anual / 52;

  const _insight = {
    title: 'Mesada sugerida',
    text: `Con un factor de **$${factor.toLocaleString('es-AR')}/año de edad**, a los **${edad} años** corresponde una mesada de **$${Math.round(semanal).toLocaleString('es-AR')}/semana** o **$${Math.round(mensual).toLocaleString('es-AR')}/mes** (anual: $${Math.round(anual).toLocaleString('es-AR')}). Revisá el factor cada año ajustando por inflación y revisá qué cubre la mesada.`,
    tone: 'neutral',
    icon: '🐷',
  };

  return {
    semanal: `$${Math.round(semanal).toLocaleString('es-AR')}`,
    mensual: `$${Math.round(mensual).toLocaleString('es-AR')}`,
    resumen: `Hijo de ${edad} años: $${Math.round(semanal).toLocaleString('es-AR')}/semana ≈ $${Math.round(mensual).toLocaleString('es-AR')}/mes.`,
    _insight,
  };
}
