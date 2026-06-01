/**
 * Atkins por fases.
 */

export interface MacrosAtkinsFasesInputs {
  calorias: number;
  fase: string;
  __lang?: string;
}

export interface MacrosAtkinsFasesOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  carbosGramos: number;
  faseNombre: string;
  resumen: string;
}

export function macrosAtkinsFases(inputs: MacrosAtkinsFasesInputs): MacrosAtkinsFasesOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorCalorias: 'Ingresá calorías válidas',
      nombre1: 'Fase 1 - Inducción',
      nombre2: 'Fase 2 - Pérdida activa',
      nombre3: 'Fase 3 - Pre-mantenimiento',
      nombre4: 'Fase 4 - Mantenimiento',
      fallbackFase: 'Fase 1',
      resumenTpl: (n: string, carbos: number, prot: string, grasa: string) =>
        `Atkins ${n}: ${carbos}g carbos + ${prot}g prot + ${grasa}g grasa.`,
    },
    en: {
      errorCalorias: 'Please enter valid calories',
      nombre1: 'Phase 1 - Induction',
      nombre2: 'Phase 2 - Active weight loss',
      nombre3: 'Phase 3 - Pre-maintenance',
      nombre4: 'Phase 4 - Maintenance',
      fallbackFase: 'Phase 1',
      resumenTpl: (n: string, carbos: number, prot: string, grasa: string) =>
        `Atkins ${n}: ${carbos}g carbs + ${prot}g protein + ${grasa}g fat.`,
    },
  } as const)[__lang];

  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error(T.errorCalorias);
  const fase = inputs.fase || '1';
  const carbosPorFase: Record<string, number> = { '1': 20, '2': 40, '3': 65, '4': 90 };
  const nombre: Record<string, string> = {
    '1': T.nombre1,
    '2': T.nombre2,
    '3': T.nombre3,
    '4': T.nombre4,
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
    faseNombre: nombre[fase] ?? T.fallbackFase,
    resumen: T.resumenTpl(nombre[fase] ?? T.fallbackFase, carbos, prot.toFixed(0), grasa.toFixed(0)),
  };
}
