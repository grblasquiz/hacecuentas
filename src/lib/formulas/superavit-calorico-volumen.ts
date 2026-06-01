/** Calculadora de superávit calórico para volumen */
export interface Inputs {
  peso: number;
  altura: number;
  edad: number;
  sexo: string;
  actividad: string;
  experiencia: string;
  __lang?: string;
}
export interface Outputs {
  caloriasVolumen: number;
  superavit: number;
  tdee: number;
  gananciaMusculoMes: string;
  mensaje: string;
}

export function superavitCaloricoVolumen(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errPeso: 'Ingresá tu peso',
      errAltura: 'Ingresá tu altura',
      gainPrincipiante: '0.5-1.0 kg de músculo/mes',
      gainIntermedio: '0.25-0.5 kg de músculo/mes',
      gainAvanzado: '0.1-0.25 kg de músculo/mes',
    },
    en: {
      errPeso: 'Enter your weight',
      errAltura: 'Enter your height',
      gainPrincipiante: '0.5-1.0 kg of muscle/month',
      gainIntermedio: '0.25-0.5 kg of muscle/month',
      gainAvanzado: '0.1-0.25 kg of muscle/month',
    },
  } as const)[__lang];

  const peso = Number(i.peso);
  const altura = Number(i.altura);
  const edad = Number(i.edad);
  const sexo = String(i.sexo || 'masculino');
  const actividad = String(i.actividad || 'activo');
  const experiencia = String(i.experiencia || 'intermedio');
  if (!peso || peso <= 0) throw new Error(T.errPeso);
  if (!altura || altura <= 0) throw new Error(T.errAltura);

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
    gananciaMusculoMes = T.gainPrincipiante;
  } else if (experiencia === 'intermedio') {
    superavit = 300;
    gananciaMusculoMes = T.gainIntermedio;
  } else {
    superavit = 200;
    gananciaMusculoMes = T.gainAvanzado;
  }

  const caloriasVolumen = tdee + superavit;

  return {
    caloriasVolumen,
    superavit,
    tdee,
    gananciaMusculoMes,
    mensaje: __lang === 'en'
      ? `Eat ${caloriasVolumen} kcal/day (TDEE ${tdee} + ${superavit} surplus). Expect to gain ${gananciaMusculoMes}.`
      : `Comé ${caloriasVolumen} kcal/día (TDEE ${tdee} + ${superavit} superávit). Esperá ganar ${gananciaMusculoMes}.`
  };
}