/**
 * Macros Paleo 30/40/30.
 */

export interface MacrosPaleoDietaInputs {
  calorias: number;
}

export interface MacrosPaleoDietaOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  carbosGramos: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function macrosPaleoDieta(inputs: MacrosPaleoDietaInputs): MacrosPaleoDietaOutputs {
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error('Ingresá calorías válidas');
  const prot = (cal * 0.30) / 4;
  const grasa = (cal * 0.40) / 9;
  const carbos = (cal * 0.30) / 4;
  const kcalProt = Math.round(cal * 0.30);
  const kcalGrasa = Math.round(cal * 0.40);
  const kcalCarbos = cal - kcalProt - kcalGrasa;
  const calFmt = cal.toLocaleString('es-AR');
  return {
    proteinaGramos: Number(prot.toFixed(0)),
    grasaGramos: Number(grasa.toFixed(0)),
    carbosGramos: Number(carbos.toFixed(0)),
    resumen: `Paleo ${cal} kcal: ${prot.toFixed(0)}g proteína + ${grasa.toFixed(0)}g grasa + ${carbos.toFixed(0)}g carbos.`,
    _insight: {
      title: 'Carbos bajos, proteína y grasa altas',
      text: `El esquema paleo limita los carbos a **${carbos.toFixed(0)}g (30%)** —de frutas y verduras, sin cereales ni legumbres— y sube proteína a **${prot.toFixed(0)}g** y grasa a **${grasa.toFixed(0)}g** sobre tus ${calFmt} kcal.`,
      tone: 'neutral',
      icon: '🍖',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Proteína', value: kcalProt },
        { label: 'Grasa', value: kcalGrasa },
        { label: 'Carbos', value: kcalCarbos },
      ],
      centerValue: `${calFmt} kcal`,
      centerLabel: 'Total diario',
      ariaLabel: `Reparto de calorías paleo: ${kcalProt} kcal proteína, ${kcalGrasa} kcal grasa, ${kcalCarbos} kcal carbos`,
    },
  };
}
