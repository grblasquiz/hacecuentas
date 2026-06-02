/** Puntaje Apgar del recién nacido */
export interface Inputs { frecuenciaCardiaca: string; respiracion: string; tonoMuscular: string; reflejos: string; colorPiel: string; }
export interface Outputs { puntaje: string; evaluacion: string; accion: string; _insight?: any; _chart?: any; }

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

  const tone = total >= 7 ? 'good' : total >= 4 ? 'warn' : 'warn';
  const icon = total >= 7 ? '👶' : '🏥';
  const insightTitle = total >= 7 ? 'Recién nacido vigoroso' : total >= 4 ? 'Requiere atención' : 'Emergencia neonatal';
  const insightText = total >= 7
    ? `Apgar **${total}/10**: vigor normal. Un puntaje de 7 a 10 indica que el bebé se adapta bien a la vida fuera del útero y solo necesita cuidados de rutina.`
    : total >= 4
    ? `Apgar **${total}/10**: depresión moderada. El recién nacido necesita estimulación y posible oxígeno; se vuelve a evaluar a los **5 minutos** para ver la respuesta.`
    : `Apgar **${total}/10**: depresión severa. Es una emergencia que exige reanimación neonatal inmediata. El Apgar es una guía rápida, no un diagnóstico ni un pronóstico definitivo.`;

  return {
    puntaje: `${total}/10 (${desglose})`,
    evaluacion,
    accion,
    _insight: { title: insightTitle, text: insightText, tone, icon },
    _chart: {
      type: 'scale',
      marker: total,
      markerLabel: `${total}/10`,
      min: 0,
      segments: [
        { nombre: 'Severo (0-3)', max: 3, color: '#dc2626', colorDark: '#ef4444' },
        { nombre: 'Moderado (4-6)', max: 6, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Normal (7-10)', max: 10.5, color: '#16a34a', colorDark: '#22c55e' },
      ],
      ariaLabel: `Puntaje Apgar ${total} de 10 en escala clínica de 3 zonas`,
    },
  };
}
