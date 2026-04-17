/** Calculadora de superávit calórico para volumen */
export interface Inputs {
  peso: number;
  altura: number;
  edad: number;
  sexo: string;
  actividad: string;
  experiencia: string;
}
export interface Outputs {
  caloriasVolumen: number;
  superavit: number;
  tdee: number;
  gananciaMusculoMes: string;
  mensaje: string;
}

export function superavitCaloricoVolumen(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const altura = Number(i.altura);
  const edad = Number(i.edad);
  const sexo = String(i.sexo || 'masculino');
  const actividad = String(i.actividad || 'activo');
  const experiencia = String(i.experiencia || 'intermedio');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!altura || altura <= 0) throw new Error('Ingresá tu altura');

  let bmr: number;
  if (sexo === 'masculino') {
    bmr = 10 * peso + 6.25 * altura - 5 * edad + 5;
  } else {
    bmr = 10 * peso + 6.25 * altura - 5 * edad - 161;
  }

  const factores: Record<string, number> = { ligero: 1.375, moderado: 1.55, activo: 1.725, muy_activo: 1.9 };
  const tdee = Math.round(bmr * (factores[actividad] || 1.55));

  let superavit: number;
  let gananciaMusculoMes: string;
  if (experiencia === 'principiante') {
    superavit = 400;
    gananciaMusculoMes = '0.5-1.0 kg de músculo/mes';
  } else if (experiencia === 'intermedio') {
    superavit = 300;
    gananciaMusculoMes = '0.25-0.5 kg de músculo/mes';
  } else {
    superavit = 200;
    gananciaMusculoMes = '0.1-0.25 kg de músculo/mes';
  }

  const caloriasVolumen = tdee + superavit;

  return {
    caloriasVolumen,
    superavit,
    tdee,
    gananciaMusculoMes,
    mensaje: `Comé ${caloriasVolumen} kcal/día (TDEE ${tdee} + ${superavit} superávit). Esperá ganar ${gananciaMusculoMes}.`
  };
}