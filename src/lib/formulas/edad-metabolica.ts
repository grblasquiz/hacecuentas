/** Edad metabólica estimada */
export interface Inputs {
  peso: number;
  altura: number;
  edad: number;
  sexo: string;
  grasaCorporal: number;
}
export interface Outputs {
  edadMetabolica: number;
  rmrReal: number;
  rmrEsperado: number;
  diferencia: number;
  evaluacion: string;
  mensaje: string;
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
  let evaluacion: string;
  if (diferencia <= -5) evaluacion = 'Excelente — tu metabolismo es más joven que tu edad cronológica';
  else if (diferencia <= 0) evaluacion = 'Bueno — tu metabolismo está alineado con tu edad';
  else if (diferencia <= 5) evaluacion = 'Regular — tu metabolismo es algo más lento de lo esperado';
  else evaluacion = 'Atención — tu metabolismo funciona como alguien mayor. Mejorá composición corporal y actividad.';

  return {
    edadMetabolica,
    rmrReal: Math.round(rmrReal),
    rmrEsperado: Math.round(rmrEsperado),
    diferencia: Math.round(diferencia),
    evaluacion,
    mensaje: `Edad metabólica: ${edadMetabolica} años (edad real: ${edad}). ${evaluacion}.`,
  };
}
