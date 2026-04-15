/** Déficit calórico necesario para perder peso */
export interface Inputs {
  pesoActual: number;
  pesoObjetivo: number;
  semanas: number;
  caloriasDiarias: number;
}
export interface Outputs {
  deficitDiario: number;
  caloriasObjetivo: number;
  kgPorSemana: number;
  viable: string;
  detalle: string;
}

export function deficitCalorico(i: Inputs): Outputs {
  const pesoActual = Number(i.pesoActual);
  const pesoObjetivo = Number(i.pesoObjetivo);
  const semanas = Number(i.semanas);
  const tdee = Number(i.caloriasDiarias);

  if (!pesoActual || pesoActual <= 0) throw new Error('Ingresá tu peso actual');
  if (!pesoObjetivo || pesoObjetivo <= 0) throw new Error('Ingresá tu peso objetivo');
  if (pesoObjetivo >= pesoActual) throw new Error('El peso objetivo debe ser menor al actual');
  if (!semanas || semanas <= 0) throw new Error('Ingresá la cantidad de semanas');
  if (!tdee || tdee <= 0) throw new Error('Ingresá tus calorías diarias (TDEE)');

  const kgPerder = pesoActual - pesoObjetivo;
  // 1 kg de grasa ≈ 7.700 kcal
  const deficitTotal = kgPerder * 7700;
  const dias = semanas * 7;
  const deficitDiario = Math.round(deficitTotal / dias);
  const caloriasObjetivo = Math.round(tdee - deficitDiario);
  const kgPorSemana = Number(((deficitDiario * 7) / 7700).toFixed(2));

  // Evaluar viabilidad
  let viable = '';
  if (caloriasObjetivo < 1200) {
    viable = '⚠️ No recomendado: las calorías objetivo quedan por debajo de 1.200 kcal/día. Extendé el plazo o consultá un profesional.';
  } else if (deficitDiario > 1000) {
    viable = '⚠️ Deficit agresivo (>1.000 kcal/día). Riesgo de pérdida muscular y efecto rebote. Considerá más semanas.';
  } else if (deficitDiario > 750) {
    viable = '⚡ Deficit moderado-alto. Viable con supervisión profesional, entrenamiento de fuerza y proteína alta.';
  } else if (deficitDiario >= 300) {
    viable = '✅ Plan saludable y sostenible. Buen balance entre velocidad y adherencia.';
  } else {
    viable = '✅ Deficit conservador. Muy sostenible, ideal si no tenés apuro.';
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    deficitDiario,
    caloriasObjetivo,
    kgPorSemana,
    viable,
    detalle: `Para perder ${fmt.format(kgPerder)} kg en ${semanas} semanas necesitás un déficit de ${fmt.format(deficitDiario)} kcal/día. Comé ${fmt.format(caloriasObjetivo)} kcal/día (TDEE ${fmt.format(tdee)} - ${fmt.format(deficitDiario)}). Pérdida estimada: ${kgPorSemana} kg/semana.`,
  };
}
