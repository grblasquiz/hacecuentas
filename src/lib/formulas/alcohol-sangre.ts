/** Alcohol en sangre (BAC) — fórmula Widmark */
export interface Inputs {
  peso: number;
  sexo: 'm' | 'f' | string;
  gramosAlcohol: number;
  horasDesdeInicio?: number;
}
export interface Outputs {
  bac: number;
  nivelMensaje: string;
  puedeManejar: boolean;
  horasHastaCero: number;
  _chart?: any;
  _insight?: any;
}

export function alcoholSangre(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const sexo = String(i.sexo || 'm');
  const gramos = Number(i.gramosAlcohol);
  const horas = Number(i.horasDesdeInicio) || 0;
  if (!peso || peso <= 0) throw new Error('Ingresá el peso');
  if (gramos < 0) throw new Error('Gramos de alcohol inválidos');

  // r de Widmark
  const r = sexo === 'f' ? 0.55 : 0.68;

  // BAC inicial en g/L
  let bac = gramos / (peso * r);
  // Eliminación promedio: 0.15 g/L por hora
  bac = Math.max(0, bac - 0.15 * horas);

  let msg = '';
  let puede = false;
  if (bac === 0) { msg = 'Sin alcohol en sangre.'; puede = true; }
  else if (bac < 0.2) { msg = 'Bajo — por debajo del límite general para conductores.'; puede = true; }
  else if (bac < 0.5) { msg = 'Entre 0.2 y 0.5 g/L — prohibido para conductores profesionales, motos y bicicletas (Ley 27.714, Alcohol Cero al Volante).'; puede = false; }
  else if (bac < 0.8) { msg = 'Riesgo alto — pérdida de reflejos, coordinación comprometida.'; puede = false; }
  else if (bac < 1.5) { msg = 'Embriaguez marcada — no manejes.'; puede = false; }
  else { msg = 'Nivel peligroso — riesgo de intoxicación aguda.'; puede = false; }

  // Horas hasta cero
  const horasAcero = bac / 0.15;

  const bacR = Number(bac.toFixed(2));
  const chart = {
    type: 'scale' as const,
    marker: bacR,
    markerLabel: 'Tu BAC: ' + bacR + ' g/L',
    min: 0,
    unit: ' g/L',
    segments: [
      { nombre: 'Bajo', max: 0.2, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Límite legal', max: 0.5, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Riesgo alto', max: 0.8, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Embriaguez', max: 1.5, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Peligroso', max: Math.max(2.5, Math.ceil(bacR) + 1), color: '#fca5a5', colorDark: '#991b1b' },
    ],
    ariaLabel: 'Escala de alcohol en sangre (BAC) en g/L: bajo, límite legal, riesgo alto, embriaguez y peligroso.',
  };

  const horasAceroR = Number(horasAcero.toFixed(1));
  let insight: { title: string; text: string; tone: 'good' | 'warn' | 'neutral'; icon: string };
  if (bacR === 0) {
    insight = {
      title: 'Sin alcohol en sangre',
      text: 'Tu alcoholemia estimada es **0 g/L**: estás en la zona **Bajo** y por debajo de cualquier límite para conducir.',
      tone: 'good',
      icon: '✅',
    };
  } else if (bacR < 0.2) {
    insight = {
      title: 'Por debajo del límite general',
      text: 'Con **' + bacR + ' g/L** caés en la zona **Bajo**, por debajo del límite general de 0,5 g/L. Igual, **manejar con cualquier nivel de alcohol aumenta el riesgo**, y para profesionales, motos y bicicletas el límite es **0 (Alcohol Cero al Volante)**.',
      tone: 'warn',
      icon: '🚗',
    };
  } else if (bacR < 0.5) {
    insight = {
      title: 'No manejes: superás el límite de Alcohol Cero',
      text: 'Tus **' + bacR + ' g/L** entran en la franja **0,2–0,5 g/L**: prohibido conducir para profesionales, motos y bicicletas (Ley 27.714). Necesitás unas **' + horasAceroR + ' h** para volver a 0. **No manejes.**',
      tone: 'warn',
      icon: '🚫',
    };
  } else if (bacR < 0.8) {
    insight = {
      title: 'Riesgo alto: no manejes',
      text: 'Con **' + bacR + ' g/L** superás el límite general de 0,5 g/L y estás en **riesgo alto**, con reflejos y coordinación comprometidos. Tardarías unas **' + horasAceroR + ' h** en llegar a 0. **No manejes bajo ningún concepto.**',
      tone: 'warn',
      icon: '⚠️',
    };
  } else if (bacR < 1.5) {
    insight = {
      title: 'Embriaguez marcada: no manejes',
      text: '**' + bacR + ' g/L** indican **embriaguez marcada**: muy por encima del límite legal y peligroso para vos y para terceros. Pasarían unas **' + horasAceroR + ' h** hasta volver a 0. **No manejes y evitá quedarte solo.**',
      tone: 'warn',
      icon: '🛑',
    };
  } else {
    insight = {
      title: 'Nivel peligroso: buscá ayuda',
      text: 'Con **' + bacR + ' g/L** estás en nivel **peligroso**, con riesgo de intoxicación aguda. **No manejes** y, ante síntomas graves, **buscá atención médica.** Tardarías unas **' + horasAceroR + ' h** en llegar a 0.',
      tone: 'warn',
      icon: '🚨',
    };
  }

  return {
    bac: bacR,
    nivelMensaje: msg,
    puedeManejar: puede,
    horasHastaCero: horasAceroR,
    _chart: chart,
    _insight: insight,
  };
}
