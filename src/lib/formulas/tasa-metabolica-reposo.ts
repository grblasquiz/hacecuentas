/** Tasa metabólica en reposo (RMR) — Mifflin-St Jeor */
export interface Inputs {
  peso: number;
  altura: number;
  edad: number;
  sexo: string;
}
export interface Outputs {
  rmr: number;
  rmrHora: number;
  tdee_sedentario: number;
  tdee_moderado: number;
  tdee_activo: number;
  mensaje: string;
}

export function tasaMetabolicaReposo(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const altura = Number(i.altura);
  const edad = Number(i.edad);
  const sexo = String(i.sexo || 'm');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!altura || altura <= 0) throw new Error('Ingresá tu altura');
  if (!edad || edad <= 0) throw new Error('Ingresá tu edad');

  // Mifflin-St Jeor (1990) — más precisa que Harris-Benedict
  let rmr: number;
  if (sexo === 'f') {
    rmr = 10 * peso + 6.25 * altura - 5 * edad - 161;
  } else {
    rmr = 10 * peso + 6.25 * altura - 5 * edad + 5;
  }

  return {
    rmr: Math.round(rmr),
    rmrHora: Math.round(rmr / 24),
    tdee_sedentario: Math.round(rmr * 1.2),
    tdee_moderado: Math.round(rmr * 1.55),
    tdee_activo: Math.round(rmr * 1.725),
    mensaje: `Tu RMR es ~${Math.round(rmr)} kcal/día (${Math.round(rmr / 24)} kcal/hora). TDEE sedentario: ${Math.round(rmr * 1.2)}, moderado: ${Math.round(rmr * 1.55)}, activo: ${Math.round(rmr * 1.725)}.`,
  };
}
