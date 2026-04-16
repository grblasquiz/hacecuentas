/** Score APGAR neonatal */
export interface Inputs { apariencia: string; pulso: string; gesticulacion: string; actividad: string; respiracion: string; }
export interface Outputs { score: number; clasificacion: string; accion: string; mensaje: string; }

export function scoreApgarNeonatal(i: Inputs): Outputs {
  const score = Number(i.apariencia) + Number(i.pulso) + Number(i.gesticulacion) + Number(i.actividad) + Number(i.respiracion);

  let clasificacion: string;
  let accion: string;
  if (score >= 7) {
    clasificacion = '🟢 Normal (7-10)';
    accion = 'Cuidados de rutina: secar, estimular, contacto piel a piel con la madre.';
  } else if (score >= 4) {
    clasificacion = '🟡 Depresión moderada (4-6)';
    accion = 'Asistencia moderada: aspiración, oxígeno, estimulación táctil. Evaluar ventilación.';
  } else {
    clasificacion = '🔴 Depresión severa (0-3)';
    accion = 'Reanimación urgente: ventilación con presión positiva, posible intubación y compresiones torácicas.';
  }

  return { score, clasificacion, accion, mensaje: `APGAR: ${score}/10. ${clasificacion}.` };
}