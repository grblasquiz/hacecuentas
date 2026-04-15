/** Calorías extra por trimestre de embarazo — Mifflin-St Jeor + ACOG */
export interface Inputs {
  peso: number;
  altura: number;
  edad: number;
  trimestre: string;
  actividad?: string;
}
export interface Outputs {
  caloriasTotal: number;
  caloriasExtra: number;
  detalle: string;
}

export function caloriasEmbarazoTrimestre(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const altura = Number(i.altura);
  const edad = Number(i.edad);
  const trimestre = String(i.trimestre || '2');
  const actividad = String(i.actividad || 'ligero');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso previo al embarazo');
  if (!altura || altura <= 0) throw new Error('Ingresá tu altura en cm');
  if (!edad || edad <= 0) throw new Error('Ingresá tu edad');

  // Mifflin-St Jeor para mujeres
  const bmr = 10 * peso + 6.25 * altura - 5 * edad - 161;

  const factores: Record<string, number> = {
    sedentario: 1.2,
    ligero: 1.375,
    moderado: 1.55,
    activo: 1.725,
  };
  const factor = factores[actividad] || 1.375;
  const tdee = bmr * factor;

  // Calorías extra por trimestre (ACOG)
  const extras: Record<string, number> = {
    '1': 0,
    '2': 340,
    '3': 450,
  };
  const extra = extras[trimestre] || 0;

  const total = Math.round(tdee + extra);
  const triNames: Record<string, string> = {
    '1': 'primer',
    '2': 'segundo',
    '3': 'tercer',
  };

  const detalle =
    `BMR base: ${Math.round(bmr)} kcal | ` +
    `TDEE pre-embarazo: ${Math.round(tdee)} kcal | ` +
    `Extra ${triNames[trimestre] || ''} trimestre: +${extra} kcal | ` +
    `Total recomendado: ${total} kcal/día.`;

  return {
    caloriasTotal: total,
    caloriasExtra: extra,
    detalle,
  };
}
