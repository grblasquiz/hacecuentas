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
  _insight?: any;
  _chart?: any;
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
      insightTitle: 'Tu reparto Atkins',
      insightTpl: (n: string, carbos: number, kcal: number) =>
        `En **${n}** te quedan apenas **${carbos}g de carbos** (${Math.round(carbos * 4)} kcal) sobre ${kcal} kcal: el resto se cubre con proteína y grasa. Subí los carbos sólo al pasar de fase, no antes.`,
      chartProt: 'Proteína',
      chartGrasa: 'Grasa',
      chartCarbos: 'Carbos',
      chartCenter: 'kcal',
      chartAria: (carbos: number, prot: string, grasa: string) =>
        `Reparto de calorías: ${prot}g proteína, ${grasa}g grasa y ${carbos}g carbohidratos`,
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
      insightTitle: 'Your Atkins split',
      insightTpl: (n: string, carbos: number, kcal: number) =>
        `In **${n}** you only get **${carbos}g of carbs** (${Math.round(carbos * 4)} kcal) out of ${kcal} kcal: the rest comes from protein and fat. Raise carbs only when you move up a phase, not before.`,
      chartProt: 'Protein',
      chartGrasa: 'Fat',
      chartCarbos: 'Carbs',
      chartCenter: 'kcal',
      chartAria: (carbos: number, prot: string, grasa: string) =>
        `Calorie split: ${prot}g protein, ${grasa}g fat and ${carbos}g carbohydrates`,
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
  const protG = Number(prot.toFixed(0));
  const grasaG = Number(grasa.toFixed(0));
  const faseTxt = nombre[fase] ?? T.fallbackFase;
  const totalKcal = carbos * 4 + protG * 4 + grasaG * 9;
  const _insight = {
    title: T.insightTitle,
    text: T.insightTpl(faseTxt, carbos, cal),
    tone: 'neutral' as const,
    icon: '🥓',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: T.chartProt, value: protG * 4 },
      { label: T.chartGrasa, value: grasaG * 9 },
      { label: T.chartCarbos, value: carbos * 4 },
    ],
    centerValue: `${totalKcal}`,
    centerLabel: T.chartCenter,
    ariaLabel: T.chartAria(carbos, protG.toFixed(0), grasaG.toFixed(0)),
  };
  return {
    proteinaGramos: protG,
    grasaGramos: grasaG,
    carbosGramos: carbos,
    faseNombre: faseTxt,
    resumen: T.resumenTpl(faseTxt, carbos, prot.toFixed(0), grasa.toFixed(0)),
    _insight,
    _chart,
  };
}
