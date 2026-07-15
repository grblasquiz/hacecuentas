/** Edad metabólica estimada */
export interface Inputs {
  peso: number;
  altura: number;
  edad: number;
  sexo: string;
  grasaCorporal: number;
  actividad?: string;
  masaMuscular?: number;
  cintura?: number;
}
export interface Outputs {
  edadMetabolica: number;
  rmrReal: number;
  rmrEsperado: number;
  diferencia: number;
  evaluacion: string;
  mensaje: string;
  tdee: number;
  factores: string;
  _insight?: any;
  _chart?: any;
}

export function edadMetabolica(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const altura = Number(i.altura);
  const edad = Number(i.edad);
  const sexo = String(i.sexo || 'm');
  const grasaCorporal = Number(i.grasaCorporal) || 0;

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!altura || altura <= 0) throw new Error('Ingresá tu altura');
  if (!edad || edad <= 0) throw new Error('Ingresá tu edad');

  // RMR Mifflin-St Jeor
  let rmrEsperado: number;
  if (sexo === 'f') {
    rmrEsperado = 10 * peso + 6.25 * altura - 5 * edad - 161;
  } else {
    rmrEsperado = 10 * peso + 6.25 * altura - 5 * edad + 5;
  }

  // RMR ajustado por composición corporal (Katch-McArdle si hay grasa corporal)
  let rmrReal: number;
  if (grasaCorporal > 0) {
    const masaMagra = peso * (1 - grasaCorporal / 100);
    rmrReal = 370 + 21.6 * masaMagra; // Katch-McArdle
  } else {
    rmrReal = rmrEsperado;
  }

  // Edad metabólica: despejar edad de Mifflin-St Jeor con rmrReal
  // rmrReal = 10*peso + 6.25*altura - 5*edadMet + (5 o -161)
  let edadMetabolica: number;
  if (sexo === 'f') {
    edadMetabolica = (10 * peso + 6.25 * altura - 161 - rmrReal) / 5;
  } else {
    edadMetabolica = (10 * peso + 6.25 * altura + 5 - rmrReal) / 5;
  }

  edadMetabolica = Math.max(10, Math.min(100, Math.round(edadMetabolica)));

  const diferencia = edadMetabolica - edad;
  const actividadFactor: Record<string, number> = { sedentaria: 1.2, ligera: 1.375, moderada: 1.55, alta: 1.725 };
  const tdee = rmrReal * (actividadFactor[String(i.actividad || 'sedentaria')] || 1.2);
  const factores = `La estimación usa edad, sexo, peso, altura${grasaCorporal ? ', grasa corporal' : ''}${i.masaMuscular ? ', masa muscular informada' : ''}${i.cintura ? ' y cintura como contexto' : ''}. No es una métrica clínica estandarizada.`;
  let evaluacion: string;
  if (diferencia <= -5) evaluacion = 'Excelente — tu metabolismo es más joven que tu edad cronológica';
  else if (diferencia <= 0) evaluacion = 'Bueno — tu metabolismo está alineado con tu edad';
  else if (diferencia <= 5) evaluacion = 'Regular — tu metabolismo es algo más lento de lo esperado';
  else evaluacion = 'Atención — tu metabolismo funciona como alguien mayor. Mejorá composición corporal y actividad.';

  const dif = Math.round(diferencia);
  const tone: 'good' | 'warn' = dif <= 0 ? 'good' : 'warn';
  const _insight = {
    title: 'Qué dice tu edad metabólica',
    text: dif <= 0
      ? `Tu cuerpo quema energía como el de alguien de **${edadMetabolica} años**, ${dif === 0 ? 'justo tu edad real' : `**${Math.abs(dif)} años menos** que tus **${edad}**`}. Buena señal: tu metabolismo en reposo (~**${Math.round(rmrReal)} kcal/día**) está a la par o por encima de lo esperado.`
      : `Tu cuerpo quema energía como el de alguien de **${edadMetabolica} años**, **${dif} años más** que tus **${edad}**. Tu metabolismo en reposo (~**${Math.round(rmrReal)} kcal/día**) rinde por debajo de lo esperado: ganar masa muscular y sumar actividad lo acelera.`,
    tone,
    icon: '🔥',
  };

  const _chart = {
    type: 'scale' as const,
    marker: dif,
    markerLabel: dif === 0 ? 'En tu edad' : (dif > 0 ? `+${dif} años` : `${dif} años`),
    min: Math.min(-15, dif - 1),
    unit: '',
    segments: [
      { nombre: 'Excelente', max: -5, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Bueno', max: 0, color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'Regular', max: 5, color: '#fef9c3', colorDark: '#854d0e' },
      { nombre: 'Atención', max: Math.max(15, dif + 1), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: `Escala de la diferencia entre edad metabólica (${edadMetabolica}) y edad real (${edad}): ${dif} años.`,
  };

  return {
    edadMetabolica,
    rmrReal: Math.round(rmrReal),
    rmrEsperado: Math.round(rmrEsperado),
    diferencia: dif,
    evaluacion,
    mensaje: `Edad metabólica: ${edadMetabolica} años (edad real: ${edad}). ${evaluacion}.`,
    tdee: Math.round(tdee),
    factores,
    _insight,
    _chart,
  };
}
