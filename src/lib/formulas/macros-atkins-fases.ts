/**
 * Atkins por fases.
 */

export interface MacrosAtkinsFasesInputs {
  calorias: number;
  fase: string;
}

export interface MacrosAtkinsFasesOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  carbosGramos: number;
  faseNombre: string;
  resumen: string;
}

export function macrosAtkinsFases(inputs: MacrosAtkinsFasesInputs): MacrosAtkinsFasesOutputs {
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error('Ingresá calorías válidas');
  const fase = inputs.fase || '1';
  const carbosPorFase: Record<string, number> = { '1': 20, '2': 40, '3': 65, '4': 90 };
  const nombre: Record<string, string> = {
    '1': 'Fase 1 - Inducción',
    '2': 'Fase 2 - Pérdida activa',
    '3': 'Fase 3 - Pre-mantenimiento',
    '4': 'Fase 4 - Mantenimiento',
  };
  const carbos = carbosPorFase[fase] ?? 20;
  const kcalCarbos = carbos * 4;
  const prot = (cal * 0.30) / 4;
  const kcalProt = prot * 4;
  const grasa = Math.max(0, (cal - kcalCarbos - kcalProt) / 9);
  return {
    proteinaGramos: Number(prot.toFixed(0)),
    grasaGramos: Number(grasa.toFixed(0)),
    carbosGramos: carbos,
    faseNombre: nombre[fase] ?? 'Fase 1',
    resumen: `Atkins ${nombre[fase]}: ${carbos}g carbos + ${prot.toFixed(0)}g prot + ${grasa.toFixed(0)}g grasa.`,
  };
}
