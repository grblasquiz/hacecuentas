/** Calculadora de déficit calórico semanal */
export interface Inputs {
  peso: number;
  altura: number;
  edad: number;
  sexo: string;
  actividad: string;
  kgPerder: number;
}
export interface Outputs {
  deficitDiario: number;
  caloriasObjetivo: number;
  tdee: number;
  semanasPara5kg: number;
  alerta: string;
}

export function deficitCaloricoSemanal(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const altura = Number(i.altura);
  const edad = Number(i.edad);
  const sexo = String(i.sexo || 'masculino');
  const actividad = String(i.actividad || 'moderado');
  const kgPerder = Number(i.kgPerder) || 0.5;
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!altura || altura <= 0) throw new Error('Ingresá tu altura');

  let bmr: number;
  if (sexo === 'masculino') {
    bmr = 10 * peso + 6.25 * altura - 5 * edad + 5;
  } else {
    bmr = 10 * peso + 6.25 * altura - 5 * edad - 161;
  }

  const factores: Record<string, number> = { sedentario: 1.2, ligero: 1.375, moderado: 1.55, activo: 1.725 };
  const tdee = Math.round(bmr * (factores[actividad] || 1.55));

  // 1 kg grasa = 7700 kcal
  const deficitSemanal = kgPerder * 7700;
  const deficitDiario = Math.round(deficitSemanal / 7);
  const caloriasObjetivo = Math.round(tdee - deficitDiario);
  const semanasPara5kg = Math.round(5 / kgPerder);

  const minCal = sexo === 'masculino' ? 1500 : 1200;
  let alerta: string;
  if (caloriasObjetivo < minCal) {
    alerta = `⚠️ Las ${caloriasObjetivo} kcal están por debajo del mínimo seguro (${minCal} kcal). Reducí el objetivo semanal o aumentá la actividad física.`;
  } else if (deficitDiario > 1000) {
    alerta = '⚠️ Déficit agresivo (>1000 kcal/día). Riesgo de pérdida muscular y fatiga. Considerá un objetivo más moderado.';
  } else if (deficitDiario <= 500) {
    alerta = '✅ Déficit moderado y sostenible. Ideal para preservar masa muscular.';
  } else {
    alerta = '⚠️ Déficit elevado pero aceptable. Asegurate de comer suficiente proteína (2g/kg).';
  }

  return { deficitDiario, caloriasObjetivo, tdee, semanasPara5kg, alerta };
}