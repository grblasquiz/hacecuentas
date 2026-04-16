/** Calculadora de superávit calórico para ganar masa muscular */
export interface Inputs {
  peso: number;
  altura: number;
  edad: number;
  sexo: string;
  actividad: string;
  superavit: number;
}
export interface Outputs {
  tdee: number;
  caloriasObjetivo: number;
  superavitDiario: number;
  kgPorMes: number;
  proteinaMinG: number;
  mensaje: string;
}

export function superavitCalorico(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const altura = Number(i.altura);
  const edad = Number(i.edad);
  const sexo = String(i.sexo || 'm');
  const actividad = String(i.actividad || 'alto');
  const superavit = Number(i.superavit) || 350;

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!altura || altura <= 0) throw new Error('Ingresá tu altura');

  let bmr: number;
  if (sexo === 'f') bmr = 10 * peso + 6.25 * altura - 5 * edad - 161;
  else bmr = 10 * peso + 6.25 * altura - 5 * edad + 5;

  const factores: Record<string, number> = {
    sedentario: 1.2, ligero: 1.375, moderado: 1.55, alto: 1.725, muy_alto: 1.9,
  };
  const tdee = bmr * (factores[actividad] || 1.55);
  const caloriasObjetivo = tdee + superavit;

  // Ganancia estimada: superávit moderado ≈ 0.25-0.5 kg/semana
  const kgPorMes = (superavit * 30) / 7700;

  // Proteína mínima: 1.6-2.2 g/kg para hipertrofia
  const proteinaMinG = peso * 1.8;

  return {
    tdee: Math.round(tdee),
    caloriasObjetivo: Math.round(caloriasObjetivo),
    superavitDiario: superavit,
    kgPorMes: Number(kgPorMes.toFixed(2)),
    proteinaMinG: Math.round(proteinaMinG),
    mensaje: `Comé ${Math.round(caloriasObjetivo)} kcal/día (+${superavit} superávit). Ganancia estimada: ~${kgPorMes.toFixed(2)} kg/mes. Proteína mínima: ${Math.round(proteinaMinG)} g/día.`,
  };
}
