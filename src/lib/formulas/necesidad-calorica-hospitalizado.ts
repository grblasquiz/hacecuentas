/** Necesidad calórica hospitalizado — Harris-Benedict + factores Long */
export interface Inputs {
  peso: number;
  altura: number;
  edad: number;
  sexo: string;
  factorActividad?: string;
  factorEstres?: string;
}
export interface Outputs {
  get: number;
  geb: number;
  detalle: string;
}

export function necesidadCaloricaHospitalizado(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const altura = Number(i.altura);
  const edad = Number(i.edad);
  const sexo = String(i.sexo || 'm');
  const fa = Number(i.factorActividad) || 1.2;
  const fe = Number(i.factorEstres) || 1.2;

  if (!peso || peso <= 0) throw new Error('Ingresá el peso del paciente');
  if (!altura || altura <= 0) throw new Error('Ingresá la altura en cm');
  if (!edad || edad <= 0) throw new Error('Ingresá la edad');

  // Harris-Benedict
  let geb: number;
  if (sexo === 'f') {
    geb = 655.1 + 9.563 * peso + 1.85 * altura - 4.676 * edad;
  } else {
    geb = 66.5 + 13.75 * peso + 5.003 * altura - 6.775 * edad;
  }

  const get = geb * fa * fe;

  // Proteínas sugeridas según estrés
  let proteinasKg: string;
  if (fe >= 1.5) proteinasKg = '1,5-2,0 g/kg/día (estrés alto)';
  else if (fe >= 1.2) proteinasKg = '1,0-1,5 g/kg/día (estrés moderado)';
  else proteinasKg = '0,8-1,0 g/kg/día (sin estrés)';

  const detalle =
    `GEB Harris-Benedict: ${Math.round(geb)} kcal | ` +
    `Factor actividad: ×${fa} | Factor estrés: ×${fe} | ` +
    `GET: ${Math.round(get)} kcal/día | ` +
    `Proteínas sugeridas: ${proteinasKg} (${Math.round(peso * 1.2)}-${Math.round(peso * 1.5)} g/día).`;

  return {
    get: Math.round(get),
    geb: Math.round(geb),
    detalle,
  };
}
