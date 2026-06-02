/**
 * CKD: 5 keto + 2 refeed.
 */

export interface MacrosCetogenicaCiclicaInputs {
  calorias: number;
  diaTipo: string;
}

export interface MacrosCetogenicaCiclicaOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  carbosGramos: number;
  tipoDia: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function macrosCetogenicaCiclica(inputs: MacrosCetogenicaCiclicaInputs): MacrosCetogenicaCiclicaOutputs {
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error('Ingresá calorías válidas');
  const tipo = inputs.diaTipo || 'keto';
  let prot: number, grasa: number, carbos: number, nombre: string;
  if (tipo === 'refeed') {
    prot = (cal * 0.25) / 4;
    grasa = (cal * 0.15) / 9;
    carbos = (cal * 0.60) / 4;
    nombre = 'Refeed (fin de semana)';
  } else {
    prot = (cal * 0.25) / 4;
    grasa = (cal * 0.70) / 9;
    carbos = (cal * 0.05) / 4;
    nombre = 'Keto (lunes-viernes)';
  }
  const protG = Number(prot.toFixed(0));
  const grasaG = Number(grasa.toFixed(0));
  const carbosG = Number(carbos.toFixed(0));
  const totalKcal = protG * 4 + grasaG * 9 + carbosG * 4;
  const _insight = {
    title: 'Tu día CKD',
    text: tipo === 'refeed'
      ? `Día de **recarga**: subís a **${carbosG}g de carbos** (${Math.round(carbosG * 4)} kcal) para rellenar glucógeno, con la grasa baja en **${grasaG}g**. Aprovechá los carbos alrededor del entrenamiento del fin de semana.`
      : `Día **keto** (lunes a viernes): apenas **${carbosG}g de carbos** y **${grasaG}g de grasa** como combustible principal. Mantené los carbos al mínimo para no salir de cetosis antes de la recarga.`,
    tone: 'neutral' as const,
    icon: '🔄',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Proteína', value: protG * 4 },
      { label: 'Grasa', value: grasaG * 9 },
      { label: 'Carbos', value: carbosG * 4 },
    ],
    centerValue: `${totalKcal}`,
    centerLabel: 'kcal',
    ariaLabel: `Reparto de calorías del día ${nombre}: ${protG}g proteína, ${grasaG}g grasa y ${carbosG}g carbohidratos`,
  };
  return {
    proteinaGramos: protG,
    grasaGramos: grasaG,
    carbosGramos: carbosG,
    tipoDia: nombre,
    resumen: `CKD ${nombre}: ${protG}g prot + ${grasaG}g grasa + ${carbosG}g carbos.`,
    _insight,
    _chart,
  };
}
