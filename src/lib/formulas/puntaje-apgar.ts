/** Puntaje Apgar del recién nacido */
export interface Inputs { frecuenciaCardiaca: string; respiracion: string; tonoMuscular: string; reflejos: string; colorPiel: string; }
export interface Outputs { puntaje: string; evaluacion: string; accion: string; }

export function puntajeApgar(i: Inputs): Outputs {
  const fc = Number(i.frecuenciaCardiaca) || 0;
  const resp = Number(i.respiracion) || 0;
  const tono = Number(i.tonoMuscular) || 0;
  const ref = Number(i.reflejos) || 0;
  const color = Number(i.colorPiel) || 0;

  const total = fc + resp + tono + ref + color;

  let evaluacion = '';
  let accion = '';

  if (total >= 7) {
    evaluacion = 'Estado normal del recién nacido.';
    accion = 'Cuidados de rutina: secar, estimular, contacto piel con piel con la madre, lactancia temprana.';
  } else if (total >= 4) {
    evaluacion = 'Depresión moderada. El recién nacido necesita atención.';
    accion = 'Estimulación táctil, aspiración de vías aéreas, oxígeno suplementario. Evaluar respuesta y repetir Apgar a los 5 min.';
  } else {
    evaluacion = 'Depresión severa. Emergencia neonatal.';
    accion = 'Reanimación neonatal inmediata: ventilación con presión positiva, posible intubación. Activar equipo de neonatología.';
  }

  const desglose = `FC: ${fc} + Resp: ${resp} + Tono: ${tono} + Reflejos: ${ref} + Color: ${color}`;

  return {
    puntaje: `${total}/10 (${desglose})`,
    evaluacion,
    accion,
  };
}
