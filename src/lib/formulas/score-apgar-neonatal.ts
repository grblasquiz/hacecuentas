/** Score APGAR neonatal */
export interface Inputs { apariencia: string; pulso: string; gesticulacion: string; actividad: string; respiracion: string; }
export interface Outputs { score: number; clasificacion: string; accion: string; mensaje: string; _chart?: any; }

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

  const chart = {
    type: 'scale' as const,
    marker: score,
    markerLabel: 'APGAR: ' + score + '/10',
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Depresión severa', max: 3, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Depresión moderada', max: 6, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Normal', max: 10, color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: 'Escala APGAR neonatal de 0 a 10: depresión severa, moderada, normal',
  };

  return { score, clasificacion, accion, mensaje: `APGAR: ${score}/10. ${clasificacion}.`, _chart: chart };
}